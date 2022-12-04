import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import Loader from "../../../components/UI/Loader/Loader"
import { IUser } from "../../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { getTasks } from "../../../store/Task/slice"
import { Task as TaskProps } from "../../../store/Task/types"
import "./List.scss"
import { useParams } from "react-router-dom"
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';
const Task = lazy(() => import("../../../components/Task"))

const increment:number = 6

const List = () => {
  const dispatch = useAppDispatch()
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()
  const tasks: TaskProps[] = useAppSelector(
    (state: RootState) => state.tasks.array
  )
  const foreignUser = uid !== undefined && user.id !== uid
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<TaskProps[]>([])
  const [count, setCount] = useState<number>(0)

  const ref = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(ref,{})
  const isVisible = !!entry?.isIntersecting

  useEffect(() => {
    if (tasks.length && isVisible && count < tasks.length / increment) {
      setCount(i => ++i)
    }
  }, [isVisible, tasks.length])

  useEffect(() => {
    setData(tasks.slice(0, count * increment))
  }, [count, tasks])

  useEffect(() => {
    setLoading(!tasks.length)
    dispatch(getTasks(uid || user.id)).then(() => setLoading(false))
  }, [uid])

  return (
    <div className="columns tasks-list">
      <Suspense fallback={<Loader loading={true} />}>
        {!!data.length &&
          data.map((task) => (
            <Task task={task} key={task.id} editable={!foreignUser} />
          ))}
          <div ref={ref} />
        <Loader loading={loading} />
      </Suspense>
    </div>
  )
}

export default List
