import React, { useState } from "react";
import { CreditCard, Heart, CheckCircle2, Droplet, User, Phone, MapPin } from "lucide-react";
import { BLOOD_GROUPS } from "../../data/twinCityData";
import { BloodGroup } from "../../types";
import { saveVolunteer } from "../../utils/adminStorage";

export const DonateUsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"financial" | "blood">("financial");
  const [volName, setVolName] = useState("");
  const [volPhone, setVolPhone] = useState("");
  const [volCity, setVolCity] = useState<string>("Islamabad");
  const [volBlood, setVolBlood] = useState<BloodGroup>("O+");
  const [registered, setRegistered] = useState(false);

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (volName && volPhone) {
      const newDonorId = `DON-${Math.floor(30000 + Math.random() * 70000)}`;
      saveVolunteer({
        id: newDonorId,
        fullName: volName,
        phone: volPhone,
        cnic: "Direct Web Registration",
        city: volCity,
        sector: "Online Lifesaver Network",
        bloodGroup: volBlood,
        lastDonation: new Date().toISOString().slice(0, 10),
        donationCount: 1,
        availableNow: true,
        medicallyFit: true,
        dataConsent: true,
        verified: false,
        badgeLevel: "Silver Guardian",
        affiliatedUniversityOrOrg: "Rabta Online Volunteer",
        createdAt: new Date().toISOString(),
      });
      setRegistered(true);
    }
  };

  return (
    <section id="donate-us" className="relative py-16 sm:py-24 px-4 sm:px-8 md:px-10 max-w-6xl mx-auto text-white">
      {/* Subtle ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span 
            dir="rtl"
            className="block text-2xl sm:text-3xl text-white font-normal"
            style={{ fontFamily: "'Jameel Noori Nastaleeq Kasheeda', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
          >
            ایک قدم انسانیت کے لیے
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            Support &amp; Donate to Rabta-e-Hayat
          </h2>
          <p className="text-white/60 text-sm sm:text-base font-light leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Rabta-e-Hayat Welfare Organization is a 100% volunteer humanitarian network operating across Pakistan. You can support our emergency lifeline through operational logistics sponsorship or by registering as a voluntary blood donor in your city.
          </p>

          {/* Liquid Glass Switcher */}
          <div className="inline-flex liquid-glass rounded-full p-1 border border-white/10 mt-4">
            <button
              onClick={() => setActiveTab("financial")}
              className={`px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "financial"
                  ? "bg-white text-black font-semibold shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Operational Desk Support
            </button>
            <button
              onClick={() => setActiveTab("blood")}
              className={`px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === "blood"
                  ? "bg-white text-black font-semibold shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Register As Blood Donor
            </button>
          </div>
        </div>

        {/* Tab 1: Operational & Financial Support */}
        {activeTab === "financial" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Account Details Box */}
            <div className="p-7 sm:p-9 rounded-3xl matte-glass-card space-y-6 max-w-3xl mx-auto shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full matte-glass border border-white/20 flex items-center justify-center">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">Rabta-e-Hayat Welfare Donation Accounts</h3>
                    <p className="text-xs text-white/50">Direct voluntary contribution for emergency logistics &amp; patient support</p>
                  </div>
                </div>

                <span className="self-start sm:self-auto text-[10px] font-mono uppercase tracking-widest text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  100% Non-Profit Trust
                </span>
              </div>

              {/* 2 Official Payment Cards: Easypaisa & Meezan Bank in Matte Glass */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Easypaisa */}
                <div className="p-5 rounded-2xl matte-glass-card space-y-3 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Easypaisa Mobile Account
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Instant</span>
                  </div>
                  <div>
                    <div className="text-white/45 font-mono uppercase text-[10px]">Mobile / Account Number</div>
                    <div className="text-white font-mono font-bold text-xl tracking-wider select-all mt-0.5">
                      0319-5204993
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                    <span className="text-white/50">Account Title:</span>
                    <span className="text-white font-medium">Malaika Shehzadi</span>
                  </div>
                </div>

                {/* 2. Meezan Bank */}
                <div className="p-5 rounded-2xl matte-glass-card space-y-3 relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/90 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white/70" />
                      Meezan Bank Ltd.
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Bank Transfer</span>
                  </div>
                  <div>
                    <div className="text-white/45 font-mono uppercase text-[10px]">Account Number / Raast</div>
                    <div className="text-white font-mono font-bold text-base sm:text-lg tracking-wider select-all mt-0.5">
                      08240114877394
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                    <span className="text-white/50">Account Title:</span>
                    <span className="text-white font-medium">Malaika Shehzadi</span>
                  </div>
                </div>
              </div>

              {/* Email screenshot confirmation banner */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="text-white/60 font-light text-center sm:text-left leading-relaxed">
                  Send payment receipts or verification directly to our welfare desk:
                </p>
                <a 
                  href="mailto:welfarerabta@gmail.com" 
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs transition-colors shrink-0"
                >
                  welfarerabta@gmail.com
                </a>
              </div>

              <p className="text-xs text-white/50 leading-relaxed font-light text-center sm:text-left">
                *Rabta-e-Hayat Welfare Organization takes zero administrative salaries. 100% of all public contributions fund patient emergency transport, volunteer medical screening strips, and 24/7 lifeline operational costs.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Volunteer Blood Donor Registration */}
        {activeTab === "blood" && (
          <div className="max-w-xl mx-auto animate-fadeIn">
            <div className="p-8 rounded-3xl matte-glass-card space-y-6 shadow-2xl">
              {registered ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto border border-white/20">
                    <CheckCircle2 size={34} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-medium text-white">Registered as Volunteer Lifesaver</h3>
                  <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{volName}</strong>! Your profile is verified in our nationwide volunteer network for {volBlood} in {volCity}. You will be alerted only when urgent emergency requirements occur in your vicinity.
                  </p>
                  <button
                    onClick={() => setRegistered(false)}
                    className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-medium text-white">Join the Nationwide Donor Network</h3>
                    <p className="text-xs text-white/50 font-light">
                      Sign up to receive immediate callouts when a patient in your city urgently requires blood.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3.5 text-white/40" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Asad Qureshi"
                        value={volName}
                        onChange={(e) => setVolName(e.target.value)}
                        className="input-polished w-full bg-white/[0.04] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/25"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Phone / WhatsApp *</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-3.5 text-white/40" />
                        <input
                          type="tel"
                          required
                          placeholder="0300-1234567"
                          value={volPhone}
                          onChange={(e) => setVolPhone(e.target.value)}
                          className="input-polished w-full bg-white/[0.04] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/25"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">City *</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-3.5 text-white/40" />
                        <select
                          value={volCity}
                          onChange={(e) => setVolCity(e.target.value)}
                          className="input-polished w-full bg-[#141418] border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white cursor-pointer"
                        >
                          <option value="Islamabad">Islamabad</option>
                          <option value="Rawalpindi">Rawalpindi</option>
                          <option value="Lahore">Lahore</option>
                          <option value="Karachi">Karachi</option>
                          <option value="Peshawar">Peshawar</option>
                          <option value="Multan">Multan</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Quetta">Quetta</option>
                          <option value="Gujranwala">Gujranwala</option>
                          <option value="Sialkot">Sialkot</option>
                          <option value="Hyderabad">Hyderabad</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Your Blood Group</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {BLOOD_GROUPS.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setVolBlood(bg)}
                          className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all border cursor-pointer active:scale-95 ${
                            volBlood === bg
                              ? "bg-white text-black border-white shadow-md font-bold scale-[1.03]"
                              : "bg-white/[0.03] text-white/70 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2 cursor-pointer"
                  >
                    Confirm Voluntary Registration
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
