/**
 * 基础Service类
 * 提供通用的数据库操作方法
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { ApiException, ErrorCode, HttpStatus } from '../types/response';
import { dbFieldToDto, dtoFieldToDb } from '../types/dto';

export abstract class BaseService {
  protected supabase: ReturnType<typeof getSupabaseClient>;
  
  constructor(supabaseClient?: ReturnType<typeof getSupabaseClient>) {
    this.supabase = supabaseClient || getSupabaseClient();
  }
  
  /**
   * 通用查询方法
   */
  protected async findMany<T>(
    table: string,
    options?: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    if (!this.supabase) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Supabase 客户端未初始化',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    try {
      let query = (this.supabase as any)
        .from(table)
        .select(options?.select || '*');
      
      // 应用过滤条件
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // 排序
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        });
      }
      
      // 分页
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          `查询${table}失败: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error
        );
      }
      
      return (data || []).map((row: any) => dbFieldToDto<T>(row as Record<string, any>));
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        `查询${table}时发生错误`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
  
  /**
   * 通用单条查询方法
   */
  protected async findOne<T>(
    table: string,
    id: string,
    select?: string
  ): Promise<T | null> {
    if (!this.supabase) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Supabase 客户端未初始化',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    try {
      const { data, error } = await (this.supabase as any)
        .from(table)
        .select(select || '*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 未找到
        }
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          `查询${table}失败: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error
        );
      }
      
      return data ? dbFieldToDto<T>(data as Record<string, any>) : null;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        `查询${table}时发生错误`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
  
  /**
   * 通用创建方法
   */
  protected async create<T>(
    table: string,
    data: Record<string, any>
  ): Promise<T> {
    if (!this.supabase) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Supabase 客户端未初始化',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    try {
      const dbData = dtoFieldToDb(data);
      
      const { data: result, error } = await (this.supabase as any)
        .from(table)
        .insert(dbData)
        .select()
        .single();
      
      if (error) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          `创建${table}失败: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error
        );
      }
      
      return dbFieldToDto<T>(result as Record<string, any>);
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        `创建${table}时发生错误`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
  
  /**
   * 通用更新方法
   */
  protected async update<T>(
    table: string,
    id: string,
    data: Record<string, any>
  ): Promise<T> {
    if (!this.supabase) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Supabase 客户端未初始化',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    try {
      const dbData = dtoFieldToDb(data);
      
      const { data: result, error } = await (this.supabase as any)
        .from(table)
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          `更新${table}失败: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error
        );
      }
      
      return dbFieldToDto<T>(result as Record<string, any>);
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        `更新${table}时发生错误`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
  
  /**
   * 通用删除方法
   */
  protected async delete(table: string, id: string): Promise<void> {
    if (!this.supabase) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Supabase 客户端未初始化',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    try {
      const { error } = await (this.supabase as any)
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          `删除${table}失败: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error
        );
      }
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        `删除${table}时发生错误`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
  
  /**
   * 通用计数方法
   */
  protected async count(
    table: string,
    filters?: Record<string, any>
  ): Promise<number> {
    if (!this.supabase) {
      throw new ApiException(
        ErrorCode.INTERNAL_ERROR,
        'Supabase 客户端未初始化',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    try {
      let query = (this.supabase as any)
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { count, error } = await query;
      
      if (error) {
        throw new ApiException(
          ErrorCode.DATABASE_ERROR,
          `计数${table}失败: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
          error
        );
      }
      
      return count || 0;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(
        ErrorCode.DATABASE_ERROR,
        `计数${table}时发生错误`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error
      );
    }
  }
}

