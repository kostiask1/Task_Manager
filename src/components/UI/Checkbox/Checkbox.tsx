import "./Checkbox.scss"
import { FC } from "react"

interface Props {
  checked: boolean
  disabled?: boolean
  text: string
}

const Checkbox: FC<Props> = ({ checked, disabled, text }) => {
  return (
    <label className={`checkbox${disabled ? " disabled" : ""}`}>
      <input type="checkbox" checked={checked} disabled={disabled} />
      {text}
    </label>
  )
}

export default Checkbox
