import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppState } from "./types"
import { AppDispatch } from "./store"

const initialState: AppState = {
  loading: true,
  error: "",
  success: "",
}

const app = createSlice({
  name: "app",
  initialState,
  reducers: {
    loading: (state: AppState, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    error: (state: AppState, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    success: (state: AppState, action: PayloadAction<string>) => {
      state.success = action.payload
    },
  },
})

export default app.reducer

// Actions

export const { loading, error, success } = app.actions

let timer: boolean = false

// Set error
export const setError = (msg: string) => {
  return (dispatch: AppDispatch) => {
    if (timer) {
      dispatch(error(""))
      timer = false
    }
    timer = true
    setTimeout(() => dispatch(error(msg)))
  }
}

// Set success
export const setSuccess = (msg: string) => {
  return (dispatch: AppDispatch) => {
    if (timer) {
      dispatch(success(""))
      timer = false
    }
    timer = true
    setTimeout(() => dispatch(success(msg)))
  }
}
