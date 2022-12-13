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

const increment: number = 6

interface IData {
  uncompleted: TaskProps[],
  finished: TaskProps[]
}

const initData = {
  uncompleted: [],
  finished: [],
}

const List = () => {
  const dispatch = useAppDispatch()
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()
  const tasks: TaskProps[] = useAppSelector(
    (state: RootState) => state.tasks.array
  )
  const foreignUser = uid !== undefined && user.id !== uid
  const [loading, setLoading] = useState(false)

  const [data, setData] = useState<IData>(initData)
  const [count, setCount] = useState<number>(0)

  const tabs: Array<keyof IData> = ["uncompleted", "finished"]
  const [activeTab, setActiveTab] = useState<keyof IData>(tabs[0])

  const ref = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(ref, {})
  const isVisible = !!entry?.isIntersecting

  useEffect(() => {
    if (tasks.length && isVisible && count < tasks.length / increment) {
      setCount(i => ++i)
    }
  }, [isVisible, tasks.length])

  useEffect(() => {
    const uncompleted = []
    const finished = []

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      task.completed ? finished.push(task) : uncompleted.push(task)
    }

    setData({
      uncompleted: uncompleted.slice(0, count * increment),
      finished: finished.slice(0, count * increment)
    })
  }, [count, tasks])

  useEffect(() => { setCount(0) }, [activeTab])

  useEffect(() => {
    setLoading(!tasks.length)
    dispatch(getTasks(uid || user.id)).then(() => setLoading(false))
  }, [uid])

  return (
    <Suspense fallback={<Loader loading={true} />}>
      {!!tasks.length && <div className="tabs is-centered is-boxed">
        <ul>
          {tabs.map(tab => <li key={tab} className={tab === activeTab ? "is-active" : ""} onClick={() => setActiveTab(tab)}><a><span>{tab}</span></a></li>)}
        </ul>
      </div>}
      <div className="columns tasks-list">
        {!!data[activeTab].length &&
          data[activeTab].map((task) => (
            <Task task={task} key={task.id} editable={!foreignUser} />
          ))}
        <div ref={ref} />
        <Loader loading={loading} />
      </div>
    </Suspense>
  )
}

export default List
