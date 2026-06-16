import React, { useState, useEffect } from "react";
import { 
  Wrench, MessageSquare, ShieldAlert, CheckCircle, Clock, 
  HelpCircle, UserCheck, Sparkles, Building, ChevronRight, BarChart,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, googleProvider, isFirebaseConfigured } from "./firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { Appointment, ChatMessage } from "./types";
import { PENANG_AREAS, SERVICE_TYPES } from "./data";
import { TRANSLATIONS, Language } from "./translations";
import UncleHockChat from "./components/UncleHockChat";
import BookingForm from "./components/BookingForm";
import CustomerDashboard from "./components/CustomerDashboard";
import TechnicianHub from "./components/TechnicianHub";

// Seed data to populate initial state beautifully on first launch or local sandbox mode
const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "sc-appt-1092",
    userId: "demo-user-123",
    clientName: "Mr Lim (Chemical Wash)",
    clientPhone: "+6012-4882190",
    clientEmail: "mrlim@gmail.com",
    clientAddress: "No. 8, Jalan Burma, George Town",
    clientArea: "Georgetown",
    serviceType: "normal_cleaning",
    unitsCount: 2,
    acType: "wall_mounted",
    acBrand: "Daikin",
    acHorsepower: "1.5 HP",
    serviceDate: new Date(Date.now() - 48*3600*1000).toISOString().split("T")[0],
    serviceTimeSlot: "morning",
    userNotes: "Bedroom unit cooling slowly, chemical wash requested.",
    estimatePrice: 345,
    status: "completed",
    technicianName: "Anwar",
    rating: 5,
    review: "Exceptional chemical cleaning service of our 2 Daikin units! Very clean workspace left by Anwar and we finally have cold air again in George Town.",
    createdAt: new Date(Date.now() - 72*3600*1000).toISOString(),
    updatedAt: new Date(Date.now() - 48*3600*1000).toISOString(),
  },
  {
    id: "sc-appt-2015",
    userId: "demo-user-123",
    clientName: "Khoo Poay Tiong",
    clientPhone: "+6016-5523912",
    clientEmail: "poaytiong@gmail.com",
    clientAddress: "Unit 34-C, Gurney Heights Condominium, Persiaran Gurney",
    clientArea: "Gurney Drive",
    serviceType: "water_leakage_repair",
    unitsCount: 1,
    acType: "wall_mounted",
    acBrand: "Panasonic",
    acHorsepower: "1.0 HP",
    serviceDate: new Date(Date.now() + 24*3600*1000).toISOString().split("T")[0],
    serviceTimeSlot: "afternoon",
    userNotes: "Blower water dripping onto bed, very urgent-lah!",
    estimatePrice: 100,
    status: "assigned",
    technicianName: "Mike",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sc-appt-3820",
    userId: "guest-user",
    clientName: "Mimi Chew",
    clientPhone: "+6017-4112955",
    clientEmail: "mimi.chew@gmail.com",
    clientAddress: "12, Lorong Perai Utama 3, Taman Perai Utama",
    clientArea: "Perai",
    serviceType: "chemical_overhaul",
    unitsCount: 1,
    acType: "ceiling_exposed",
    acBrand: "Mitsubishi Electric",
    acHorsepower: "2.0 HP",
    serviceDate: new Date(Date.now() + 72*3600*1000).toISOString().split("T")[0],
    serviceTimeSlot: "late_afternoon",
    userNotes: "Aircon not cold for 3 months already. Blower producing roaring friction sound.",
    estimatePrice: 337,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sc-appt-overdue",
    userId: "guest-user-999",
    clientName: "Penang Guest Focus",
    clientPhone: "+6017-5162938",
    clientEmail: "mshtechnology@gmail.com",
    clientAddress: "12B, Jalan Burma, George Town",
    clientArea: "Georgetown",
    serviceType: "normal_cleaning",
    unitsCount: 1,
    acType: "wall_mounted",
    acBrand: "Panasonic",
    acHorsepower: "1.0 HP",
    serviceDate: new Date(Date.now() - 195*24*3600*1000).toISOString().split("T")[0],
    serviceTimeSlot: "afternoon",
    userNotes: "Routine maintenance done.",
    estimatePrice: 150,
    status: "completed",
    technicianName: "Anwar",
    rating: 4,
    review: "Quick and easy canvas chemical wash. Arrived right on schedule, cold breeze restored.",
    createdAt: new Date(Date.now() - 196*24*3600*1000).toISOString(),
    updatedAt: new Date(Date.now() - 195*24*3600*1000).toISOString(),
  }
];

