import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Droplet, Phone, CheckCircle2, Building2, User } from "lucide-react";
import { TWIN_CITY_HOSPITALS, BLOOD_GROUPS } from "../../data/twinCityData";
import { BloodGroup } from "../../types";
import { saveRequest } from "../../utils/adminStorage";

interface RequestBloodModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedHospital?: string | null;
}

export const RequestBloodModal: React.FC<RequestBloodModalProps> = ({
  isOpen,
  onClose,
  preselectedHospital,
}) => {
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [hospital, setHospital] = useState(preselectedHospital || TWIN_CITY_HOSPITALS[0].name);
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState<"critical" | "urgent" | "scheduled">("critical");
  const [phone, setPhone] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedHospital) {
      setHospital(preselectedHospital);
    }
  }, [preselectedHospital]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !phone) return;
    const ticket = `REQ-${Math.floor(20000 + Math.random() * 80000)}`;
    const matchingHospital = TWIN_CITY_HOSPITALS.find((h) => h.name === hospital);
    const city = matchingHospital ? matchingHospital.city : "Rawalpindi";

    saveRequest({
      id: ticket,
      patientName,
      attendantName: "Web Applicant",
      contact: phone,
      cnic: "Online Portal Request",
      city: city as any,
      sector: hospital,
      hospital,
      bloodGroup,
      units,
      severity: urgency === "critical" ? "Code Red" : urgency === "urgent" ? "Urgent" : "Routine",
      caseType: "General Emergency",
      physicianOrder: true,
      familyConsent: true,
      dataConsent: true,
      notes: `Urgency level: ${urgency}. Submitted via website lifeline modal.`,
      stage: "Active",
      assignedVolunteerId: null,
      createdAt: new Date().toISOString(),
    });

    setSubmittedTicket(ticket);
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setPatientName("");
    setPhone("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Animated Backdrop with deep blur - Monochrome, no red tint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xl"
          />

          {/* Centered Liquid Glass Modal Box */}
          <motion.div
            dir="ltr"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="relative w-full max-w-xl rounded-3xl matte-glass-card p-5 sm:p-8 text-white z-10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] my-auto max-h-[92vh] overflow-y-auto text-left"
            role="dialog"
            aria-modal="true"
          >
            {submittedTicket ? (
              /* Success confirmation view */
              <div className="text-center py-4 space-y-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 -mr-1 -mt-1 rounded-full liquid-glass text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10 cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20">
                  <CheckCircle2 size={34} className="text-white" />
                </div>

                <div>
                  <span className="text-[11px] font-mono tracking-widest uppercase text-white/60">
                    Emergency Ticket Generated
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-semibold mt-1">
                    Request Broadcast Active
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
                    Ticket <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">{submittedTicket}</span> has been dispatched to volunteer coordinators near your hospital.
                  </p>
                </div>

                <div className="liquid-glass rounded-2xl p-4 text-left space-y-2 text-xs border border-white/10 text-white/80">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/40">Patient:</span>
                    <span className="font-medium text-white">{patientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/40">Blood Group:</span>
                    <span className="font-bold text-white font-mono text-sm">{bloodGroup}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/40">Hospital:</span>
                    <span className="text-white">{hospital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Units Needed:</span>
                    <span className="text-white">{units} Unit(s)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href="tel:+923105290577"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:scale-105 transition-transform"
                  >
                    <Phone size={13} /> Call Desk: +92 310 5290577
                  </a>
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-6 py-3 rounded-full liquid-glass hover:bg-white/10 text-white/80 font-medium text-xs tracking-wider border border-white/10 cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              /* Clean & Simple Request Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Header with Badge on Left and Close Button on Right */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/10 text-[10px] tracking-widest uppercase text-white/70 font-mono">
                      <Droplet size={11} className="text-white fill-white" />
                      Direct Lifeline Request
                    </div>

                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 -mr-1 -mt-1 rounded-full liquid-glass text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10 cursor-pointer shrink-0"
                      aria-label="Close"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
                    Emergency Blood Request
                  </h2>
                  <p className="text-white/50 text-xs">
                    Fill in details to alert volunteer donors across all cities of Pakistan. Zero fees.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Patient Name */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Patient Full Name *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Fatima Tariq"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="input-polished w-full bg-white/[0.04] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25"
                      />
                    </div>
                  </div>

                  {/* Blood Group Selector */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">
                      Blood Group Required *
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {BLOOD_GROUPS.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setBloodGroup(bg)}
                          className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all border cursor-pointer ${
                            bloodGroup === bg
                              ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105"
                              : "bg-white/[0.03] text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hospital & Units */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Admitted Hospital *
                      </label>
                      <div className="relative">
                        <Building2 size={15} className="absolute left-3.5 top-3.5 text-white/40" />
                        <select
                          value={hospital}
                          onChange={(e) => setHospital(e.target.value)}
                          className="input-polished w-full bg-[#141418] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white cursor-pointer"
                        >
                          {TWIN_CITY_HOSPITALS.map((h) => (
                            <option key={h.id} value={h.name} className="bg-[#18181c] text-white">
                              {h.name} ({h.city})
                            </option>
                          ))}
                          <option value="Other Hospital" className="bg-[#18181c] text-white">
                            Other Hospital / City Facility
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Units Needed
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setUnits(num)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                              units === num
                                ? "bg-white text-black font-bold border-white"
                                : "bg-white/[0.03] text-white/60 border-white/10 hover:text-white"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Urgency & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Urgency Level
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "critical", label: "Immediate" },
                          { id: "urgent", label: "2-4h" },
                          { id: "scheduled", label: "Today" },
                        ].map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setUrgency(u.id as any)}
                            className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                              urgency === u.id
                                ? "bg-white text-black font-semibold border-white"
                                : "bg-white/[0.03] text-white/60 border-white/10 hover:text-white"
                            }`}
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">
                        Attendant Phone Number *
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-3.5 text-white/40" />
                        <input
                          type="tel"
                          required
                          placeholder="0300-1234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-polished w-full bg-white/[0.04] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/25"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.25)] cursor-pointer"
                  >
                    Broadcast Emergency Blood Request
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
