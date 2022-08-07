import { useEffect, useMemo, useState, useCallback, FC } from "react"
import InputMask from "react-input-mask"
import Button from "../UI/Button"
import Input from "../UI/Input"
import Textarea from "../UI/Textarea"
import { dateFormat, equal } from "../../helpers"
import { setSuccess, setError } from "../../store/appSlice"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import {
  deleteTask,
  setTask,
  editingTask,
  taskInitialState,
} from "../../store/taskSlice"
import { Task, User } from "../../store/types"
import "./TaskForm.scss"

interface TaskInterface {
  setModal?: undefined | Function
}

const TaskForm: FC<TaskInterface> = ({ setModal }) => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)

  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )
  const [state, setState] = useState<Task>(task || taskInitialState)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

  useEffect(() => {
    if (task) {
      setState(task)
    }
  }, [task])

  const addTaskToUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const saveTask: Task = { ...state }
    setLoadingSave(true)
    if (!isEdit) {
      saveTask.id = new Date().getTime()
      saveTask.completed = false
      saveTask.start = new Date().getTime()
    }
    if (saveTask.end === "dd-mm-yyyy") {
      saveTask.end = ""
    }
    saveTask.updatedAt = new Date().getTime()
    saveTask.uid = user.id
    await dispatch(setTask(saveTask))
    setLoadingSave(false)
    isEdit
      ? dispatch(setSuccess("Task updated successfully"))
      : dispatch(setSuccess("Task created successfully"))
    clear()
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name
    const value = event.target.value
    setState((state: Task) => ({ ...state, [name]: value }))
  }

  const clear = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setState(taskInitialState)
    dispatch(editingTask(null))
  }

  const reset = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setState(task || taskInitialState)
  }

  const deleteT = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setDeleting(true)
    await dispatch(deleteTask(state))
    dispatch(editingTask(taskInitialState))
    setDeleting(false)
    dispatch(setSuccess("Task deleted successfully"))
  }

  const complete = useCallback(
    async (e: React.FormEvent, completed: boolean) => {
      e.preventDefault()
      if (state) {
        setLoadingComplete(true)
        const saveTask: Task = { ...state }
        saveTask.completed = completed
        saveTask.updatedAt = new Date().getTime()
        await dispatch(setTask(saveTask))
        dispatch(editingTask(saveTask))
        setLoadingComplete(false)
        setState(saveTask)
        setModal && setModal(saveTask)
        if (completed) {
          dispatch(setSuccess("Task completed"))
        } else {
          dispatch(setError("Task returned"))
        }
      }
    },
    [state]
  )

  const formatChars: Array<RegExp | string> = useMemo(
    () => dateFormat(state.end as string),
    [state.end]
  )

  return (
    <>
      <form
        className="card task fadeIn"
        key={state.id}
        onSubmit={addTaskToUser}
      >
        <header className="card-header">
          <div className="card-header-title is-align-items-center">
            {stateName} Task -
            <Input
              type="text"
              name="title"
              className="ml-2 input"
              value={state.title}
              onChange={handleChange}
              placeholder="Task Title"
              maxLength={40}
              required
            />
            {!!state.start && (
              <Button
                className={`complete-task-btn ${
                  state.completed ? "is-primary" : "is-danger"
                }`}
                onClick={(e) => complete(e, !state.completed)}
                text={`${
                  loadingComplete
                    ? "Updating..."
                    : `Completed: ${state.completed ? "Yes" : "No"}`
                }`}
                disabled={loadingComplete || loadingSave || deleting}
              />
            )}
          </div>
        </header>
        <div className="card-content">
          <div className="content">
            <label htmlFor="description">Description</label>
            <Textarea
              value={state.description}
              onChange={handleChange}
              placeholder="Task Descpription"
              name="description"
              required
            />
            <br />
            <label htmlFor="end">Deadline</label>
            <InputMask
              className="input"
              mask={formatChars}
              maskPlaceholder="dd-mm-yyyy"
              alwaysShowMask={true}
              name="end"
              id="end"
              value={state.end}
              onChange={handleChange}
            />
          </div>
        </div>
        <footer className="card-footer p-3">
          <div className="buttons">
            {isEdit ? (
              <Button
                className="mx-2 card-footer-item is-success"
                text={loadingSave ? "Updating..." : "Update"}
                disabled={
                  loadingComplete ||
                  loadingSave ||
                  deleting ||
                  equal(state, task)
                }
              />
            ) : (
              <Button
                className="mx-2 card-footer-item is-success"
                text={loadingSave ? "Saving..." : "Save"}
                disabled={
                  loadingComplete ||
                  loadingSave ||
                  deleting ||
                  equal(state, taskInitialState)
                }
              />
            )}
            {isEdit && (
              <Button
                className="mx-2 card-footer-item is-danger"
                text={deleting ? "Deleting..." : "Delete"}
                onClick={deleteT}
                disabled={loadingComplete || loadingSave || deleting}
              />
            )}
            {isEdit && !setModal ? (
              <Button
                onClick={clear}
                className="mx-2 card-footer-item is-warning"
                text="Clear"
                disabled={loadingComplete || loadingSave || deleting}
              />
            ) : (
              <Button
                onClick={reset}
                className="mx-2 card-footer-item is-warning"
                text="Reset"
                disabled={
                  loadingComplete ||
                  loadingSave ||
                  deleting ||
                  equal(state, task || taskInitialState)
                }
              />
            )}
          </div>
        </footer>
      </form>
    </>
  )
}

export default TaskForm
