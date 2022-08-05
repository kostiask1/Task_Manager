import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../firebase/base"
import { convertToDate, equal } from "../helpers"
import { Task } from "./types"

interface TasksState {
  array: Task[]
  editingTask: Task | null
}

const initialState: TasksState = {
  array: [],
  editingTask: null,
}

let stateTasks: Task[] = []

export const taskInitialState: Task = {
  id: 0,
  uid: "",
  completed: false,
  description: "",
  title: "",
  end: "",
  start: 0,
  updatedAt: 0,
}

const task = createSlice({
  name: "task",
  initialState,
  reducers: {
    tasks: (state: TasksState, action: PayloadAction<Task[]>) => {
      state.array = action.payload
      stateTasks = action.payload
    },
    editingTask: (state: TasksState, action: PayloadAction<Task | null>) => {
      state.editingTask = action.payload
    },
  },
})

export default task.reducer

// Actions

export const { tasks, editingTask } = task.actions

export const setTasks = (tasksArray: Task[]) => {
  return (dispatch: any) => {
    dispatch(tasks(tasksArray))
  }
}

export const getTasks = (uid: string) => {
  return async (dispatch: any) => {
    const docRef = doc(db, "tasks", uid)
    const docSnap = await getDoc(docRef)
    const user = docSnap.data() as any

    if (user && user.tasks?.length) {
      !equal(stateTasks, user.tasks) && dispatch(setTasks(user.tasks as Task[]))
    } else {
      dispatch(setTasks([]))
    }
  }
}

export const setTask = (task: Task) => {
  return async (dispatch: any, getState: any) => {
    const tasks = getState().tasks.array
    const tasksCopy = [...tasks]
    const tasksWithoutEndDates: Task[] = []
    const tasksWithEndDates: Task[] = []

    const indexOfTask = tasks.findIndex((t: Task) => t.id === task.id)
    const existTask = indexOfTask !== -1

    if (!existTask) {
      tasksCopy.push(task)
    } else {
      tasksCopy[indexOfTask] = task
    }

    for (let i = 0; i < tasksCopy.length; i++) {
      const item = tasksCopy[i]
      if (item.end) {
        tasksWithEndDates.push(item)
      } else {
        tasksWithoutEndDates.push(item)
      }
    }

    tasksWithEndDates.sort((a: Task, b: Task) => {
      const endA = (a.end && convertToDate(a.end).getTime()) || 0
      const endB = (b.end && convertToDate(b.end).getTime()) || 0
      if (endA < endB) {
        return -1
      }
      if (endA > endB) {
        return 1
      }
      return 0
    })
    tasksWithoutEndDates.sort((a: Task, b: Task) => {
      if ((a.updatedAt || a.start) < (b.updatedAt || b.start)) {
        return 1
      }
      if ((a.updatedAt || a.start) > (b.updatedAt || b.start)) {
        return -1
      }
      return 0
    })

    const newArray = [...tasksWithEndDates, ...tasksWithoutEndDates]

    await setDoc(doc(db, "tasks", task.uid), {
      tasks: newArray as Task[],
    })

    dispatch(setTasks(newArray))
  }
}

export const deleteTask = (task: Task) => {
  return async (dispatch: any, getState: any) => {
    const tasks = getState().tasks.array
    let tempArray: Task[] = [...tasks]
    tempArray = tempArray.filter((t: Task) => t.id !== task.id)
    await setDoc(doc(db, "tasks", task.uid), {
      tasks: tempArray as Task[],
    })

    dispatch(setTasks(tempArray))
  }
}

export const setTaskToEdit = (task: Task | null) => {
  return (dispatch: any) => {
    dispatch(editingTask(task || taskInitialState))
  }
}
