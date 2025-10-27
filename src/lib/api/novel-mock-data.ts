/**
 * 精彩小说内容 Mock 数据
 * 用于Quest挑战系统
 */

export interface NovelContent {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  coverImage?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  language: string;
  estimatedTime: string;
  
  // 完整内容
  chapters: NovelChapter[];
  
  // 学习相关
  vocabulary?: VocabularyItem[];
  grammarPoints?: string[];
}

export interface NovelChapter {
  id: string;
  number: number;
  title: string;
  content: string; // 章节正文，使用段落分隔
  wordCount: number;
  estimatedReadTime: number; // 分钟
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
  audioUrl?: string;
}

// Mock小说内容 - 精彩科幻短篇
export const MOCK_NOVEL: NovelContent = {
  id: 'novel-001',
  title: 'The Visitors\' Zoo',
  author: 'Unknown',
  excerpt: 'Emma and I were on our honeymoon in space. We visited the Moon and flew far away from Earth. But what we discovered would change everything...',
  coverImage: 'https://picsum.photos/seed/novel-zoo-dinosaur/600/900',
  difficulty: 3,
  tags: ['Science Fiction', 'Time Travel', 'Adventure'],
  language: 'English',
  estimatedTime: '8 min',
  
  chapters: [
    {
      id: 'ch-001',
      number: 1,
      title: 'The Visitors\' Zoo',
      content: `Emma and I were on our honeymoon in space. We rented a small old spaceship. It was slow but very romantic. We visited the Moon and flew far away from Earth.

One day, we saw a big rock in space. It was about ten kilometers wide and moving toward Earth. Our computer said, "It will hit Earth in 18 days!"

We tried to call Earth, but no one answered. Ten minutes ago, everything was fine. Now the world was silent. Something was wrong.

When we looked at Earth through the screen, we were shocked. The continents looked different. The computer said, "This is Earth sixty-five million years ago." We had gone back in time!

We understood now — there were no people on Earth yet. We had fallen into a time hole.

Emma looked at the asteroid and said, "Is it the one that killed the dinosaurs?" I nodded slowly. "Yes. We must go back."

We went through the time hole again. This time, we heard strange sounds from Earth, not human voices. When we landed on the sea, a big old ship came to us. The sailors spoke a strange language, but my computer translated it. The captain asked, "Aren't you afraid of being eaten?"

"Eaten? By what?" I asked.

He pointed to the sea. Huge animals came out of the water — dinosaurs! They were alive! Emma held my arm and whispered, "Oh my God, what have we done?"

The captain said, "Don't be afraid. This is a zoo."

We looked around. Far away, we saw very tall buildings — higher than mountains. "Those are the visitors' homes," the captain said. "The visitors?" I asked.

"Yes," he said quietly. "The dinosaurs."

We were speechless. Humans were gone. Dinosaurs had become the masters of Earth. They kept humans as animals in a zoo.

At that moment, Emma pointed to the sky. A bright star was moving fast. The captain said, "That is the Magic Star. Long ago, it almost hit the Earth. But the Savior pushed it away and saved our ancestors."

Emma looked at me. I understood. The "Magic Star" was the asteroid we moved away long ago. Now the dinosaurs worshiped it as a holy star.

We were no longer the rulers of Earth. We were just animals in the dinosaurs' zoo.`,
      wordCount: 385,
      estimatedReadTime: 5,
    },
  ],
  
  vocabulary: [
    {
      word: 'honeymoon',
      definition: 'A vacation spent together by a newly married couple',
      example: 'Emma and I were on our honeymoon in space.',
    },
    {
      word: 'asteroid',
      definition: 'A small rocky body orbiting the sun',
      example: 'We saw a big asteroid moving toward Earth.',
    },
    {
      word: 'shocked',
      definition: 'Surprised and upset by something unexpected',
      example: 'We were shocked when we saw the continents looked different.',
    },
    {
      word: 'ancestors',
      definition: 'People from whom one is descended, especially those more remote than grandparents',
      example: 'The Savior saved our ancestors from extinction.',
    },
    {
      word: 'worshiped',
      definition: 'Showed reverence and adoration for (a deity or sacred object)',
      example: 'The dinosaurs worshiped the asteroid as a holy star.',
    },
    {
      word: 'speechless',
      definition: 'Unable to speak, especially as the result of shock or strong emotion',
      example: 'We were speechless when we learned the truth.',
    },
  ],
  
  grammarPoints: [
    'Past Simple Tense: "were", "visited", "saw", "said"',
    'Past Continuous: "were moving", "was moving"',
    'Past Perfect: "had gone", "had become", "had fallen"',
    'Modal Verbs: "must go back", "would change"',
    'Direct Speech: Using quotation marks for dialogue',
  ],
};

// 多个小说选项，用于未来扩展
export const NOVEL_LIBRARY: NovelContent[] = [
  MOCK_NOVEL,
  // 可以添加更多小说...
];

// 根据ID获取小说
export function getNovelById(id: string): NovelContent | undefined {
  return NOVEL_LIBRARY.find(novel => novel.id === id);
}

// 获取章节
export function getChapterByNumber(novelId: string, chapterNumber: number): NovelChapter | undefined {
  const novel = getNovelById(novelId);
  return novel?.chapters.find(ch => ch.number === chapterNumber);
}

