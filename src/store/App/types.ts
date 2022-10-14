const SET_LOADING = "SET_LOADING"
const SET_ERROR = "SET_ERROR"
const SET_SUCCESS = "SET_SUCCESS"

export interface AppState {
  loading: boolean
  messages: IMessage[]
  error: string
  success: string
}

export type IMessageTypes = "success" | "danger"

export interface IMessage {
  type: IMessageTypes
  id: number
  text: string
}

interface SetLoadingAction {
  type: typeof SET_LOADING
  payload: boolean
}

interface SetErrorAction {
  type: typeof SET_ERROR
  payload: string
}

interface SetSuccessAction {
  type: typeof SET_SUCCESS
  payload: string
}

export type AppAction = SetLoadingAction | SetErrorAction | SetSuccessAction
