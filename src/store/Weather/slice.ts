import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import { doc, setDoc } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { equal } from "../../helpers"
import { setError, setSuccess } from "../App/slice"
import { setUser } from "../Auth/slice"
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

export const getCities = () => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const user: User = getState().auth.user

    if (user.cities?.length) {
      const stateCities = getState().cities.array
      !equal(stateCities, user.cities) &&
        dispatch(setCities(user.cities as ICity[]))
    } else {
      dispatch(setCities([]))
    }
  }
}

export const deleteCity = (city: ICity) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const cities = getState().cities.array as ICity[]
    const user: User = getState().auth.user
    const filtered_cities = cities.filter((c: ICity) => c.name !== city.name)

    const updatedUser = { ...user, cities: filtered_cities }
    await setDoc(doc(db, "users", user.id), updatedUser)
    await dispatch(setUser(updatedUser))
    await dispatch(setCities(filtered_cities))
    dispatch(setSuccess(`${city.name} deleted`))
  }
}

export const saveCity = (city: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const cities = getState().cities.array as ICity[]
    const user: User = getState().auth.user
    if (city.length < 2) return dispatch(setError("City name is too short"))
    const isExist = cities.findIndex((c: ICity) => c.name === city)
    if (isExist !== -1) return dispatch(setError("City already exist"))

    const newCity = {
      name: city,
      show: true,
      id: new Date().getTime(),
      uid: user.id,
    }

    const updatedUser = { ...user, cities: [...cities, newCity] }
    await setDoc(doc(db, "users", user.id), updatedUser)
    await dispatch(setUser(updatedUser))
    await dispatch(addCity(newCity))
    dispatch(setSuccess(`${city} added`))
  }
}

export const updateCity = (city: ICity) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const cities = getState().cities.array
    const user: User = getState().auth.user
    const citiesCopy = [...cities]

    const indexOfCity = citiesCopy.findIndex((c: ICity) => c.id === city.id)
    citiesCopy[indexOfCity] = city

    const updatedUser = { ...user, cities: citiesCopy }
    await setDoc(doc(db, "users", user.id), updatedUser)
    await dispatch(setUser(updatedUser))
    dispatch(setCities(citiesCopy))
  }
}
