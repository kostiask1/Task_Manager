import { Suspense, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import Loader from "../../components/UI/Loader/Loader"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getWishes } from "../../store/Wish/slice"
import WishForm from "./WishForm/WishForm"
import "./Wishlist.scss"

const Wishlist = () => {
  const dispatch = useAppDispatch()

  const location = useLocation()
  const wishes = useAppSelector((state: RootState) => state.wishes.array)
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(!wishes.length)
    dispatch(getWishes(user.id)).then(() => setLoading(false))
  }, [])

  console.log("wishes:", wishes)
  console.log("location:", location)
  return (
    <>
      <WishForm />

      <Suspense fallback={<Loader loading={true} />}>
        <Loader loading={loading} />
      </Suspense>
    </>
  )
}

export default Wishlist
