import { useState, useCallback, useEffect } from "react"

export function useLocalStorage(
  key: string,
  initialValue: any
): [any, (value: any) => void] {
  const [value, setValue] = useState(() => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  })
  const setLocalStorage = useCallback(
    (value: any) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    [key]
  )
  
  useEffect(() => {
    setLocalStorage(value)
  }, [setLocalStorage, value])

  return [value, setValue]
}
