import { FC } from "react"
import { createPortal } from "react-dom"
import "./Modal.scss"

interface Props {
  show: boolean
  children: React.ReactNode
  id: string
  hide: () => void
}

const Modal: FC<Props> = ({ show, hide, id, children }) => show ? createPortal(<div
  id={id}
  className={`modal fadeIn ${show ? "is-active" : ""}`}
  aria-label="modal"
>
  <div className="modal-background" onClick={hide}></div>
  <div className="modal-content">{children}</div>
</div>, document.getElementById("modal") as HTMLElement ) : null



export default Modal
