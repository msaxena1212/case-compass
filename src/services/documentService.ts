import { supabase } from '@/lib/supabase';
import { LegalDocument, DocumentVersion } from '@/types/document';

export const documentService = {
  async getAllDocuments(page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('documents')
      .select('*, case:cases(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    return {
      data: (data || []).map(d => ({
        id: d.id,
        caseId: d.case_id,
        caseName: d.case?.title || "General",
        fileName: d.file_name,
        fileType: d.file_type,
        documentType: d.document_type,
        size: d.size,
        uploadedAt: d.created_at,
        uploadedBy: d.uploaded_by,
        versionNumber: d.version_number,
        status: d.status,
        tags: d.tags || [],
        aiSummary: d.ai_summary,
        aiKeywords: d.ai_keywords || [],
        riskClauses: d.risk_clauses || [],
        versions: d.versions || []
      })) as LegalDocument[],
      totalCount: count || 0
    };
  },

  async getDocumentsByCase(caseId: string, page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(d => ({
        id: d.id,
        caseId: d.case_id,
        fileName: d.file_name,
        fileType: d.file_type,
        documentType: d.document_type,
        size: d.size,
        uploadedAt: d.created_at,
        uploadedBy: d.uploaded_by,
        versionNumber: d.version_number,
        status: d.status,
        tags: d.tags || [],
        aiSummary: d.ai_summary,
        aiKeywords: d.ai_keywords || [],
        riskClauses: d.risk_clauses || [],
        versions: d.versions || []
      })) as LegalDocument[],
      totalCount: count || 0
    };
  },

  async getDocumentsByClient(clientId: string, page: number = 1, pageSize: number = 10) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('documents')
      .select('*, case:cases!inner(client_id)', { count: 'exact' })
      .eq('case.client_id', clientId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      data: (data || []).map(d => ({
        id: d.id,
        caseId: d.case_id,
        fileName: d.file_name,
        fileType: d.file_type,
        documentType: d.document_type,
        size: d.size,
        uploadedAt: d.created_at,
        uploadedBy: d.uploaded_by,
        versionNumber: d.version_number,
        status: d.status,
        tags: d.tags || [],
        aiSummary: d.ai_summary,
        aiKeywords: d.ai_keywords || [],
        riskClauses: d.risk_clauses || [],
        versions: d.versions || []
      })) as LegalDocument[],
      totalCount: count || 0
    };
  },

  async getDocumentById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as LegalDocument;
  },

  async uploadDocument(docData: Omit<LegalDocument, 'id' | 'uploadedAt'>, file: File) {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${docData.caseId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const dbData = {
      case_id: docData.caseId,
      file_name: docData.fileName,
      file_url: publicUrl,
      file_type: docData.fileType,
      document_type: docData.documentType,
      tags: docData.tags,
      version_number: docData.versionNumber,
      versions: docData.versions,
      uploaded_by: docData.uploadedBy,
      size: docData.size,
      status: docData.status,
      ai_summary: docData.aiSummary,
      ai_keywords: docData.aiKeywords,
      risk_clauses: docData.riskClauses,
      hash: docData.hash
    };

    const { data, error: dbError } = await supabase
      .from('documents')
      .insert([dbData])
      .select()
      .single();

    if (dbError) throw dbError;
    return data;
  },

  async checkDuplicate(hash: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .eq('hash', hash)
      .limit(1);

    if (error) throw error;
    return (data || []).length > 0;
  },

  async updateDocument(id: string, updates: Partial<LegalDocument>) {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LegalDocument;
  }
};
