import { FC, useState } from "react"
import { Subtask as ISubtask } from "../../store/types"
import Button from "../UI/Button"
import Input from "../UI/Input"
import "./Subtask.scss"

interface Props {
  data: ISubtask
  tasks: ISubtask[]
  update: (data: ISubtask[]) => void
}

const Subtask: FC<Props> = ({ data, tasks, update }) => {
  const [task, setTask] = useState<ISubtask>(data)
  let tasksArray = [...tasks]

  const removeSubtask = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const copy = task
    const index = tasksArray.findIndex((task) => task.text === copy.text)
    tasksArray.splice(index, 1)
    update(tasksArray)
  }

  const toggleCompleted = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const copy = task
    const index = tasksArray.findIndex((task) => task.text === copy.text)
    tasksArray[index].completed = !tasksArray[index].completed
    console.log("tasksArray:", tasksArray)
    setTask(tasksArray[index])
    update(tasksArray)
  }

  return (
    <li>
      <Input
        type="checkbox"
        className="checkbox"
        checked={task.completed}
        onChange={(e) => toggleCompleted(e)}
      />
      {task.text}
      <Button onClick={(e) => removeSubtask(e)} text="x" />
    </li>
  )
}

export default Subtask
