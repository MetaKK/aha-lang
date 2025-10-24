#!/usr/bin/env ts-node

/**
 * 数据同步系统检查脚本
 * 
 * 用途：
 * 1. 检查数据模型版本
 * 2. 验证本地数据完整性
 * 3. 检查同步配置
 * 4. 生成检查报告
 */

import { CURRENT_SCHEMA_VERSION, SCHEMA_CHANGELOG, VersionChecker, SchemaValidator } from '../src/lib/sync/schema-version'

async function main() {
  console.log('🔍 LinguaFlow 数据同步系统检查')
  console.log('=' .repeat(50))
  console.log('')

  // 1. 检查当前版本
  console.log('📊 当前数据模型版本')
  console.log(`版本号: v${CURRENT_SCHEMA_VERSION}`)
  console.log(`变更历史: ${Object.keys(SCHEMA_CHANGELOG).length} 个版本`)
  console.log('')

  // 2. 显示版本历史
  console.log('📜 版本变更历史')
  for (const [version, info] of Object.entries(SCHEMA_CHANGELOG)) {
    console.log(`\nv${version} (${info.date})`)
    info.changes.forEach(change => {
      console.log(`  - ${change}`)
    })
    if (info.breaking) {
      console.log('  ⚠️  Breaking Change')
    }
  }
  console.log('')

  // 3. 检查环境配置
  console.log('⚙️  环境配置')
  const enableSync = process.env.NEXT_PUBLIC_ENABLE_BACKEND_SYNC === 'true'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const syncInterval = process.env.NEXT_PUBLIC_SYNC_INTERVAL
  const conflictResolution = process.env.NEXT_PUBLIC_CONFLICT_RESOLUTION

  console.log(`后端同步: ${enableSync ? '✅ 已启用' : '❌ 未启用（开发模式）'}`)
  console.log(`Supabase URL: ${supabaseUrl || '未配置'}`)
  console.log(`同步间隔: ${syncInterval || '30000'}ms`)
  console.log(`冲突策略: ${conflictResolution || 'latest-wins'}`)
  console.log('')

  // 4. 检查本地数据（仅在浏览器环境）
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    console.log('💾 本地数据检查')
    
    try {
      const { version, needsMigration, items } = await VersionChecker.checkLocalVersion()
      
      console.log(`数据版本: v${version}`)
      console.log(`数据项数: ${items.length}`)
      console.log(`需要迁移: ${needsMigration ? '⚠️  是' : '✅ 否'}`)
      
      if (items.length > 0) {
        const stats = await VersionChecker.getVersionStats()
        console.log('\n版本分布:')
        for (const [ver, count] of Object.entries(stats)) {
          console.log(`  v${ver}: ${count} 项`)
        }
      }
      
      // 验证数据完整性
      console.log('\n🔍 数据完整性验证')
      let validCount = 0
      let invalidCount = 0
      
      for (const item of items) {
        const key = `${item.table}:${item.id}`
        const data = localStorage.getItem(key)
        
        if (data) {
          const parsed = JSON.parse(data)
          const { valid } = SchemaValidator.validate(parsed, item.version)
          
          if (valid) {
            validCount++
          } else {
            invalidCount++
            console.log(`  ❌ ${item.table}:${item.id} (v${item.version})`)
          }
        }
      }
      
      console.log(`\n有效数据: ${validCount}`)
      console.log(`无效数据: ${invalidCount}`)
      
    } catch (error) {
      console.log('⚠️  无法检查本地数据（可能在服务端环境）')
    }
  } else {
    console.log('💾 本地数据检查')
    console.log('⚠️  在服务端环境，跳过本地数据检查')
  }
  
  console.log('')
  console.log('=' .repeat(50))
  console.log('✅ 检查完成')
  console.log('')
  
  // 5. 给出建议
  console.log('💡 建议')
  
  if (!enableSync) {
    console.log('  - 当前处于开发模式（本地存储）')
    console.log('  - 生产环境请设置 NEXT_PUBLIC_ENABLE_BACKEND_SYNC=true')
  } else {
    if (!supabaseUrl) {
      console.log('  ⚠️  已启用后端同步但未配置 Supabase URL')
      console.log('  - 请设置 NEXT_PUBLIC_SUPABASE_URL')
    } else {
      console.log('  ✅ 后端同步配置正常')
    }
  }
  
  console.log('')
}

// 运行检查
main().catch(console.error)

