import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { db } from "../../firebase/base";
import { equal } from '../../helpers';
import { getUserById } from "../Auth/slice";
import { IUser } from "../Auth/types";
import { AppDispatch, RootState } from "../store";
import { Subtask, Task } from "./types";

const sortDeadlines = (array: Task[]) =>
  array.sort(
    (a: Task, b: Task) =>
      (a.deadline_date ? a.deadline_date : 0) -
      (b.deadline_date ? b.deadline_date : 0)
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
  complete_date: 0,
  completed: false,
  create_date: new Date().getTime(),
  deadline_date: 0,
  description: "",
  id: 0,
  repeating: "",
  return_date: 0,
  subtasks: [],
  title: "",
  uid: "",
  update_date: new Date().getTime(),
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
    const userTasks = (docSnap.data()?.tasks || []) as Task[]

    if (userTasks?.length) {
      const isForeignUser = userTasks[0].uid !== currendId

      if (isForeignUser) {
        const foreignUser = user.whitelist.find((u) => u.id === currendId)
        if (!foreignUser || foreignUser.open === false) userTasks.length = 0
      }

      const stateTasks = getState().tasks.array

      
      for (let i = 0; i < userTasks.length; i++) {
        const task = userTasks[i]

        const differences = {
          day: 1,
          week: 7,
          month: 31,
          year: 365,
        }
        if (task.repeating && task.completed && task.create_date) {
          const today = new Date().getTime()
          const updated = task.update_date
          const taskDate = task.create_date
          console.log("task.repeating:", task)
          const diffTime = Math.abs(today - taskDate)
          const diffTimeUpdated = Math.abs(updated - taskDate)
          console.log("diffTimeUpdated:", diffTimeUpdated)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1
          const diffDaysUpdated =
            Math.ceil(diffTimeUpdated / (1000 * 60 * 60 * 24)) - 1
          console.log("diffDays:", diffDays)
          console.log("diffDaysUpdated:", diffDaysUpdated)

          console.log(
            "diffDays > differences[task.repeating]:",
            diffDays >= differences[task.repeating]
          )
          // if (diffDays > differences[task.repeating])

          if (diffDays >= differences[task.repeating]) {
            task.completed = false
            task.subtasks = task.subtasks.length
              ? task.subtasks.map((subtask: Subtask) => ({
                  ...subtask,
                  completed: false,
                }))
              : []
          }
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
    const repeatingTasks: Task[] = []

    const indexOfTask = tasksArray.findIndex((t: Task) => t.id === task.id)
    const existTask = indexOfTask !== -1
    task.update_date = new Date().getTime()

    if (!existTask) {
      tasksCopy.push(task)
    } else {
      tasksCopy[indexOfTask] = task
    }

    for (let i = 0; i < tasksCopy.length; i++) {
      const task = tasksCopy[i]
      if (task.completed) {
        completedTasks.push(task)
        continue
      }
      if (task.repeating) {
        repeatingTasks.push(task)
        continue
      }
      if (task.deadline_date) {
        tasksWithEndDates.push(task)
      } else {
        tasksWithoutEndDates.push(task)
      }
    }

    tasksWithoutEndDates.sort(
      (a: Task, b: Task) => b.update_date - a.update_date
    )
    repeatingTasks.sort(
      (a: Task, b: Task) => b.update_date - a.update_date
    )
    sortDeadlines(tasksWithEndDates)
    sortDeadlines(completedTasks)

    const newArray: Task[] = [
      ...repeatingTasks,
      ...tasksWithEndDates,
      ...tasksWithoutEndDates,
      ...completedTasks,
    ]

    await setDoc(doc(db, "tasks", task.uid), {
      tasks: newArray,
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
