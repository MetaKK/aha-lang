-- 认证集成更新
-- 更新现有schema以支持认证

-- ============================================
-- 更新用户资料表
-- ============================================

-- 添加display_name字段（如果不存在）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 更新RLS策略以支持认证
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 重新创建RLS策略
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
-- 更新Feed卡片表以支持认证
-- ============================================

-- 确保author_id字段存在且正确
ALTER TABLE public.feed_cards 
ALTER COLUMN author_id SET NOT NULL;

-- 更新Feed卡片的RLS策略
DROP POLICY IF EXISTS "Public cards are viewable" ON public.feed_cards;
DROP POLICY IF EXISTS "Users can create cards" ON public.feed_cards;
DROP POLICY IF EXISTS "Users can update own cards" ON public.feed_cards;
DROP POLICY IF EXISTS "Users can delete own cards" ON public.feed_cards;

-- 重新创建Feed卡片的RLS策略
CREATE POLICY "Public cards are viewable"
  ON public.feed_cards FOR SELECT
  USING (visibility = 'public' OR visibility IS NULL);

CREATE POLICY "Authenticated users can create cards"
  ON public.feed_cards FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own cards"
  ON public.feed_cards FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own cards"
  ON public.feed_cards FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 更新交互表以支持认证
-- ============================================

-- 确保user_id字段存在且正确
ALTER TABLE public.interactions 
ALTER COLUMN user_id SET NOT NULL;

-- 更新交互表的RLS策略
DROP POLICY IF EXISTS "Users can view own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can create interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can update own interactions" ON public.interactions;
DROP POLICY IF EXISTS "Users can delete own interactions" ON public.interactions;

-- 重新创建交互表的RLS策略
CREATE POLICY "Users can view own interactions"
  ON public.interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create interactions"
  ON public.interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON public.interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON public.interactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 创建用户资料触发器
-- ============================================

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 创建用户活动更新函数
-- ============================================

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
-- 创建认证相关的视图
-- ============================================

-- 用户统计视图
CREATE OR REPLACE VIEW public.user_stats AS
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
-- 创建认证相关的函数
-- ============================================

-- 检查用户权限
CREATE OR REPLACE FUNCTION public.check_user_permission(
  permission_name TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 基础权限：所有登录用户都可以创建内容
  IF permission_name IN ('create_post', 'create_challenge', 'edit_profile') THEN
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
    'create_challenge', 
    'edit_profile',
    CASE WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = user_id AND level >= 50
    ) THEN 'admin' ELSE NULL END
  ]::TEXT[];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
