import { FC, InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input: FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  name,
  required,
  onChange,
  label,
  ...rest
}) => {
  return (
    <div className="field">
      <div className="control">
        {!!label && <label htmlFor={name}>{label}</label>}
        <input
          className="input"
          type={type}
          placeholder={placeholder}
          value={value}
          name={name}
          id={name}
          onChange={onChange}
          required={required}
          autoComplete="off"
          {...rest}
        />
      </div>
    </div>
  )
}

export default Input
