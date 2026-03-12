// Voice keywords for different languages - used to recognize spoken words

// Expense keywords in multiple languages
export const expenseKeywords = [
  // English
  "expense", "spent", "paid", "cost", "buy", "bought", "purchase",
  // Hindi
  "खर्च", "खर्चा", "भुगतान",
  // Tamil
  "செலவு", "செலவழித்தேன்",
  // Telugu
  "ఖర్చు", "ఖర్చుచేశాను",
  // Spanish
  "gasto", "gasté", "pagué",
  // French
  "dépense", "dépensé", "payé",
  // German
  "ausgabe", "ausgegeben", "bezahlt",
  // Chinese
  "支出", "花费", "付款",
  // Japanese
  "支出", "出費", "払った",
  // Korean
  "지출", "지불", "썼어요",
  // Arabic
  "مصروف", "صرف", "دفع",
  // Portuguese
  "despesa", "gastei", "paguei",
  // Russian
  "расход", "потратил", "заплатил",
]

// Income keywords in multiple languages
export const incomeKeywords = [
  // English
  "income", "received", "earned", "got", "salary", "payment",
  // Hindi
  "आय", "आमदनी", "मिला", "कमाई",
  // Tamil
  "வருமானம்", "சம்பளம்", "பெற்றேன்",
  // Telugu
  "ఆదాయం", "జీతం", "వచ్చింది",
  // Spanish
  "ingreso", "recibí", "gané", "salario",
  // French
  "revenu", "reçu", "gagné", "salaire",
  // German
  "einnahme", "einkommen", "erhalten", "gehalt",
  // Chinese
  "收入", "工资", "收到",
  // Japanese
  "収入", "給料", "もらった",
  // Korean
  "수입", "급여", "받았어요",
  // Arabic
  "دخل", "راتب", "استلم",
  // Portuguese
  "receita", "recebi", "salário",
  // Russian
  "доход", "получил", "зарплата",
]

// Yes/Confirm keywords in multiple languages
export const yesKeywords = [
  // English
  "yes", "yeah", "yep", "save", "confirm", "ok", "okay", "sure", "correct",
  // Hindi
  "हां", "हाँ", "जी", "ठीक", "सही",
  // Tamil
  "ஆம்", "சரி", "ஓகே",
  // Telugu
  "అవును", "సరే", "ఓకే",
  // Spanish
  "sí", "si", "vale", "bueno",
  // French
  "oui", "ouais", "d'accord",
  // German
  "ja", "jawohl", "okay",
  // Chinese
  "是", "好", "对", "确定",
  // Japanese
  "はい", "うん", "オッケー",
  // Korean
  "예", "네", "좋아요",
  // Arabic
  "نعم", "أجل", "موافق",
  // Portuguese
  "sim", "ok", "certo",
  // Russian
  "да", "ага", "хорошо",
]

// No/Cancel keywords in multiple languages
export const noKeywords = [
  // English
  "no", "nope", "cancel", "stop", "wrong", "incorrect",
  // Hindi
  "नहीं", "रद्द", "गलत",
  // Tamil
  "இல்லை", "வேண்டாம்", "ரத்து",
  // Telugu
  "కాదు", "వద్దు", "రద్దు",
  // Spanish
  "no", "cancelar", "incorrecto",
  // French
  "non", "annuler", "incorrect",
  // German
  "nein", "abbrechen", "falsch",
  // Chinese
  "不", "否", "取消", "不对",
  // Japanese
  "いいえ", "ダメ", "キャンセル",
  // Korean
  "아니오", "아니요", "취소",
  // Arabic
  "لا", "إلغاء", "خطأ",
  // Portuguese
  "não", "cancelar", "errado",
  // Russian
  "нет", "отмена", "неправильно",
]

// Word numbers in multiple languages for amount parsing
export const wordNumbers: Record<string, string> = {
  // English
  'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
  'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
  'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15',
  'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19',
  'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50',
  'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90',
  'hundred': '100', 'thousand': '1000', 'lakh': '100000', 'million': '1000000',

  // Hindi
  'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5',
  'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10',
  'बीस': '20', 'तीस': '30', 'चालीस': '40', 'पचास': '50',
  'साठ': '60', 'सत्तर': '70', 'अस्सी': '80', 'नब्बे': '90',
  'सौ': '100', 'हजार': '1000', 'लाख': '100000',

  // Spanish
  'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5',
  'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
  'veinte': '20', 'treinta': '30', 'cuarenta': '40', 'cincuenta': '50',
  'sesenta': '60', 'setenta': '70', 'ochenta': '80', 'noventa': '90',
  'cien': '100', 'ciento': '100', 'mil': '1000',

  // French (note: 'six' is same as English, already defined above)
  'un': '1', 'deux': '2', 'trois': '3', 'quatre': '4', 'cinq': '5',
  'sept': '7', 'huit': '8', 'neuf': '9', 'dix': '10',
  'vingt': '20', 'trente': '30', 'quarante': '40', 'cinquante': '50',
  'soixante': '60', 'cent': '100', 'mille': '1000',

  // German
  'eins': '1', 'zwei': '2', 'drei': '3', 'vier': '4', 'fünf': '5',
  'sechs': '6', 'sieben': '7', 'acht': '8', 'neun': '9', 'zehn': '10',
  'zwanzig': '20', 'dreißig': '30', 'vierzig': '40', 'fünfzig': '50',
  'sechzig': '60', 'siebzig': '70', 'achtzig': '80', 'neunzig': '90',
  'hundert': '100', 'tausend': '1000',

  // Tamil
  'ஒன்று': '1', 'இரண்டு': '2', 'மூன்று': '3', 'நான்கு': '4', 'ஐந்து': '5',
  'ஆறு': '6', 'ஏழு': '7', 'எட்டு': '8', 'ஒன்பது': '9', 'பத்து': '10',
  'நூறு': '100', 'ஆயிரம்': '1000',

  // Chinese/Japanese (shared characters)
  '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
  '六': '6', '七': '7', '八': '8', '九': '9', '十': '10',
  '百': '100', '千': '1000', '万': '10000',

  // Korean
  '일': '1', '이': '2', '삼': '3', '사': '4', '오': '5',
  '육': '6', '칠': '7', '팔': '8', '구': '9', '십': '10',
  '백': '100', '천': '1000', '만': '10000',
}

