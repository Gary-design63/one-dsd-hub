// Supabase Edge Function: validate-token
// Server-side Microsoft Entra ID (Azure AD) JWT validation
// This runs on Supabase infrastructure - NOT in the browser
//
// Validates:
// 1. JWT signature against Azure AD JWKS endpoint
// 2. Token issuer matches expected Azure AD tenant
// 3. Token audience matches registered app client ID
// 4. Token is not expired
// 5. User email is from an allowed domain

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const AZURE_TENANT_ID = Deno.env.get("AZURE_TENANT_ID") || "";
const AZURE_CLIENT_ID = Deno.env.get("AZURE_CLIENT_ID") || "";
const ALLOWED_DOMAINS = ["state.mn.us", "mn.gov"];

// Configurable CORS: set ALLOWED_ORIGINS as comma-separated list in Edge Function secrets.
// e.g. "https://your-app.example.com,https://staging.example.com"
// If not set, no cross-origin requests are allowed (no wildcard fallback).
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

// JWKS cache to avoid fetching on every request
let jwksCache: { keys: JsonWebKey[]; fetchedAt: number } | null = null;
const JWKS_CACHE_TTL_MS = 3600_000; // 1 hour

interface JWKSResponse {
  keys: Array<{
    kid: string;
    kty: string;
    use: string;
    n: string;
    e: string;
    x5c?: string[];
  }>;
}

interface TokenPayload {
  iss: string;
  aud: string;
  sub: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  exp: number;
  iat: number;
  tid?: string;
  roles?: string[];
}

// Clock skew tolerance for JWT expiration checks (5 minutes)
const CLOCK_SKEW_SECONDS = 300;

async function getAzureJWKS(): Promise<JWKSResponse> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return { keys: jwksCache.keys as JWKSResponse["keys"] };
  }

  const jwksUrl = AZURE_TENANT_ID
    ? `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`
    : "https://login.microsoftonline.com/common/discovery/v2.0/keys";

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }

  const jwks: JWKSResponse = await response.json();
  jwksCache = { keys: jwks.keys as unknown as JsonWebKey[], fetchedAt: Date.now() };
  return jwks;
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeJwtPayload(token: string): TokenPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
  return payload;
}

function getKidFromToken(token: string): string {
  const parts = token.split(".");
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
  return header.kid;
}

async function verifyTokenSignature(token: string, jwks: JWKSResponse): Promise<boolean> {
  const kid = getKidFromToken(token);
  const key = jwks.keys.find(k => k.kid === kid);

  if (!key) {
    throw new Error(`No matching key found for kid: ${kid}`);
  }

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    {
      kty: key.kty,
      n: key.n,
      e: key.e,
      alg: "RS256",
      use: "sig",
    },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const parts = token.split(".");
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = base64UrlDecode(parts[2]);

  return crypto.subtle.verify("RSASSA-PKCS1-v1_5", cryptoKey, signature, data);
}

function validateClaims(payload: TokenPayload): { valid: boolean; reason?: string } {
  // Check expiration (with clock skew tolerance)
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now - CLOCK_SKEW_SECONDS) {
    return { valid: false, reason: "Token expired" };
  }

  // Check issuer (if tenant is configured)
  if (AZURE_TENANT_ID) {
    const expectedIssuer = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`;
    if (payload.iss !== expectedIssuer) {
      return { valid: false, reason: `Invalid issuer: ${payload.iss}` };
    }
  }

  // Check audience (if client ID is configured)
  if (AZURE_CLIENT_ID) {
    if (payload.aud !== AZURE_CLIENT_ID) {
      return { valid: false, reason: `Invalid audience: ${payload.aud}` };
    }
  }

  // Check email domain
  const email = payload.email || payload.preferred_username || "";
  if (email) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (domain && !ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith(`.${d}`))) {
      return { valid: false, reason: `Email domain not allowed: ${domain}` };
    }
  }

  return { valid: true };
}

serve(async (req) => {
  const cors = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Token is required" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // If Azure AD is not configured, fall back to Supabase JWT validation only.
    // The client sends the Supabase session access_token which is a Supabase JWT,
    // and we validate it via supabase.auth.getUser().
    if (!AZURE_TENANT_ID && !AZURE_CLIENT_ID) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

      if (!supabaseUrl || !supabaseServiceKey) {
        return new Response(
          JSON.stringify({ valid: false, error: "Server configuration incomplete" }),
          { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return new Response(
          JSON.stringify({ valid: false, error: error?.message || "Invalid token" }),
          { status: 401, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
          },
        }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Full Azure AD JWT validation.
    // When Azure is configured, the client should extract the Azure provider token
    // from the Supabase session (session.provider_token) and send that here,
    // since session.access_token is a Supabase JWT, not an Azure AD JWT.
    //
    // The AuthContext sends session.provider_token when available (see AuthContext.tsx).
    const jwks = await getAzureJWKS();
    const signatureValid = await verifyTokenSignature(token, jwks);

    if (!signatureValid) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid token signature" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const payload = decodeJwtPayload(token);
    const claimsResult = validateClaims(payload);

    if (!claimsResult.valid) {
      return new Response(
        JSON.stringify({ valid: false, error: claimsResult.reason }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          id: payload.sub,
          email: payload.email || payload.preferred_username,
          name: payload.name,
          roles: payload.roles || [],
          tenantId: payload.tid,
        },
      }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Token validation error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: "Token validation failed" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
