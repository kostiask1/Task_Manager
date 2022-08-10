import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import thunk from "redux-thunk"
import authReducer from "./Auth/authSlice"
import appReducer from "./App/appSlice"
import tasksReducer from "./Task/taskSlice"

const reducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  tasks: tasksReducer,
})

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
