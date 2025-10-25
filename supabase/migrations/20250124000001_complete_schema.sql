-- LinguaFlow 完整数据库Schema
-- 基于Supabase PostgreSQL，包含所有功能和认证

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 全文搜索
CREATE EXTENSION IF NOT EXISTS "vector"; -- AI向量搜索（未来使用）

-- ============================================
-- 用户相关表
-- ============================================

-- 用户资料表（扩展auth.users）
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- 学习数据
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  experience INTEGER DEFAULT 0 CHECK (experience >= 0),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  
  -- 时间戳
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 用户资料索引
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_level ON public.profiles(level DESC);

-- 用户资料RLS策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- Feed流相关表
-- ============================================

-- Feed卡片表（多态设计）
CREATE TABLE public.feed_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('novel', 'text', 'image', 'video', 'audio', 'ad', 'quote', 'repost')),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- 基础内容
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- 可见性
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'followers')),
  
  -- 社交统计（通过触发器自动更新）
  likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
  comments_count INTEGER DEFAULT 0 CHECK (comments_count >= 0),
  shares_count INTEGER DEFAULT 0 CHECK (shares_count >= 0),
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
  
  -- Quest相关字段
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  tags TEXT[],
  
  -- 搜索向量
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(title, '') || ' ' || 
      coalesce(content::text, '')
    )
  ) STORED,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feed卡片索引
CREATE INDEX idx_feed_cards_type ON public.feed_cards(type);
CREATE INDEX idx_feed_cards_author ON public.feed_cards(author_id);
CREATE INDEX idx_feed_cards_created ON public.feed_cards(created_at DESC);
CREATE INDEX idx_feed_cards_visibility ON public.feed_cards(visibility);
CREATE INDEX idx_feed_cards_search ON public.feed_cards USING gin(search_vector);
CREATE INDEX idx_feed_cards_difficulty ON public.feed_cards(difficulty);
CREATE INDEX idx_feed_cards_tags ON public.feed_cards USING gin(tags);

-- Feed卡片RLS策略
ALTER TABLE public.feed_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public cards are viewable by everyone"
  ON public.feed_cards FOR SELECT
  USING (visibility = 'public' OR visibility IS NULL OR author_id = auth.uid());

CREATE POLICY "Users can insert own cards"
  ON public.feed_cards FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own cards"
  ON public.feed_cards FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own cards"
  ON public.feed_cards FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 学习系统相关表
-- ============================================

-- 小说章节表
CREATE TABLE public.novel_chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feed_card_id UUID REFERENCES public.feed_cards(id) ON DELETE CASCADE NOT NULL,
  chapter_number INTEGER NOT NULL CHECK (chapter_number > 0),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  
  -- 难度和统计
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
  estimated_time INTEGER, -- 分钟
  word_count INTEGER,
  
  -- AI生成的元数据
  key_vocabulary JSONB DEFAULT '[]'::jsonb,
  grammar_points JSONB DEFAULT '[]'::jsonb,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(feed_card_id, chapter_number)
);

-- 章节索引
CREATE INDEX idx_chapters_card ON public.novel_chapters(feed_card_id);
CREATE INDEX idx_chapters_number ON public.novel_chapters(chapter_number);

-- 章节RLS策略
ALTER TABLE public.novel_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapters are viewable by everyone"
  ON public.novel_chapters FOR SELECT
  USING (true);

-- Quest表
CREATE TABLE public.quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chapter_id UUID REFERENCES public.novel_chapters(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('vocabulary', 'grammar', 'comprehension', 'speaking', 'writing')),
  order_index INTEGER NOT NULL CHECK (order_index >= 0),
  
  -- Quest配置
  config JSONB NOT NULL,
  passing_score INTEGER DEFAULT 60 CHECK (passing_score BETWEEN 0 AND 100),
  time_limit INTEGER, -- 秒
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(chapter_id, order_index)
);

