import { FC, FormEvent, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { signup } from "../../../store/Auth/slice"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { Link, Navigate } from "react-router-dom"
import { SignUpData } from "../../../store/Auth/types"

const signUpData = {
  firstName: "",
  email: "",
  password: "",
  lastName: "",
}

const Signup: FC = () => {
  const authenticated = useAppSelector(
    (state: RootState) => state.auth.authenticated
  )

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

  if (authenticated) return <Navigate to="/profile" />

  return (
    <section className="section auth fadeIn">
      <h2 className="has-text-centered is-size-2 mb-3">Sign Up</h2>
      <form className="form" autoComplete="off" onSubmit={submitHandler}>
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
        <Link to="/signin">Already have account? - Sign in</Link>
        <Button
          text={loading ? "Loading..." : "Create Account"}
          className="primary is-fullwidth mt-5"
          disabled={loading}
        />
      </form>
    </section>
  )
}

export default Signup
