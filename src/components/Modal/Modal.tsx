import { FC } from "react"
import "./Modal.scss"

interface Props {
  show: boolean
  children: React.ReactNode
  id: string
  hide: () => void
}

const Modal: FC<Props> = ({ show, hide, id, children }) => {
  return show ? (
    <div
      id={id}
      className={`modal fadeIn ${show ? "is-active" : ""}`}
      aria-label="modal"
    >
      <div className="modal-background" onClick={hide}></div>
      <div className="modal-content">{children}</div>
    </div>
  ) : null
}

export default Modal
