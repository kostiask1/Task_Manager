import { FC, useMemo, useRef } from "react"
import useDraggableScroll from "use-draggable-scroll"
import "./Chart.scss"

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
            <span>{item.dt_txt.slice(5, item.dt_txt.length - 3)}</span>
            <p>{Math.round(item.main.temp)} °C</p>
            <img
              height="60"
              src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
              style={{ aspectRatio: "1/1", width: "unset" }}
              alt={item.weather[0].main}
            />
          </div>
        ))}
    </div>
  )
}

export default Chart