-- Quest索引
CREATE INDEX idx_quests_chapter ON public.quests(chapter_id);
CREATE INDEX idx_quests_type ON public.quests(type);

-- Quest RLS策略
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests are viewable by everyone"
  ON public.quests FOR SELECT
  USING (true);

-- 用户进度表
CREATE TABLE public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES public.novel_chapters(id) ON DELETE CASCADE NOT NULL,
  
  -- 进度状态
  status VARCHAR(20) DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'reading', 'questing', 'completed', 'failed')),
  current_quest_index INTEGER DEFAULT 0 CHECK (current_quest_index >= 0),
  
  -- 成绩记录
  best_score INTEGER DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
  time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0), -- 秒
  
  -- 详细进度
  quests_completed JSONB DEFAULT '[]'::jsonb,
  mistakes JSONB DEFAULT '[]'::jsonb,
  
  -- 时间戳
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(user_id, chapter_id)
);

-- 进度索引
CREATE INDEX idx_progress_user ON public.user_progress(user_id);
CREATE INDEX idx_progress_chapter ON public.user_progress(chapter_id);
CREATE INDEX idx_progress_status ON public.user_progress(status);

-- 进度RLS策略
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Quest结果表
CREATE TABLE public.quest_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- 答案和成绩
  user_answer JSONB NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  time_spent INTEGER NOT NULL CHECK (time_spent >= 0), -- 秒
  
  -- AI评分详情
  ai_score JSONB,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 结果索引
CREATE INDEX idx_results_quest ON public.quest_results(quest_id);
CREATE INDEX idx_results_user ON public.quest_results(user_id);
CREATE INDEX idx_results_created ON public.quest_results(created_at DESC);

-- 结果RLS策略
ALTER TABLE public.quest_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results"
  ON public.quest_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON public.quest_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 社交互动相关表
-- ============================================

-- 互动表（点赞、评论、分享、收藏）
CREATE TABLE public.interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('card', 'comment', 'chapter', 'quest')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'unlike', 'comment', 'reply', 'share', 'repost', 'unrepost', 'bookmark', 'unbookmark', 'quote')),
  
  -- 评论内容
  content TEXT,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 防止重复点赞/收藏
  UNIQUE(user_id, target_id, target_type, type) 
    WHERE type IN ('like', 'bookmark')
);

-- 互动索引
CREATE INDEX idx_interactions_target ON public.interactions(target_id, target_type);
CREATE INDEX idx_interactions_user ON public.interactions(user_id, type);
CREATE INDEX idx_interactions_created ON public.interactions(created_at DESC);

-- 互动RLS策略
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interactions are viewable by everyone"
  ON public.interactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create interactions"
  ON public.interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON public.interactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 引用表（用于quote和repost）
-- ============================================

CREATE TABLE public.card_references (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_card_id UUID REFERENCES public.feed_cards(id) ON DELETE CASCADE NOT NULL,
  target_card_id UUID REFERENCES public.feed_cards(id) ON DELETE CASCADE NOT NULL,
  reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('quote', 'repost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 防止重复引用
  UNIQUE(source_card_id, target_card_id, reference_type)
);

-- 引用表索引
CREATE INDEX idx_card_references_source ON public.card_references(source_card_id);
CREATE INDEX idx_card_references_target ON public.card_references(target_card_id);
CREATE INDEX idx_card_references_type ON public.card_references(reference_type);

-- 引用表RLS策略
ALTER TABLE public.card_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Card references are viewable by everyone"
  ON public.card_references FOR SELECT
  USING (true);

CREATE POLICY "Users can create references"
  ON public.card_references FOR INSERT
  WITH CHECK (auth.uid() = (
    SELECT author_id FROM public.feed_cards WHERE id = source_card_id
  ));

CREATE POLICY "Users can delete own references"
  ON public.card_references FOR DELETE
  USING (auth.uid() = (
    SELECT author_id FROM public.feed_cards WHERE id = source_card_id
  ));

-- ============================================
-- 成就系统
-- ============================================

-- 用户成就表
CREATE TABLE public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- 时间戳
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束
  UNIQUE(user_id, achievement_type)
);

