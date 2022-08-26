export interface Payment {
  paid: boolean
  text: string
  id: number
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
  array: Payment[] | []
}
