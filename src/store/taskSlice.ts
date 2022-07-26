import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../firebase/base"
import { Task } from "./types"
import { getAuth } from "firebase/auth"
import { useAppSelector, RootState } from "./store"

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
      console.log("action.payload:", action.payload)
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
    const tempArray: Task[] = [...tasks]

    const indexOfTask = tasks.findIndex((t: Task) => t.id === task.id)
    const existTask = indexOfTask !== -1

    if (!existTask) {
      tempArray.push(task)
    } else {
      tempArray[indexOfTask] = task
    }
    tempArray.sort((a: Task, b: Task) => {
      if (
        (a.deadline || a.updatedAt || a.createdAt) <
        (b.deadline || b.updatedAt || b.createdAt)
      ) {
        return -1
      }
      if (
        (a.deadline || a.updatedAt || a.createdAt) >
        (b.deadline || b.updatedAt || b.createdAt)
      ) {
        return 1
      }
      return 0
    })
    await setDoc(doc(db, "tasks", task.uid), {
      tasks: tempArray as Task[],
    })

    dispatch(setTasks(tempArray))
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
