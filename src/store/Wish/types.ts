export interface Wish {
  completed: boolean
  description: string
  id: number
  uid: string
  title: string
  url: string
  category: string
  price: number
  updatedAt: number
  open: boolean
  whitelist: Whitelist[]
}

export interface Whitelist {
  id: string
  open: boolean
}
