const SET_USER = "SET_USER"
const SIGN_OUT = "SIGN_OUT"
const SET_LOADING = "SET_LOADING"
const SET_ERROR = "SET_ERROR"
const SET_SUCCESS = "SET_SUCCESS"

export interface User {
  firstName: string
  lastName: string
  profileImg: string
  email: string
  password: string
  id: string
  admin: boolean
  emailVerified: boolean
}

export interface AuthState {
  user: User
  authenticated: boolean
}
export interface AppState {
  loading: boolean
  error: string
  success: string
}

export interface Task {
  completed: boolean
  description: string
  id: number
  uid: string
  title: string
  parentTask?: string | null
  childTask?: string | null
  end?: string
  start: number
  updatedAt?: number
}

export interface SignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

// Actions
interface SetUserAction {
  type: typeof SET_USER
  payload: User
}

interface SetLoadingAction {
  type: typeof SET_LOADING
  payload: boolean
}

interface SignOutAction {
  type: typeof SIGN_OUT
}

interface SetErrorAction {
  type: typeof SET_ERROR
  payload: string
}

interface SetSuccessAction {
  type: typeof SET_SUCCESS
  payload: string
}

export type AuthAction =
  | SetUserAction
  | SetLoadingAction
  | SignOutAction
  | SetErrorAction
  | SetSuccessAction
