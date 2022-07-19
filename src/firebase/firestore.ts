import { collection, doc, getDocs, setDoc } from "firebase/firestore/lite"
import { db } from "./base"

export const uploadDoc = async <T extends {}>(
  collection_name: string,
  data: T | any
) => {
  try {
    await setDoc(doc(db, "users", data.id), data)
    console.log(`Document written to "${collection_name}"`)
  } catch (e) {
    console.error("Error adding document: ", e)
  }
}

export const getData = async <T extends {}>(collection_name: string) => {
  const querySnapshot = await getDocs(collection(db, collection_name))
  return querySnapshot.docs.map((doc) => doc.data() as T)
}
