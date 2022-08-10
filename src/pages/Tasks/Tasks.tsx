import "./Tasks.scss"
import TaskForm from "../../components/TaskForm/TaskForm"
import List from "./List/List"
import { useAppSelector, RootState } from "../../store/store"
import { Task } from "../../store/types"

const Tasks = () => {
  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )
  return (
    <div className="section is-medium pt-2">
      <TaskForm key={JSON.stringify(task)} />
      <hr />
      <List />
    </div>
  )
}

export default Tasks
