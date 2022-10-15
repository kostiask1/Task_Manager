import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AppDispatch, RootState } from "../store"
import { AppState, IMessage, IMessageTypes } from "./types"

const initialState: AppState = {
  loading: true,
  messages: []
}

const app = createSlice({
  name: "app",
  initialState,
  reducers: {
    loading: (state: AppState, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    messages: (state: AppState, action: PayloadAction<IMessage[]>) => {
      state.messages = action.payload
    },
  },
})

export default app.reducer

// Actions

export const { loading, messages } = app.actions

const setMessage = (text: string, type: IMessageTypes) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const messagesArray = getState().app.messages as IMessage[]
    dispatch(
      messages([...messagesArray, { type, id: new Date().getTime(), text }])
    )
  }
}

// Set error
export const setError = (msg: string) => (dispatch: AppDispatch) =>
  dispatch(setMessage(msg, "danger"))

// Set success
export const setSuccess = (msg: string) => (dispatch: AppDispatch) =>
  dispatch(setMessage(msg, "success"))

export const deleteMessage = (id: number) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const messagesArray = getState().app.messages as IMessage[]
    const messagesTemp = [...messagesArray]
    const messageIndex = messagesTemp.findIndex((message) => message.id === id)
    messagesTemp.splice(messageIndex, 1)
    dispatch(messages(messagesTemp))
  }
}
