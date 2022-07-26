import { useEffect } from "react"
import Button from "../../../components/UI/Button"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { deleteTask, getTasks, setTaskToEdit } from "../../../store/taskSlice"
import { Task, User } from "../../../store/types"
import "./List.scss"
import TaskForm from "./TaskForm/TaskForm"
import { setSuccess } from "../../../store/appSlice"

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: Task[] = useAppSelector((state: RootState) => state.tasks.array)

  useEffect(() => {
    dispatch(getTasks(user.id))
  }, [])

  const deleteT = async (
    e: React.MouseEvent<HTMLButtonElement>,
    task: Task
  ) => {
    e.preventDefault()
    await dispatch(deleteTask(task))
    dispatch(setSuccess("Task deleted successfully"))
  }

  return (
    <>
      <div className="section is-medium pt-2">
        <TaskForm />
        <hr />
        <div className="columns">
          {tasks.map((task) => (
            <div className="column is-half" key={task.id}>
              <div className="card mb-5">
                <header className="card-header">
                  <p className="card-header-title">{task.title}</p>
                  <button
                    className="card-header-icon"
                    aria-label="more options"
                  >
                    <span className="icon">
                      <i className="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                  </button>
                </header>
                <div className="card-content py-2 px-4">
                  <div className="content">
                    {task.description}
                    <br />
                    <time dateTime={task.deadline}>{task.deadline}</time>
                  </div>
                </div>
                <footer className="card-footer p-3">
                  <div className="buttons">
                    <Button
                      onClick={() => dispatch(setTaskToEdit(task))}
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
          ))}
        </div>
      </div>
    </>
  )
}

export default List
