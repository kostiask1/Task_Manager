import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
  className?: string
}

const Button = forwardRef(
  (
    { text, className, onClick, type, disabled, ...rest }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>
  ) => (
    <button
      type={type}
      className={`button ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
      ref={ref}
      {...rest}
    >
      {text}
    </button>
  )
)

export default Button
