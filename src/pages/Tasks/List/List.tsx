import { useEffect, useState, lazy } from "react"
import Loader from "../../../components/UI/Loader/Loader"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { getTasks } from "../../../store/taskSlice"
import { Task as TaskProps, User } from "../../../store/types"
const Task = lazy(() => import("../../../components/Task"))
import "./List.scss"

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: TaskProps[] = useAppSelector(
    (state: RootState) => state.tasks.array
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dispatch(getTasks(user.id)).then(() => setLoading(false))
  }, [])

  return (
    <div className="columns tasks-list">
      {!!tasks.length &&
        tasks.map((task) => <Task task={task} key={task.id} />)}
      <Loader loading={loading} />
    </div>
  )
}

export default List
