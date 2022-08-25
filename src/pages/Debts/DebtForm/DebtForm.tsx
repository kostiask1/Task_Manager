import { useState, useMemo } from "react"
import { debtInitialState } from "../../../store/Debt/slice"
import { Debt } from "../../../store/Debt/types"
import Input from "../../../components/UI/Input"
import Button from "../../../components/UI/Button"
import InputMask from "react-input-mask"
import { dateFormat } from "../../../helpers"

const DebtForm = () => {
  const [state, setState] = useState(debtInitialState)
  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name
    const value = event.target.value
    setState((state: Debt) => ({ ...state, [name]: value }))
  }

  const addDebtToUser = (event: React.FormEvent) => {
    event.preventDefault()
  }

  const handlePaid = (event: React.MouseEvent) => {
    event.preventDefault()
  }

  const formatChars: Array<RegExp | string> = useMemo(
    () => dateFormat(state.end as string),
    [state.end]
  )

  console.log("state:", state)
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
          <Input name="currency" label="Currency" onChange={handleChange} />
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
    </form>
  )
}

export default DebtForm
