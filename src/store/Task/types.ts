export interface Subtask {
  completed: boolean
  text: string
}

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
  daily: boolean
}
