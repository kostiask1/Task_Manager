import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { uploadDoc } from "../../firebase/firestore"
import {
  SET_ERROR,
  SET_LOADING,
  SET_SUCCESS,
  SET_USER,
  SignInData,
  SignUpData,
  SIGN_OUT,
  User,
} from "../types"

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
            dispatch({
              type: SET_USER,
              payload: userData,
            })
          }
        })
        .catch((err) => {
          console.log(err)
          onError()
        })
    } catch (err: any) {
      console.log(err)
      onError()
      dispatch({
        type: SET_ERROR,
        payload: err.message,
      })
    }
  }
}

// Get user by id
export const getUserById = (id: string) => {
  return async (dispatch: any) => {
    try {
      const q = query(collection(db, "users"), where("id", "==", id))
      const querySnapshot = await getDocs(q)
      const user = querySnapshot.docs[0].data() as User

      if (user) {
        dispatch({
          type: SET_USER,
          payload: user,
        })
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
    dispatch({
      type: SET_LOADING,
      payload: value,
    })
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
      dispatch(setError(err.message))
    }
  }
}

// Log out
export const signout = () => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoading(true))
      await auth.signOut()
      dispatch({
        type: SIGN_OUT,
      })
    } catch (err) {
      console.log(err)
      dispatch(setLoading(false))
    }
  }
}

let timer: ReturnType<typeof setTimeout> | null = null

// Set error
export const setError = (msg: string) => {
  return (dispatch: any) => {
    if (timer) {
      dispatch({ type: SET_ERROR, payload: "" })
      clearTimeout(timer)
    }
    timer = setTimeout(() =>
      dispatch({
        type: SET_ERROR,
        payload: msg,
      })
    )
  }
}

// Set success
export const setSuccess = (msg: string) => {
  return (dispatch: any) => {
    if (timer) {
      dispatch({ type: SET_SUCCESS, payload: "" })
      clearTimeout(timer)
    }
    timer = setTimeout(
      () =>
        dispatch({
          type: SET_SUCCESS,
          payload: msg,
        }),
      4000
    )
  }
}
