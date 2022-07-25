import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore/lite"
import { db } from "../firebase/base"
import { uploadDoc } from "../firebase/firestore"
import { setError, setLoading, setSuccess } from "./appSlice"
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
    emailVerified: false,
  },
  authenticated: false,
}

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (state: AuthState, action: PayloadAction<User>) => {
      state.user = action.payload
      state.authenticated = true
    },
    signOut: (state: AuthState) => {
      state.user = initialState.user
      state.authenticated = false
    },
  },
})

export default auth.reducer

// Actions

export const { setUserData, signOut } = auth.actions

const _auth = getAuth()

export const setUser = (data: User) => {
  return (dispatch: any) => {
    dispatch(setUserData(data))
  }
}
// Create user
export const signup = (data: SignUpData, onError: () => void) => {
  return async (dispatch: any) => {
    try {
      createUserWithEmailAndPassword(_auth, data.email, data.password)
        .then((res) => {
          if (res.user) {
            const userData: User = {
              ...data,
              id: res.user.uid,
              admin: false,
              profileImg: "",
              emailVerified: false,
            }
            uploadDoc("users", userData)
            sendEmailVerification(_auth.currentUser as any).then(() => {
              setTimeout(
                () =>
                  dispatch(
                    setSuccess("Check your email to verify your account!")
                  ),
                3000
              )
            })
            dispatch(setUser(userData))
          }
        })
        .catch((err) => {
          onError()
          dispatch(setError(err.message))
        })
    } catch (err: any) {
      console.log("err:", err)
      onError()
      dispatch(setError(err.message))
    }
  }
}

// Log in
export const signin = (data: SignInData, onError: () => void) => {
  return async (dispatch: any) => {
    try {
      await signInWithEmailAndPassword(_auth, data.email, data.password).then(
        ({ user }) =>
          dispatch(
            setSuccess(
              `Welcome back${user.displayName ? ` ${user.displayName}!` : ""}`
            )
          )
      )
    } catch (err: any) {
      onError()
      dispatch(setError(err.message))
    }
  }
}

// Log out
export const signout = () => {
  return async (dispatch: any) => {
    try {
      await _auth.signOut()
      dispatch(signOut())
    } catch (err) {
      dispatch(setError("Error dispatching signout"))
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
        userData.emailVerified =
          _auth.currentUser?.emailVerified ?? userData.emailVerified
        dispatch(setUser(userData))
      } else {
        dispatch(setError("No such user"))
      }
    } catch (err) {
      dispatch(setError("Error dispatching setUser"))
    } finally {
      dispatch(setLoading(false))
    }
  }
}
