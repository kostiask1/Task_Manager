import { forwardRef, InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef(
  (
    {
      type = "text",
      placeholder,
      value,
      name,
      required,
      onChange,
      label,
      className,
      disabled,
      ...rest
    }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div className="field">
        <div className="control">
          {!!label && <label htmlFor={name}>{label}</label>}
          <input
            ref={ref}
            className={className || "input"}
            type={type}
            placeholder={placeholder}
            value={value}
            name={name}
            id={name}
            onChange={onChange}
            required={required}
            disabled={disabled}
            autoComplete="off"
            {...rest}
          />
        </div>
      </div>
    )
  }
)

export default Input
