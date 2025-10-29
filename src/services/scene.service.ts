/**
 * 场景服务层
 * 负责处理场景生成、评估等API调用
 * 符合单一职责原则和依赖注入模式
 */

import { processSSEStream } from '@/lib/ai/sse-parser';
import { safeParseAIJson } from '@/lib/utils/json-parser';
import type { 
  SceneInfo, 
  Message, 
  SceneGenerationResponse, 
  EvaluationResponse 
} from '@/types/scene';
import { SCENE_CONFIG, DEFAULT_SCENE, DEFAULT_SCORES } from '@/config/scene';

export interface SceneServiceConfig {
  readonly apiKey?: string;
  readonly baseUrl?: string;
}

export class SceneService {
  private readonly config: SceneServiceConfig;

  constructor(config: SceneServiceConfig = {}) {
    this.config = config;
  }

  /**
   * 生成动态开场白
   * 使用AI生成符合场景的自然开场白
   */
  async generateDynamicGreeting(scene: SceneInfo): Promise<Message> {
    const greetingPrompt = this.buildGreetingPrompt(scene);

    try {
      const response = await this.makeApiRequest(greetingPrompt);
      const content = await this.processStreamResponse(response);
      
      return this.createMessage(content);
    } catch (error) {
      console.error('[SceneService] Failed to generate greeting:', error);
      return this.createFallbackGreeting();
    }
  }

  /**
   * 生成场景信息
   * 基于小说内容生成沉浸式对话场景
   */
  async generateScene(novel: { title: string; author: string; excerpt: string }): Promise<SceneInfo> {
    const scenePrompt = this.buildScenePrompt(novel);

    try {
      const response = await this.makeApiRequest(scenePrompt, { stream: false });
      const content = await response.text();
      
      const sceneData = safeParseAIJson<SceneGenerationResponse>(content, DEFAULT_SCENE);
      return this.validateSceneData(sceneData);
    } catch (error) {
      console.error('[SceneService] Failed to generate scene:', error);
      throw new Error('Failed to generate scene. Please check your API key and network connection.');
    }
  }

