import { useParams } from "react-router-dom"
import SecurityMiddleware from "../../components/SecurityMiddleware"
import TaskForm from "../../components/TaskForm/TaskForm"
import { User } from "../../store/Auth/types"
import { RootState, useAppSelector } from "../../store/store"
import { Task } from "../../store/Task/types"
import List from "./List/List"
import "./Tasks.scss"

const Tasks = () => {
  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )

  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid

  return (
    <div className="section is-medium pt-2">
      <SecurityMiddleware fallback="User haven't granted you access to his tasks">
        <>
          {!foreignUser && <TaskForm key={JSON.stringify(task)} />}
          <hr />
          <List /></>
      </SecurityMiddleware>
    </div>
  )
}

export default Tasks
