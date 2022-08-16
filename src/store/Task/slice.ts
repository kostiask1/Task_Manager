import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { convertToDate, equal } from "../../helpers"
import { Task } from "./types"
import { AppDispatch, RootState } from "../store"
import { getAuth } from "firebase/auth"
import { Whitelist } from "../Wish/types"

const sortDeadlines = (array: Task[]) =>
  array.sort(
    (a: Task, b: Task) =>
      convertToDate(a.end).getTime() - convertToDate(b.end).getTime()
  )

interface TasksState {
  array: Task[]
  editingTask: Task | null
}

const initialState: TasksState = {
  array: [],
  editingTask: null,
}

export const taskInitialState: Task = {
  id: 0,
  uid: "",
  completed: false,
  description: "",
  title: "",
  end: "",
  start: 0,
  updatedAt: 0,
  subtasks: [],
}

const task = createSlice({
  name: "task",
  initialState,
  reducers: {
    tasks: (state: TasksState, action: PayloadAction<Task[]>) => {
      state.array = action.payload
    },
    editingTask: (state: TasksState, action: PayloadAction<Task | null>) => {
      state.editingTask = action.payload
    },
  },
})

export default task.reducer

// Actions

export const { tasks, editingTask } = task.actions

const _auth = getAuth()

export const getTasks = (uid: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const currendId = _auth?.currentUser?.uid || ""

    const docRef = doc(db, "tasks", uid)
    const docSnap = await getDoc(docRef)
    const { tasks: userTasks } = (docSnap.data() || []) as { tasks: Task[] }

    const userRef = doc(db, "users", uid)
    const snap = await getDoc(userRef)
    const { whitelist } = snap.data() as { whitelist: Whitelist[] }

    if (userTasks?.length) {
      const foreignWishes = userTasks[0].uid !== currendId

      if (foreignWishes) {
        if (whitelist?.findIndex((user) => user.id == currendId) == -1) {
          userTasks.length = 0
        }
      }
      const stateTasks = getState().tasks.array
      !equal(stateTasks, userTasks) && dispatch(tasks(userTasks as Task[]))
    } else {
      dispatch(tasks([]))
    }
  }
}

export const setTask = (task: Task) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const tasksArray = getState().tasks.array
    const tasksCopy = [...tasksArray]
    const tasksWithoutEndDates: Task[] = []
    const tasksWithEndDates: Task[] = []
    const completedTasks: Task[] = []

    const indexOfTask = tasksArray.findIndex((t: Task) => t.id === task.id)
    const existTask = indexOfTask !== -1
    task.updatedAt = new Date().getTime()

    if (!existTask) {
      tasksCopy.push(task)
    } else {
      tasksCopy[indexOfTask] = task
    }

    for (let i = 0; i < tasksCopy.length; i++) {
      const item = tasksCopy[i]
      if (item.completed) {
        completedTasks.push(item)
      } else {
        if (item.end) {
          tasksWithEndDates.push(item)
        } else {
          tasksWithoutEndDates.push(item)
        }
      }
    }

    tasksWithoutEndDates.sort((a: Task, b: Task) => a.updatedAt - b.updatedAt)

    sortDeadlines(tasksWithEndDates)
    sortDeadlines(completedTasks)

    const newArray = [
      ...tasksWithEndDates,
      ...tasksWithoutEndDates,
      ...completedTasks,
    ]

    await setDoc(doc(db, "tasks", task.uid), {
      tasks: newArray as Task[],
    })

    dispatch(tasks(newArray))
  }
}

export const deleteTask = (task: Task) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const tasksArray = getState().tasks.array
    let tempArray: Task[] = [...tasksArray]
    tempArray = tempArray.filter((t: Task) => t.id !== task.id)
    await setDoc(doc(db, "tasks", task.uid), {
      tasks: tempArray as Task[],
    })

    dispatch(tasks(tempArray))
  }
}
