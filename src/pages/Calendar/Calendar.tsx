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
import { convertToDate } from "../../helpers"
import { setSuccess } from "../../store/appSlice"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getTasks, setTask } from "../../store/taskSlice"
import { Task, User } from "../../store/types"
import "./Calendar.scss"

const Calendar = () => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const tasks: Task[] = useAppSelector((state: RootState) => state.tasks.array)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<any>(null)

  useEffect(() => {
    getData()
  }, [])

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
      start: task.deadline
        ? convertToDate(task.deadline)
        : new Date(task.createdAt),
      end: task.deadline
        ? convertToDate(task.deadline)
        : new Date(task.createdAt),
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
  const onSelectEvent = useCallback((calEvent: any) => setEvent(calEvent), [])

  const eventPropGetter = useCallback((event: any, start: Date, end: Date) => {
    const daysLeft = Math.ceil(
      (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    const style = {
      color: "white",
      backgroundColor: "",
    }
    if (!event.deadline) {
      style.backgroundColor = "#27557b"
    }
    if (daysLeft <= 14) {
      style.backgroundColor = "#ffbb00"
    }
    if (daysLeft <= 7) {
      style.backgroundColor = "#ee6600"
    }
    if (daysLeft <= 3) {
      style.backgroundColor = "#ad0000"
    }
    if (daysLeft < 0) {
      style.backgroundColor = "#222222"
    }
    if (event.completed) {
      style.backgroundColor = "#009900"
    }
    return { style }
  }, [])

  const complete = useCallback(
    async (completed: boolean) => {
      if (event) {
        const saveTask: any = { ...event }
        delete saveTask.start
        delete saveTask.end
        saveTask.completed = completed
        saveTask.updatedAt = new Date().getTime()

        await dispatch(setTask(saveTask))
        if (completed) {
          dispatch(setSuccess("Task completed successfully"))
        } else {
          dispatch(setSuccess("Task returned successfully"))
        }
        getData()
        setEvent(null)
      }
    },
    [event]
  )

  return (
    <>
      <Loader loading={loading} />
      <EventCalendar
        localizer={localizer}
        events={events}
        eventPropGetter={eventPropGetter}
        onSelectEvent={onSelectEvent}
        defaultView="month"
        style={{ height: "100vh" }}
      />
      <Modal id="event" show={!!event} hide={() => setEvent(null)}>
        {event && (
          <div className="box is-flex is-align-items-center is-flex-direction-column">
            <h2 className="is-size-3">Set task completed?</h2>
            <div className="text pt-2 is-size-5">
              Task: {event.title}
              <br />
              Description: {event.description}
              <br />
              {event.deadline && "Due date: " + event.deadline}
            </div>
            <div className="columns mt-5">
              <div className="column">
                <Button
                  className="is-primary"
                  onClick={() => complete(true)}
                  text="Yes"
                />
              </div>
              <div className="column">
                <Button
                  className="is-danger"
                  onClick={() => complete(false)}
                  text="No"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default Calendar
