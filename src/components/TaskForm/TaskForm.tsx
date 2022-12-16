import { createRef, FC, useCallback, useEffect, useMemo, useState } from "react";
import InputMask from "react-input-mask";
import { dateFormat, datesList, equal, convertDateToString, convertToDate, convertDateToTimestamp } from '../../helpers';
import { setError, setSuccess } from "../../store/App/slice";
import { IUser } from "../../store/Auth/types";
import { RootState, useAppDispatch, useAppSelector } from "../../store/store";
import {
  deleteTask,
  editingTask,
  setTask,
  taskInitialState
} from "../../store/Task/slice";
import { Subtask as ISubtask, Task, TaskRepeating } from "../../store/Task/types";
// import Subtask from "../Subtask/Subtask"
import SubTasks from '../SubTasks/SubTasks';
import Button from "../UI/Button";
import Input from "../UI/Input";
import Textarea from "../UI/Textarea";
import "./TaskForm.scss";

interface TaskInterface {
  setModal?: undefined | Function
}

const TaskForm: FC<TaskInterface> = ({ setModal }) => {
  const dispatch = useAppDispatch()
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)

  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )

  const [state, setState] = useState<Task>(task || taskInitialState)
  const [deadline_date, setDeadline_date] = useState(() => convertDateToString(state.deadline_date))
  const [loadingSave, setLoadingSave] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [subtask, setSubtask] = useState<string>("")

  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"
  const subTaskRef = createRef<HTMLInputElement>()

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
        saveTask.create_date = new Date().getTime()
        saveTask.uid = user.id
      }
      if (deadline_date) saveTask.deadline_date = convertDateToTimestamp(convertToDate(deadline_date))
      if (subtask.trim().length) {
        const newTask: ISubtask = { text: subtask, completed: false }
        saveTask.subtasks = [...saveTask.subtasks, newTask]
      }
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
    [state, deadline_date]
  )

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name
    const value = event.target.value
    setState((state: Task) => ({ ...state, [name]: value }))
  }

  const handleInputMask = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value
    setDeadline_date(value)
  }

  const setRepeating = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val: TaskRepeating = e.target.value as TaskRepeating;

    setState((state: Task) => ({
      ...state,
      repeating: val,
      deadline_date: !state.repeating ? 0 : state.deadline_date,
    }))
  }

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

  const formatChars: Array<RegExp | string> = useMemo(() => dateFormat(state.deadline_date),[state.deadline_date])

  const addSubtask = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (subtask.trim().length) {
        const text = subtask.trim()
        const isExist = state.subtasks.find((sub) => sub.text === text)

        if (isExist) {
          return dispatch(setError("Identical subtask already exists"))
        }

        const newTask: ISubtask = { text, completed: false }
        setSubtask("")
        setState((state: Task) => ({
          ...state,
          subtasks: [...state.subtasks, newTask],
        }))
        subTaskRef?.current?.focus()
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

  const handleSubtaskParse = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.clipboardData.items[0].getAsString((pasteText) => {
      const listArray = pasteText.split("\n")
      const tempSubtasks: ISubtask[] = []
      listArray.forEach(
        (text) =>
          text.trim().length < 160 &&
          text.trim().length &&
          tempSubtasks.push({ text, completed: false })
      )
      setState((state: Task) => ({
        ...state,
        subtasks: [...state.subtasks, ...tempSubtasks],
      }))
    })
  }

  return (
    <>
      <form
        className="card task fadeIn"
        key={state.id}
        onSubmit={addTaskToUser}
      >
        <header className="card-header">
          <div className="card-header-title">
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
            {!!state.create_date && (
              <Button
                className={`complete-task-btn ${state.completed ? "is-primary" : "is-danger"
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
            <SubTasks
              key={JSON.stringify(state.subtasks)}
              task={state}
              type="create"
              edit={setSubtask}
              editable={true}
              update={(data) =>
                setState((state: Task) => ({ ...state, subtasks: data }))
              } />
            <Input
              ref={subTaskRef}
              name="subtask"
              placeholder="Enter subtask"
              value={subtask}
              onPaste={handleSubtaskParse}
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
            {(!state.repeating) && (
              <>
                <label htmlFor="deadline_date">Deadline</label>
                <InputMask
                  className="input"
                  mask={formatChars}
                  maskPlaceholder=""
                  placeholder="dd-mm-yyyy"
                  alwaysShowMask={true}
                  name="deadline_date"
                  id="deadline_date"
                  value={deadline_date}
                  onChange={(event) => handleInputMask(event)}
                  autoComplete="off"
                  list="dates"
                />
                <datalist id="dates">
                  {datesList.map((value) => (
                    <option value={value} key={value}></option>
                  ))}
                </datalist>
              </>
            )}
          </div>
          <div className="is-flex is-align-items-center">
            <label className="subtask-text mr-2" htmlFor={"select-" + state.id}>
              Repeating?
            </label>
            <select
              className="select"
              id={"select-" + state.id}
              value={state.repeating}
              onChange={setRepeating}
              disabled={loadingSave || deleting}
            >
              <option value="">No</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>
        <footer className="card-footer p-3">
          <div className="buttons">
            {isEdit ? (
              <Button
                className="mx-2 card-footer-item is-success"
                text={loadingSave ? "Updating..." : "Update"}
                disabled={loadingSave || deleting || (convertDateToString(state.deadline_date) === deadline_date && equal(state, task))}
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
