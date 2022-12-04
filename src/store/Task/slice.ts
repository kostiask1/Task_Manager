import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { doc, getDoc, setDoc } from "firebase/firestore/lite"
import { db } from "../../firebase/base"
import { convertDateToString, convertToDate, equal } from "../../helpers"
import { IUser } from "../Auth/types"
import { AppDispatch, RootState } from "../store"
import { Subtask, Task } from "./types"
import { getAuth } from 'firebase/auth';
import { getUserById } from "../Auth/slice"

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
  daily: false,
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
    const user: IUser = await getUserById(uid)

    const docRef = doc(db, "tasks", uid)
    const docSnap = await getDoc(docRef)
    const { tasks: userTasks } = (docSnap.data() || []) as { tasks: Task[] }

    if (userTasks?.length) {
      const isForeignUser = userTasks[0].uid !== currendId

      if (isForeignUser) {
        const foreignUser = user.whitelist.find((u) => u.id === currendId)
        if (!foreignUser || foreignUser.open === false) userTasks.length = 0
      }

      const stateTasks = getState().tasks.array
      
      for (let i = 0; i < userTasks.length; i++) {
        const task = userTasks[i]
        if (
          task.daily &&
          convertDateToString(new Date(task.updatedAt)) !==
            convertDateToString(new Date())
        ) {
          task.completed = false
          task.subtasks = task.subtasks.length
            ? task.subtasks.map((subtask: Subtask) => ({
                ...subtask,
                completed: false,
              }))
            : []
        }
      }
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
    const dailyTasks: Task[] = []

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
        continue
      }
      if (item.daily) {
        dailyTasks.push(item)
        continue
      }
      if (item.end) {
        tasksWithEndDates.push(item)
      } else {
        tasksWithoutEndDates.push(item)
      }
    }

    tasksWithoutEndDates.sort((a: Task, b: Task) => b.updatedAt - a.updatedAt)
    dailyTasks.sort((a: Task, b: Task) => b.updatedAt - a.updatedAt)
    sortDeadlines(tasksWithEndDates)
    sortDeadlines(completedTasks)

    const newArray = [
      ...dailyTasks,
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
