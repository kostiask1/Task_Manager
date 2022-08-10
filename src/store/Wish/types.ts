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
  openTo: Array<string>
}
