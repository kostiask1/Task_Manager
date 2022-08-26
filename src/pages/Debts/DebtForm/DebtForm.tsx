import { useMemo, useState } from "react"
import InputMask from "react-input-mask"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { dateFormat, equal } from "../../../helpers"
import { User } from "../../../store/Auth/types"
import {
  debtInitialState,
  deleteDebt,
  editingDebt,
  setDebt,
} from "../../../store/Debt/slice"
import { Debt, Payment as IPayment } from "../../../store/Debt/types"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import Payment from "../Payment"
import { setError } from "../../../store/App/slice"

const initPayment: IPayment = {
  text: "",
  paid: false,
  value: 0,
  id: new Date().getTime(),
}

const DebtForm = () => {
  const dispatch = useAppDispatch()
  const debt: Debt | null = useAppSelector(
    (state: RootState) => state.debts.editingDebt
  )
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [state, setState] = useState<Debt>(debt || debtInitialState)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [payment, setPayment] = useState(initPayment)
  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name
    const value = event.target.value
    setState((state: Debt) => ({ ...state, [name]: value }))
  }

  const addDebtToUser = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    const saveDebt: Debt = { ...state }

    if (!isEdit) {
      saveDebt.id = new Date().getTime()
      saveDebt.start = new Date().getTime()
      saveDebt.uid = user.id
    }
    if (saveDebt.end === "dd-mm-yyyy") saveDebt.end = ""
    saveDebt.title = saveDebt.title.trim()
    saveDebt.currency = saveDebt.currency.trim() || "$"
    await dispatch(setDebt(saveDebt))
    dispatch(editingDebt(debtInitialState))
    setSaving(false)
  }

  const handlePaid = (event: React.MouseEvent) => {
    event.preventDefault()
    setState((state: Debt) => ({ ...state, paid: !state.paid }))
  }

  const formatChars: Array<RegExp | string> = useMemo(
    () => dateFormat(state.end as string),
    [state.end]
  )
  const deleteT = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDeleting(true)
    await dispatch(deleteDebt(state))
    setDeleting(false)
  }
  const reset = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setState(debt || debtInitialState)
  }
  const clear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setState(debtInitialState)
    dispatch(editingDebt(null))
  }

  const addPayment = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (payment.text.trim().length && payment.value != 0) {
      const newPayment: IPayment = {
        text: payment.text.trim(),
        paid: false,
        value: +payment.value,
        id: new Date().getTime(),
      }
      setState((state: Debt) => ({
        ...state,
        array: [...state.array, newPayment],
      }))
      setPayment(initPayment)
    } else {
      dispatch(setError("Enter description and value fields first!"))
    }
  }

  const paid = (state.array as IPayment[]).reduce(
    (acc: number, curr: IPayment) => acc + (curr.paid ? curr.value : 0),
    0
  )
  const left = (state.array as IPayment[]).reduce(
    (acc: number, curr: IPayment) => acc + (!curr.paid ? curr.value : 0),
    0
  )
  const total = (state.array as IPayment[]).reduce(
    (acc: number, curr: IPayment) => acc + curr.value,
    0
  )

  return (
    <form className="card debt fadeIn" key={state.id} onSubmit={addDebtToUser}>
      <header className="card-header">
        <div className="card-header-title is-align-items-center">
          <label htmlFor="title">{stateName} Debt -</label>
          <Input
            type="text"
            name="title"
            className="ml-2 input"
            value={state.title}
            onChange={handleChange}
            placeholder="Debt Receiver"
            maxLength={75}
            required
          />
          {!!state.start && (
            <Button
              className={`complete-task-btn ${
                state.paid ? "is-primary" : "is-danger"
              }`}
              onClick={handlePaid}
              text={`paid: ${state.paid ? "Yes" : "No"}`}
            />
          )}
        </div>
      </header>
      <div className="card-content">
        <div className="content">
          <div className="columns">
            <div className="column">
              <Input
                name="currency"
                label="Currency"
                value={state.currency}
                onChange={handleChange}
                required
              />
            </div>
            <div className="column">
              <label htmlFor="end">Pay due</label>
              <InputMask
                className="input"
                mask={formatChars}
                maskPlaceholder="dd-mm-yyyy"
                alwaysShowMask={true}
                name="end"
                id="end"
                value={state.end}
                onChange={handleChange}
              />
            </div>
          </div>
          <hr />
          <h3>Payments</h3>
          <ul>
            {!!state.array.length &&
              state.array.map((payment: IPayment) => (
                <li
                  className="is-flex is-align-items-center"
                  key={JSON.stringify(payment)}
                >
                  <Payment
                    data={state}
                    payment={payment}
                    update={setState}
                    editing={true}
                  />
                </li>
              ))}
          </ul>
          <div className="columns is-align-items-flex-end">
            <div className="column">
              <Input
                type="text"
                step={1}
                value={payment.text}
                label="Description"
                name="payment"
                onChange={(e) =>
                  setPayment((state: IPayment) => ({
                    ...state,
                    text: e.target.value,
                  }))
                }
              />
            </div>
            <div className="column">
              <Input
                type="number"
                step={1}
                value={payment.value || ""}
                label="Value"
                name="payment"
                onChange={(e) =>
                  setPayment((state: IPayment) => ({
                    ...state,
                    value: +e.target.value,
                  }))
                }
              />
            </div>
            <div className="column">
              <Button
                className="button  is-primary"
                onClick={addPayment}
                type="submit"
                text="Add payment"
              />
            </div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Paid</th>
              <th>Left</th>
              <th>Total</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tr>
            <td> {paid}</td>
            <td>{left}</td>
            <td>{total}</td>
            <td>{state.currency}</td>
          </tr>
        </table>
      </div>

      <footer className="card-footer p-3">
        <div className="buttons">
          {isEdit ? (
            <Button
              className="mx-2 card-footer-item is-success"
              text={saving ? "Updating..." : "Update"}
              type="submit"
              disabled={saving || deleting || equal(state, debt)}
            />
          ) : (
            <Button
              className="mx-2 card-footer-item is-success"
              text={saving ? "Saving..." : "Save"}
              type="submit"
              disabled={saving || deleting || equal(state, debtInitialState)}
            />
          )}
          {isEdit && (
            <Button
              className="mx-2 card-footer-item is-danger"
              text={deleting ? "Deleting..." : "Delete"}
              onClick={deleteT}
              disabled={saving || deleting}
            />
          )}
          {isEdit && (
            <Button
              onClick={reset}
              className="mx-2 card-footer-item is-warning"
              text="Reset"
              disabled={
                saving || deleting || equal(state, debt || debtInitialState)
              }
            />
          )}
          <Button
            onClick={clear}
            className="mx-2 card-footer-item is-warning"
            text="Clear"
            disabled={saving || deleting}
          />
        </div>
      </footer>
    </form>
  )
}

export default DebtForm
