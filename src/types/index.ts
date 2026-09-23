export type NavigationTab = 
  | "home" 
  | "request" 
  | "donors" 
  | "donate" 
  | "camps" 
  | "compatibility" 
  | "track" 
  | "donor-card" 
  | "legal"
  | "admin";

export type CityName = 
  | "Islamabad" 
  | "Rawalpindi" 
  | "Lahore" 
  | "Karachi" 
  | "Peshawar" 
  | "Multan" 
  | "Faisalabad" 
  | "Quetta" 
  | string;

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Severity = "Code Red" | "Urgent" | "Routine";

export type RequestStage = "Active" | "Closed" | "Rejected";

export interface BloodRequest {
  id: string;
  patientName: string;
  attendantName: string;
  contact: string;
  cnic: string;
  city: CityName;
  sector: string;
  hospital: string;
  bloodGroup: BloodGroup;
  units: number;
  severity: Severity;
  caseType: "Thalassemia" | "Trauma/Surgery" | "Oncology" | "Obstetrics/Delivery" | "General Emergency";
  physicianOrder: boolean;
  familyConsent: boolean;
  dataConsent: boolean;
  notes: string;
  stage: RequestStage;
  assignedVolunteerId: string | null;
  assignedVolunteerName?: string;
  assignedVolunteerPhone?: string;
  createdAt: string;
  urgencyDeadline?: string;
}

export interface VolunteerDonor {
  id: string;
  fullName: string;
  phone: string;
  cnic: string;
  city: CityName;
  sector: string;
  bloodGroup: BloodGroup;
  lastDonation: string;
  donationCount: number;
  availableNow: boolean;
  medicallyFit: boolean;
  dataConsent: boolean;
  verified: boolean;
  badgeLevel: "Bronze Hero" | "Silver Guardian" | "Gold Lifesaver" | "Platinum Champion";
  affiliatedUniversityOrOrg?: string;
  createdAt: string;
}

export interface BloodCamp {
  id: string;
  title: string;
  organizer: string;
  city: CityName;
  venue: string;
  sector: string;
  date: string;
  time: string;
  targetUnits: number;
  collectedUnits: number;
  coordinatorContact: string;
  status: "Upcoming" | "Active Today" | "Completed";
  registeredDonors: number;
  image: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface HospitalInfo {
  id: string;
  name: string;
  city: CityName;
  sector: string;
  type: "Public Tertiary" | "Private Specialist" | "Military / Forces" | "Autonomous Institute";
  hotline: string;
  bloodBankContact: string;
  hasComponentSeparation: boolean;
}

export interface BloodNeedLevel {
  bloodGroup: BloodGroup;
  status: "Critical Deficit" | "Low Stock" | "Adequate";
  unitsNeeded: number;
  urgency: "immediate" | "moderate" | "normal";
}
