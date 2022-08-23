import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { equal } from "../../helpers"
import { setError, setSuccess } from "../App/slice"
import { User } from "../Auth/types"
import { AppDispatch, RootState } from "../store"
import { CitiesState, ICity } from "./types"

const initialState: CitiesState = {
  array: [],
}

export const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {
    setCities: (state: CitiesState, action: PayloadAction<ICity[]>) => {
      state.array = action.payload
    },
    addCity: (state: CitiesState, action: PayloadAction<ICity>) => {
      state.array = [...state.array, action.payload]
    },
  },
})

export const { setCities, addCity } = citiesSlice.actions

export default citiesSlice.reducer

export const getCities = (uid: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const userRef = doc(db, "users", uid)
    const snap = await getDoc(userRef)
    const { cities } = (snap.data() || []) as { cities: ICity[] }

    if (cities?.length) {
      const stateCities = getState().cities.array
      !equal(stateCities, cities) && dispatch(setCities(cities as ICity[]))
    } else {
      dispatch(setCities([]))
    }
  }
}

export const deleteCity = (city: ICity) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const cities = getState().cities.array as ICity[]
    const filtered_cities = cities.filter((c: ICity) => c.name !== city.name)

    const userRef = doc(db, "users", city.uid)
    const snap = await getDoc(userRef)
    const user = (snap.data() || []) as User

    await setDoc(doc(db, "users", city.uid), {
      ...user,
      cities: filtered_cities,
    })
    await dispatch(setCities(filtered_cities))
    dispatch(setSuccess(`${city.name} deleted`))
  }
}

export const saveCity = (city: string, uid: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const cities = getState().cities.array as ICity[]
    if (city.length < 2) return dispatch(setError("City name is too short"))
    const isExist = cities.findIndex((c: ICity) => c.name === city)
    if (isExist !== -1) return dispatch(setError("City already exist"))

    const newCity = { name: city, show: true, id: new Date().getTime(), uid }

    const userRef = doc(db, "users", uid)
    const snap = await getDoc(userRef)
    const user = (snap.data() || []) as User

    await setDoc(doc(db, "users", uid), {
      ...user,
      cities: [...cities, newCity],
    })

    await dispatch(addCity(newCity))
    dispatch(setSuccess(`${city} added`))
  }
}
