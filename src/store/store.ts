import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import app from "./App/slice"
import auth from "./Auth/slice"
import cities from "./Weather/slice"
import debts from "./Debt/slice"
import tasks from "./Task/slice"
import wishes from "./Wish/slice"
import { weatherApi } from "./Weather/api"

const reducer = combineReducers({
  app,
  auth,
  cities,
  debts,
  tasks,
  wishes,
  weatherApi: weatherApi.reducer,
})

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(weatherApi.middleware),
  devTools: import.meta.env.MODE === "development",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
