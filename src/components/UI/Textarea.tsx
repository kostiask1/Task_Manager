import React, { FC, InputHTMLAttributes } from "react"

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const Textarea: FC<TextareaProps> = ({
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
        <textarea
          className="textarea has-fixed-size"
          placeholder={placeholder}
          name={name}
          id={name}
          onChange={onChange}
          required={required}
          autoComplete="off"
          value={value}
          {...rest}
        ></textarea>
      </div>
    </div>
  )
}

export default Textarea
