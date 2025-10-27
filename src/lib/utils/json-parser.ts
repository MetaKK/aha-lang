/**
 * JSON解析工具 - 专门处理AI返回的JSON格式问题
 */

export interface JsonParseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  originalText?: string;
  fixedText?: string;
}

/**
 * 智能JSON解析器
 * 专门处理AI返回的JSON格式问题
 */
export function parseAIJson<T = any>(text: string): JsonParseResult<T> {
  const originalText = text.trim();
  
  // 第一步：清理文本
  let cleanText = originalText;
  
  // 移除markdown代码块
  cleanText = cleanText.replace(/^```json\s*/g, '').replace(/^```\s*/g, '');
  cleanText = cleanText.replace(/\s*```$/g, '');
  cleanText = cleanText.trim();
  
  // 提取JSON对象
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      success: false,
      error: 'No valid JSON object found',
      originalText
    };
  }
  
  let jsonText = jsonMatch[0];
  
  // 第二步：尝试直接解析
  try {
    const data = JSON.parse(jsonText);
    return {
      success: true,
      data,
      originalText,
      fixedText: jsonText
    };
  } catch (error) {
    console.warn('Direct JSON parse failed, attempting fixes...', error);
  }
  
  // 第三步：应用修复规则
  let fixedText = jsonText;
  
  // 修复规则1：处理重复的大括号
  fixedText = fixedText.replace(/\{\s*\{/g, '{');
  
  // 修复规则2：处理控制字符
  fixedText = fixedText.replace(/[\x00-\x1F\x7F]/g, '');
  
  // 修复规则3：处理scores对象的特殊格式问题
  // 匹配 "scores { 或 "scores" { 格式
  fixedText = fixedText.replace(/"scores\s*\{/g, '"scores": {');
  
  // 修复规则4：处理scores内部的属性格式问题
  // 匹配 "propertyName数字, 格式
  fixedText = fixedText.replace(/"(\w+)(\d+),/g, '"$1": $2,');
  
  // 修复规则5：处理缺少冒号的情况
  // 匹配 "key "value" 模式
  fixedText = fixedText.replace(/"([^"]+)\s+"([^"]+)"/g, '"$1": "$2"');
  
  // 修复规则6：处理缺少引号的属性名
  fixedText = fixedText.replace(/(\w+)(\s*:)/g, '"$1"$2');
  
  // 修复规则7：处理缺少引号的值（数字除外）
  fixedText = fixedText.replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}])/g, (match, value, ending) => {
    // 如果是数字、布尔值或null，不加引号
    if (/^(true|false|null|\d+(\.\d+)?)$/.test(value.trim())) {
      return `: ${value.trim()}${ending}`;
    }
    // 否则加引号
    return `: "${value.trim()}"${ending}`;
  });
  
  // 修复规则8：处理属性名后的空格问题
  fixedText = fixedText.replace(/"\s+([^"]*)"\s*:/g, '"$1":');
  
  // 修复规则9：处理多余的引号
  fixedText = fixedText.replace(/"\s*"\s*:/g, '":');
  
  // 修复规则10：处理嵌套对象中的问题
  fixedText = fixedText.replace(/\{\s*"([^"]+)"\s*([^}]+)\s*\}/g, '{"$1": $2}');
  
  // 修复规则11：确保最后一个属性后有逗号
  fixedText = fixedText.replace(/"([^"]*)"\s*}/g, '"$1"}');
  
  // 修复规则12：处理hasChinese字段的特殊情况
  fixedText = fixedText.replace(/"hasChinese"\s*(\w+)/g, '"hasChinese": $1');
  
  // 修复规则13：处理缺少属性名的情况
  // 处理 " "value" 这种格式，尝试推断属性名
  fixedText = fixedText.replace(/"\s+"([^"]+)"/g, (match, value) => {
    // 根据值的内容推断可能的属性名
    if (value.includes('conversation') || value.includes('talking') || value.includes('discuss')) {
      return `"context": "${value}"`;
    } else if (value.includes('practice') || value.includes('learn') || value.includes('skill')) {
      return `"goal": "${value}"`;
    } else if (value.match(/^[A-Z]\d$/)) {
      return `"difficulty": "${value}"`;
    } else if (value.includes('Try to') || value.includes('feedback') || value.includes('Good') || value.includes('Great')) {
      return `"feedback": "${value}"`;
    } else if (value.includes('What') || value.includes('How') || value.includes('Tell me') || value.includes('I')) {
      return `"response": "${value}"`;
    } else {
      return `"description": "${value}"`;
    }
  });
  
  // 修复规则14：处理缺少引号的字符串值
  fixedText = fixedText.replace(/:\s*([A-Z][^,}]*?)(\s*[,}])/g, (match, value, ending) => {
    // 如果值看起来像字符串（以大写字母开头，包含空格），加引号
    if (value.trim().length > 0 && !/^(true|false|null|\d+(\.\d+)?)$/.test(value.trim())) {
      return `: "${value.trim()}"${ending}`;
    }
    return match;
  });
  
  // 修复规则15：处理特殊的格式问题
  // 处理 "key "value" 格式（key和value之间缺少冒号）
  fixedText = fixedText.replace(/"([^"]+)\s+"([^"]+)"/g, (match, key, value) => {
    // 检查是否已经有冒号
    const keyIndex = fixedText.indexOf(match);
    const afterKey = fixedText.substring(keyIndex + match.length);
    
    // 如果key后面没有冒号，添加冒号
    if (!afterKey.trim().startsWith(':')) {
      return `"${key}": "${value}"`;
    }
    return match;
  });
  
  // 修复规则16：处理布尔值格式问题
  fixedText = fixedText.replace(/"hasChinese"\s*(\w+)/g, '"hasChinese": $1');
  
  // 修复规则17：处理数字格式问题
  fixedText = fixedText.replace(/"(\w+)":\s*"(\d+)"/g, '"$1": $2');
  
  // 第四步：尝试解析修复后的文本
  try {
    const data = JSON.parse(fixedText);
    return {
      success: true,
      data,
      originalText,
      fixedText
    };
  } catch (error) {
    console.error('JSON fix failed:', error);
    console.error('Original text:', originalText);
    console.error('Fixed text:', fixedText);
    
    return {
      success: false,
      error: `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      originalText,
      fixedText
    };
  }
}

/**
 * 安全的JSON解析器，带默认值
 */
export function safeParseAIJson<T = any>(
  text: string, 
  defaultValue: T
): T {
  const result = parseAIJson<T>(text);
  return result.success ? result.data! : defaultValue;
}

/**
 * 验证JSON结构
 */
export function validateJsonStructure<T = any>(
  data: any,
  requiredFields: (keyof T)[]
): data is T {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  return requiredFields.every(field => field in data);
}