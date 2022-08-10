import { lazy, Suspense, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loader from "../../components/UI/Loader/Loader"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getWishes } from "../../store/Wish/slice"
import { Wish as IWish } from "../../store/Wish/types"
import WishForm from "./WishForm/WishForm"
import "./Wishlist.scss"
const Wish = lazy(() => import("./Wish"))

const Wishlist = () => {
  const dispatch = useAppDispatch()

  const wishes: IWish[] = useAppSelector(
    (state: RootState) => state.wishes.array
  )
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const { uid } = useParams()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(!wishes.length)
    dispatch(getWishes(uid || user.id)).then(() => setLoading(false))
  }, [uid])

  console.log("wishes:", wishes)
  return (
    <>
      <WishForm />

      <Suspense fallback={<Loader loading={true} />}>
        {!!wishes?.length &&
          wishes.map((wish: IWish) => <Wish key={wish.id} wish={wish} />)}
        <Loader loading={loading} />
      </Suspense>
    </>
  )
}

export default Wishlist
