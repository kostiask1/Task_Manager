export interface ICity {
  name: string
  id: number
  uid: string
  show: boolean
}

export interface CitiesState {
  array: ICity[]
}
