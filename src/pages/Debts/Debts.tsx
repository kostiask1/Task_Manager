import { useEffect, useState, useMemo } from "react"
import Button from "../../components/UI/Button"
import { equal, tableActions } from "../../helpers"
import { getDebts } from "../../store/Debt/slice"
import { Debt as IDebt } from "../../store/Debt/types"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import Debt from "./Debt/Debt"
import DebtForm from "./DebtForm/DebtForm"

const Debts = () => {
  const dispatch = useAppDispatch()
  const debts = useAppSelector((state: RootState) => state.debts.array)
  const debt: IDebt | null = useAppSelector(
    (state: RootState) => state.debts.editingDebt
  )
  const [data, setData] = useState<IDebt[]>(debts)
  const [sorting, setSorting] = useState("")
  const [loading, setLoading] = useState(true)
  const [sort, reset] = tableActions({
    data,
    setData,
    sorting,
    setSorting,
    initData: debts,
  })

  useEffect(() => {
    setLoading(true)
    dispatch(getDebts()).then(() => setLoading(false))
  }, [])

  useEffect(() => {
    setData(debts)
  }, [debts])

  const [paid, left, total]: number[] = useMemo(() => {
    let paid = 0
    let total = 0
    if (debts.length) {
      for (let i = 0; i < debts.length; i++) {
        const debt = debts[i]
        for (let j = 0; j < debt.array.length; j++) {
          const payment = debt.array[j]
          if (payment.paid) paid += payment.value
          total += payment.value
        }
      }
    }
    const left = total - paid
    return [paid, left, total]
  }, [debts])

  return (
    <div className="pb-6">
      <DebtForm key={JSON.stringify(debt)} />
      <hr />
      <div className="table-container">
        <table className="table table-debts is-striped is-bordered is-hoverable is-fullwidth is-narrow">
          <thead>
            <tr>
              <th>
                <Button
                  text="Reset"
                  onClick={reset}
                  className={
                    !loading && (!equal(debts, data) || sorting)
                      ? "is-danger"
                      : ""
                  }
                  disabled={equal(debts, data) && !sorting}
                />
              </th>
              <th onClick={sort}>Title</th>
              <th onClick={(e) => sort(e, "end")}>Due Date</th>
              <th onClick={(e) => sort(e, "array")}>Debts</th>
              <th onClick={sort}>Paid</th>
              <th onClick={(e) => sort(e, "array")}>
                <table>
                  <thead>
                    <tr>
                      <td>Paid</td>
                      <td>Left</td>
                      <td>Total</td>
                    </tr>
                  </thead>
                </table>
              </th>
              <th onClick={sort}>Currency</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!!data?.length ? (
              data.map((debt: IDebt) => (
                <tr key={debt.id}>
                  <Debt debt={debt} index={debts.indexOf(debt)} />
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>No debts to be displayed...</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>
                <table>
                  <tbody>
                    <tr>
                      <td>{paid}</td>
                      <td>{left}</td>
                      <td>{total}</td>
                    </tr>
                  </tbody>
                </table>
              </th>
              <th></th>
              <th></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export default Debts
