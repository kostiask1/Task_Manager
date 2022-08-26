import { FC, useCallback, useEffect, useMemo, useState } from "react"
import InputMask from "react-input-mask"
import { dateFormat, datesList, equal } from "../../helpers"
import { setSuccess } from "../../store/App/slice"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import {
  deleteTask,
  editingTask,
  setTask,
  taskInitialState,
} from "../../store/Task/slice"
import { Subtask as ISubtask, Task } from "../../store/Task/types"
import Subtask from "../Subtask/Subtask"
import Button from "../UI/Button"
import Input from "../UI/Input"
import Textarea from "../UI/Textarea"
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
  const [loadingSave, setLoadingSave] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [subtask, setSubtask] = useState<string>("")

  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

  const subtasksCompleted = useMemo(
    () => state.subtasks?.every((subtask) => subtask.completed),
    [state.subtasks]
  )

  useEffect(() => {
    if (state.subtasks?.length) {
      if (!state.completed && subtasksCompleted) {
        handleCompleted(null, true)
      }
      if (state.completed && !subtasksCompleted) {
        handleCompleted(null, false)
      }
    }
  }, [state])

  const addTaskToUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const saveTask: Task = { ...state }
      setLoadingSave(true)
      if (!isEdit) {
        saveTask.id = new Date().getTime()
        saveTask.start = new Date().getTime()
        saveTask.uid = user.id
      }
      if (saveTask.end === "dd-mm-yyyy") saveTask.end = ""
      saveTask.title = saveTask.title.trim()
      saveTask.description = saveTask.description.trim()
      await dispatch(setTask(saveTask))
      setModal && setModal(null)
      setLoadingSave(false)
      isEdit
        ? dispatch(setSuccess("Task updated successfully"))
        : dispatch(setSuccess("Task created successfully"))
      clear()
    },
    [state]
  )

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name
    const value = event.target.value
    setState((state: Task) => ({ ...state, [name]: value }))
  }

  const toggleDaily = () =>
    setState((state: Task) => ({
      ...state,
      daily: !state.daily,
      end: !state.daily ? "" : state.end,
    }))

  const clear = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setState(taskInitialState)
    dispatch(editingTask(null))
  }, [])

  const reset = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setState(task || taskInitialState)
  }, [])

  const deleteT = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setDeleting(true)
      await dispatch(deleteTask(state))
      dispatch(editingTask(taskInitialState))
      setDeleting(false)
      dispatch(setSuccess("Task deleted successfully"))
    },
    [state]
  )

  const formatChars: Array<RegExp | string> = useMemo(
    () => dateFormat(state.end as string),
    [state.end]
  )

  const addSubtask = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (subtask.trim().length) {
        const newTask: ISubtask = { text: subtask, completed: false }
        setSubtask("")
        setState((state: Task) => ({
          ...state,
          subtasks: [...state.subtasks, newTask],
        }))
      }
    },
    [subtask]
  )
  const handleSubtask = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.value.trim().length < 160 && setSubtask(e.target.value)

  const handleCompleted = (
    e: React.MouseEvent<HTMLButtonElement> | null,
    completed?: boolean
  ) => {
    e?.preventDefault()
    setState((state: Task) => ({
      ...state,
      completed: completed ?? !state.completed,
    }))
  }

  return (
    <>
      <form
        className="card task fadeIn"
        key={state.id}
        onSubmit={addTaskToUser}
      >
        <header className="card-header">
          <div className="card-header-title is-align-items-center">
            <label htmlFor="title">{stateName} Task -</label>
            <Input
              type="text"
              name="title"
              className="ml-2 input"
              value={state.title}
              onChange={handleChange}
              placeholder="Task Title"
              maxLength={75}
              required
            />
            {!!state.start && (
              <Button
                className={`complete-task-btn ${
                  state.completed ? "is-primary" : "is-danger"
                }`}
                onClick={handleCompleted}
                text={`Completed: ${state.completed ? "Yes" : "No"}`}
                disabled={!!state.subtasks?.length || loadingSave || deleting}
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
              maxLength={750}
            />
            <label htmlFor="subtask">
              <b>Subtasks</b>
            </label>
            <hr style={{ margin: "5px 0" }} />
            <ul key={JSON.stringify(state.subtasks)}>
              {state.subtasks?.map((subtask, index) => (
                <Subtask
                  key={subtask.text + index}
                  data={subtask as ISubtask}
                  task={state}
                  state={"create"}
                  edit={setSubtask}
                  editable={true}
                  update={(data) =>
                    setState((state: Task) => ({ ...state, subtasks: data }))
                  }
                />
              ))}
            </ul>
            <Input
              name="subtask"
              placeholder="Enter subtask"
              value={subtask}
              onChange={handleSubtask}
            />
            <Button
              onClick={addSubtask}
              className="add-subtask is-info"
              text="Add subtask"
              disabled={loadingSave || deleting || !subtask.trim().length}
            />
            <br />
            <hr style={{ margin: "10px 0" }} />
            {state.daily ? (
              <del>Deadline</del>
            ) : (
              <label htmlFor="end">Deadline</label>
            )}
            <InputMask
              className="input"
              mask={formatChars}
              maskPlaceholder=""
              placeholder="dd-mm-yyyy"
              alwaysShowMask={true}
              name="end"
              id="end"
              value={state.end}
              onChange={(event) => !state.daily && handleChange(event)}
              disabled={state.daily}
              autoComplete="off"
              list="dates"
            />
            <datalist id="dates">
              {datesList.map((value) => (
                <option value={value} key={value}></option>
              ))}
            </datalist>
          </div>
          <input
            type="checkbox"
            className="checkbox"
            id={"checkbox-" + state.id}
            checked={state.daily}
            onChange={toggleDaily}
            disabled={loadingSave || deleting}
          />
          <label className="subtask-text ml-2" htmlFor={"checkbox-" + state.id}>
            Daily task
          </label>
        </div>
        <footer className="card-footer p-3">
          <div className="buttons">
            {isEdit ? (
              <Button
                className="mx-2 card-footer-item is-success"
                text={loadingSave ? "Updating..." : "Update"}
                disabled={loadingSave || deleting || equal(state, task)}
              />
            ) : (
              <Button
                className="mx-2 card-footer-item is-success"
                text={loadingSave ? "Saving..." : "Save"}
                disabled={
                  loadingSave || deleting || equal(state, taskInitialState)
                }
              />
            )}
            {isEdit && (
              <Button
                className="mx-2 card-footer-item is-danger"
                text={deleting ? "Deleting..." : "Delete"}
                onClick={deleteT}
                disabled={loadingSave || deleting}
              />
            )}
            {isEdit && (
              <Button
                onClick={reset}
                className="mx-2 card-footer-item is-warning"
                text="Reset"
                disabled={
                  loadingSave ||
                  deleting ||
                  equal(state, task || taskInitialState)
                }
              />
            )}
            {!setModal && (
              <Button
                onClick={clear}
                className="mx-2 card-footer-item is-warning"
                text="Clear"
                disabled={loadingSave || deleting}
              />
            )}
          </div>
        </footer>
      </form>
    </>
  )
}

export default TaskForm
