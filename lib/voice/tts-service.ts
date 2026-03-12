// Text-to-Speech Service - Free Alternative with Audio Fallback

// Store loaded voices
let cachedVoices: SpeechSynthesisVoice[] = []
let voicesLoaded = false

// Language greeting audio URLs (using free TTS services)
// These are generated once and cached - we'll use a simple approach
const getGreetingAudioUrl = (lang: string, text: string): string => {
  const langCode = lang.split('-')[0]
  // Use SoundOfText API (free) or similar
  return `https://api.soundoftext.com/sounds/${encodeURIComponent(text)}-${langCode}`
}

// Load voices and cache them
export const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([])
      return
    }

    const synth = window.speechSynthesis

    const getVoicesInternal = () => {
      cachedVoices = synth.getVoices()
      if (cachedVoices.length > 0) {
        voicesLoaded = true
        console.log('TTS: Loaded', cachedVoices.length, 'voices')

        // Log Indian language voices
        const indianVoices = cachedVoices.filter(v =>
          v.lang.startsWith('ta') ||
          v.lang.startsWith('hi') ||
          v.lang.startsWith('te') ||
          v.lang.startsWith('en-IN')
        )
        if (indianVoices.length > 0) {
          console.log('TTS: Indian voices available:', indianVoices.map(v => `${v.name} (${v.lang})`))
        } else {
          console.log('TTS: No Indian voices found in browser')
        }
        resolve(cachedVoices)
      }
    }

    // Try to get voices immediately
    getVoicesInternal()

    // If no voices, wait for them to load
    if (cachedVoices.length === 0) {
      synth.onvoiceschanged = () => {
        getVoicesInternal()
      }
      // Fallback timeout
      setTimeout(() => {
        if (!voicesLoaded) {
          getVoicesInternal()
          resolve(cachedVoices)
        }
      }, 1000)
    }
  })
}

// Initialize voices on module load
if (typeof window !== 'undefined') {
  loadVoices()
}

// Get the best available voice for a language
const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (cachedVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices()
  }

  const langCode = lang.split('-')[0]

  // Language variants to try
  const langVariants = [
    lang,
    lang.replace('-', '_'),
    langCode + '-IN',
    langCode + '_IN',
    langCode,
  ]

  for (const variant of langVariants) {
    const voice = cachedVoices.find(v =>
      v.lang === variant ||
      v.lang.toLowerCase() === variant.toLowerCase()
    )
    if (voice) {
      return voice
    }
  }

  // Try partial match
  const partialMatch = cachedVoices.find(v =>
    v.lang.startsWith(langCode + '-') ||
    v.lang.startsWith(langCode + '_') ||
    v.lang.toLowerCase().startsWith(langCode.toLowerCase())
  )

  return partialMatch || null
}

// Check if browser has native voice for the language
export const hasNativeVoice = (lang: string): boolean => {
  return getBestVoice(lang) !== null
}

