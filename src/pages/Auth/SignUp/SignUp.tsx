import { FC, FormEvent, useEffect, useState } from "react"
import Button from "../../../components/UI/Button"
import Input from "../../../components/UI/Input"
import { setError, signup } from "../../../store/actions/authActions"
import { RootState, useAppDispatch, useAppSelector } from "../../../store/store"
import { SignUpData } from "../../../store/types"

const Signup: FC = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()
  const error = useAppSelector((state: RootState) => state.auth.error)

  useEffect(() => {
    return () => {
      if (error) {
        dispatch(setError(""))
      }
    }
  }, [error, dispatch])

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    if (error) {
      dispatch(setError(""))
    }
    setLoading(true)
    dispatch(
      signup({ firstName, email, password, lastName } as SignUpData, () =>
        setLoading(false)
      )
    )
  }

  return (
    <section className="section">
      <h2 className="has-text-centered is-size-2 mb-3">Sign Up</h2>
      <form className="form" onSubmit={submitHandler}>
        <Input
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.currentTarget.value)}
          placeholder="set Name"
          label="Name"
          minLength={2}
          required
        />
        <Input
          type="text"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.currentTarget.value)}
          placeholder="set Surname"
          label="Surname"
          minLength={2}
          required
        />
        <Input
          type="email"
          name="in_email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="Email address"
          label="Email address"
          minLength={6}
          required
        />
        <Input
          type="password"
          name="in_password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Password"
          label="Password"
          minLength={6}
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