-- 成就索引
CREATE INDEX idx_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_achievements_type ON public.user_achievements(achievement_type);

-- 成就RLS策略
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

-- ============================================
-- 触发器和函数
-- ============================================

-- 更新updated_at时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_cards_updated_at
  BEFORE UPDATE ON public.feed_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.novel_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 自动更新Feed卡片统计的函数
CREATE OR REPLACE FUNCTION update_card_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'like' AND NEW.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.target_id;
    ELSIF NEW.type = 'comment' AND NEW.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.target_id;
    ELSIF NEW.type = 'share' AND NEW.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET shares_count = shares_count + 1 
      WHERE id = NEW.target_id;
    ELSIF NEW.type = 'repost' AND NEW.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET shares_count = shares_count + 1 
      WHERE id = NEW.target_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'like' AND OLD.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET likes_count = GREATEST(0, likes_count - 1)
      WHERE id = OLD.target_id;
    ELSIF OLD.type = 'comment' AND OLD.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET comments_count = GREATEST(0, comments_count - 1)
      WHERE id = OLD.target_id;
    ELSIF OLD.type = 'share' AND OLD.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET shares_count = GREATEST(0, shares_count - 1)
      WHERE id = OLD.target_id;
    ELSIF OLD.type = 'repost' AND OLD.target_type = 'card' THEN
      UPDATE public.feed_cards 
      SET shares_count = GREATEST(0, shares_count - 1)
      WHERE id = OLD.target_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 添加触发器
CREATE TRIGGER interaction_stats_trigger
  AFTER INSERT OR DELETE ON public.interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_card_stats();

-- 创建用户时自动创建资料
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, level, experience, streak_days)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username'),
    1,
    0,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 更新用户最后活动时间
CREATE OR REPLACE FUNCTION public.update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET last_active_at = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 在用户创建内容时更新活动时间
CREATE TRIGGER update_activity_on_card_create
  AFTER INSERT ON public.feed_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_user_activity();

CREATE TRIGGER update_activity_on_interaction
  AFTER INSERT ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_activity();

-- ============================================
-- 权限系统
-- ============================================

-- 检查用户权限
CREATE OR REPLACE FUNCTION public.check_user_permission(
  permission_name TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 基础权限：所有登录用户都可以创建内容
  IF permission_name IN ('create_post', 'create_quest', 'edit_profile', 'create_quote', 'create_repost') THEN
    RETURN user_id IS NOT NULL;
  END IF;
  
  -- 高级权限：需要特定条件
  IF permission_name = 'admin' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = user_id AND level >= 50
    );
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户权限
CREATE OR REPLACE FUNCTION public.get_user_permissions(
  user_id UUID DEFAULT auth.uid()
)
RETURNS TEXT[] AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN ARRAY[]::TEXT[];
  END IF;
  
  RETURN ARRAY[
    'create_post',
    'create_quest', 
    'edit_profile',
    'create_quote',
    'create_repost',
    CASE WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = user_id AND level >= 50
    ) THEN 'admin' ELSE NULL END
  ]::TEXT[];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 视图
-- ============================================