// Use SoundOfText API for TTS (free, supports Tamil, Hindi, etc.)
const speakWithSoundOfText = async (text: string, lang: string): Promise<void> => {
  const langCode = lang.split('-')[0]

  // Language code mapping for SoundOfText
  const langMap: Record<string, string> = {
    'ta': 'ta',  // Tamil
    'hi': 'hi',  // Hindi
    'te': 'te',  // Telugu
    'en': 'en-IN', // English India
    'es': 'es',  // Spanish
    'fr': 'fr',  // French
    'de': 'de',  // German
    'zh': 'zh-CN', // Chinese
    'ja': 'ja',  // Japanese
    'ko': 'ko',  // Korean
    'ar': 'ar',  // Arabic
    'pt': 'pt',  // Portuguese
    'ru': 'ru',  // Russian
  }

  const soundLang = langMap[langCode] || 'en-IN'

  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Request audio generation
      const createResponse = await fetch('https://api.soundoftext.com/sounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          engine: 'Google',
          data: {
            text: text,
            voice: soundLang,
          },
        }),
      })

      if (!createResponse.ok) {
        // Silent fail - will fall back to native TTS
        console.log('SoundOfText API unavailable, using fallback')
        reject(new Error('API unavailable'))
        return
      }

      const createData = await createResponse.json()

      if (!createData.success || !createData.id) {
        reject(new Error('Invalid response'))
        return
      }

      // Step 2: Poll for audio URL
      let audioUrl = ''
      let attempts = 0
      const maxAttempts = 10

      while (!audioUrl && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 500))

        const statusResponse = await fetch(`https://api.soundoftext.com/sounds/${createData.id}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'Done' && statusData.location) {
          audioUrl = statusData.location
        } else if (statusData.status === 'Error') {
          reject(new Error('Audio generation failed'))
          return
        }

        attempts++
      }

      if (!audioUrl) {
        reject(new Error('Timeout'))
        return
      }

      // Step 3: Play audio
      const audio = new Audio(audioUrl)
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('Playback failed'))

      await audio.play()

    } catch (error) {
      // Silent fail for network errors
      console.log('SoundOfText TTS unavailable:', (error as Error).message)
      reject(error)
    }
  })
}

// Native browser TTS
const speakNative = (text: string, lang: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported'))
      return
    }

    const synth = window.speechSynthesis
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    const voice = getBestVoice(lang)
    if (voice) {
      utterance.voice = voice
      console.log(`TTS: Using voice: ${voice.name} (${voice.lang})`)
    }

    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(e)

    // Ensure voices are loaded
    if (cachedVoices.length === 0) {
      loadVoices().then(() => {
        const v = getBestVoice(lang)
        if (v) utterance.voice = v
        synth.speak(utterance)
      })
    } else {
      synth.speak(utterance)
    }
  })
}

// Main speak function
export const speak = async (
  text: string,
  lang: string,
  options?: {
    useCloudFallback?: boolean
    onStart?: () => void
    onEnd?: () => void
    onError?: (error: Error) => void
  }
): Promise<void> => {
  const { useCloudFallback = true, onStart, onEnd, onError } = options || {}
  const langCode = lang.split('-')[0]

  // Indian languages that need cloud TTS
  const needsCloudTTS = ['ta', 'hi', 'te', 'ml', 'kn', 'bn', 'gu', 'mr']

  try {
    onStart?.()
    console.log(`TTS: Speaking in ${lang}: "${text.substring(0, 50)}..."`)

    // Check if we have native voice
    const hasNative = hasNativeVoice(lang)

    // For Indian languages without native voice, try SoundOfText
    if (needsCloudTTS.includes(langCode) && !hasNative && useCloudFallback) {
      console.log(`TTS: Using SoundOfText API for ${lang}`)
      try {
        await speakWithSoundOfText(text, lang)
        onEnd?.()
        return
      } catch (e) {
        console.log('TTS: SoundOfText failed, falling back to native:', e)
      }
    }

    // Use native browser TTS
    console.log(`TTS: Using native browser TTS for ${lang}`)
    await speakNative(text, lang)
    onEnd?.()

  } catch (error) {
    // Only log if it's a real error, not just API unavailability
    const errMsg = (error as Error)?.message || ''
    if (!errMsg.includes('unavailable') && !errMsg.includes('not supported')) {
      console.log('TTS: Speech synthesis unavailable for', lang)
    }
    onError?.(error as Error)
    onEnd?.()
  }
}

// Cancel any ongoing speech
export const cancelSpeech = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

// Language codes we support
const supportedLangs = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ja-JP', 'ko-KR', 'ar-SA', 'pt-BR', 'ru-RU']

// Get list of available languages with voice support
export const getAvailableVoices = (): { lang: string; hasNative: boolean }[] => {
  return supportedLangs.map(lang => ({
    lang,
    hasNative: hasNativeVoice(lang),
  }))
}

// Dummy function for compatibility
export const loadResponsiveVoice = (): Promise<void> => Promise.resolve()

export default {
  speak,
  cancelSpeech,
  loadVoices,
  getAvailableVoices,
  hasNativeVoice,
}
