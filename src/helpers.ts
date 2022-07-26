export function equal(x: any, y: any): boolean {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => equal(x[key], y[key]))
    : x === y
}
export const dateFormat = (date: string): Array<string | RegExp> => {
  const dayStartsWithThree = date?.charAt(0) === "3" || false
  const monthStartsWithOne = date?.charAt(0) === "1" || false

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

export const convertToDate = (date: string): Date => {
  const day = date.slice(0, 2)
  const month = date.slice(3, 5)
  const year = date.slice(6, 10)
  const dateString = `${year}/${month}/${day}`
  const dateObject = new Date(dateString)
  return dateObject
}
