import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { 
  BloodRequest, 
  VolunteerDonor, 
  BloodGroup, 
  CityName, 
  RequestStage, 
  Severity 
} from "../../types";
import { 
  loadAllRequests, 
  loadAllVolunteers, 
  saveRequest, 
  deleteRequest, 
  saveVolunteer, 
  deleteVolunteer,
  checkAdminAuth,
  setAdminAuth,
  resetToDefaults
} from "../../utils/adminStorage";
import { 
  LayoutDashboard,
  Users,
  Droplet,
  Calendar,
  Share2,
  Settings,
  Search, 
  Plus, 
  Trash2, 
  Phone, 
  MessageCircle, 
  ArrowLeft, 
  LogOut, 
  X, 
  Check, 
  Download, 
  RefreshCw,
  Copy,
  AlertTriangle,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Flame,
  Activity,
  Heart
} from "lucide-react";

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

const PAKISTAN_CITIES: CityName[] = [
  "Islamabad",
  "Rawalpindi",
  "Lahore",
  "Karachi",
  "Peshawar",
  "Multan",
  "Faisalabad",
  "Quetta",
];

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkAdminAuth());
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Active navigation section matching Figma sidebar:
  // overview | requests | donors | inventory | campaigns | broadcast | settings
  const [activeNav, setActiveNav] = useState<
    "overview" | "requests" | "donors" | "inventory" | "campaigns" | "broadcast" | "settings"
  >("overview");

  // Core Data
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerDonor[]>([]);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [groupFilter, setGroupFilter] = useState<string>("All");
  const [stageFilter, setStageFilter] = useState<string>("All");

  // Modals
  const [showAddRequest, setShowAddRequest] = useState(false);
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [assigningCase, setAssigningCase] = useState<BloodRequest | null>(null);

  // Request Form
  const [reqPatient, setReqPatient] = useState("");
  const [reqAttendant, setReqAttendant] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqHospital, setReqHospital] = useState("");
  const [reqCity, setReqCity] = useState<CityName>("Rawalpindi");
  const [reqBlood, setReqBlood] = useState<BloodGroup>("O+");
  const [reqUnits, setReqUnits] = useState(2);
  const [reqSeverity, setReqSeverity] = useState<Severity>("Code Red");
  const [reqNotes, setReqNotes] = useState("");

  // Donor Form
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorCity, setDonorCity] = useState<CityName>("Islamabad");
  const [donorBlood, setDonorBlood] = useState<BloodGroup>("O+");
  const [donorSector, setDonorSector] = useState("");

  // Broadcast
  const [bcGroup, setBcGroup] = useState<BloodGroup>("O-");
  const [bcCity, setBcCity] = useState<string>("Rawalpindi");
  const [bcHospital, setBcHospital] = useState("Holy Family Hospital");
  const [bcUnits, setBcUnits] = useState(2);
  const [copied, setCopied] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const refreshData = () => {
    setRequests(loadAllRequests());
    setVolunteers(loadAllVolunteers());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("rabta_data_updated", refreshData);

    const prevBg = document.body.style.backgroundColor;
    const prevColor = document.body.style.color;
    document.body.style.backgroundColor = "#F6F7F9";
    document.body.style.color = "#1C1917";
    document.title = "Rabta-e-Hayat™ | Operations Desk (Admin)";

    return () => {
      window.removeEventListener("rabta_data_updated", refreshData);
      document.body.style.backgroundColor = prevBg;
      document.body.style.color = prevColor;
      document.title = "Rabta-e-Hayat™ | ایک قدم انسانیت کے لیے";
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "4455" || pinInput === "admin") {
      setAdminAuth(true);
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setAdminAuth(false);
    setIsAuthenticated(false);
    setPinInput("");
  };

  const waLink = (phone: string, text: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    const formatted = clean.startsWith("92") ? clean : `92${clean.replace(/^0/, "")}`;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
  };

  // Metrics
  const activeRequests = useMemo(() => {
    return requests.filter((r) => r.stage === "Active");
  }, [requests]);

  const closedRequests = useMemo(() => {
    return requests.filter((r) => r.stage === "Closed");
  }, [requests]);

  const rejectedRequests = useMemo(() => {
    return requests.filter((r) => r.stage === "Rejected");
  }, [requests]);

  const codeRedCases = useMemo(() => {
    return requests.filter((r) => r.severity === "Code Red" && r.stage === "Active");
  }, [requests]);

  const readyDonors = useMemo(() => {
    return volunteers.filter((v) => v.availableNow);
  }, [volunteers]);

  // Blood Inventory calculation matching Figma visualizer
  const inventoryStock = useMemo(() => {
    return BLOOD_GROUPS.map((bg) => {
      const unitsNeeded = activeRequests
        .filter((r) => r.bloodGroup === bg)
        .reduce((sum, r) => sum + r.units, 0);
      const availableDonors = readyDonors.filter((v) => v.bloodGroup === bg).length;
      
      let status: "Critical" | "Low" | "Adequate" = "Adequate";
      let percentage = 75;

      if (availableDonors === 0 && unitsNeeded > 0) {
        status = "Critical";
        percentage = 15;
      } else if (availableDonors <= unitsNeeded) {
        status = "Low";
        percentage = 40;
      } else {
        percentage = Math.min(85, availableDonors * 20);
      }

      return {
        group: bg,
        unitsNeeded,
        availableDonors,
        status,
        percentage,
      };
    });
  }, [activeRequests, readyDonors]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchCity = cityFilter === "All" || r.city === cityFilter;
      const matchGroup = groupFilter === "All" || r.bloodGroup === groupFilter;
      const matchStage = stageFilter === "All" || r.stage === stageFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.patientName.toLowerCase().includes(q) ||
        r.hospital.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.contact.includes(q) ||
        r.id.toLowerCase().includes(q);
      return matchCity && matchGroup && matchStage && matchSearch;
    });
  }, [requests, cityFilter, groupFilter, stageFilter, search]);

  // Filtered donors
  const filteredDonors = useMemo(() => {
    return volunteers.filter((v) => {
      const matchCity = cityFilter === "All" || v.city === cityFilter;
      const matchGroup = groupFilter === "All" || v.bloodGroup === groupFilter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        v.fullName.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.bloodGroup.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.id.toLowerCase().includes(q);
      return matchCity && matchGroup && matchSearch;
    });
  }, [volunteers, cityFilter, groupFilter, search]);

  // Handlers
  const handleCreateRequest = (e: FormEvent) => {
    e.preventDefault();
    if (!reqPatient || !reqPhone || !reqHospital) return;

    saveRequest({
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: reqPatient,
      attendantName: reqAttendant || "Family Attendant",
      contact: reqPhone,
      cnic: "-",
      city: reqCity,
      sector: reqHospital,
      hospital: reqHospital,
      bloodGroup: reqBlood,
      units: reqUnits,
      severity: reqSeverity,
      caseType: "General Emergency",
      physicianOrder: true,
      familyConsent: true,
      dataConsent: true,
      notes: reqNotes,
      stage: "Active",
      assignedVolunteerId: null,
      createdAt: new Date().toISOString(),
    });

    setReqPatient("");
    setReqAttendant("");
    setReqPhone("");
    setReqHospital("");
    setReqNotes("");
    setShowAddRequest(false);
    refreshData();
    notify("Emergency request registered");
  };

  const handleCreateDonor = (e: FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorPhone) return;

    saveVolunteer({
      id: `DON-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: donorName,
      phone: donorPhone,
      cnic: "-",
      city: donorCity,
      sector: donorSector || "General Area",
      bloodGroup: donorBlood,
      lastDonation: new Date().toISOString().slice(0, 10),
      donationCount: 1,
      availableNow: true,
      medicallyFit: true,
      dataConsent: true,
      verified: true,
      badgeLevel: "Silver Guardian",
      createdAt: new Date().toISOString(),
    });

    setDonorName("");
    setDonorPhone("");
    setDonorSector("");
    setShowAddDonor(false);
    refreshData();
    notify("Volunteer donor registered");
  };

  const generatedBroadcast = useMemo(() => {
    return `🚨 URGENT CODE RED BLOOD ALERT
Rabta-e-Hayat Welfare Organization (رابطہ حیات)

• Blood Group: ${bcGroup}
• Required Units: ${bcUnits} Unit(s)
• Hospital: ${bcHospital} (${bcCity})
• Emergency Desk Hotline: +92 310 5290577

ایک انسانی جان بچانے کے لیے فوری رابطہ فرمائیں۔
Official Welfare Email: welfarerabta@gmail.com`;
  }, [bcGroup, bcUnits, bcHospital, bcCity]);

  const handleExport = () => {
    const data = JSON.stringify({ requests, volunteers }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rabta_records_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    notify("Database records exported");
  };

  // ==========================================
  // 1. PIN LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1C1917] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm p-8 rounded-2xl bg-white border border-[#E5E5E8] shadow-[0_8px_30px_rgba(0,0,0,0.06)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F2]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#800000] text-white flex items-center justify-center font-bold text-sm shadow">
                RH
              </div>
              <div>
                <h1 className="text-sm font-semibold text-[#1C1917]">Rabta-e-Hayat</h1>
                <p className="text-[11px] text-[#78716C]">Operations Desk</p>
              </div>
            </div>
            <button
              onClick={onExitAdmin}
              className="text-xs text-[#78716C] hover:text-[#1C1917] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Website</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#44403C] mb-1.5">Enter Coordinator PIN</label>
              <input
                type="password"
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D1D1D6] text-[#1C1917] bg-[#FAFAFA] text-sm focus:outline-none focus:border-[#800000] focus:bg-white tracking-widest font-mono transition-colors"
              />
              {pinError && (
                <p className="text-[11px] text-red-600 mt-1.5">Invalid PIN. Try 4455</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#800000] hover:bg-[#680000] text-white font-medium text-xs transition-colors cursor-pointer shadow-sm"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              onClick={() => {
                setAdminAuth(true);
                setIsAuthenticated(true);
              }}
              className="text-[11px] text-[#A8A29E] hover:text-[#44403C] font-mono transition-colors"
            >
              [ 1-Click Demo PIN: 4455 ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. FIGMA-MATCHED DASHBOARD LAYOUT
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#1C1917] font-sans text-xs flex">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1917] text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-fadeIn border border-white/10">
          <Check size={13} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FIGMA COMPONENT 1: LEFT DARK BURGUNDY SIDEBAR                  */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-60 bg-[#2D0A0E] text-white flex flex-col justify-between shrink-0 select-none shadow-xl">
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#800000] border border-white/20 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              RH
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight text-white">Rabta-e-Hayat</div>
              <div className="text-[10px] text-white/50">Blood Welfare Desk</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => { setActiveNav("overview"); setSearch(""); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "overview"
                  ? "bg-[#800000] text-white font-semibold shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => { setActiveNav("requests"); setSearch(""); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "requests"
                  ? "bg-[#800000] text-white font-semibold shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart size={15} />
                <span>Blood Requests</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/15 text-white">
                {requests.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveNav("donors"); setSearch(""); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "donors"
                  ? "bg-[#800000] text-white font-semibold shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={15} />
                <span>Donors Directory</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/15 text-white">
                {volunteers.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveNav("inventory"); setSearch(""); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "inventory"
                  ? "bg-[#800000] text-white font-semibold shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Droplet size={15} />
              <span>Blood Inventory</span>
            </button>

            <button
              onClick={() => { setActiveNav("campaigns"); setSearch(""); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "campaigns"
                  ? "bg-[#800000] text-white font-semibold shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Calendar size={15} />
              <span>Blood Camps</span>
            </button>

            <button
              onClick={() => { setActiveNav("broadcast"); setSearch(""); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "broadcast"
                  ? "bg-[#800000] text-white font-semibold shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Share2 size={15} />
              <span>Emergency Alert</span>
            </button>

            <button
              onClick={() => { setActiveNav("settings"); setSearch(""); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "settings"
                  ? "bg-[#800000] text-white font-semibold shadow"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings size={15} />
              <span>Desk Info &amp; Logs</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-300/70 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Lock Session</span>
          </button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEW AREA                                                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* FIGMA COMPONENT 2: TOP WHITE HEADER BAR */}
        <header className="bg-white border-b border-[#E5E7EB] px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs font-semibold text-[#111827] flex items-center gap-2">
                <span>Good day, Coordinator</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Desk
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">
                Wednesday, September 23, 2026 • Organization: Rabta-e-Hayat Desk
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-lg border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] active:scale-[0.98] text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download size={13} />
              <span>Export Report</span>
            </button>

            <button
              onClick={() => setShowAddRequest(true)}
              className="px-4 py-2 rounded-lg bg-[#800000] hover:bg-[#680000] active:scale-[0.98] text-white text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={14} />
              <span>Register Patient</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="p-6 space-y-6 max-w-7xl">
          {/* ========================================================= */}
          {/* VIEW: OVERVIEW (Figma Dashboard Home)                     */}
          {/* ========================================================= */}
          {activeNav === "overview" && (
            <div className="space-y-6">
              {/* FIGMA COMPONENT 3: 4 KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span className="text-xs font-medium text-[#4B5563]">Active Requests</span>
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#800000] flex items-center justify-center transition-colors group-hover:bg-red-100">
                      <Flame size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#111827] font-mono mt-2.5">
                    {activeRequests.length}
                  </div>
                  <div className="text-[11px] text-[#800000] font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#800000]" />
                    <span>Needs immediate donor match</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span className="text-xs font-medium text-[#4B5563]">Standby Donors</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#111827] font-mono mt-2.5">
                    {readyDonors.length}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Available across Pakistan</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span className="text-xs font-medium text-[#4B5563]">Fulfilled (Closed)</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center transition-colors group-hover:bg-blue-100">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#111827] font-mono mt-2.5">
                    {closedRequests.length}
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Transfusion completed</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-[#D1D5DB] transition-all duration-200 flex flex-col justify-between group">
                  <div className="flex items-center justify-between text-[#6B7280]">
                    <span className="text-xs font-medium text-[#4B5563]">Rejected Cases</span>
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center transition-colors group-hover:bg-stone-200">
                      <XCircle size={16} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#111827] font-mono mt-2.5">
                    {rejectedRequests.length}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                    <span>Cancelled or ineligible</span>
                  </div>
                </div>
              </div>

              {/* FIGMA COMPONENT 4: BLOOD INVENTORY STATUS VISUALIZER */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
                  <div>
                    <h2 className="text-sm font-semibold text-[#111827]">
                      Blood Inventory Supply Status (All-Pakistan)
                    </h2>
                    <p className="text-xs text-[#6B7280]">
                      Current reserves and donor availability index by blood group
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav("inventory")}
                    className="text-xs font-medium text-[#800000] hover:underline cursor-pointer"
                  >
                    View Full Inventory →
                  </button>
                </div>

                {/* 8 Horizontal Progress Rows Matching Figma */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
                  {inventoryStock.map((item) => (
                    <div key={item.group} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#111827] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                            {item.group}
                          </span>
                          <span className="text-[#6B7280] text-[11px]">
                            ({item.availableDonors} donors available, {item.unitsNeeded} units needed)
                          </span>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status === "Critical"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : item.status === "Low"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "Critical"
                              ? "bg-red-600 animate-pulse"
                              : item.status === "Low"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`} />
                          {item.status}
                        </span>
                      </div>

                      {/* Horizontal progress bar */}
                      <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.status === "Critical"
                              ? "bg-red-600"
                              : item.status === "Low"
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FIGMA COMPONENT 5: LIVE URGENT NOTIFICATION STRIPS */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-900 text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                    <span>
                      <strong>Critical Code Red:</strong> Emergency 2 units O- required at Holy Family Hospital, Rawalpindi.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveNav("broadcast")}
                    className="font-semibold text-red-800 hover:text-red-950 hover:underline text-[11px] cursor-pointer whitespace-nowrap ml-2"
                  >
                    Dispatch Alert →
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                    <span>
                      <strong>Urgent Transfusion:</strong> Thalassemia patient Zainab Bibi at PIMS Islamabad needs B+ unit today.
                    </span>
                  </div>
                  <button
                    onClick={() => { setActiveNav("requests"); setSearch("Zainab"); }}
                    className="font-semibold text-amber-800 hover:text-amber-950 hover:underline text-[11px] cursor-pointer whitespace-nowrap ml-2"
                  >
                    View Case →
                  </button>
                </div>
              </div>

              {/* FIGMA COMPONENT 6: QUICK ACTION BUTTONS BAR */}
              <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
                <span className="text-xs font-semibold text-[#374151] mr-1">Quick Desk Actions:</span>
                <button
                  onClick={() => setShowAddRequest(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#800000] text-white font-medium text-xs hover:bg-[#680000] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={13} />
                  <span>+ Record Request</span>
                </button>

                <button
                  onClick={() => setShowAddDonor(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] active:scale-[0.98] font-medium text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>+ Register Donor</span>
                </button>

                <button
                  onClick={() => setActiveNav("broadcast")}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 active:scale-[0.98] font-medium text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 size={13} />
                  <span>Emergency WhatsApp Alert</span>
                </button>

                <button
                  onClick={handleExport}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] active:scale-[0.98] font-medium text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              {/* FIGMA COMPONENT 7: REQUESTS TABLE (Reduced Status: Active, Closed, Rejected) */}
              <div className="p-5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#111827]">
                    Recent Emergency Requests &amp; Cases
                  </h3>
                  <button
                    onClick={() => setActiveNav("requests")}
                    className="text-xs text-[#800000] font-medium hover:underline cursor-pointer"
                  >
                    View All Requests ({requests.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E5E7EB] text-[#6B7280] text-[11px] bg-[#F9FAFB]">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold rounded-l-lg">Case ID</th>
                        <th className="py-2.5 px-3 font-semibold">Patient</th>
                        <th className="py-2.5 px-3 font-semibold">Blood</th>
                        <th className="py-2.5 px-3 font-semibold">Hospital &amp; City</th>
                        <th className="py-2.5 px-3 font-semibold">Contact</th>
                        <th className="py-2.5 px-3 font-semibold">Units</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {requests.slice(0, 5).map((r) => (
                        <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-3 font-mono text-xs font-semibold text-[#111827]">
                            {r.id}
                          </td>
                          <td className="py-3 px-3 font-medium text-[#111827]">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#800000]/10 text-[#800000] font-semibold text-[10px] flex items-center justify-center shrink-0">
                                {r.patientName.charAt(0).toUpperCase()}
                              </div>
                              <span>{r.patientName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-xs text-[#800000] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              {r.bloodGroup}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#4B5563]">
                            <div className="font-medium text-[#1F2937]">{r.hospital}</div>
                            <span className="text-[10px] text-[#6B7280]">{r.city}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span>{r.contact}</span>
                              <a 
                                href={`tel:${r.contact}`} 
                                className="p-1 rounded hover:bg-stone-100 text-[#6B7280] hover:text-[#111827] transition-colors" 
                                title="Call"
                              >
                                <Phone size={12} />
                              </a>
                              <a
                                href={waLink(r.contact, `Rabta-e-Hayat Desk regarding patient ${r.patientName} (${r.id})`)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle size={12} />
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-[#111827]">{r.units}u</td>
                          <td className="py-3 px-3">
                            <select
                              value={r.stage}
                              onChange={(e) => {
                                saveRequest({ ...r, stage: e.target.value as RequestStage });
                                refreshData();
                                notify(`Status updated to ${e.target.value}`);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border transition-colors focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                                r.stage === "Closed"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : r.stage === "Rejected"
                                  ? "bg-stone-100 text-stone-700 border-stone-300"
                                  : "bg-red-50 text-red-800 border-red-200"
                              }`}
                            >
                              <option value="Active">● Active</option>
                              <option value="Closed">✓ Closed</option>
                              <option value="Rejected">✕ Rejected</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete case ${r.id}?`)) {
                                  deleteRequest(r.id);
                                  refreshData();
                                  notify(`Deleted case ${r.id}`);
                                }
                              }}
                              className="text-[#9CA3AF] hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: REQUESTS (FULL MANAGEMENT)                          */}
          {/* ========================================================= */}
          {activeNav === "requests" && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative min-w-[200px] flex-1 max-w-sm">
                    <Search size={13} className="absolute left-3 top-2.5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder="Search patient, hospital, phone, ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input-admin w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D1D5DB] text-[#111827] text-xs"
                    />
                  </div>

                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="input-admin px-2.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white text-xs cursor-pointer"
                  >
                    <option value="All">All Cities</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="input-admin px-2.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white text-xs cursor-pointer"
                  >
                    <option value="All">All Blood</option>
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>

                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="input-admin px-2.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white text-xs cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  {(search || cityFilter !== "All" || groupFilter !== "All" || stageFilter !== "All") && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setCityFilter("All");
                        setGroupFilter("All");
                        setStageFilter("All");
                      }}
                      className="text-xs text-[#6B7280] hover:text-[#111827] px-2 py-1 cursor-pointer font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowAddRequest(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#800000] hover:bg-[#680000] active:scale-[0.98] text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  <span>Register Patient</span>
                </button>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] text-[11px]">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Case ID</th>
                        <th className="py-3 px-4 font-semibold">Patient</th>
                        <th className="py-3 px-4 font-semibold">Blood</th>
                        <th className="py-3 px-4 font-semibold">Hospital &amp; City</th>
                        <th className="py-3 px-4 font-semibold">Attendant Contact</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Assigned Lifesaver</th>
                        <th className="py-3 px-4 font-semibold text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-[#9CA3AF] text-xs">
                            No requests found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((r) => (
                          <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-[#111827]">
                              {r.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#800000]/10 text-[#800000] font-semibold text-[10px] flex items-center justify-center shrink-0">
                                  {r.patientName.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-[#111827]">{r.patientName}</span>
                              </div>
                              <span className="text-[10px] text-[#9CA3AF] ml-8">{r.severity}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              <span className="font-bold text-xs text-[#800000] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                                {r.bloodGroup}
                              </span>
                              <span className="text-[#6B7280] ml-1.5">{r.units}u</span>
                            </td>
                            <td className="py-3.5 px-4 text-[#4B5563]">
                              <div className="font-medium text-[#1F2937]">{r.hospital}</div>
                              <span className="text-[10px] text-[#6B7280]">{r.city}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span>{r.contact}</span>
                                <a 
                                  href={`tel:${r.contact}`} 
                                  className="p-1 rounded hover:bg-stone-100 text-[#6B7280] hover:text-[#111827] transition-colors" 
                                  title="Call"
                                >
                                  <Phone size={12} />
                                </a>
                                <a
                                  href={waLink(r.contact, `Rabta-e-Hayat Desk regarding patient ${r.patientName} (${r.id})`)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 transition-colors"
                                  title="WhatsApp"
                                >
                                  <MessageCircle size={12} />
                                </a>
                              </div>
                              <span className="text-[10px] text-[#9CA3AF] block mt-0.5">{r.attendantName}</span>
                            </td>

                            {/* Reduced Status: Active, Closed, Rejected */}
                            <td className="py-3.5 px-4">
                              <select
                                value={r.stage}
                                onChange={(e) => {
                                  saveRequest({ ...r, stage: e.target.value as RequestStage });
                                  refreshData();
                                  notify(`Marked as ${e.target.value}`);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors focus:outline-none focus:ring-1 focus:ring-[#800000] ${
                                  r.stage === "Closed"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : r.stage === "Rejected"
                                    ? "bg-stone-100 text-stone-700 border-stone-300"
                                    : "bg-red-50 text-red-800 border-red-200"
                                }`}
                              >
                                <option value="Active">● Active</option>
                                <option value="Closed">✓ Closed</option>
                                <option value="Rejected">✕ Rejected</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4">
                              {r.assignedVolunteerName ? (
                                <div className="flex items-center justify-between gap-1.5">
                                  <div>
                                    <div className="text-emerald-800 font-medium flex items-center gap-1">
                                      <CheckCircle2 size={12} />
                                      <span>{r.assignedVolunteerName}</span>
                                    </div>
                                    <span className="text-[10px] text-[#9CA3AF] font-mono">{r.assignedVolunteerPhone}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      saveRequest({
                                        ...r,
                                        assignedVolunteerId: null,
                                        assignedVolunteerName: undefined,
                                        assignedVolunteerPhone: undefined,
                                      });
                                      refreshData();
                                      notify(`Unassigned donor from ${r.id}`);
                                    }}
                                    className="text-[#9CA3AF] hover:text-red-700 p-1"
                                    title="Unassign"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAssigningCase(r)}
                                  className="px-2.5 py-1 rounded border border-[#D1D5DB] bg-white hover:bg-[#F9FAFB] text-[#374151] text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus size={11} />
                                  <span>Assign Donor</span>
                                </button>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete case ${r.id}?`)) {
                                    deleteRequest(r.id);
                                    refreshData();
                                    notify(`Deleted case ${r.id}`);
                                  }
                                }}
                                className="text-[#9CA3AF] hover:text-red-700 p-1"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: DONORS DIRECTORY                                    */}
          {/* ========================================================= */}
          {activeNav === "donors" && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative min-w-[200px] flex-1 max-w-sm">
                    <Search size={13} className="absolute left-3 top-2.5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      placeholder="Search donor name, city, phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="input-admin w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#D1D5DB] text-[#111827] text-xs"
                    />
                  </div>

                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="input-admin px-2.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white text-xs cursor-pointer"
                  >
                    <option value="All">All Cities</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="input-admin px-2.5 py-1.5 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white text-xs cursor-pointer"
                  >
                    <option value="All">All Blood</option>
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowAddDonor(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#800000] hover:bg-[#680000] active:scale-[0.98] text-white font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  <span>Register Donor</span>
                </button>
              </div>

              {/* Donors Table */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] text-[11px]">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Donor Name</th>
                        <th className="py-3 px-4 font-semibold">Blood</th>
                        <th className="py-3 px-4 font-semibold">City &amp; Area</th>
                        <th className="py-3 px-4 font-semibold">Contact</th>
                        <th className="py-3 px-4 font-semibold">Availability</th>
                        <th className="py-3 px-4 font-semibold">Verified</th>
                        <th className="py-3 px-4 font-semibold text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {filteredDonors.map((d) => (
                        <tr key={d.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-xs flex items-center justify-center shrink-0 border border-emerald-200/60">
                                {d.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-[#111827]">{d.fullName}</div>
                                <span className="text-[10px] text-[#9CA3AF] font-mono">{d.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#800000]">
                            <span className="bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                              {d.bloodGroup}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#4B5563]">
                            <div className="font-medium text-[#1F2937]">{d.city}</div>
                            <span className="text-[10px] text-[#6B7280]">{d.sector}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span>{d.phone}</span>
                              <a 
                                href={`tel:${d.phone}`} 
                                className="p-1 rounded hover:bg-stone-100 text-[#6B7280] hover:text-[#111827] transition-colors" 
                                title="Call"
                              >
                                <Phone size={12} />
                              </a>
                              <a
                                href={waLink(d.phone, `Salam ${d.fullName}, Rabta-e-Hayat Blood Welfare desk checking your emergency donor availability in ${d.city}.`)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle size={12} />
                              </a>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => {
                                saveVolunteer({ ...d, availableNow: !d.availableNow });
                                refreshData();
                                notify(`${d.fullName} set to ${!d.availableNow ? "Available" : "Standby"}`);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border transition-colors inline-flex items-center gap-1.5 ${
                                d.availableNow
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-stone-100 text-stone-600 border-stone-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${d.availableNow ? "bg-emerald-600" : "bg-stone-400"}`} />
                              <span>{d.availableNow ? "Available" : "Standby"}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => {
                                saveVolunteer({ ...d, verified: !d.verified });
                                refreshData();
                                notify(`${d.fullName} verification toggled`);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border transition-colors inline-flex items-center gap-1.5 ${
                                d.verified
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${d.verified ? "bg-blue-600" : "bg-amber-500"}`} />
                              <span>{d.verified ? "Verified" : "Pending"}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete donor ${d.fullName}?`)) {
                                  deleteVolunteer(d.id);
                                  refreshData();
                                  notify(`Removed donor ${d.fullName}`);
                                }
                              }}
                              className="text-[#9CA3AF] hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: FULL BLOOD INVENTORY                                */}
          {/* ========================================================= */}
          {activeNav === "inventory" && (
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#111827]">
                    Detailed Blood Reserves &amp; Stock Availability
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Complete breakdown of active demand vs. registered donor availability per blood type.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {inventoryStock.map((item) => (
                    <div
                      key={item.group}
                      className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-lg text-[#111827]">
                          {item.group}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status === "Critical"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : item.status === "Low"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-[#4B5563]">
                        <div className="flex justify-between">
                          <span>Requested Demand:</span>
                          <span className="font-mono font-semibold text-[#800000]">{item.unitsNeeded} Units</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Standby Donors:</span>
                          <span className="font-mono font-semibold text-emerald-700">{item.availableDonors} Donors</span>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className={`h-full rounded-full ${
                            item.status === "Critical" ? "bg-red-600" : item.status === "Low" ? "bg-amber-500" : "bg-emerald-600"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: BLOOD CAMPS & DRIVES                                */}
          {/* ========================================================= */}
          {activeNav === "campaigns" && (
            <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-[#111827]">Upcoming Voluntary Blood Mobilization Camps</h2>
              <p className="text-xs text-[#6B7280]">
                Organized blood donation drives across universities, business hubs, and public parks.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-xs text-[#111827]">NUST Islamabad Youth Mega Blood Drive</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                      Upcoming
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">Venue: Concordia 2, NUST H-12 Campus • Target: 150 Units</p>
                  <p className="text-[11px] text-[#9CA3AF] font-mono">Date: Sept 25, 2026 • 09:30 AM – 04:30 PM</p>
                </div>

                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-xs text-[#111827]">Commercial Market Rawalpindi Community Camp</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                      Upcoming
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">Venue: Satellite Town Community Hall • Target: 100 Units</p>
                  <p className="text-[11px] text-[#9CA3AF] font-mono">Date: Sept 28, 2026 • 10:00 AM – 06:00 PM</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: EMERGENCY BROADCAST ALERT                           */}
          {/* ========================================================= */}
          {activeNav === "broadcast" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">Emergency Callout Alert Generator</h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Generate ready-to-dispatch alerts for WhatsApp donor groups and lifesaver networks.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Target Blood Group</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {BLOOD_GROUPS.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setBcGroup(bg)}
                          className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                            bcGroup === bg
                              ? "bg-[#800000] text-white border-[#800000] shadow-sm"
                              : "bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB]"
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1">City</label>
                      <select
                        value={bcCity}
                        onChange={(e) => setBcCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white text-xs cursor-pointer focus:outline-none"
                      >
                        {PAKISTAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#374151] mb-1">Hospital Facility</label>
                      <input
                        type="text"
                        value={bcHospital}
                        onChange={(e) => setBcHospital(e.target.value)}
                        placeholder="e.g. Holy Family Hospital"
                        className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] text-xs focus:outline-none focus:border-[#800000]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Required Units</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={bcUnits}
                      onChange={(e) => setBcUnits(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedBroadcast);
                      setCopied(true);
                      notify("Alert text copied to clipboard");
                      setTimeout(() => setCopied(false), 2400);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-[#800000] hover:bg-[#680000] text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Broadcast Text"}</span>
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generatedBroadcast)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium text-xs transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={14} />
                    <span>Open in WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm space-y-3">
                <span className="text-xs font-semibold text-[#374151] block">
                  Broadcast Alert Message Preview:
                </span>
                <pre className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
                  {generatedBroadcast}
                </pre>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: DESK INFO & SETTINGS                                */}
          {/* ========================================================= */}
          {activeNav === "settings" && (
            <div className="max-w-2xl space-y-4">
              <div className="p-6 rounded-xl bg-white border border-[#E5E7EB] shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-[#111827]">Rabta-e-Hayat Welfare Organization Contacts</h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280]">Founder:</span>
                    <span className="text-[#111827] font-medium">Malaika Shahzadi</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280]">Official Phone / Helpline:</span>
                    <a href="tel:+923105290577" className="text-[#800000] font-mono hover:underline font-semibold">
                      +92 310 5290577
                    </a>
                  </div>

                  <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280]">Official Desk Email:</span>
                    <a href="mailto:welfarerabta@gmail.com" className="text-[#111827] font-mono hover:underline">
                      welfarerabta@gmail.com
                    </a>
                  </div>

                  <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280]">Easypaisa Donation:</span>
                    <span className="text-[#111827] font-mono font-medium">0319-5204993 (Malaika Shehzadi)</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-[#F3F4F6]">
                    <span className="text-[#6B7280]">Meezan Bank Raast:</span>
                    <span className="text-[#111827] font-mono font-medium">08240114877394 (Malaika Shehzadi)</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-[#6B7280]">Operational Coverage:</span>
                    <span className="text-[#111827]">All Over Pakistan (150+ Connected Hospitals)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    if (window.confirm("Restore sample default records?")) {
                      resetToDefaults();
                      refreshData();
                      notify("Restored sample baseline");
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg border border-[#D1D5DB] text-[#6B7280] hover:text-[#111827] bg-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Reset to Sample Baseline</span>
                </button>

                <button
                  onClick={handleExport}
                  className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-black text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Download size={13} />
                  <span>Download Backup JSON</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD REQUEST                                        */}
      {/* ========================================================= */}
      {showAddRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
              <span className="font-semibold text-sm text-[#111827]">Register Emergency Blood Request</span>
              <button onClick={() => setShowAddRequest(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Noor"
                  value={reqPatient}
                  onChange={(e) => setReqPatient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-[#800000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Attendant Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Shahid Noor"
                    value={reqAttendant}
                    onChange={(e) => setReqAttendant(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-[#800000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-[#800000] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Hospital / Clinic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Holy Family Hospital"
                  value={reqHospital}
                  onChange={(e) => setReqHospital(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-[#800000]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">City</label>
                  <select
                    value={reqCity}
                    onChange={(e) => setReqCity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white focus:outline-none cursor-pointer"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Blood</label>
                  <select
                    value={reqBlood}
                    onChange={(e) => setReqBlood(e.target.value as BloodGroup)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white font-mono focus:outline-none cursor-pointer"
                  >
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Units</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={reqUnits}
                    onChange={(e) => setReqUnits(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Severity</label>
                <select
                  value={reqSeverity}
                  onChange={(e) => setReqSeverity(e.target.value as Severity)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Code Red">Code Red (Immediate)</option>
                  <option value="Urgent">Urgent (Within 4 Hours)</option>
                  <option value="Routine">Routine (Scheduled)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setShowAddRequest(false)}
                  className="px-3.5 py-1.5 rounded-lg text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#800000] hover:bg-[#680000] text-white font-medium cursor-pointer shadow-sm"
                >
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD DONOR                                          */}
      {/* ========================================================= */}
      {showAddDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
              <span className="font-semibold text-sm text-[#111827]">Register Volunteer Donor</span>
              <button onClick={() => setShowAddDonor(false)} className="text-[#9CA3AF] hover:text-[#111827]">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateDonor} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Donor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman Ghani"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-[#800000]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-[#800000] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">City</label>
                  <select
                    value={donorCity}
                    onChange={(e) => setDonorCity(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white focus:outline-none cursor-pointer"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#374151] mb-1">Blood Group</label>
                  <select
                    value={donorBlood}
                    onChange={(e) => setDonorBlood(e.target.value as BloodGroup)}
                    className="w-full px-2.5 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] bg-white font-mono focus:outline-none cursor-pointer"
                  >
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">Area / Vicinity</label>
                <input
                  type="text"
                  placeholder="e.g. Satellite Town / F-10"
                  value={donorSector}
                  onChange={(e) => setDonorSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] text-[#111827] focus:outline-none focus:border-[#800000]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#F3F4F6]">
                <button
                  type="button"
                  onClick={() => setShowAddDonor(false)}
                  className="px-3.5 py-1.5 rounded-lg text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#800000] hover:bg-[#680000] text-white font-medium cursor-pointer shadow-sm"
                >
                  Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSIGN DONOR                                       */}
      {/* ========================================================= */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E5E7EB] p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#F3F4F6]">
              <div>
                <span className="font-semibold text-sm text-[#111827]">Assign Matching Donor</span>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Case: {assigningCase.patientName} • {assigningCase.bloodGroup} • {assigningCase.hospital} ({assigningCase.city})
                </p>
              </div>
              <button onClick={() => setAssigningCase(null)} className="text-[#9CA3AF] hover:text-[#111827]">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-medium text-[#6B7280] block">
                Compatible {assigningCase.bloodGroup} Donors Available:
              </span>

              {volunteers.filter((v) => v.bloodGroup === assigningCase.bloodGroup && v.availableNow).length === 0 ? (
                <div className="text-center py-8 text-[#9CA3AF] text-xs">
                  No matching {assigningCase.bloodGroup} donors available right now. Consider dispatching a broadcast alert.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {volunteers
                    .filter((v) => v.bloodGroup === assigningCase.bloodGroup && v.availableNow)
                    .map((donor) => (
                      <div
                        key={donor.id}
                        className="p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white flex items-center justify-between gap-3 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-[#111827] text-xs flex items-center gap-1.5">
                            <span>{donor.fullName}</span>
                            {donor.city === assigningCase.city && (
                              <span className="text-[10px] px-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Same City
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                            {donor.phone} • {donor.city}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            saveRequest({
                              ...assigningCase,
                              assignedVolunteerId: donor.id,
                              assignedVolunteerName: donor.fullName,
                              assignedVolunteerPhone: donor.phone,
                              stage: "Active",
                            });
                            refreshData();
                            setAssigningCase(null);
                            notify(`Assigned ${donor.fullName} to case ${assigningCase.id}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#800000] hover:bg-[#680000] text-white font-medium text-xs cursor-pointer shadow-sm"
                        >
                          Assign
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#F3F4F6]">
              <button
                onClick={() => setAssigningCase(null)}
                className="px-3.5 py-1.5 rounded-lg text-[#6B7280] hover:text-[#111827]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
