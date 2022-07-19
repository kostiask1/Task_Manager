import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import "firebase/auth"
import { getFirestore } from "firebase/firestore/lite"
import { getStorage } from "firebase/storage"
import { firebaseConfig } from "./firebase.config"

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const analytics = getAnalytics(app)
