import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore/lite"
import { db } from "../firebase/base"
import { uploadDoc } from "../firebase/firestore"
import { AuthState, SignInData, SignUpData, User } from "./types"

const initialState: AuthState = {
  user: {
    firstName: "",
    lastName: "",
    profileImg: "",
    email: "",
    password: "",
    id: "",
    admin: false,
  },
  authenticated: false,
  loading: true,
  error: "",
  success: "",
}

const slice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload
      state.authenticated = true
    },
    loading: (state: AuthState, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    signOut: (state: AuthState) => {
      state.user = initialState.user
      state.authenticated = false
      state.loading = false
    },
    error: (state: AuthState, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    success: (state: AuthState, action: PayloadAction<string>) => {
      state.success = action.payload
    },
  },
})

export default slice.reducer

// Actions

export const { setUser, loading, signOut, error, success } = slice.actions

const auth = getAuth()

// Create user
export const signup = (data: SignUpData, onError: () => void) => {
  return async (dispatch: any) => {
    try {
      createUserWithEmailAndPassword(auth, data.email, data.password)
        .then((res) => {
          if (res.user) {
            const userData: User = {
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
              id: res.user.uid,
              admin: false,
              profileImg: "",
            }
            uploadDoc("users", userData)
            dispatch(setUser(userData))
          }
        })
        .catch((err) => {
          console.log(err)
          onError()
          dispatch(error(err.message))
        })
    } catch (err: any) {
      console.log(err)
      onError()
      dispatch(error(err.message))
    }
  }
}

// Get user by id
export const getUserById = (id: string) => {
  return async (dispatch: any) => {
    try {
      const q = query(collection(db, "users"), where("id", "==", id))
      const querySnapshot = await getDocs(q)
      const userData = querySnapshot.docs[0].data() as User

      if (userData) {
        dispatch(setUser(userData))
      } else {
        console.log("No such user!")
      }
    } catch (err) {
      console.log(err)
    }
  }
}

// Set loading
export const setLoading = (value: boolean) => {
  return (dispatch: any) => {
    dispatch(loading(value))
  }
}

// Log in
export const signin = (data: SignInData, onError: () => void) => {
  return async (dispatch: any) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
    } catch (err: any) {
      console.log(err)
      onError()
      dispatch(error(err.message))
    }
  }
}

// Log out
export const signout = () => {
  return async (dispatch: any) => {
    try {
      dispatch(loading(true))
      await auth.signOut()
      dispatch(signOut())
    } catch (err) {
      console.log(err)
      dispatch(loading(false))
    }
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
