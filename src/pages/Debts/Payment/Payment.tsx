import { FC } from "react"
import { Debt as IDebt, Payment as IPayment } from "../../../store/Debt/types"
import Button from "../../../components/UI/Button"
import { setDebt } from "../../../store/Debt/slice"
import { useAppDispatch } from "../../../store/store"

interface PaymentProps {
  payment: IPayment
  data: IDebt
  editing: boolean
  update?: Function
}

const Payment: FC<PaymentProps> = ({ payment, data, editing, update }) => {
  const dispatch = useAppDispatch()

  const removePayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const copy = [...data.array]
    const index = copy.findIndex((pay: IPayment) => pay.id === payment.id)
    copy.splice(index, 1)
    const updatedDebt = { ...data, array: copy }
    if (!editing) {
      await dispatch(setDebt(updatedDebt))
    } else {
      update && update(updatedDebt)
    }
  }

  const toggleChecked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const copy = JSON.parse(JSON.stringify(data.array))
    const index = copy.findIndex((pay: IPayment) => pay.id === payment.id)
    copy[index].paid = !copy[index].paid
    const paid = copy.every((payment: IPayment) => payment.paid)
    const updatedDebt = { ...data, paid, array: copy }
    if (!editing) {
      await dispatch(setDebt(updatedDebt))
    } else {
      update && update(updatedDebt)
    }
  }

  return (
    <>
      <input
        type="checkbox"
        id={payment.id.toString()}
        onChange={toggleChecked}
        checked={payment.paid}
      />
      <Button
        className="is-danger is-small ml-1"
        type="button"
        style={{ height: 16, padding: "0px 4px" }}
        onClick={removePayment}
        onKeyDown={() => alert(1)}
        text="x"
      />
      <label
        style={{ textDecoration: payment.paid ? "line-through" : "unset" }}
        className="ml-2"
        htmlFor={payment.id.toString()}
      >
        {payment.text}
        <span className="mx-2">
          {payment.value}
          {data.currency}
        </span>
      </label>
    </>
  )
}

export default Payment
