import { useEffect, useMemo, useState } from "react"
import InputMask from "react-input-mask"
import Button from "../../../../components/UI/Button"
import Input from "../../../../components/UI/Input"
import Textarea from "../../../../components/UI/Textarea"
import { equal, dateFormat } from "../../../../helpers"
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../../store/store"
import { setTask, setTaskToEdit, deleteTask } from "../../../../store/taskSlice"
import { Task, User } from "../../../../store/types"
import "./TaskForm.scss"
import { setSuccess } from "../../../../store/appSlice"

const TaskForm = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)

  const initialState: Task = useMemo(
    () => ({
      id: 0,
      uid: user.id,
      completed: false,
      description: "",
      title: "",
      deadline: "",
      createdAt: 0,
      updatedAt: 0,
    }),
    []
  )

  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )
  const [state, setState] = useState<Task>(task || initialState)

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

    if (!isEdit) {
      saveTask.id = new Date().getTime()
      saveTask.completed = false
      saveTask.createdAt = new Date().getTime()
    }
    saveTask.updatedAt = new Date().getTime()

    await dispatch(setTask(saveTask))
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
    setState(initialState)
    dispatch(setTaskToEdit(initialState))
  }

  const reset = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setState(initialState)
  }

  const deleteT = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    await dispatch(deleteTask(state))
    dispatch(setSuccess("Task deleted successfully"))
  }

  const formatChars: Array<RegExp | string> = useMemo(
    () => dateFormat(state.deadline as string),
    [state.deadline]
  )
  return (
    <>
      <form className="card" key={state.id} onSubmit={addTaskToUser}>
        <header className="card-header">
          <div className="card-header-title">
            {stateName} Task -
            <Input
              type="text"
              name="title"
              className="ml-2 input"
              value={state.title}
              onChange={handleChange}
              placeholder="Task Title"
              required
            />
          </div>
          <button className="card-header-icon" aria-label="more options">
            <span className="icon">
              <i className="fas fa-angle-down" aria-hidden="true"></i>
            </span>
          </button>
        </header>
        <div className="card-content">
          <div className="content">
            <Textarea
              value={state.description}
              onChange={handleChange}
              placeholder="Task Descpription"
              name="description"
              required
            />
            <br />
            <InputMask
              className="input"
              mask={formatChars}
              maskPlaceholder="dd-mm-yyyy"
              alwaysShowMask={true}
              name="deadline"
              value={state.deadline}
              onChange={handleChange}
            />
          </div>
        </div>
        <footer className="card-footer p-3">
          <div className="buttons">
            {isEdit ? (
              <Button
                className="mx-2 card-footer-item is-success"
                text="Update"
                disabled={equal(state, task)}
              />
            ) : (
              <Button
                className="mx-2 card-footer-item is-success"
                text="Save"
                disabled={equal(state, initialState)}
              />
            )}
            {isEdit && (
              <Button
                className="mx-2 card-footer-item is-danger"
                text="Delete"
                onClick={deleteT}
              />
            )}
            {isEdit ? (
              <Button
                onClick={clear}
                className="mx-2 card-footer-item is-warning"
                text="Clear"
              />
            ) : (
              <Button
                onClick={reset}
                className="mx-2 card-footer-item is-warning"
                text="Reset"
                disabled={equal(state, initialState)}
              />
            )}
          </div>
        </footer>
      </form>
    </>
  )
}

export default TaskForm
