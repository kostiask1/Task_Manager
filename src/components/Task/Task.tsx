import { FC, useCallback, useEffect, useState } from "react"
import { setError, setSuccess } from "../../store/App/slice"
import { useAppDispatch } from "../../store/store"
import { deleteTask, editingTask, setTask } from "../../store/Task/slice"
import { Task as TaskProps } from "../../store/Task/types"
import Button from "../UI/Button"
import "./Task.scss"
import SubTasks from '../SubTasks/SubTasks';
import { convertDateToString } from "../../helpers"

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
      if (task.subtasks.length) {
        if (!task.subtasks.every(subtask => subtask.completed)) {
          return dispatch(setError("Complete all subtasks first"))
        }
      }
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

  const day = 86400000
  const week = day * 7
  const month = week * 4
  const year = month * 12 - day

  const multiplier = {
    day,
    week,
    month,
    year,
  }
  return (
    <>
      <div className="column task fadeIn" key={task.id}>
        <div className="card mb-5">
          <header className="card-header is-align-items-center">
            <div className="card-header-title">
              {task.title}
              <Button
                className={`complete-task-btn ${task.completed ? "is-primary" : "is-danger"
                  }`}
                style={{ height: "100%" }}
                onClick={() => editable && complete(task, !task.completed)}
                text={`${loading
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
                  <SubTasks
                    task={task}
                    type="show"
                    editable={editable}
                    setModal={setModal} />
                  <hr style={{ margin: "10px 0" }} />
                </>
              )}
              {task.repeating ? (
                <time>
                  <span>Repeating: {task.repeating}</span>
                  <p>
                    Reset on:
                    {convertDateToString(new Date(
                      task.update_date + multiplier[task.repeating]
                    ))}
                  </p></time>
              ) : (
                <time dateTime={convertDateToString(task.deadline_date)}>
                  Due: {convertDateToString(task.deadline_date) || "No deadline specified"}
                </time>
              )}
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
