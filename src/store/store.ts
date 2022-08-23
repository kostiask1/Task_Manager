import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import appReducer from "./App/slice"
import authReducer from "./Auth/slice"
import tasksReducer from "./Task/slice"
import citiesReducer from "./Weather/slice"
import { weatherApi } from "./Weather/api"
import wishesReducer from "./Wish/slice"

const reducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  tasks: tasksReducer,
  wishes: wishesReducer,
  cities: citiesReducer,
  weatherApi: weatherApi.reducer,
})

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(weatherApi.middleware),
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
