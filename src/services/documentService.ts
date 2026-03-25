import { supabase } from '@/lib/supabase';
import { LegalDocument, DocumentVersion } from '@/types/document';

export const documentService = {
  async getAllDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    // Map database fields to frontend types
    return (data || []).map(d => ({
      id: d.id,
      caseId: d.case_id,
      caseName: d.caseName || "General",
      fileName: d.file_name,
      fileType: d.file_type,
      documentType: d.document_type,
      size: d.size,
      uploadedAt: d.uploaded_at,
      uploadedBy: d.uploaded_by,
      versionNumber: d.version_number,
      status: d.status,
      tags: d.tags || [],
      aiSummary: d.ai_summary,
      aiKeywords: d.ai_keywords || [],
      riskClauses: d.risk_clauses || [],
      versions: d.versions || []
    })) as LegalDocument[];
  },

  async getDocumentsByCase(caseId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data as LegalDocument[];
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
    // 1. Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `documents/${docData.caseId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('legal-docs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('legal-docs')
      .getPublicUrl(filePath);

    // 3. Insert record into database
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert([{ ...docData, file_url: publicUrl, uploaded_at: new Date().toISOString() }])
      .select()
      .single();

    if (dbError) throw dbError;
    return data as LegalDocument;
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
