import { useEffect } from "react";
import { deleteMessage } from "../../store/App/slice";
import { IMessage } from "../../store/App/types";
import { RootState, useAppDispatch, useAppSelector } from '../../store/store';
import Message from "../UI/Message";
import "./Messages.scss";

const deleteQueue: number[] = []

const Messages = () => {
  const dispatch = useAppDispatch()
  const messages: IMessage[] = useAppSelector((state: RootState) => state.app.messages)

  useEffect(() => {
    if (messages.length) {
      const id = messages[messages.length - 1].id
      if (!deleteQueue.includes(id)) return
      deleteQueue.push(id)
      setTimeout(() => {
        dispatch(deleteMessage(id))
        deleteQueue.splice(deleteQueue.findIndex(ID => id == ID),1)
      }, 3400)
    }
  }, [messages.length])

  return (
    <>
      <div className="messages__container">
        {messages.map((message, index) => (
          <Message
            key={message.text+ index}
            type={message.type}
            msg={message.text}
          />
        ))}
      </div>
    </>
  )
}

export default Messages
