import { useMemo, useState, createRef } from "react"
import InputMask from "react-input-mask"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { dateFormat, datesList, equal, convertDateToTimestamp, convertToDate } from '../../../helpers';
import { setError } from "../../../store/App/slice"
import { IUser } from "../../../store/Auth/types"
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
  const debts: Debt[] | [] = useAppSelector(
    (state: RootState) => state.debts.array
  )
  const debt: Debt | null = useAppSelector(
    (state: RootState) => state.debts.editingDebt
  )
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const [state, setState] = useState<Debt>(debt || debtInitialState)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [payment, setPayment] = useState(initPayment)
  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"
  const paymentRef = createRef<HTMLInputElement>()

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
    if (payment.text.trim().length && payment.value != 0) {
      const newPayment: IPayment = {
        text: payment.text.trim(),
        paid: false,
        value: +payment.value,
        id: new Date().getTime(),
      }
      saveDebt.array = [...saveDebt.array, newPayment]
    }
    saveDebt.title = saveDebt.title.trim()
    saveDebt.currency = saveDebt.currency.trim() || "$"
    await dispatch(setDebt(saveDebt))
    dispatch(editingDebt(debtInitialState))
    setSaving(false)
  }

  const handlePaid = (event: React.MouseEvent) => {
    event.preventDefault()
    const saveDebt: Debt = { ...state }
    const paid = !saveDebt.paid
    saveDebt.paid = paid
    if (paid) {
      saveDebt.array =
        saveDebt.array.map((payment) => ({
          ...payment,
          paid,
        })) || []
    }
    setState(saveDebt)
  }

  const formatChars: Array<RegExp | string> = useMemo(
    () => dateFormat(convertDateToTimestamp(convertToDate(state.end))),
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
    paymentRef?.current?.focus()
  }

  const [paid, left, total]: number[] = useMemo(() => {
    let paid = 0
    let total = 0
    if (state.array.length) {
      for (let i = 0; i < state.array.length; i++) {
        const payment = state.array[i]
        if (payment.paid) paid += payment.value
        total += payment.value
      }
    }
    const left = total - paid
    return [paid, left, total]
  }, [state.array])

  const [currencies, payments_descriptions] = useMemo(() => {
    const temp_currencies: any[] = []
    const temp_descriptions: any[] = []
    if (debts.length) {
      for (let i = 0; i < debts.length; i++) {
        const debt: Debt = debts[i]
        if (!temp_currencies.includes(debt.currency))
          temp_currencies.push(debt.currency)
        if (debt.array.length) {
          for (let j = 0; j < debt.array.length; j++) {
            const payment: IPayment = debt.array[j]
            if (!temp_descriptions.includes(payment.text))
              temp_descriptions.push(payment.text)
          }
        }
      }
      const currencies_list = temp_currencies.map((item) => (
        <option value={item} key={item}></option>
      ))
      const payments_descriptions_list = temp_descriptions.map((item) => (
        <option value={item} key={item} />
      ))
      return [currencies_list, payments_descriptions_list]
    }
    return [[], []]
  }, [debts])

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
                state.paid ? "primary" : "danger"
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
                list="currencies"
                value={state.currency}
                onChange={handleChange}
                required
              />
              <datalist id="currencies">{currencies}</datalist>
            </div>
            <div className="column">
              <label htmlFor="end">Pay due</label>
              <InputMask
                className="input"
                mask={formatChars}
                maskPlaceholder=""
                placeholder="dd-mm-yyyy"
                alwaysShowMask={true}
                name="end"
                id="end"
                value={state.end}
                onChange={handleChange}
                autoComplete="off"
                list="dates"
              />
              <datalist id="dates">
                {datesList.map((value) => (
                  <option value={value} key={value}></option>
                ))}
              </datalist>
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
              <datalist id="payments_descriptions">
                {payments_descriptions}
              </datalist>
              <Input
                ref={paymentRef}
                type="text"
                step={1}
                value={payment.text}
                label="Description"
                name="payment"
                list="payments_descriptions"
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
                className="button  primary"
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
          <tbody>
            <tr>
              <td> {paid}</td>
              <td>{left}</td>
              <td>{total}</td>
              <td>{state.currency}</td>
            </tr>
          </tbody>
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
              className="mx-2 card-footer-item danger"
              text={deleting ? "Deleting..." : "Delete"}
              onClick={deleteT}
              disabled={saving || deleting}
            />
          )}
          {isEdit && (
            <Button
              onClick={reset}
              className="mx-2 card-footer-item warning"
              text="Reset"
              disabled={
                saving || deleting || equal(state, debt || debtInitialState)
              }
            />
          )}
          <Button
            onClick={clear}
            className="mx-2 card-footer-item warning"
            text="Clear"
            disabled={saving || deleting}
          />
        </div>
      </footer>
    </form>
  )
}

export default DebtForm
