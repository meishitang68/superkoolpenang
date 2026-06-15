import React, { useState, useRef, useEffect } from "react";
import { 
  Users, DollarSign, TrendingUp, CheckCircle, Search, 
  MapPin, Clock, Hammer, ClipboardList, CheckSquare, RefreshCw, Eye,
  Camera, Image, Video, Trash, Upload, Check, AlertTriangle
} from "lucide-react";
import { Appointment, PenangArea, ServiceType } from "../types";
import { SERVICE_TYPES, PENANG_AREAS, calculateEstimatedPrice } from "../data";

interface TechnicianHubProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, updates: Partial<Appointment>) => void;
}

export default function TechnicianHub({ appointments, onUpdateStatus }: TechnicianHubProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [assigningApptId, setAssigningApptId] = useState<string | null>(null);
  
  // Checklist tracker simulation
  const [activeChecklistApptId, setActiveChecklistApptId] = useState<string | null>(null);
  const [customChecksteps, setCustomChecksteps] = useState<Record<string, Record<string, boolean>>>({});

  // 6-Month CRM reminder dispatchers state
  const [sentReminders, setSentReminders] = useState<Record<string, 'email' | 'whatsapp' | 'sending' | null>>({});

  // Camera stream and capture states
  const [activeCameraApptId, setActiveCameraApptId] = useState<string | null>(null);
  const [activeCameraSlot, setActiveCameraSlot] = useState<"photoBefore" | "photoAfter" | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start the camera viewfinder for a specific appointment and photo slot
  const startCamera = async (apptId: string, slot: "photoBefore" | "photoAfter") => {
    setActiveCameraApptId(apptId);
    setActiveCameraSlot(slot);
    setCameraError(null);
    setIsCameraActive(true);
    
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          facingMode: "environment", // Default to rear-facing camera for taking photos of devices
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // We set the video source inside a setTimeout because the element might need to render first
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.warn("Camera media access failed:", err);
      setCameraError(
        "Could not access camera. Make sure you granted permissions or use the upload button to capture/upload from your library."
      );
    }
  };

  // Stop current camera stream and clean up tracks
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveCameraApptId(null);
    setActiveCameraSlot(null);
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Capture current frame from <video> into a canvas and return base64 string
  const capturePhoto = (apptId: string) => {
    if (!videoRef.current || !activeCameraSlot) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the current video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get high-quality JPEG base64 representation
        const base64Data = canvas.toDataURL("image/jpeg", 0.82);
        
        // Save the image into the appointment
        onUpdateStatus(apptId, { [activeCameraSlot]: base64Data });
        
        // Stop the camera
        stopCamera();
      }
    } catch (err) {
      console.error("Failed to capture image frame:", err);
      setCameraError("Failed to freeze and capture frame. Please try again or upload a photo.");
    }
  };

  // Handle uploaded files/photos (e.g. from gallery or native camera picker)
  const handleUploadedFile = (apptId: string, slot: "photoBefore" | "photoAfter", file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateStatus(apptId, { [slot]: reader.result as string });
    };
    reader.onerror = () => {
      alert("Error reading chosen file.");
    };
    reader.readAsDataURL(file);
  };

  // Stop camera on component unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const overdueRemindersList = appointments.filter(
    (appt) => appt.status === "completed" && getDaysElapsed(appt.serviceDate) >= 180
  );

  const simulateAdminReminder = (apptId: string, channel: 'email' | 'whatsapp') => {
    setSentReminders(prev => ({ ...prev, [apptId]: 'sending' }));
    setTimeout(() => {
      setSentReminders(prev => ({ ...prev, [apptId]: channel }));
    }, 1200);
  };

  // 1. Diagnostics summaries
  const totalJobs = appointments.length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length; // wait, let's use .filter().length
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const totalRevenue = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, current) => sum + current.estimatePrice, 0);
  const projectedRevenue = appointments
    .filter((a) => a.status !== "cancelled" && a.status !== "completed")
    .reduce((sum, current) => sum + current.estimatePrice, 0);

  // Group island and mainland counts
  const islandBookingsCount = appointments.filter((a) => {
    const areaInfo = PENANG_AREAS.find((area) => area.value === a.clientArea);
    return areaInfo?.zone === "Island";
  }).length;
  const mainlandBookingsCount = appointments.filter((a) => {
    const areaInfo = PENANG_AREAS.find((area) => area.value === a.clientArea);
    return areaInfo?.zone === "Mainland";
  }).length;

  // Filter lists
  const filteredAppointments = appointments.filter((appt) => {
    const statusMatch = filterStatus === "all" || appt.status === filterStatus;
    
    const areaInfo = PENANG_AREAS.find((area) => area.value === appt.clientArea);
    const zMatch =
      filterZone === "all" ||
      (filterZone === "island" && areaInfo?.zone === "Island") ||
      (filterZone === "mainland" && areaInfo?.zone === "Mainland");

    return statusMatch && zMatch;
  });

  const handleAssignTechnician = (apptId: string, name: string) => {
    onUpdateStatus(apptId, {
      technicianName: name,
      status: "assigned",
    });
    setAssigningApptId(null);
  };

  const handleStepToggle = (apptId: string, stepId: string) => {
    setCustomChecksteps((prev) => {
      const apptSteps = prev[apptId] || {};
      return {
        ...prev,
        [apptId]: {
          ...apptSteps,
          [stepId]: !apptSteps[stepId],
        },
      };
    });
  };

  const isChecklistCompleted = (apptId: string) => {
    const steps = customChecksteps[apptId] || {};
    return steps["casing"] && steps["coil"] && steps["drain"] && steps["gas"] && steps["temp"];
  };

  const handleFinalizeJobCompletion = (apptId: string) => {
    onUpdateStatus(apptId, {
      status: "completed",
    });
    setActiveChecklistApptId(null);
  };

  const formatServiceLabel = (type: string) => {
    return SERVICE_TYPES[type as keyof typeof SERVICE_TYPES]?.title || type;
  };

  return (
    <div className="space-y-6" id="technician-dispatch-hub">
      {/* Visual Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">SuperCool Penang Dispatch Center</h2>
        <p className="text-xs text-slate-500">
          Admin dashboard to manage customer requests, assign technicians, and track on-site maintenance checklists.
        </p>
      </div>

      {/* Grid of Business Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            📊
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-sans">Active Bookings</p>
            <p className="text-base font-bold text-slate-800">{totalJobs - completedCount} / {totalJobs}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            🌳
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-sans">Settled Revenue</p>
            <p className="text-base font-bold text-slate-800">RM {totalRevenue}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            🚗
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-sans">Queue Revenue</p>
            <p className="text-base font-bold text-slate-800 text-indigo-600">RM {projectedRevenue}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            ⛰️
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-sans">Island / Mainland Ratio</p>
            <p className="text-xs font-bold text-slate-800">{islandBookingsCount} Islands : {mainlandBookingsCount} Mainland</p>
          </div>
        </div>
      </div>

      {/* 6-MONTH RE-SERVICING CRM OVERDUE RADAR */}
      {overdueRemindersList.length > 0 && (
        <div className="bg-white border-2 border-dashed border-rose-200 rounded-2xl p-5 shadow-sm" id="admin-crm-radar">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="text-rose-600"><Users size={16} /></span>
            <h3 className="text-xs font-black text-rose-950 uppercase tracking-widest font-sans flex items-center gap-1">
              📢 6-Month Recurrent Maintenance Dispatch Radar ({overdueRemindersList.length} Clients Overdue)
            </h3>
          </div>
          <p className="text-[11px] text-slate-605 mb-4 leading-relaxed font-sans">
            These completed jobs are older than 180 days (6 months). As per customer retention protocol, they must be sent a proactive invitation to schedule standard cleaning.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overdueRemindersList.map((appt) => {
              const days = getDaysElapsed(appt.serviceDate);
              const status = sentReminders[appt.id];
              return (
                <div key={appt.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all text-left">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-xs font-black text-slate-850 font-sans">
                        👤 {appt.clientName}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                        {days} Days Overdue
                      </span>
                    </div>

                    <ul className="text-[10.5px] text-slate-600 space-y-1 font-sans">
                      <li>📞 <strong>Phone:</strong> {appt.clientPhone}</li>
                      <li>✉️ <strong>Email:</strong> {appt.clientEmail}</li>
                      <li>📍 <strong>Area:</strong> {appt.clientArea} ({appt.clientAddress})</li>
                      <li>🔧 <strong>Last Job:</strong> {appt.acBrand} {appt.acHorsepower} ({appt.serviceDate})</li>
                    </ul>
                  </div>

                  <div className="border-t border-slate-200 mt-3 pt-3 flex items-center justify-between gap-2">
                    {status === 'sending' ? (
                      <span className="text-[10px] text-amber-600 font-mono font-bold animate-pulse">
                        ⏳ TRANSMITTING SMTP...
                      </span>
                    ) : status === 'email' ? (
                      <span className="text-[10px] text-teal-600 font-mono font-bold flex items-center gap-1">
                        ✅ EMAIL CRM REMINDER SENT
                      </span>
                    ) : status === 'whatsapp' ? (
                      <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                        ✅ WHATSAPP OUTBOX FLUSHED
                      </span>
                    ) : (
                      <span className="text-[9.5px] text-slate-400 font-sans tracking-wide">
                        CRM Notification Pending
                      </span>
                    )}

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => simulateAdminReminder(appt.id, 'email')}
                        disabled={status === 'sending'}
                        className="bg-sky-50 text-sky-700 hover:bg-sky-100 disabled:opacity-50 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-sky-200 transition-all cursor-pointer"
                        title="Simulate automated e-mail CRM warning"
                      >
                        📬 CRM Email
                      </button>
                      <button
                        onClick={() => {
                          simulateAdminReminder(appt.id, 'whatsapp');
                          const waText = `Hello ${appt.clientName}-lah from SuperCool Penang! We noticed your last AC service was on ${appt.serviceDate} (${days} days ago). Let's schedule a cleaning today to keep it chilly!`;
                          window.open(`https://wa.me/60175162938?text=${encodeURIComponent(waText)}`, '_blank');
                        }}
                        disabled={status === 'sending'}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-emerald-200 transition-all cursor-pointer"
                      >
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 shrink-0">
          🔍 Filter Servicing Jobs:
        </span>
        
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          {/* Status filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Dispatch</option>
            <option value="confirmed">Confirmed Appointments</option>
            <option value="assigned">Technicians Dispatched</option>
            <option value="completed">Jobs Completed</option>
            <option value="cancelled">Cancelled Slots</option>
          </select>

          {/* Regional Group Filters */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Penang Regions</option>
            <option value="island">🏝️ Penang Island Only</option>
            <option value="mainland">🌉 Seberang Perai / Mainland</option>
          </select>
        </div>
      </div>

      {/* List of Incoming Service requests */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-250 p-8 text-center">
          <p className="text-xs text-slate-500">No aircon appointments match your filter selection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const steps = customChecksteps[appt.id] || {};
            const areaInfo = PENANG_AREAS.find((a) => a.value === appt.clientArea);
            const isIsland = areaInfo?.zone === "Island";

            return (
              <div
                key={appt.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 overflow-hidden shadow-sm flex flex-col divide-y divide-slate-100"
              >
                {/* Job ticket header */}
                <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/55 text-xs">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold block uppercase">
                      JOB NO: #{appt.id.toUpperCase().slice(-6)}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                      {appt.clientName} ({appt.clientPhone})
                    </h4>
                  </div>
                  
                  <div className="flex gap-2.5 items-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isIsland ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {isIsland ? "🏝️ Island" : "🌉 Mainland"} ({appt.clientArea})
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full font-semibold ${
                        appt.status === "completed"
                          ? "bg-emerald-100 text-emerald-850"
                          : appt.status === "cancelled"
                          ? "bg-rose-100 text-rose-850"
                          : appt.status === "assigned"
                          ? "bg-indigo-100 text-indigo-850"
                          : "bg-amber-100 text-amber-850"
                      }`}
                    >
                      {appt.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Job Info Grid */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                  <div className="space-y-1.5">
                    <strong className="text-slate-800 block text-xs">🛠️ Service Specifications:</strong>
                    <p className="font-medium text-slate-850 leading-relaxed text-xs">
                      {formatServiceLabel(appt.serviceType)} x {appt.unitsCount} Units
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans">
                      {appt.acBrand} ({appt.acHorsepower} {appt.acType})
                    </p>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Estimated Fee: <strong className="text-blue-600 font-semibold">RM {appt.estimatePrice}.00</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <strong className="text-slate-800 block text-xs">📍 Location Details:</strong>
                    <p className="text-[11px] text-slate-600 break-words leading-relaxed font-sans mt-0.5">
                      {appt.clientAddress}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 font-sans">
                      <Clock size={12} />
                      <span>{appt.serviceDate} ({appt.serviceTimeSlot.toUpperCase()})</span>
                    </div>
                  </div>

                  {/* Actions / Dispatch controls */}
                  <div className="flex flex-col justify-between space-y-3 shrink-0">
                    <div className="text-right">
                      {appt.technicianName ? (
                        <p className="font-semibold text-slate-800 flex items-center justify-end gap-1 font-sans text-xs">
                          🚘 Dispatched: <em className="text-indigo-600 font-bold not-italic">{appt.technicianName}</em>
                        </p>
                      ) : (
                        <p className="text-amber-600 italic text-[11px] font-sans font-medium">⚠️ No technician assigned yet.</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      {appt.status === "pending" && (
                        <button
                          onClick={() => onUpdateStatus(appt.id, { status: "confirmed" })}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                        >
                          Confirm Booking
                        </button>
                      )}

                      {appt.status === "confirmed" && (
                        <div className="relative">
                          {assigningApptId === appt.id ? (
                            <div className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 p-2.5 rounded-xl shadow-lg z-20 flex flex-col gap-1.5 min-w-[150px]">
                              <p className="text-[10px] font-bold text-slate-500 uppercase pb-1 border-b border-slate-100 font-sans">Choose Crew:</p>
                              {["Anwar", "Muthu", "Mike"].map((name) => (
                                <button
                                  key={name}
                                  onClick={() => handleAssignTechnician(appt.id, name)}
                                  className="text-left text-xs font-semibold px-2 py-1 hover:bg-blue-50 text-slate-700 rounded transition-colors block"
                                >
                                  👨🏽‍🔧 {name}
                                </button>
                              ))}
                              <button
                                onClick={() => setAssigningApptId(null)}
                                className="text-[10px] text-rose-600 hover:underline mt-1 text-center font-bold"
                              >
                                Close
                              </button>
                            </div>
                          ) : null}
                          <button
                            onClick={() => setAssigningApptId(appt.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                          >
                            Assign Technician
                          </button>
                        </div>
                      )}

                      {appt.status === "assigned" && (
                        <button
                          onClick={() => setActiveChecklistApptId(appt.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1"
                        >
                          <ClipboardList size={11} /> Open Site Checklist
                        </button>
                      )}

                      {appt.status !== "completed" && appt.status !== "cancelled" && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this booking?")) {
                              onUpdateStatus(appt.id, { status: "cancelled" });
                            }
                          }}
                          className="text-rose-600 hover:text-rose-805 text-[10px] font-bold px-2 py-1.5 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Technician Checklist Modal Frame */}
                {activeChecklistApptId === appt.id && (
                  <div className="p-4 bg-slate-50/80 border-t border-slate-150 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2 text-slate-800">
                        <ClipboardList size={16} className="text-emerald-600" />
                        <span className="font-bold text-xs sm:text-sm">On-Site Servicing Checklist - {appt.technicianName}</span>
                      </div>
                      <button
                        onClick={() => setActiveChecklistApptId(null)}
                        className="text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕ Close Checklist
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                      SuperCool Penang technicians are required to complete all checks on-site before accepting signoff. Check off the completed steps:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2" id="maintenance-checklist">
                      {[
                        { id: "casing", label: "Dismantled cover casing & thoroughly washed filter meshes", desc: "Covers removed and water spray cleaned." },
                        { id: "coil", label: "Sprayed chemical cleaner and pressure vacuum washed metal foil coils", desc: "Deep wash avoiding electrical board." },
                        { id: "drain", label: "Flushed drainage pipe to ensure zero residue / unblocked flow", desc: "No water drips/clogs guaranteed." },
                        { id: "gas", label: "Inspected refrigerant gas pressure levels (PSI) in exterior condenser", desc: "Ensures leak-free system." },
                        { id: "temp", label: "Performed 10-minute operation test (temperature checks < 16°C)", desc: "Confirms cold air flow." },
                      ].map((step) => (
                        <label
                          key={step.id}
                          className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            steps[step.id] ? "bg-emerald-50 border-emerald-300" : "bg-white border-slate-150"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!steps[step.id]}
                            onChange={() => handleStepToggle(appt.id, step.id)}
                            className="mt-1 accent-emerald-600 h-4 w-4 shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800">{step.label}</span>
                            <p className="text-[10px] text-slate-400 font-sans leading-tight mt-0.5">{step.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* On-Site Reference Photos Section */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3" id="technician-reference-photos-container">
                      <div className="flex items-center gap-2">
                        <Camera size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">📸 On-Site Reference Photos ('Before' & 'After')</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                        Please take or upload clear reference photos of the air conditioning unit before starting and after completing the service. These are shared instantly with the client's booking dashboard.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* BEFORE PHOTO CARD */}
                        <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-700">Before Servicing Photo</span>
                              {appt.photoBefore && (
                                <span className="text-[9px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Check size={10} /> Captured
                                </span>
                              )}
                            </div>

                            {/* Viewfinder or Preview */}
                            {activeCameraApptId === appt.id && activeCameraSlot === "photoBefore" ? (
                              <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex flex-col justify-between">
                                {cameraError ? (
                                  <div className="p-3 text-red-400 text-[10px] text-center my-auto">
                                    <AlertTriangle size={16} className="mx-auto mb-1" />
                                    {cameraError}
                                  </div>
                                ) : (
                                  <>
                                    <video
                                      ref={videoRef}
                                      autoPlay
                                      playsInline
                                      muted
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider animate-pulse flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full font-sans"></span>
                                      Live Lens View
                                    </div>
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-2 z-10">
                                      <button
                                        type="button"
                                        onClick={() => capturePhoto(appt.id)}
                                        className="bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-md active:scale-95"
                                      >
                                        Capture Frame
                                      </button>
                                      <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : appt.photoBefore ? (
                              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                                <img
                                  src={appt.photoBefore}
                                  alt="Before Servicing"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(appt.id, { photoBefore: undefined })}
                                  className="absolute top-2 right-2 bg-red-600/95 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-all active:scale-95"
                                  title="Delete Photo"
                                >
                                  <Trash size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="aspect-video rounded-lg border border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                                <Image size={24} className="stroke-1" />
                                <span className="text-[10px] font-medium font-sans">No "Before" image reference</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for Before Photo */}
                          {(!activeCameraApptId || activeCameraSlot !== "photoBefore") && (
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => startCamera(appt.id, "photoBefore")}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-705 text-[10px] font-bold py-1.5 px-2.5 rounded border border-slate-250 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                              >
                                <Camera size={11} className="text-blue-600" />
                                <span>Use Camera</span>
                              </button>
                              <label className="flex-1 bg-white hover:bg-slate-100 text-slate-705 text-[10px] font-bold py-1.5 px-2.5 rounded border border-slate-250 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center active:scale-95">
                                <Upload size={11} className="text-slate-500" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadedFile(appt.id, "photoBefore", file);
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>

                        {/* AFTER PHOTO CARD */}
                        <div className="border border-slate-150 rounded-lg p-3 bg-slate-50/50 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-700">After Servicing Photo</span>
                              {appt.photoAfter && (
                                <span className="text-[9px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Check size={10} /> Captured
                                </span>
                              )}
                            </div>

                            {/* Viewfinder or Preview */}
                            {activeCameraApptId === appt.id && activeCameraSlot === "photoAfter" ? (
                              <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex flex-col justify-between">
                                {cameraError ? (
                                  <div className="p-3 text-red-400 text-[10px] text-center my-auto">
                                    <AlertTriangle size={16} className="mx-auto mb-1" />
                                    {cameraError}
                                  </div>
                                ) : (
                                  <>
                                    <video
                                      ref={videoRef}
                                      autoPlay
                                      playsInline
                                      muted
                                      className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider animate-pulse flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full font-sans"></span>
                                      Live Lens View
                                    </div>
                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-2 z-10">
                                      <button
                                        type="button"
                                        onClick={() => capturePhoto(appt.id)}
                                        className="bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-md active:scale-95"
                                      >
                                        Capture Frame
                                      </button>
                                      <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="bg-slate-700 hover:bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : appt.photoAfter ? (
                              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                                <img
                                  src={appt.photoAfter}
                                  alt="After Servicing"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => onUpdateStatus(appt.id, { photoAfter: undefined })}
                                  className="absolute top-2 right-2 bg-red-600/95 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition-all active:scale-95"
                                  title="Delete Photo"
                                >
                                  <Trash size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="aspect-video rounded-lg border border-dashed border-slate-300 bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                                <Image size={24} className="stroke-1" />
                                <span className="text-[10px] font-medium font-sans">No "After" image reference</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for After Photo */}
                          {(!activeCameraApptId || activeCameraSlot !== "photoAfter") && (
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => startCamera(appt.id, "photoAfter")}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-705 text-[10px] font-bold py-1.5 px-2.5 rounded border border-slate-250 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                              >
                                <Camera size={11} className="text-blue-600" />
                                <span>Use Camera</span>
                              </button>
                              <label className="flex-1 bg-white hover:bg-slate-100 text-slate-705 text-[10px] font-bold py-1.5 px-2.5 rounded border border-slate-250 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center active:scale-95">
                                <Upload size={11} className="text-slate-500" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadedFile(appt.id, "photoAfter", file);
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => {
                          // Pre-fill all steps for fast testing
                          setCustomChecksteps((prev) => ({
                            ...prev,
                            [appt.id]: { casing: true, coil: true, drain: true, gas: true, temp: true },
                          }));

                          // Load mock sample before & after imagery, demonstrating clear on-site metrics
                          const mockBefore = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150"><rect width="300" height="150" fill="%232d3748"/><text x="150" y="45" font-family="sans-serif" font-weight="bold" font-size="14" fill="%23a0aec0" text-anchor="middle">AIRCON BEFORE SERVICE</text><rect x="50" y="70" width="200" height="30" fill="%234a5568" stroke="%23718096" stroke-width="2"/><circle cx="80" cy="85" r="3" fill="%23e53e3e"/><circle cx="120" cy="85" r="4" fill="%23e53e3e"/><circle cx="170" cy="85" r="3" fill="%23718096"/><text x="150" y="125" font-family="sans-serif" font-size="10" fill="%23fc8181" text-anchor="middle">⚠️ Heavy dust particles &amp; mildew (180+ days elapsed)</text></svg>`;
                          const mockAfter = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/205" width="300" height="150" viewBox="0 0 300 150"><rect width="300" height="150" fill="%231a202c"/><text x="150" y="45" font-family="sans-serif" font-weight="bold" font-size="14" fill="%234fd1c5" text-anchor="middle">AIRCON AFTER SERVICE</text><rect x="50" y="70" width="200" height="30" fill="%232d3748" stroke="%234fd1c5" stroke-width="2"/><line x1="80" y1="110" x2="100" y2="130" stroke="%234fd1c5" stroke-width="2" stroke-linecap="round"/><line x1="150" y1="110" x2="170" y2="130" stroke="%234fd1c5" stroke-width="2" stroke-linecap="round"/><line x1="210" y1="110" x2="230" y2="130" stroke="%234fd1c5" stroke-width="2" stroke-linecap="round"/><text x="150" y="125" font-family="sans-serif" font-size="10" fill="%2368d391" text-anchor="middle">✓ Deep chemical service completed &amp; sanitized</text></svg>`;
                          
                          onUpdateStatus(appt.id, {
                            photoBefore: appt.photoBefore || mockBefore,
                            photoAfter: appt.photoAfter || mockAfter
                          });
                        }}
                        className="text-slate-500 hover:text-slate-800 font-semibold text-[10px] font-sans px-3 py-1 bg-white border border-slate-200 rounded-lg whitespace-nowrap cursor-pointer active:scale-95"
                        title="Demos the complete checklist + mock photo previews"
                      >
                        ⚡ Fast Complete Checklist (Demo)
                      </button>

                      <button
                        onClick={() => handleFinalizeJobCompletion(appt.id)}
                        disabled={!isChecklistCompleted(appt.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs px-5 py-2 rounded-lg transition-all shadow-md"
                      >
                        ✓ Submit & Finalize Job
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
