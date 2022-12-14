import { Whitelist } from "../Wish/types"
import { ICity } from "../Weather/types"

export interface IUser {
  firstName: string
  lastName: string
  profileImg: string
  email: string
  password: string
  id: string
  admin: boolean
  emailVerified: boolean
  whitelist: Whitelist[]
  cities: ICity[]
}

export interface AuthState {
  user: IUser
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
