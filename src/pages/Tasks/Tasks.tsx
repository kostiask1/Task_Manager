import TaskForm from "../../components/TaskForm/TaskForm"
import { RootState, useAppSelector } from "../../store/store"
import { Task } from "../../store/Task/types"
import List from "./List/List"
import "./Tasks.scss"
import { useParams } from "react-router-dom"
import { User } from "../../store/Auth/types"

const Tasks = () => {
  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid
  return (
    <div className="section is-medium pt-2">
      {!foreignUser && <TaskForm key={JSON.stringify(task)} />}
      <hr />
      <List />
    </div>
  )
}

export default Tasks
