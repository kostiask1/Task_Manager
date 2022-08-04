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
import Button from "../../components/UI/Button"
import Loader from "../../components/UI/Loader/Loader"
import { convertDateToString, convertToDate } from "../../helpers"
import { setError, setSuccess } from "../../store/appSlice"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import {
  deleteTask,
  getTasks,
  setTask as updateTask,
  setTaskToEdit,
  taskInitialState,
} from "../../store/taskSlice"
import { Task, User } from "../../store/types"
import TaskForm from "../TaskManagers/TaskForm/TaskForm"
import "./Calendar.scss"

const Calendar = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: Task[] = useAppSelector((state: RootState) => state.tasks.array)
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

  const generateEvents = useCallback((tasks: Task[]): Event[] => {
    return tasks.map((task: any) => ({
      ...task,
      start: task.end ? convertToDate(task.end) : new Date(task.start),
      end: task.end ? convertToDate(task.end) : new Date(task.start),
    }))
  }, [])

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
    copy.end = convertDateToString(copy.end)
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
      backgroundColor: "",
    }
    if (!task.end) {
      style.backgroundColor = "#27557b"
    }
    if (daysLeft >= 0 && task.end) {
      style.backgroundColor = `hsl(${0 + Math.min(16, daysLeft) * 3}, 90% ,50%)`
    }
    if (daysLeft < 0) {
      style.backgroundColor = "#222222"
    }
    if (task.completed) {
      style.backgroundColor = "#00d1b2"
    }
    return { style }
  }, [])

  const complete = useCallback(
    async (completed: boolean) => {
      if (task) {
        const saveTask: any = { ...task }
        saveTask.completed = completed
        saveTask.updatedAt = new Date().getTime()

        await dispatch(updateTask(saveTask))
        if (completed) {
          dispatch(setSuccess("Task completed"))
        } else {
          dispatch(setError("Task returned"))
        }
        getData()
        setTask(saveTask)
      }
    },
    [task]
  )

  const onSelectSlot = useCallback((slotInfo: any) => {
    dispatch(
      setTaskToEdit({
        ...taskInitialState,
        end: convertDateToString(slotInfo.start),
      })
    )
    setSlot(true)
  }, [])

  const setUpdateEvent = useCallback((task: any) => {
    const eventCopy = { ...task }
    dispatch(setTaskToEdit(eventCopy))
    setTask(null)
    setSlot(true)
  }, [])

  const handleCloseTaskModal = useCallback(() => {
    dispatch(setTaskToEdit(null))
    setSlot(null)
  }, [])

  const handleDeleteTask = useCallback(async (task: Task) => {
    await dispatch(deleteTask(task))
    dispatch(setSuccess("Task deleted"))
    setTask(null)
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
        onSelectSlot={onSelectSlot}
        defaultView="month"
        style={{ height: "100vh" }}
      />
      <Modal id="task" show={!!task} hide={() => setTask(null)}>
        {task && (
          <div className="box is-flex is-align-items-center is-flex-direction-column">
            <h2 className="is-size-3">Set task completed?</h2>
            <div className="text pt-2 is-size-5">
              Task: {task.title}
              <br />
              Description: {task.description}
              <br />
              {task.end && "Due date: " + task.end}
            </div>
            <div className="columns mt-5">
              <div className="column">
                <Button
                  className={task.completed ? "is-primary" : "is-danger"}
                  onClick={() => complete(!task.completed)}
                  text={`Completed: ${task.completed ? "Yes" : "No"}`}
                />
              </div>
              <div className="column">
                <Button
                  className={"is-primary"}
                  onClick={() => setUpdateEvent(task)}
                  text="Edit"
                />
              </div>
              <div className="column">
                <Button
                  className="mx-2 card-footer-item is-danger"
                  text="Delete"
                  onClick={() => handleDeleteTask(task)}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal id="slot" show={slot} hide={handleCloseTaskModal}>
        <TaskForm />
      </Modal>
    </>
  )
}

export default Calendar
