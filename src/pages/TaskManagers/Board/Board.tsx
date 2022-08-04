import List from "../List"
import "./Board.scss"
import TaskForm from "../TaskForm/"

const Board = () => {
  return (
    <>
      <div className="section is-medium pt-2">
        <TaskForm />
        <hr />
        <List />
      </div>
    </>
  )
}

export default Board
