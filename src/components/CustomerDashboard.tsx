import React, { useState } from "react";
import { 
  Clock, CheckCircle, AlertTriangle, Printer, PhoneCall, Trash2, 
  MapPin, Star, User, ShieldCheck, HelpCircle, Receipt, ExternalLink,
  Edit, Save, X, Calendar, QrCode, Percent, DollarSign, MessageSquare,
  Mail, Bell, Sparkles, Eye, Camera
} from "lucide-react";
import { Appointment } from "../types";
import { SERVICE_TYPES, PENANG_AREAS, MAINSTREAM_TECHNICIANS } from "../data";
import { TRANSLATIONS, Language } from "../translations";

interface CustomerDashboardProps {
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onAddAppointmentClick: () => void;
  onUpdateAppointment?: (id: string, updates: Partial<Appointment>) => void;
  lang?: Language;
  onRebookOverdue?: (appt: Appointment) => void;
}

export default function CustomerDashboard({
  appointments,
  onCancelAppointment,
  onAddAppointmentClick,
  onUpdateAppointment,
  lang = "en",
  onRebookOverdue,
}: CustomerDashboardProps) {
  const t = TRANSLATIONS[lang];
  const [selectedInvoice, setSelectedInvoice] = useState<Appointment | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<Record<string, number>>({});
  const [feedbackReview, setFeedbackReview] = useState<Record<string, string>>({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});

  // Service Reminders System states & Helpers
  const [simulatedEmailAppt, setSimulatedEmailAppt] = useState<Appointment | null>(null);
  const [emailSendingStatus, setEmailSendingStatus] = useState<"idle" | "sending" | "sent">("idle");

  const getDaysElapsed = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 0;
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      return Math.floor(diff / (1000 * 3600 * 24));
    } catch {
      return 0;
    }
  };

  const overdueAppointments = appointments.filter(
    (appt) => appt.status === "completed" && getDaysElapsed(appt.serviceDate) >= 180
  );

  const triggerSimulatedEmail = (appt: Appointment) => {
    setSimulatedEmailAppt(appt);
    setEmailSendingStatus("sending");
    setTimeout(() => {
      setEmailSendingStatus("sent");
    }, 1500);
  };

  // Editing state for users to modify bookings
  const [editingApptId, setEditingApptId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editSlot, setEditSlot] = useState<"morning" | "afternoon" | "late_afternoon">("morning");
  const [editBrand, setEditBrand] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editUnits, setEditUnits] = useState(1);

  const startEditing = (appt: Appointment) => {
    setEditingApptId(appt.id);
    setEditDate(appt.serviceDate);
    setEditSlot(appt.serviceTimeSlot);
    setEditBrand(appt.acBrand);
    setEditNotes(appt.userNotes || "");
    setEditUnits(appt.unitsCount);
  };

  const cancelEditing = () => {
    setEditingApptId(null);
  };

  const saveEditing = (appt: Appointment) => {
    if (!onUpdateAppointment) return;
    const basePricePerUnit = Math.round(appt.estimatePrice / appt.unitsCount) || 80;
    const recalculatedEstimate = basePricePerUnit * editUnits;
    onUpdateAppointment(appt.id, {
      serviceDate: editDate,
      serviceTimeSlot: editSlot,
      acBrand: editBrand,
      userNotes: editNotes,
      unitsCount: editUnits,
      estimatePrice: recalculatedEstimate,
    });
    setEditingApptId(null);
  };

  const formatServiceLabel = (type: string) => {
    return t[`${type}_title` as keyof typeof t] || SERVICE_TYPES[type as keyof typeof SERVICE_TYPES]?.title || type;
  };

  const statusTags = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-sans">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            {lang === "zh" ? "已提交 (待派单)" : lang === "ms" ? "Dihantar (Tunggu Tugasan)" : "Submitted (Pending Dispatched)"}
          </span>
        );
      case "confirmed":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-sans">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            {lang === "zh" ? "预约已确认" : lang === "ms" ? "Tempahan Disahkan" : "Booking Confirmed"}
          </span>
        );
      case "assigned":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-sans">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full font-sans"></span>
            {lang === "zh" ? "师傅已指派" : lang === "ms" ? "Teknisi Ditugaskan" : "Technician Assigned"}
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            {lang === "zh" ? "已完工并验收" : lang === "ms" ? "Selesai & Diperiksa" : "Completed & Checked"}
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-sans">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            {lang === "zh" ? "已取消" : lang === "ms" ? "Dibatalkan" : "Cancelled"}
          </span>
        );
      default:
        return null;
    }
  };

  const getMatchedTechnician = (name?: string) => {
    if (!name) return null;
    return MAINSTREAM_TECHNICIANS.find((t) => t.name === name) || {
      name,
      rating: 4.9,
      completed: 120,
      specialties: ["General servicing", "Leakage Fixes"],
    };
  };

  const handleRatingSubmit = (apptId: string) => {
    const rVal = feedbackRating[apptId] || 5;
    const rReview = feedbackReview[apptId] || "";
    if (onUpdateAppointment) {
      onUpdateAppointment(apptId, { rating: rVal, review: rReview });
    }
    setFeedbackSubmitted((p) => ({ ...p, [apptId]: true }));
  };

  return (
    <div className="space-y-6" id="customer-dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {lang === "zh" ? "我的 SuperCool 槟城保养订单" : lang === "ms" ? "Tempahan Servis SuperCool Penang Saya" : "My SuperCool Penang Bookings"}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === "zh" ? "实时跟踪、管理和审查您在槟城住宅区的冷气清洗与维修服务。" : lang === "ms" ? "Jejak, urus dan periksa perkhidmatan aircond kediaman anda di Pulau Pinang." : "Track, manage, and inspect your residential aircon services in Penang."}
          </p>
        </div>
        <button
          onClick={onAddAppointmentClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
          id="add-appointment-btn"
        >
          ➕ {lang === "zh" ? "预约新冷气服务" : lang === "ms" ? "Tempah Servis Baru" : "Book New Service"}
        </button>
      </div>

      {/* 6-MONTH RE-SERVICING REMINDERS & NOTIFICATION OUTBOX */}
      {overdueAppointments.length > 0 && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-xl relative overflow-hidden" id="service-reminders-panel">
          <div className="absolute top-0 right-0 p-8 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-1/4 p-12 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl relative mt-1">
                <Bell size={20} className="text-blue-400 animate-bounce" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
                  🚨 {lang === "zh" ? "6个月周期性冷气重修保养警报" : lang === "ms" ? "AMARAN JADUAL RE-SERVIS 6-BULAN AIRCOND" : "6-Month Recurrent Aircon Re-Servicing Alert"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                  {lang === "zh" 
                    ? "由于槟城受强烈高盐分和潮湿海风侵袭，空调过滤网在阻隔尘螨6个月后会因饱和细菌滋生，影响风速与制冷电力。我们强烈建议您对以下已越过6个月保养周期的冷气，进行全面的健康维护清洗！"
                    : lang === "ms"
                    ? "Sebab cuaca masin di Penang, unit filter aircond akan dipenuhi debu padat selepas 6 bulan yang menyebab beban motor tinggi. Sila laksanakan re-servis bagi unit berikut:"
                    : "Due to Penang's highly humid seaside climates, dust-traps saturate blockages on filters within 180 days, multiplying compression load and mold. Standard re-servicing is advised for these machines:"}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            {overdueAppointments.map((appt) => {
              const days = getDaysElapsed(appt.serviceDate);
              return (
                <div 
                  key={appt.id} 
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:bg-white/10 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider bg-blue-600 px-2 py-0.5 rounded">
                        {appt.acBrand} - {appt.acHorsepower} ({appt.acType.replace("_", " ")})
                      </span>
                      <span className="text-[10px] font-mono font-bold py-0.5 px-1.5 rounded bg-rose-950 text-rose-300 border border-rose-900 flex items-center gap-1">
                        ⚠️ {days} {lang === "zh" ? "天前已服务" : lang === "ms" ? "hari lalu" : "Days Ago!"} ({lang === "zh" ? "逾期" : lang === "ms" ? "Lewat" : "Overdue"})
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans pt-1">
                      📍 {appt.clientAddress} • <strong className="text-blue-300 font-semibold">{appt.clientArea}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Last Serviced On: <strong className="text-slate-200">{appt.serviceDate}</strong> • Reference Code: <span className="text-slate-300 font-semibold">#{appt.id.toUpperCase().slice(-6)}</span>
                    </p>
                  </div>

                  {/* Actions to test notifications and schedule re-services */}
                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => triggerSimulatedEmail(appt)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3 py-2 rounded-lg border border-white/10 transition-all active:scale-95"
                      title="Test simulated automatic transactional email dispatch to client inbox"
                    >
                      <Mail size={12} className="text-teal-400" />
                      <span>{lang === "zh" ? "发送模拟提醒邮件" : lang === "ms" ? "Pencuci Auto-E-mel" : "Trigger Simulated Email"}</span>
                    </button>

                    <button
                      onClick={() => {
                        const text = `*SUPERCOOL PENANG - 6-MONTH AIRCON RE-SERVICING REMINDER* ❄️\n\n` +
                          `Dear ${appt.clientName},\n` +
                          `It has been exactly *${days} days* ago since your last aircon cleaning on *${appt.serviceDate}* for your *${appt.acBrand}* unit at ${appt.clientArea}.\n\n` +
                          `To maintain cold breeze under Penang's humid breeze, would you like us to schedule a recurring maintenance of normal-wash from only RM 80-lah?\n` +
                          `Please let us know your preferred slot! Thank you!`;
                        window.open(`https://wa.me/60175162938?text=${encodeURIComponent(text)}`, "_blank");
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-650 text-white font-bold text-[11px] px-3 py-2 rounded-lg transition-all active:scale-95"
                    >
                      <MessageSquare size={12} />
                      <span>{lang === "zh" ? "WhatsApp 催单" : lang === "ms" ? "WhatsApp Krew" : "Direct WhatsApp"}</span>
                    </button>

                    {onRebookOverdue && (
                      <button
                        onClick={() => onRebookOverdue(appt)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-lg shadow-md transition-all active:scale-95 font-sans"
                      >
                        <Sparkles size={11} className="text-yellow-300 animate-pulse" />
                        <span>{lang === "zh" ? "⚡ 极速一键重订" : lang === "ms" ? "⚡ Re-tempah 1-Klik" : "⚡ One-Click Re-book"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-lg">
            🏢
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800">
              {lang === "zh" ? "暂无预订任何维修清洗服务" : lang === "ms" ? "Belum Ada Servis Dijadualkan" : "No Services Scheduled Yet"}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {lang === "zh" ? "别向槟城闷热的海风低头！咨询 Mike 智能顾问诊断，或点击上方按钮即刻拼单清洗。" : lang === "ms" ? "Kekal sejuk dalam cuaca panas Penang! Rujuk Mike AI atau klik butang di atas untuk menempah servis." : "Stay ahead of Penang's humid heat! Check symptoms with Mike AI or click the button above to book a repair or wash."}
            </p>
          </div>
          <button
            onClick={onAddAppointmentClick}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {lang === "zh" ? "开始预约服务时段" : lang === "ms" ? "Sediakan Slot Tempahan" : "Create Appointment Slot"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of booked appointments of users */}
          <div className="lg:col-span-2 space-y-4">
            {appointments.map((appt) => {
              const tech = getMatchedTechnician(appt.technicianName);
              const ratingVal = appt.rating !== undefined ? appt.rating : (feedbackRating[appt.id] || 5);

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow divide-y divide-slate-100"
                >
                  {/* Card Section Header */}
                  <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-widest uppercase">
                        APPOINTMENT CODE: #{appt.id.toUpperCase().slice(-6)}
                      </span>
                      <h4 className="text-sm font-bold text-slate-850 mt-0.5">
                        {formatServiceLabel(appt.serviceType)} x {appt.unitsCount} Unit(s)
                      </h4>
                    </div>
                    <div>{statusTags(appt.status)}</div>
                  </div>

                  {/* Booking Details Grid */}
                  {editingApptId === appt.id ? (
                    <div className="p-4 bg-blue-50/15 space-y-4 font-sans animate-fadeIn">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                          <Edit size={13} /> Modify Appointment Schedule & Details
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase pb-1 tracking-wider">
                            Service Date
                          </label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-850"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase pb-1 tracking-wider">
                            Preferred Time Slot
                          </label>
                          <select
                            value={editSlot}
                            onChange={(e) => setEditSlot(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-850"
                          >
                            <option value="morning">Morning (9am - 12pm)</option>
                            <option value="afternoon">Afternoon (1pm - 4pm)</option>
                            <option value="late_afternoon">Late Afternoon (4pm - 7pm)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase pb-1 tracking-wider">
                            Aircon Unit Brand (e.g. Panasonic)
                          </label>
                          <input
                            type="text"
                            value={editBrand}
                            onChange={(e) => setEditBrand(e.target.value)}
                            placeholder="e.g. Daikin, Panasonic, Mitsubishi"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-sans"
                            maxLength={50}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase pb-1 tracking-wider">
                            Number of Units
                          </label>
                          <select
                            value={editUnits}
                            onChange={(e) => setEditUnits(parseInt(e.target.value) || 1)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-850"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                              const basePrice = Math.round(appt.estimatePrice / appt.unitsCount) || 80;
                              return (
                                <option key={num} value={num}>
                                  {num} Unit{num > 1 ? "s" : ""} (RM {basePrice * num}.00)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase pb-1 tracking-wider">
                          Additional Diagnostic Notes or Complaints
                        </label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="e.g. Water is leaking more now, or blower making clicking noise..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-805 font-sans"
                          maxLength={300}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditing(appt)}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95"
                        >
                          <Save size={13} /> Save Modifications
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-650">
                          <Clock size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-800 font-sans">
                            {appt.serviceDate} {lang === "zh" ? "在" : lang === "ms" ? "pada" : "at"}{" "}
                            {appt.serviceTimeSlot === "morning"
                              ? (lang === "zh" ? "上午 (9am - 12pm)" : lang === "ms" ? "Pagi (9am - 12pm)" : "Morning (9am - 12pm)")
                              : appt.serviceTimeSlot === "afternoon"
                              ? (lang === "zh" ? "下午 (1pm - 4pm)" : lang === "ms" ? "Tengah Hari (1pm - 4pm)" : "Afternoon (1pm - 4pm)")
                              : (lang === "zh" ? "傍晚 (4pm - 7pm)" : lang === "ms" ? "Petang (4pm - 7pm)" : "Late Afternoon (4pm - 7pm)")}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-slate-650">
                          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-slate-700 leading-relaxed font-sans font-medium">
                            {appt.clientAddress},{" "}
                            <strong className="text-teal-600 font-bold">{appt.clientArea}</strong>
                          </span>
                        </div>

                        <div className="text-[11px] font-sans text-slate-500 bg-slate-100/50 px-2.5 py-1.5 rounded-lg border border-slate-150 flex items-center justify-between">
                          <span>{lang === "zh" ? "品牌与设计规格:" : lang === "ms" ? "Jenama & spesifikasi:" : "Brand & specs:"}</span>
                          <strong className="text-slate-700 font-semibold">
                            {appt.acBrand} ({appt.acHorsepower} {appt.acType === "wall_mounted" ? (lang === "zh" ? "挂壁式" : "Wall") : appt.acType === "cassette" ? (lang === "zh" ? "天花嵌入" : "Cassette") : (lang === "zh" ? "吊顶式" : "Ceiling")})
                          </strong>
                        </div>
                        {appt.userNotes && (
                          <div className="text-[11px] font-sans text-slate-500 italic bg-amber-50/20 px-2 py-1 rounded border border-amber-100">
                            {lang === "zh" ? "用户备注:" : lang === "ms" ? "Nota:" : "Note:"} "{appt.userNotes}"
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 shrink-0 flex flex-col justify-between">
                        <div className="flex justify-between items-center bg-blue-50/40 p-2.5 rounded-xl border border-blue-100">
                          <span className="text-xs text-slate-600 font-sans">{lang === "zh" ? "估算总开支:" : lang === "ms" ? "Anggaran Kos:" : "Estimated Cost:"}</span>
                          <span className="text-sm font-bold text-blue-700 font-mono">RM {appt.estimatePrice}.00</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1.5 md:justify-end">
                          <button
                            onClick={() => setSelectedInvoice(appt)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Receipt size={12} /> {lang === "zh" ? "账单明细 PDF" : lang === "ms" ? "Invois PDF" : "Invoice PDF"}
                          </button>

                          {appt.status !== "cancelled" && appt.status !== "completed" && (
                            <button
                              onClick={() => startEditing(appt)}
                              className="px-3 py-1.5 bg-blue-55 hover:bg-blue-100 text-blue-700 hover:text-blue-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-blue-150 bg-white"
                            >
                              <Edit size={12} /> {lang === "zh" ? "修整预约 / 改期" : lang === "ms" ? "Ubahsuai / Tukar Tarikh" : "Modify / Reschedule"}
                            </button>
                          )}

                          {appt.status !== "cancelled" && appt.status !== "completed" && (
                            <button
                              onClick={() => {
                                const confirmMsg = lang === "zh" 
                                  ? "您确定要取消此项冷气保养服务预约吗？" 
                                  : lang === "ms" 
                                  ? "Adakah anda pasti mahu membatalkan tempahan servis ini?" 
                                  : "Are you sure you want to cancel this appointment-lah?";
                                if (confirm(confirmMsg)) {
                                  onCancelAppointment(appt.id);
                                }
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors border border-rose-150"
                            >
                              <Trash2 size={12} /> {lang === "zh" ? "撤销预约" : lang === "ms" ? "Batal Servis" : "Cancel Service"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Technician status details */}
                  {appt.status === "assigned" && tech && (
                    <div className="p-4 bg-indigo-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-200 border-2 border-white rounded-full flex items-center justify-center font-bold text-sm text-slate-800 shadow-sm overflow-hidden">
                          {tech.name === "Anwar" ? "🧔🏾" : tech.name === "Muthu" ? "👨🏽" : "👴🏻"}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            Technician Dispatch: {tech.name}
                            <span className="text-[10px] font-normal text-slate-500 flex items-center ml-1">
                              <Star size={11} className="fill-amber-400 text-amber-400 mr-0.5" />
                              {tech.rating}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                            Specializes in {tech.specialties.join(", ")}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Simulated Dial Call: Calling ${tech.name} at +6013-4428801. He is loading the tools now!`)}
                        className="flex items-center gap-1 bg-white hover:bg-slate-150 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95"
                      >
                        <PhoneCall size={12} /> Contact {tech.name}
                      </button>
                    </div>
                  )}

                  {/* Reference Photos Row */}
                  {(appt.photoBefore || appt.photoAfter) && (
                    <div className="p-4 bg-slate-50/50 space-y-3 border-t border-slate-100" id={`inspection-photos-${appt.id}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          📸 {lang === "zh" ? "冷气清洗现场对比图 ('前' & '后')" : lang === "ms" ? "Gambar Rujukan Servis ('Sebelum' & 'Selepas')" : "Servicing Reference Photos ('Before' & 'After')"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">
                          REF_ID: #{appt.id.toUpperCase().slice(-6)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Before photo */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block font-sans">
                            ◀ {lang === "zh" ? "保养清洗前 (积尘情况)" : lang === "ms" ? "Sebelum Servis (Berhabuk)" : "Before Servicing (Dusty)"}
                          </span>
                          {appt.photoBefore ? (
                            <div 
                              className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group cursor-pointer" 
                              onClick={() => setSelectedPhoto(appt.photoBefore || null)}
                              title={lang === "zh" ? "点击查看大图" : lang === "ms" ? "Klik untuk besarkan" : "Click to view full image"}
                            >
                              <img
                                src={appt.photoBefore}
                                alt="Before Servicing"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                <Eye size={12} /> {lang === "zh" ? "点击查看大图" : lang === "ms" ? "Besarkan" : "View Large"}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[10.5px] font-sans">
                              {lang === "zh" ? "暂无清洗前现场对比" : lang === "ms" ? "Tiada gambar sebelum" : "No Before photo captured"}
                            </div>
                          )}
                        </div>

                        {/* After photo */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-wider block font-sans">
                            ▶ {lang === "zh" ? "清洗保养后 (清凉爽利)" : lang === "ms" ? "Selepas Servis (Sejuk)" : "After Servicing (SuperCool)"}
                          </span>
                          {appt.photoAfter ? (
                            <div 
                              className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group cursor-pointer" 
                              onClick={() => setSelectedPhoto(appt.photoAfter || null)}
                              title={lang === "zh" ? "点击查看大图" : lang === "ms" ? "Klik untuk besarkan" : "Click to view full image"}
                            >
                              <img
                                src={appt.photoAfter}
                                alt="After Servicing"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                <Eye size={12} /> {lang === "zh" ? "点击查看大图" : lang === "ms" ? "Besarkan" : "View Large"}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[10.5px] font-sans">
                              {lang === "zh" ? "暂无清洗后现场对比" : lang === "ms" ? "Tiada gambar selepas" : "No After photo captured"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Completed Booking Rating Mechanism */}
                  {appt.status === "completed" && (
                    <div className="p-4 bg-emerald-50/20 border-t border-emerald-100/50 space-y-3" id={`testimonial-review-box-${appt.id}`}>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">
                          {lang === "zh" ? "为本次冷气服务评星与撰写反馈" : lang === "ms" ? "Nilaikan & Ulas Servis Aircond" : "Rate & Review Your Aircon Service"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-sans">
                          {lang === "zh" ? "您的公开评价将展示于 SuperCool 槟城首页，帮助我们和技术人员持续优化服务！" : lang === "ms" ? "Ulasan anda akan dipaparkan secara umum di halaman utama SuperCool untuk membantu kami meningkatkan mutu kerja!" : "Your public rating & review will be displayed on the SuperCool homepage to guide other Penang homeowners!"}
                        </p>
                      </div>

                      {(appt.rating !== undefined || feedbackSubmitted[appt.id]) ? (
                        <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                              ✓ {lang === "zh" ? "提交成功" : lang === "ms" ? "Berjaya Dihantar" : "Submitted"}
                            </span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  className={`${
                                    star <= ratingVal
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {(appt.review || feedbackReview[appt.id]) ? (
                            <p className="text-xs italic text-slate-700 bg-slate-50/50 p-2 rounded border border-slate-100">
                              "{appt.review || feedbackReview[appt.id]}"
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400 italic">
                              {lang === "zh" ? "未留下具体说明文字" : lang === "ms" ? "Tiada komen bertulis" : "No written review left"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-600">
                              {lang === "zh" ? "评分:" : lang === "ms" ? "Penilaian:" : "Rating:"}
                            </span>
                            <div className="flex gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFeedbackRating((p) => ({ ...p, [appt.id]: star }))}
                                  className="focus:outline-none transition-transform hover:scale-110 active:scale-125 cursor-pointer"
                                >
                                  <Star
                                    size={18}
                                    className={`${
                                      star <= ratingVal
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300 hover:text-amber-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-amber-600">
                              {ratingVal} / 5 {lang === "zh" ? "星" : lang === "ms" ? "Bintang" : "Stars"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <textarea
                              value={feedbackReview[appt.id] || ""}
                              onChange={(e) => setFeedbackReview((p) => ({ ...p, [appt.id]: e.target.value }))}
                              placeholder={
                                lang === "zh"
                                  ? "说说您对冷气温度、技术人员清洁度、礼貌态度的体验...（选填）"
                                  : lang === "ms"
                                  ? "Kongsi ulasan mengenai kualiti servis, kesejukan, atau adab teknisyen..."
                                  : "Write a short review about the coolness, cleanup quality, and technician's punctuality..."
                              }
                              rows={2}
                              className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => handleRatingSubmit(appt.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              ⭐ {lang === "zh" ? "发布公开评价" : lang === "ms" ? "Terbitkan Ulasan" : "Publish Public Review"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Info Column - Penang aircon support */}
          <div className="space-y-4">
            {/* Contact via QR Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm" id="whatsapp-qr-section">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-650 rounded-xl">
                  <QrCode size={18} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {lang === "zh" ? "扫码即刻沟通" : lang === "ms" ? "Hubungi Melalui QR" : "Contact via QR"}
                  </h4>
                  <p className="text-[10.5px] text-slate-500 font-sans">
                    {lang === "zh" ? "快捷扫一扫直接派发至微信/WhatsApp" : lang === "ms" ? "Imbas untuk sembang segera" : "Quick scan to chat with us"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-center shadow-inner hover:scale-102 transition-transform duration-200 bg-white">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      "https://wa.me/60175162938?text=Hello%20SuperCool%20Penang%21%20I%20would%20like%20to%20inquire%20about%20aircon%20servicing."
                    )}`}
                    alt="WhatsApp Booking QR Code"
                    id="whatsapp-qr-image"
                    className="w-36 h-36 object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-750 font-sans block bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full inline-block font-mono">
                    +6017-5162938
                  </span>
                  <p className="text-[11px] font-sans text-slate-500 max-w-[210px] leading-relaxed mx-auto">
                    {lang === "zh" ? "用手机相机对准扫描，即刻直达 WhatsApp 确认预约，免输电话号码！" : lang === "ms" ? "Imbas dengan kamera telefon untuk terus berhubung di WhatsApp & sahkan butiran!" : "Scan with your phone's camera to immediately sync on WhatsApp & finalize details!"}
                  </p>
                </div>

                <a
                  href="https://wa.me/60175162938?text=Hello%20SuperCool%20Penang%21%20I%20would%20like%20to%20inquire%20about%20aircon%20servicing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                  id="whatsapp-sidebar-direct-btn"
                >
                  💬 {lang === "zh" ? "打开 WhatsApp 在线对话" : lang === "ms" ? "Buka Sembang WhatsApp" : "Open WhatsApp Chat"}
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-md border border-blue-600/50 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-xl">🛡️</div>
                  <h4 className="text-sm font-bold tracking-tight">
                    {lang === "zh" ? "SuperCool 槟城优质大厂双重保障" : lang === "ms" ? "Jaminan Kualiti SuperCool Penang" : "SuperCool Penang Assurance"}
                  </h4>
                </div>

                <ul className="text-xs space-y-2.5 text-blue-100 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-300 font-bold text-sm leading-none">✓</span>
                    <span>
                      {lang === "zh" ? (
                        <><strong>免费 90 天施工工艺包修</strong> 包括任何煤气漏泄，零件失效，或绿灯突发故障闪烁。</>
                      ) : lang === "ms" ? (
                        <><strong>Waranti Mutu Kerja 90-Hari</strong> terhadap sebarang kebocoran, kerosakan alat ganti, atau lampu kelip error.</>
                      ) : (
                        <><strong>90-Day Workmanship Warranty</strong> against leakage, parts failures, or blinking errors.</>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-300 font-bold text-sm leading-none">✓</span>
                    <span>
                      {lang === "zh" ? (
                        <><strong>本地全能认证技工</strong> 每个师傅都经过精挑细选和警方安审。不采用第三方无资质包工。</>
                      ) : lang === "ms" ? (
                        <><strong>Teknisi Tempatan Terlatih</strong> yang telah disahkan latar belakang. Tiada ejen subkontrak warga asing.</>
                      ) : (
                        <><strong>Local Trained Mechanics</strong> verified with police checks. No third-party foreign agents.</>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-300 font-bold text-sm leading-none">✓</span>
                    <span>
                      {lang === "zh" ? (
                        <><strong>整洁如新施工承诺</strong> 一切化学清洗后必深度吸尘并清空地面。绝不会留下任何污水渍、污泥！</>
                      ) : lang === "ms" ? (
                        <><strong>Perkhidmatan Bersih Dijamin</strong>. Kami bersihkan kawasan lantai selepas penyelenggaraan. Tiada kotoran air.</>
                      ) : (
                        <><strong>Clean job promise</strong>. We vacuum and clean floor after chemical overhaul. No messy water stains!</>
                      )}
                    </span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    const notifyMsg = lang === "zh" 
                      ? "SuperCool 槟城全天候急修服务热线: +604-2287755 (乔治镇总部分机)。服务时间：每日早上 8 点至晚 9 点。" 
                      : lang === "ms" 
                      ? "Talian Kecemasan SuperCool Penang: +604-2287755 (Cawangan Georgetown). Aktif setiap hari 8 pagi - 9 malam." 
                      : "SuperCool Penang emergency hotline: +604-2287755 (Georgetown division). Active daily 8 AM - 9 PM.";
                    alert(notifyMsg);
                  }}
                  className="w-full text-center bg-white text-blue-800 font-bold text-xs py-2 rounded-xl border border-transparent shadow hover:bg-blue-50 transition-colors"
                >
                  📞 {lang === "zh" ? "拨打紧急维修通道" : lang === "ms" ? "Panggilan Kecemasan Aircond" : "Emergency Aircon Call"}
                </button>
              </div>
            </div>

            {/* Weather Tip Indicator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                📍 {lang === "zh" ? "槟城海岛冷气特护指南" : lang === "ms" ? "Panduan Penjagaan Aircond Penang" : "Penang Aircon Maintenance Guide"}
              </h4>
              <div className="space-y-2.5 text-xs leading-relaxed font-sans text-slate-600">
                <p>
                  {lang === "zh" ? (
                    <>由于槟城岛受强烈的<strong>海水湿热盐碱海风</strong>持续腐蚀（尤其是峇都丁宜、 Tanjung Bungah、葛尼半岛等），室外冷凝器铜管和阀门生锈、漏雪种速度是其他内陆城市的三倍！</>
                  ) : lang === "ms" ? (
                    <>Kerana kawasan pulau kerap terdedah kepada <strong>bayu laut masin</strong> (terutama Batu Ferringhi, Tanjung Bungah, Gurney), koil kondenser luar cepat berkarat & bocor gas berbanding bandar pedalaman.</>
                  ) : (
                    <>Because Penang island is heavily subjected to <strong>saltwater marine breeze</strong> (especially Batu Ferringhi, Tanjung Bungah, and Gurney), outdoor condenser coils corrode and leak gas three times faster than inland cities.</>
                  )}
                </p>
                <div className="p-2.5 bg-amber-50 rounded-lg text-[11px] text-amber-850 border border-amber-200">
                  <strong>{lang === "zh" ? "Mike 大师建议:" : lang === "ms" ? "Nasihat Mike:" : "Mike's Advice:"}</strong>{" "}
                  {lang === "zh" ? "在每半年的化学彻底清洗服务中，让技工喷涂专用防腐抗氧化氟涂层，可使室外压缩机即便在 48°C 炎夏午后依然极致省电运转！" : lang === "ms" ? "Sapukan lapisan perlindungan anti-karat koil semasa servis kimia dwi-tahunan untuk memastikan kondenser berfungsi lancar dalam beban puncak 48°C!" : "Apply protective anti-rust coil coatings during your bi-annual normal chemical servicing to keep your inverter condenser running below 48°C peak load!"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL POPUP */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden text-xs text-slate-800 animate-slideUp">
            {/* Invoice Top */}
            <div className="bg-slate-900 text-slate-100 p-5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold tracking-tight font-sans">
                  {lang === "zh" ? "正规测算明细与服务估算单" : lang === "ms" ? "TEMPAHAN INVOIS CUKAI (ANG)" : "TAX INVOICE (EST)"}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">No: SC-{selectedInvoice.id.toUpperCase().slice(-8)}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white font-bold p-1 bg-white/5 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800">SuperCool Penang</h4>
                  <p className="text-[10px] text-slate-500 font-sans">12B, Jalan Burma, George Town</p>
                  <p className="text-[10px] text-slate-500 font-sans">10050 Penang, Malaysia</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">{lang === "zh" ? "签发日期:" : lang === "ms" ? "Tarikh Dikeluarkan:" : "Date Issued:"}</p>
                  <p className="font-semibold text-slate-700 font-sans">{selectedInvoice.createdAt.split("T")[0]}</p>
                </div>
              </div>

              {/* Bill To */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                  {lang === "zh" ? "客户账单接收人:" : lang === "ms" ? "BIL KEPADA PELANGGAN:" : "BILL TO CLIENT:"}
                </span>
                <p className="font-bold text-slate-850 mt-1">{selectedInvoice.clientName}</p>
                <p className="text-slate-600 font-sans">{selectedInvoice.clientAddress}, {selectedInvoice.clientArea}</p>
                <p className="text-slate-600 font-sans">{lang === "zh" ? "联络电话:" : lang === "ms" ? "No. Telefon:" : "Phone:"} {selectedInvoice.clientPhone}</p>
              </div>

              {/* Items Table */}
              <div className="border border-slate-150 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-150">
                      <th className="p-2.5">{lang === "zh" ? "服务详情描述" : lang === "ms" ? "Detail Servis" : "Service Details"}</th>
                      <th className="p-2.5 text-center">{lang === "zh" ? "件数" : lang === "ms" ? "Kuantiti" : "Qty"}</th>
                      <th className="p-2.5 text-right font-sans">{lang === "zh" ? "总额 (RM)" : lang === "ms" ? "Jumlah (RM)" : "Amount (RM)"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5">
                        <strong className="block text-slate-800">{formatServiceLabel(selectedInvoice.serviceType)}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {selectedInvoice.acBrand} - {selectedInvoice.acHorsepower} (
                          {selectedInvoice.acType === "wall_mounted" ? (lang === "zh" ? "挂壁式" : "Wall") : selectedInvoice.acType === "cassette" ? (lang === "zh" ? "天花嵌入" : "Cassette") : (lang === "zh" ? "吊顶式" : "Ceiling")}
                          )
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-semibold font-mono">{selectedInvoice.unitsCount}</td>
                      <td className="p-2.5 text-right font-semibold font-mono">RM {selectedInvoice.estimatePrice}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Note */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-[10px] font-sans">
                <span className="font-semibold text-slate-700 block">{lang === "zh" ? "关于上门派单说明:" : lang === "ms" ? "Syarat Penghantaran:" : "Dispatch Term:"}</span>
                {lang === "zh" ? (
                  <>请确保在您预约的 {selectedInvoice.clientArea} 提供我们 SuperCool Penang 技术工程车临时停泊位。工程完毕验收后，可通过现金或 DuitNow QR 即刻清结算。谢谢！</>
                ) : lang === "ms" ? (
                  <>Sila pastikan parking sedia untuk van teknikal SuperCool Penang kami di {selectedInvoice.clientArea}. Pembayaran boleh dijelaskan melalui Tunai atau DuitNow QR selepas kerja selesai berpaling.</>
                ) : (
                  <>Kindly make sure parking is ready for our SuperCool Penang standard technical van at {selectedInvoice.clientArea}. Payment can be settled via Cash or DuitNow QR upon job signoff.</>
                )}
              </div>

              {/* Receipt Total */}
              <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                <span className="font-sans font-bold text-slate-700 text-sm">
                  {lang === "zh" ? "预约实付总费用:" : lang === "ms" ? "JUMLAH PERLU DIBAYAR:" : "TOTAL AMOUNT DUE:"}
                </span>
                <span className="text-lg font-extrabold text-blue-700 font-sans">RM {selectedInvoice.estimatePrice}.00</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-2 justify-end">
              <button
                onClick={() => {
                  const printMsg = lang === "zh" 
                    ? `正在为您测算生成打印单据: 服务结算详情单 SC-${selectedInvoice.id.slice(-6)} 已经安全转换输出 pdf 文件！`
                    : lang === "ms"
                    ? `Menjana dokumen percetakan: Cetak Invois / Anggaran SC-${selectedInvoice.id.slice(-6)} ke pdf Selesai!`
                    : "Simulating document generation: Printing Invoice / Estimate SC-" + selectedInvoice.id.slice(-6) + " to aircon-report.pdf Completed!";
                  alert(printMsg);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1"
              >
                <Printer size={13} /> {lang === "zh" ? "打印 / 存为 PDF" : lang === "ms" ? "Cetak / Simpan PDF" : "Print/Download PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED EMAIL MODAL DIALOG */}
      {simulatedEmailAppt && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-fadeIn" id="email-simulator-modal">
          <div className="bg-slate-950 text-slate-100 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-800 overflow-hidden text-xs flex flex-col max-h-[90vh]">
            
            {/* Header / Meta */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="font-mono text-slate-350 font-bold uppercase tracking-wider text-[10px]">
                  SuperCool Penang • Off-site Mail Dispatcher Simulator
                </span>
              </div>
              <button
                onClick={() => setSimulatedEmailAppt(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-full font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulated Delivery Logs */}
            <div className="p-3 bg-slate-900/50 border-b border-slate-800 shrink-0 font-mono text-[9.5px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>[MTA Relay] Connecting to secure-mx.supercool-penang.com...</span>
                <span className="text-teal-400 font-bold">CONNECTED</span>
              </div>
              <div className="flex justify-between font-sans">
                <span>[Envelope-From] notifications@supercool-penang.com</span>
                <span>[Envelope-To] {simulatedEmailAppt.clientEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>[SMTP SMTP-relay] Transmitting 6-month cycle campaign payload...</span>
                <span className="text-amber-400 font-bold uppercase">{emailSendingStatus}...</span>
              </div>
            </div>

            {/* Email UI Frame */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 text-slate-800 space-y-4">
              <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden text-left">
                
                {/* Email Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-650 space-y-1 font-sans">
                  <div className="flex">
                    <span className="w-16 font-semibold text-slate-400">From:</span>
                    <strong className="text-slate-700">SuperCool Penang Operations &lt;maintenance-cycle@supercool-penang.com&gt;</strong>
                  </div>
                  <div className="flex">
                    <span className="w-16 font-semibold text-slate-400">To:</span>
                    <strong className="text-slate-700">{simulatedEmailAppt.clientEmail || "mshtechnology@gmail.com"}</strong>
                  </div>
                  <div className="flex">
                    <span className="w-16 font-semibold text-slate-400">Subject:</span>
                    <strong className="text-slate-900 font-semibold">❄️ RE-SERVICING ACTION ADVISED: Your {simulatedEmailAppt.acBrand} AC in {simulatedEmailAppt.clientArea} is Due for 6-Month Maintenance!</strong>
                  </div>
                  <div className="flex text-[9.5px] pt-1">
                    <span className="w-16 font-semibold text-slate-400">Date:</span>
                    <span className="text-slate-500 font-mono">2026-06-14 (Auto-scheduled on 6-Month anniversary)</span>
                  </div>
                </div>

                {/* Email HTML Body content */}
                <div className="p-6 space-y-4 font-sans text-xs text-slate-700 leading-relaxed bg-white">
                  <div className="text-center pb-4 border-b border-slate-150">
                    <h2 className="text-lg font-black text-blue-700 tracking-tight font-sans">SuperCool Penang</h2>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Penang Hill's trusted aircon engineers since 1996</p>
                  </div>

                  <p>Dear <strong>{simulatedEmailAppt.clientName}</strong>,</p>

                  <p>
                    We hope you are enjoying cold breeze at your residence! This is an automated diagnostic reminder sent by SuperCool Penang's maintenance cycle tracker.
                  </p>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <h4 className="font-bold text-amber-850 flex items-center gap-1.5 text-xs">
                      ⚠️ AC Servicing Cycled Out (180+ Days Elapsed!)
                    </h4>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      Our records show that your last completed aircon cleaning was on <strong>{simulatedEmailAppt.serviceDate}</strong> ({getDaysElapsed(simulatedEmailAppt.serviceDate)} days ago) for the following appliance:
                    </p>
                    <ul className="list-disc pl-5 text-[11px] text-slate-700 space-y-1 pt-1">
                      <li><strong>Appliance Profile:</strong> {simulatedEmailAppt.acBrand} {simulatedEmailAppt.acHorsepower} ({simulatedEmailAppt.acType.replace("_", " ")})</li>
                      <li><strong>Serviced Address:</strong> {simulatedEmailAppt.clientAddress}, {simulatedEmailAppt.clientArea}</li>
                      <li><strong>Completed by Technician:</strong> {simulatedEmailAppt.technicianName || "Anwar"}</li>
                    </ul>
                  </div>

                  <p>
                    Because Penang's island and coastal communities are heavily subjected to <strong>saltwater marine mist and humid monsoons</strong>, standard synthetic filter mesh and indoor metal coils accumulate thick microbial blockages within 6 months. This triples your energy cost, restricts optimal airflow, and can cause unexpected ice-overs or water leaks onto your furniture-lah!
                  </p>

                  <div className="py-2 text-center">
                    <button
                      onClick={() => {
                        setSimulatedEmailAppt(null);
                        if (onRebookOverdue) {
                          onRebookOverdue(simulatedEmailAppt);
                        }
                      }}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      📅 Instant One-Click Re-book Service (RM 80 onwards)
                    </button>
                    <p className="text-[9px] text-slate-400 pt-1.5 font-sans">Pre-fills your exact existing AC specifications instantly!</p>
                  </div>

                  <hr className="border-slate-100" />

                  <p className="text-[11px] text-slate-500 font-sans">
                    Have any questions? Simply ask <strong>Mike AI</strong> on our web dashboard, or click the priority WhatsApp dispatch number <strong>+6017-5162938</strong> to consult our operations center. Say goodbye to warm air!
                  </p>

                  <p className="text-slate-500 text-[11px]">
                    Warmest local Penang regards,<br />
                    <strong>Uncle Hock & Mike AI</strong><br />
                    SuperCool Customer Retention & Support Center
                  </p>
                </div>
              </div>
            </div>

            {/* Email Footer status bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center shrink-0">
              <span className="font-mono text-[9px] text-slate-500">
                SMTP Status: {emailSendingStatus === "sent" ? "✅ READY - DISPATCHED_ON_CYCLE_6M" : "⏳ CONNECTING_RELAY..."}
              </span>
              <button 
                onClick={() => setSimulatedEmailAppt(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO MAGNIFIER MODAL */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 sm:right-2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all cursor-pointer font-bold flex items-center justify-center w-9 h-9"
              title="Close"
            >
              <X size={20} />
            </button>

            {/* Expanded Image */}
            <div className="bg-white p-2 rounded-2xl shadow-2xl max-h-[80vh] overflow-hidden flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img 
                src={selectedPhoto} 
                alt="Enlarged Reference Inspection" 
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <p className="text-white/60 text-xs text-center mt-3 font-sans">
              SuperCool Penang On-Site Reference Photo • Click outside to exit full-screen
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
