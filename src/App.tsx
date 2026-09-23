import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Volume2, VolumeX, ArrowUpRight, HeartPulse, Menu, X, Phone } from "lucide-react";
import { RequestBloodModal } from "./components/cinematic/RequestBloodModal";
import { AboutUsSection } from "./components/sections/AboutUsSection";
import { DonateUsSection } from "./components/sections/DonateUsSection";
import { CinematicFooter } from "./components/layout/CinematicFooter";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import logoImg from "./assets/logo.jpg";

const checkIsAdminPath = () => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "");
  const hash = window.location.hash.toLowerCase().replace(/\/+$/, "");
  const search = window.location.search.toLowerCase();
  const href = window.location.href.toLowerCase();
  return (
    path.endsWith("/admin") ||
    path === "/admin" ||
    path.includes("/admin") ||
    path.includes("admin") ||
    hash.includes("admin") ||
    search.includes("admin") ||
    href.includes("/admin") ||
    href.includes("#admin")
  );
};

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => checkIsAdminPath());
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Request Blood Modal state
  const [isRequestBloodOpen, setIsRequestBloodOpen] = useState(false);
  const [preselectedHospital, setPreselectedHospital] = useState<string | null>(null);
  const [isHospitalExpanded, setIsHospitalExpanded] = useState(false);

  // Listen to browser URL changes for /admin navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmin = checkIsAdminPath();
      setIsAdminRoute((prev) => (prev !== isAdmin ? isAdmin : prev));
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    
    // Polling interval in case address bar is changed without a trigger
    const poller = setInterval(handleLocationChange, 300);

    // Keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) to quickly access admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        if (checkIsAdminPath()) {
          window.location.hash = "";
          const basePath = window.location.pathname.replace(/\/admin\/?$/, "") || "./";
          window.history.pushState({}, "", basePath);
          setIsAdminRoute(false);
        } else {
          window.location.hash = "admin";
          setIsAdminRoute(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
      clearInterval(poller);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Mount fade-in trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic scroll blur directly on video from Twin City Hospitals onward
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Scales smoothly from 0 (sharp at hero) to 1 (blurred at hospitals/about-us)
      const progress = Math.min(Math.max((scrollY - 50) / 350, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP-driven mouse parallax on video background
  useEffect(() => {
    let reqId: number;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * 20;
      targetY = ((e.clientY - cy) / cy) * 20;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const loop = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      if (videoRef.current) {
        gsap.set(videoRef.current, { x: currentX, y: currentY, scale: 1.12 });
      }
      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (sectionId === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (sectionId === "hospitals") {
      setIsHospitalExpanded(true);
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenRequestBlood = (hospitalName?: string) => {
    setIsMobileMenuOpen(false);
    if (hospitalName) {
      setPreselectedHospital(hospitalName);
    }
    setIsRequestBloodOpen(true);
  };

  if (isAdminRoute) {
    return (
      <AdminDashboard
        onExitAdmin={() => {
          window.location.hash = "";
          const basePath = window.location.pathname.replace(/\/admin\/?$/, "") || "./";
          window.history.pushState({}, "", basePath);
          setIsAdminRoute(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen text-white selection:bg-white/20 selection:text-white relative overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Fixed Cinematic Video Background (z-0)                     */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="w-full h-full scale-[1.12] origin-center">
          <video
            ref={videoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = 1.25;
            }}
            className="w-full h-full object-cover will-change-[filter] transition-[filter] duration-300 ease-out"
            style={{
              filter: scrollProgress > 0 ? `blur(${scrollProgress * 22}px)` : "none",
              WebkitFilter: scrollProgress > 0 ? `blur(${scrollProgress * 22}px)` : "none",
            }}
          />
        </div>
        {/* Ambient dark tint that deepens smoothly as you scroll */}
        <div 
          className="absolute inset-0 pointer-events-none transition-colors duration-300 ease-out"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${0.25 + scrollProgress * 0.55})`,
          }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Header (Responsive for Mobile, Folds, Tablets & Desktop)   */}
      {/* ------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 md:px-10 py-3.5 sm:py-5 md:py-6 flex justify-between items-center pointer-events-auto backdrop-blur-md md:backdrop-blur-none bg-black/20 md:bg-transparent border-b md:border-b-0 border-white/5">
        {/* Left: Brand Logo & Wordmark */}
        <div 
          onClick={() => scrollToSection("hero")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
          title="Rabta-e-Hayat"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden p-0.5 liquid-glass border border-white/20 group-hover:border-white/50 transition-all flex items-center justify-center bg-white shrink-0 shadow-lg">
            <img 
              src={logoImg} 
              alt="Rabta-e-Hayat Logo" 
              className="w-full h-full object-contain rounded-full" 
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5">
              <span className="text-[15px] sm:text-[17px] font-semibold tracking-tight text-white group-hover:text-white/80 transition-colors">
                Rabta-e-Hayat
              </span>
              <sup className="text-[8px] sm:text-[9px] font-semibold tracking-normal text-white/70">TM</sup>
            </div>
            <span 
              dir="rtl" 
              className="text-[10px] sm:text-[12px] text-white/60 -mt-0.5"
              style={{ fontFamily: "'Jameel Noori Nastaleeq Kasheeda', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
            >
              ایک قدم انسانیت کے لیے
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Pill (Hidden on Mobile/Folds, Visible on Tablets/Desktop) */}
        <nav className="hidden md:flex liquid-glass rounded-full px-2 py-2 items-center gap-1 shadow-lg select-none">
          <button
            onClick={() => handleOpenRequestBlood()}
            className="text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer"
          >
            REQUEST BLOOD
          </button>
          <button
            onClick={() => scrollToSection("about-us")}
            className="text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer"
          >
            ABOUT US
          </button>
          <button
            onClick={() => scrollToSection("hospitals")}
            className="text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer"
          >
            HOSPITAL NETWORK
          </button>
          <button
            onClick={() => scrollToSection("donate-us")}
            className="text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer"
          >
            DONATE US
          </button>
        </nav>

        {/* Right Desktop CTA Anchor / Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => handleOpenRequestBlood()}
            className="liquid-glass rounded-full px-4 sm:px-5 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-lg inline-flex items-center gap-1.5 select-none"
          >
            <span>REQUEST BLOOD</span>
            <ArrowUpRight size={13} className="text-white/80" />
          </button>
        </div>

        {/* Right Mobile Navigation Controls (Compact on Mobile & Folds) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleOpenRequestBlood()}
            className="liquid-glass rounded-full px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase text-white hover:bg-white/10 transition-all border border-white/20 shadow-md"
          >
            Request
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full liquid-glass border border-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[60px] z-40 p-4 bg-black/85 backdrop-blur-2xl border-b border-white/10 md:hidden animate-fadeIn space-y-3">
          <div className="flex flex-col gap-1.5 text-sm font-medium">
            <button
              onClick={() => handleOpenRequestBlood()}
              className="p-3 text-left rounded-2xl liquid-glass border border-white/10 text-white flex items-center justify-between cursor-pointer"
            >
              <span>Request Blood</span>
              <ArrowUpRight size={14} className="text-white/60" />
            </button>
            <button
              onClick={() => scrollToSection("about-us")}
              className="p-3 text-left rounded-2xl hover:bg-white/5 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => scrollToSection("hospitals")}
              className="p-3 text-left rounded-2xl hover:bg-white/5 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Hospital Network
            </button>
            <button
              onClick={() => scrollToSection("donate-us")}
              className="p-3 text-left rounded-2xl hover:bg-white/5 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Donate Us
            </button>
            <button
              onClick={() => scrollToSection("donate-us")}
              className="p-3 text-left rounded-2xl hover:bg-white/5 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              Volunteer As Donor
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <span>24/7 Emergency Line:</span>
            <a href="tel:+923105290577" className="text-white font-semibold flex items-center gap-1.5">
              <Phone size={12} /> +92 310 5290577
            </a>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. Hero Section (Full viewport height, responsive centered)   */}
      {/* ------------------------------------------------------------- */}
      <section 
        id="hero" 
        className="min-h-[92vh] sm:min-h-screen relative z-10 flex flex-col justify-between pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-8 md:px-10 select-none"
      >
        {/* Main Center Headline Area */}
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Subtle emblem badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-white/80 font-mono mb-2.5 sm:mb-3 border border-white/10 shadow-lg">
            <HeartPulse size={11} className="text-white animate-pulse" />
            <span>RABTA-E-HAYAT // EMERGENCY LIFELINE</span>
          </div>

          {/* Main Headline in Jameel Noori Nastaleeq Kasheeda */}
          <h1
            dir="rtl"
            className="font-normal text-center drop-shadow-[0_6px_36px_rgba(0,0,0,0.95)] select-text py-1 sm:py-2 px-2"
            style={{
              fontFamily: "'Jameel Noori Nastaleeq Kasheeda', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
              fontSize: "clamp(42px, 8.8vw, 116px)",
              lineHeight: 1.35,
            }}
          >
            <span className="block text-white">
              ایک قدم انسانیت کے لیے
            </span>
          </h1>

          {/* Sub-headline positioning */}
          <p 
            className="text-white/60 text-xs sm:text-sm md:text-base font-light max-w-xl mx-auto tracking-wide -mt-1 sm:mt-0 px-2"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            Connecting lives without delay &mdash; All-Pakistan emergency blood coordination welfare network.
          </p>
        </div>

        {/* Hero Bottom Block */}
        <div
          className={`flex flex-col items-center text-center max-w-2xl mx-auto gap-4 sm:gap-6 transition-all duration-1000 delay-300 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p
            className="text-[13px] sm:text-[15px] leading-relaxed text-center px-3"
            style={{ fontFamily: "'Barlow', sans-serif" }}
          >
            <span className="text-white">
              Our rapid emergency network coordinates donors, hospitals, and critical blood supplies across all cities of Pakistan.
            </span>
            <span className="text-white/55">
              {" "}Zero fees, direct humanitarian response, and complete privacy guaranteed.
            </span>
          </p>

          <button
            onClick={() => handleOpenRequestBlood()}
            className="w-full sm:w-auto bg-white text-black text-sm sm:text-[15px] font-medium rounded-full px-8 sm:px-9 py-3 sm:py-3.5 hover:scale-[1.03] hover:shadow-[0_0_36px_6px_rgba(255,255,255,0.25)] active:scale-[0.97] transition-all duration-200 cursor-pointer shadow-xl tracking-tight"
          >
            Request Urgent Blood
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. In-Page "About Us" Section                                 */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10">
        <AboutUsSection 
          onRequestBlood={handleOpenRequestBlood} 
          isHospitalExpanded={isHospitalExpanded}
          onToggleHospitalExpanded={setIsHospitalExpanded}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. In-Page "Donate Us" Section                                */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10">
        <DonateUsSection />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. Comprehensive Cinematic Footer                             */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10">
        <CinematicFooter 
          onRequestBlood={() => handleOpenRequestBlood()} 
          onScrollTo={scrollToSection} 
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 7. Ambient Sound Controls                                     */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
        <button
          onClick={toggleSound}
          className="liquid-glass rounded-full p-2.5 sm:p-3 text-white/70 hover:text-white hover:scale-105 transition-all duration-200 cursor-pointer border border-white/10 shadow-lg"
          title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
          aria-label="Toggle sound"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 8. Centered Animated Liquid Glass Request Blood Modal         */}
      {/* ------------------------------------------------------------- */}
      <RequestBloodModal
        isOpen={isRequestBloodOpen}
        onClose={() => {
          setIsRequestBloodOpen(false);
          setPreselectedHospital(null);
        }}
        preselectedHospital={preselectedHospital}
      />
    </div>
  );
}
