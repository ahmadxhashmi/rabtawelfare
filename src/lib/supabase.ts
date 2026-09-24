import { createClient } from "@supabase/supabase-js";
import { BloodRequest, VolunteerDonor, AuditLog, RequestStage } from "../types";

// Read Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith("http") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseUrl.includes("your-project-id")
  );
};

// Create Supabase client instance (with dummy fallback if env not configured yet to prevent crash)
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://dummyproject.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "dummy-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// -------------------------------------------------------------
// Authentication Helpers
// -------------------------------------------------------------
export const authSignIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    // Development / Offline Fallback
    if (email.toLowerCase() === "admin@rabtaehayat.pk" && password === "Rabta2026!") {
      return {
        data: {
          user: { id: "offline-admin", email: "admin@rabtaehayat.pk" },
          session: { access_token: "offline-jwt-token" },
        },
        error: null,
      };
    }
    return { data: null, error: { message: "Invalid credentials or database not configured." } };
  }
  return await supabase.auth.signInWithPassword({ email, password });
};

export const authSignUp = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: "Database not configured." } };
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "admin_coordinator",
      },
    },
  });
};

export const authSignOut = async () => {
  if (!isSupabaseConfigured()) return { error: null };
  return await supabase.auth.signOut();
};

export const authGetSession = async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (err) {
    console.error("Auth session error:", err);
    return null;
  }
};

export const authGetUser = async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (err) {
    console.error("Auth user error:", err);
    return null;
  }
};


// Map DB row to TypeScript BloodRequest
export const mapDbToBloodRequest = (row: any): BloodRequest => ({
  id: row.id,
  patientName: row.patient_name,
  attendantName: row.attendant_name || "Web Applicant",
  contact: row.contact,
  cnic: row.cnic || "Online Portal Request",
  city: row.city,
  sector: row.sector || "",
  hospital: row.hospital,
  bloodGroup: row.blood_group,
  units: Number(row.units) || 1,
  severity: row.severity,
  caseType: row.case_type || "General Emergency",
  physicianOrder: Boolean(row.physician_order),
  familyConsent: Boolean(row.family_consent),
  dataConsent: Boolean(row.data_consent),
  notes: row.notes || "",
  stage: (row.stage === "Closed" || row.stage === "Rejected" ? row.stage : "Active") as RequestStage,
  assignedVolunteerId: row.assigned_volunteer_id || null,
  assignedVolunteerName: row.assigned_volunteer_name || undefined,
  assignedVolunteerPhone: row.assigned_volunteer_phone || undefined,
  urgencyDeadline: row.urgency_deadline || undefined,
  createdAt: row.created_at,
});

// Map TypeScript BloodRequest to DB row
export const mapBloodRequestToDb = (req: BloodRequest) => ({
  id: req.id,
  patient_name: req.patientName,
  attendant_name: req.attendantName,
  contact: req.contact,
  cnic: req.cnic,
  city: req.city,
  sector: req.sector,
  hospital: req.hospital,
  blood_group: req.bloodGroup,
  units: req.units,
  severity: req.severity,
  case_type: req.caseType,
  physician_order: req.physicianOrder,
  family_consent: req.familyConsent,
  data_consent: req.dataConsent,
  notes: req.notes,
  stage: req.stage,
  assigned_volunteer_id: req.assignedVolunteerId,
  assigned_volunteer_name: req.assignedVolunteerName || null,
  assigned_volunteer_phone: req.assignedVolunteerPhone || null,
  urgency_deadline: req.urgencyDeadline || null,
  created_at: req.createdAt,
});

// Map DB row to VolunteerDonor
export const mapDbToVolunteer = (row: any): VolunteerDonor => ({
  id: row.id,
  fullName: row.full_name,
  phone: row.phone,
  cnic: row.cnic || "Direct Web Registration",
  city: row.city,
  sector: row.sector || "Online Lifesaver Network",
  bloodGroup: row.blood_group,
  lastDonation: row.last_donation || new Date().toISOString().slice(0, 10),
  donationCount: Number(row.donation_count) || 1,
  availableNow: Boolean(row.available_now),
  medicallyFit: Boolean(row.medically_fit),
  dataConsent: Boolean(row.data_consent),
  verified: Boolean(row.verified),
  badgeLevel: row.badge_level || "Silver Guardian",
  affiliatedUniversityOrOrg: row.affiliated_university_or_org || undefined,
  createdAt: row.created_at,
});

