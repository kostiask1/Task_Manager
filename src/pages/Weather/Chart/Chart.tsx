import { FC, useMemo, useRef } from "react"
import useDraggableScroll from "use-draggable-scroll"
import "./Chart.scss"
import { convertDateToString } from "../../../helpers"

interface Props {
  data: any
}

const Chart: FC<Props> = ({ data }) => {
  const chart = useRef<HTMLDivElement>(null)
  const { onMouseDown } = useDraggableScroll(chart, { direction: "horizontal" })
  const medium = useMemo(
    () =>
      Math.round(
        data?.list?.reduce((acc: number, cur: any) => {
          return acc + cur.main.temp
        }, 0) / data?.list?.length
      ),
    [data]
  )

  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const convertCellDate = (cell_date: string): string =>
    cell_date.slice(8, 10) + "-" + cell_date.slice(5, 7)

  return (
    <div className="chart" ref={chart} onMouseDown={onMouseDown}>
      {!!data.list.length &&
        data.list.map((item: any) => (
          <div
            className="chart__cell"
            key={item.dt}
            style={{
              transform: `translateY(${
                (medium - Math.round(item.main.temp)) * 3
              }px)`,
              backgroundColor: `hsl(${
                50 + Math.min(16, medium - Math.round(item.main.temp)) * 1.6
              }, 90% ,50%)`,
            }}
          >
            <span>
              {convertDateToString(today).slice(0, 5) ==
              convertCellDate(item.dt_txt)
                ? "Today"
                : convertDateToString(tomorrow).slice(0, 5) ==
                  convertCellDate(item.dt_txt)
                ? "Tomorrow"
                : convertCellDate(item.dt_txt)}
            </span>
            <span>{item.dt_txt.slice(11, item.dt_txt.length - 3)}</span>
            <p className="is-size-5">{Math.round(item.main.temp)} °C</p>
            <img
              height="70"
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
              style={{ aspectRatio: "1/1", width: 60, maxWidth: "unset" }}
              alt={item.weather[0].main}
            />
          </div>
        ))}
    </div>
  )
}

export default Chart
