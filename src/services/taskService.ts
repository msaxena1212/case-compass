import { supabase } from '@/lib/supabase';
import { AppTask } from '@/types/task';

export const taskService = {
  async getAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, cases(title)')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      caseId: t.case_id,
      caseName: t.cases?.title,
      assignedTo: t.assigned_to,
      createdBy: t.created_by,
      status: t.status,
      priority: t.priority,
      dueDate: t.due_date,
      completedAt: t.completed_at,
      createdAt: t.created_at,
      dependencies: t.dependencies || []
    })) as AppTask[];
  },

  async getTasksByCase(caseId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('case_id', caseId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data as AppTask[];
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

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
