import { FC, FormEvent, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { signin } from "../../../store/authSlice"
import { useAppDispatch } from "../../../store/store"
import { SignInData } from "../../../store/types"

const SignIn: FC = () => {
  const isDevelopment = import.meta.env.DEV
  const [email, setEmail] = useState(
    isDevelopment ? import.meta.env.VITE_MOCK_EMAIL : "kostiasha99@gmail.com"
  )
  const [password, setPassword] = useState(
    isDevelopment ? import.meta.env.VITE_MOCK_PASSWORD : "123321"
  )
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    dispatch(signin({ email, password } as SignInData, () => setLoading(false)))
  }

  return (
    <section className="section">
      <h2 className="has-text-centered is-size-2 mb-3">Sign In</h2>
      <form className="form" onSubmit={submitHandler}>
        <Input
          type="email"
          name="up_email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email address"
          label="Email address"
          required
        />
        <Input
          type="password"
          name="up_password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Password"
          label="Password"
          required
        />
        <Button
          text={loading ? "Loading..." : "Sign In"}
          className="is-primary is-fullwidth mt-5"
          disabled={loading}
        />
      </form>
    </section>
  )
}

export default SignIn
