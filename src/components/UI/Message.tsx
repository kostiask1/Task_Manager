import { FC } from "react"

interface MessageProps {
  msg: string
  index: number
  type: "danger" | "success"
}

const Message: FC<MessageProps> = ({ msg, type, index }) => {
  let typeClass = ""

  if (type === "danger") {
    typeClass = "is-danger"
  }

  if (type === "success") {
    typeClass = "is-success"
  }

  return (
    <article className={`message ${typeClass}`} style={{
      animation: `slideIn .4s ease-in-out forwards, .4s slideOut ${index * 2000}ms ease-in-out forwards`
    }}>
      <div className="message-body">{msg}</div>
    </article>
  )
}

export default Message
