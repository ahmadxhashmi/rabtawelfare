import React, { useState, useMemo } from "react";
import { Shield, Flame, UserCheck, HeartHandshake, Phone, ArrowRight, Building2, MapPin } from "lucide-react";
import { TWIN_CITY_HOSPITALS } from "../../data/twinCityData";
import logoImg from "../../assets/logo.jpg";

interface AboutUsSectionProps {
  onRequestBlood: (hospitalName?: string) => void;
  isHospitalExpanded?: boolean;
  onToggleHospitalExpanded?: (expanded: boolean) => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ 
  onRequestBlood,
  isHospitalExpanded,
  onToggleHospitalExpanded,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [localExpanded, setLocalExpanded] = useState(false);

  // Use controlled state if provided, otherwise local state
  const isExpanded = isHospitalExpanded !== undefined ? isHospitalExpanded : localExpanded;
  const toggleExpanded = (val: boolean) => {
    if (onToggleHospitalExpanded) {
      onToggleHospitalExpanded(val);
    } else {
      setLocalExpanded(val);
    }
  };

  const filteredHospitals = useMemo(() => {
    return TWIN_CITY_HOSPITALS.filter(
      (h) => selectedCity === "All" || h.city.toLowerCase() === selectedCity.toLowerCase()
    );
  }, [selectedCity]);

  // Show 3 hospitals when collapsed for quick skipping, all when expanded
  const displayedHospitals = isExpanded ? filteredHospitals : filteredHospitals.slice(0, 3);

