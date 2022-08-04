import { ButtonHTMLAttributes, FC } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
  className?: string
}

const Button: FC<ButtonProps> = ({
  text,
  className,
  onClick,
  type,
  disabled,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`button ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {text}
    </button>
  )
}

export default Button
