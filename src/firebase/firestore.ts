import { collection, doc, getDocs, setDoc } from "firebase/firestore/lite"
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage"
import { db, storage } from "./base"

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

export const uploadImage = async (
  filesRaw: FileList,
  name: string,
  callback: Function
) => {
  let files = Array.from(filesRaw)
  const storageRef = ref(storage, "users/" + name)
  let requests = Promise.all(
    files.map(async (file) => {
      const fileRef = uploadBytesResumable(storageRef, file)
      const promise = new Promise((resolve) => {
        fileRef.on(
          "state_changed",
          (snapshot) => {},
          (error) => {},
          async () => {
            await getDownloadURL(fileRef.snapshot.ref).then((downloadURL) => {
              console.log("File available at", downloadURL)
              resolve(callback(downloadURL))
            })
          }
        )
      })
      return promise
    })
  )
  return requests
}

// const deleteImage = async (file) => {
//   const storageRef = app.storage()
//   return admin && storageRef.refFromURL(file).delete(file)
// }

export const getData = async <T extends {}>(collection_name: string) => {
  const querySnapshot = await getDocs(collection(db, collection_name))
  return querySnapshot.docs.map((doc) => doc.data() as T)
}