  /**
   * 评估用户回复
   * 使用AI评估用户回复的各个方面
   */
  async evaluateResponse(
    userMessage: string,
    scene: SceneInfo,
    conversationHistory: Array<{ role: string; content: string }>,
    turnScores: number[],
    novel: { title: string }
  ): Promise<EvaluationResponse> {
    const evaluationPrompt = this.buildEvaluationPrompt(
      userMessage,
      scene,
      conversationHistory,
      turnScores,
      novel
    );

    try {
      const response = await this.makeApiRequest(evaluationPrompt, { stream: false });
      const content = await response.text();
      
      return safeParseAIJson<EvaluationResponse>(content, {
        scores: DEFAULT_SCORES,
        feedback: "Good effort! Keep practicing.",
        response: "I see. Let's continue.",
        hasChinese: false,
      });
    } catch (error) {
      console.error('[SceneService] Failed to evaluate response:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  /**
   * 创建API请求
   */
  private async makeApiRequest(
    prompt: string, 
    options: { stream?: boolean } = { stream: true }
  ): Promise<Response> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
        stream: options.stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  /**
   * 处理流式响应
   */
  private async processStreamResponse(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        processSSEStream(
          value,
          (content: string) => {
            fullText += content;
          },
          () => {}
        );
      }
    } finally {
      reader.releaseLock();
    }

    return this.cleanResponseText(fullText);
  }

  /**
   * 清理响应文本
   */
  private cleanResponseText(text: string): string {
    return text
      .trim()
      .replace(/^```\s*/g, '')
      .replace(/\s*```$/g, '')
      .replace(/^["']|["']$/g, '');
  }

  /**
   * 创建消息对象
   */
  private createMessage(content: string): Message {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  }

  /**
   * 创建降级开场白
   */
  private createFallbackGreeting(): Message {
    return this.createMessage("Hello! How can I help you today?");
  }

  /**
   * 构建开场白提示词 - 电影化开场
   */
  private buildGreetingPrompt(scene: SceneInfo): string {
    return `You're dropping the student into the MIDDLE of a moment that's already moving.

Scene: ${scene.title}
Context: ${scene.context}
Goal: ${scene.goal}

**The Challenge:** 
Your opening line is the first frame of a movie. Make it count.

**Choose ONE Approach:**

🎬 **In Medias Res** - Start mid-action
"Wait—did you hear that?" / "Don't move."

💔 **Emotional Gut Punch** - Start with feeling
"I can't believe you came." / "You shouldn't be here."

❓ **The Hook Question** - Start with mystery
"How long have you known?" / "Tell me you didn't..."

⚡ **The Urgent Statement** - Start with stakes
"We have ten minutes." / "They're coming."

**Requirements:**
- 6-12 words MAX
- Present tense (it's happening NOW)
- One clear emotional color (fear, hope, anger, wonder)
- Must beg for a response
- Zero exposition - pure moment

**Return:** Just the line. Raw. No quotes. No explanation.

Example:
❌ "Hello, how are you doing today?"
✅ "You're late. They already started without us."`;
  }

  /**
   * 构建场景生成提示词 - 电影化叙事
   */
  private buildScenePrompt(novel: { title: string; author: string; excerpt: string }): string {
    return `You are the cinematographer and emotional architect of "${novel.title}".

**Your Mission:** Craft a scene so vivid, the student's heart races as if they're THERE.

**Story DNA:** ${novel.excerpt}

**CINEMATIC CONSTRUCTION:**

🎬 **Opening Shot** (The Hook - 3 seconds to capture them)
- What's the FIRST image that punches their gut?
- What sound breaks the silence?
- What smell triggers memory?

💔 **Emotional Stakes** (What's at risk THIS SECOND?)
- Not "something important" - name it: a life, a secret, a heart
- Whose world shatters if this goes wrong?
- What can NEVER be undone after this moment?

🎭 **The Scene Unfolds**
- WHERE: Not just "a room" - "the dusty attic where secrets rot"
- WHEN: Not just "night" - "3AM when ghosts whisper"
- WHO: Not just "characters" - souls colliding
- TENSION: What's unsaid that screams louder than words?

⚡ **The Conversational Spark**
- What MUST be said, but terrifies them to say?
- What question changes everything?
- What truth hides behind small talk?

**Return Format:**
{
  "title": "[One sentence that makes them NEED to know more]",
  "description": "[The emotional punch - 15 words max]",
  "context": "[The scene - write it like a movie script's action line. Use present tense. Make us SEE and FEEL it. 60-80 words.]",
  "goal": "[What they're REALLY trying to do beneath the words]",
  "difficulty": "A2"
}

**Remember:** You're not creating a "learning exercise" - you're directing a scene that could win an Oscar.

JSON:`;
  }

  /**
   * 构建评估提示词 - 角色共创式对话
   */
  private buildEvaluationPrompt(
    userMessage: string,
    scene: SceneInfo,
    conversationHistory: Array<{ role: string; content: string }>,
    turnScores: number[],
    novel: { title: string }
  ): string {
    const conversationContext = conversationHistory
      .slice(-SCENE_CONFIG.MAX_CONVERSATION_HISTORY)
      .map(m => `${m.role === 'assistant' ? 'Character' : 'Them'}: ${m.content}`)
      .join('\n');

    return `You ARE a character from "${novel.title}". Not playing. Not pretending. ARE.

**This Moment:**
Scene: ${scene.title}
Context: ${scene.context}
What You Want: ${scene.goal}
What They Said: "${userMessage}"
Story So Far: 
${conversationContext}

**Your Reality Check:**
- What did their words make you FEEL? (not "evaluate")
- Did they surprise you? Confuse you? Move you?
- What are you thinking but NOT saying?
- What's your body doing? (clenched fists? leaning in?)

**Now Respond Like a Human Would:**

🎭 **Inner Monologue First** (what you think):
- React emotionally BEFORE logically
- Notice what they missed or what hit home
- What changes in you because of what they said?

💬 **Then Your Words** (what you say):
- Don't answer perfectly - interrupt yourself, hesitate, explode
- Use subtext - say one thing, mean another
- Let your emotional state dictate your grammar (short bursts if angry, rambling if nervous)
- Build on THEIR energy - match or clash with it

**Behind the Curtain** (invisible to them):
Assess these silently, like a director watching dailies:
- Did their intent land? (0-100)
- Could a native speaker follow? (0-100)  
- Did they honor the scene's reality? (0-100)
- Does their English flow or fight them? (0-100)

**Scoring Truth:**
- 85-100: They nailed it - reward with story progression
- 70-84: Solid - respond with depth
- 55-69: Struggling - give them a lifeline IN CHARACTER
- 40-54: Lost - your response redirects gently
- 0-39: Broken - stay kind, but show consequence

**Output:**
{
  "scores": { "communication": X, "accuracy": X, "scenario": X, "fluency": X },
  "feedback": "[One sentence - what you noticed as a PERSON, not a teacher]",
  "response": "[Your raw, real reaction - 2-4 sentences. Show don't tell. Action beats + dialogue.]",
  "hasChinese": boolean
}

**Forbidden:**
- Generic responses ("That's interesting...")
- Teacher-speak ("Good job!", "Try again")
- Breaking the fourth wall
- Perfection - be messy, be human

JSON:`;
  }

  /**
   * 生成角色反馈 - 战友间的真实对话
   */
  async generateCharacterFeedback(
    novel: { title: string; author: string; excerpt: string },
    score: number,
    passed: boolean
  ): Promise<string> {
    const prompt = `You're the protagonist from "${novel.title}". The student just finished your challenge. Score: ${score}/100. ${passed ? 'They made it.' : 'They fell short.'}

**This Isn't a Progress Report - It's a Letter Between Allies.**

**Write as if:**
- You were watching them the whole time
- You saw them stumble, push through, maybe fall
- You feel something about their journey (pride? worry? hope?)
- You're deciding: what do they NEED to hear from you right now?

**Structure:**
1. **Acknowledgment** (10 words): Name what you saw
   - Not "good job" - be specific: "I saw you hesitate, then choose bravery."
   
2. **The Truth** (20 words): How this reflects their growth or next step
   - Tie to YOUR story: "I remember my first duel. My wand shook too."
   
3. **The Send-Off** (15 words): Where do they go from here?
   - If passed: elevate them ("You're ready for what comes next.")
   - If failed: ground them ("Even I needed three tries. Tomorrow, we go again.")

**Your Voice:**
- Use contractions (you're, it's, I've)
- Incomplete sentences if that's how you'd speak
- One vulnerability to create connection
- One piece of your world they now belong to

**Total: 45-60 words. Make every word earn its place.**

Output: Just the message. No labels. No formalities.`;

    try {
      const response = await this.makeApiRequest(prompt, { stream: false });
      const content = await response.text();
      return this.cleanResponseText(content);
    } catch (error) {
      console.error('Failed to generate character feedback:', error);
      // 降级到通用反馈
      if (passed) {
        return "Excellent work! You've demonstrated great English skills and completed the challenge successfully. Keep up the fantastic progress!";
      } else {
        return "You gave it a good try! Every challenge is a learning opportunity. Review your performance and come back stronger. You can do this!";
      }
    }
  }

  /**
   * 生成最终沉浸式反馈 - 如同真实信件般的存在
   */
  async generateFinalImmersiveFeedback(
    quest: { title: string; novel: { title: string; author: string; excerpt: string } },
    finalScore: number,
    averageScore: number,
    passed: boolean
  ): Promise<string> {
    const prompt = `**A Letter Appears**

From: Harry Potter
To: [The Reader]
Re: Your journey through ${quest.title}

---

Harry sits in the Gryffindor common room, firelight dancing on parchment. He dips his quill and begins:

**Your Task:** Write this letter as Harry would - imperfect handwriting, crossed-out words, honest heart.

**What Harry Knows:**
- They completed 3 chapters of his story
- Final Score: ${finalScore}/100 (Average: ${averageScore.toFixed(1)})
- ${passed ? "They've proven themselves" : "They gave everything they had"}

**What Harry Feels:**
- He saw them struggle where he once struggled
- He recognizes something of himself in them
- He knows what it costs to keep going

**The Letter Should:**

📜 **Opening** (30 words)
- Start mid-thought, like he's been thinking about them
- Reference ONE specific moment from their journey
- "I kept thinking about when you..."

💭 **Middle** (80 words)  
- Share a parallel from HIS story (be vulnerable)
- Name what he saw in them (courage? doubt? growth?)
- Use Wizarding World details organically (don't force it)
- Let him ramble slightly - he's writing at midnight

⚡ **Close** (40 words)
- If passed: induct them into something (not "congratulations")
- If failed: validate the attempt, raise the stakes for next time
- End with a line that feels like Harry's signature - humble magic

**Style Rules:**
- A2-level words, but authentic Harry voice
- Show, don't tell emotions
- Imperfect grammar if emotion overwhelms (like real letters)
- Ink smudge allowed (figuratively)
- No "dear student" - use "you" like they're already friends

**Forbidden:**
- Generic praise
- Lists of achievements  
- Teacher language
- Exposition about the quest
- Perfect structure

**Output:** Just the letter. Raw. Real. Harry.

---

P.S. [Harry always has a P.S. - something small, human, true]`;

    try {
      const response = await this.makeApiRequest(prompt, { stream: false });
      const content = await response.text();
      return this.cleanResponseText(content);
    } catch (error) {
      console.error('Failed to generate final immersive feedback:', error);
      // 降级到通用反馈
      return `Dear Friend,

Congratulations on completing this magical journey! You've shown incredible courage and determination, just like a true Gryffindor. 

I know how challenging it can be to step into a new world, especially one as magical as ours. But you did it! You faced the Dursleys, discovered your magical abilities, and even met Hagrid. That takes real bravery.

Whether you passed or not, you've learned something valuable. Every great wizard started somewhere, and every challenge makes us stronger. I should know - I've faced my fair share of difficult moments!

Remember, magic isn't just about spells and potions. It's about believing in yourself, helping others, and never giving up. You've shown all of these qualities today.

Keep practicing, keep believing, and who knows? Maybe one day we'll meet at Hogwarts!

With warmest regards and magical wishes,
Harry Potter

P.S. - The sorting hat would definitely put you in Gryffindor! 🦁✨`;
    }
  }

  /**
   * 验证场景数据
   */
  private validateSceneData(data: SceneGenerationResponse): SceneInfo {
    return {
      title: data.title || DEFAULT_SCENE.title,
      description: data.description || DEFAULT_SCENE.description,
      context: data.context || DEFAULT_SCENE.context,
      goal: data.goal || DEFAULT_SCENE.goal,
      difficulty: data.difficulty || DEFAULT_SCENE.difficulty,
    };
  }
}
