import { useEffect } from "react"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import { getCities } from "../../store/Weather/slice"
import { ICity } from "../../store/Weather/types"
import City from "./City"
import CityForm from "./CityForm/CityForm"
import "./Weather.scss"

const Weather = () => {
  const dispatch = useAppDispatch()
  const cities = useAppSelector((state: RootState) => state.cities.array)

  useEffect(() => {
    dispatch(getCities())
  }, [])

  return (
    <div className="section is-medium pt-2 pb-6">
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
