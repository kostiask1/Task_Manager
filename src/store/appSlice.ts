import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppState } from "./types"

const initialState: AppState = {
  loading: true,
  error: "",
  success: "",
}

const slice = createSlice({
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

export default slice.reducer

// Actions

export const { loading, error, success } = slice.actions

// Set loading
export const setLoading = (value: boolean) => {
  return (dispatch: any) => {
    dispatch(loading(value))
  }
}

let timer: boolean = false

// Set error
export const setError = (msg: string) => {
  return (dispatch: any) => {
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
  return (dispatch: any) => {
    if (timer) {
      dispatch(success(""))
      timer = false
    }
    timer = true
    setTimeout(() => dispatch(success(msg)))
  }
}
