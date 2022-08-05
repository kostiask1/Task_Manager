// react hook that detects network connection
import { useEffect, useState } from "react"

export const useNetwork = () => {
  const [online, setOnline] = useState(navigator.onLine ?? true)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return online
}

export default useNetwork
