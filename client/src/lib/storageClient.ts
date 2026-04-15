// One DSD Equity Platform - Storage Client
// Primary: uploads via backend Express server (/api/upload)
// Fallback: Supabase Edge Function / direct Supabase Storage

import { supabase, isSupabaseAvailable } from "@/core/supabaseClient";

export interface UploadResult {
  url: string;
}

export interface FileInfo {
  name: string;
  size: number;
  createdAt: string;
}

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || "";
}

export async function uploadFile(
  file: File,
  path: string
): Promise<UploadResult> {
  // Primary: upload via backend Express server
  try {
    return await uploadViaBackend(file);
  } catch (err) {
    console.warn("Backend upload unavailable, trying Supabase fallback:", err);
  }

  // Fallback: Supabase Storage
  if (isSupabaseAvailable() && supabase) {
    return uploadFileDirect(file, path);
  }

  throw new Error("No storage service available. Ensure the backend server is running.");
}

// Upload via backend Express server
async function uploadViaBackend(file: File): Promise<UploadResult> {
  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Upload failed: ${errorData?.error || response.statusText}`);
  }

  const data = await response.json();
  return { url: `/uploads/${data.filename}` };
}

// Direct Supabase Storage upload (fallback when backend is not available)
async function uploadFileDirect(file: File, path: string): Promise<UploadResult> {
  if (!supabase) throw new Error("Supabase not available");

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = `${userId}/${path}`;

  const { error } = await supabase.storage
    .from("one-dsd-files")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from("one-dsd-files")
    .getPublicUrl(storagePath);

  return { url: urlData.publicUrl };
}

export async function downloadFile(path: string): Promise<Blob> {
  if (!supabase) throw new Error("Storage service unavailable");

  // Direct Supabase Storage download
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = `${userId}/${path}`;

  const { data, error } = await supabase.storage
    .from("one-dsd-files")
    .download(storagePath);

  if (error || !data) throw new Error(`Download failed: ${error?.message || "File not found"}`);
  return data;
}

export async function deleteFile(path: string): Promise<void> {
  if (!supabase) throw new Error("Storage service unavailable");

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = `${userId}/${path}`;

  const { error } = await supabase.storage
    .from("one-dsd-files")
    .remove([storagePath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function listFiles(prefix?: string): Promise<FileInfo[]> {
  if (!supabase) throw new Error("Storage service unavailable");

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || "anonymous";
  const storagePath = prefix ? `${userId}/${prefix}` : userId;

  const { data, error } = await supabase.storage
    .from("one-dsd-files")
    .list(storagePath);

  if (error) throw new Error(`List failed: ${error.message}`);

  return (data || []).map(f => ({
    name: f.name,
    size: f.metadata?.size || 0,
    createdAt: f.created_at || "",
  }));
}
