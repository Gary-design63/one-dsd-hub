// Supabase Edge Function: blob-storage
// Server-side Azure Blob Storage operations
// Handles upload, download, delete, and list operations
// Requires authenticated user via Supabase auth

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Azure Blob Storage is DISABLED. All operations use Supabase Storage.
// The Azure Blob code path is retained but gated behind a flag that requires
// both AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_KEY to be set AND proper
// Azure SDK request signing to be implemented (the current simplified auth
// will 403 on Azure). See README or .env.example for details.
const AZURE_STORAGE_ACCOUNT = Deno.env.get("AZURE_STORAGE_ACCOUNT") || "";
const AZURE_STORAGE_KEY = Deno.env.get("AZURE_STORAGE_KEY") || "";
const AZURE_STORAGE_CONTAINER = Deno.env.get("AZURE_STORAGE_CONTAINER") || "one-dsd-files";

// Always use Supabase Storage: Azure Blob requires proper SharedKey/SAS signing
// which is not yet implemented. Force Supabase Storage as the only working backend.
const USE_SUPABASE_STORAGE = true;

const SUPABASE_STORAGE_BUCKET = "one-dsd-files";

// Max file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  "application/pdf",
  "application/json",
  "text/csv",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

// Configurable CORS: set ALLOWED_ORIGINS as comma-separated list in Edge Function secrets.
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

function errorResponse(status: number, message: string, cors: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { ...cors, "Content-Type": "application/json" } }
  );
}

// Allowed email domains for storage operations
const ALLOWED_EMAIL_DOMAINS = ["state.mn.us", "mn.gov"];

async function authenticateRequest(req: Request): Promise<{ userId: string; email: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) return null;

  // Enforce email domain — only allowed organization domains can access storage
  const email = user.email || "";
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || !ALLOWED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) {
    console.warn(`Storage access denied for email domain: ${domain}`);
    return null;
  }

  return { userId: user.id, email };
}

// --- Azure Blob Storage operations ---

async function azureRequest(
  method: string,
  path: string,
  body?: Uint8Array | null,
  contentType?: string
): Promise<Response> {
  const now = new Date().toUTCString();
  const url = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_STORAGE_CONTAINER}/${path}`;

  // Simplified SAS-based auth for Azure Blob Storage
  // In production, use Azure.Identity or generate SAS tokens server-side
  const headers: Record<string, string> = {
    "x-ms-date": now,
    "x-ms-version": "2023-11-03",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  if (body) {
    headers["Content-Length"] = String(body.length);
  }

  return fetch(url, {
    method,
    headers,
    body: body || undefined,
  });
}

// --- Supabase Storage fallback operations ---

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

async function uploadToSupabase(
  filePath: string,
  fileData: Uint8Array,
  contentType: string,
  userId: string
): Promise<{ url: string }> {
  const supabase = getSupabaseAdmin();

  const storagePath = `${userId}/${filePath}`;
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, fileData, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return { url: urlData.publicUrl };
}

async function downloadFromSupabase(filePath: string, userId: string): Promise<{ data: Uint8Array; contentType: string }> {
  const supabase = getSupabaseAdmin();
  const storagePath = `${userId}/${filePath}`;

  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .download(storagePath);

  if (error || !data) throw new Error(`Download failed: ${error?.message || "File not found"}`);

  const arrayBuffer = await data.arrayBuffer();
  return {
    data: new Uint8Array(arrayBuffer),
    contentType: data.type || "application/octet-stream",
  };
}

async function deleteFromSupabase(filePath: string, userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const storagePath = `${userId}/${filePath}`;

  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

async function listFromSupabase(prefix: string, userId: string): Promise<Array<{ name: string; size: number; createdAt: string }>> {
  const supabase = getSupabaseAdmin();
  const storagePath = prefix ? `${userId}/${prefix}` : userId;

  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .list(storagePath);

  if (error) throw new Error(`List failed: ${error.message}`);

  return (data || []).map(f => ({
    name: f.name,
    size: f.metadata?.size || 0,
    createdAt: f.created_at || "",
  }));
}

// --- Request handler ---

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  // Authenticate
  const authUser = await authenticateRequest(req);
  if (!authUser) {
    return errorResponse(401, "Authentication required", cors);
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "upload": {
        if (req.method !== "POST") return errorResponse(405, "POST required for upload", cors);

        const contentType = req.headers.get("content-type") || "";
        const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
        const filePath = url.searchParams.get("path");

        if (!filePath) return errorResponse(400, "File path is required", cors);
        if (contentLength > MAX_FILE_SIZE) return errorResponse(413, "File too large (max 50MB)", cors);

        // Validate MIME type from the actual content type or the query param
        const mimeType = url.searchParams.get("type") || contentType.split(";")[0];
        if (mimeType && !ALLOWED_TYPES.includes(mimeType)) {
          return errorResponse(415, `File type not allowed: ${mimeType}`, cors);
        }

        const body = new Uint8Array(await req.arrayBuffer());

        // Always uses Supabase Storage (Azure Blob is disabled)
        const result = await uploadToSupabase(filePath, body, mimeType, authUser.userId);
        return new Response(JSON.stringify(result), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      case "download": {
        const filePath = url.searchParams.get("path");
        if (!filePath) return errorResponse(400, "File path is required", cors);

        const { data, contentType } = await downloadFromSupabase(filePath, authUser.userId);
        return new Response(data, {
          headers: {
            ...cors,
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filePath.split("/").pop()}"`,
          },
        });
      }

      case "delete": {
        if (req.method !== "DELETE") return errorResponse(405, "DELETE method required", cors);

        const filePath = url.searchParams.get("path");
        if (!filePath) return errorResponse(400, "File path is required", cors);

        await deleteFromSupabase(filePath, authUser.userId);
        return new Response(JSON.stringify({ deleted: true }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      case "list": {
        const prefix = url.searchParams.get("prefix") || "";

        const files = await listFromSupabase(prefix, authUser.userId);
        return new Response(JSON.stringify({ files }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      default:
        return errorResponse(400, "Invalid action. Use: upload, download, delete, list", cors);
    }
  } catch (err) {
    console.error("Blob storage error:", err);
    return errorResponse(500, err instanceof Error ? err.message : "Internal server error", cors);
  }
});
