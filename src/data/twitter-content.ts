/**
 * Twitter类型内容数据
 * 用于丰富Feed展示
 */

import type { FeedCard } from '@/types/feed';

export const TWITTER_CONTENT: FeedCard[] = [
  // 1. 学习心得分享
  {
    id: 'twitter-001',
    type: 'text',
    author: {
      id: 'user-001',
      handle: 'englishlearner2024',
      displayName: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      verified: false,
    },
    content: 'Just finished reading "The Wandering Earth" in English! 🌍✨ The story about pushing Earth out of the solar system was mind-blowing. My vocabulary improved so much reading sci-fi! #EnglishLearning #ScienceFiction',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    stats: { replies: 23, reposts: 45, likes: 156, bookmarks: 34, views: 1200 },
    viewer: { liked: true, reposted: false, bookmarked: false },
  },

  // 2. 语法技巧分享
  {
    id: 'twitter-002',
    type: 'text',
    author: {
      id: 'user-002',
      handle: 'grammarguru',
      displayName: 'Professor Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professor',
      verified: true,
      badges: ['verified', 'organization'],
    },
    content: '💡 Grammar Tip: Use "used to" for past habits that no longer exist. "I used to play piano" (but I don\'t anymore). Use "would" for repeated past actions. "I would practice every day" (repeated action). #GrammarTips #EnglishLearning',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    stats: { replies: 67, reposts: 123, likes: 456, bookmarks: 89, views: 2100 },
    viewer: { liked: false, reposted: true, bookmarked: true },
  },

  // 3. 文化差异讨论
  {
    id: 'twitter-003',
    type: 'text',
    author: {
      id: 'user-003',
      handle: 'culturalbridge',
      displayName: 'Maria Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      verified: false,
    },
    content: '🤔 Cultural moment: In English, we say "break a leg" for good luck, but in my language we say "may you have good fortune." Learning English isn\'t just about grammar - it\'s about understanding different ways of thinking! #CulturalExchange #LanguageLearning',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    stats: { replies: 34, reposts: 78, likes: 234, bookmarks: 45, views: 1800 },
    viewer: { liked: false, reposted: false, bookmarked: false },
  },

  // 4. 学习进度分享
  {
    id: 'twitter-004',
    type: 'text',
    author: {
      id: 'user-004',
      handle: 'progressjourney',
      displayName: 'Alex Kim',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      verified: false,
    },
    content: '📈 6 months of English learning update: Started with basic greetings, now I can read sci-fi novels! The key was finding content I actually enjoy. Currently reading Liu Cixin\'s "The Three-Body Problem" - it\'s challenging but amazing! #Progress #EnglishJourney',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    stats: { replies: 89, reposts: 156, likes: 567, bookmarks: 123, views: 3200 },
    viewer: { liked: true, reposted: true, bookmarked: false },
  },

  // 5. 发音练习
  {
    id: 'twitter-005',
    type: 'text',
    author: {
      id: 'user-005',
      handle: 'pronunciationcoach',
      displayName: 'Emma Thompson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      verified: true,
      badges: ['verified'],
    },
    content: '🗣️ Pronunciation Challenge: Try saying "thoroughly" 5 times fast! The "th" sound is tricky for many learners. Practice: "I thoroughly thought through the thought." Tongue between teeth, not behind! #Pronunciation #EnglishTips',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    stats: { replies: 45, reposts: 89, likes: 234, bookmarks: 67, views: 1500 },
    viewer: { liked: false, reposted: false, bookmarked: true },
  },

  // 6. 学习资源推荐
  {
    id: 'twitter-006',
    type: 'text',
    author: {
      id: 'user-006',
      handle: 'resourcelibrarian',
      displayName: 'David Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      verified: false,
    },
    content: '📚 Resource recommendation: If you love sci-fi and want to improve English, try Liu Cixin\'s short stories! They\'re perfect for intermediate learners - complex ideas but clear language. Start with "The Village Teacher" - it\'s touching and educational! #BookRecommendation #SciFi',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    stats: { replies: 56, reposts: 134, likes: 345, bookmarks: 78, views: 2400 },
    viewer: { liked: true, reposted: false, bookmarked: true },
  },

  // 7. 学习困难求助
  {
    id: 'twitter-007',
    type: 'text',
    author: {
      id: 'user-007',
      handle: 'confusedlearner',
      displayName: 'Yuki Tanaka',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuki',
      verified: false,
    },
    content: '❓ Help! I\'m reading "Ball Lightning" and I don\'t understand this sentence: "The phenomenon defied conventional physics." What does "defied" mean? And why is it "conventional physics" not "normal physics"? #EnglishHelp #Vocabulary',
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    stats: { replies: 78, reposts: 23, likes: 123, bookmarks: 12, views: 900 },
    viewer: { liked: false, reposted: false, bookmarked: false },
  },

  // 8. 学习成就庆祝
  {
    id: 'twitter-008',
    type: 'text',
    author: {
      id: 'user-008',
      handle: 'achievementunlocked',
      displayName: 'Carlos Mendez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      verified: false,
    },
    content: '🎉 ACHIEVEMENT UNLOCKED: Just finished my first English novel! "The Wandering Earth" by Liu Cixin. 2,500 years of journey through space, and I understood every word! Well, almost every word 😅 #Milestone #EnglishLearning #SciFi',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    stats: { replies: 123, reposts: 234, likes: 678, bookmarks: 156, views: 4200 },
    viewer: { liked: true, reposted: true, bookmarked: true },
  },

  // 9. 学习方法分享
  {
    id: 'twitter-009',
    type: 'text',
    author: {
      id: 'user-009',
      handle: 'methodmaster',
      displayName: 'Dr. Lisa Wang',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      verified: true,
      badges: ['verified', 'organization'],
    },
    content: '🧠 Learning Method: The "Context Clue" technique! When you see an unknown word, don\'t immediately look it up. Read the whole sentence, then the paragraph. Often, the context gives you the meaning! This builds reading confidence. #LearningMethods #ReadingSkills',
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    stats: { replies: 45, reposts: 89, likes: 234, bookmarks: 67, views: 1800 },
    viewer: { liked: false, reposted: false, bookmarked: true },
  },

  // 10. 学习社区互动
  {
    id: 'twitter-010',
    type: 'text',
    author: {
      id: 'user-010',
      handle: 'communitybuilder',
      displayName: 'Ahmed Hassan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed',
      verified: false,
    },
    content: '🤝 Calling all English learners! Let\'s start a book club! We\'ll read one Liu Cixin story per month and discuss it in English. First book: "The Three-Body Problem" - who\'s in? We can learn together and make new friends! #BookClub #Community #EnglishLearning',
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    stats: { replies: 156, reposts: 234, likes: 456, bookmarks: 89, views: 3500 },
    viewer: { liked: true, reposted: true, bookmarked: false },
  }
  ,
  // 11. 词汇秒记法
  {
    id: 'twitter-011',
    type: 'text',
    author: {
      id: 'user-011',
      handle: 'vocabhacker',
      displayName: 'Nina Lee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
      verified: false,
    },
    content: '🧩 Vocab hack: Learn “entropy” with images and stories. I link it to melting ice cream—always getting messier unless you act. Now "entropy" sticks! #Vocabulary #MemoryTips',
    createdAt: new Date(Date.now() - 1000 * 60 * 520).toISOString(),
    stats: { replies: 41, reposts: 66, likes: 201, bookmarks: 57, views: 1700 },
    viewer: { liked: false, reposted: false, bookmarked: true },
  },
  // 12. 听力练习分享
  {
    id: 'twitter-012',
    type: 'text',
    author: {
      id: 'user-012',
      handle: 'listeningdaily',
      displayName: 'Omar Farouk',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=omar',
      verified: false,
    },
    content: '👂 Daily listening: 10 minutes of sci-fi audiobook before sleep. I repeat one sentence aloud—pronunciation + rhythm both improve. #ListeningPractice #Shadowing',
    createdAt: new Date(Date.now() - 1000 * 60 * 560).toISOString(),
    stats: { replies: 22, reposts: 51, likes: 189, bookmarks: 48, views: 1400 },
    viewer: { liked: true, reposted: false, bookmarked: false },
  },
  // 13. A2口语表达
  {
    id: 'twitter-013',
    type: 'text',
    author: {
      id: 'user-013',
      handle: 'speakingsimple',
      displayName: 'Jenny Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jenny',
      verified: true,
      badges: ['verified'],
    },
    content: '🗣️ A2 speaking: Replace “very big” with “huge”, “very small” with “tiny”, “very good” with “great”. Small upgrades = big confidence. #SpeakingTips',
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    stats: { replies: 58, reposts: 102, likes: 320, bookmarks: 74, views: 2600 },
    viewer: { liked: false, reposted: true, bookmarked: false },
  },
  // 14. 读书打卡
  {
    id: 'twitter-014',
    type: 'text',
    author: {
      id: 'user-014',
      handle: 'readinghabit',
      displayName: 'Marco Silva',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco',
      verified: false,
    },
    content: '📖 Day 14/30: Reading 10 minutes of Liu Cixin every morning. I highlight expressions I love and reuse them in my diary. #ReadingChallenge',
    createdAt: new Date(Date.now() - 1000 * 60 * 640).toISOString(),
    stats: { replies: 33, reposts: 59, likes: 176, bookmarks: 39, views: 1300 },
    viewer: { liked: true, reposted: true, bookmarked: false },
  },
  // 15. 纠错示范
  {
    id: 'twitter-015',
    type: 'text',
    author: {
      id: 'user-015',
      handle: 'gentlecorrector',
      displayName: 'Tom Harris',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
      verified: false,
    },
    content: '❗ Common fix: “discuss about” ❌ → “discuss” ✔️. Example: We discussed the ending of The Wandering Earth. Simple and clean. #CommonMistakes',
    createdAt: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
    stats: { replies: 44, reposts: 73, likes: 210, bookmarks: 55, views: 1600 },
    viewer: { liked: false, reposted: false, bookmarked: true },
  },
  // 16. 口头语替换
  {
    id: 'twitter-016',
    type: 'text',
    author: {
      id: 'user-016',
      handle: 'naturalenglish',
      displayName: 'Priya Singh',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      verified: true,
      badges: ['verified'],
    },
    content: '🔁 Instead of “I think yes”, say “I think so.” Instead of “I very like”, say “I really like.” Tiny tweaks, natural English. #Fluency',
    createdAt: new Date(Date.now() - 1000 * 60 * 760).toISOString(),
    stats: { replies: 61, reposts: 97, likes: 298, bookmarks: 63, views: 2500 },
    viewer: { liked: true, reposted: false, bookmarked: false },
  },
  // 17. 科幻问答
  {
    id: 'twitter-017',
    type: 'text',
    author: {
      id: 'user-017',
      handle: 'scifitalk',
      displayName: 'Ravi Kumar',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ravi',
      verified: false,
    },
    content: '❓ QOTD: If Earth became a spaceship like in The Wandering Earth, what ONE thing would you bring? I’d bring a paper journal. #SciFi #EnglishConversation',
    createdAt: new Date(Date.now() - 1000 * 60 * 820).toISOString(),
    stats: { replies: 140, reposts: 188, likes: 520, bookmarks: 110, views: 4800 },
    viewer: { liked: false, reposted: true, bookmarked: true },
  },
  // 18. 句型模仿
  {
    id: 'twitter-018',
    type: 'text',
    author: {
      id: 'user-018',
      handle: 'patternparrot',
      displayName: 'Elena Petrova',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
      verified: false,
    },
    content: '📝 Pattern: “I kept thinking about when you…” Use it to write a letter like Harry. Example: “I kept thinking about when you chose to stay.” #WritingPractice',
    createdAt: new Date(Date.now() - 1000 * 60 * 880).toISOString(),
    stats: { replies: 29, reposts: 54, likes: 162, bookmarks: 41, views: 1200 },
    viewer: { liked: true, reposted: false, bookmarked: true },
  },
  // 19. 小组练习招募
  {
    id: 'twitter-019',
    type: 'text',
    author: {
      id: 'user-019',
      handle: 'studywithme',
      displayName: 'Hannah Wu',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hannah',
      verified: false,
    },
    content: '👥 Looking for 3 partners to practice speaking 20 minutes/day. Topic this week: space travel vocabulary from Liu Cixin. DM me if interested! #StudyGroup',
    createdAt: new Date(Date.now() - 1000 * 60 * 940).toISOString(),
    stats: { replies: 65, reposts: 77, likes: 205, bookmarks: 70, views: 2100 },
    viewer: { liked: false, reposted: true, bookmarked: false },
  },
  // 20. 每周计划模板
  {
    id: 'twitter-020',
    type: 'text',
    author: {
      id: 'user-020',
      handle: 'plannerpro',
      displayName: 'Marta Rossi',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marta',
      verified: false,
    },
    content: '📅 Weekly plan: Mon—Reading, Tue—Vocabulary, Wed—Listening, Thu—Speaking, Fri—Writing, Sat—Review, Sun—Rest. Small, steady steps win. #StudyPlan',
    createdAt: new Date(Date.now() - 1000 * 60 * 1000).toISOString(),
    stats: { replies: 48, reposts: 69, likes: 180, bookmarks: 58, views: 1900 },
    viewer: { liked: true, reposted: true, bookmarked: false },
  }
];

export function getTwitterContentById(id: string): FeedCard | undefined {
  return TWITTER_CONTENT.find(content => content.id === id);
}

export function getAllTwitterContent(): FeedCard[] {
  return TWITTER_CONTENT;
}