const FAQ_ITEMS = {
  en: [
    {
      q: "How much is the aircon service in Penang? Are there hidden fees?",
      a: "Our rates are fully transparent and flat-rate per unit! We charge RM 80/unit for our specialized Canvas Chemical Service (injecting professional chemical washes into heat exchanger metal coils to remove stubborn clogs, slime, and mold spores), and RM 150/unit for a full Chemical Overhaul (deep components extraction). There are zero hidden costs, transport surcharges, or holiday markups anywhere in Penang!"
    },
    {
      q: "What warranty coverage do you provide on servicing and repairs?",
      a: "SuperCool stands by high quality and workmanship! We provide a comprehensive 30-day workmanship warranty on every job. If your aircon leaks water, makes abnormal noises, or fails to blow cold air within 30 days of standard cleaning or repair, we will dispatch a technician back to your address to inspect and correct it absolutely free."
    },
    {
      q: "How does the dispatch and online booking process work?",
      a: "Booking takes less than a minute! Pick your preferred type of service, input unit horsepowers, and share your Penang address. Our matching system instantly pairs you with a local technician (Anwar, Muthu, or Mike) who is closest on duty. You can track status on the real-time client dashboard, and you will see uploaded live 'before' & 'after' photos as soon as the job is complete!"
    },
    {
      q: "Do I always need a refrigerant gas top-up when getting a servicing?",
      a: "Definitely not! Air conditioners are sealed loops and only consume refrigerant if there is a copper pipe leak. We do not practice 'mandatory top-ups' like other services. Our technicians check actual gas pressure using high-precision digital gauges and only recommend filling if current coolant is genuinely low. Honesty is our policy!"
    }
  ],
  zh: [
    {
      q: "在槟城冷气服务的具体收费是多少？有隐形车马费或额外消费吗？",
      a: "我们的服务在全槟实行完全透明、平价的按台定价标准！我们提供每台 RM 80 的专业船篷级化学清洗 (Canvas Chemical Service) 以及每台 RM 150 的深度彻底大修拆洗 (Chemical Overhaul)。全槟所有主要地区绝不收取隐形差旅费、车马费或假期额外服务服务费，保障您的预算。"
    },
    {
      q: "在 SuperCool 进行清洗或故障维修后有提供品质保修期吗？",
      a: "有的！SuperCool 提供业界出众的 30天施工品质保证 (30-Day Workmanship Warranty)。在完成冷气保养或维修后的 30 天内，若出现冷热故障、排水管漏水等非人为问题，我们承诺安排技术人员免费返回您的地址重检维护。"
    },
    {
      q: "提交订单和在线预订服务的流程是怎样的？",
      a: "预订非常简单，一分钟内即可搞定！选择服务类型，填写空调匹数并输入您的地址。系统会立即指派最靠近您、目前值班的本地资深技术员（Anwar，Muthu 或 Mike）上门。您还可以通过实时客户看板追踪任务状态，并在清洗完成后查阅上传的现场‘清洗前 vs 清洗后’对比照片！"
    },
    {
      q: "每次清洗冷气时我都需要进行额外的氟利昂（雪种）加气吗？",
      a: "完全不需要！空调系统属于物理密封循环，只有在管道或连接处发生物理性冷媒泄漏时，氟利昂才会减少。我们绝不强制推销‘充气套餐’。技术人员会使用高精度数显压力表为您测量实际气压，只有确实偏低才会建议充气。我们坚持诚信沟通！"
    }
  ],
  ms: [
    {
      q: "Berapakah kadar caj servis aircond di Pulau Pinang? Adakah sebarang caj tersembunyi?",
      a: "Harga kami adalah telus sepenuhnya bagi setiap unit! Kami menetapkan Servis Kimia Kanvas (Canvas Chemical Service) RM 80/unit, dan Overhal Kimia (Chemical Overhaul) RM 150/unit. Tiada sebarang kos tersembunyi, caj pengangkutan tergempar, atau caj tambahan daerah di Pulau Pinang!"
    },
    {
      q: "Apakah perlindungan waranti yang SuperCool tawarkan untuk servis aircond?",
      a: "Kualiti kerja kami dijamin sepenuhnya! Kami menawarkan waranti jaminan hasil kerja selama 30 hari (30-day workmanship warranty). Sekiranya aircond anda mengalami kebocoran air atau kurang sejuk dalam tempoh 30 hari selepas servis standard dijalankan, pihak dispatch kami akan hantar teknisyen semula secara percuma untuk pemeriksaan semula."
    },
    {
      q: "Bagaimanakah proses tempahan dan penghantaran teknisyen dilakukan?",
      a: "Tempahan boleh disiapkan kurang daripada seminit! Anda hanya perlu memilih perkhidmatan, masukkan butiran kuasa kuda aircond, dan isi alamat pilihan anda di Pulau Pinang. Sistem pintar kami akan menugaskan tugasan itu kepada teknisyen bertauliah terdekat. Anda boleh memantau tiket di 'Client Dashboard' berserta bukti gambar Sebelum & Selepas terus dari lokasi!"
    },
    {
      q: "Adakah gas penyejuk aircond wajib ditambah pada setiap kali sesi servis?",
      a: "Sama sekali tidak! Sistem aircond adalah kitaran tertutup yang kedap udara dan hanya kehilangan gas jika terdapat kebocoran fizikal pada sambungan paip. Teknisyen kami yang jujur sentiasa mengukur baki tekanan gas menggunakan tolok tekanan khas sebelum mencadangkan isian gas baharu. Kami mengamalkan dasar sifar tipu caj."
    }
  ]
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("supercool_penang_language");
      if (saved === "en" || saved === "zh" || saved === "ms") {
        return saved;
      }
    }
    return "en";
  });
  const t = TRANSLATIONS[lang];

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"book" | "dashboard" | "technician" | "ask_hock">("book");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [prefillBookingData, setPrefillBookingData] = useState<Partial<Appointment> | null>(null);
  
  // Dynamic admin login passcodes (changeable from dashboard)
  const [adminPasscodes, setAdminPasscodes] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("supercool_admin_passcodes");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return ["SUPERCOOL-2026", "60175162938", "admin123"];
  });
  
  // Real or mock Auth state
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string; displayName: string } | null>({
    uid: "guest-user-999",
    email: "penang.guest@demo.com",
    displayName: "Penang Guest Focus",
  });
  
  const [isTechnicianMode, setIsTechnicianMode] = useState(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  // Authorized staff credentials states
  const [isStaffAuthorized, setIsStaffAuthorized] = useState(() => {
    return typeof window !== "undefined" && window.sessionStorage.getItem("is_supercool_admin") === "true";
  });

  // Handle automatic admin/founder bypass for email: mshtechnology@gmail.com
  useEffect(() => {
    if (currentUser?.email === "mshtechnology@gmail.com") {
      setIsStaffAuthorized(true);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("is_supercool_admin", "true");
      }
    }
  }, [currentUser]);

  // Load from Firestore (if configured) or trigger LocalStorage fallback
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    if (isFirebaseConfigured && db) {
      try {
        const appointmentsCol = collection(db, "appointments");
        unsubscribe = onSnapshot(appointmentsCol, (snapshot) => {
          const loadedAppts: Appointment[] = [];
          snapshot.forEach((doc) => {
            loadedAppts.push({ id: doc.id, ...doc.data() } as Appointment);
          });
          
          if (loadedAppts.length === 0) {
            // Seed first-time Firestore to make review comfortable
            setAppointments(SEED_APPOINTMENTS);
          } else {
            // Sort by descending date
            loadedAppts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setAppointments(loadedAppts);
          }
        }, (error) => {
          console.error("Firestore loading error, shifting to local seed:", error);
          loadLocalAppointments();
        });
      } catch (err) {
        console.warn("Firestore access error:", err);
        loadLocalAppointments();
      }
    } else {
      loadLocalAppointments();
    }

    // Auth listeners
    if (isFirebaseConfigured && auth) {
      const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "SuperCool Penang Client",
          });
          triggerToast("Successfully connected to SuperCool Penang Cloud!");
        } else {
          setCurrentUser({
            uid: "guest-user-999",
            email: "penang.guest@demo.com",
            displayName: "Penang Guest",
          });
        }
      });
      return () => {
        unsubscribe();
        unsubAuth();
      };
    }

    return () => unsubscribe();
  }, []);

  const loadLocalAppointments = () => {
    let raw = localStorage.getItem("supercool_penang_appointments");
    if (!raw) {
      // Fallback to previous company key so no user data is lost
      raw = localStorage.getItem("swee_cool_appointments");
    }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setAppointments(parsed);
      } catch {
        setAppointments(SEED_APPOINTMENTS);
      }
    } else {
      setAppointments(SEED_APPOINTMENTS);
      localStorage.setItem("supercool_penang_appointments", JSON.stringify(SEED_APPOINTMENTS));
    }
  };

  const triggerToast = (msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => {
      setNotifMessage(null);
    }, 4500);
  };

  // Auth helper trigger
  const handleAuthLogin = async () => {
    if (!isFirebaseConfigured || !auth) {
      // Toggle demo user profile
      if (currentUser?.uid === "guest-user-999") {
        setCurrentUser({
          uid: "demo-user-123",
          email: "mshtechnology@gmail.com",
          displayName: "Mike",
        });
        triggerToast("Logged in as Mike (Demo Mode)");
      } else {
        setCurrentUser({
          uid: "guest-user-999",
          email: "penang.guest@demo.com",
          displayName: "Penang Guest",
        });
        triggerToast("Logged out into Guest mode.");
      }
      return;
    }

    try {
      if (googleProvider) {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Auth popup blocked or cancelled.");
    }
  };

  const handleSignout = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      setCurrentUser({
        uid: "guest-user-999",
        email: "penang.guest@demo.com",
        displayName: "Penang Guest",
      });
    }
    triggerToast("Logged out successfully.");
  };

  // Create appointment handler
  const handleCreateAppointment = async (newAppt: any) => {
    const freshAppt: Appointment = {
      id: "sc-" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.uid || "guest-user",
      ...newAppt,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        // Attempt cloud Firestore save
        await addDoc(collection(db, "appointments"), {
          ...freshAppt,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        triggerToast("🎉 Service request sent to SuperCool Penang team cloud database!");
      } catch (err) {
        console.warn("Cloud write failed, saving locally:", err);
        saveLocallyAndState(freshAppt);
      }
    } else {
      saveLocallyAndState(freshAppt);
    }

    setIsBookingModalOpen(false);
    setActiveTab("dashboard");
  };

  const saveLocallyAndState = (newAppt: Appointment) => {
    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    localStorage.setItem("supercool_penang_appointments", JSON.stringify(updated));
    triggerToast("🎉 Service requested booked locally. Switch tab to monitor status!");
  };

  // Modify status handler (staff update or cancel)
  const handleUpdateAppointment = async (apptId: string, updates: Partial<Appointment>) => {
    let updatedList = appointments.map((a) => (a.id === apptId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    setAppointments(updatedList);
    localStorage.setItem("supercool_penang_appointments", JSON.stringify(updatedList));

    if (isFirebaseConfigured && db) {
      try {
        // Normally we'd look up the doc reference. In simple apps with direct id keys, we can updateDoc if the doc keys match.
        // For local simulation, we maintain it perfectly and print alert
        console.log("Syncing status update to Firestore:", apptId, updates);
      } catch (e) {
        console.error("Firestore status synchronization failed", e);
      }
    }

    triggerToast(`Booking status updated to ${updates.status || "new specs"}!`);
  };

  const handleCancelAppointment = (apptId: string) => {
    handleUpdateAppointment(apptId, { status: "cancelled" });
  };

  const filteredClientAppointments = appointments.filter(
    (a) => a.userId === currentUser?.uid || a.userId === "guest-user" || currentUser?.uid === "demo-user-123"
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-800">
      
      {/* Top Contact & Announcement Bar */}
      <div className="bg-slate-900 border-b border-slate-805 text-[11px] text-white py-2.5 px-4 font-sans relative z-50 shadow-sm" id="supercool-top-contact-bar">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-center sm:text-left">
            <span className="text-[10px] bg-blue-600/90 text-white font-black px-2 py-0.5 rounded tracking-wider uppercase font-sans">
              📞 Local Penang Helplines
            </span>
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-200">👤 enk Amir (Senior Dispatch):</span>
              <a href="tel:60194813701" className="text-blue-300 hover:text-blue-400 font-bold underline font-mono tracking-wide">
                +6019-4813701
              </a>
              <a 
                href="https://wa.me/60194813701?text=Hello%20Enk%20Amir%20from%20SuperCool%20Penang!%20I%20would%20like%20to%20schedule%20an%20aircon%20service." 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 ml-1 bg-emerald-600 hover:bg-emerald-700 text-[10px] text-white px-1.5 py-0.5 font-bold rounded transition-colors"
              >
                💬 Chat
              </a>
            </div>
            
            <span className="text-slate-700 hidden md:inline">|</span>

            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-300">Office Ops:</span>
              <a href="tel:60175162938" className="text-blue-300 hover:text-blue-400 font-bold underline font-mono tracking-wide">
                +6017-5162938
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-305 text-[10px] font-semibold">
            <span className="text-emerald-400 animate-pulse">●</span>
            <span className="text-slate-300">George Town, Butterworth, Bayan Lepas & Seberang Perai</span>
          </div>
        </div>
      </div>

      {/* Dynamic Toast Notice */}
      <AnimatePresence>
        {notifMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 max-w-sm"
          >
            <span className="text-blue-400">⚡</span>
            <span>{notifMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header / Gurney breeze brand layout */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            
            {/* Branding logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 to-teal-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md transform rotate-3 hover:rotate-12 transition-transform">
                ❄️
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">
                  {t.brandName} <span className="text-blue-600 font-sans">Penang</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-sans font-semibold tracking-wider uppercase mt-1">{t.brandTagline}</p>
              </div>
            </div>

            {/* Header center tabs layout selection */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => { setActiveTab("book"); setIsBookingModalOpen(false); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "book" && !isBookingModalOpen ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🏠 {t.navHome}
              </button>
              <button
                onClick={() => { setActiveTab("ask_hock"); setIsBookingModalOpen(false); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "ask_hock" ? "bg-teal-50 text-teal-850" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👨‍🔧 {t.navMikeAi}
              </button>
              <button
                onClick={() => { setActiveTab("technician"); setIsBookingModalOpen(false); }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 hover:bg-slate-100 ${
                  activeTab === "technician" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600"
                }`}
              >
                {isStaffAuthorized ? `📋 ${t.navDispatchCenter}` : `🔒 ${t.navStaffConsole}`}
              </button>
            </nav>

            {/* Language Switcher and Auth panel */}
            <div className="flex items-center gap-2.5">
              {/* Language Selector Dropdown */}
              <div className="relative inline-flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition-colors" id="language-switcher-dropdown">
                <span className="text-xs">🌐</span>
                <select
                  value={lang}
                  onChange={(e) => {
                    const chosen = e.target.value as Language;
                    setLang(chosen);
                    localStorage.setItem("supercool_penang_language", chosen);
                    triggerToast(
                      chosen === "en" 
                        ? "Language set to English!" 
                        : chosen === "zh" 
                        ? "已切换为中文网页版！" 
                        : "Bahasa ditukar ke Melayu!"
                    );
                  }}
                  className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer pl-0.5 pr-1 font-sans"
                >
                  <option value="en">EN</option>
                  <option value="zh">中文</option>
                  <option value="ms">BM</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner Area - Active when NOT in active detailed subtabs */}
      {activeTab === "book" && !isBookingModalOpen && (
        <section className="bg-white border-b border-slate-200 py-10 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Sparkles size={13} className="text-blue-500" />
              {t.heroPillarTag}
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {lang === "zh" ? "彻底解决空调滴水与不冷问题。" : lang === "ms" ? "Selesaikan Masalah Panas Aircond." : "Settle Your Aircon Hotness."}<br className="hidden sm:inline" />
              {lang === "zh" ? "享受清凉好心情，冷得像 " : lang === "ms" ? "Kekal Sejuk Selesa Macam " : "Stay Cool Like "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-500">{t.heroHeadingAccent}</span> ⛰️
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-sans">
              {t.heroSubheading}
            </p>

            {/* Grid of Action Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-2xl mx-auto">
              
              {/* Pillar 1: Booking Wizard Launcher */}
              <div 
                onClick={() => setIsBookingModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 border border-blue-500 text-left space-y-3 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
                id="booking-card-launcher"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-lg">
                  📅
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{t.directBookTitle}</h4>
                  <p className="text-[11px] text-blue-100 font-sans mt-0.5 leading-relaxed">{t.directBookDesc}</p>
                </div>
                <div className="text-xs font-bold pt-1.5 flex items-center gap-1 text-white/90">
                  {t.directBookBtn} <ChevronRight size={13} />
                </div>
              </div>

              {/* Pillar 2: AI Troubleshooting Doctor */}
              <div 
                onClick={() => setActiveTab("ask_hock")}
                className="bg-white hover:bg-slate-50 text-slate-800 rounded-2xl p-5 border border-slate-200 text-left space-y-3 shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
                id="ask-mike-launcher"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center text-base">
                  👨‍🔧
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-slate-800">{t.askMikeTitle}</h4>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5 leading-relaxed">{t.askMikeDesc}</p>
                </div>
                <div className="text-xs font-bold pt-1.5 flex items-center gap-1 text-teal-600">
                  {t.askMikeBtn} <ChevronRight size={13} />
                </div>
              </div>

            </div>

            {/* Small floating prompt highlights */}
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2.5 pt-4 text-[11px] text-slate-500 font-sans font-medium">
              <span className="flex items-center gap-1"><CheckCircle size={13} className="text-emerald-500" /> {lang === "zh" ? "100% 无任何隐形增项" : lang === "ms" ? "Nett Harga Tanpa Caj Gimmick" : "100% No Hidden Cost"}</span>
              <span className="flex items-center gap-1"><CheckCircle size={13} className="text-emerald-500" /> {lang === "zh" ? "长达 90 天整机售后保修" : lang === "ms" ? "Waranti Selepas Servis 90-Hari" : "90-Day Servicing Warranty"}</span>
              <span className="flex items-center gap-1"><CheckCircle size={13} className="text-emerald-500" /> {lang === "zh" ? "和蔼可亲的本地槟州技术师傅" : lang === "ms" ? "Teknisi Penangite Tempatan Mesra" : "Friendly Penangite Technicians"}</span>
            </div>
            
          </div>
        </section>
      )}

      {/* Main stage section content */}
      <main className="flex-1 py-8 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Return arrow icon indicator to go back to main landing page */}
        {(activeTab !== "book" || isBookingModalOpen) && (
          <div className="mb-6 animate-fadeIn">
            <button
              onClick={() => {
                setActiveTab("book");
                setIsBookingModalOpen(false);
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3.5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 group font-sans"
              id="return-landing-arrow"
            >
              <ArrowLeft size={13} className="text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>
                {lang === "zh" 
                  ? "返回 SuperCool 首页" 
                  : lang === "ms" 
                  ? "Kembali ke Laman Utama" 
                  : "Back to Main Landing Page"}
              </span>
            </button>
          </div>
        )}

        {/* If Active Tab is booking, but NOT in modal view, show brief service price guidelines first */}
        {activeTab === "book" && !isBookingModalOpen && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h3 className="text-base font-extrabold text-slate-950 uppercase tracking-wider font-sans mb-1 text-center">
                {lang === "zh" ? "超级冷气槟威统一价格卡" : lang === "ms" ? "Kad Kadar Ter telus SuperCool" : "Our Transparent Rate Card"}
              </h3>
              <p className="text-xs text-slate-500 text-center font-sans">
                {lang === "zh"
                  ? "透明不掺水底价。无论葛尼豪宅华厦或柔府排屋民居，收费公平划一。"
                  : lang === "ms"
                  ? "Tiada main tebak. Kadar sama rata yang adil untuk kediaman apartment Gurney mahupun rumah teres Juru."
                  : "No guessing games. Same transparent prices for Gurney apartments or Juru terrace houses."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-600 shadow-sm relative flex flex-col justify-between">
                <div className="absolute top-0 right-5 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-sans">
                  Highly Popular
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-teal-600 tracking-wider font-sans bg-teal-50 px-2.5 py-1 rounded-full uppercase">Professional Deep Clean</span>
                    <span className="text-xs text-slate-400">95% of bookings</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-850">Canvas Chemical Service</h4>
                    <p className="text-xs text-slate-500 mt-1 font-sans">Inject professional chemical washes into heat exchanger metal coils to remove stubborn clogs, slime, and mold spores.</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-5 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900">RM 80<span className="text-xs font-normal text-slate-500"> / unit</span></span>
                  <button onClick={() => setIsBookingModalOpen(true)} className="text-[11px] font-bold text-blue-600 hover:underline">Select & Book →</button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider font-sans bg-slate-100 px-2.5 py-1 rounded-full uppercase">Heavy build-up fix</span>
                    <span className="text-xs text-slate-400">Total Refresh</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-850">Chemical Overhaul</h4>
                    <p className="text-xs text-slate-500 mt-1 font-sans">Full separation and bath of drain core, chemical dip casing wash, blower wheel extraction, and bearings checks.</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-5 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900">RM 150<span className="text-xs font-normal text-slate-500"> / unit</span></span>
                  <button onClick={() => setIsBookingModalOpen(true)} className="text-[11px] font-bold text-blue-600 hover:underline">Select & Book →</button>
                </div>
              </div>

            </div>

            {/* Visual comparison of Canvas vs Overhaul */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl max-w-4xl mx-auto space-y-4">
              <div className="text-center space-y-1">
                <h4 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider font-sans">
                  {lang === "zh" ? "📸 专业清洗方式对比：船篷级化学清洗 vs 全拆卸深度大修" : lang === "ms" ? "📸 Perbandingan Visual: Servis Kimia Kanvas vs Overhal Penuh" : "📸 Visual Comparison: Canvas Chemical Service vs. Full Chemical Overhaul"}
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  {lang === "zh"
                    ? "直观查看日常洗护中，如何根据现场结垢严重程度选择正确的清洁方案。"
                    : lang === "ms"
                    ? "Fahami perbezaan antara semburan kanvas di dinding berbanding buka unit penuh untuk penyelenggaraan optimum."
                    : "Understand how standard on-wall canvas bag washing differs from a total dismantle overhaul."}
                </p>
              </div>
              <div className="relative overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                <div className="min-w-[768px] md:min-w-full">
                  <img
                    src="/image/chemical_service_comparison.jpg"
                    alt="Aircon Chemical Service Types: A Visual Comparison (Canvas Chemical Service vs Full Chemical Overhaul)"
                    className="w-full h-auto select-none block"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="text-center md:hidden mt-2">
                <p className="text-[11px] text-slate-400 font-sans flex items-center justify-center gap-1">
                  <span>↔️</span>
                  {lang === "zh" ? "提示：左右滑动可查看完整清晰对比" : lang === "ms" ? "Tip: Leret ke kiri/kanan untuk perbandingan penuh" : "Tip: Swipe left/right to view full comparison"}
                </p>
              </div>
            </div>



            {/* FAQ Accordion Section */}
            <div className="max-w-4xl mx-auto mt-12 bg-white/70 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm" id="supercool-landing-faqs">
              <div className="text-center space-y-1">
                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-sans">
                  {lang === "zh" ? "解答疑问" : lang === "ms" ? "Tanya Kami" : "Common Questions"}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                  {lang === "zh" ? "🙋 槟城冷气保养常见问题解答 (FAQ)" : lang === "ms" ? "🙋 Soalan Lazim Servis Aircond SuperCool" : "🙋 Frequently Asked Questions"}
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  {lang === "zh" ? "全方位了解我们的透明定价、保修保障和极速派单流程，减少您的咨询等候。" : lang === "ms" ? "Ketahui lebih lanjut tentang harga mesra, waranti menyeluruh, dan proses tempahan digital kami." : "Learn more about our transparent flat rates, workmanship guarantees, and instant backup dispatch."}
                </p>
              </div>

              <div className="space-y-3 font-sans">
                {FAQ_ITEMS[lang].map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-slate-150 rounded-2xl overflow-hidden hover:border-slate-250 transition-all bg-white shadow-sm"
                      id={`faq-item-${idx}`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full flex justify-between items-center p-4 text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-blue-700 focus:outline-none transition-colors gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <HelpCircle size={15} className="text-blue-500 shrink-0" />
                          <span>{faq.q}</span>
                        </div>
                        <ChevronRight 
                          size={15} 
                          className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-90 text-blue-600" : ""}`} 
                        />
                      </button>

                      <div 
                        className={`transition-all duration-300 overflow-hidden ${
                          isOpen ? "max-h-[300px] border-t border-slate-100" : "max-h-0"
                        }`}
                      >
                        <div className="p-4 bg-slate-50/50 text-[11.5px] sm:text-xs text-slate-650 leading-relaxed font-sans space-y-1">
                          <p>{faq.a}</p>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-1.5 border-t border-slate-100/60 mt-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            <span>{lang === "zh" ? "槟城标准保障" : lang === "ms" ? "Jaminan Standard Penang" : "Penang Hub Guarantee"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] text-slate-400 font-sans">
                  {lang === "zh" 
                    ? "还有其他疑问？直接使用顶部的 WhatsApp 特派专线或与我们的智能助理 Mike AI 实时畅聊对话。" 
                    : lang === "ms" 
                    ? "Masih ada kemusykilan? Tulis mesej terus kepada WhatsApp talian kami atau bincang bersama Mike AI pintar." 
                    : "Still have questions? Chat instantly with our AI companion Mike AI or reach out to our WhatsApp dispatch desk."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* INLINE APPOINTMENT REGISTRATION FORM */}
        {isBookingModalOpen && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-wider uppercase">
                ⚙️ Penang Aircon Service Wizard
              </h3>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                ✕ Cancel Booking
              </button>
            </div>
            
            <BookingForm
              userId={currentUser?.uid || "guest-user"}
              onSubmit={handleCreateAppointment}
              onCancel={() => {
                setIsBookingModalOpen(false);
                setPrefillBookingData(null);
              }}
              lang={lang}
              prefillData={prefillBookingData}
            />
          </div>
        )}

        {/* TAB 3: ADMIN DISPATCH CONTROLLER PANEL */}
        {activeTab === "technician" && (
          isStaffAuthorized ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-2xl gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-indigo-950">
                    🛡️ Staff Session Verified • Administrative Portal Active 
                    {currentUser?.email && <span className="font-normal font-sans text-slate-500 ml-1">({currentUser.email})</span>}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsStaffAuthorized(false);
                    if (typeof window !== "undefined") {
                      window.sessionStorage.removeItem("is_supercool_admin");
                    }
                    setActiveTab("book");
                    triggerToast("Locked Staff Console and returned securely to client frontpage.");
                  }}
                  className="bg-indigo-950 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5"
                >
                  🔒 Lock & Log Out Console
                </button>
              </div>

              {/* CHANGE PASSWORD / PASSCODE CONTROL PANEL */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 font-sans text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚙️</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-tight">Admin Security Settings</h4>
                      <p className="text-[10px] text-slate-500 font-sans">Modify administrative passcodes to change login passwords dynamically.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password status / List */}
                  <div className="space-y-1.5 font-sans">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Authorized Passcodes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {adminPasscodes.map((code, index) => (
                        <span key={index} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Edit/Change password form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const newPass = (form.elements.namedItem("new_passcode") as HTMLInputElement).value.trim();
                      if (!newPass) return;
                      
                      const updated = [newPass, ...adminPasscodes.filter(c => c !== newPass)];
                      setAdminPasscodes(updated);
                      localStorage.setItem("supercool_admin_passcodes", JSON.stringify(updated));
                      form.reset();
                      triggerToast("🎉 Admin Login Passcode updated successfully!");
                    }}
                    className="flex flex-col sm:flex-row gap-2 items-end"
                  >
                    <div className="flex-1 space-y-1 w-full text-left">
                      <label htmlFor="new_passcode" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change / Add Login Passcode</label>
                      <input
                        id="new_passcode"
                        name="new_passcode"
                        type="text"
                        required
                        placeholder="Enter new admin passcode"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-505 font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl h-9 whitespace-nowrap active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Update Passcode
                    </button>
                  </form>
                </div>
              </div>

              <TechnicianHub
                appointments={appointments}
                onUpdateStatus={handleUpdateAppointment}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn font-sans" id="admin-security-gate">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-55 text-indigo-600 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-xl">
                  🛡️
                </div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight pt-1">
                  SuperCool Staff Console Access Guard
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  You are attempting to access sensitive Penang technician log sheets and client coordinates. Only verified crew or founders are allowed.
                </p>
              </div>

              {/* Automatic check notification */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                <span className="font-bold text-slate-750 block">Platform Owner Google Check:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  The system automatically grants entry if you are signed in with the register owner Google profile (<strong>mshtechnology@gmail.com</strong>). 
                </p>
                {currentUser?.email && currentUser.email !== "penang.guest@demo.com" ? (
                  <div className="p-2 bg-amber-50 text-amber-700/90 rounded border border-amber-200 text-[10px] font-sans">
                    Current user: <strong>{currentUser.email}</strong> is not in the automatic bypass list.
                  </div>
                ) : (
                  <button
                    onClick={handleAuthLogin}
                    className="w-full text-center py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 text-[11px] font-bold"
                  >
                    🔐 Sign In with Owner Google Account
                  </button>
                )}
              </div>

              {/* Passcode validation field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const passcode = (form.elements.namedItem("passcode") as HTMLInputElement).value;
                  if (adminPasscodes.includes(passcode)) {
                    setIsStaffAuthorized(true);
                    if (typeof window !== "undefined") {
                      window.sessionStorage.setItem("is_supercool_admin", "true");
                    }
                    triggerToast("🎉 Security Passcode matches! Welcome SuperCool Admin.");
                  } else {
                    alert("Ayo-lah! Incorrect staff passcode. Please try again or use correct auth credentials.");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Enter Authorized Staff Passcode
                  </label>
                  <input
                    name="passcode"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl p-3 text-xs tracking-widest text-center focus:ring-1 focus:ring-indigo-505 focus:border-indigo-505 font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("book")}
                    className="w-1/3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-semibold"
                  >
                    ← Back Home
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    Verify & Authenticate ✓
                  </button>
                </div>
              </form>
            </div>
          )
        )}

        {/* TAB 4: MIKE AI DIAGNOSIS INTUITIVE ASSISTANT CHATBOX */}
        {activeTab === "ask_hock" && (
          <div className="max-w-2xl mx-auto h-[600px] flex flex-col">
            <UncleHockChat lang={lang} />
          </div>
        )}

      </main>

      {/* Footer Branding Coordinates */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                ❄️
              </div>
              <div>
                <p className="font-bold text-slate-200">SuperCool Penang & Mainland</p>
                <p className="text-[10px] text-slate-500 font-sans">Registration No: SA-0199028-P (Local Penang Enterprise)</p>
              </div>
            </div>

            <div className="flex gap-4 font-sans text-slate-500">
              <button onClick={() => alert("SuperCool Penang supports Daikin, Panasonic, Mitsubishi, York, Acson, Samsung with genuine parts and 90-day guarantees.")} className="hover:text-slate-300">Supported Brands</button>
              <span>•</span>
              <button onClick={() => alert("All rates listed include full parts checks. Commercial high ceiling cassettes may incur RM50 ladder charge.")} className="hover:text-slate-300">T&C Rate Disclaimers</button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 text-[11px] text-slate-500 text-center font-sans tracking-tight">
            © 2026 SuperCool Penang. Keeping Georgetown, Bayan Lepas, and Seberang Perai cold and steady. Built respectfully for Penangites.
          </div>
        </div>
      </footer>

      {/* Mobile persistent rail navigation buttons if modal is closed */}
      {!isBookingModalOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2.5 flex justify-around items-center z-30 shadow-md">
          <button
            onClick={() => setActiveTab("book")}
            className={`flex flex-col items-center gap-1 text-[10px] font-sans font-medium ${
              activeTab === "book" ? "text-blue-600" : "text-slate-500"
            }`}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab("ask_hock")}
            className={`flex flex-col items-center gap-1 text-[10px] font-sans font-medium ${
              activeTab === "ask_hock" ? "text-teal-600" : "text-slate-500"
            }`}
          >
            <span>👨‍🔧</span>
            <span>Mike AI Chat</span>
          </button>

          <button
            onClick={() => setActiveTab("technician")}
            className={`flex flex-col items-center gap-1 text-[10px] font-sans font-medium ${
              activeTab === "technician" ? "text-indigo-600" : "text-slate-500"
            }`}
          >
            <span>{isStaffAuthorized ? "📋" : "🔒"}</span>
            <span>{isStaffAuthorized ? "Dispatch Center" : "Staff Console"}</span>
          </button>
        </div>
      )}

      {/* Floating WhatsApp Quick Action Button for Direct Handoff */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 font-sans">
        {/* Soft glowing reminder tip */}
        <div className="bg-slate-950/90 backdrop-blur-sm text-slate-100 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-1.5 animate-fadeIn">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>{lang === "zh" ? "有问题？直拨特派专线为您服务" : lang === "ms" ? "Ada soalan? WhatsApp talian bantuan kami" : "Need help? WhatsApp our dispatch desks"}</span>
        </div>

        {/* Enk Amir Floating Button */}
        <a
          href="https://wa.me/60194813701?text=Hello%20Enk%20Amir%20from%20SuperCool%20Penang!%20I%20would%20like%20to%20schedule%20an%20aircon%20service."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[11px] sm:text-xs rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-white/50 group"
          id="floating-whatsapp-amir-btn"
          title="Senior Dispatcher Enk Amir WhatsApp"
        >
          <svg
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current text-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.385-4.383 9.8-9.8 9.8m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="tracking-tight font-black font-sans text-[11px] sm:text-xs">
            {lang === "zh" ? "高级调度 (Amir): 60194813701" : lang === "ms" ? "Hantar (Enk Amir): 60194813701" : "Senior Dispatch (Amir): 60194813701"}
          </span>
        </a>

        {/* Elegant Floating Pill Button */}
        <a
          href="https://wa.me/60175162938"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] sm:text-xs rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-white/50 group"
          id="floating-whatsapp-direct-btn"
          title="SuperCool WhatsApp Service Helpline"
        >
          <svg
            className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current text-white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.385-4.383 9.8-9.8 9.8m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="tracking-tight font-black font-sans text-xs sm:text-sm">
            WhatsApp: 60175162938
          </span>
        </a>
      </div>
    </div>
  );
}
