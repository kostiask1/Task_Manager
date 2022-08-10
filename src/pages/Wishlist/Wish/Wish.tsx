import { FC } from "react"
import { Wish as IWish } from "../../../store/Wish/types"
import "./Wish.scss"

interface WishInterface {
  wish: IWish
}

const Wish: FC<WishInterface> = ({ wish }) => {
  console.log("wish:", wish)
  return (
    <>
      <div />
    </>
  )
}

export default Wish
