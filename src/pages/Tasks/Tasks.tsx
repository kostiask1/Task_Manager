import "./Tasks.scss"
import TaskForm from "../../components/TaskForm/TaskForm"
import List from "./List/List"

const Tasks = () => {
  return (
    <div className="section is-medium pt-2">
      <TaskForm />
      <hr />
      <List />
    </div>
  )
}

export default Tasks
