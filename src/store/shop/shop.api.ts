import React from "react"
import { db } from "../../firebase/base"
import { collection, getDocs } from "firebase/firestore/lite"

interface IDoc {
  value: string
}

export const useFetchItems = () => {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<IDoc[]>([])

  React.useEffect(() => {
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
