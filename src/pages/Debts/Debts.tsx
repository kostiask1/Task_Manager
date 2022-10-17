import { useEffect, useMemo, useState } from "react"
import Table, { ITableProps } from "../../components/UI/Table"
import { tableActions } from "../../helpers"
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

  const currencies = useMemo(() => {
    const temp_currencies: any[] = []
    if (debts.length) {
      for (let i = 0; i < debts.length; i++) {
        const debt = debts[i]
        if (!temp_currencies.includes(debt.currency))
          temp_currencies.push(debt.currency)
      }
      return temp_currencies
    }
  }, [debts])

  const debtSummary = useMemo((): any => {
    const summary: any = {}
    if (currencies?.length) {
      currencies.forEach(
        (currency: string) => (summary[currency] = { paid: 0, total: 0 })
      )
    }
    if (debts.length) {
      for (let i = 0; i < debts.length; i++) {
        const debt = debts[i]
        for (let j = 0; j < debt.array.length; j++) {
          const payment = debt.array[j]
          const currencyObject = summary[debt.currency]
          if (payment.paid) currencyObject.paid += payment.value
          currencyObject.total += payment.value
          currencyObject.left = currencyObject.total - currencyObject.paid
        }
      }
    }
    const temp = Object.entries(summary).map((entry: any) => ({
      ...entry[1],
      currency: entry[0],
    }))
    return temp
  }, [debts])

  const columns = [
    {
      title: "Title"
    },
    {
      title: "Due Date",
      data: "end"
    },
    {
      title: "Debts",
      data: "array"
    },
    {
      title: "Paid"
    },
    {
      data: "total",
      element: <table className="table">
        <thead>
          <tr>
            <td>Paid</td>
            <td>Left</td>
            <td>Total</td>
          </tr>
        </thead>
      </table>,
    },
    {
      title: "Currency"
    },
    {
      title: "Action",
      sorting: false
    },
  ]

  const body = data.map((debt: IDebt) => (
    <Debt key={debt.id} debt={debt} index={debts.indexOf(debt)} />
  ))

  const footer = [
    "",
    "",
    "",
    "",
    {
      element: <table className="table">
        <thead>
          <tr>
            <td>Paid</td>
            <td>Left</td>
            <td>Total</td>
          </tr>
        </thead>
      </table>,
    },
    {
      element:
        <table>
          <tbody>
            {debtSummary.map((sumObject: any) => (
              <tr key={sumObject.currency}>
                <td>{sumObject.paid}</td>
                <td>{sumObject.left}</td>
                <td>{sumObject.total}</td>
              </tr>
            ))}
          </tbody>
        </table>,
    },
    {
      element:
        <table>
          <tbody>
            {debtSummary.map((sumObject: any) => (
              <tr key={sumObject.currency}>
                <td>{sumObject.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>,
    },
    ""
  ]

  const tableProps: ITableProps = {
    data,
    columns,
    body,
    footer,
    loading,
    sorting,
    sort,
    reset,
    initData: debts
  }

  return (
    <div className="section is-medium pt-2 pb-6">
      <DebtForm key={JSON.stringify(debt)} />
      <hr />
      <Table
        {...tableProps}
      />
    </div>
  )
}

export default Debts
