export type Language = "en" | "zh" | "ms";

export interface TranslationDict {
  // Navigation & Brand
  brandName: string;
  brandTagline: string;
  navHome: string;
  navMyBookings: string;
  navMikeAi: string;
  navStaffConsole: string;
  navDispatchCenter: string;
  signedInAs: string;
  switchUser: string;
  signIn: string;

  // Hero Section
  heroPillarTag: string;
  heroHeading: string;
  heroHeadingAccent: string;
  heroSubheading: string;
  directBookTitle: string;
  directBookDesc: string;
  directBookBtn: string;
  askMikeTitle: string;
  askMikeDesc: string;
  askMikeBtn: string;
  myBookingPillarTitle: string;
  myBookingPillarDesc: string;
  myBookingPillarBtn: string;

  // Testimonial
  testimonialQuote: string;
  testimonialAuthor: string;

  // Services & Pricing Section
  servicesHeading: string;
  servicesSubheading: string;
  guaranteedTag: string;
  bookServiceBtn: string;
  perUnit: string;

  // Service Terms & Names
  normal_cleaning_title: string;
  normal_cleaning_desc: string;
  chemical_cleaning_title: string;
  chemical_cleaning_desc: string;
  chemical_overhaul_title: string;
  chemical_overhaul_desc: string;
  gas_topup_title: string;
  gas_topup_desc: string;
  water_leakage_repair_title: string;
  water_leakage_repair_desc: string;
  troubleshooting_repair_title: string;
  troubleshooting_repair_desc: string;
  installation_relocation_title: string;
  installation_relocation_desc: string;

  // Booking Form (Wizard)
  bookingWizardTitle: string;
  stepChooseService: string;
  stepAcProfile: string;
  stepAddressSlot: string;
  stepConfirmEstimate: string;
  nextStep: string;
  prevStep: string;
  secureBookingNow: string;
  sendWhatsAppDirect: string;

  // Form Fields
  fieldSelectService: string;
  fieldSelectServiceSub: string;
  fieldAcBrand: string;
  fieldAcBrandSub: string;
  fieldAcType: string;
  fieldAcTypeSub: string;
  fieldAcHorsepower: string;
  fieldAcHorsepowerSub: string;
  fieldUnitsCount: string;
  fieldUnitsCountSub: string;
  fieldClientName: string;
  fieldClientPhone: string;
  fieldClientEmail: string;
  fieldClientArea: string;
  fieldClientAreaSub: string;
  fieldClientAddress: string;
  fieldClientAddressSub: string;
  fieldServiceDate: string;
  fieldServiceDateSub: string;
  fieldServiceSlot: string;
  fieldServiceSlotSub: string;
  fieldUserNotes: string;
  fieldUserNotesSub: string;

  // Invoice & Summary
  reviewTitle: string;
  reviewSubtitle: string;
  receiptHeader: string;
  receiptSubtitle: string;
  invoiceRecipient: string;
  invoiceSummary: string;
  invoiceTotalEstimate: string;
  baseCharge: string;
  hpSurcharge: string;
  bulkDiscount: string;

  // Customer Dashboard
  dashboardTitle: string;
  dashboardSubtitle: string;
  newBookingBtn: string;
  noServicesScheduledYet: string;
  noServicesScheduledDesc: string;
  serviceRatedSuperCool: string;
  helpImproveFeedback: string;
  submitFeedback: string;
  feedbackSuccess: string;
  marineBreezeTitle: string;
  marineBreezeNote: string;
  mikesAdviceTitle: string;
  mikesAdviceNote: string;
  invoicePdf: string;
  modifyReschedule: string;
  cancelService: string;
  statusPending: string;
  statusConfirmed: string;
  statusAssigned: string;
  statusCompleted: string;
  statusCancelled: string;

  // Contact via QR
  contactViaQrTitle: string;
  contactViaQrSubtitle: string;
  qrScanInstruction: string;
  openWhatsAppBtn: string;

  // Mike AI Chat
  chatbotTitle: string;
  chatbotSubtitle: string;
  chatPlaceholder: string;
  thinkingText: string;
  chatPresetDripping: string;
  chatPresetWarm: string;
  chatPresetBlinking: string;
  chatPresetVinegar: string;

  // Staff Console / Admin Security
  staffTitle: string;
  staffDesc: string;
  ownerGoogleCheck: string;
  ownerCheckDesc: string;
  currentNotOwner: string;
  signInOwnerBtn: string;
  enterPasscode: string;
  passcodeHint: string;
  backHome: string;
  verifyAuthBtn: string;
  staffVerifiedPortal: string;
  lockLogoutBtn: string;
  crewNameLabel: string;
  assignCrew: string;
  jobDetails: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    brandName: "SuperCool",
    brandTagline: "Penang & Seberang Perai",
    navHome: "Home & Pricing",
    navMyBookings: "My Bookings",
    navMikeAi: "Mike AI",
    navStaffConsole: "Staff Console",
    navDispatchCenter: "Dispatch Center",
    signedInAs: "Signed in as:",
    switchUser: "Switch User",
    signIn: "Sign In",