// Helper function to check if transcript contains any keyword
export const containsKeyword = (transcript: string, keywords: string[]): boolean => {
  const lowerTranscript = transcript.toLowerCase()
  return keywords.some(kw => lowerTranscript.includes(kw.toLowerCase()))
}

// Helper function to extract number from transcript
export const extractNumber = (transcript: string): string | null => {
  // First try to find numeric digits
  const numbers = transcript.match(/\d+\.?\d*/g)
  if (numbers && numbers.length > 0) {
    return numbers[0]
  }

  // Try to parse word numbers
  const lowerTranscript = transcript.toLowerCase()
  for (const [word, num] of Object.entries(wordNumbers)) {
    if (lowerTranscript.includes(word.toLowerCase())) {
      return num
    }
  }

  return null
}

// Category keywords mapping
export const categoryKeywords: Record<string, string[]> = {
  'Food & Dining': [
    'food', 'lunch', 'dinner', 'breakfast', 'eat', 'restaurant', 'coffee', 'snack',
    'खाना', 'भोजन', 'உணவு', 'ఆహారం', 'comida', 'nourriture', 'essen', '食物', '食事', '음식', 'طعام', 'comida', 'еда'
  ],
  'Transportation': [
    'transport', 'uber', 'ola', 'cab', 'taxi', 'bus', 'train', 'petrol', 'fuel', 'travel', 'metro',
    'यातायात', 'போக்குவரத்து', 'రవాణా', 'transporte', 'transport', 'verkehr', '交通', '交通', '교통', 'مواصلات', 'transporte', 'транспорт'
  ],
  'Shopping': [
    'shopping', 'amazon', 'flipkart', 'clothes', 'shoes', 'buy', 'purchase', 'mall',
    'शॉपिंग', 'ஷாப்பிங்', 'షాపింగ్', 'compras', 'shopping', 'einkaufen', '购物', 'ショッピング', '쇼핑', 'تسوق', 'compras', 'покупки'
  ],
  'Bills & Utilities': [
    'bill', 'electricity', 'water', 'gas', 'internet', 'phone', 'recharge', 'rent',
    'बिल', 'பில்', 'బిల్లు', 'factura', 'facture', 'rechnung', '账单', '請求書', '청구서', 'فاتورة', 'conta', 'счет'
  ],
  'Entertainment': [
    'entertainment', 'movie', 'netflix', 'spotify', 'game', 'fun', 'concert', 'show',
    'मनोरंजन', 'பொழுதுபோக்கு', 'వినోదం', 'entretenimiento', 'divertissement', 'unterhaltung', '娱乐', '娯楽', '오락', 'ترفيه', 'entretenimento', 'развлечения'
  ],
  'Healthcare': [
    'health', 'medicine', 'doctor', 'hospital', 'medical', 'pharmacy', 'clinic',
    'स्वास्थ्य', 'மருத்துவம்', 'వైద్యం', 'salud', 'santé', 'gesundheit', '医疗', '医療', '건강', 'صحة', 'saúde', 'здоровье'
  ],
  'Groceries': [
    'grocery', 'vegetables', 'fruits', 'supermarket', 'bigbasket', 'blinkit', 'milk',
    'किराना', 'மளிகை', 'కిరాణా', 'comestibles', 'épicerie', 'lebensmittel', '杂货', '食料品', '식료품', 'بقالة', 'mercearia', 'продукты'
  ],
  'Salary': [
    'salary', 'paycheck', 'wage', 'income',
    'वेतन', 'சம்பளம்', 'జీతం', 'salario', 'salaire', 'gehalt', '工资', '給料', '급여', 'راتب', 'salário', 'зарплата'
  ],
}

// Helper function to match category from transcript
export const matchCategory = (transcript: string, categories: Array<{ id: string; name: string }>): { id: string; name: string } | null => {
  const lowerTranscript = transcript.toLowerCase()

  // First try exact category name match
  const exactMatch = categories.find(cat =>
    lowerTranscript.includes(cat.name.toLowerCase())
  )
  if (exactMatch) return exactMatch

  // Then try keyword matching
  for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => lowerTranscript.includes(kw.toLowerCase()))) {
      const matchedCategory = categories.find(cat =>
        cat.name.toLowerCase().includes(categoryName.toLowerCase().split(' ')[0])
      )
      if (matchedCategory) return matchedCategory
      return { id: '', name: categoryName }
    }
  }

  return null
}
