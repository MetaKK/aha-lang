'use client';

import { useAuthState, usePermission, useAuthActions } from '@/hooks/use-auth';
import { UserAvatar } from '@/components/auth/user-avatar';
import { motion } from 'framer-motion';

export default function TestAuthPage() {
  const { user, profile, isAuthenticated, loading, error } = useAuthState();
  const { canCreatePost, canCreateQuest, hasPermission } = usePermission();
  const { signOut, refreshUser } = useAuthActions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载认证状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            认证系统测试页面
          </h1>

          {/* 认证状态 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                认证状态
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">登录状态:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isAuthenticated 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {isAuthenticated ? '已登录' : '未登录'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">加载状态:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    loading 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {loading ? '加载中' : '已完成'}
                  </span>
                </div>
                {error && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">错误信息:</span>
                    <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 用户信息 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                用户信息
              </h2>
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <UserAvatar size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.display_name || profile?.username || user.email.split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>用户ID: {user.id}</p>
                    <p>创建时间: {new Date(user.created_at).toLocaleString()}</p>
                    {profile && (
                      <>
                        <p>等级: {profile.level}</p>
                        <p>经验: {profile.experience}</p>
                        <p>连续天数: {profile.streak_days}</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">未登录</p>
              )}
            </div>
          </div>

          {/* 权限测试 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              权限测试
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  canCreatePost 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  ✓
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">创建帖子</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {canCreatePost ? '允许' : '禁止'}
                </p>
              </div>
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  canCreateQuest 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  ✓
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">创建Quest</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {canCreateQuest ? '允许' : '禁止'}
                </p>
              </div>
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  hasPermission('edit_profile')
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  ✓
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">编辑资料</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {hasPermission('edit_profile') ? '允许' : '禁止'}
                </p>
              </div>
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  hasPermission('admin')
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  ✓
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">管理员</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {hasPermission('admin') ? '允许' : '禁止'}
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-4">
            <motion.button
              onClick={refreshUser}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              刷新用户信息
            </motion.button>
            
            {isAuthenticated && (
              <motion.button
                onClick={signOut}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                退出登录
              </motion.button>
            )}
            
            <motion.button
              onClick={() => window.location.href = '/auth'}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              前往登录页
            </motion.button>
            
            <motion.button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              返回主页
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
