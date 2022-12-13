export interface Subtask {
  completed: boolean
  text: string
}

export type TaskRepeating = "no" |"day" | "week" | "month" | "year"


export interface Task {
  completed: boolean
  description: string
  id: number
  uid: string
  title: string
  end: string
  start: number
  updatedAt: number
  subtasks: Subtask[] | []
  repeating: TaskRepeating
}
