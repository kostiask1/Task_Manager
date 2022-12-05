import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth"
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { deleteImage } from "../../firebase/firestore"
import { loading, setError, setSuccess } from "../App/slice"
import { debts } from "../Debt/slice"
import { AppDispatch, RootState } from "../store"
import { tasks } from "../Task/slice"
import { setCities } from "../Weather/slice"
import { wishes } from "../Wish/slice"
import { AuthState, SignInData, SignUpData, IUser } from "./types"

export const authInitialState: AuthState = {
  user: {
    firstName: "",
    lastName: "",
    profileImg: "",
    email: "",
    password: "",
    id: "",
    admin: false,
    emailVerified: false,
    whitelist: [],
    cities: [],
  },
  authenticated: false,
}

const auth = createSlice({
  name: "auth",
  initialState: authInitialState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<IUser>) => {
      state.user = action.payload
      state.authenticated = true
    },
    signOut: (state: AuthState) => {
      state.user = authInitialState.user
      state.authenticated = false
    },
  },
})

export default auth.reducer

// Actions

export const { setUser, signOut } = auth.actions

const _auth = getAuth()

export const updateUser = (user: IUser) => {
  return async (dispatch: AppDispatch) => {
    await setDoc(doc(db, "users", user.id), user)
    await dispatch(setUser(user))
  }
}

export const signup = (data: SignUpData, onError: () => void) => {
  return async (dispatch: AppDispatch) => {
    try {
      createUserWithEmailAndPassword(_auth, data.email, data.password)
        .then((res) => {
          if (res.user) {
            const userData: IUser = {
              ...data,
              id: res.user.uid,
              admin: false,
              profileImg: "",
              emailVerified: false,
              whitelist: [],
              cities: [],
            }
            dispatch(updateUser(userData))
            sendEmailVerification(_auth.currentUser as any).then(() => {
              setTimeout(
                () =>
                  dispatch(
                    setSuccess("Check your email to verify your account!")
                  ),
                3000
              )
            })
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
  return async (dispatch: AppDispatch) => {
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
  return async (dispatch: AppDispatch) => {
    try {
      await _auth.signOut()
      dispatch(signOut())
      dispatch(tasks([]))
      dispatch(setCities([]))
      dispatch(debts([]))
      dispatch(wishes([]))
    } catch (err) {
      dispatch(setError("Error dispatching signout"))
    }
  }
}

// Get user by id
export const getUserById = async (id: string): Promise<IUser> => {
  const docRef = doc(db, "users", id)
  const docSnap = await getDoc(docRef)
  const userData = docSnap.data() as IUser
  return userData
}

// Get all users
export const getAllUsers = async (filterValue?: string): Promise<IUser[]> => {
  const snapshot = await collection(db, "users")
  const docs = await getDocs(snapshot)
  const users: IUser[] = docs?.docs.map((doc) => doc.data()) as IUser[]
  const searchText: string = filterValue ? filterValue.toLowerCase() : ""
  const filteredList = filterValue
    ? users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchText) ||
          user.lastName.toLowerCase().includes(searchText) ||
          user.id === filterValue
      )
    : users

  return filteredList
}

// Get current user
export const getCurrentUser = (id: string) => {
  return async (dispatch: AppDispatch) => {
    const user = await getUserById(id)
    if (user) {
      user.emailVerified =
        _auth.currentUser?.emailVerified ?? user.emailVerified
    }
    dispatch(setUser(user))
    dispatch(loading(false))
  }
}

export const deleteAccount = (id: string, image: string) => {
  return async (dispatch: AppDispatch) => {
    await dispatch(deleteUserData(id))
    image && (await deleteImage(image))
    await deleteDoc(doc(db, "users", id))
    deleteUser(_auth.currentUser as any).then(() => {
      dispatch(setSuccess("Your account was deleted"))
      dispatch(signout())
    })
  }
}

export const deleteUserData = (id: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const user: IUser = getState().auth.user
    const clearedUser = { ...user, whitelist: [], cities: [] }
    await setDoc(doc(db, "users", user.id), clearedUser)
    await deleteDoc(doc(db, "tasks", id))
    await deleteDoc(doc(db, "wishes", id))
    await deleteDoc(doc(db, "debts", id))
    dispatch(setSuccess("Your account data was erased"))
  }
}
