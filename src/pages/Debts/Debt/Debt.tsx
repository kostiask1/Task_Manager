import { Debt as IDebt, Payment as IPayment } from "../../../store/Debt/types"
import { FC, useCallback, useState } from "react"
import Button from "../../../components/UI/Button"
import { editingDebt, setDebt, deleteDebt } from "../../../store/Debt/slice"
import { useAppDispatch } from "../../../store/store"
import { setSuccess, setError } from "../../../store/App/slice"
import Payment from "../Payment/Payment"

interface DebtProps {
  debt: IDebt
  index: number
}

const Debt: FC<DebtProps> = ({ debt, index }) => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const setEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: "smooth" })
    dispatch(editingDebt(debt))
  }

  const complete = useCallback(async (debt: IDebt, paid: boolean) => {
    if (debt) {
      setLoading(true)
      const saveDebt: IDebt = { ...debt }
      saveDebt.paid = paid
      await dispatch(setDebt(saveDebt))
      setLoading(false)
      if (paid) {
        dispatch(setSuccess("Debt paid"))
      } else {
        dispatch(setError("Debt returned"))
      }
    }
  }, [])

  const deleteD = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setDeleting(true)
      await dispatch(deleteDebt(debt))
      setDeleting(false)
      dispatch(setSuccess("Wish deleted successfully"))
    },
    [debt]
  )
  const paid = (debt.array as IPayment[]).reduce(
    (acc: number, curr: IPayment) => acc + (curr.paid ? curr.value : 0),
    0
  )
  const left = (debt.array as IPayment[]).reduce(
    (acc: number, curr: IPayment) => acc + (!curr.paid ? curr.value : 0),
    0
  )
  const total = (debt.array as IPayment[]).reduce(
    (acc: number, curr: IPayment) => acc + curr.value,
    0
  )
  return (
    <>
      <td>{index + 1}</td>
      <td>{debt.title}</td>
      <td>{debt.end}</td>
      <td>
        <ul>
          {!!debt.array.length &&
            debt.array.map((payment: IPayment) => (
              <li
                className="is-flex is-align-items-center"
                key={JSON.stringify(payment)}
              >
                <Payment payment={payment} data={debt} editing={false} />
              </li>
            ))}
        </ul>
      </td>
      <td>
        <Button
          className={`is-small ${debt.paid ? "is-primary" : "is-danger"}`}
          style={{ height: "100%" }}
          onClick={() => complete(debt, !debt.paid)}
          text={`${
            loading ? "Updating..." : `Paid: ${debt.paid ? "Yes" : "No"}`
          }`}
          disabled={loading || deleting}
        />
      </td>
      <td>
        <table className="table" style={{ width: "100%" }}>
          <tbody>
            <tr>
              <td>{paid}</td>
              <td>{left}</td>
              <td>{total}</td>
            </tr>
          </tbody>
        </table>
      </td>
      <td>{debt.currency}</td>
      <td>
        <div className="buttons">
          <Button
            className="is-info is-small"
            onClick={setEdit}
            text="Edit"
            disabled={loading || deleting}
          />
          <Button
            className="is-danger is-small"
            text={deleting ? "Deleting..." : "Delete"}
            onClick={deleteD}
            disabled={loading || deleting}
          />
        </div>
      </td>
    </>
  )
}

export default Debt
