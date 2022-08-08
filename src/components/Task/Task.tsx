import { FC, useCallback, useState } from "react"
import { setError, setSuccess } from "../../store/appSlice"
import { useAppDispatch } from "../../store/store"
import { deleteTask, editingTask, setTask } from "../../store/taskSlice"
import { Task as TaskProps } from "../../store/types"
import Subtask from "../Subtask"
import Button from "../UI/Button"
import "./Task.scss"

interface TaskInterface {
  task: TaskProps
  setModal?: undefined | Function
  setModalUpdate?: undefined | Function
}

const Task: FC<TaskInterface> = ({ task, setModal, setModalUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const dispatch = useAppDispatch()

  const complete = useCallback(async (task: TaskProps, completed: boolean) => {
    if (task) {
      setLoading(true)
      const saveTask: TaskProps = { ...task }
      saveTask.completed = completed
      saveTask.updatedAt = new Date().getTime()
      await dispatch(setTask(saveTask))
      setLoading(false)
      setModal && setModal(saveTask)
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
    setDeleting(true)
    await dispatch(deleteTask(task))
    setDeleting(false)
    if (setModal) {
      setModal(null)
    }
    dispatch(setSuccess("Task deleted successfully"))
  }

  const setTaskToUpdate = useCallback((task: TaskProps) => {
    dispatch(editingTask(task))
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
              text={`${
                loading
                  ? "Updating..."
                  : `Completed: ${task.completed ? "Yes" : "No"}`
              }`}
              disabled={loading || deleting}
            />
          </div>
        </header>
        <div className="card-content py-2 px-4">
          <div className="content">
            <p className="description">Description: {task.description}</p>
            <br />
            {!!task.subtasks?.length && (
              <ul>
                {task.subtasks.map((t) => (
                  <Subtask
                    data={t}
                    task={task}
                    state="show"
                    setModal={setModal}
                  />
                ))}
              </ul>
            )}
            <br />
            <time dateTime={task.end}>
              Due: {task.end || "No deadline specified"}
            </time>
          </div>
        </div>
        <footer className="card-footer p-3">
          <div className="buttons">
            <Button
              onClick={() => setTaskToUpdate(task)}
              className="card-footer-item is-primary"
              text="Edit"
              disabled={loading || deleting}
            />
            <Button
              className="mx-2 card-footer-item is-danger"
              text={deleting ? "Deleting..." : "Delete"}
              onClick={(e) => deleteT(e, task)}
              disabled={loading || deleting}
            />
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Task
