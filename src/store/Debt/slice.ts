import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { equal, convertToDate } from "../../helpers"
import { User } from "../Auth/types"
import { AppDispatch, RootState } from "../store"
import { Debt, Payment } from "./types"
import { setSuccess } from "../App/slice"

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
  currency: "",
  array: [],
  total: 0,
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

    if (userDebts.length) {
      const stateDebts = getState().debts.array
      !equal(stateDebts, userDebts) && dispatch(debts(userDebts as Debt[]))
    } else {
      dispatch(debts([]))
    }
  }
}

export const setDebt = (debt: Debt) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const debtsArray = getState().debts.array
    const debtsCopy = [...debtsArray]
    const unPaidDebts: Debt[] = []
    const paidDebts: Debt[] = []

    const indexOfDebt = debtsArray.findIndex((t: Debt) => t.id === debt.id)
    const existDebt = indexOfDebt !== -1
    debt.updatedAt = new Date().getTime()

    const total =
      (debt.array as Payment[]).reduce(
        (acc: number, payment: Payment) => (acc += payment.value),
        0
      ) || 0

    debt.total = total

    if (!existDebt) {
      debtsCopy.push(debt)
    } else {
      debtsCopy[indexOfDebt] = debt
    }

    for (let i = 0; i < debtsCopy.length; i++) {
      const item = debtsCopy[i]
      if (item.paid) {
        paidDebts.push(item)
      } else {
        unPaidDebts.push(item)
      }
    }

    unPaidDebts.sort(
      (a: Debt, b: Debt) =>
        convertToDate(a.end).getTime() - convertToDate(b.end).getTime()
    )

    const newArray: Debt[] = [...unPaidDebts, ...paidDebts]

    await setDoc(doc(db, "debts", debt.uid), {
      debts: newArray as Debt[],
    })

    dispatch(debts(newArray))
    dispatch(setSuccess("Debt saved!"))
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
    dispatch(setSuccess("Debt deleted!"))
  }
}
