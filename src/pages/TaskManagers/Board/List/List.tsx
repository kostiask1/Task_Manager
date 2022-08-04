import { useEffect, useState } from "react"
import Button from "../../../../components/UI/Button"
import { setSuccess } from "../../../../store/appSlice"
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "../../../../store/store"
import {
  deleteTask,
  getTasks,
  setTaskToEdit,
} from "../../../../store/taskSlice"
import { Task, User } from "../../../../store/types"
import "./List.scss"
import Loader from "../../../../components/UI/Loader/Loader"

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: Task[] = useAppSelector((state: RootState) => state.tasks.array)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dispatch(getTasks(user.id)).then(() => setLoading(false))
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
    <div className="columns">
      {tasks.map((task) => (
        <div className="column is-half" key={task.id}>
          <div className="card mb-5">
            <header className="card-header">
              <p className="card-header-title">{task.title}</p>
              <button className="card-header-icon" aria-label="more options">
                <span className="icon">
                  <i className="fas fa-angle-down" aria-hidden="true"></i>
                </span>
              </button>
            </header>
            <div className="card-content py-2 px-4">
              <div className="content">
                {task.description}
                <br />
                <time dateTime={task.end}>{task.end}</time>
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
      <Loader loading={loading} />
    </div>
  )
}

export default List
