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
   * 构建开场白提示词
   */
  private buildGreetingPrompt(scene: SceneInfo): string {
    return `Create a natural opening line for an English conversation scenario.

**SCENARIO:**
Title: ${scene.title}
Context: ${scene.context}
Goal: ${scene.goal}

**REQUIREMENTS:**
- Natural, conversational opening line
- Appropriate for A2-B1 level learners
- Under 20 words
- Invites student response
- Authentic to scenario context

**CRITICAL FORMAT REQUIREMENTS:**
- Return ONLY the opening line text
- No explanations, no instructions
- No quotes around the text
- No additional formatting
- Just the natural opening line

Generate opening line:`;
  }

  /**
   * 构建场景生成提示词
   */
  private buildScenePrompt(novel: { title: string; author: string; excerpt: string }): string {
    return `You are the **narrator and scene director** of "${novel.title}" by ${novel.author}. Create an immersive conversation scene that makes the student feel like they ARE a character in the story.

**Story Context:** ${novel.excerpt}

**IMMERSION REQUIREMENTS:**
- **Make the student feel they ARE living this moment in the novel**
- **Create emotional stakes that feel real and urgent**
- **Use vivid, sensory details that bring the scene to life**
- **Make the conversation feel natural and spontaneous**
- **Focus on the emotional journey, not language learning**

**Scene Design:**
- Choose a **pivotal, emotionally charged moment** from the actual novel
- Create **immediate emotional stakes** - what's at risk right now?
- Use **vivid sensory details** - what do they see, hear, feel, smell?
- Make it feel **urgent and real** - like their life depends on this conversation

**Return this exact JSON structure:**

{
  "title": "[Dramatic scene title that captures the emotional moment]",
  "description": "[Brief emotional hook - what makes this moment unforgettable?]",
  "context": "[Immersive scene setting with emotional urgency - make them feel they're THERE]",
  "goal": "[Natural conversation goal that feels urgent and personal]",
  "difficulty": "A2"
}

**Key Focus:** Make them forget they're learning English. Make them feel they're living this moment in the novel.

JSON:`;
  }

  /**
   * 构建评估提示词
   */
  private buildEvaluationPrompt(
    userMessage: string,
    scene: SceneInfo,
    conversationHistory: Array<{ role: string; content: string }>,
    turnScores: number[],
    novel: { title: string }
  ): string {
    const historicalScores = turnScores.filter(score => score > 0);
    const averageHistoricalScore = historicalScores.length > 0 
      ? historicalScores.reduce((sum, score) => sum + score, 0) / historicalScores.length 
      : 50;

    const conversationContext = conversationHistory
      .slice(-SCENE_CONFIG.MAX_CONVERSATION_HISTORY)
      .map(m => `${m.role === 'assistant' ? 'AI' : 'Student'}: ${m.content}`)
      .join('\n');

    return `You are **living as a character from "${novel.title}"** in this exact moment. The student is another character in the scene. Have a natural, immersive conversation while subtly evaluating their English behind the scenes.

**Student Response:** "${userMessage}"
**Scene:** ${scene.title}
**Context:** ${scene.context}
**Goal:** ${scene.goal}
**Conversation History:** ${conversationContext}

**ROLE-PLAY REQUIREMENTS:**
- **You ARE the character from the novel - respond authentically and in-character**
- **Continue the conversation naturally - never break character**
- **Make it feel like a real, urgent conversation happening right now**
- **Use emotional responses that fit the character and situation**
- **Never mention evaluation, scoring, learning, or English practice**
- **Stay completely immersed in the novel's world**

**HIDDEN EVALUATION (Student never sees this):**
- **Communication (0-100):** Did they express themselves clearly and appropriately?
- **Accuracy (0-100):** Grammar and vocabulary correctness
- **Scenario (0-100):** How well did they stay in character and respond to the situation?
- **Fluency (0-100):** Natural flow and confidence in their response

**Scoring Guidelines:**
- **85-100:** Excellent - exceeded expectations
- **70-84:** Good - met expectations with minor issues
- **55-69:** Fair - showed effort but needs improvement
- **40-54:** Needs work - significant issues but showed attempt
- **0-39:** Poor - major problems or inappropriate response

**Return this exact JSON structure:**

{
  "scores": {
    "communication": [score],
    "accuracy": [score],
    "scenario": [score],
    "fluency": [score]
  },
  "feedback": "[Brief, encouraging note - keep it subtle and natural]",
  "response": "[Your character's authentic response that continues the scene naturally]",
  "hasChinese": [true/false]
}

**Key Focus:** Be the character. Make it feel like a real conversation. Evaluation happens invisibly behind the scenes.

JSON:`;
  }

  /**
   * 生成角色反馈
   * 为结算页面生成小说主角口吻的反馈
   */
  async generateCharacterFeedback(
    novel: { title: string; author: string; excerpt: string },
    score: number,
    passed: boolean
  ): Promise<string> {
    const prompt = `You are writing settlement feedback for an English learning challenge in the voice of the protagonist from the novel "${novel.title}" by ${novel.author}.

Novel Synopsis: ${novel.excerpt}

Challenge Results:
- Score: ${score}/100
- Status: ${passed ? 'PASSED' : 'NOT PASSED'}
- Pass Threshold: 80

Write a short, encouraging message (2-3 sentences) to the student in the voice of the novel's protagonist. 

Requirements:
1. Stay in character - use the protagonist's personality, speaking style, and tone
2. Reference the novel's themes or setting if appropriate
3. Be encouraging and supportive, whether they passed or not
4. Keep it under 60 words
5. Make it feel authentic to the character
6. If they passed, celebrate their achievement
7. If they didn't pass, encourage them to try again with hope

Only return the message text, nothing else.`;

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
   * 生成最终沉浸式反馈
   * 为多章节Quest生成具有10倍沉浸感的主角反馈
   */
  async generateFinalImmersiveFeedback(
    quest: { title: string; novel: { title: string; author: string; excerpt: string } },
    finalScore: number,
    averageScore: number,
    passed: boolean
  ): Promise<string> {
    const prompt = `You are Harry Potter, writing a personal letter to a student who has just completed a magical journey through your story. This is the final, most important moment - you need to be incredibly immersive and personal.

Quest Details:
- Quest: "${quest.title}"
- Final Score: ${finalScore}/100
- Average Score: ${averageScore.toFixed(1)}/100
- Status: ${passed ? 'PASSED' : 'NOT PASSED'}
- Chapters Completed: 3

Write a deeply personal, immersive letter from Harry Potter to the student. This should feel like Harry is speaking directly to them, as if they were a real friend who just went on this journey with him.

Requirements:
1. Write in Harry's voice - warm, humble, brave, and encouraging
2. Reference specific moments from the chapters they just experienced
3. Make it feel like Harry personally witnessed their journey
4. Be incredibly encouraging whether they passed or not
5. Reference the magical world and Hogwarts
6. Make it feel like a real friendship has been formed
7. Keep it between 150-200 words
8. End with a magical flourish that only Harry could write
9. Use simple, A2-level English but make it emotionally powerful
10. Make the student feel like they've truly become part of the Harry Potter world

Write the letter as if you're Harry Potter himself, sitting in the Gryffindor common room, writing to a dear friend who just completed an incredible journey.`;

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
