import { supabase } from '@/lib/supabase';
import { KnowledgeItem, KnowledgeType } from '@/types/knowledge';

export const knowledgeBaseService = {
  async searchKnowledge(query: string = '', activeFilter: KnowledgeType | 'All' = 'All', page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let supabaseQuery = supabase
      .from('knowledge_base')
      .select('*', { count: 'exact' });

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%,snippet.ilike.%${query}%`);
    }

    if (activeFilter !== 'All') {
      supabaseQuery = supabaseQuery.eq('type', activeFilter);
    }

    const { data, error, count } = await supabaseQuery
      .order('date_added', { ascending: false })
      .range(from, to);

    if (error) throw error;
    
    return {
      data: (data || []).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        snippet: item.snippet,
        content: item.content,
        tags: item.tags || [],
        aiSummary: item.ai_summary,
        url: item.url,
        dateAdded: item.date_added,
        views: item.views || 0
      })) as KnowledgeItem[],
      totalCount: count || 0
    };
  },

  async getKnowledgeById(id: string) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      snippet: data.snippet,
      content: data.content,
      tags: data.tags || [],
      aiSummary: data.ai_summary,
      url: data.url,
      dateAdded: data.date_added,
      views: data.views || 0
    } as KnowledgeItem;
  },

  async incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_knowledge_views', { item_id: id });
    if (error) {
      // Fallback if RPC doesn't exist
      const { data: current } = await supabase.from('knowledge_base').select('views').eq('id', id).single();
      await supabase.from('knowledge_base').update({ views: (current?.views || 0) + 1 }).eq('id', id);
    }
  }
};
