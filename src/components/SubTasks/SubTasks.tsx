
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../store/store';
import { setTask } from '../../store/Task/slice';
import { Subtask, Task } from "../../store/Task/types";
import Button from '../UI/Button';
import "./Subtasks.scss";

interface Props {
  task: Task
  setModal?: undefined | Function
  update?: (data: Subtask[]) => void
  edit?: undefined | Function
  editable?: boolean
  type: "show" | "edit" | "create"
}

const SubTasks = ({ task, editable, type, setModal,
  update, edit }: Props) => {
  const dispatch = useAppDispatch()
  const [data, setData] = useState(task.subtasks)

  const isShow = type === "show"
  const isEdit = type === "edit"
  const isCreate = type === "create"

  const toggleCompleted = (subtask: Subtask) => {
    const copy = { ...subtask }
    const subtasksCopy = [...data]
    const index = data.findIndex(
      (task: Subtask) => task.text === copy.text
    )
    copy.completed = !copy.completed
    subtasksCopy[index] = copy
    setData(subtasksCopy)

  }

  useEffect(() => { saveTask() }, [data])

  const saveTask = async () => {
    if (editable) {
      const saveTask: Task = { ...task }
      saveTask.subtasks = data
      if (isShow) {
        await dispatch(setTask(saveTask))
        setModal && setModal(saveTask)
      } else {
        update && update(data)
      }
    }
  }

  const removeSubtask = (subtask: Subtask) => {
    if (editable) {
      const copy = { ...subtask }
      const subtasksCopy = [...data]
      const index = subtasksCopy.findIndex(
        (task: Subtask) => task.text === copy.text
      )
      subtasksCopy.splice(index, 1)
      setData(subtasksCopy)
    }
  }

  const setEdit = (e: React.MouseEvent<HTMLButtonElement>, data: Subtask) => {
    e.preventDefault()
    if (edit && editable) {
      edit(data.text)
      removeSubtask(data)
    }
  }

  return (
    <ul>
      {data.map((data, index) => (
        <li
          key={data.text + index}>
          <div className="btns-wrap">
            <input
              type="checkbox"
              className="checkbox"
              id={"checkbox-" + data.text}
              checked={data.completed}
              onChange={() => toggleCompleted(data)}
              disabled={!editable}
            />
            <Button
              className="danger is-small"
              style={{ height: 16, padding: "0px 4px" }}
              onClick={() => removeSubtask(data)}
              disabled={!editable}
              text="x"
            />
          </div>
          <label className="subtask-text" htmlFor={"checkbox-" + data.text}>
            {data.text}
          </label>
          {(isEdit || isCreate) && edit && editable && (
            <Button
              className="info is-small"
              style={{ height: 16, padding: "0px 4px" }}
              onClick={(e) => setEdit(e, data)}
              text="edit"
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default SubTasks;
