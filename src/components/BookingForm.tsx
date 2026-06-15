import React, { useState, useEffect } from "react";
import { 
  Wrench, User, Calendar, CheckSquare, ChevronRight, ChevronLeft, 
  Settings, Percent, DollarSign, Building, Phone, Mail, MapPin, Sparkles, MessageSquare
} from "lucide-react";
import { PenangArea, ServiceType, AcType, AcHorsepower, Appointment } from "../types";
import { PENANG_AREAS, SERVICE_TYPES, POPULAR_BRANDS, calculateEstimatedPrice } from "../data";
import { TRANSLATIONS, Language } from "../translations";

interface BookingFormProps {
  userId: string;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  lang?: Language;
  prefillData?: Partial<Appointment> | null;
}

export default function BookingForm({ userId, onSubmit, onCancel, lang = "en", prefillData }: BookingFormProps) {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType>("normal_cleaning");
  const [unitsCount, setUnitsCount] = useState<number>(1);
  const [acType, setAcType] = useState<AcType>("wall_mounted");
  const [acBrand, setAcBrand] = useState<string>("Daikin");
  const [acHorsepower, setAcHorsepower] = useState<AcHorsepower>("1.0 HP");

  // Client info
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientArea, setClientArea] = useState<PenangArea>("Georgetown");
  const [clientAddress, setClientAddress] = useState("");

  // Timing info
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTimeSlot, setServiceTimeSlot] = useState<"morning" | "afternoon" | "late_afternoon">("morning");
  const [userNotes, setUserNotes] = useState("");

  // Estimation state
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Set min date to today's date for Penang residential appointment scheduling
  const [minDateString, setMinDateString] = useState("");

  // Trigger prefill when loaded or changed
  useEffect(() => {
    if (prefillData) {
      if (prefillData.serviceType) setServiceType(prefillData.serviceType);
      if (prefillData.unitsCount) setUnitsCount(prefillData.unitsCount);
      if (prefillData.acType) setAcType(prefillData.acType);
      if (prefillData.acBrand) setAcBrand(prefillData.acBrand);
      if (prefillData.acHorsepower) setAcHorsepower(prefillData.acHorsepower);
      if (prefillData.clientName) setClientName(prefillData.clientName);
      if (prefillData.clientPhone) setClientPhone(prefillData.clientPhone);
      if (prefillData.clientEmail) setClientEmail(prefillData.clientEmail);
      if (prefillData.clientArea) setClientArea(prefillData.clientArea);
      if (prefillData.clientAddress) setClientAddress(prefillData.clientAddress);
    }
  }, [prefillData]);

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setMinDateString(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    const calculated = calculateEstimatedPrice(serviceType, unitsCount, acHorsepower);
    setEstimatedPrice(calculated);
  }, [serviceType, unitsCount, acHorsepower]);

  const validateStep = () => {
    switch (step) {
      case 1:
        return unitsCount >= 1 && unitsCount <= 50;
      case 2:
        return (
          clientName.trim().length >= 3 &&
          clientPhone.trim().length >= 9 &&
          clientEmail.trim().includes("@") &&
          clientAddress.trim().length >= 10
        );
      case 3:
        return serviceDate !== "";
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep((p) => p + 1);
    }
  };

  const handlePrevStep = () => {
    setStep((p) => p - 1);
  };

  const getWhatsAppUrl = () => {
    const serviceTitle = currentServiceInfo?.title || serviceType;
    const slotName = serviceTimeSlot === "morning"
      ? "Morning (09:00 AM - 12:00 PM)"
      : serviceTimeSlot === "afternoon"
      ? "Afternoon (01:00 PM - 04:00 PM)"
      : "Late Afternoon (04:00 PM - 07:00 PM)";
    
    const text = `*NEW BOOKING DETAILS - SUPERCOOL PENANG* ❄️\n\n` +
      `👤 *Customer Name:* ${clientName}\n` +
      `📞 *Phone Number:* ${clientPhone}\n` +
      `✉️ *Email:* ${clientEmail}\n` +
      `🛠️ *Service Type:* ${serviceTitle}\n` +
      `🔢 *Units:* ${unitsCount} Unit(s)\n` +
      `🏷️ *Brand & Model:* ${acBrand} (${acType === "wall_mounted" ? "Wall Mounted" : acType === "cassette" ? "Cassette" : "Ceiling Exposed"} / ${acHorsepower})\n` +
      `📅 *Appointment Date:* ${serviceDate}\n` +
      `🕒 *Time Slot:* ${slotName}\n` +
      `📍 *Penang Region:* ${clientArea}\n` +
      `🏠 *Servicing Address:* ${clientAddress}\n` +
      (userNotes ? `📝 *Additional Notes:* ${userNotes}\n` : "") +
      `💰 *Guaranteed Price Estimate:* RM ${estimatedPrice}.00\n\n` +
      `Please confirm our appointment on your system! Thank you!`;

    return `https://wa.me/60175162938?text=${encodeURIComponent(text)}`;
  };

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    const newBooking = {
      serviceType,
      unitsCount,
      acType,
      acBrand,
      acHorsepower,
      clientName,
      clientPhone,
      clientEmail,
      clientArea,
      clientAddress,
      serviceDate,
      serviceTimeSlot,
      userNotes,
      estimatePrice: estimatedPrice,
    };
    onSubmit(newBooking);
    setIsSuccessModalOpen(true);

    // Redirect to WhatsApp with finalized details
    const url = getWhatsAppUrl();
    try {
      window.open(url, "_blank");
    } catch (e_err) {
      console.warn("Popup blocked inside sandboxed iframe", e_err);
    }
  };

  const currentServiceInfo = SERVICE_TYPES[serviceType];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-150 overflow-hidden" id="booking-wizard">
      {/* Wizard Progress Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[
            { num: 1, label: lang === "zh" ? "服务选择" : lang === "ms" ? "Pilih Servis" : "Services", desc: lang === "zh" ? "配置" : lang === "ms" ? "Pilihan" : "Select options" },
            { num: 2, label: lang === "zh" ? "服务地址" : lang === "ms" ? "Kawasan" : "Location", desc: lang === "zh" ? "区域" : lang === "ms" ? "Penang" : "Penang Area" },
            { num: 3, label: lang === "zh" ? "约定时间" : lang === "ms" ? "Masa" : "Schedule", desc: lang === "zh" ? "时段" : lang === "ms" ? "Slot" : "Select time" },
            { num: 4, label: lang === "zh" ? "账单核对" : lang === "ms" ? "Semakan" : "Review", desc: lang === "zh" ? "确认" : lang === "ms" ? "Sah" : "Final check" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 transition-all duration-300 ${
                  step === s.num
                    ? "bg-blue-600 text-white ring-blue-100"
                    : step > s.num
                    ? "bg-emerald-500 text-white ring-emerald-50"
                    : "bg-slate-200 text-slate-500 ring-transparent"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span className="text-[10px] font-medium text-slate-600 mt-1">{s.label}</span>

              {s.num < 4 && (
                <div
                  className={`absolute top-4 left-[60%] right-[-40%] h-0.5 -translate-y-1/2 z-0 ${
                    step > s.num ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleFormSubmission} className="space-y-6">
          {/* STEP 1: SERVICE TYPE & AIRCON DETAILS */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><Wrench size={16} /></span>
                  {t.fieldSelectService}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{t.fieldSelectServiceSub}</p>
              </div>

              {/* Service Type Selection Block Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="service-types-grid">
                {Object.entries(SERVICE_TYPES).map(([typeKey, val]) => (
                  <label
                    key={typeKey}
                    className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50/50 ${
                      serviceType === typeKey
                        ? "border-blue-600 bg-blue-50/35 shadow-sm"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
                        <input
                          type="radio"
                          name="serviceType"
                          value={typeKey}
                          checked={serviceType === typeKey}
                          onChange={() => setServiceType(typeKey as ServiceType)}
                          className="mr-1.5 accent-blue-600 h-4 w-4"
                        />
                        {t[`${typeKey}_title` as keyof typeof t] || val.title}
                      </div>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                        {lang === "zh" ? "起" : lang === "ms" ? "Dari" : "From"} RM {val.basePrice}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-sans mt-2 grow leading-relaxed">
                      {t[`${typeKey}_desc` as keyof typeof t] || val.description}
                    </p>
                  </label>
                ))}
              </div>

              {/* Specific Aircon details */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-150 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase font-sans">
                  {lang === "zh" ? "冷气机体硬件指标:" : lang === "ms" ? "Spesifikasi Penghawa Dingin:" : "Air Conditioning Specifications:"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Brand Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t.fieldAcBrand}:</label>
                    <select
                      value={acBrand}
                      onChange={(e) => setAcBrand(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      {POPULAR_BRANDS.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Horsepower selects */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t.fieldAcHorsepower}:</label>
                    <select
                      value={acHorsepower}
                      onChange={(e) => setAcHorsepower(e.target.value as AcHorsepower)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <option value="1.0 HP">1.0 HP ({lang === "zh" ? "标准卧室" : lang === "ms" ? "Bilik Tidur Standard" : "Standard Bedroom"})</option>
                      <option value="1.5 HP">1.5 HP ({lang === "zh" ? "大卧室 / 小客厅" : lang === "ms" ? "Bilik Besar / Ruang Tamu" : "Large Bedroom / Living Room"})</option>
                      <option value="2.0 HP">2.0 HP ({lang === "zh" ? "中型家用客厅" : lang === "ms" ? "Ruang Tamu Sederhana" : "Medium Living Hall"})</option>
                      <option value="2.5 HP or above">2.5 HP or above ({lang === "zh" ? "商业写字楼/大礼堂" : lang === "ms" ? "Komersial/Dewan Besar" : "Commercial/Large Hall"})</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* AC Style */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {lang === "zh" ? "冷气机拼装类型:" : lang === "ms" ? "Jenis Pemasangan Unit:" : "Unit Placement / Type:"}
                    </label>
                    <div className="flex gap-2">
                      {[
                        { val: "wall_mounted", label: lang === "zh" ? "挂壁式" : lang === "ms" ? "Dinding" : "Wall" },
                        { val: "cassette", label: lang === "zh" ? "天花嵌入" : lang === "ms" ? "Kaset" : "Cassette" },
                        { val: "ceiling_exposed", label: lang === "zh" ? "吊顶式" : lang === "ms" ? "Siling" : "Ceiling" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setAcType(item.val as AcType)}
                          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                            acType === item.val
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Units Input Count */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      {lang === "zh" ? "待修/清洗台数" : lang === "ms" ? "Bilangan Unit Aircond" : "Number of Aircon Units"}: <span className="text-blue-600 font-bold ml-1">{unitsCount} {lang === "zh" ? "台" : "unit(s)"}</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setUnitsCount((c) => Math.max(1, c - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-250 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={unitsCount}
                        onChange={(e) => setUnitsCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center text-xs font-semibold text-slate-800 border-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setUnitsCount((c) => Math.min(50, c + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-250 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT & PENANG LOCAL AREA */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><Building size={16} /></span>
                  {lang === "zh" ? "我们要派遣服务工程车前往槟城哪里？" : lang === "ms" ? "Di manakah di Penang patut kami hantar van servis?" : "Where in Penang should we send our servicing van?"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{t.fieldClientAreaSub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.fieldClientName}:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={lang === "zh" ? "例如：陈阿九" : lang === "ms" ? "cth., Ahmad Tan" : "e.g. Tan Ah Kow"}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* HP Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.fieldClientPhone}:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g., +6012-3456789"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.fieldClientEmail}:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. ahkow@gmail.com"
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                {/* Local Area Group Selected */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.fieldClientArea}:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <MapPin size={14} />
                    </span>
                    <select
                      value={clientArea}
                      onChange={(e) => setClientArea(e.target.value as PenangArea)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <optgroup label={lang === "zh" ? "🏝️ 槟岛地区 (Island)" : lang === "ms" ? "🏝️ Kawasan Pulau Pinang" : "🏝️ Penang Island Area"}>
                        {PENANG_AREAS.filter((a) => a.zone === "Island").map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label={lang === "zh" ? "🌉 威省 / 大陆地区 (Mainland)" : lang === "ms" ? "🌉 Kawasan Seberang Perai" : "🌉 Seberang Perai / Mainland Area"}>
                        {PENANG_AREAS.filter((a) => a.zone === "Mainland").map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.label}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              {/* Detailed Road/Home Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t.fieldClientAddress}:</label>
                <textarea
                  required
                  rows={3}
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder={lang === "zh" ? "例如：槟岛葛尼路 28 号，Gurney Heights 豪华公寓，A栋 12-B号" : lang === "ms" ? "cth., No. 28, Lorong Gurney 3, Gurney Heights Condominium, Block A Unit 12-B" : "e.g., No. 28, Lorong Gurney 3, Gurney Heights Condominium, Block A Unit 12-B"}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 resize-none font-sans"
                />
                <p className="text-[10px] text-slate-400 mt-1">{t.fieldClientAddressSub}</p>
              </div>
            </div>
          )}

          {/* STEP 3: SCHEDULE DETAILS */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><Calendar size={16} /></span>
                  {lang === "zh" ? "您倾向哪个冷气保养服务时间段？" : lang === "ms" ? "Bila slot masa perkhidmatan aircond pilihan anda?" : "When is your preferred aircon service slot?"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{t.fieldServiceSlotSub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Calendar Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">{t.fieldServiceDate}:</label>
                  <input
                    type="date"
                    required
                    min={minDateString}
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                  <div className="mt-3 bg-blue-50/50 rounded-lg border border-blue-100 p-3">
                    <p className="text-[10px] text-blue-800 font-sans leading-relaxed flex items-center gap-1">
                      <Sparkles size={11} className="text-blue-600" />
                      {lang === "zh" ? "小贴士：选择周中时段能享受更好的上门调度以及师傅效率！" : lang === "ms" ? "Tip: Menempah slot hari biasa memberikan ketersediaan teknisi 15% lebih lancar!" : "Tip: Booking on weekdays typically gives 15% better technician availability!"}
                    </p>
                  </div>
                </div>

                {/* Timeslots choices */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">{t.fieldServiceSlot}:</label>
                  <div className="space-y-2.5">
                    {[
                      { val: "morning", label: lang === "zh" ? "🌅 上午时段 (09:00 AM - 12:00 PM)" : lang === "ms" ? "🌅 Slot Pagi (09:00 AM - 12:00 PM)" : "🌅 Morning Slot (09:00 AM - 12:00 PM)", desc: lang === "zh" ? "清爽晨间保养出风，完美一天开始。" : lang === "ms" ? "Suhu lebih sejuk, permulaan yang hebat." : "Cooler temperature, great start." },
                      { val: "afternoon", label: lang === "zh" ? "☀️ 下午时段 (01:00 PM - 04:00 PM)" : lang === "ms" ? "☀️ Slot Tengah Hari (01:00 PM - 04:00 PM)" : "☀️ Afternoon Slot (01:00 PM - 04:00 PM)", desc: lang === "zh" ? "正午彻底化学消毒，强力阻绝闷热。" : lang === "ms" ? "Penyelenggaraan tumpuan tengah hari." : "Midday maintenance focus." },
                      { val: "late_afternoon", label: lang === "zh" ? "🌇 傍晚时段 (04:00 PM - 07:00 PM)" : lang === "ms" ? "🌇 Slot Petang (04:00 PM - 07:00 PM)" : "🌇 Late Afternoon Slot (04:00 PM - 07:00 PM)", desc: lang === "zh" ? "晚间到府安检，不耽误白天上班时间。" : lang === "ms" ? "Pemeriksaan akhir petang, sesuai selepas waktu kerja." : "Late checkups, convenient after-work." },
                    ].map((slot) => (
                      <label
                        key={slot.val}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          serviceTimeSlot === slot.val
                            ? "border-blue-600 bg-blue-50/20"
                            : "border-slate-150 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="timeSlot"
                          checked={serviceTimeSlot === slot.val}
                          onChange={() => setServiceTimeSlot(slot.val as any)}
                          className="mt-0.5 accent-blue-600 h-4 w-4"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{slot.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-sans">{slot.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional diagnostics note details */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {t.fieldUserNotes} <span className="text-slate-400 font-normal">({lang === "zh" ? "可留空" : lang === "ms" ? "Pilihan" : "Optional"}):</span>
                </label>
                <textarea
                  rows={2}
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder={lang === "zh" ? "例：右下角慢速滴水、指示灯闪烁、开机有醋样酸味等..." : lang === "ms" ? "cth., Air bocor perlahan dari kanan bawah, atau lampu berkedip seketika..." : "e.g., Water dripping slowly from bottom right, or remote control occasionally showing error code E5..."}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 resize-none font-sans"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PRICING RECEIPT MOCKUP */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="p-1.5 bg-green-100 text-green-700 rounded-lg"><CheckSquare size={16} /></span>
                  {t.reviewTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{t.reviewSubtitle}</p>
              </div>

              {/* Quotation Slip Box */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-3.5 flex justify-between items-center">
                  <span className="text-xs font-mono tracking-widest uppercase">
                    {lang === "zh" ? "服务预算账单汇总" : lang === "ms" ? "Sebut Harga Anggaran Servis" : "Service Estimate Summary"}
                  </span>
                  <span className="text-[10px] font-sans text-slate-300">SuperCool Penang Co.</span>
                </div>

                <div className="p-4 space-y-4 bg-white text-xs text-slate-800">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-b border-slate-100 pb-3 font-sans">
                    <span className="text-slate-500">{lang === "zh" ? "服务项目:" : lang === "ms" ? "Servis:" : "Service:"}</span>
                    <span className="font-semibold text-right text-slate-800">
                      {t[`${serviceType}_title` as keyof typeof t] || currentServiceInfo?.title}
                    </span>

                    <span className="text-slate-500">{lang === "zh" ? "台数与马力规格:" : lang === "ms" ? "Unit / Kuasa Kuda:" : "Units / Horsepower:"}</span>
                    <span className="font-semibold text-right text-slate-800">
                      {unitsCount} {lang === "zh" ? "台" : "Unit(s)"} ({acHorsepower} - {acBrand})
                    </span>

                    <span className="text-slate-500">{lang === "zh" ? "预约预约时点:" : lang === "ms" ? "Tarikh Dijadualkan:" : "Scheduled:"}</span>
                    <span className="font-semibold text-right text-slate-800 text-blue-600">
                      {serviceDate} (
                      {serviceTimeSlot === "morning"
                        ? (lang === "zh" ? "早上" : lang === "ms" ? "Pagi" : "Morning")
                        : serviceTimeSlot === "afternoon"
                        ? (lang === "zh" ? "下午" : lang === "ms" ? "Tengah Hari" : "Afternoon")
                        : (lang === "zh" ? "傍晚" : lang === "ms" ? "Petang" : "Late Afternoon")}
                      )
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-b border-slate-100 pb-3 font-sans">
                    <span className="text-slate-500">{lang === "zh" ? "联系客户:" : lang === "ms" ? "Nama Pelanggan:" : "Client:"}</span>
                    <span className="font-semibold text-right text-slate-800">{clientName}</span>

                    <span className="text-slate-500">{lang === "zh" ? "联系电话:" : lang === "ms" ? "Telefon:" : "Phone:"}</span>
                    <span className="font-semibold text-right text-slate-800">{clientPhone}</span>

                    <span className="text-slate-500">{lang === "zh" ? "服务地址与区域:" : lang === "ms" ? "Alamat Cawangan:" : "Address / Location:"}</span>
                    <span className="font-semibold text-right text-slate-800 break-words max-w-[200px]">
                      {clientAddress}, <em className="text-teal-600 font-bold not-italic">{clientArea}</em>
                    </span>
                  </div>

                  {userNotes && (
                    <div className="bg-slate-50 p-2 rounded-lg text-[11px] font-sans border border-slate-100">
                      <span className="font-semibold text-slate-500 block mb-0.5">{lang === "zh" ? "您的故障备注:" : lang === "ms" ? "Nota Diagnostik Anda:" : "Your Diagnosis Note:"}</span>
                      <p className="text-slate-600 italic">"{userNotes}"</p>
                    </div>
                  )}

                  {/* Calculations breakdown */}
                  <div className="space-y-1 bg-blue-50/40 p-3 rounded-lg border border-blue-100">
                    <div className="flex justify-between font-sans text-[11px] text-slate-600">
                      <span>{lang === "zh" ? "基础维修清洗费" : lang === "ms" ? "Yuran Am Perkhidmatan" : "Base Service Fee"} ({unitsCount} x RM{currentServiceInfo?.basePrice}):</span>
                      <span>RM {unitsCount * currentServiceInfo?.basePrice}.00</span>
                    </div>

                    {acHorsepower !== "1.0 HP" && (
                      <div className="flex justify-between font-sans text-[11px] text-slate-600">
                        <span>{lang === "zh" ? "大功率马力附加费" : lang === "ms" ? "Surcaj Kuasa Kuda HP" : "HP Power Surcharge"} ({acHorsepower}):</span>
                        <span className="text-slate-700 font-medium">+ {lang === "zh" ? "已计算折算" : lang === "ms" ? "Surcaj Dikenakan" : "Surcharge Applied"}</span>
                      </div>
                    )}

                    {unitsCount >= 2 && (
                      <div className="flex justify-between font-sans text-[11px] text-emerald-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Percent size={11} /> {lang === "zh" ? "批量拼单尊享折扣" : lang === "ms" ? "Diskaun Tempahan Pukal" : "Bulk Booking Discount"}:
                        </span>
                        <span>- {lang === "zh" ? "节省" : lang === "ms" ? "Saved" : "Saved"} RM {Math.round(unitsCount * currentServiceInfo?.basePrice * (unitsCount >= 5 ? 0.15 : unitsCount >= 3 ? 0.1 : 0.05))}.00</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-150 pt-2 mt-1.5 font-sans">
                      <span className="flex items-center gap-1 text-slate-800">
                        <DollarSign size={16} className="text-blue-600" /> {lang === "zh" ? "承诺总额评估:" : lang === "ms" ? "Anggaran Bersih Dijamin:" : "Guaranteed Estimate:"}
                      </span>
                      <span className="text-blue-700">RM {estimatedPrice}.00</span>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center font-sans pt-1">
                      {lang === "zh" ? "绝对无惊喜加价。完工后师傅现场收取。报价含全部检测零件服务费。" : lang === "ms" ? "Tiada kejutan cas tambahan. Bayaran dibuat secara tunai/online selepas selesai kerja." : "No surprise surcharges. Payment is made locally *after* completing service. Price includes parts testing."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Nav */}
          <div className="flex justify-between border-t border-slate-100 pt-5 mt-2">
            {step === 1 ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white hover:bg-slate-55"
                id="booking-cancel-btn"
              >
                {lang === "zh" ? "取消" : lang === "ms" ? "Batal" : "Cancel"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 animate-fadeIn"
                id="booking-back-btn"
              >
                <ChevronLeft size={14} /> {lang === "zh" ? "上一步" : lang === "ms" ? "Kembali" : "Back"}
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!validateStep()}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                id="booking-next-btn"
              >
                {lang === "zh" ? "下一步" : lang === "ms" ? "Langkah Seterusnya" : "Next Step"} <ChevronRight size={14} />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row shadow-sm rounded-lg overflow-hidden border border-slate-150 gap-2 sm:gap-2 sm:border-none sm:shadow-none sm:bg-transparent">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    const newBooking = {
                      serviceType,
                      unitsCount,
                      acType,
                      acBrand,
                      acHorsepower,
                      clientName,
                      clientPhone,
                      clientEmail,
                      clientArea,
                      clientAddress,
                      serviceDate,
                      serviceTimeSlot,
                      userNotes,
                      estimatePrice: estimatedPrice,
                    };
                    onSubmit(newBooking);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 text-center"
                  id="booking-whatsapp-direct-btn"
                >
                  <MessageSquare size={14} /> {t.sendWhatsAppDirect}
                </a>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 animate-fadeIn"
                  id="booking-confirm-btn"
                >
                  ✓ {t.secureBookingNow}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* SUCCESS MODAL / WHATSAPP DISPATCH HANDOFF */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" id="whatsapp-handshake-modal">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-6 animate-scaleIn">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl animate-bounce">
              💬
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                {lang === "zh" ? "🎉 预约申请已存入系统！" : lang === "ms" ? "🎉 Tempahan Disimpan dalam Sistem!" : "🎉 Appointment Saved Centrally!"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                {lang === "zh" 
                  ? "您的订单评估已安全存入超级冷气后台。根据巴都丁宜到北海的调度规定，您需要点击联络 Mike 极速发送工单明细排期。"
                  : lang === "ms" 
                  ? "Sebut harga anda telah selamat didaftarkan. Untuk pengesahan pantas, sila hantar butiran ini terus kepada talian rasmi WhatsApp Mike."
                  : "Your pricing estimate has been logged in our system. To finalize, click below to trigger high-priority dispatch review with Mike's Penang office."}
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-left space-y-1.5 text-xs font-sans">
              <span className="font-bold text-emerald-950 block">📞 {lang === "zh" ? "马来西亚 WhatsApp 运营号码:" : lang === "ms" ? "Nombor Telefon Agihan:" : "WhatsApp Official Line:"}</span>
              <span className="font-bold font-mono text-base text-emerald-800 tracking-wider block">+60175162938</span>
              <p className="text-[10px] text-slate-500 leading-normal">
                {lang === "zh" 
                  ? "微信/WhatsApp 客户服务时间：周一至周六 9:00 AM - 7:00 PM。"
                  : lang === "ms" 
                  ? "Waktu operasi perkhidmatan WhatsApp: Isnin - Sabtu 9:00 AM - 7:00 PM."
                  : "Georgetown dispatcher operational hours: Mon - Sat 9:00 AM - 7:00 PM."}
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                id="modal-whatsapp-link"
              >
                <MessageSquare size={16} />
                {lang === "zh" ? "连线官方专线确认 (60175162938)" : lang === "ms" ? "Hantar WhatsApp Selesai (60175162938)" : "Forward details to +60175162938"}
              </a>
              
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onCancel(); // Closes the booking modal form and displays bookings panel
                }}
                className="w-full py-3 text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-50 rounded-xl transition-all"
                id="modal-dismiss-btn"
              >
                {lang === "zh" ? "完成并查看我的全部工单" : lang === "ms" ? "Selesai & Lihat Rekod Tempahan" : "Finish & View My Bookings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
