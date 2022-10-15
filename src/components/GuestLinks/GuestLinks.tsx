import { NavLink } from "react-router-dom";
import { FC } from 'react';

interface IProps {
  uid: string | undefined
}

const GuestLinks: FC<IProps> = ({uid}) => {
  return uid ? (
    <div className="columns">
      <div className="column">
        <NavLink style={{width: "100%"}} className={({isActive}) => isActive ? "button is-success" : "button"} to={`/tasks/${uid}`}>Tasks</NavLink>
      </div>
      <div className="column">
        <NavLink style={{width: "100%"}} className={({isActive}) => isActive ? "button is-success" : "button"} to={`/calendar/${uid}`}>Calendar</NavLink>
      </div>
      <div className="column">
        <NavLink style={{width: "100%"}} className={({isActive}) => isActive ? "button is-success" : "button"} to={`/wishes/${uid}`}>Wishes</NavLink>
      </div>
    </div>
  ) : null;
};

export default GuestLinks;
