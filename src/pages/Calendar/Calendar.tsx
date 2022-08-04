import format from "date-fns/format"
import getDay from "date-fns/getDay"
import enUS from "date-fns/locale/en-US"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Calendar as EventCalendar,
  dateFnsLocalizer,
  Event,
} from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"
import Modal from "../../components/Modal/Modal"
import Loader from "../../components/UI/Loader/Loader"
import { convertDateToString, convertToDate } from "../../helpers"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import {
  getTasks,
  setTaskToEdit,
  taskInitialState,
} from "../../store/taskSlice"
import { Task as TaskProps, User } from "../../store/types"
import Task from "../TaskManagers/Task"
import TaskForm from "../TaskManagers/TaskForm/TaskForm"
import "./Calendar.scss"

const Calendar = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: TaskProps[] = useAppSelector(
    (state: RootState) => state.tasks.array
  )
  const [loading, setLoading] = useState(true)
  const [task, setTask] = useState<any>(null)
  const [slot, setSlot] = useState<any>(null)

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    setSlot(null)
  }, [tasks])

  const getData = useCallback(() => {
    setLoading(true)
    dispatch(getTasks(user.id)).then(() => {
      generateEvents(tasks)
      setLoading(false)
    })
  }, [])

  const generateEvents = useCallback(
    (tasks: TaskProps[]): Event[] =>
      tasks.map((task: any) => ({
        ...task,
        start: task.end ? convertToDate(task.end) : new Date(task.start),
        end: task.end ? convertToDate(task.end) : new Date(task.start),
        hasEndDate: task.end ? true : false,
      })),
    []
  )

  const events = useMemo(() => generateEvents(tasks), [tasks])

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek,
        getDay,
        locales: {
          "en-US": enUS,
        },
      }),
    []
  )
  const onSelectEvent = useCallback((calEvent: any) => {
    const copy = { ...calEvent }
    copy.start = convertDateToString(copy.start)
    copy.end = copy.hasEndDate ? convertDateToString(copy.end) : ""
    setTask(copy)
  }, [])

  const eventPropGetter = useCallback((task: any, start: Date, end: Date) => {
    const daysLeft = Math.ceil(
      (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    const style = {
      color: "white",
      margin: "2px 5px",
      width: "calc(100% - 10px)",
      backgroundColor: "#27557b",
    }
    if (daysLeft >= 0 && task.end) {
      style.backgroundColor = `hsl(${0 + Math.min(16, daysLeft) * 3}, 90% ,50%)`
    }
    if (daysLeft < 0) {
      style.backgroundColor = "#222222"
    }
    if (!task.hasEndDate || !task.end) {
      style.backgroundColor = "#27557b"
    }
    if (task.completed) {
      style.backgroundColor = "#00d1b2"
    }
    return { style }
  }, [])

  const onSelectSlot = useCallback((slotInfo: any) => {
    dispatch(
      setTaskToEdit({
        ...taskInitialState,
        end: convertDateToString(slotInfo.start),
      })
    )
    setSlot(true)
  }, [])

  const handleCloseTaskModal = useCallback(() => {
    dispatch(setTaskToEdit(null))
    setSlot(null)
  }, [])

  const setUpdateTask = useCallback((task: TaskProps) => {
    setTask(null)
    setSlot(task)
  }, [])

  return (
    <>
      <Loader loading={loading} />
      <EventCalendar
        localizer={localizer}
        events={events}
        eventPropGetter={eventPropGetter}
        onSelectEvent={onSelectEvent}
        selectable={true}
        longPressThreshold={100}
        onSelectSlot={onSelectSlot}
        defaultView="month"
        style={{ height: "100vh" }}
      />
      <Modal id="task" show={!!task} hide={() => setTask(null)}>
        {task && (
          <Task task={task} setModalUpdate={setUpdateTask} setModal={setTask} />
        )}
      </Modal>
      <Modal id="slot" show={slot} key={slot} hide={handleCloseTaskModal}>
        <TaskForm setModal={setSlot} />
      </Modal>
    </>
  )
}

export default Calendar
