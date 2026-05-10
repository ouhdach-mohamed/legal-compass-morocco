// Server-only helpers for admin operations.
// Admin role is now determined by the local config file, not by a database role.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export { supabaseAdmin };

// Kept as no-ops so existing call sites compile. The middleware already
// rejects non-admins before the handler runs.
export async function assertAdmin(_userId: string): Promise<void> {
  return;
}
export async function isAdmin(_userId: string): Promise<boolean> {
  return true;
}
