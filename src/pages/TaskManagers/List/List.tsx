import "./List.scss"
import Button from "../../../components/UI/Button"
import { useAppDispatch, useAppSelector, RootState } from "../../../store/store"
import { User, Task } from "../../../store/types"
import {
  setTask,
  getTasks,
  setTaskToEdit,
  deleteTask,
} from "../../../store/taskSlice"
import { useEffect } from "react"
import TaskForm from "./TaskForm/TaskForm"

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: Task[] = useAppSelector((state: RootState) => state.tasks.array)
  const editingTask: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )

  useEffect(() => {
    dispatch(getTasks(user.id))
  }, [])

  return (
    <>
      <div className="section is-medium pt-2">
        <TaskForm />
        <hr />
        <div className="columns">
          {tasks.map((task) => (
            <div className="column" key={task.id}>
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
                      onClick={() => dispatch(deleteTask(task))}
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
