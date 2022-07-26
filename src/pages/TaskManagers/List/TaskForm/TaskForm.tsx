import { useEffect, useMemo, useState } from "react"
import InputMask from "react-input-mask"
import Button from "../../../../components/UI/Button"
import Input from "../../../../components/UI/Input"
import Textarea from "../../../../components/UI/Textarea"
import { equal } from "../../../../helpers"
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../../store/store"
import { setTask, setTaskToEdit } from "../../../../store/taskSlice"
import { Task, User } from "../../../../store/types"
import "./TaskForm.scss"

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
    task && setState(task)
  }, [task])

  const addTaskToUser = (e: React.FormEvent) => {
    e.preventDefault()

    const saveTask: Task = { ...state }

    if (!isEdit) {
      saveTask.id = new Date().getTime()
      saveTask.completed = false
      saveTask.createdAt = new Date()
    }
    saveTask.updatedAt = new Date()
    console.log("saveTask:", saveTask)
    return
    dispatch(setTask(saveTask))
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
    dispatch(setTaskToEdit(initialState))
  }

  const reset = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setState(initialState)
  }

  const dayStartsWithThree = useMemo(
    () => state.deadline?.charAt(0) === "3" || false,
    [state.deadline]
  )
  const monthStartsWithOne = useMemo(
    () => state.deadline?.charAt(0) === "1" || false,
    [state.deadline]
  )

  const formatChars: Array<RegExp | string> = useMemo(
    () => [
      /[0-3]/,
      dayStartsWithThree ? /[01]/ : /[0-9]/,
      "-",
      /[01]/,
      monthStartsWithOne ? /[0-2]/ : /[0-9]/,
      "-",
      /2/,
      /[0-9]/,
      /[0-9]/,
      /[0-9]/,
    ],
    [state.deadline]
  )
  return (
    <>
      <form className="card" key={state.id} onSubmit={addTaskToUser}>
        <header className="card-header">
          <div className="card-header-title">
            {stateName} Task -{" "}
            <Input
              type="text"
              name="title"
              className="ml-2 input"
              value={state.title}
              onChange={handleChange}
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
        <footer className="card-footer">
          {isEdit ? (
            <Button
              className="mx-2 card-footer-item is-success"
              text="Update"
            />
          ) : (
            <Button
              className="mx-2 card-footer-item is-success"
              text="Save"
              disabled={equal(state, initialState)}
            />
          )}
          {isEdit && (
            <Button className="mx-2 card-footer-item is-danger" text="Delete" />
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
        </footer>
      </form>
    </>
  )
}

export default TaskForm