    heroPillarTag: "Penang's True Local Multi-Brand Aircon Services (Since 1996)",
    heroHeading: "Settle Your Aircon Hotness.",
    heroHeadingAccent: "Penang Hill!",
    heroSubheading: "No sneaky pricing traps. Fast dispatch to both Penang Island (Georgetown, Gurney, Bayan Lepas) and Mainland (Butterworth, BM, Perai). Complete bi-annual normal chemical washes from just RM 80!",
    directBookTitle: "Direct Book Slots",
    directBookDesc: "Instantly schedule an appointment with Anwar or Muthu in 2 minutes.",
    directBookBtn: "Book Servicing",
    askMikeTitle: "Ask Mike AI",
    askMikeDesc: "Water leaking? Blinking green light? Get instant AI mechanic diagnostics with local Penang tips.",
    askMikeBtn: "Consult Mike",
    myBookingPillarTitle: "My Saved Bookings",
    myBookingPillarDesc: "Check existing repair sheets, view dynamic pricing breakdowns, or print invoice PDFs.",
    myBookingPillarBtn: "Manage Bookings",

    testimonialQuote: "\"Mike serviced our coffee shop aircon in Raja Uda Butterworth, very polite crew and cold wind blew on-the-spot! Prices match quoted bill of RM 160-lah.\"",
    testimonialAuthor: "- Koay Coffee Shop, Butterworth",

    servicesHeading: "No-Gimmick Penang Service Menu",
    servicesSubheading: "Transparent estimates based on transparent specifications. Settle your heat issue with absolute confidence.",
    guaranteedTag: "Guaranteed Price Estimate",
    bookServiceBtn: "Book This Service",
    perUnit: "per unit",

    normal_cleaning_title: "Normal Servicing",
    normal_cleaning_desc: "Standard filter vacuum, fan blower wash, drain pan flush, and 10-point check. Best for bi-annual maintenance.",
    chemical_cleaning_title: "Chemical Servicing",
    chemical_cleaning_desc: "Coil deep-clean with specialized chemical wash, prevents mold growth and unblocks stubborn dust buildup.",
    chemical_overhaul_title: "Chemical Overhaul",
    chemical_overhaul_desc: "Full dismantle of indoor unit, thorough coil chemical bath, check fan bearings, recommended for highly choked aircons.",
    gas_topup_title: "R32 / r410a Refrigerant Gas Top-up",
    gas_topup_desc: "Pressure diagnostic check and replenishment of cooling gas (up to 30 PSI). Restores original icy breeze.",
    water_leakage_repair_title: "Water Leakage Clearing",
    water_leakage_repair_desc: "Unclogging of condensate drain pipe using high-pressure vacuuming and flushing. Solves annoying drips instantly.",
    troubleshooting_repair_title: "Diagnostic & Repair",
    troubleshooting_repair_desc: "Diagnosis of general faults (no power, blinking light, noisy condenser). Checking fee is waived if repair is done.",
    installation_relocation_title: "Installation & Relocation",
    installation_relocation_desc: "Professional bracket mount, insulation, copper piping (up to 10ft), and neat casing. Starting price per unit.",

    bookingWizardTitle: "SuperCool Aircon Appointment Booking Wizard",
    stepChooseService: "1. Choose Service",
    stepAcProfile: "2. AC Profile",
    stepAddressSlot: "3. Address & Slot",
    stepConfirmEstimate: "4. Confirmation",
    nextStep: "Next Step",
    prevStep: "Previous Step",
    secureBookingNow: "Secure Booking Now",
    sendWhatsAppDirect: "Send WhatsApp Direct",

