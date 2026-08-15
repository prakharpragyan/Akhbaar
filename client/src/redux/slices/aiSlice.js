import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { aiAPI } from '../../services/api'

// ─── Async Thunks ─────────────────────────────────────────────────────────

export const summarizeArticle = createAsyncThunk(
  'ai/summarize',
  async (articleData, { rejectWithValue }) => {
    try {
      const { data } = await aiAPI.summarize(articleData)
      return { url: articleData.url, result: data.summary }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Summarization failed')
    }
  }
)

export const explainArticle = createAsyncThunk(
  'ai/explain',
  async (articleData, { rejectWithValue }) => {
    try {
      const { data } = await aiAPI.explain(articleData)
      return { url: articleData.url, result: data.explanation }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Explanation failed')
    }
  }
)

export const sentimentArticle = createAsyncThunk(
  'ai/sentiment',
  async (articleData, { rejectWithValue }) => {
    try {
      const { data } = await aiAPI.sentiment(articleData)
      return { url: articleData.url, result: data.sentiment }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Sentiment failed')
    }
  }
)

// ─── Slice ────────────────────────────────────────────────────────────────
// We store AI results keyed by article URL
// This way each card manages its own AI state independently
const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    // { [articleUrl]: { summary, explanation, sentiment } }
    results:  {},
    // { [articleUrl_type]: true/false }
    loading:  {},
    // { [articleUrl_type]: 'error message' }
    errors:   {},
  },
  reducers: {},
  extraReducers: (builder) => {

    // ── SUMMARIZE ────────────────────────────────────────────────────────
    builder
      .addCase(summarizeArticle.pending, (state, action) => {
        const key = `${action.meta.arg.url}_summary`
        state.loading[key] = true
        delete state.errors[key]
      })
      .addCase(summarizeArticle.fulfilled, (state, action) => {
        const { url, result } = action.payload
        const key = `${url}_summary`
        state.loading[key] = false
        if (!state.results[url]) state.results[url] = {}
        state.results[url].summary = result
      })
      .addCase(summarizeArticle.rejected, (state, action) => {
        const key = `${action.meta.arg.url}_summary`
        state.loading[key] = false
        state.errors[key]  = action.payload
      })

    // ── EXPLAIN ──────────────────────────────────────────────────────────
    builder
      .addCase(explainArticle.pending, (state, action) => {
        const key = `${action.meta.arg.url}_explain`
        state.loading[key] = true
        delete state.errors[key]
      })
      .addCase(explainArticle.fulfilled, (state, action) => {
        const { url, result } = action.payload
        const key = `${url}_explain`
        state.loading[key] = false
        if (!state.results[url]) state.results[url] = {}
        state.results[url].explanation = result
      })
      .addCase(explainArticle.rejected, (state, action) => {
        const key = `${action.meta.arg.url}_explain`
        state.loading[key] = false
        state.errors[key]  = action.payload
      })

    // ── SENTIMENT ────────────────────────────────────────────────────────
    builder
      .addCase(sentimentArticle.pending, (state, action) => {
        const key = `${action.meta.arg.url}_sentiment`
        state.loading[key] = true
        delete state.errors[key]
      })
      .addCase(sentimentArticle.fulfilled, (state, action) => {
        const { url, result } = action.payload
        const key = `${url}_sentiment`
        state.loading[key] = false
        if (!state.results[url]) state.results[url] = {}
        state.results[url].sentiment = result
      })
      .addCase(sentimentArticle.rejected, (state, action) => {
        const key = `${action.meta.arg.url}_sentiment`
        state.loading[key] = false
        state.errors[key]  = action.payload
      })
  },
})

export default aiSlice.reducer