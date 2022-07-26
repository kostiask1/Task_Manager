import "./List.scss"
import Button from "../../../components/UI/Button"
import { useAppDispatch, useAppSelector, RootState } from "../../../store/store"
import { User, Task } from "../../../store/types"
import { setTask, getTasks, setTaskToEdit } from "../../../store/taskSlice"
import { useEffect } from "react"
import TaskForm from "./TaskForm/TaskForm"

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: Task[] = useAppSelector((state: RootState) => state.tasks.array)
  const editingTask: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )
  console.log("editingTask:", editingTask)

  useEffect(() => {
    dispatch(getTasks(user.id))
  }, [])

  return (
    <>
      <TaskForm />
      <hr />
      {tasks.map((task) => (
        <div className="card" key={task.id}>
          <header className="card-header">
            <p className="card-header-title">{task.title}</p>
            <button className="card-header-icon" aria-label="more options">
              <span className="icon">
                <i className="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </header>
          <div className="card-content">
            <div className="content">
              {task.description}
              <br />
              <time dateTime={task.deadline}>{task.deadline}</time>
            </div>
          </div>
          <footer className="card-footer">
            <Button
              onClick={() => dispatch(setTaskToEdit(task))}
              className="card-footer-item"
              text="Edit"
            />
            <a href="#" className="card-footer-item">
              Delete
            </a>
          </footer>
        </div>
      ))}
    </>
  )
}

export default List
