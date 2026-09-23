import { BloodRequest, VolunteerDonor, AuditLog, CityName, BloodGroup, RequestStage, Severity } from "../types";
import { INITIAL_REQUESTS, INITIAL_VOLUNTEERS } from "../data/twinCityData";

const STORAGE_KEYS = {
  REQUESTS: "rabta_requests_v2",
  VOLUNTEERS: "rabta_volunteers_v2",
  LOGS: "rabta_audit_logs_v2",
  AUTH: "rabta_admin_authenticated_v2",
};

// Safe JSON loader
const getStoredData = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading ${key} from storage:`, err);
    return fallback;
  }
};

const setStoredData = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for real-time tab sync
    window.dispatchEvent(new CustomEvent("rabta_data_updated", { detail: { key } }));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
};

// Loaders
export const loadAllRequests = (): BloodRequest[] => {
  const reqs = getStoredData<BloodRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  if (!Array.isArray(reqs)) return INITIAL_REQUESTS;
  return reqs.map((r) => ({
    ...r,
    stage: (r.stage === "Closed" || r.stage === "Rejected" ? r.stage : "Active") as RequestStage,
  }));
};

export const loadAllVolunteers = (): VolunteerDonor[] => {
  const v = getStoredData<VolunteerDonor[]>(STORAGE_KEYS.VOLUNTEERS, INITIAL_VOLUNTEERS);
  return Array.isArray(v) ? v : INITIAL_VOLUNTEERS;
};

export const loadAuditLogs = (): AuditLog[] => {
  const initialLogs: AuditLog[] = [
    {
      id: "LOG-1001",
      actor: "System Dispatcher",
      action: "Initialized All-Pakistan Blood Coordination Network",
      target: "System Core",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "LOG-1002",
      actor: "admin@rabtaehayat.pk",
      action: "Verified standby volunteers in Rawalpindi & Islamabad",
      target: "Volunteers Registry",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
  return getStoredData<AuditLog[]>(STORAGE_KEYS.LOGS, initialLogs);
};

// Add Audit Log
export const addAuditLog = (action: string, target: string, actor = "admin@rabtaehayat.pk"): void => {
  const logs = loadAuditLogs();
  const newLog: AuditLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    actor,
    action,
    target,
    timestamp: new Date().toISOString(),
  };
  setStoredData(STORAGE_KEYS.LOGS, [newLog, ...logs.slice(0, 49)]); // keep recent 50
};

// Requests CRUD
export const saveRequest = (req: BloodRequest): void => {
  const requests = loadAllRequests();
  const existingIdx = requests.findIndex((r) => r.id === req.id);
  if (existingIdx >= 0) {
    requests[existingIdx] = req;
    addAuditLog(`Updated request details for ${req.patientName}`, req.id);
  } else {
    requests.unshift(req);
    addAuditLog(`Created new emergency request for ${req.patientName} (${req.bloodGroup})`, req.id);
  }
  setStoredData(STORAGE_KEYS.REQUESTS, requests);
};

export const updateRequestStage = (requestId: string, nextStage: RequestStage): void => {
  const requests = loadAllRequests();
  const target = requests.find((r) => r.id === requestId);
  if (target) {
    const oldStage = target.stage;
    target.stage = nextStage;
    setStoredData(STORAGE_KEYS.REQUESTS, [...requests]);
    addAuditLog(`Changed status of ${target.patientName} from ${oldStage} to ${nextStage}`, requestId);
  }
};

export const assignDonorToRequest = (requestId: string, donor: VolunteerDonor | null): void => {
  const requests = loadAllRequests();
  const target = requests.find((r) => r.id === requestId);
  if (target) {
    if (donor) {
      target.assignedVolunteerId = donor.id;
      target.assignedVolunteerName = donor.fullName;
      target.assignedVolunteerPhone = donor.phone;
      if (target.stage === "Submitted" || target.stage === "Screening") {
        target.stage = "Matched";
      }
      addAuditLog(`Assigned donor ${donor.fullName} to request ${target.id}`, target.id);
    } else {
      target.assignedVolunteerId = null;
      target.assignedVolunteerName = undefined;
      target.assignedVolunteerPhone = undefined;
      addAuditLog(`Unassigned donor from request ${target.id}`, target.id);
    }
    setStoredData(STORAGE_KEYS.REQUESTS, [...requests]);
  }
};

export const deleteRequest = (requestId: string): void => {
  const requests = loadAllRequests();
  const filtered = requests.filter((r) => r.id !== requestId);
  setStoredData(STORAGE_KEYS.REQUESTS, filtered);
  addAuditLog(`Deleted blood request record`, requestId);
};

// Volunteers CRUD
export const saveVolunteer = (vol: VolunteerDonor): void => {
  const volunteers = loadAllVolunteers();
  const existingIdx = volunteers.findIndex((v) => v.id === vol.id);
  if (existingIdx >= 0) {
    volunteers[existingIdx] = vol;
    addAuditLog(`Updated volunteer record for ${vol.fullName}`, vol.id);
  } else {
    volunteers.unshift(vol);
    addAuditLog(`Registered new volunteer donor ${vol.fullName} (${vol.bloodGroup}, ${vol.city})`, vol.id);
  }
  setStoredData(STORAGE_KEYS.VOLUNTEERS, volunteers);
};

export const toggleVolunteerVerification = (volunteerId: string): void => {
  const volunteers = loadAllVolunteers();
  const target = volunteers.find((v) => v.id === volunteerId);
  if (target) {
    target.verified = !target.verified;
    setStoredData(STORAGE_KEYS.VOLUNTEERS, [...volunteers]);
    addAuditLog(`Marked donor ${target.fullName} as ${target.verified ? "Verified" : "Unverified"}`, target.id);
  }
};

export const toggleVolunteerAvailability = (volunteerId: string): void => {
  const volunteers = loadAllVolunteers();
  const target = volunteers.find((v) => v.id === volunteerId);
  if (target) {
    target.availableNow = !target.availableNow;
    setStoredData(STORAGE_KEYS.VOLUNTEERS, [...volunteers]);
    addAuditLog(`Toggled availability of ${target.fullName} to ${target.availableNow ? "Available" : "Standby"}`, target.id);
  }
};

export const deleteVolunteer = (volunteerId: string): void => {
  const volunteers = loadAllVolunteers();
  const filtered = volunteers.filter((v) => v.id !== volunteerId);
  setStoredData(STORAGE_KEYS.VOLUNTEERS, filtered);
  addAuditLog(`Removed donor from volunteer registry`, volunteerId);
};

// Reset to factory defaults
export const resetToDefaults = (): void => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(INITIAL_VOLUNTEERS));
  addAuditLog("Reset database to initial baseline records", "System Core");
  window.dispatchEvent(new CustomEvent("rabta_data_updated", { detail: { reset: true } }));
};

// Auth helper - Default to unlocked so navigating to /admin immediately opens dashboard
export const checkAdminAuth = (): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const isLocked = sessionStorage.getItem("rabta_admin_locked") === "true";
    return !isLocked;
  } catch {
    return true;
  }
};

export const setAdminAuth = (authenticated: boolean): void => {
  if (typeof window === "undefined") return;
  try {
    if (authenticated) {
      sessionStorage.removeItem("rabta_admin_locked");
    } else {
      sessionStorage.setItem("rabta_admin_locked", "true");
    }
  } catch (err) {
    console.error("Storage error:", err);
  }
};
