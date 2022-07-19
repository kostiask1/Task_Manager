import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducers/authReducer"
import thunk from "redux-thunk"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

const store = configureStore({
  reducer: { auth: authReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
