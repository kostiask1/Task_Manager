import "./Modal.scss"
import { FC } from "react"

interface Props {
  show: boolean
  children: React.ReactNode
  id: string
}

const Modal: FC<Props> = ({ show, id, children }) => {
  return (
    <div
      id={id}
      className={`modal ${show ? "is-active" : ""}`}
      aria-label="modal"
    >
      <div className="modal-background"></div>
      <div className="modal-content">{children}</div>
    </div>
  )
}

export default Modal
