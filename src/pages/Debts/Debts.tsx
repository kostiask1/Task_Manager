import { useEffect } from "react"
import { getDebts } from "../../store/Debt/slice"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import DebtForm from "./DebtForm/DebtForm"

const Debts = () => {
  const dispatch = useAppDispatch()
  const debts = useAppSelector((state: RootState) => state.debts.array)
  console.log("debts:", debts)

  useEffect(() => {
    dispatch(getDebts())
  }, [])
  return (
    <>
      <DebtForm />
      <div />
    </>
  )
}

export default Debts
