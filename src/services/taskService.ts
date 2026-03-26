import { supabase } from '@/lib/supabase';
import { AppTask } from '@/types/task';

export const taskService = {
  async getAllTasks(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('tasks')
      .select('*, case:cases(title)', { count: 'exact' })
      .order('due_date', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        caseId: t.case_id,
        caseName: t.case?.title,
        assignedTo: t.assigned_to,
        createdBy: t.created_by,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date,
        completedAt: t.completed_at,
        createdAt: t.created_at,
        dependencies: t.dependencies || []
      })) as AppTask[],
      totalCount: count || 0
    };
  },

  async getTasksByCase(caseId: string, page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId)
      .order('due_date', { ascending: true })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        caseId: t.case_id,
        assignedTo: t.assigned_to,
        createdBy: t.created_by,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date,
        completedAt: t.completed_at,
        createdAt: t.created_at,
        dependencies: t.dependencies || []
      })) as AppTask[],
      totalCount: count || 0
    };
  },

  async createTask(taskData: Omit<AppTask, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;
    return data as AppTask;
  },

  async updateTaskStatus(id: string, status: AppTask['status']) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AppTask;
  },

  async updateTask(id: string, updates: Partial<{ title: string; description: string; priority: string; due_date: string; status: string }>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AppTask;
  },

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
