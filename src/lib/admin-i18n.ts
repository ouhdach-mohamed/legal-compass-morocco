// Admin panel translations. Arabic is the default; only Arabic + English are supported.
export type AdminLang = "ar" | "en";
export const ADMIN_LANGS: { code: AdminLang; label: string; rtl: boolean }[] = [
  { code: "ar", label: "العربية", rtl: true },
  { code: "en", label: "English", rtl: false },
];
export const DEFAULT_ADMIN_LANG: AdminLang = "ar";

type Dict = Record<string, string>;

const AR: Dict = {
  // Layout / nav
  appTitle: "لوحة الإدارة",
  navDashboard: "لوحة التحكم",
  navProcedures: "المساطر",
  navQuestions: "الأسئلة غير المُجابة",
  navSettings: "الإعدادات",
  signOut: "تسجيل الخروج",
  language: "اللغة",

  // Login
  loginTitle: "دخول المسؤول",
  loginSubtitle: "يرجى إدخال بيانات الاعتماد للوصول إلى لوحة الإدارة.",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  signIn: "تسجيل الدخول",
  forgotPassword: "هل نسيت كلمة المرور؟",
  forgotTitle: "استعادة الوصول",
  forgotBody:
    "يرجى التواصل مع مسؤول النظام لإعادة تعيين بيانات الاعتماد. لا توجد خدمة بريد إلكتروني في هذا التطبيق المحلي.",
  close: "إغلاق",
  invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  loginSuccess: "تم تسجيل الدخول بنجاح.",

  // Dashboard
  dashboardTitle: "لوحة التحكم",
  dashboardSubtitle: "نظرة عامة على المحتوى القانوني وأسئلة المستخدمين.",
  proceduresCount: "المساطر",
  pendingCount: "أسئلة قيد المراجعة",
  languagesCount: "اللغات",
  questionsByLang: "الأسئلة حسب اللغة",
  proceduresList: "قائمة المساطر",

  // Common states
  loading: "جارٍ التحميل…",
  notAuthorized: "غير مصرح بالوصول.",
  nothingHere: "لا يوجد شيء هنا.",
  noProcedures: "لا توجد مساطر بعد.",

  // Procedures
  procTitle: "المساطر",
  procSubtitle: "إدارة المساطر القانونية والخطوات والكلمات المفتاحية.",
  newBtn: "جديد",
  edit: "تعديل",
  delete: "حذف",
  save: "حفظ",
  saving: "جارٍ الحفظ…",
  saved: "تم الحفظ",
  saveFailed: "فشل الحفظ",
  deleted: "تم الحذف",
  confirmDelete: "هل تريد حذف هذه المسطرة؟",
  slug: "المعرف",
  category: "الفئة",
  none: "— لا شيء —",
  active: "مُفعّل",
  inactive: "غير مُفعّل",
  titleField: "العنوان",
  summary: "الملخص",
  steps: "الخطوات",
  addStep: "إضافة خطوة",
  step: "الخطوة",
  stepContent: "محتوى الخطوة",
  keywords: "الكلمات المفتاحية",
  keyword: "الكلمة",
  weight: "الوزن",
  add: "إضافة",
  newProcedure: "مسطرة جديدة",
  editProcedure: "تعديل المسطرة",

  // Questions
  qTitle: "الأسئلة غير المُجابة",
  qSubtitle: "أسئلة لم يتمكن المساعد من الإجابة عليها. اربطها بمسطرة أو تجاهلها.",
  pending: "قيد المراجعة",
  all: "الكل",
  resolved: "تم الحل",
  ignored: "تم التجاهل",
  linkToProcedure: "اربط بمسطرة…",
  markResolved: "تعليم كمحلول",
  ignore: "تجاهل",

  // Settings
  settingsTitle: "إعدادات الحساب",
  settingsSubtitle: "تغيير البريد الإلكتروني أو كلمة مرور المسؤول.",
  currentPassword: "كلمة المرور الحالية",
  newEmail: "البريد الإلكتروني الجديد",
  newPassword: "كلمة المرور الجديدة (اختياري)",
  newPasswordHint: "اتركها فارغة للاحتفاظ بكلمة المرور الحالية.",
  updateCreds: "تحديث بيانات الاعتماد",
  credsUpdated: "تم تحديث بيانات الاعتماد بنجاح.",
  currentPwWrong: "كلمة المرور الحالية غير صحيحة.",
  updateFailed: "فشل التحديث.",
};

const EN: Dict = {
  appTitle: "Admin Console",
  navDashboard: "Dashboard",
  navProcedures: "Procedures",
  navQuestions: "Unanswered",
  navSettings: "Settings",
  signOut: "Sign out",
  language: "Language",

  loginTitle: "Admin sign in",
  loginSubtitle: "Enter your credentials to access the admin panel.",
  email: "Email",
  password: "Password",
  signIn: "Sign in",
  forgotPassword: "Forgot password?",
  forgotTitle: "Recover access",
  forgotBody:
    "Please contact the system administrator to reset credentials. This local app does not send emails.",
  close: "Close",
  invalidCredentials: "Email or password is incorrect.",
  loginSuccess: "Signed in successfully.",

  dashboardTitle: "Dashboard",
  dashboardSubtitle: "Overview of legal content and user questions.",
  proceduresCount: "Procedures",
  pendingCount: "Pending questions",
  languagesCount: "Languages",
  questionsByLang: "Questions by language",
  proceduresList: "Procedures",

  loading: "Loading…",
  notAuthorized: "Not authorized.",
  nothingHere: "Nothing here.",
  noProcedures: "No procedures yet.",

  procTitle: "Procedures",
  procSubtitle: "Manage legal procedures, steps, and keywords.",
  newBtn: "New",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  saving: "Saving…",
  saved: "Saved",
  saveFailed: "Save failed",
  deleted: "Deleted",
  confirmDelete: "Delete this procedure?",
  slug: "Slug",
  category: "Category",
  none: "— None —",
  active: "Active",
  inactive: "Inactive",
  titleField: "Title",
  summary: "Summary",
  steps: "Steps",
  addStep: "Add step",
  step: "Step",
  stepContent: "Step content",
  keywords: "Keywords",
  keyword: "Keyword",
  weight: "Weight",
  add: "Add",
  newProcedure: "New procedure",
  editProcedure: "Edit procedure",

  qTitle: "Unanswered questions",
  qSubtitle: "Questions the assistant couldn't match. Link to a procedure or ignore.",
  pending: "Pending",
  all: "All",
  resolved: "Resolved",
  ignored: "Ignored",
  linkToProcedure: "Link to procedure…",
  markResolved: "Mark resolved",
  ignore: "Ignore",

  settingsTitle: "Account settings",
  settingsSubtitle: "Change the admin email or password.",
  currentPassword: "Current password",
  newEmail: "New email",
  newPassword: "New password (optional)",
  newPasswordHint: "Leave blank to keep the current password.",
  updateCreds: "Update credentials",
  credsUpdated: "Credentials updated successfully.",
  currentPwWrong: "Current password is incorrect.",
  updateFailed: "Update failed.",
};

export const ADMIN_I18N: Record<AdminLang, Dict> = { ar: AR, en: EN };

export type AdminTKey = keyof typeof AR;
