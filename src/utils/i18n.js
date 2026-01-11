const translations = {
  en: {
    dashboard: "Dashboard",
    liveMonitor: "Live Monitor",
    dtcScanner: "DTC Scanner",
    reports: "Reports",
    settings: "Settings",
    rpm: "RPM",
    railPressure: "Rail Pressure",
    coolantTemp: "Coolant Temp",
    atfTemp: "ATF Temp",
    speed: "Speed",
    status: "Status",
    normal: "Normal",
    warning: "Warning",
    critical: "Critical",
    scvSticking: "SCV Sticking Detected",
    injectorRisk: "Injector Failure Risk",
    upgradeToPro: "Upgrade to Pro",
    lockedFeature: "This feature is available in Pro version",
    connect: "Connect",
    disconnect: "Disconnect",
    simulationMode: "Simulation Mode",
    language: "Language"
  },
  th: {
    dashboard: "แผงควบคุม",
    liveMonitor: "ดูกราฟสด",
    dtcScanner: "สแกนโค้ด",
    reports: "รายงาน",
    settings: "ตั้งค่า",
    rpm: "รอบเครื่องยนต์",
    railPressure: "แรงดันรางคอมมอนเรล",
    coolantTemp: "อุณหภูมิน้ำหล่อเย็น",
    atfTemp: "อุณหภูมิน้ำมันเกียร์",
    speed: "ความเร็ว",
    status: "สถานะ",
    normal: "ปกติ",
    warning: "เตือน",
    critical: "วิกฤต",
    scvSticking: "ตรวจพบวาล์ว SCV ติดขัด",
    injectorRisk: "เสี่ยงลูกสูบแตก (หัวฉีดผิดปกติ)",
    upgradeToPro: "อัปเกรดเป็น Pro",
    lockedFeature: "ฟีเจอร์นี้สำหรับรุ่น Pro เท่านั้น",
    connect: "เชื่อมต่อ",
    disconnect: "ตัดการเชื่อมต่อ",
    simulationMode: "โหมดจำลอง",
    language: "ภาษา"
  }
};

export const t = (key, lang = 'en') => {
  return translations[lang]?.[key] || key;
};
