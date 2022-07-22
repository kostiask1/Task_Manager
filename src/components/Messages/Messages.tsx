import { useAppSelector, RootState } from "../../store/store"
import Message from "../UI/Message"
import "./Messages.scss"

const Messages = () => {
  const { error, success } = useAppSelector((state: RootState) => ({
    error: state.app.error,
    success: state.app.success,
  }))

  return (
    <>
      {error && <Message type="danger" msg={error} />}
      {success && <Message type="success" msg={success} />}
    </>
  )
}

export default Messages
