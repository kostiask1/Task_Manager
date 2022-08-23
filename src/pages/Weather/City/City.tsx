import { FC, useState } from "react"
import Button from "../../../components/UI/Button"
import Loader from "../../../components/UI/Loader"
import { convertDateToString } from "../../../helpers"
import { setSuccess } from "../../../store/App/slice"
import { useAppDispatch } from "../../../store/store"
import { useGetCityHourlyQuery } from "../../../store/Weather/api"
import { deleteCity } from "../../../store/Weather/slice"
import { ICity } from "../../../store/Weather/types"
import Chart from "../Chart/Chart"
import "./City.scss"

interface Props {
  city: ICity
}

const City: FC<Props> = ({ city }) => {
  const dispatch = useAppDispatch()
  const { data, isLoading, error, refetch } = useGetCityHourlyQuery(city.name)
  const [loading, setLoading] = useState(false)

  const handleDeleteCity = async () => {
    setLoading(true)
    await dispatch(deleteCity(city))
    setLoading(false)
  }

  if (error)
    return (
      <div className="my-2 pl-3 is-flex is-align-items-center">
        Error while loading <b className="ml-1">{city.name}</b>, probably you
        entered city name wrong, maybe you want to
        <Button
          onClick={handleDeleteCity}
          text="Delete"
          className="is-danger mx-1 delete-city-btn is-small"
          disabled={loading}
        />
        this city?
      </div>
    )

  if (!data) return <></>

  const currentData = data.list[0]
  const { main, weather } = currentData

  const refetchData = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    refetch()
    dispatch(setSuccess(`${city.name} data is updated`))
  }

  return (
    <div className="column city fadeIn">
      <div className="card mb-5">
        <div className="card-header is-align-items-center">
          <div className="card-header-title">
            <Button onClick={refetchData} text="Update data" />
            <Button
              className="is-danger is-small delete-city-btn"
              text="x"
              onClick={handleDeleteCity}
              disabled={loading}
            />
          </div>
        </div>
        <div className="card-content py-2 px-4 is-flex is-align-items-center">
          <span className="is-size-3">
            {city.name} {Math.round(main.temp)} °C
          </span>
          <img
            height="60"
            src={`http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
            style={{ aspectRatio: "1/1", width: "unset" }}
            alt={weather[0].main}
          />
          <br />
          <ul style={{ flexBasis: "100%" }}>
            <li>Feels like {Math.round(main.feels_like)} °C</li>
            <li>Temp max {Math.round(main.temp_max)} °C</li>
            <li>Temp min {Math.round(main.temp_min)} °C</li>
          </ul>
          <div style={{ width: "100%" }}>
            <hr />
            <span className="is-size-5">
              Today is: {convertDateToString(new Date()).slice(0, 5)}
            </span>
            <Chart data={data} />
          </div>
        </div>
        <Loader loading={isLoading} />
      </div>
    </div>
  )
}

export default City
