import { lazy, Suspense, useEffect, useState } from "react"
import Loader from "../../../components/UI/Loader/Loader"
import { User } from "../../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { getTasks } from "../../../store/Task/slice"
import { Task as TaskProps } from "../../../store/Task/types"
import "./List.scss"
import { useParams } from "react-router-dom"
const Task = lazy(() => import("../../../components/Task"))

const List = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()
  const tasks: TaskProps[] = useAppSelector(
    (state: RootState) => state.tasks.array
  )
  const foreignUser = uid !== undefined && user.id !== uid
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(!tasks.length)
    dispatch(getTasks(uid || user.id)).then(() => setLoading(false))
  }, [])

  return (
    <div className="columns tasks-list">
      <Suspense fallback={<Loader loading={true} />}>
        {!!tasks.length &&
          tasks.map((task) => (
            <Task task={task} key={task.id} editable={!foreignUser} />
          ))}
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default List
