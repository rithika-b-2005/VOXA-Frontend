// Pre-recorded audio greetings for all supported languages
// These files should be placed in /public/audio/greetings/

export interface LanguageGreeting {
  code: string
  greeting: string
  audioFile: string
  expenseOrIncome: string
  expenseOrIncomeAudio: string
}

// Audio greeting configurations
export const audioGreetings: Record<string, LanguageGreeting> = {
  'en-IN': {
    code: 'en-IN',
    greeting: 'Hello! English language selected. How can I help you?',
    audioFile: '/audio/greetings/en-IN-greeting.mp3',
    expenseOrIncome: 'Is this an expense or income?',
    expenseOrIncomeAudio: '/audio/greetings/en-IN-expense-income.mp3',
  },
  'hi-IN': {
    code: 'hi-IN',
    greeting: 'नमस्ते! हिंदी भाषा चुनी गई। मैं आपकी कैसे मदद कर सकता हूं?',
    audioFile: '/audio/greetings/hi-IN-greeting.mp3',
    expenseOrIncome: 'क्या यह खर्च है या आय?',
    expenseOrIncomeAudio: '/audio/greetings/hi-IN-expense-income.mp3',
  },
  'ta-IN': {
    code: 'ta-IN',
    greeting: 'வணக்கம்! தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது. நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    audioFile: '/audio/greetings/ta-IN-greeting.mp3',
    expenseOrIncome: 'இது செலவா அல்லது வருமானமா?',
    expenseOrIncomeAudio: '/audio/greetings/ta-IN-expense-income.mp3',
  },
  'te-IN': {
    code: 'te-IN',
    greeting: 'నమస్కారం! తెలుగు భాష ఎంపిక చేయబడింది. నేను మీకు ఎలా సహాయం చేయగలను?',
    audioFile: '/audio/greetings/te-IN-greeting.mp3',
    expenseOrIncome: 'ఇది ఖర్చు లేదా ఆదాయం?',
    expenseOrIncomeAudio: '/audio/greetings/te-IN-expense-income.mp3',
  },
  'es-ES': {
    code: 'es-ES',
    greeting: '¡Hola! Idioma español seleccionado. ¿Cómo puedo ayudarte?',
    audioFile: '/audio/greetings/es-ES-greeting.mp3',
    expenseOrIncome: '¿Es un gasto o un ingreso?',
    expenseOrIncomeAudio: '/audio/greetings/es-ES-expense-income.mp3',
  },
  'fr-FR': {
    code: 'fr-FR',
    greeting: 'Bonjour! Langue française sélectionnée. Comment puis-je vous aider?',
    audioFile: '/audio/greetings/fr-FR-greeting.mp3',
    expenseOrIncome: 'Est-ce une dépense ou un revenu?',
    expenseOrIncomeAudio: '/audio/greetings/fr-FR-expense-income.mp3',
  },
  'de-DE': {
    code: 'de-DE',
    greeting: 'Hallo! Deutsche Sprache ausgewählt. Wie kann ich Ihnen helfen?',
    audioFile: '/audio/greetings/de-DE-greeting.mp3',
    expenseOrIncome: 'Ist das eine Ausgabe oder Einnahme?',
    expenseOrIncomeAudio: '/audio/greetings/de-DE-expense-income.mp3',
  },
  'zh-CN': {
    code: 'zh-CN',
    greeting: '你好！已选择中文。我能帮您什么忙？',
    audioFile: '/audio/greetings/zh-CN-greeting.mp3',
    expenseOrIncome: '这是支出还是收入？',
    expenseOrIncomeAudio: '/audio/greetings/zh-CN-expense-income.mp3',
  },
  'ja-JP': {
    code: 'ja-JP',
    greeting: 'こんにちは！日本語が選択されました。どのようにお手伝いできますか？',
    audioFile: '/audio/greetings/ja-JP-greeting.mp3',
    expenseOrIncome: 'これは支出ですか、収入ですか？',
    expenseOrIncomeAudio: '/audio/greetings/ja-JP-expense-income.mp3',
  },
  'ko-KR': {
    code: 'ko-KR',
    greeting: '안녕하세요! 한국어가 선택되었습니다. 어떻게 도와드릴까요?',
    audioFile: '/audio/greetings/ko-KR-greeting.mp3',
    expenseOrIncome: '지출인가요 수입인가요?',
    expenseOrIncomeAudio: '/audio/greetings/ko-KR-expense-income.mp3',
  },
  'ar-SA': {
    code: 'ar-SA',
    greeting: 'مرحباً! تم اختيار اللغة العربية. كيف يمكنني مساعدتك؟',
    audioFile: '/audio/greetings/ar-SA-greeting.mp3',
    expenseOrIncome: 'هل هذا مصروف أم دخل؟',
    expenseOrIncomeAudio: '/audio/greetings/ar-SA-expense-income.mp3',
  },
  'pt-BR': {
    code: 'pt-BR',
    greeting: 'Olá! Idioma português selecionado. Como posso ajudá-lo?',
    audioFile: '/audio/greetings/pt-BR-greeting.mp3',
    expenseOrIncome: 'É uma despesa ou receita?',
    expenseOrIncomeAudio: '/audio/greetings/pt-BR-expense-income.mp3',
  },
  'ru-RU': {
    code: 'ru-RU',
    greeting: 'Привет! Выбран русский язык. Как я могу вам помочь?',
    audioFile: '/audio/greetings/ru-RU-greeting.mp3',
    expenseOrIncome: 'Это расход или доход?',
    expenseOrIncomeAudio: '/audio/greetings/ru-RU-expense-income.mp3',
  },
}

// Play audio file
export const playAudio = (audioPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioPath)
    audio.onended = () => resolve()
    audio.onerror = (e) => {
      console.error('Audio playback error:', e)
      reject(e)
    }
    audio.play().catch(reject)
  })
}

// Play greeting for a language
export const playGreeting = async (langCode: string): Promise<void> => {
  const greeting = audioGreetings[langCode]
  if (greeting) {
    try {
      await playAudio(greeting.audioFile)
    } catch (e) {
      console.error(`Failed to play greeting for ${langCode}:`, e)
      throw e
    }
  }
}

// Play expense/income question for a language
export const playExpenseIncomeQuestion = async (langCode: string): Promise<void> => {
  const greeting = audioGreetings[langCode]
  if (greeting) {
    try {
      await playAudio(greeting.expenseOrIncomeAudio)
    } catch (e) {
      console.error(`Failed to play expense/income question for ${langCode}:`, e)
      throw e
    }
  }
}

// Check if audio file exists (by trying to fetch it)
export const hasAudioGreeting = async (langCode: string): Promise<boolean> => {
  const greeting = audioGreetings[langCode]
  if (!greeting) return false

  try {
    const response = await fetch(greeting.audioFile, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export default audioGreetings