    fieldSelectService: "Which climate service do you require?",
    fieldSelectServiceSub: "Select the most relevant service based on symptoms.",
    fieldAcBrand: "Aircon Brand",
    fieldAcBrandSub: "Choose the manufacturer of your air conditioner.",
    fieldAcType: "Aircon Unit Build Type",
    fieldAcTypeSub: "Determines physical layout and setup requirements.",
    fieldAcHorsepower: "Aircon Horsepower",
    fieldAcHorsepowerSub: "Larger capacities require extra refrigerant or coil cleansing labor.",
    fieldUnitsCount: "Number of Aircon Units to Service",
    fieldUnitsCountSub: "Multi-unit orders enjoy automated handsome bulk discounts!",
    fieldClientName: "Your Full Name",
    fieldClientPhone: "WhatsApp Phone Number (for updates)",
    fieldClientEmail: "Email Address (for invoice PDF)",
    fieldClientArea: "Penang Regional Area",
    fieldClientAreaSub: "Servicing both Penang Island and Mainland.",
    fieldClientAddress: "Servicing Street Address & Postcode",
    fieldClientAddressSub: "Provide building name, unit number, street, and town.",
    fieldServiceDate: "Preferred Service Appointment Date",
    fieldServiceDateSub: "Our team operates Mon-Sat (closed Sundays).",
    fieldServiceSlot: "Preferred Arrival Arrival Slot",
    fieldServiceSlotSub: "Our team will arrive within this designated window.",
    fieldUserNotes: "Diagnostic Notes / Custom Requests",
    fieldUserNotesSub: "Describe blinking green lights, weird sound location, or urgent details.",

    reviewTitle: "Final Confirmation Details",
    reviewSubtitle: "Please double check your contact and details before confirming with Mike's team.",
    receiptHeader: "OFFICIAL ESTIMATE & QUOTATION",
    receiptSubtitle: "SuperCool Penang Aircon Engineers Co.",
    invoiceRecipient: "RECIPIENT:",
    invoiceSummary: "SERVICE DETAIL SUMMARY:",
    invoiceTotalEstimate: "AUTHORIZED NET ESTIMATE:",
    baseCharge: "Base Service Charge",
    hpSurcharge: "Horsepower Surcharge",
    bulkDiscount: "Bulk Volume Discount",

    dashboardTitle: "My Penang Service Bookings",
    dashboardSubtitle: "Monitor active appointments, download invoices, or request rescheduling.",
    newBookingBtn: "Book New Service",
    noServicesScheduledYet: "No Services Scheduled Yet",
    noServicesScheduledDesc: "Stay ahead of Penang's humid heat! Check symptoms with Mike AI or click the button above to book a repair or wash.",
    serviceRatedSuperCool: "Service Rated SuperCool?",
    helpImproveFeedback: "Help Mike improve our customer support standard in Penang!",
    submitFeedback: "Submit Feedback Rating",
    feedbackSuccess: "Thank you! Rating sent successfully.",
    marineBreezeTitle: "🌴 Penang Marine Corrosion Warning",
    marineBreezeNote: "Because Penang island is heavily subjected to saltwater marine breeze (especially Batu Ferringhi, Tanjung Bungah, and Gurney), outdoor condenser coils corrode and leak gas three times faster than inland cities.",
    mikesAdviceTitle: "Mike's Advice:",
    mikesAdviceNote: "Apply protective anti-rust coil coatings during your bi-annual normal chemical servicing to keep your inverter condenser running below 48°C peak load!",
    invoicePdf: "Invoice PDF",
    modifyReschedule: "Modify / Reschedule",
    cancelService: "Cancel Service",
    statusPending: "Awaiting Confirmation",
    statusConfirmed: "Confirmed & Prepared",
    statusAssigned: "Technician Dispatched",
    statusCompleted: "Fully Serviced",
    statusCancelled: "Cancelled",

    contactViaQrTitle: "Contact via QR",
    contactViaQrSubtitle: "Quick scan to chat with us",
    qrScanInstruction: "Scan with your phone's camera to immediately sync on WhatsApp & finalize details!",
    openWhatsAppBtn: "Open WhatsApp Chat",

    chatbotTitle: "Mike AI",
    chatbotSubtitle: "SuperCool Penang AI Assistant",
    chatPlaceholder: "Ask Mike AI e.g., Daikin blinking lamp...",
    thinkingText: "Mike AI is analyzing the issue",
    chatPresetDripping: "💧 Water Dripping",
    chatPresetWarm: "🔥 Blowing Warm Air",
    chatPresetBlinking: "⚡ Green Light Blinking",
    chatPresetVinegar: "💨 Smells Like Vinegar",

