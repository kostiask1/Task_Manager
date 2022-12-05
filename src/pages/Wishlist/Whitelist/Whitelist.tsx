import { FC } from 'react';
import Button from "../../../components/UI/Button";
import { useAppDispatch } from "../../../store/store";
import { setWish } from "../../../store/Wish/slice";
import {
  Whitelist as IWhitelist,
  Wish as IWish
} from "../../../store/Wish/types";
import User from '../../Users/User';
import "./Whitelist.scss";

interface Props {
  data: IWhitelist
  wish: IWish
  update?: (data: IWhitelist[]) => void
  editable: boolean
}

const Whitelist: FC<Props> = ({ data, wish, update, editable }) => {
  wish = JSON.parse(JSON.stringify(wish))
  let whitelistArray = JSON.parse(JSON.stringify(wish.whitelist))
  const dispatch = useAppDispatch()

  const removeUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (editable) {
      const copy = data
      const index = whitelistArray.findIndex(
        (wish: IWhitelist) => wish.id === copy.id
      )
      whitelistArray.splice(index, 1)
      if (update) {
        update(whitelistArray)
      } else {
        saveWish()
      }
    }
  }

  const saveWish = async () => {
    const saveWish: IWish = wish
    saveWish.whitelist = whitelistArray
    await dispatch(setWish(saveWish))
  }

  const toggleOpened = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (editable) {
      const copy = data
      const index = whitelistArray.findIndex(
        (wish: IWhitelist) => wish.id === copy.id
      )
      whitelistArray[index].open = !whitelistArray[index].open
      if (update) {
        update(whitelistArray)
      } else {
        saveWish()
      }
    }
  }
  return (
    <li>
      {editable && (
        <>
          <input
            type="checkbox"
            className="checkbox"
            id={"checkbox-" + data.id}
            checked={data.open}
            onChange={toggleOpened}
          />
          <Button
            className="is-danger is-small"
            style={{ height: 16, padding: "0px 4px" }}
            onClick={removeUser}
            text="x"
          />
        </>
      )}
      <User id={data.id} mode="mini" />
    </li>
  )
}

export default Whitelist
