import { Whitelist } from "../Wish/types"

export interface User {
  firstName: string
  lastName: string
  profileImg: string
  email: string
  password: string
  id: string
  admin: boolean
  emailVerified: boolean
  whitelist: Whitelist[]
}

export interface AuthState {
  user: User
  authenticated: boolean
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
