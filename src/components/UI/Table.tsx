import { equal, tableActions } from '../../helpers';
import Button from './Button';
import { useState } from 'react';

type IHeader = {
  title: string | number;
  data?: string;
  sorting?: boolean;
} | {
  element: React.ReactElement;
  data: string;
  sorting?: boolean;
}

type IFooter = {
  value: string | number;
} | {
  element: React.ReactElement;
}

export interface ITableProps<T = unknown> {
  columns: IHeader[],
  initData: T[],
  renderBody: (data: T) => React.ReactNode,
  footer?: (IFooter | string)[],
  loading?: boolean,
  fallback?: string
}

const Table: <T>(p: ITableProps<T>) => React.ReactElement = ({ columns, initData, renderBody, footer, loading, fallback }) => {
  const [data, setData] = useState(initData)
  const [sorting, setSorting] = useState("")
  const [sort, reset] = tableActions({
    data,
    setData,
    sorting,
    setSorting,
    initData: initData,
  })

  return <div className="table-container">
    <table className="table table-debts is-striped is-bordered is-hoverable is-fullwidth is-narrow">
      <thead>
        <tr>
          <th>
            <Button
              text="Reset"
              onClick={reset}
              className={
                !loading && (!equal(initData, data) || sorting)
                  ? "is-danger"
                  : ""
              }
              disabled={equal(initData, data) && !sorting}
            />
          </th>
          {columns.map(({ title, data, element, sorting = true }: any, index: number) => <th key={title + index} onClick={(e) => sorting && sort(e, data || title.toLowerCase())}>{element || title}</th>)}
        </tr>
      </thead>
      <tbody>
        {!!data?.length ? data.map((item, index) => <tr key={index}>{renderBody(item)}</tr>) : (
          <tr>
            <td colSpan={10}>{fallback || "No data to be displayed..."}</td>
          </tr>
        )}
      </tbody>
      {data?.length > 1 && footer?.length && (
        <tfoot>
          <tr>
            {footer.map(({ value = "", element }: any, index: number) => <th key={(value || 0) + index}>{element || value}</th>)}
          </tr>
        </tfoot>
      )}
    </table>
  </div>
}

export default Table