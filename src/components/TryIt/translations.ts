/**
 * Placeholder translations for the hero "try it" field until a real API is wired up.
 * The sample phrases have real, hand-checked translations; anything else gets a
 * pseudo-translation that only *looks* like the target language and is labelled as such.
 */

export const LANGUAGES = [
  { code: "zh", label: "中文", name: "Chinese" },
  { code: "es", label: "Español", name: "Spanish" },
  { code: "de", label: "Deutsch", name: "German" },
  { code: "ko", label: "한국어", name: "Korean" },
  { code: "ja", label: "日本語", name: "Japanese" },
  { code: "hi", label: "हिन्दी", name: "Hindi" },
  { code: "fr", label: "Français", name: "French" },
  { code: "it", label: "Italiano", name: "Italian" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export const SAMPLES: { en: string; t: Record<LangCode, string> }[] = [
  // The product lines typed out in the box.
  {
    en: "Speak in English and Ditto types it in their language.",
    t: {
      zh: "用英语说话，Ditto 会用对方的语言打出来。",
      es: "Habla en inglés y Ditto lo escribe en su idioma.",
      de: "Sprich Englisch und Ditto schreibt es in ihrer Sprache.",
      ko: "영어로 말하면 Ditto가 상대방의 언어로 입력해 줘요.",
      ja: "英語で話すと、Dittoが相手の言語で入力します。",
      hi: "अंग्रेज़ी में बोलिए, Ditto उसे उनकी भाषा में लिख देता है।",
      fr: "Parlez en anglais, Ditto l’écrit dans leur langue.",
      it: "Parla in inglese e Ditto lo scrive nella loro lingua.",
    },
  },
  {
    en: "Send voice notes in their language, in your own voice.",
    t: {
      zh: "用你自己的声音，发送对方语言的语音消息。",
      es: "Envía notas de voz en su idioma, con tu propia voz.",
      de: "Schick Sprachnachrichten in ihrer Sprache, mit deiner eigenen Stimme.",
      ko: "내 목소리 그대로, 상대방의 언어로 음성 메시지를 보내세요.",
      ja: "自分の声のまま、相手の言語でボイスメッセージを送れます。",
      hi: "अपनी ही आवाज़ में, उनकी भाषा में वॉइस नोट भेजिए।",
      fr: "Envoyez des messages vocaux dans leur langue, avec votre propre voix.",
      it: "Invia messaggi vocali nella loro lingua, con la tua voce.",
    },
  },
  {
    en: "Works in WhatsApp, Slack, Gmail and every app you type in.",
    t: {
      zh: "适用于 WhatsApp、Slack、Gmail，以及你打字的每个应用。",
      es: "Funciona en WhatsApp, Slack, Gmail y en cualquier app donde escribas.",
      de: "Funktioniert in WhatsApp, Slack, Gmail und jeder App, in der du tippst.",
      ko: "WhatsApp, Slack, Gmail 등 글을 쓰는 모든 앱에서 작동해요.",
      ja: "WhatsApp、Slack、Gmailなど、文字を入力するすべてのアプリで使えます。",
      hi: "WhatsApp, Slack, Gmail और हर उस ऐप में काम करता है जिसमें आप टाइप करते हैं।",
      fr: "Fonctionne dans WhatsApp, Slack, Gmail et toutes les applis où vous écrivez.",
      it: "Funziona su WhatsApp, Slack, Gmail e in ogni app in cui scrivi.",
    },
  },
  {
    en: "No copy and paste. Just talk, and it's already translated.",
    t: {
      zh: "无需复制粘贴。只管说话，翻译就已完成。",
      es: "Sin copiar y pegar. Solo habla y ya está traducido.",
      de: "Kein Kopieren und Einfügen. Einfach sprechen, schon übersetzt.",
      ko: "복사해서 붙여넣을 필요 없어요. 말하기만 하면 바로 번역돼요.",
      ja: "コピペは不要。話すだけで、もう翻訳されています。",
      hi: "कॉपी-पेस्ट की ज़रूरत नहीं। बस बोलिए, अनुवाद तैयार है।",
      fr: "Pas de copier-coller. Parlez, c’est déjà traduit.",
      it: "Niente copia e incolla. Parla e il testo è già tradotto.",
    },
  },
  // Everyday phrases people tend to try.
  {
    en: "Are we still on for dinner tonight?",
    t: {
      zh: "我们今晚还一起吃晚饭吗？",
      es: "¿Seguimos con la cena de esta noche?",
      de: "Bleibt es beim Abendessen heute Abend?",
      ko: "오늘 저녁 약속 그대로지?",
      ja: "今夜のディナー、まだ予定どおり？",
      hi: "क्या आज रात का डिनर अब भी पक्का है?",
      fr: "On dîne toujours ensemble ce soir ?",
      it: "È ancora confermata la cena di stasera?",
    },
  },
  {
    en: "Running ten minutes late, save me a seat!",
    t: {
      zh: "我要晚十分钟，帮我留个座位！",
      es: "Llego diez minutos tarde, ¡guárdame un sitio!",
      de: "Ich komme zehn Minuten später, halt mir einen Platz frei!",
      ko: "10분 늦을 것 같아, 자리 좀 맡아 줘!",
      ja: "10分遅れるから、席を取っておいて！",
      hi: "मैं दस मिनट लेट हूँ, मेरे लिए सीट रख लेना!",
      fr: "J’ai dix minutes de retard, garde-moi une place !",
      it: "Arrivo con dieci minuti di ritardo, tienimi un posto!",
    },
  },
  {
    en: "Can we move the call to 3pm?",
    t: {
      zh: "我们能把电话改到下午三点吗？",
      es: "¿Podemos pasar la llamada a las 3 de la tarde?",
      de: "Können wir den Anruf auf 15 Uhr verschieben?",
      ko: "통화를 오후 3시로 옮길 수 있을까요?",
      ja: "電話を午後3時に変更できますか？",
      hi: "क्या हम कॉल दोपहर 3 बजे कर सकते हैं?",
      fr: "On peut décaler l’appel à 15 h ?",
      it: "Possiamo spostare la chiamata alle 15?",
    },
  },
  {
    en: "Thank you so much for your help!",
    t: {
      zh: "非常感谢你的帮助！",
      es: "¡Muchas gracias por tu ayuda!",
      de: "Vielen Dank für deine Hilfe!",
      ko: "도와줘서 정말 고마워!",
      ja: "手伝ってくれて本当にありがとう！",
      hi: "आपकी मदद के लिए बहुत-बहुत धन्यवाद!",
      fr: "Merci beaucoup pour ton aide !",
      it: "Grazie mille per il tuo aiuto!",
    },
  },
];

// Word pools used only for the look-alike preview.
const POOLS: Record<LangCode, { words: string[]; join: string }> = {
  zh: { words: ["我们", "今天", "可以", "一起", "时间", "朋友", "晚上", "觉得", "非常", "已经", "这个", "地方", "喜欢", "需要", "明天"], join: "" },
  ja: { words: ["私たち", "今日", "一緒に", "時間", "友達", "とても", "これ", "場所", "好き", "明日", "もう", "少し", "本当に", "から", "ます"], join: "" },
  ko: { words: ["우리", "오늘", "같이", "시간", "친구", "정말", "이거", "장소", "좋아", "내일", "벌써", "조금", "진짜", "그래서", "해요"], join: " " },
  es: { words: ["nosotros", "hoy", "juntos", "tiempo", "amigo", "muy", "esto", "lugar", "gusta", "mañana", "ya", "poco", "verdad", "porque", "vamos"], join: " " },
  de: { words: ["wir", "heute", "zusammen", "Zeit", "Freund", "sehr", "das", "Ort", "gern", "morgen", "schon", "bisschen", "wirklich", "weil", "gehen"], join: " " },
  fr: { words: ["nous", "aujourd’hui", "ensemble", "temps", "ami", "très", "cela", "endroit", "aime", "demain", "déjà", "peu", "vraiment", "parce", "allons"], join: " " },
  it: { words: ["noi", "oggi", "insieme", "tempo", "amico", "molto", "questo", "posto", "piace", "domani", "già", "poco", "davvero", "perché", "andiamo"], join: " " },
  hi: { words: ["हम", "आज", "साथ", "समय", "दोस्त", "बहुत", "यह", "जगह", "पसंद", "कल", "पहले", "थोड़ा", "सच", "क्योंकि", "चलो"], join: " " },
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}' ]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** Returns the translation and whether it's real (a sample phrase) or a look-alike preview. */
export function translate(text: string, to: LangCode): { text: string; real: boolean } {
  const key = normalize(text);
  const sample = SAMPLES.find((s) => normalize(s.en) === key);
  if (sample) return { text: sample.t[to], real: true };

  const pool = POOLS[to];
  const words = key.split(" ").filter(Boolean);
  const out = words.map((w, i) => pool.words[hash(w + i) % pool.words.length]);
  let result = out.join(pool.join);
  if (pool.join === " " && result) result = result[0].toUpperCase() + result.slice(1);
  const end = /[?？]\s*$/.test(text) ? (pool.join ? "?" : "？") : /[!！]\s*$/.test(text) ? (pool.join ? "!" : "！") : pool.join ? "." : "。";
  return { text: result + end, real: false };
}
