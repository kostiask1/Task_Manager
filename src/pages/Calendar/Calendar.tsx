import format from "date-fns/format"
import getDay from "date-fns/getDay"
import enUS from "date-fns/locale/en-US"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react"
import {
  Calendar as EventCalendar,
  dateFnsLocalizer,
  Event
} from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { useParams } from "react-router-dom"
import Modal from "../../components/Modal/Modal"
import Button from '../../components/UI/Button'
import Loader from "../../components/UI/Loader/Loader"
import { IUser } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { editingTask, getTasks, taskInitialState } from "../../store/Task/slice"
import { Task as TaskProps } from "../../store/Task/types"
import "./Calendar.scss"
import { convertDateToTimestamp, convertToDate } from '../../helpers';
import Checkbox from "../../components/UI/Checkbox"
const Task = lazy(() => import("../../components/Task"))
const TaskForm = lazy(() => import("../../components/TaskForm"))

const genTitle = (task: TaskProps): string => {
  const copy = { ...task }
  if (copy.subtasks?.length) {
    const completed = copy.subtasks.filter((subtask) => subtask.completed)
    copy.title = copy.subtasks.length
      ? `${copy.title} (${completed.length}/${copy.subtasks.length})`
      : copy.title
  }

  return copy.title
}

const Calendar = () => {
  const dispatch = useAppDispatch()
  const user: IUser = useAppSelector((state: RootState) => state.auth.user)
  const tasks: TaskProps[] = useAppSelector(
    (state: RootState) => state.tasks.array
  )
  const { uid } = useParams()
  const foreignUser = uid !== undefined && user.id !== uid

  const [loading, setLoading] = useState(false)
  const [task, setTask] = useState<any>(null)
  const [slot, setSlot] = useState<any>(null)
  const [bcView, setBCView] = useState("month")
  const [date, setDate] = useState(new Date())
  const [showCompleted, setShowCompleted] = useState(true)

  const getData = useCallback(() => {
    setLoading(!tasks.length)
    dispatch(getTasks(uid || user.id)).then(() => {
      generateEvents(tasks)
      setLoading(false)
    })
  }, [uid])

  useEffect(getData, [uid])

  const generateEvents = useCallback((tasks: TaskProps[]): Event[] => {
    const clearDate = (timestamp: number) => {
      const date = new Date(timestamp)
      date.setHours(0, 0, 0, 0)
      return date
    }
    const today = clearDate(new Date().getTime())
    return tasks.filter(task => (showCompleted && task.completed) || (!task.completed)).map((task: any) => ({
      ...task,
      title: genTitle(task),
      start: task.deadline_date
        ? clearDate(convertDateToTimestamp(convertToDate(task.deadline_date)))
        : task.completed
          ? clearDate(task.update_date)
          : today,
      end: task.deadline_date
        ? clearDate(convertDateToTimestamp(convertToDate(task.deadline_date)))
        : task.completed
          ? clearDate(task.update_date)
          : today,
      hasEndDate: task.deadline_date ? true : false,
    }))
  }, [showCompleted])

  const events = useMemo(() => generateEvents(tasks), [tasks, showCompleted])

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
        getDay,
        locales: {
          "en-US": enUS,
        },
      }),
    []
  )

  const onSelectEvent = useCallback((calEvent: any) => {
    const copy = { ...calEvent }
    copy.title = copy.title.replace(/\s*\(.*?\)\s*/g, "")
    copy.deadline_date = copy.hasEndDate ? copy.deadline_date : ""
    setTask(copy)
  }, [])

  const eventPropGetter = useCallback((task: any, create_date: Date, deadline_date: Date) => {
    const daysLeft = Math.ceil(
      (deadline_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    const style = {
      color: "white",
      margin: "2px 5px",
      width: "calc(100% - 10px)",
      backgroundColor: "#27557b",
    }
    if (daysLeft >= 0 && task.deadline_date) {
      style.backgroundColor = `hsl(${0 + Math.min(16, daysLeft) * 3}, 90% ,50%)`
    }
    if (daysLeft < 0) {
      style.backgroundColor = "#222222"
    }
    if (!task.hasEndDate || !task.deadline_date) {
      style.backgroundColor = "#27557b"
    }
    if (task.repeating) {
      style.backgroundColor = "#acd9eb"
    }
    if (task.completed) {
      style.backgroundColor = "#00d1b2"
    }
    return { style }
  }, [])

  const onSelectSlot = useCallback((slotInfo: any) => {
    if (!foreignUser) {
      dispatch(
        editingTask({
          ...taskInitialState,
          deadline_date: slotInfo.start.getTime(),
        })
      )
      setSlot(true)
    }
  }, [])

  const createTask = useCallback(() => {
    if (!foreignUser) {
      dispatch(
        editingTask({
          ...taskInitialState,
        })
      )
      setSlot(true)
    }
  }, [])

  const handleCloseTaskModal = useCallback(() => {
    dispatch(editingTask(null))
    setSlot(null)
  }, [])

  const setUpdateTask = useCallback((task: TaskProps) => {
    setTask(null)
    setSlot(task)
  }, [])

  const onShowMore = useCallback((_: any, date: Date) => {
    setDate(date)
    setBCView("week")
  }, [])

  const handleCheckbox = (val: boolean) => {
    setShowCompleted(val)
  }

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate])

  return (
    <div className="pb-6 pt-3">
      {!foreignUser && <Button onClick={createTask} text="Create task" className="is-primary mb-5" />}
      <Loader loading={loading} />
        <Checkbox
          text="Show completed tasks?"
          onChange={handleCheckbox}
          checked={showCompleted}
        />
      <div className="calendar-wrapper mt-3">
        <EventCalendar
          className="fadeIn"
          localizer={localizer}
          events={events}
          eventPropGetter={eventPropGetter}
          onSelectEvent={onSelectEvent}
          selectable={true}
          longPressThreshold={150}
          onSelectSlot={onSelectSlot}
          onShowMore={onShowMore}
          //@ts-ignore
          view={bcView}
          date={date}
          onNavigate={onNavigate}
          onView={setBCView}
          views={["month", "week", "agenda"]}
          style={{ height: "100vh" }}
        />
      </div>
      <Modal id="task" show={!!task} hide={() => setTask(null)}>
        {task && (
          <Suspense fallback={<Loader loading={true} />}>
            <Task
              task={task}
              setModalUpdate={setUpdateTask}
              setModal={setTask}
              editable={!foreignUser}
            />
          </Suspense>
        )}
      </Modal>
      {!foreignUser && (
        <Modal id="slot" show={slot} key={slot} hide={handleCloseTaskModal}>
          <Suspense fallback={<Loader loading={true} />}>
            <TaskForm key={task} setModal={setSlot} />
          </Suspense>
        </Modal>
      )}
    </div>
  )
}

export default Calendar
