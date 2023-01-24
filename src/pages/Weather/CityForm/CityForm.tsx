import { useCallback, useEffect, useState, createRef } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { capitalizeFirstLetter } from "../../../helpers"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { deleteCity, saveCity, updateCity } from "../../../store/Weather/slice"
import { ICity } from "../../../store/Weather/types"

const CityForm = () => {
  const dispatch = useAppDispatch()
  const cities = useAppSelector((state: RootState) => state.cities.array)
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)
  const cityRef = createRef<HTMLInputElement>()

  const handleCityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim().length < 40) setCity(capitalizeFirstLetter(value))
  }

  useEffect(() => {
    cityRef?.current?.focus()
  }, [cities])

  const addCity = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      await dispatch(saveCity(city))
      setLoading(false)
      setCity("")
    },
    [city]
  )

  const handleDeleteCity = useCallback(async (city: ICity) => {
    setLoading(true)
    await dispatch(deleteCity(city))
    setLoading(false)
  }, [])

  const handleCityShow = useCallback(
    async (id: number) => {
      setLoading(true)
      let city = cities.find((city) => city.id === id)
      city = JSON.parse(JSON.stringify(city))
      if (city) {
        city.show = !city.show
        await dispatch(updateCity(city))
      }
      setLoading(false)
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
                disabled={loading}
              />
              <label className="mx-2" htmlFor={city.name}>
                {city.name}
              </label>
              <Button
                className="danger is-small"
                style={{ height: 16, padding: "0px 4px" }}
                onClick={() => handleDeleteCity(city)}
                text="x"
                disabled={loading}
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
          ref={cityRef}
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
