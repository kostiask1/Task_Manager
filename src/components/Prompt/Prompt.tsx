import { FC } from "react"
import Modal from "../Modal/Modal"
import Button from "../UI/Button"
import "./Prompt.scss"

interface Props {
  title: string
  show: boolean
  onCancel: () => void
  onConfirm: () => void
}

const Prompt: FC<Props> = ({
  title,
  show,
  onCancel: cancel,
  onConfirm: confirm,
}) => {
  return (
    <Modal id={new Date().getTime() + ""} show={show} hide={cancel}>
      <div className="box is-flex is-align-items-center is-flex-direction-column">
        <h2 className="is-size-4">{title}</h2>
        <div className="columns mt-5">
          <div className="column">
            <Button className="is-primary" onClick={confirm} text="Confirm" />
          </div>
          <div className="column">
            <Button className="is-danger" onClick={cancel} text="Cancel" />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default Prompt
