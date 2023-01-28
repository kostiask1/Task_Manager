import { FC } from 'react';
import "./Switcher.scss";

interface IProps {
  checked: boolean,
  onChange: (value: boolean) => void
}

const Switcher: FC<IProps> = ({ checked, onChange }) => {
  return (
    <>
      <input
        checked={checked}
        onChange={() => onChange(!checked)}
        className="switch-checkbox"
        id={`switch`}
        type="checkbox"
      />
      <label
        className="switch-label"
        htmlFor={`switch`}
      >
        <span className={`switch-button`} />
      </label>
    </>
  );
};

export default Switcher;
