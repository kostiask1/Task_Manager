export function equal(x: any, y: any): boolean {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => equal(x[key], y[key]))
    : x === y
}
export const capitalizeFirstLetter = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const dateFormat = (date: string): Array<string | RegExp> => {
  const dayStartsWithThree = date?.charAt(0) === "3" || false
  const monthStartsWithOne = date?.charAt(3) === "1" || false

  return [
    /[0-3]/,
    dayStartsWithThree ? /[01]/ : /[0-9]/,
    "-",
    /[01]/,
    monthStartsWithOne ? /[0-2]/ : /[0-9]/,
    "-",
    /2/,
    /[0-9]/,
    /[0-9]/,
    /[0-9]/,
  ]
}

export const convertToDate = (date: string | number): Date => {
  if (typeof date === "string") {
    const day = date.slice(0, 2)
    const month = date.slice(3, 5)
    const year = date.slice(6, 10)
    const dateString = `${year}/${month}/${day}`
    return new Date(dateString)
  } else {
    return new Date(date)
  }
}

export const convertDateToString = (date: Date): string => {
  let month = (date.getUTCMonth() + 1).toString() //months from 1-12
  month.length < 2 && (month = "0" + month)
  let day = date.getDate().toString()
  day.length < 2 && (day = "0" + day)
  const year = date.getUTCFullYear()
  return `${day}-${month}-${year}`
}

function isNumeric(value: any) {
  return /^-?\d+$/.test(value)
}

const removeThHighlight = () => {
  document.querySelectorAll("th").forEach((th) => {
    th.style.backgroundColor = ""
  })
}
interface ITableActions {
  data: any[]
  setData: Function
  sorting: string
  setSorting: Function
  initData: any[]
}

export const tableActions = ({
  data,
  setData,
  sorting,
  setSorting,
  initData,
}: ITableActions) => {
  const sort = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLTableCellElement
    const innerText = target.innerHTML
    removeThHighlight()
    target.style.backgroundColor = "lightblue"
    const column = (
      innerText.charAt(0).toLowerCase() + innerText.slice(1)
    ).replaceAll(" ", "")
    const copy = [...data]
    const modifier = sorting === column ? -1 : 1
    copy.sort((a, b) => {
      if (typeof a[column] === "string" && !isNumeric(a[column])) {
        return (
          (a[column] as string).localeCompare(b[column] as string) * modifier
        )
      } else if (isNumeric(a[column])) {
        return (+a[column] - +b[column]) * modifier
      } else if (typeof a[column] == "object" || typeof b[column] == "object") {
        const aсol: any = a[column] || []
        const bсol: any = b[column] || []
        return (aсol?.length - bсol?.length) * modifier
      } else {
        if (a[column] < b[column]) return 1 * modifier
        if (a[column] > b[column]) return -1 * modifier
        return 0
      }
    })
    setSorting(sorting === column ? "" : column)
    setData(copy)
  }
  const reset = () => {
    removeThHighlight()
    setSorting("")
    setData(initData)
  }

  return [sort, reset]
}
