#!/bin/bash

# LinguaFlow Vercel 部署脚本

echo "🚀 LinguaFlow Vercel 部署脚本"
echo "================================"
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel..."
    vercel login
fi

echo ""
echo "📋 部署前检查清单:"
echo "1. ✅ 已创建 Supabase 生产项目"
echo "2. ✅ 已执行数据库迁移脚本"
echo "3. ✅ 已获取 Supabase 环境变量"
echo "4. ✅ 已设置 Vercel 环境变量"
echo ""

read -p "是否已完成上述步骤? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 请先完成前置步骤，然后重新运行此脚本"
    exit 1
fi

echo ""
echo "🚀 开始部署到 Vercel..."

# 部署到 Vercel
vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "📝 后续步骤:"
echo "1. 在 Vercel Dashboard 中设置环境变量"
echo "2. 测试所有功能是否正常"
echo "3. 配置自定义域名 (可选)"
echo "4. 设置监控和告警"
echo ""
echo "🎉 恭喜！你的 LinguaFlow 应用已成功部署！"
