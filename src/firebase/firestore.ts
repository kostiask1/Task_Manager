import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage"
import { storage } from "./base"

export const uploadImage = async (
  filesRaw: FileList,
  name: string,
  folder: string
) => {
  let file = Array.from(filesRaw)[0]
  const storageRef = ref(storage, `${folder}/` + name)
  let request: Promise<string> = new Promise(async (resolve) => {
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

export const deleteImage = async (file: string) => {
  const desertRef = ref(storage, file)
  deleteObject(desertRef)
    .then(() => {
      console.log("File deleted successfully")
    })
    .catch((error) => {
      console.log("error:", error)
    })
}
