import { collection, getDocs } from "firebase/firestore/lite"
import { useEffect, useState } from "react"
import { db } from "../../firebase/base"

interface IDoc {
  value: string
}

export const useFetchItems = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<IDoc[]>([])

  useEffect(() => {
    const collection_items = collection(db, "items")
    getDocs(collection_items).then((response) => {
      if (response.docs.length) {
        const docs = response.docs.map((doc) => doc.data())
        setData(docs as IDoc[])
        setLoading(false)
      } else {
        return []
      }
    })
  }, [])

  return [loading, data]
}
