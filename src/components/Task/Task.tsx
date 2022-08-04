import { useCallback, FC } from "react"
import Button from "../UI/Button"
import { setError, setSuccess } from "../../store/appSlice"
import { useAppDispatch } from "../../store/store"
import { deleteTask, setTask, setTaskToEdit } from "../../store/taskSlice"
import { Task as TaskProps } from "../../store/types"
import "./Task.scss"

interface TaskInterface {
  task: TaskProps
  setModal?: undefined | Function
  setModalUpdate?: undefined | Function
}

const Task: FC<TaskInterface> = ({ task, setModal, setModalUpdate }) => {
  const dispatch = useAppDispatch()

  const complete = useCallback(async (task: TaskProps, completed: boolean) => {
    if (task) {
      const saveTask: any = { ...task }
      saveTask.completed = completed
      saveTask.updatedAt = new Date().getTime()
      await dispatch(setTask(saveTask))
      if (setModal) {
        setModal(saveTask)
      }
      if (completed) {
        dispatch(setSuccess("Task completed"))
      } else {
        dispatch(setError("Task returned"))
      }
    }
  }, [])

  const deleteT = async (
    e: React.MouseEvent<HTMLButtonElement>,
    task: TaskProps
  ) => {
    e.preventDefault()
    await dispatch(deleteTask(task))
    if (setModal) {
      setModal(null)
    }
    dispatch(setSuccess("Task deleted successfully"))
  }

  const setTaskToUpdate = useCallback((task: TaskProps) => {
    dispatch(setTaskToEdit(task))
    if (setModalUpdate) {
      setModalUpdate(task)
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  return (
    <div className="column task fadeIn" key={task.id}>
      <div className="card mb-5">
        <header className="card-header is-align-items-center">
          <div className="card-header-title">
            {task.title}
            <Button
              className={`complete-task-btn ${
                task.completed ? "is-primary" : "is-danger"
              }`}
              style={{ height: "100%" }}
              onClick={() => complete(task, !task.completed)}
              text={`Completed: ${task.completed ? "Yes" : "No"}`}
            />
          </div>
        </header>
        <div className="card-content py-2 px-4">
          <div className="content">
            <p className="description">Description: {task.description}</p>
            <br />
            <time dateTime={task.end}>Due: {task.end}</time>
          </div>
        </div>
        <footer className="card-footer p-3">
          <div className="buttons">
            <Button
              onClick={() => setTaskToUpdate(task)}
              className="card-footer-item is-primary"
              text="Edit"
            />
            <Button
              className="mx-2 card-footer-item is-danger"
              text="Delete"
              onClick={(e) => deleteT(e, task)}
            />
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Task
