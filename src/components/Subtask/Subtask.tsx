import { FC } from "react"
import { useAppDispatch } from "../../store/store"
import { setTask } from "../../store/taskSlice"
import { Subtask as ISubtask, Task } from "../../store/types"
import Button from "../UI/Button"
import "./Subtask.scss"

interface Props {
  data: ISubtask
  task: Task
  update?: (data: ISubtask[]) => void
  state: "create" | "edit" | "show"
  setModal?: undefined | Function
  edit?: undefined | Function
}

const Subtask: FC<Props> = ({ data, task, update, state, setModal, edit }) => {
  task = JSON.parse(JSON.stringify(task))
  let subtasksArray = JSON.parse(JSON.stringify(task.subtasks))
  const isShow = state === "show"
  const isEdit = state === "edit"
  const isCreate = state === "create"
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

  const setEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (edit) {
      edit(data.text)
      removeSubtask(e)
    }
  }
  return (
    <li>
      <input
        type="checkbox"
        className="checkbox"
        checked={data.completed}
        onChange={toggleCompleted}
      />
      {!isShow && (
        <Button
          className="is-danger is-small"
          style={{ height: 16, padding: "0px 4px" }}
          onClick={removeSubtask}
          text="x"
        />
      )}
      {data.text}
      {(isEdit || isCreate) && edit && (
        <Button
          className="is-info is-small"
          style={{ height: 16, padding: "0px 4px" }}
          onClick={setEdit}
          text="edit"
        />
      )}
    </li>
  )
}

export default Subtask