-- Feed流优化视图
CREATE VIEW public.feed_with_details AS
SELECT 
  fc.*,
  p.username,
  p.display_name,
  p.avatar_url,
  p.level,
  -- 引用信息
  CASE 
    WHEN fc.type = 'quote' THEN (
      SELECT json_build_object(
        'id', ref.target_card_id,
        'type', ref.reference_type
      )
      FROM public.card_references ref 
      WHERE ref.source_card_id = fc.id 
      LIMIT 1
    )
    WHEN fc.type = 'repost' THEN (
      SELECT json_build_object(
        'id', ref.target_card_id,
        'type', ref.reference_type
      )
      FROM public.card_references ref 
      WHERE ref.source_card_id = fc.id 
      LIMIT 1
    )
    ELSE NULL
  END as reference_info,
  -- 用户互动状态
  EXISTS(
    SELECT 1 FROM public.interactions 
    WHERE target_id = fc.id 
    AND target_type = 'card' 
    AND type = 'like' 
    AND user_id = auth.uid()
  ) as user_liked,
  EXISTS(
    SELECT 1 FROM public.interactions 
    WHERE target_id = fc.id 
    AND target_type = 'card' 
    AND type = 'bookmark' 
    AND user_id = auth.uid()
  ) as user_bookmarked,
  EXISTS(
    SELECT 1 FROM public.interactions 
    WHERE target_id = fc.id 
    AND target_type = 'card' 
    AND type = 'repost' 
    AND user_id = auth.uid()
  ) as user_reposted
FROM public.feed_cards fc
LEFT JOIN public.profiles p ON fc.author_id = p.id
WHERE fc.visibility = 'public' OR fc.visibility IS NULL
ORDER BY fc.created_at DESC;

-- 用户学习统计视图
CREATE VIEW public.user_learning_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE status = 'completed') as chapters_completed,
  AVG(best_score) FILTER (WHERE status = 'completed') as average_score,
  SUM(time_spent) as total_time_spent,
  MAX(updated_at) FILTER (WHERE status = 'completed') as last_completed_at
FROM public.user_progress
GROUP BY user_id;

-- 用户统计视图
CREATE VIEW public.user_stats AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.level,
  p.experience,
  p.streak_days,
  p.last_active_at,
  COUNT(DISTINCT fc.id) as posts_count,
  COUNT(DISTINCT i.id) as interactions_count,
  COALESCE(SUM(CASE WHEN i.type = 'like' THEN 1 ELSE 0 END), 0) as likes_given,
  COALESCE(SUM(fc.likes_count), 0) as likes_received
FROM public.profiles p
LEFT JOIN public.feed_cards fc ON p.id = fc.author_id
LEFT JOIN public.interactions i ON p.id = i.user_id
GROUP BY p.id, p.username, p.display_name, p.level, p.experience, p.streak_days, p.last_active_at;

-- 设置视图的RLS
ALTER VIEW public.user_stats SET (security_invoker = true);

-- ============================================
-- 辅助函数
-- ============================================

-- 获取卡片引用信息
CREATE OR REPLACE FUNCTION public.get_card_references(card_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'quoted', (
        SELECT json_agg(
          json_build_object(
            'id', ref.target_card_id,
            'type', ref.reference_type
          )
        )
        FROM public.card_references ref 
        WHERE ref.source_card_id = card_id 
        AND ref.reference_type = 'quote'
      ),
      'reposted', (
        SELECT json_agg(
          json_build_object(
            'id', ref.target_card_id,
            'type', ref.reference_type
          )
        )
        FROM public.card_references ref 
        WHERE ref.source_card_id = card_id 
        AND ref.reference_type = 'repost'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户互动状态
CREATE OR REPLACE FUNCTION public.get_user_interactions(card_id UUID, user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
BEGIN
  IF user_id IS NULL THEN
    RETURN json_build_object(
      'liked', false,
      'bookmarked', false,
      'reposted', false
    );
  END IF;
  
  RETURN (
    SELECT json_build_object(
      'liked', EXISTS(
        SELECT 1 FROM public.interactions 
        WHERE target_id = card_id 
        AND target_type = 'card' 
        AND type = 'like' 
        AND user_id = user_id
      ),
      'bookmarked', EXISTS(
        SELECT 1 FROM public.interactions 
        WHERE target_id = card_id 
        AND target_type = 'card' 
        AND type = 'bookmark' 
        AND user_id = user_id
      ),
      'reposted', EXISTS(
        SELECT 1 FROM public.interactions 
        WHERE target_id = card_id 
        AND target_type = 'card' 
        AND type = 'repost' 
        AND user_id = user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
