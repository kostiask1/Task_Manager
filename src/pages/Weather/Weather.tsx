import { useEffect } from "react"
import { User } from "../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getCities } from "../../store/Weather/slice"
import { ICity } from "../../store/Weather/types"
import City from "./City"
import CityForm from "./CityForm/CityForm"
import "./Weather.scss"

const Weather = () => {
  const dispatch = useAppDispatch()
  const cities = useAppSelector((state: RootState) => state.cities.array)
  const user: User = useAppSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    dispatch(getCities(user.id))
  }, [])

  return (
    <div className="pb-6">
      <CityForm />
      <hr />
      <div className="columns cities-list">
        {!!cities.length &&
          cities.map(
            (city: ICity) => city.show && <City key={city.id} city={city} />
          )}
      </div>
    </div>
  )
}

export default Weather
