export interface Payments {
  completed: boolean
  text: string
  value: number
}

export interface Debt {
  paid: boolean
  id: number
  uid: string
  title: string
  end: string
  start: number
  updatedAt: number
  currency: string
  array: Payments[] | []
}
