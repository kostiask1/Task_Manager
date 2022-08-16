import { FC, useCallback, useEffect, useState } from "react"
import { setError, setSuccess } from "../../store/App/slice"
import { useAppDispatch } from "../../store/store"
import { deleteTask, editingTask, setTask } from "../../store/Task/slice"
import { Task as TaskProps } from "../../store/Task/types"
import Subtask from "../Subtask"
import Button from "../UI/Button"
import "./Task.scss"

interface TaskInterface {
  task: TaskProps
  setModal?: undefined | Function
  setModalUpdate?: undefined | Function
  editable: boolean
}

const Task: FC<TaskInterface> = ({
  task,
  setModal,
  setModalUpdate,
  editable = false,
}) => {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const dispatch = useAppDispatch()

  const complete = useCallback(async (task: TaskProps, completed: boolean) => {
    if (task && editable) {
      setLoading(true)
      const saveTask: TaskProps = { ...task }
      saveTask.completed = completed
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

  const deleteT = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>, task: TaskProps) => {
      e.preventDefault()
      if (editable) {
        setDeleting(true)
        await dispatch(deleteTask(task))
        setDeleting(false)
        setModal && setModal(null)
        dispatch(setSuccess("Task deleted successfully"))
      }
    },
    [task]
  )

  const setTaskToUpdate = useCallback((task: TaskProps) => {
    if (editable) {
      dispatch(editingTask(task))
      if (setModalUpdate) {
        setModalUpdate(task)
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }, [])

  useEffect(() => {
    if (task.subtasks?.length) {
      const subtasksCompleted = task.subtasks.every(
        (subtask) => subtask.completed
      )
      if (!task.completed && subtasksCompleted) {
        complete(task, true)
      }
      if (task.completed && !subtasksCompleted) {
        complete(task, false)
      }
    }
  }, [task])
  return (
    <>
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
                onClick={() => editable && complete(task, !task.completed)}
                text={`${
                  loading
                    ? "Updating..."
                    : `Completed: ${task.completed ? "Yes" : "No"}`
                }`}
                disabled={loading || deleting || !editable}
              />
            </div>
          </header>
          <div className="card-content py-2 px-4">
            <div className="content">
              {!!task.description && (
                <p className="description">Description: {task.description}</p>
              )}
              <br />
              {!!task.subtasks?.length && (
                <>
                  <b>Subtasks</b>
                  <hr style={{ margin: "5px 0" }} />
                  {!!task.subtasks?.length && (
                    <ul>
                      {task.subtasks.map((t, index) => (
                        <Subtask
                          key={t.text + index}
                          data={t}
                          task={task}
                          state="show"
                          setModal={setModal}
                        />
                      ))}
                    </ul>
                  )}
                  <hr style={{ margin: "10px 0" }} />
                </>
              )}
              <time dateTime={task.end}>
                Due: {task.end || "No deadline specified"}
              </time>
            </div>
          </div>
          {editable && (
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
          )}
        </div>
      </div>
    </>
  )
}

export default Task
