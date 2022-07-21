import { FC } from "react"
import { useAppSelector, RootState } from "../../../store/store"
import "./Loader.scss"

interface LoaderProps {
  loading?: boolean
}
const Loader: FC<LoaderProps> = ({ loading: forceLoading }) => {
  const loading = useAppSelector((state: RootState) => state.app.loading)
  return forceLoading || loading ? (
    <div className="box">
      <div className="loader"></div>
    </div>
  ) : null
}

export default Loader
