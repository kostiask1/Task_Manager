import { equal } from '../../helpers';
import Button from './Button';

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
  data: T[],
  initData: T[],
  body: React.ReactElement[],
  footer?: (IFooter | string)[],
  loading: boolean,
  sorting: string,
  sort: (e: React.MouseEvent<HTMLElement>, key?: string) => void,
  reset: (e: React.MouseEvent<HTMLElement>, key?: string) => void,
  fallback?: string
}

const Table: <T>(p: ITableProps<T>) => React.ReactElement = ({ columns, data, initData, body, footer, loading, sorting, sort, reset, fallback }) => {
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
        {!!body?.length ? (
          body.map((element: any, index: number) => (
            <tr key={(element.id || 0) + index}>
              {element}
            </tr>
          ))
        ) : (
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