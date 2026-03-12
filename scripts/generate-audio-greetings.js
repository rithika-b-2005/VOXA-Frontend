/**
 * Script to generate audio greetings using SoundOfText API
 * Run: node scripts/generate-audio-greetings.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Greetings for each language
const greetings = {
  'en-IN': {
    greeting: 'Hello! English language selected. How can I help you?',
    expenseOrIncome: 'Is this an expense or income?',
    voice: 'en-IN'
  },
  'hi-IN': {
    greeting: 'नमस्ते! हिंदी भाषा चुनी गई। मैं आपकी कैसे मदद कर सकता हूं?',
    expenseOrIncome: 'क्या यह खर्च है या आय?',
    voice: 'hi'
  },
  'ta-IN': {
    greeting: 'வணக்கம்! தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது. நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    expenseOrIncome: 'இது செலவா அல்லது வருமானமா?',
    voice: 'ta'
  },
  'te-IN': {
    greeting: 'నమస్కారం! తెలుగు భాష ఎంపిక చేయబడింది. నేను మీకు ఎలా సహాయం చేయగలను?',
    expenseOrIncome: 'ఇది ఖర్చు లేదా ఆదాయం?',
    voice: 'te'
  },
  'es-ES': {
    greeting: '¡Hola! Idioma español seleccionado. ¿Cómo puedo ayudarte?',
    expenseOrIncome: '¿Es un gasto o un ingreso?',
    voice: 'es'
  },
  'fr-FR': {
    greeting: 'Bonjour! Langue française sélectionnée. Comment puis-je vous aider?',
    expenseOrIncome: 'Est-ce une dépense ou un revenu?',
    voice: 'fr'
  },
  'de-DE': {
    greeting: 'Hallo! Deutsche Sprache ausgewählt. Wie kann ich Ihnen helfen?',
    expenseOrIncome: 'Ist das eine Ausgabe oder Einnahme?',
    voice: 'de'
  },
  'zh-CN': {
    greeting: '你好！已选择中文。我能帮您什么忙？',
    expenseOrIncome: '这是支出还是收入？',
    voice: 'zh-CN'
  },
  'ja-JP': {
    greeting: 'こんにちは！日本語が選択されました。どのようにお手伝いできますか？',
    expenseOrIncome: 'これは支出ですか、収入ですか？',
    voice: 'ja'
  },
  'ko-KR': {
    greeting: '안녕하세요! 한국어가 선택되었습니다. 어떻게 도와드릴까요?',
    expenseOrIncome: '지출인가요 수입인가요?',
    voice: 'ko'
  },
  'ar-SA': {
    greeting: 'مرحباً! تم اختيار اللغة العربية. كيف يمكنني مساعدتك؟',
    expenseOrIncome: 'هل هذا مصروف أم دخل؟',
    voice: 'ar'
  },
  'pt-BR': {
    greeting: 'Olá! Idioma português selecionado. Como posso ajudá-lo?',
    expenseOrIncome: 'É uma despesa ou receita?',
    voice: 'pt'
  },
  'ru-RU': {
    greeting: 'Привет! Выбран русский язык. Как я могу вам помочь?',
    expenseOrIncome: 'Это расход или доход?',
    voice: 'ru'
  }
};

const outputDir = path.join(__dirname, '..', 'public', 'audio', 'greetings');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to generate audio using SoundOfText API
async function generateAudio(text, voice, outputFile) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      engine: 'Google',
      data: {
        text: text,
        voice: voice
      }
    });

    const options = {
      hostname: 'api.soundoftext.com',
      port: 443,
      path: '/sounds',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success && json.id) {
            // Poll for audio URL
            pollForAudio(json.id, outputFile, resolve, reject);
          } else {
            reject(new Error('Failed to create audio: ' + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function pollForAudio(id, outputFile, resolve, reject, attempts = 0) {
  if (attempts > 20) {
    reject(new Error('Timeout waiting for audio'));
    return;
  }

  setTimeout(() => {
    https.get(`https://api.soundoftext.com/sounds/${id}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status === 'Done' && json.location) {
            // Download the audio file
            downloadFile(json.location, outputFile, resolve, reject);
          } else if (json.status === 'Error') {
            reject(new Error('Audio generation failed'));
          } else {
            // Keep polling
            pollForAudio(id, outputFile, resolve, reject, attempts + 1);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  }, 500);
}

function downloadFile(url, outputFile, resolve, reject) {
  const file = fs.createWriteStream(outputFile);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`✓ Downloaded: ${outputFile}`);
      resolve();
    });
  }).on('error', (err) => {
    fs.unlink(outputFile, () => {});
    reject(err);
  });
}

async function main() {
  console.log('Generating audio greetings...\n');

  for (const [langCode, data] of Object.entries(greetings)) {
    console.log(`Processing ${langCode}...`);

    try {
      // Generate greeting
      const greetingFile = path.join(outputDir, `${langCode}-greeting.mp3`);
      console.log(`  Generating greeting...`);
      await generateAudio(data.greeting, data.voice, greetingFile);

      // Wait a bit to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));

      // Generate expense/income question
      const expenseFile = path.join(outputDir, `${langCode}-expense-income.mp3`);
      console.log(`  Generating expense/income question...`);
      await generateAudio(data.expenseOrIncome, data.voice, expenseFile);

      // Wait before next language
      await new Promise(r => setTimeout(r, 1000));

      console.log(`✓ ${langCode} completed\n`);
    } catch (error) {
      console.error(`✗ Error for ${langCode}:`, error.message);
    }
  }

  console.log('\nDone! Audio files saved to:', outputDir);
}

main().catch(console.error);
