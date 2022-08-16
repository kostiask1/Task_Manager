import { useCallback } from "react"
import { useParams } from "react-router-dom"
import TaskForm from "../../components/TaskForm/TaskForm"
import Button from "../../components/UI/Button"
import { setError, setSuccess } from "../../store/App/slice"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { Task } from "../../store/Task/types"
import List from "./List/List"
import "./Tasks.scss"

const Tasks = () => {
  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )
  const dispatch = useAppDispatch()

  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()

  const foreignUser = uid !== undefined && user.id !== uid

  const copyPage = useCallback(() => {
    navigator.clipboard
      .writeText(`${window.location.host}/tasks/${user.id}`)
      .then(
        () =>
          dispatch(setSuccess("Link to your wishlist is copied to clipboard")),
        () => dispatch(setError("Something went wrong"))
      )
  }, [user.id])
  return (
    <div className="section is-medium pt-2">
      {!foreignUser && (
        <Button
          onClick={copyPage}
          className="is-primary mb-3"
          text="Share Your Tasks"
        />
      )}
      {!foreignUser && <TaskForm key={JSON.stringify(task)} />}
      <hr />
      <List />
    </div>
  )
}

export default Tasks