  return (
    <section id="about-us" className="relative py-16 sm:py-24 px-4 sm:px-8 md:px-10 max-w-6xl mx-auto text-white">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-16">
        {/* Section Header with Official Logo */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 liquid-glass border border-white/20 bg-white shadow-xl shrink-0">
              <img src={logoImg} alt="Rabta-e-Hayat Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <span 
                dir="rtl"
                className="block text-2xl sm:text-3xl text-white font-normal"
                style={{ fontFamily: "'Jameel Noori Nastaleeq Kasheeda', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
              >
                ایک قدم انسانیت کے لیے
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-white mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                About Rabta-e-Hayat
              </h2>
            </div>
          </div>

          <p className="text-white/60 text-sm sm:text-base font-light max-w-md leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
            A volunteer-driven emergency blood coordination welfare network linking families in crisis with verified donors across all cities of Pakistan. Zero fees, direct nationwide response.
          </p>
        </div>

        {/* Our Story & Founder Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Our Story */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-3xl matte-glass-card space-y-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono uppercase tracking-widest text-white/90">
                <HeartHandshake size={13} className="text-white" />
                <span>Our Story</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                Born from Empathy, Dedicated to Humanity
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm text-white/70 font-light leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                <p>
                  <strong>Rabta-e-Hayat Welfare Organization</strong> was founded by <strong>Malaika Shahzadi</strong>, inspired by her dedicated years of active involvement in volunteer and welfare work across Pakistan.
                </p>
                <p>
                  Her firsthand experience of collaborating with diverse charitable organizations and directly serving people in acute distress revealed critical gaps in emergency healthcare logistics &mdash; especially the desperate struggle families face during critical blood shortages. This deep realization led her to establish an independent, transparent platform of her own.
                </p>
                <p>
                  Today, <strong>Rabta-e-Hayat</strong> connects people in need with meaningful, timely support &mdash; fostering a unified community built firmly on compassion, selflessness, service, and universal human dignity.
                </p>
              </div>
            </div>

            {/* Core Values Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 relative z-10 text-center">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-white font-medium text-xs sm:text-sm">Compassion</div>
                <div className="text-[10px] text-white/40 mt-0.5">At Every Step</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-white font-medium text-xs sm:text-sm">100% Free</div>
                <div className="text-[10px] text-white/40 mt-0.5">Zero Commercialization</div>
              </div>
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="text-white font-medium text-xs sm:text-sm">Rapid Match</div>
                <div className="text-[10px] text-white/40 mt-0.5">Nationwide Lifeline</div>
              </div>
            </div>
          </div>

          {/* Right: Our Founder */}
          <div className="lg:col-span-5 p-7 sm:p-9 rounded-3xl matte-glass-card space-y-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                  Our Founder
                </span>
                <span className="text-xs text-white/40 font-mono">Welfare Leadership</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden p-0.5 matte-glass border border-white/20 bg-white flex items-center justify-center shrink-0 shadow-lg">
                  <img src={logoImg} alt="Malaika Shahzadi - Rabta-e-Hayat" className="w-full h-full object-contain rounded-2xl" />
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-semibold text-white">
                    Malaika Shahzadi
                  </h4>
                  <p className="text-xs text-white/60 font-mono tracking-wide mt-0.5">
                    Founder, Rabta-e-Hayat
                  </p>
                </div>
              </div>

              <blockquote className="relative p-4 rounded-2xl bg-white/[0.04] border-l-2 border-white/60 italic text-xs sm:text-sm text-white/85 font-light leading-relaxed">
                &ldquo;Service to humanity is not just an initiative; it is a lifelong commitment. We established Rabta-e-Hayat so that no person ever feels alone or helpless in their moment of emergency.&rdquo;
              </blockquote>

              <p className="text-xs sm:text-sm text-white/65 font-light leading-relaxed" style={{ fontFamily: "'Barlow', sans-serif" }}>
                <strong>Malaika Shahzadi</strong> continues her inspiring journey of serving others with an expanding vision: broadening welfare interventions, mobilizing youth across Pakistan, and ensuring life-saving assistance reaches those who need it most.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>Official Contact:</span>
              <a href="mailto:welfarerabta@gmail.com" className="text-white hover:underline font-mono">
                welfarerabta@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards in Matte Glass */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl matte-glass-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-mono text-white">1,420+</div>
            <div className="text-[11px] font-mono text-white/50 uppercase tracking-widest">Verified Volunteers</div>
          </div>
          <div className="p-6 rounded-3xl matte-glass-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-mono text-white">38 min</div>
            <div className="text-[11px] font-mono text-white/50 uppercase tracking-widest">Avg Match Time</div>
          </div>
          <div className="p-6 rounded-3xl matte-glass-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-mono text-white">150+</div>
            <div className="text-[11px] font-mono text-white/50 uppercase tracking-widest">Connected Hospitals</div>
          </div>
          <div className="p-6 rounded-3xl matte-glass-card text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-mono text-white">100%</div>
            <div className="text-[11px] font-mono text-white/50 uppercase tracking-widest">Non-Profit / Free</div>
          </div>
        </div>

        {/* Connected Nationwide Hospitals Directory (with id="hospitals") */}
        <div id="hospitals" className="space-y-6 pt-4 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest uppercase text-white/50">Nationwide Blood Banks</span>
                <span className="text-[10px] font-mono bg-white/10 text-white/80 px-2 py-0.5 rounded-full border border-white/10">
                  {filteredHospitals.length} Available
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-normal text-white">All-Pakistan Hospital Network</h3>
            </div>

            {/* Controls: City Filter Tabs + Header Show More / Show Less Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* City Filter Tabs */}
              <div className="matte-glass rounded-full p-1 flex items-center gap-1 overflow-x-auto max-w-full">
                {(["All", "Islamabad", "Rawalpindi", "Lahore", "Karachi", "Peshawar", "Multan", "Quetta", "Faisalabad"] as const).map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                      selectedCity === city
                        ? "bg-white text-black font-semibold shadow"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Quick Toggle Button in Header */}
              <button
                onClick={() => toggleExpanded(!isExpanded)}
                className="matte-glass px-4 py-1.5 rounded-full border border-white/20 text-xs font-medium tracking-wider text-white hover:bg-white/10 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow whitespace-nowrap"
              >
                <span>{isExpanded ? "Show Less" : "Show More"}</span>
                <span className="text-[10px] text-white/60">{isExpanded ? "▲" : "▼"}</span>
              </button>
            </div>
          </div>

          {!isExpanded && (
            <p className="text-xs text-white/50 font-light flex items-center gap-2">
              <span>Previewing 3 facilities. Click <strong>Show More</strong> to view all {filteredHospitals.length} hospitals, or scroll past to skip this section.</span>
            </p>
          )}

          {/* Hospital Cards Grid in Matte Glass */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="p-5 rounded-3xl matte-glass-card flex flex-col justify-between gap-4 group cursor-default"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-white group-hover:text-white/90 leading-snug">
                      {hosp.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/80 shrink-0">
                      {hosp.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/50 mt-2">
                    <MapPin size={11} className="text-white/40 shrink-0" />
                    <span>Sector {hosp.sector} • {hosp.type}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <a
                    href={`tel:${hosp.hotline.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs text-white/75 hover:text-white px-2 py-1 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Phone size={12} className="text-white/60" />
                    <span>{hosp.hotline}</span>
                  </a>

                  <button
                    onClick={() => onRequestBlood(hosp.name)}
                    className="text-[11px] font-medium text-white/90 hover:text-white px-2.5 py-1 rounded-full bg-white/10 hover:bg-white hover:text-black inline-flex items-center gap-1 cursor-pointer transition-all duration-200 active:scale-95 shadow-xs"
                  >
                    <span>Request</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show More / Show Less Bottom Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                const nextState = !isExpanded;
                toggleExpanded(nextState);
                if (!nextState) {
                  const el = document.getElementById("hospitals");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-6 py-2.5 rounded-full liquid-glass border border-white/20 hover:border-white/40 text-xs font-semibold tracking-wider uppercase text-white hover:bg-white/10 transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
            >
              <span>
                {isExpanded
                  ? "Show Less (Collapse Section)"
                  : `Show More Hospitals (${filteredHospitals.length - 3} more)`}
              </span>
              <span className="text-white/60 text-xs">
                {isExpanded ? "▲" : "▼"}
              </span>
            </button>
            {!isExpanded && (
              <a
                href="#donate-us"
                className="text-xs text-white/55 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
              >
                Skip to Support &amp; Donation &darr;
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
