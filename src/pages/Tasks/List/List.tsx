import { lazy, Suspense, useEffect, useState } from "react"
import Loader from "../../../components/UI/Loader/Loader"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { getTasks } from "../../../store/taskSlice"
import { Task as TaskProps, User } from "../../../store/types"
import "./List.scss"
const Task = lazy(() => import("../../../components/Task"))

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: TaskProps[] = useAppSelector(
    (state: RootState) => state.tasks.array
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(!tasks.length)
    dispatch(getTasks(user.id)).then(() => setLoading(false))
  }, [])

  return (
    <div className="columns tasks-list">
      <Suspense fallback={<Loader loading={true} />}>
        {!!tasks.length &&
          tasks.map((task) => <Task task={task} key={task.id} />)}
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default List
