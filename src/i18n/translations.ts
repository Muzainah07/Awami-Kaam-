export type Language = 'ur' | 'en' | 'ps' | 'sd' | 'pa';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ur: {
    app_title: "عوامی کام (Awami Kam)",
    tagline: "پاکستان کا پہلا وائس-فرسٹ روزانہ مزدوری کا پلیٹ فارم",
    worker_role: "مزدور (Worker)",
    hirer_role: "مالک (Hirer)",
    continue_guest: "مہمان کے طور پر جاری رکھیں",
    send_otp: "آگے بڑھیں (Send SMS OTP)",
    verify_otp: "تصدیق کریں",
    dashboard: "ڈیش بورڈ",
    jobs: "کام",
    offers: "پیشکشیں",
    profile: "پروفائل",
    earnings: "کمائی",
    online_status: "آن لائن",
    offline_status: "آف لائن",
    post_job: "نیا کام پوسٹ کریں",
    fair_wage_badge: "منصفانہ اجرت (Fair Wage)"
  },
  en: {
    app_title: "Awami Kam",
    tagline: "Pakistan's Voice-First Daily Wage Marketplace",
    worker_role: "Worker",
    hirer_role: "Hirer",
    continue_guest: "Continue as guest",
    send_otp: "Send SMS OTP",
    verify_otp: "Verify & Enter",
    dashboard: "Dashboard",
    jobs: "Jobs",
    offers: "Offers",
    profile: "Profile",
    earnings: "Earnings",
    online_status: "Online",
    offline_status: "Offline",
    post_job: "Post New Job",
    fair_wage_badge: "Fair Wage"
  },
  ps: {
    app_title: "عوامی کام",
    tagline: "د پاکستان لومړی غږیز د ورځني اجرت بازار",
    worker_role: "مزدور",
    hirer_role: "گمارونکی",
    continue_guest: "د میلمه په توګه دوام ورکړئ",
    send_otp: "کوډ واستوئ",
    verify_otp: "تایید کړئ",
    dashboard: "ډشبورډ",
    jobs: "کارونه",
    offers: "پیشکشونه",
    profile: "پروفایل",
    earnings: "عاید",
    online_status: "آنلاین",
    offline_status: "آفلاین",
    post_job: "نوی کار ثبت کړئ",
    fair_wage_badge: "عادلانه مزد"
  },
  sd: {
    app_title: "عوامي ڪم",
    tagline: "پاڪستان جو پهريون آواز وارو ڏينهن جو اجرت وارو پليٽ فارم",
    worker_role: "مزدور",
    hirer_role: "مالڪ",
    continue_guest: "مهمان طور جاري رکو",
    send_otp: "ايس ايم ايس موستاريو",
    verify_otp: "تصديق ڪريو",
    dashboard: "ڊيش بورڊ",
    jobs: "ڪم",
    offers: "آفرز",
    profile: "پروفائيل",
    earnings: "آمدني",
    online_status: "آن لائين",
    offline_status: "آف لائين",
    post_job: "نئون ڪم پوسٽ ڪريو",
    fair_wage_badge: "منصفانه اجرت"
  },
  pa: {
    app_title: "عوامی کام",
    tagline: "پاکستان دا پہلا آواز والا روزانہ مزدوری دا پلیٹ فارم",
    worker_role: "مزدور",
    hirer_role: "مالک",
    continue_guest: "مہمان بن کے جاری رکھو",
    send_otp: "کوڈ بھیجو",
    verify_otp: "تصدیق کرو",
    dashboard: "ڈیش بورڈ",
    jobs: "کماں",
    offers: "پیشکشاں",
    profile: "پروفائل",
    earnings: "کمائی",
    online_status: "آن لائن",
    offline_status: "آف لائن",
    post_job: "نیا کم پوسٹ کرو",
    fair_wage_badge: "مناسب اجرت"
  }
};

export function t(key: string, lang: Language = 'ur'): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['ur'][key] || key;
}
