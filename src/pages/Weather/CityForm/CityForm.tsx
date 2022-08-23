import { useCallback, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { capitalizeFirstLetter } from "../../../helpers"
import { User } from "../../../store/Auth/types"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { deleteCity, saveCity, setCities } from "../../../store/Weather/slice"
import { ICity } from "../../../store/Weather/types"

const CityForm = () => {
  const dispatch = useAppDispatch()
  const cities = useAppSelector((state: RootState) => state.cities.array)
  const user: User = useAppSelector((state: RootState) => state.auth.user)
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim().length < 40) setCity(capitalizeFirstLetter(value))
  }

  const addCity = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      await dispatch(saveCity(city, user.id))
      setLoading(false)
      setCity("")
    },
    [city]
  )

  const handleDeleteCity = useCallback(
    async (city: ICity) => dispatch(deleteCity(city)),
    []
  )

  const handleCityShow = useCallback(
    (id: number) => {
      const citiesClone: ICity[] = JSON.parse(JSON.stringify(cities))
      const index = citiesClone.findIndex((city) => city.id === id)
      citiesClone[index].show = !citiesClone[index].show
      dispatch(setCities(citiesClone))
    },
    [cities]
  )

  return (
    <>
      <h1 className="is-size-3">Saved cities</h1>
      {!!cities.length && (
        <div>
          {cities.map((city: ICity) => (
            <div key={city.id} className="is-flex is-align-items-center">
              <input
                type="checkbox"
                id={city.name}
                checked={city.show}
                onChange={() => handleCityShow(city.id)}
              />
              <label className="mx-2" htmlFor={city.name}>
                {city.name}
              </label>
              <Button
                className="is-danger is-small"
                style={{ height: 16, padding: "0px 4px" }}
                onClick={() => handleDeleteCity(city)}
                text="x"
              />
            </div>
          ))}
        </div>
      )}
      <hr />
      <form onSubmit={addCity}>
        <Input
          id="city"
          label="City Name"
          placeholder="Enter city name"
          value={city}
          onChange={handleCityInput}
          autoComplete="off"
        />
        <Button
          type="submit"
          text="Add city"
          disabled={
            loading ||
            city.length < 2 ||
            !!cities.find((c: ICity) => c.name === city)
          }
        />
      </form>
    </>
  )
}

export default CityForm
