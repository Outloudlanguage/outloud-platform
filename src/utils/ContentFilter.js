// src/utils/ContentFilter.js

// 1. BANNED WORD DICTIONARY (Bilingual)
const PROFANITY_DICTIONARY = [
  // English
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'faggot', 'nigger', 'bastard', 'motherfucker',
  // Spanish
  'mierda', 'puta', 'puto', 'marico', 'marica', 'huevon', 'huevón', 'coño', 'cabron', 'cabrón', 'zorra', 'pendejo', 'pendeja', 'cojones', 'joder', 'maldito', 'maldita'
];

// 2. SPANISH ANCHOR WORDS (The English-Only Enforcer)
// We look for common grammatical connectors rather than specific verbs.
const SPANISH_STOP_WORDS = [
  ' el ', ' la ', ' los ', ' las ', ' un ', ' una ', ' unos ', ' unas ', 
  ' y ', ' o ', ' pero ', ' porque ', ' para ', ' con ', ' por ', ' como ', 
  ' que ', ' qué ', ' de ', ' del ', ' en ', ' es ', ' soy ', ' eres ', 
  ' somos ', ' son ', ' este ', ' esta ', ' eso ', ' esto ', ' muy ', ' más ', ' mas '
];

// 3. REGEX PATTERNS (The PII & Code Sweeper)
const REGEX_PATTERNS = {
  // Catches http, https, www, and raw domains (e.g., example.com)
  links: /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b)/gi,
  // Catches standard email formats
  emails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  // Catches international and standard formatted phone numbers
  phones: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  // Catches markdown blocks and raw HTML injection
  code: /```|<code>|<\/code>|<script>|<style>|<.*?>/gi
};

export const validateContent = (text, isDebateChannel = false) => {
  const normalizedText = text.toLowerCase();

  // A. Link & PII Filter
  if (REGEX_PATTERNS.links.test(normalizedText)) {
    return { isValid: false, error: "Links and website URLs are not allowed in the forum." };
  }
  if (REGEX_PATTERNS.emails.test(normalizedText)) {
    return { isValid: false, error: "For your privacy, sharing email addresses is restricted." };
  }
  if (REGEX_PATTERNS.phones.test(normalizedText)) {
    return { isValid: false, error: "For your privacy, sharing phone numbers is restricted." };
  }
  if (REGEX_PATTERNS.code.test(normalizedText)) {
    return { isValid: false, error: "Code snippets and raw HTML tags are not allowed." };
  }

  // B. Profanity Filter (Exact word boundaries to avoid false positives like "classhit")
  const containsProfanity = PROFANITY_DICTIONARY.some(word => {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    return wordRegex.test(normalizedText);
  });
  
  if (containsProfanity) {
    return { isValid: false, error: "Please keep the language academic and respectful. Profanity is strictly prohibited." };
  }

  // C. English-Only Enforcer (Only triggers if the channel is marked as a Debate)
  if (isDebateChannel) {
    // Pad the text with spaces and strip punctuation to accurately catch edge words
    const paddedText = ` ${normalizedText.replace(/[.,!?\n]/g, ' ')} `;
    let spanishWordCount = 0;
    
    SPANISH_STOP_WORDS.forEach(word => {
      // Count every occurrence of Spanish stop words
      const matches = paddedText.match(new RegExp(word, 'g'));
      if (matches) spanishWordCount += matches.length;
    });

    // If we hit 3 or more common Spanish anchor words, the text is overwhelmingly likely to be Spanish
    if (spanishWordCount >= 3) {
      return { isValid: false, error: "🚨 English-Only Zone: Debates must be strictly in English. Please translate your thoughts to practice!" };
    }
  }

  // If it survives the gauntlet, it is safe to inject into Supabase
  return { isValid: true, error: null };
};