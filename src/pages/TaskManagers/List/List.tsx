import "./List.scss"
import Button from "../../../components/UI/Button"
import { useAppDispatch, useAppSelector, RootState } from "../../../store/store"
import { User, Task } from "../../../store/types"
import { setTask, getTasks } from "../../../store/taskSlice"
import { useEffect } from "react"

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: Task[] = useAppSelector((state: RootState) => state.tasks.array)

  const addTaskToUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const task: Task = {
      id: new Date().getTime(),
      uid: user.id,
      completed: false,
      description: "Task description",
      title: "New task",
    }
    dispatch(setTask(task))
  }

  useEffect(() => {
    dispatch(getTasks(user.id))
  }, [])

  return (
    <>
      <Button onClick={addTaskToUser} text="Add Task" />
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
              nec iaculis mauris.
              <a href="#">@bulmaio</a>. <a href="#">#css</a>{" "}
              <a href="#">#responsive</a>
              <br />
              <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
            </div>
          </div>
          <footer className="card-footer">
            <a href="#" className="card-footer-item">
              Save
            </a>
            <a href="#" className="card-footer-item">
              Edit
            </a>
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