    staffTitle: "SuperCool Staff Console Access Guard",
    staffDesc: "You are attempting to access sensitive Penang technician log sheets and client coordinates. Only verified crew or founders are allowed.",
    ownerGoogleCheck: "Platform Owner Google Check:",
    ownerCheckDesc: "The system automatically grants entry if you are signed in with the register owner Google profile (mshtechnology@gmail.com).",
    currentNotOwner: "Current user is not in the automatic bypass list.",
    signInOwnerBtn: "Sign In with Owner Google Account",
    enterPasscode: "Enter Authorized Staff Passcode",
    passcodeHint: "Simulated credentials hint: Use SUPERCOOL-2026 or 60175162938 to easily review bypass features.",
    backHome: "Back Home",
    verifyAuthBtn: "Verify & Authenticate ✓",
    staffVerifiedPortal: "Staff Session Verified • Administrative Portal Active",
    lockLogoutBtn: "Lock & Log Out Console",
    crewNameLabel: "Crew:",
    assignCrew: "Assign Crew",
    jobDetails: "Job Details",
  },
  zh: {
    brandName: "超级冷气",
    brandTagline: "槟城与威省专业空调",
    navHome: "首页面与服务价格",
    navMyBookings: "我的预订记录",
    navMikeAi: "Mike AI 诊断",
    navStaffConsole: "员工控制台",
    navDispatchCenter: "派遣中心",
    signedInAs: "已登录账号:",
    switchUser: "切换账号",
    signIn: "立即登录",

    heroPillarTag: "槟城当地真正信赖的多品牌空调清洗与维修服务（自1996年起）",
    heroHeading: "彻底解决空调漏水与不冷问题。",
    heroHeadingAccent: "槟城山!",
    heroSubheading: "绝无隐藏收费陷阱。快速派遣至槟岛（乔治市，葛尼，峇六拜）和威省（北海，大山脚，北赖）。双年度常规化学清洗仅从 RM 80 起！",
    directBookTitle: "直接在线预订",
    directBookDesc: "可在2分钟内直接为您和 Anwar 或 Muthu 团队安排上门服务时间。",
    directBookBtn: "预订空调服务",
    askMikeTitle: "咨询 Mike AI 诊断",
    askMikeDesc: "冷气漏水？绿灯闪烁？立即获取具有槟城本地专业维护常识的 AI 机制诊断。",
    askMikeBtn: "在线咨询 Mike",
    myBookingPillarTitle: "已保存的预订",
    myBookingPillarDesc: "查看现有维修工单，获取透明的报价明细或打印格式化 PDF 销售单。",
    myBookingPillarBtn: "管理我的预订",

    testimonialQuote: "“Mike在北海拉惹乌达帮我们的咖啡店洗了冷气。他的团队非常有礼，洗完立刻吹出冷风！价格非常透明，和预先算好的一样 RM 160。”",
    testimonialAuthor: "- 槟城北海 郭氏咖啡店",

    servicesHeading: "透明且绝无套路的槟城服务菜单",
    servicesSubheading: "我们基于清晰的标准和功率进行诚信报价。让您在完全知情且无后顾之忧的情况下安心维修。",
    guaranteedTag: "保障评估报价",
    bookServiceBtn: "预订此服务",
    perUnit: "每台空调",

    normal_cleaning_title: "常规清洗与保养",
    normal_cleaning_desc: "过滤器吸尘，风轮清洗，排水槽冲洗，以及10项核心系统安全检测。最适合每半年进行一次的保养。",
    chemical_cleaning_title: "化学清洗",
    chemical_cleaning_desc: "使用专用药水对热交换器进行深度化学除灰，防止细菌和霉菌滋生并清除顽固的灰尘堆积。",
    chemical_overhaul_title: "全面化学大修 (Overhaul)",
    chemical_overhaul_desc: "将挂机室内机完整拆卸至零件状态并泡化学浴，检查风轮轴承，最推荐因积尘过度导致出风量极小的空调。",
    gas_topup_title: "R32 / r410a 制冷剂氟利昂加气",
    gas_topup_desc: "压力诊断检测并加满制冷气体（最高补足 30 PSI），迅速恢复空调的出厂般冰凉冷风。",
    water_leakage_repair_title: "冷气管路疏通（漏水修复）",
    water_leakage_repair_desc: "采用高压吸空与双放冲洗法疏通凝结水排水管。一次性完美消除让人烦恼的漏水和滴水问题。",
    troubleshooting_repair_title: "电路诊断与故障维修",
    troubleshooting_repair_desc: "全方位检测常见故障（空调无电源反应、红绿灯报错闪烁、室外机机箱异响）。如确认进行维修，检测费全免。",
    installation_relocation_title: "空调安装与移机服务",
    installation_relocation_desc: "专业挂钩支架安装，橡塑保温，原装紫铜管配置（最长10英尺）及精美管线槽。首台特惠报价起。",

    bookingWizardTitle: "超级冷气槟城服务订单预订向导",
    stepChooseService: "1. 选择服务",
    stepAcProfile: "2. 空调配置",
    stepAddressSlot: "3. 地址与时间",
    stepConfirmEstimate: "4. 最终确认",
    nextStep: "下一步",
    prevStep: "上一步",
    secureBookingNow: "立即担保预订",
    sendWhatsAppDirect: "发送 WhatsApp 直连",

    fieldSelectService: "您今天需要哪项冷气服务？",
    fieldSelectServiceSub: "根据您遇到的冷气故障或需求，选择最符合的选项。",
    fieldAcBrand: "冷气品牌",
    fieldAcBrandSub: "请选择您所安装的空调品牌厂商。",
    fieldAcType: "冷气机体结构形式",
    fieldAcTypeSub: "这决定了我们的洗机工具和现场作业流程标准。",
    fieldAcHorsepower: "冷气压缩机马力 (Horsepower)",
    fieldAcHorsepowerSub: "马力越大的空调需要配置更多的冷媒并耗费更多的技工工时。",
    fieldUnitsCount: "需要清洗或保养的冷气台数",
    fieldUnitsCountSub: "预订多台空调，系统会自动给您提供非常划算的批量团购折扣！",
    fieldClientName: "您的完整姓名",
    fieldClientPhone: "WhatsApp 电话（接收派单通知）",
    fieldClientEmail: "您的电子邮箱（接收 PDF 账单）",
    fieldClientArea: "位于槟城哪个区域？",
    fieldClientAreaSub: "服务覆盖槟岛以及威省全境地区。",
    fieldClientAddress: "详细服务门牌地址 & 邮编",
    fieldClientAddressSub: "请提供建筑物名称，门牌号，街道名称以及城镇所在。",
    fieldServiceDate: "期望上门服务的日期",
    fieldServiceDateSub: "我们团队工作日为周一至周六（周日休息）。",
    fieldServiceSlot: "期望上门的时间段",
    fieldServiceSlotSub: "我们的专业冷气技术人员会在您指定的窗口时间内抵达现场。",
    fieldUserNotes: "故障备注 / 客制化补充要求",
    fieldUserNotesSub: "在此处描述是否有绿灯闪烁、出风异味、异响或十万火急的加急订单详情。",

    reviewTitle: "最终预订确认信息",
    reviewSubtitle: "请在向 Mike 团队发送预订前，仔细检查并核对您的联系方式与服务详情。",
    receiptHeader: "官方价格评估与服务报价单",
    receiptSubtitle: "槟城超级冷气空调工程服务有限公司 (SuperCool)",
    invoiceRecipient: "账单接收人:",
    invoiceSummary: "选购服务项目摘要:",
    invoiceTotalEstimate: "确认应付预估净额:",
    baseCharge: "基础空调服务费",
    hpSurcharge: "马力容量附加费",
    bulkDiscount: "批量预订尊享折扣",

    dashboardTitle: "我的槟城冷气服务预订",
    dashboardSubtitle: "实时追踪您提交的工单进度、下载官方 PDF 收据或申请修改时间。",
    newBookingBtn: "录入新预订订单",
    noServicesScheduledYet: "目前无任何已计划的服务",
    noServicesScheduledDesc: "领先槟城黏湿闷热的高温一步！向 Mike AI 描述您的异常，或点击上方按钮录入您的首张预订网单。",
    serviceRatedSuperCool: "服务的制冷效果满意吗？",
    helpImproveFeedback: "请打分评估帮助 Mike 团队提升槟城的技术水平与客服体验！",
    submitFeedback: "提交反馈与评分",
    feedbackSuccess: "非常感谢您！评分与回访已成功归档。",
    marineBreezeTitle: "🌴 槟城沿海高盐雾和腐蚀警告",
    marineBreezeNote: "槟城作为一个海岛（尤其是巴都丁宜、丹绒武雅、新关仔角），室外冷凝器受到海风盐雾侵袭极易生锈泄漏。其发生气体泄漏的速度为内陆城市的三倍！",
    mikesAdviceTitle: "Mike 的专业建议:",
    mikesAdviceNote: "请在极力推荐的每半年常规化学清洗保养中，让技工加刷防锈冷凝器膜。这能保障变频外机在低于48°C的理想工况下运转，省电达30%！",
    invoicePdf: "账单收据 PDF",
    modifyReschedule: "修改 / 重新计划",
    cancelService: "取消此服务",
    statusPending: "等待团队确认",
    statusConfirmed: "店家已接单准务",
    statusAssigned: "冷气技工正前往中",
    statusCompleted: "服务圆满完成",
    statusCancelled: "服务已取消",

    contactViaQrTitle: "扫码极速沟通",
    contactViaQrSubtitle: "快速拍照扫码建立直接沟通",
    qrScanInstruction: "用您的手机相机对准扫码，即可在 WhatsApp 上直接同步，客服将为您极速调度！",
    openWhatsAppBtn: "打开 WhatsApp 对话",

    chatbotTitle: "Mike 智能诊断",
    chatbotSubtitle: "槟城超级冷气 AI 全候诊机械师",
    chatPlaceholder: "向 Mike 资深技工提问，如：大金空闪烁绿灯...",
    thinkingText: "Mike AI 正在后台分析此冷气故障",
    chatPresetDripping: "💧 室内机不断滴水",
    chatPresetWarm: "🔥 只吹风但完全不冷",
    chatPresetBlinking: "⚡ 绿灯不停闪烁休眠",
    chatPresetVinegar: "💨 一开机有像醋的酸味",

    staffTitle: "槟城超级冷气员工内网访问盾",
    staffDesc: "您当前正试图访问含有 Penang 主调度簿和客户精确门牌隐私的敏感页。仅限 SuperCool 授权内部职员查看。",
    ownerGoogleCheck: "平台所有者 Google 自动识别:",
    ownerCheckDesc: "若您以本软件创始管理员的 Google Profile (mshtechnology@gmail.com) 身份登录，系统会自动免密放行。",
    currentNotOwner: "当前登录的邮箱并不属于系统白名单管理员。",
    signInOwnerBtn: "以平台所有者 Google 账号登录",
    enterPasscode: "或手动验证内部职员准入通票码",
    passcodeHint: "模拟测试提示: 手动键入通票码 SUPERCOOL-2026 或 60175162938 即可轻松完成登录用以审计后台功能。",
    backHome: "返回客户前台",
    verifyAuthBtn: "进行验证并准入 ✓",
    staffVerifiedPortal: "职员控制台登录认证成功 • 槟威全境调度系统开通",
    lockLogoutBtn: "锁屏并安全登出",
    crewNameLabel: "派遣小组:",
    assignCrew: "指派冷气师傅",
    jobDetails: "工单具体详情",
  },
  ms: {
    brandName: "SuperCool",
    brandTagline: "Servis Aircond Penang & Seberang Perai",
    navHome: "Utama & Harga",
    navMyBookings: "Tempahan Saya",
    navMikeAi: "Mike AI Diagnostik",
    navStaffConsole: "Konsol Staf",
    navDispatchCenter: "Pusat Agihan",
    signedInAs: "Log masuk sebagai:",
    switchUser: "Tukar Akaun",
    signIn: "Log Masuk",

    heroPillarTag: "Servis Aircond Tempatan Tulang Belakang Penang (Sejak 1996)",
    heroHeading: "Selesaikan Masalah Panas Aircond.",
    heroHeadingAccent: "Bukit Bendera!",
    heroSubheading: "Tiada perangkap harga tersembunyi. Penghantaran cepat ke seluruh Pulau Pinang (Georgetown, Gurney, Bayan Lepas) dan Seberang Perai (Butterworth, BM, Perai). Servis chemical normal dwi-tahunan dari RM 80 sahaja!",
    directBookTitle: "Tempah Slot Terus",
    directBookDesc: "Jadualkan temujanji terus bersama team Anwar atau Muthu dalam masa 2 minit sahaja.",
    directBookBtn: "Tempah Sekarang",
    askMikeTitle: "Tanya Mike AI",
    askMikeDesc: "Aircond bocor air? Lampu hijau berkedip? Dapatkan diagnostik mekanik AI dengan tip cuaca Penang.",
    askMikeBtn: "Rujuk Mike AI",
    myBookingPillarTitle: "Tempahan Disimpan",
    myBookingPillarDesc: "Semak helaian kerja sedia ada, perhatikan butiran harga dinamik, atau cetak fail PDF invois.",
    myBookingPillarBtn: "Urus Tempahan",

    testimonialQuote: "\"Mike telah servis aircond kedai kopi kami di Raja Uda Butterworth, krew sangat sopan dan angin sejuk keluar serta-merta! Harga bertepatan dengan sebut harga RM 160-lah.\"",
    testimonialAuthor: "- Kedai Kopi Koay, Butterworth",

    servicesHeading: "Menu Servis Penang Tanpa Gimmick",
    servicesSubheading: "Anggaran telus berdasarkan spesifikasi terperinci. Selesaikan isu bahang rumah anda dengan penuh keyakinan.",
    guaranteedTag: "Jaminan Anggaran Harga",
    bookServiceBtn: "Tempah Servis Ini",
    perUnit: "per unit",

    normal_cleaning_title: "Servis Biasa (Normal)",
    normal_cleaning_desc: "Vakum penapis standard, basuh kipas blower, cuci takungan air pancit, dan pemeriksaan keselamatan 10-mata. Sesuai untuk penyelenggaraan dwi-tahunan.",
    chemical_cleaning_title: "Servis Kimia (Chemical)",
    chemical_cleaning_desc: "Pembersihan mendalam coil penyejuk dengan cecair kimia khas, mencegah kulat dan membuka sekatan habuk tebal.",
    chemical_overhaul_title: "Overhaul Kimia Penuh",
    chemical_overhaul_desc: "Buka komponen unit dalaman sepenuhnya, mandian kimia tangki coil, semak bearing kipas, sangat disyorkan untuk aircond yang tersumbat teruk.",
    gas_topup_title: "Isi Semula Gas R32 / R410a",
    gas_topup_desc: "Pemeriksaan diagnostik tekanan dan penambahan gas penyejuk (sehingga 30 PSI). Mengembalikan tiupan bayu sejuk beku asal.",
    water_leakage_repair_title: "Penyelesaian Aircond Bocor Air",
    water_leakage_repair_desc: "Pembersihan longkang kondensasi yang tersumbat menggunakan vakum bertekanan tinggi. Menyelesaikan titisan air yang menjengkelkan.",
    troubleshooting_repair_title: "Diagnostik & Pembaikan",
    troubleshooting_repair_desc: "Diagnosis kerosakan am (tiada kuasa elektrik, lampu berkelip, outdoor bising). Bayaran pemeriksaan adalah percuma sekiranya terus membaiki.",
    installation_relocation_title: "Pemasangan & Pemindahan",
    installation_relocation_desc: "Pemasangan bracket profesional, penebat haba, paip tembaga berkualiti (sehingga 10 kaki), dan casing kemas. Harga permulaan per unit.",

    bookingWizardTitle: "Pembantu Tempahan Servis Aircond SuperCool Penang",
    stepChooseService: "1. Pilih Servis",
    stepAcProfile: "2. Profil Aircond",
    stepAddressSlot: "3. Alamat & Slot",
    stepConfirmEstimate: "4. Pengesahan",
    nextStep: "Langkah Seterusnya",
    prevStep: "Langkah Sebelumnya",
    secureBookingNow: "Hantar Tempahan Selamat",
    sendWhatsAppDirect: "Hantar WhatsApp Terus",

    fieldSelectService: "Apakah jenis servis iklim yang anda perlukan?",
    fieldSelectServiceSub: "Pilih servis yang paling relevan berdasarkan tanda-tanda kerosakan.",
    fieldAcBrand: "Jenama Aircond",
    fieldAcBrandSub: "Sila pilih pengeluar unit penghawa dingin anda.",
    fieldAcType: "Jenis Binaan Aircond",
    fieldAcTypeSub: "Menentukan susun atur fizikal dan keperluan cuci krew kami.",
    fieldAcHorsepower: "Kuasa Kuda Aircond (Horsepower)",
    fieldAcHorsepowerSub: "Kapasiti HP yang lebih besar memerlukan kerja cucian coil atau gas tambahan.",
    fieldUnitsCount: "Bilangan Unit Aircond untuk Diservis",
    fieldUnitsCountSub: "Pesanan melebihi 2 unit secara automatik menikmati diskaun pukal yang lumayan!",
    fieldClientName: "Nama Penuh Anda",
    fieldClientPhone: "Nombor Telefon WhatsApp (untuk pengemaskinian)",
    fieldClientEmail: "Alamat E-mel (untuk resit PDF)",
    fieldClientArea: "Kawasan Wilayah Penang",
    fieldClientAreaSub: "Servis meliputi kedua-dua kawasan Pulau Pinang dan Seberang Perai.",
    fieldClientAddress: "Alamat Jalan Servis & Poskod",
    fieldClientAddressSub: "Sediakan nama bangunan, nombor unit, nama jalan, dan bandar.",
    fieldServiceDate: "Tarikh Tarikh Pilihan Servis",
    fieldServiceDateSub: "Krew kami beroperasi Isnin-Sabtu (Ahad cuti am).",
    fieldServiceSlot: "Slot Masa Ketibaan Kegemaran",
    fieldServiceSlotSub: "Team kami akan tiba di rumah anda dalam lingkungan tempoh masa ini.",
    fieldUserNotes: "Nota Diagnostik / Permintaan Khas",
    fieldUserNotesSub: "Tuliskan jika lampu berkelip berterusan, bunyi bising, atau butiran penghantaran segera.",

    reviewTitle: "Butiran Pengesahan Akhir",
    reviewSubtitle: "Sila buat semakan silang nombor telefon dan alamat anda sebelum menghantar kepada pasukan Mike.",
    receiptHeader: "ANGGARAN RASMI & SEBUT HARGA SEBUT HARGA",
    receiptSubtitle: "Syarikat Jurutera Aircond Penang SuperCool",
    invoiceRecipient: "PENERIMA INVOIS:",
    invoiceSummary: "RINGKASAN BUTIRAN PERKHIDMATAN:",
    invoiceTotalEstimate: "ANGGARAN BERSIH YANG DIBENARKAN:",
    baseCharge: "Caj Cas Servis Am",
    hpSurcharge: "Surcaj Had Kapasiti Horsepower",
    bulkDiscount: "Diskaun Pembelian Pukal",

    dashboardTitle: "Tempahan Perkhidmatan Penang Saya",
    dashboardSubtitle: "Pantau kemajuan temu janji aktif, muat turun invois rasmi, atau minta jadual semula.",
    newBookingBtn: "Tempah Servis Baru",
    noServicesScheduledYet: "Tiada Penyelenggaraan Dijadualkan Lagi",
    noServicesScheduledDesc: "Kekal sejuk sebelum bahang lembap Pulau Pinang menyerang! Tanya Mike AI atau klik butang di atas untuk mendaftar slot tempahan.",
    serviceRatedSuperCool: "Servis Sangat Dingin & SuperCool?",
    helpImproveFeedback: "Bantu Mike mempertingkatkan piawaian sokongan pelanggan kami di Pulau Pinang!",
    submitFeedback: "Hantar Maklum Balas",
    feedbackSuccess: "Terima kasih! Maklum balas berjaya dihantar ke arkib rasmi.",
    marineBreezeTitle: "🌴 Amaran Kakisan Pantai Pulau Pinang",
    marineBreezeNote: "Oleh sebab Pulau Pinang terdedah kepada bayu laut masin masin (terutama Batu Ferringhi, Tanjung Bungah, dan Gurney), coil pemeluwap luar mengakis dan bocor gas tiga kali lebih cepat berbanding bandar pedalaman.",
    mikesAdviceTitle: "Nasihat Mike Professional:",
    mikesAdviceNote: "Sapu salutan perlindungan anti-karat pemeluwap semasa servis kimia dwi-tahunan anda untuk menjaga unit luar berjalan lancar di bawah beban puncak 48°C!",
    invoicePdf: "PDF Invois",
    modifyReschedule: "Ubahsuai / Tukar Tarikh",
    cancelService: "Batalkan Servis",
    statusPending: "Menunggu Pengesahan",
    statusConfirmed: "Telah Disahkan & Sedia",
    statusAssigned: "Teknisi Telah Berlepas",
    statusCompleted: "Selesai Diservis",
    statusCancelled: "Telah Dibatalkan",

    contactViaQrTitle: "Hubungi menerusi QR",
    contactViaQrSubtitle: "Imbas pantas untuk bersembang",
    qrScanInstruction: "Imbas dengan kamera telefon pintar anda untuk menyegerakan butiran terus di WhatsApp krew!",
    openWhatsAppBtn: "Hubungi di WhatsApp",

    chatbotTitle: "Mike AI Pintar",
    chatbotSubtitle: "Pembantu Pintar AI SuperCool Penang",
    chatPlaceholder: "Tanya Mike AI cth., lampu Daikin berkedip...",
    thinkingText: "Mike AI sedang menganalisis isu tersebut",
    chatPresetDripping: "💧 Aircond Bocor Air",
    chatPresetWarm: "🔥 Keluar Angin Suam Sahaja",
    chatPresetBlinking: "⚡ Lampu Hijau Berkedip",
    chatPresetVinegar: "💨 Bau Masam Macam Cuka",

    staffTitle: "Perisai Akses Konsol Kakitangan SuperCool",
    staffDesc: "Anda cuba untuk mengakses lembaran kerja log teknisi Pulau Pinang yang sensitif. Hanya krew sah atau pengasas dibenarkan masuk.",
    ownerGoogleCheck: "Semakan Automatik Google Pengasas:",
    ownerCheckDesc: "Sistem secara automatik memberi kebenaran masuk jika anda log masuk dengan profil Google pemilik berdaftar (mshtechnology@gmail.com).",
    currentNotOwner: "Pengguna semasa tiada dalam senarai kelulusan automatik.",
    signInOwnerBtn: "Log Masuk dengan Akaun Google Pemilik",
    enterPasscode: "Atau Masukkan Kod Laluan Staf Kakitangan",
    passcodeHint: "Petunjuk kelayakan simulasi: Gunakan kod laluan SUPERCOOL-2026 atau 60175162938 untuk menyemak ciri pentadbiran dengan mudah.",
    backHome: "Kembali ke Laman Awam",
    verifyAuthBtn: "Sahkan Kod Laluan ✓",
    staffVerifiedPortal: "Sesi Staf Disahkan • Portal Pengurusan Pengedaran Aktif",
    lockLogoutBtn: "Kunci & Log Keluar Pentadbiran",
    crewNameLabel: "Pasukan Servis:",
    assignCrew: "Tugaskan Krew",
    jobDetails: "Maklumat Tugasan Kerja",
  },
};
