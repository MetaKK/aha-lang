#!/bin/bash

# LinguaFlow 快速启动脚本

echo "🌊 LinguaFlow - 社交化英语学习平台"
echo "=================================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js >= 20"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ 未检测到 pnpm，正在安装..."
    npm install -g pnpm
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    pnpm install
fi

echo ""
echo "✅ 环境检查完成"
echo ""
echo "🚀 启动开发服务器..."
echo "📱 访问地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动开发服务器
pnpm dev

