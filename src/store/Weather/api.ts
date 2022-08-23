import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
const key = import.meta.env.VITE_WEATHER_API_KEY

export const weatherApi = createApi({
  reducerPath: "weatherApi",
  keepUnusedDataFor: 30,
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.openweathermap.org/data/2.5",
  }),
  endpoints: (builder) => ({
    getCity: builder.query({
      query: (city) => `weather?q=${city}&appid=${key}&units=metric`,
    }),
    getCityHourly: builder.query({
      query: (city) => `forecast?q=${city}&appid=${key}&units=metric`,
    }),
  }),
})

export const { useGetCityQuery, useGetCityHourlyQuery } = weatherApi
