import { collection, addDoc, getDocs } from "firebase/firestore/lite"
import { db } from "./base"

export const uploadDoc = async <T extends {}>(
  collection_name: string,
  data: T
) => {
  try {
    const docRef = await addDoc(collection(db, collection_name), data)
    console.log(
      `Document written to "${collection_name}" with ID: "${docRef.id}"`
    )
  } catch (e) {
    console.error("Error adding document: ", e)
  }
}

export const getData = async <T extends {}>(collection_name: string) => {
  const querySnapshot = await getDocs(collection(db, collection_name))
  return querySnapshot.docs.map((doc) => doc.data() as T)
}