// Map VolunteerDonor to DB row
export const mapVolunteerToDb = (vol: VolunteerDonor) => ({
  id: vol.id,
  full_name: vol.fullName,
  phone: vol.phone,
  cnic: vol.cnic,
  city: vol.city,
  sector: vol.sector,
  blood_group: vol.bloodGroup,
  last_donation: vol.lastDonation,
  donation_count: vol.donationCount,
  available_now: vol.availableNow,
  medically_fit: vol.medicallyFit,
  data_consent: vol.dataConsent,
  verified: vol.verified,
  badge_level: vol.badgeLevel,
  affiliated_university_or_org: vol.affiliatedUniversityOrOrg || null,
  created_at: vol.createdAt,
});

// Map DB row to AuditLog
export const mapDbToAuditLog = (row: any): AuditLog => ({
  id: row.id,
  actor: row.actor,
  action: row.action,
  target: row.target,
  timestamp: row.created_at,
});

// -------------------------------------------------------------
// Database Async API Helpers
// -------------------------------------------------------------

export const dbFetchRequests = async (): Promise<BloodRequest[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbToBloodRequest);
  } catch (err) {
    console.error("Supabase fetch requests error:", err);
    return null;
  }
};

export const dbInsertRequest = async (req: BloodRequest): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("blood_requests").upsert(mapBloodRequestToDb(req));
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase insert request error:", err);
    return false;
  }
};

export const dbUpdateRequestStage = async (id: string, stage: RequestStage): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase
      .from("blood_requests")
      .update({ stage })
      .eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase update request stage error:", err);
    return false;
  }
};

export const dbAssignDonor = async (
  id: string,
  donor: VolunteerDonor | null
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const payload = donor
      ? {
          assigned_volunteer_id: donor.id,
          assigned_volunteer_name: donor.fullName,
          assigned_volunteer_phone: donor.phone,
        }
      : {
          assigned_volunteer_id: null,
          assigned_volunteer_name: null,
          assigned_volunteer_phone: null,
        };

    const { error } = await supabase.from("blood_requests").update(payload).eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase assign donor error:", err);
    return false;
  }
};

export const dbDeleteRequest = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("blood_requests").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase delete request error:", err);
    return false;
  }
};

export const dbFetchVolunteers = async (): Promise<VolunteerDonor[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("volunteer_donors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbToVolunteer);
  } catch (err) {
    console.error("Supabase fetch volunteers error:", err);
    return null;
  }
};

export const dbInsertVolunteer = async (vol: VolunteerDonor): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("volunteer_donors").upsert(mapVolunteerToDb(vol));
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase insert volunteer error:", err);
    return false;
  }
};

export const dbUpdateVolunteer = async (id: string, updates: Partial<any>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("volunteer_donors").update(updates).eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase update volunteer error:", err);
    return false;
  }
};

export const dbDeleteVolunteer = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("volunteer_donors").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase delete volunteer error:", err);
    return false;
  }
};

export const dbFetchAuditLogs = async (): Promise<AuditLog[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []).map(mapDbToAuditLog);
  } catch (err) {
    console.error("Supabase fetch audit logs error:", err);
    return null;
  }
};

export const dbInsertAuditLog = async (log: {
  id: string;
  actor: string;
  action: string;
  target: string;
}): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await supabase.from("audit_logs").insert({
      id: log.id,
      actor: log.actor,
      action: log.action,
      target: log.target,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Supabase insert audit log error:", err);
    return false;
  }
};

// -------------------------------------------------------------
// Realtime Subscriptions (For live dashboard updates)
// -------------------------------------------------------------
export const subscribeToRealtimeChanges = (
  onTableChange: (table: string, payload: any) => void
) => {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel("rabta_realtime_db")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "blood_requests" },
      (payload) => onTableChange("blood_requests", payload)
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "volunteer_donors" },
      (payload) => onTableChange("volunteer_donors", payload)
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "audit_logs" },
      (payload) => onTableChange("audit_logs", payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
