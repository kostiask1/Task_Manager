import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { equal } from "../../helpers"
import { User } from "../Auth/types"
import { AppDispatch, RootState } from "../store"
import { Debt } from "./types"

interface DebtsState {
  array: Debt[]
  editingDebt: Debt | null
}

const initialState: DebtsState = {
  array: [],
  editingDebt: null,
}

export const debtInitialState: Debt = {
  id: 0,
  uid: "",
  paid: false,
  title: "",
  end: "",
  start: 0,
  updatedAt: 0,
  currency: "UAH",
  array: [],
}

const debt = createSlice({
  name: "debt",
  initialState,
  reducers: {
    debts: (state: DebtsState, action: PayloadAction<Debt[]>) => {
      state.array = action.payload
    },
    editingDebt: (state: DebtsState, action: PayloadAction<Debt | null>) => {
      state.editingDebt = action.payload
    },
  },
})

export default debt.reducer

// Actions

export const { debts, editingDebt } = debt.actions

export const getDebts = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const user: User = getState().auth.user

    const docRef = doc(db, "debts", user.id)
    const docSnap = await getDoc(docRef)
    const { debts: userDebts } = (docSnap.data() || []) as { debts: Debt[] }

    if (debts.length) {
      const stateDebts = getState().debts.array
      !equal(stateDebts, userDebts) && dispatch(debts(userDebts as Debt[]))
    } else {
      dispatch(debts([]))
    }
  }
}

export const deleteDebt = (debt: Debt) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const debtsArray = getState().debts.array
    let tempArray: Debt[] = [...debtsArray]
    tempArray = tempArray.filter((t: Debt) => t.id !== debt.id)
    await setDoc(doc(db, "debts", debt.uid), {
      debts: tempArray as Debt[],
    })

    dispatch(debts(tempArray))
  }
}
