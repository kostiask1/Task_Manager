import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../firebase/base"
import { Task } from "./types"
import { getAuth } from "firebase/auth"
import { useAppSelector, RootState } from "./store"

interface TasksState {
  array: Task[]
}

const initialState: TasksState = {
  array: [],
}
const task = createSlice({
  name: "task",
  initialState,
  reducers: {
    tasks: (state: TasksState, action: PayloadAction<Task[]>) => {
      console.log("action.payload:", action.payload)
      state.array = action.payload
    },
  },
})

export default task.reducer

// Actions

export const { tasks } = task.actions

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

    const indexOfTask = tasks.indexOf((t: Task) => t.id === task.id)
    const existTask = indexOfTask !== -1

    if (!existTask) {
      tempArray.push(task)
    } else {
      tempArray[indexOfTask] = task
    }

    await setDoc(doc(db, "tasks", task.uid), {
      tasks: tempArray as Task[],
    })

    dispatch(setTasks(tempArray))
  }
}
