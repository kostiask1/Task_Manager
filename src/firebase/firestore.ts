import { collection, doc, getDocs, setDoc } from "firebase/firestore/lite"
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage"
import { db, storage } from "./base"

export const uploadDoc = async <T extends {}>(
  collection_name: string,
  data: T | any
) => {
  try {
    await setDoc(doc(db, collection_name, data.id), data)
  } catch (e) {
    console.error("Error adding document: ", e)
  }
}
export const uploadImage = async (
  filesRaw: FileList,
  name: string,
  folder: string
) => {
  let file = Array.from(filesRaw)[0]
  const storageRef = ref(storage, `${folder}/` + name)
  let request = new Promise(async (resolve) => {
    const fileRef = uploadBytesResumable(storageRef, file)
    fileRef.on(
      "state_changed",
      (snapshot) => {},
      (error) => {},
      async () => {
        await getDownloadURL(fileRef.snapshot.ref).then((downloadURL) =>
          resolve(downloadURL)
        )
      }
    )
  })
  return request
}

export const uploadImages = async (
  filesRaw: FileList,
  name: string,
  folder: string,
  callback: Function
) => {
  let files = Array.from(filesRaw)
  const storageRef = ref(storage, `${folder}/` + name)
  let requests = Promise.all(
    files.map(async (file) => {
      const fileRef = uploadBytesResumable(storageRef, file)
      const promise = new Promise((resolve) => {
        fileRef.on(
          "state_changed",
          (snapshot) => {},
          (error) => {},
          async () => {
            await getDownloadURL(fileRef.snapshot.ref).then((downloadURL) =>
              resolve(callback(downloadURL))
            )
          }
        )
      })
      return promise
    })
  )
  return requests
}

export const deleteImage = async (file: string) => {
  const desertRef = ref(storage, file)

  // Delete the file
  deleteObject(desertRef)
    .then(() => {
      console.log("File deleted successfully")
    })
    .catch((error) => {
      console.log("error:", error)
      // Uh-oh, an error occurred!
    })
}

export const getData = async <T extends {}>(collection_name: string) => {
  const querySnapshot = await getDocs(collection(db, collection_name))
  return querySnapshot.docs.map((doc) => doc.data() as T)
}
