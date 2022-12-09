import { useParams } from "react-router-dom"
import TaskForm from "../../components/TaskForm/TaskForm"
import { IUser } from "../../store/Auth/types"
import { RootState, useAppSelector } from "../../store/store"
import { Task } from "../../store/Task/types"
import List from "./List/List"

const Tasks = () => {
  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )

  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid

  return (
    <div className="section is-medium pt-2">
      {!foreignUser && <TaskForm key={JSON.stringify(task)} />}
      {!foreignUser && <hr />}
      <List />
    </div>
  )
}

export default Tasks
