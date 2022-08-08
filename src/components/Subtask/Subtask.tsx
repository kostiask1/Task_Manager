import { FC } from "react"
import { useAppDispatch } from "../../store/store"
import { setTask } from "../../store/taskSlice"
import { Subtask as ISubtask, Task } from "../../store/types"
import Button from "../UI/Button"
import Input from "../UI/Input"
import "./Subtask.scss"

interface Props {
  data: ISubtask
  task: Task
  update?: (data: ISubtask[]) => void
  state: "create" | "edit" | "show"
  setModal?: undefined | Function
}

const Subtask: FC<Props> = ({ data, task, update, state, setModal }) => {
  task = JSON.parse(JSON.stringify(task))
  let subtasksArray = JSON.parse(JSON.stringify(task.subtasks))
  const isShow = state === "show"
  // const isEdit = state === "edit"
  // const isCreate = state === "create"
  const dispatch = useAppDispatch()

  const removeSubtask = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const copy = data
    const index = subtasksArray.findIndex(
      (task: ISubtask) => task.text === copy.text
    )
    subtasksArray.splice(index, 1)
    if (isShow) {
      saveTask()
    } else {
      update && update(subtasksArray)
    }
  }

  const saveTask = async () => {
    const saveTask: Task = task
    saveTask.subtasks = subtasksArray
    saveTask.updatedAt = new Date().getTime()
    await dispatch(setTask(saveTask))
    setModal && setModal(saveTask)
  }

  const toggleCompleted = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const copy = data
    const index = subtasksArray.findIndex(
      (task: ISubtask) => task.text === copy.text
    )
    subtasksArray[index].completed = !subtasksArray[index].completed
    if (isShow) {
      saveTask()
    } else {
      update && update(subtasksArray)
    }
  }

  return (
    <li>
      <Input
        type="checkbox"
        className="checkbox"
        checked={data.completed}
        onChange={(e) => toggleCompleted(e)}
      />
      {data.text}
      <Button onClick={(e) => removeSubtask(e)} text="x" />
    </li>
  )
}

export default Subtask
