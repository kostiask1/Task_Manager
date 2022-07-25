import { FC, FormEvent, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { signup } from "../../../store/authSlice"
import { useAppDispatch } from "../../../store/store"
import { SignUpData, User } from "../../../store/types"

const signUpData = {
  firstName: "",
  email: "",
  password: "",
  lastName: "",
}

const Signup: FC = () => {
  const [userData, setUserData] = useState<SignUpData>(signUpData)
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    dispatch(signup(userData as SignUpData, () => setLoading(false)))
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    setUserData((state) => ({ ...state, [name]: value }))
  }
  return (
    <section className="section">
      <h2 className="has-text-centered is-size-2 mb-3">Sign Up</h2>
      <form className="form" onSubmit={submitHandler}>
        <Input
          type="text"
          name="firstName"
          value={userData.firstName}
          onChange={handleChange}
          placeholder="set Name"
          label="Name"
          minLength={2}
          maxLength={20}
          required
        />
        <Input
          type="text"
          name="lastName"
          value={userData.lastName}
          onChange={handleChange}
          placeholder="set Surname"
          label="Surname"
          minLength={2}
          maxLength={30}
          required
        />
        <Input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          placeholder="Email address"
          label="Email address"
          minLength={6}
          maxLength={40}
          required
        />
        <Input
          type="password"
          name="password"
          value={userData.password}
          onChange={handleChange}
          placeholder="Password"
          label="Password"
          minLength={6}
          maxLength={30}
          required
        />
        <Button
          text={loading ? "Loading..." : "Create Account"}
          className="is-primary is-fullwidth mt-5"
          disabled={loading}
        />
      </form>
    </section>
  )
}

export default Signup
