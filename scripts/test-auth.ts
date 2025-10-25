#!/usr/bin/env tsx

/**
 * 认证系统测试脚本
 * 用于验证登录注册功能是否正常工作
 */

import { createClient } from '@supabase/supabase-js';

// 测试配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 缺少Supabase环境变量');
  console.error('请设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 测试用户数据
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  username: `testuser${Date.now()}`,
};

async function testAuthSystem() {
  console.log('🧪 开始认证系统测试...\n');

  try {
    // 1. 测试用户注册
    console.log('1️⃣ 测试用户注册...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          username: testUser.username,
        },
      },
    });

    if (signUpError) {
      console.error('❌ 注册失败:', signUpError.message);
      return;
    }

    console.log('✅ 注册成功:', signUpData.user?.id);

    // 2. 测试用户登录
    console.log('\n2️⃣ 测试用户登录...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (signInError) {
      console.error('❌ 登录失败:', signInError.message);
      return;
    }

    console.log('✅ 登录成功:', signInData.user?.id);

    // 3. 测试用户资料创建
    console.log('\n3️⃣ 测试用户资料创建...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: signInData.user!.id,
        username: testUser.username,
        display_name: testUser.username,
        level: 1,
        experience: 0,
        streak_days: 0,
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ 创建用户资料失败:', profileError.message);
      return;
    }

    console.log('✅ 用户资料创建成功:', profileData.id);

    // 4. 测试权限检查
    console.log('\n4️⃣ 测试权限检查...');
    const { data: permissions, error: permError } = await supabase
      .rpc('get_user_permissions', { user_id: signInData.user!.id });

    if (permError) {
      console.error('❌ 权限检查失败:', permError.message);
      return;
    }

    console.log('✅ 用户权限:', permissions);

    // 5. 测试内容创建权限
    console.log('\n5️⃣ 测试内容创建权限...');
    const { data: canCreate, error: createError } = await supabase
      .rpc('check_user_permission', { 
        permission_name: 'create_post',
        user_id: signInData.user!.id 
      });

    if (createError) {
      console.error('❌ 权限检查失败:', createError.message);
      return;
    }

    console.log('✅ 创建内容权限:', canCreate);

    // 6. 测试用户登出
    console.log('\n6️⃣ 测试用户登出...');
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('❌ 登出失败:', signOutError.message);
      return;
    }

    console.log('✅ 登出成功');

    // 7. 清理测试数据
    console.log('\n7️⃣ 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', signInData.user!.id);

    if (deleteError) {
      console.warn('⚠️ 清理用户资料失败:', deleteError.message);
    } else {
      console.log('✅ 测试数据清理完成');
    }

    console.log('\n🎉 所有测试通过！认证系统工作正常');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testAuthSystem().catch(console.error);
