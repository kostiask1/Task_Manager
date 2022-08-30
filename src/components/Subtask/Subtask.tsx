import { FC } from "react"
import { useAppDispatch } from "../../store/store"
import { setTask } from "../../store/Task/slice"
import { Subtask as ISubtask, Task } from "../../store/Task/types"
import Button from "../UI/Button"
import "./Subtask.scss"

interface Props {
  data: ISubtask
  task: Task
  update?: (data: ISubtask[]) => void
  state: "create" | "edit" | "show"
  setModal?: undefined | Function
  edit?: undefined | Function
  editable: boolean
}

const Subtask: FC<Props> = ({
  data,
  task,
  update,
  state,
  setModal,
  edit,
  editable = false,
}) => {
  task = JSON.parse(JSON.stringify(task))
  let subtasksArray = JSON.parse(JSON.stringify(task.subtasks))
  const isShow = state === "show"
  const isEdit = state === "edit"
  const isCreate = state === "create"
  const dispatch = useAppDispatch()

  const removeSubtask = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (editable) {
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
  }

  const saveTask = async () => {
    if (editable) {
      const saveTask: Task = task
      saveTask.subtasks = subtasksArray
      await dispatch(setTask(saveTask))
      setModal && setModal(saveTask)
    }
  }

  const toggleCompleted = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (editable) {
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
  }

  const setEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (edit && editable) {
      edit(data.text)
      removeSubtask(e)
    }
  }

  return (
    <li>
      <div className="btns-wrap">
        <input
          type="checkbox"
          className="checkbox"
          id={"checkbox-" + data.text}
          checked={data.completed}
          onChange={toggleCompleted}
          disabled={!editable}
        />
        {!isShow && (
          <Button
            className="is-danger is-small"
            style={{ height: 16, padding: "0px 4px" }}
            onClick={removeSubtask}
            disabled={!editable}
            text="x"
          />
        )}
      </div>
      <label className="subtask-text" htmlFor={"checkbox-" + data.text}>
        {data.text}
      </label>
      {(isEdit || isCreate) && edit && editable && (
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
