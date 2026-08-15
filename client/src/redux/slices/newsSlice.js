import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { newsAPI } from '../../services/api'

// Fetch by category (existing)
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (category = 'general', { rejectWithValue }) => {
    try {
      const { data } = await newsAPI.getNews(category)
      return data.articles
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch news')
    }
  }
)

// NEW — fetch personalized feed
export const fetchPersonalizedNews = createAsyncThunk(
  'news/fetchPersonalized',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await newsAPI.getPersonalizedNews()
      return { articles: data.articles, preferences: data.preferences }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch personalized news')
    }
  }
)
export const fetchRecommendations=createAsyncThunk(
  'news/fetchRecommendations',
  async(_,{rejectWithValue})=>{
    try{
      const{data}=await newsAPI.getRecommendations()
      return{
        articles:data.articles,
        basedOn:data.basedOn,
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recommendations')
    }
  }
)

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    articles:        [],
    activeCategory:  'personalized',  // default is now personalized
    preferences:     [],
    basedOn:        [],
    loading:         false,
    error:           null,
  },
  reducers: {
    setCategory(state, action) {
      state.activeCategory = action.payload
    },
  },
  extraReducers: (builder) => {
    // fetchNews
    builder
      .addCase(fetchNews.pending,    (state) => { state.loading = true;  state.error = null })
      .addCase(fetchNews.fulfilled,  (state, action) => { state.loading = false; state.articles = action.payload })
      .addCase(fetchNews.rejected,   (state, action) => { state.loading = false; state.error = action.payload })

    // fetchPersonalizedNews
    builder
      .addCase(fetchPersonalizedNews.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(fetchPersonalizedNews.fulfilled, (state, action) => {
        state.loading     = false
        state.articles    = action.payload.articles
        state.preferences = action.payload.preferences
      })
      .addCase(fetchPersonalizedNews.rejected,  (state, action) => { state.loading = false; state.error = action.payload })
    builder
      .addCase(fetchRecommendations.pending,   (state) => { state.loading = true;  state.error = null })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading     = false
        state.articles    = action.payload.articles
        state.basedOn      = action.payload.basedOn
      })
      .addCase(fetchRecommendations.rejected,  (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { setCategory } = newsSlice.actions
export default newsSlice.reducer