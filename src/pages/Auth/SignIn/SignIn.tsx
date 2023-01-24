import { FC, FormEvent, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { signin } from "../../../store/Auth/slice"
import { useAppDispatch, useAppSelector, RootState } from "../../../store/store"
import { Link, Navigate } from "react-router-dom"
import { SignInData } from "../../../store/Auth/types"

const SignIn: FC = () => {
  const authenticated = useAppSelector(
    (state: RootState) => state.auth.authenticated
  )

  const isDevelopment = import.meta.env.MODE === "development"
  const [email, setEmail] = useState(
    isDevelopment ? import.meta.env.VITE_MOCK_EMAIL : ""
  )
  const [password, setPassword] = useState(
    isDevelopment ? import.meta.env.VITE_MOCK_PASSWORD : ""
  )
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    dispatch(signin({ email, password } as SignInData, () => setLoading(false)))
  }

  if (authenticated) return <Navigate to="/calendar" />

  return (
    <section className="section auth fadeIn">
      <h2 className="has-text-centered is-size-2 mb-3">Sign In</h2>
      <form className="form" onSubmit={submitHandler}>
        <Input
          type="email"
          name="in_email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email address"
          label="Email address"
          required
        />
        <Input
          type="password"
          name="in_password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Password"
          label="Password"
          required
        />
        <Link to="/signup">Sign up if you haven't registered</Link>
        <Button
          text={loading ? "Loading..." : "Sign In"}
          className="primary is-fullwidth mt-5"
          disabled={loading}
        />
      </form>
    </section>
  )
}

export default SignIn
