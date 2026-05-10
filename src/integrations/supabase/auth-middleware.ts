// Local admin auth middleware.
// Replaces the previous Supabase-based auth: this project's admin panel is
// authenticated against a JSON config file (config/admin.config.json), not
// against Supabase Auth. The chatbot itself is unauthenticated.
//
// Client side: read the locally-stored admin token from localStorage and
// attach it as `x-admin-auth: Bearer <base64(email:password)>`.
// Server side: decode the header, verify against the config file, and expose
// the admin email on the server fn `context`.
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  decodeAdminToken,
  verifyAdminCredentials,
} from "@/lib/admin-config.server";

const TOKEN_KEY = "mla.admin.token";

export const requireSupabaseAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const headers = new Headers();
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (token) headers.set("x-admin-auth", `Bearer ${token}`);
    }
    return next({ headers });
  })
  .server(async ({ next }) => {
    const request = getRequest();
    if (!request?.headers) {
      throw new Response("Unauthorized: no request headers", { status: 401 });
    }
    const creds = decodeAdminToken(request.headers.get("x-admin-auth"));
    if (!creds) {
      throw new Response("Unauthorized: missing admin token", { status: 401 });
    }
    const ok = await verifyAdminCredentials(creds.email, creds.password);
    if (!ok) {
      throw new Response("Unauthorized: invalid admin credentials", { status: 401 });
    }
    return next({ context: { adminEmail: creds.email, userId: creds.email } });
  });
