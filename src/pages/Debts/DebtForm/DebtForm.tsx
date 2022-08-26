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
    const newPayment: IPayment = {
      text: payment.text,
      paid: false,
      value: payment.value,
      id: new Date().getTime(),
    }
    setState((state: Debt) => ({
      ...state,
      array: [...state.array, newPayment],
    }))
    setPayment(initPayment)
  }

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
          <Input
            name="currency"
            label="Currency"
            value={state.currency}
            onChange={handleChange}
          />
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
          <>
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
            <Input
              type="number"
              step={1}
              value={payment.value}
              label="Value"
              name="payment"
              onChange={(e) =>
                setPayment((state: IPayment) => ({
                  ...state,
                  value: +e.target.value,
                }))
              }
            />
            <Button
              className="button is-small is-primary"
              onClick={addPayment}
              text="Add payment"
            />
          </>
          <hr />
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
      <footer className="card-footer p-3">
        <div className="buttons">
          {isEdit ? (
            <Button
              className="mx-2 card-footer-item is-success"
              text={saving ? "Updating..." : "Update"}
              disabled={saving || deleting || equal(state, debt)}
            />
          ) : (
            <Button
              className="mx-2 card-footer-item is-success"
              text={saving ? "Saving..." : "Save"}
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
