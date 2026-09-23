import React from "react";
import { Mail, Phone, CheckCircle2, ShieldCheck, MapPin, Calendar } from "lucide-react";

interface CinematicFooterProps {
  onRequestBlood: () => void;
  onScrollTo: (sectionId: string) => void;
}

export const CinematicFooter: React.FC<CinematicFooterProps> = ({
  onRequestBlood,
  onScrollTo,
}) => {
  return (
    <footer className="relative border-t border-white/10 bg-[#09090b]/90 backdrop-blur-2xl text-white pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-8 md:px-10">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Column 1: Brand & Contacts */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden p-0.5 liquid-glass border border-white/20 bg-white shrink-0">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <span className="font-semibold text-base tracking-tight text-white block">
                  Rabta-e-Hayat
                </span>
                <span 
                  dir="rtl" 
                  className="text-[11px] text-white/50 block -mt-1"
                  style={{ fontFamily: "'Jameel Noori Nastaleeq Kasheeda', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
                >
                  ایک قدم انسانیت کے لیے
                </span>
              </div>
            </div>

            <p className="text-xs text-white/50 leading-relaxed font-light" style={{ fontFamily: "'Barlow', sans-serif" }}>
              Rabta-e-Hayat Welfare Organization was founded by Malaika Shahzadi. Connecting lifesavers, one drop at a time.
            </p>

            <div className="space-y-2 text-xs text-white/70 font-light pt-1">
              <a href="mailto:welfarerabta@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={13} className="text-white/40 shrink-0" />
                <span>welfarerabta@gmail.com</span>
              </a>
              <a href="tel:+923105290577" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={13} className="text-white/40 shrink-0" />
                <span>+92 310 5290577</span>
              </a>
            </div>
          </div>

          {/* Column 2: SERVICES */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white/90">Services</h4>
            <ul className="space-y-2 text-xs text-white/60 font-light">
              <li>
                <button onClick={onRequestBlood} className="hover:text-white transition-colors text-left cursor-pointer">
                  Request Blood
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo("hospitals")} className="hover:text-white transition-colors text-left cursor-pointer">
                  Hospital Network
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">Emergency Protocol</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">Compatibility Matrix</span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">Live Deficit Tracker</span>
              </li>
            </ul>
          </div>

          {/* Column 3: ORGANIZATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white/90">Organization</h4>
            <ul className="space-y-2 text-xs text-white/60 font-light">
              <li>
                <button onClick={() => onScrollTo("about-us")} className="hover:text-white transition-colors text-left cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo("hospitals")} className="hover:text-white transition-colors text-left cursor-pointer">
                  Hospital Network
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo("donate-us")} className="hover:text-white transition-colors text-left cursor-pointer">
                  Volunteer Donors
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo("donate-us")} className="hover:text-white transition-colors text-left cursor-pointer">
                  Donate Us
                </button>
              </li>
              <li>
                <a href="tel:+923105290577" className="hover:text-white transition-colors">
                  Emergency Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: LEGAL */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white/90">Legal</h4>
            <ul className="space-y-2 text-xs text-white/60 font-light">
              <li className="hover:text-white transition-colors cursor-default">Zero-Fee Policy</li>
              <li className="hover:text-white transition-colors cursor-default">Privacy Policy</li>
              <li className="hover:text-white transition-colors cursor-default">Terms & Conditions</li>
              <li className="hover:text-white transition-colors cursor-default">Medical Disclaimer</li>
              <li className="hover:text-white transition-colors cursor-default">Donor Data Protection</li>
            </ul>
          </div>

          {/* Column 5: NONPROFIT STATUS & FOLLOW US */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-white/90">Nonprofit Status</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded-xl liquid-glass border border-white/10 text-white/80">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span>100% Non-Profit Verified</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl liquid-glass border border-white/10 text-white/80">
                <ShieldCheck size={13} className="text-white/60 shrink-0" />
                <span>Reg: Pakistan Welfare Network</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl liquid-glass border border-white/10 text-white/80">
                <Calendar size={13} className="text-white/60 shrink-0" />
                <span>Est. May 2026</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl liquid-glass border border-white/10 text-white/80">
                <MapPin size={13} className="text-white/60 shrink-0" />
                <span>All Over Pakistan (Nationwide)</span>
              </div>
            </div>

            {/* Follow Us */}
            <div className="space-y-2 pt-1">
              <h5 className="text-[11px] font-semibold tracking-wider uppercase text-white/70">Follow Us</h5>
              <div className="flex items-center gap-2 text-white/60">
                {/* Instagram */}
                <div className="w-8 h-8 rounded-full liquid-glass border border-white/10 flex items-center justify-center hover:text-white hover:border-white/30 transition-all cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                {/* Facebook */}
                <div className="w-8 h-8 rounded-full liquid-glass border border-white/10 flex items-center justify-center hover:text-white hover:border-white/30 transition-all cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </div>
                {/* LinkedIn */}
                <div className="w-8 h-8 rounded-full liquid-glass border border-white/10 flex items-center justify-center hover:text-white hover:border-white/30 transition-all cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </div>
                {/* YouTube */}
                <div className="w-8 h-8 rounded-full liquid-glass border border-white/10 flex items-center justify-center hover:text-white hover:border-white/30 transition-all cursor-pointer">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Blood Donation Guides Bar */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold tracking-widest uppercase text-white/80">
            Blood Donation Guides
          </h4>
          <p className="text-xs text-white/40 leading-relaxed font-light" style={{ fontFamily: "'Barlow', sans-serif" }}>
            Blood Group Compatibility Chart &bull; Who Can Donate Blood? &bull; Thalassemia Support in Pakistan &bull; Find Blood Donors by City &bull; Blood Donors in Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, Multan, Quetta, Faisalabad &bull; All-Pakistan Emergency Blood Bank Directory &bull; Zero Commercialization Compact
          </p>
        </div>

        {/* Copyright & Disclaimer Line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/40 font-light border-t border-white/5 pt-4">
          <p style={{ fontFamily: "'Barlow', sans-serif" }}>
            &copy; {new Date().getFullYear()} Rabta-e-Hayat Welfare Organization. Founded by Malaika Shahzadi. All rights reserved.
          </p>
          <span className="text-[11px] text-white/30 font-mono">
            Nationwide Emergency Community Coordination &bull; All Over Pakistan
          </span>
        </div>

        {/* Medical Emergency Warning Callout (Matching screenshot bottom banner) */}
        <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/20 text-center text-xs text-white/70 shadow-inner">
          <span className="font-semibold text-rose-300">Medical Emergency? </span>
          <span>
            Call <strong>1122</strong> or your local emergency hospital blood bank immediately. Rabta-e-Hayat is a voluntary community coordination platform and does not replace hospital clinical emergency care.
          </span>
        </div>
      </div>
    </footer>
  );
};
