import { createAdminClient } from "./supabase/admin";

export type AuditAction =
  | "CREATE_TOURNAMENT"
  | "UPDATE_TOURNAMENT"
  | "DELETE_TOURNAMENT"
  | "UPDATE_STATUS"
  | "SYNC_GOOGLE_SHEET"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED";

export interface AuditLogEntry {
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Persists an immutable audit log entry of an administrative write action.
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();
  const logPayload = {
    ...entry,
    timestamp,
  };

  // Structured console log for monitoring & log drains (Datadog/Logflare/Vercel)
  console.info(`[AUDIT_LOG] ${entry.action} by ${entry.actorEmail} on resource ${entry.resourceId || "N/A"}:`, JSON.stringify(logPayload));

  try {
    const adminSupabase = createAdminClient();
    if (adminSupabase) {
      const { error } = await adminSupabase.from("admin_audit_logs").insert({
        actor_id: entry.actorId,
        actor_email: entry.actorEmail,
        action: entry.action,
        resource_id: entry.resourceId || null,
        details: entry.details || {},
        ip_address: entry.ipAddress || "127.0.0.1",
        user_agent: entry.userAgent || "Unknown",
        created_at: timestamp,
      });

      if (error) {
        console.error("Failed to insert audit log entry to Supabase:", error.message);
      }
    }
  } catch (err) {
    console.error("Exception during audit logging:", err);
  }
}
