export interface Subtask {
  completed: boolean
  text: string
}

export type TaskRepeating = "" | "day" | "week" | "month" | "year"

export interface Task {
  complete_date: number | 0
  completed: boolean
  create_date: number
  deadline_date: number | 0
  description: string
  id: number
  repeating: TaskRepeating
  return_date: number | 0
  subtasks: Subtask[] | []
  title: string
  uid: string
  update_date: number
}
