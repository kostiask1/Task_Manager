import { useEffect } from "react";
import { messages as clearMessages } from "../../store/App/slice";
import { IMessage } from "../../store/App/types";
import { RootState, useAppDispatch, useAppSelector } from '../../store/store';
import Message from "../UI/Message";
import "./Messages.scss";

const Messages = () => {
  const dispatch = useAppDispatch()
  const messages: IMessage[] = useAppSelector((state: RootState) => state.app.messages)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (messages.length) {
      timeout = setTimeout(() => {
          dispatch(clearMessages([]))
      }, 3400)
    }
    
    return () => clearTimeout(timeout)
  }, [messages.length])
  
  return (
    <>
      <div className="messages__container">
        {messages.map((message, index) => (
          <Message
            key={index}
            type={message.type}
            msg={message.text}
          />
        ))}
      </div>
    </>
  )
}

export default Messages
