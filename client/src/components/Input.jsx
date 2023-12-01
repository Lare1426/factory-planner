import { useState, useRef } from "react";
import styles from "./Input.module.scss";

export const Input = ({
  size,
  type,
  placeholder,
  min,
  max,
  setValue,
  value,
  list,
}) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);

  const isDatalistShown = list && isInputFocused;

  const onInputChange = (event) => {
    setValue(event.target.value);
  };

  let classNames = styles.customInput;

  if (["small", "large"].includes(size)) {
    classNames += ` ${styles[size]}`;
  }

  if (type === "text") {
    min = null;
    max = null;
  }

  return (
    <>
      <input
        className={classNames}
        type={type}
        placeholder={placeholder}
        min={min}
        max={max}
        value={value}
        onChange={onInputChange}
        onFocus={() => {
          setIsInputFocused(true);
        }}
        onBlur={async () => {
          await new Promise((r) => setTimeout(r, 100));
          setIsInputFocused(false);
        }}
        ref={inputRef}
      />
      {isDatalistShown && (
        // styling is to position relative to input field
        <ul style={{ top: inputRef.current.getBoundingClientRect().y + 30 }}>
          {list.includes(value) && <li className={styles.selected}>{value}</li>}
          {list.map((item) => {
            if (
              item !== value &&
              (item.toLowerCase().includes(value.toLowerCase()) ||
                list.includes(value))
            ) {
              return (
                <li
                  key={item}
                  onClick={() => {
                    setValue(item);
                  }}
                >
                  {item}
                </li>
              );
            }
          })}
        </ul>
      )}
    </>
  );
};
