// Supported languages for voice input

export interface SupportedLanguage {
  code: string
  name: string
  flag: string
  nativeName: string
}

export const supportedLanguages: SupportedLanguage[] = [
  // English variants
  { code: "en-US", name: "English (US)", flag: "🇺🇸", nativeName: "English" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧", nativeName: "English" },
  { code: "en-IN", name: "English (India)", flag: "🇮🇳", nativeName: "English" },
  { code: "en-AU", name: "English (Australia)", flag: "🇦🇺", nativeName: "English" },

  // Indian languages
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳", nativeName: "हिंदी" },
  { code: "ta-IN", name: "Tamil", flag: "🇮🇳", nativeName: "தமிழ்" },
  { code: "te-IN", name: "Telugu", flag: "🇮🇳", nativeName: "తెలుగు" },
  { code: "kn-IN", name: "Kannada", flag: "🇮🇳", nativeName: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", flag: "🇮🇳", nativeName: "മലയാളം" },
  { code: "mr-IN", name: "Marathi", flag: "🇮🇳", nativeName: "मराठी" },
  { code: "bn-IN", name: "Bengali", flag: "🇮🇳", nativeName: "বাংলা" },
  { code: "gu-IN", name: "Gujarati", flag: "🇮🇳", nativeName: "ગુજરાતી" },
  { code: "pa-IN", name: "Punjabi", flag: "🇮🇳", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or-IN", name: "Odia", flag: "🇮🇳", nativeName: "ଓଡ଼ିଆ" },
  { code: "as-IN", name: "Assamese", flag: "🇮🇳", nativeName: "অসমীয়া" },
  { code: "ur-IN", name: "Urdu", flag: "🇮🇳", nativeName: "اردو" },

  // European languages
  { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸", nativeName: "Español" },
  { code: "es-MX", name: "Spanish (Mexico)", flag: "🇲🇽", nativeName: "Español" },
  { code: "es-AR", name: "Spanish (Argentina)", flag: "🇦🇷", nativeName: "Español" },
  { code: "fr-FR", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "fr-CA", name: "French (Canada)", flag: "🇨🇦", nativeName: "Français" },
  { code: "de-DE", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "pt-PT", name: "Portuguese (Portugal)", flag: "🇵🇹", nativeName: "Português" },
  { code: "pt-BR", name: "Portuguese (Brazil)", flag: "🇧🇷", nativeName: "Português" },
  { code: "nl-NL", name: "Dutch", flag: "🇳🇱", nativeName: "Nederlands" },
  { code: "pl-PL", name: "Polish", flag: "🇵🇱", nativeName: "Polski" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
  { code: "uk-UA", name: "Ukrainian", flag: "🇺🇦", nativeName: "Українська" },
  { code: "cs-CZ", name: "Czech", flag: "🇨🇿", nativeName: "Čeština" },
  { code: "ro-RO", name: "Romanian", flag: "🇷🇴", nativeName: "Română" },
  { code: "hu-HU", name: "Hungarian", flag: "🇭🇺", nativeName: "Magyar" },
  { code: "el-GR", name: "Greek", flag: "🇬🇷", nativeName: "Ελληνικά" },
  { code: "sv-SE", name: "Swedish", flag: "🇸🇪", nativeName: "Svenska" },
  { code: "da-DK", name: "Danish", flag: "🇩🇰", nativeName: "Dansk" },
  { code: "no-NO", name: "Norwegian", flag: "🇳🇴", nativeName: "Norsk" },
  { code: "fi-FI", name: "Finnish", flag: "🇫🇮", nativeName: "Suomi" },
  { code: "tr-TR", name: "Turkish", flag: "🇹🇷", nativeName: "Türkçe" },

  // Asian languages
  { code: "zh-CN", name: "Chinese (Simplified)", flag: "🇨🇳", nativeName: "中文 (简体)" },
  { code: "zh-TW", name: "Chinese (Traditional)", flag: "🇹🇼", nativeName: "中文 (繁體)" },
  { code: "zh-HK", name: "Chinese (Hong Kong)", flag: "🇭🇰", nativeName: "中文 (香港)" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
  { code: "th-TH", name: "Thai", flag: "🇹🇭", nativeName: "ไทย" },
  { code: "vi-VN", name: "Vietnamese", flag: "🇻🇳", nativeName: "Tiếng Việt" },
  { code: "id-ID", name: "Indonesian", flag: "🇮🇩", nativeName: "Bahasa Indonesia" },
  { code: "ms-MY", name: "Malay", flag: "🇲🇾", nativeName: "Bahasa Melayu" },
  { code: "fil-PH", name: "Filipino", flag: "🇵🇭", nativeName: "Filipino" },

  // Middle Eastern languages
  { code: "ar-SA", name: "Arabic (Saudi)", flag: "🇸🇦", nativeName: "العربية" },
  { code: "ar-AE", name: "Arabic (UAE)", flag: "🇦🇪", nativeName: "العربية" },
  { code: "ar-EG", name: "Arabic (Egypt)", flag: "🇪🇬", nativeName: "العربية" },
  { code: "he-IL", name: "Hebrew", flag: "🇮🇱", nativeName: "עברית" },
  { code: "fa-IR", name: "Persian", flag: "🇮🇷", nativeName: "فارسی" },

  // African languages
  { code: "af-ZA", name: "Afrikaans", flag: "🇿🇦", nativeName: "Afrikaans" },
  { code: "sw-KE", name: "Swahili", flag: "🇰🇪", nativeName: "Kiswahili" },

  // Other languages
  { code: "bn-BD", name: "Bengali (Bangladesh)", flag: "🇧🇩", nativeName: "বাংলা" },
  { code: "ne-NP", name: "Nepali", flag: "🇳🇵", nativeName: "नेपाली" },
  { code: "si-LK", name: "Sinhala", flag: "🇱🇰", nativeName: "සිංහල" },
  { code: "ta-LK", name: "Tamil (Sri Lanka)", flag: "🇱🇰", nativeName: "தமிழ்" },
]

// Helper function to get language by code
export const getLanguageByCode = (code: string): SupportedLanguage | undefined => {
  return supportedLanguages.find(lang => lang.code === code)
}

// Helper function to get language name by code
export const getLanguageName = (code: string): string => {
  const lang = getLanguageByCode(code)
  return lang?.name || code
}

// Helper function to get base language code (e.g., "en" from "en-US")
export const getBaseLanguageCode = (code: string): string => {
  return code.split('-')[0]
}

// Default language
export const DEFAULT_VOICE_LANGUAGE = "en-IN"
