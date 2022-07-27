import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../firebase/base"
import { Task } from "./types"
import { convertToDate } from "../helpers"

interface TasksState {
  array: Task[]
  editingTask: Task | null
}

const initialState: TasksState = {
  array: [],
  editingTask: null,
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
      dispatch(setTasks(user.tasks as Task[]))
    } else {
      dispatch(setTasks([]))
    }
  }
}

export const setTask = (task: Task) => {
  return async (dispatch: any, getState: any) => {
    const tasks = getState().tasks.array
    const arrayWithoutDeadlines: Task[] = []
    const arrayWithDeadlines: Task[] = []

    const indexOfTask = tasks.findIndex((t: Task) => t.id === task.id)
    const existTask = indexOfTask !== -1

    if (!existTask) {
      arrayWithoutDeadlines.push(task)
    } else {
      arrayWithoutDeadlines[indexOfTask] = task
    }

    for (const item of tasks) {
      if (item.deadline) {
        arrayWithDeadlines.push(item)
      } else {
        arrayWithoutDeadlines.push(item)
      }
    }

    arrayWithDeadlines.sort((a: Task, b: Task) => {
      const deadlineA = (a.deadline && convertToDate(a.deadline).getTime()) || 0
      const deadlineB = (b.deadline && convertToDate(b.deadline).getTime()) || 0
      if (deadlineA < deadlineB) {
        return -1
      }
      if (deadlineA > deadlineB) {
        return 1
      }
      return 0
    })
    arrayWithoutDeadlines.sort((a: Task, b: Task) => {
      if ((a.updatedAt || a.createdAt) < (b.updatedAt || b.createdAt)) {
        return 1
      }
      if ((a.updatedAt || a.createdAt) > (b.updatedAt || b.createdAt)) {
        return -1
      }

      return 0
    })

    const newArray = [...arrayWithDeadlines, ...arrayWithoutDeadlines]

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

export const setTaskToEdit = (task: Task) => {
  return (dispatch: any) => {
    dispatch(editingTask(task))
  }
}
