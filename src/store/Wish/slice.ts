import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { equal } from "../../helpers"
import { AppDispatch, RootState } from "../store"
import { Wish } from "./types"
import { getAuth } from "firebase/auth"

interface WishesState {
  array: Wish[]
  editingWish: Wish | null
}

const initialState: WishesState = {
  array: [],
  editingWish: null,
}

export const wishInitialState: Wish = {
  completed: false,
  description: "",
  id: 0,
  uid: "",
  title: "",
  url: "",
  category: "",
  price: 0,
  updatedAt: 0,
  open: false,
  openTo: [],
}

const wish = createSlice({
  name: "wish",
  initialState,
  reducers: {
    wishes: (state: WishesState, action: PayloadAction<Wish[]>) => {
      state.array = action.payload
    },
    editingWish: (state: WishesState, action: PayloadAction<Wish | null>) => {
      state.editingWish = action.payload
    },
  },
})

export default wish.reducer

// Actions

export const { wishes, editingWish } = wish.actions

const _auth = getAuth()

export const getWishes = (uid: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const docRef = doc(db, "wishes", uid)
    const docSnap = await getDoc(docRef)
    const user = docSnap.data() as { wishes: Wish[] }

    const wishList: Wish[] = user?.wishes || []
    const currendId = _auth?.currentUser?.uid || ""
    const sendWishes: Wish[] = [...wishList]

    if (wishList.length) {
      const foreignWishes = wishList[0].uid !== currendId

      if (foreignWishes) {
        sendWishes.length = 0
        for (const wish of wishList) {
          if (wish.open) {
            sendWishes.push(wish)
          } else {
            if (wish.openTo.includes(currendId)) {
              sendWishes.push(wish)
            }
          }
        }
      }
      const stateWishes = getState().wishes.array
      !equal(stateWishes, sendWishes) && dispatch(wishes(sendWishes))
    } else {
      dispatch(wishes([]))
    }
  }
}

export const setWish = (wish: Wish) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const wishesArray = getState().wishes.array
    const wishesCopy = [...wishesArray]
    const unCompletedWishes: Wish[] = []
    const completedWishes: Wish[] = []

    const indexOfWish = wishesArray.findIndex((t: Wish) => t.id === wish.id)
    const existWish = indexOfWish !== -1
    wish.updatedAt = new Date().getTime()

    if (!existWish) {
      wishesCopy.push(wish)
    } else {
      wishesCopy[indexOfWish] = wish
    }

    for (let i = 0; i < wishesCopy.length; i++) {
      const item = wishesCopy[i]
      if (item.completed) {
        completedWishes.push(item)
      } else {
        unCompletedWishes.push(item)
      }
    }

    unCompletedWishes.sort((a: Wish, b: Wish) => a.updatedAt - b.updatedAt)

    const newArray: Wish[] = [...unCompletedWishes, ...completedWishes]

    await setDoc(doc(db, "wishes", wish.uid), {
      wishes: newArray as Wish[],
    })

    dispatch(wishes(newArray))
  }
}

export const deleteWish = (wish: Wish) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const wishesArray = getState().wishes.array
    let tempArray: Wish[] = [...wishesArray]
    tempArray = tempArray.filter((t: Wish) => t.id !== wish.id)
    await setDoc(doc(db, "wishes", wish.uid), {
      wishes: tempArray as Wish[],
    })

    dispatch(wishes(tempArray))
  }
}
