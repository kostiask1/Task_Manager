import "./Checkbox.scss"
import { FC } from "react"

interface Props {
  checked: boolean
  disabled?: boolean
  text: string
  onChange?: (value: boolean) => void
}

const Checkbox: FC<Props> = ({ checked, disabled, text, onChange }) =>
(
  <label className={`checkbox${disabled ? " disabled" : ""}`}>
    <input type="checkbox" checked={checked} onChange={() => onChange && onChange(!checked)} disabled={disabled} />
    {text}
  </label>
)


export default Checkbox
