import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore/lite"
import { db } from "../firebase/base"
import { uploadDoc } from "../firebase/firestore"
import { setError, setSuccess, setLoading } from "./appSlice"
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
  console.log("setUser")
  return (dispatch: any) => {
    console.log("in dispatch")
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
          dispatch(setError(err))
          onError()
          dispatch(setError(err.message))
        })
    } catch (err: any) {
      dispatch(setError(err))
      onError()
      dispatch(setError(err.message))
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
        dispatch(setError("No such user"))
      }
    } catch (err) {
      dispatch(setError("Error dispatching setUser"))
    } finally {
      dispatch(setLoading(false))
    }
  }
}

// Log in
export const signin = (data: SignInData, onError: () => void) => {
  return async (dispatch: any) => {
    try {
      console.log(1)
      await signInWithEmailAndPassword(_auth, data.email, data.password).then(
        (resp) => {
          console.log("resp:", resp)
          if (resp.user) {
          }
        }
      )
      dispatch(setSuccess("Successfully signed in"))
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
