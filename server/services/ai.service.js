const Groq = require('groq-sdk')

// ─── Safe lazy Groq client instantiation ──────────────────────────────────
let groqClient = null
const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      const authError = new Error('AI service is temporarily unavailable — GROQ_API_KEY is not configured')
      authError.statusCode = 503
      throw authError
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

// ─── Helper: call Groq API ─────────────────────────────────────────────────
// All 3 AI features use this same function
// Only the prompt changes — everything else is the same
const callGroq = async (prompt) => {
  const groq = getGroqClient()
  let response
  try {
    response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role:    'user',
          content: prompt,
        },
      ],
      temperature: 0.7,   // 0 = very strict, 1 = creative
      max_tokens:  500,   // keep responses short
    })
  } catch (err) {
    // Groq's SDK throws with err.status set to the HTTP status it received.
    // A 401 here almost always means GROQ_API_KEY in server/.env is missing,
    // invalid, or expired — not a bug in this code. Surface that clearly
    // instead of letting a generic 500 reach the client and the console.
    if (err.status === 401) {
      console.error('❌ Groq API key rejected (expired_api_key / invalid_api_key). Generate a fresh key at https://console.groq.com/keys and update GROQ_API_KEY in server/.env, then restart the server.')
      const authError = new Error('AI service is temporarily unavailable — invalid or expired API key')
      authError.statusCode = 503
      throw authError
    }
    if (err.status === 429) {
      const rateError = new Error('AI service rate limit reached — please try again shortly')
      rateError.statusCode = 429
      throw rateError
    }
    throw err
  }
  return extractGroqText(response)
}

// ─── Helper: pull the plain-text reply out of a Groq response ─────────────
const extractGroqText = (response) => {
  return response.choices[0]?.message?.content?.trim()
}

// ─── Summarize ─────────────────────────────────────────────────────────────
// @desc  Summarizes article into 3 bullet points
const summarizeArticle = async (title, description) => {
  const prompt = `
    Summarize this news article in exactly 3 bullet points.
    Each bullet point must be under 20 words.
    Be factual and concise.
    Format: start each point with "•"

    Article Title: ${title}
    Article Content: ${description}

    Give only the 3 bullet points, nothing else.
  `
  return await callGroq(prompt)
}

// ─── Explain Like I'm 5 ────────────────────────────────────────────────────
// @desc  Explains article in very simple language
const explainSimply = async (title, description) => {
  const prompt = `
    Explain this news article like I am a 10 year old child.
    Use very simple words. No jargon. Max 4 sentences.
    Make it easy and interesting to understand.

    Article Title: ${title}
    Article Content: ${description}

    Give only the simple explanation, nothing else.
  `
  return await callGroq(prompt)
}

// ─── Sentiment Analysis ────────────────────────────────────────────────────
// @desc  Returns positive, negative or neutral
const analyzeSentiment = async (title, description) => {
  const prompt = `
    Analyze the sentiment of this news article.
    Reply with ONLY one word: positive, negative, or neutral.
    No explanation. No punctuation. Just one word.

    Article Title: ${title}
    Article Content: ${description}
  `
  const result = await callGroq(prompt)

  // Clean and validate the response
  const sentiment = result?.toLowerCase().trim()
  if (['positive', 'negative', 'neutral'].includes(sentiment)) {
    return sentiment
  }
  return 'neutral' // default fallback
}

module.exports = { summarizeArticle, explainSimply, analyzeSentiment }