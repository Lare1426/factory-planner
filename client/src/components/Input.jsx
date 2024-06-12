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
  shadow,
  customList,
  disabled,
}) => {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);

  const isDatalistShown = list || (customList && isInputFocused);

  const onInputChange = (event) => {
    if (type === "file") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue(JSON.parse(e.target.result));
      };
      reader.readAsText(event.target.files[0]);
    } else {
      event.target.value.length < 31 && setValue(event.target.value);
    }
  };

  let classNames = `${styles.customInput} ${
    type === "file" && styles.fileInput
  }`;

  if (["small", "large"].includes(size)) {
    classNames += ` ${styles[size]}`;
  }

  if (type !== "text") {
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
        list={list}
        disabled={disabled}
        onChange={onInputChange}
        onFocus={() => {
          customList && setIsInputFocused(true);
        }}
        onBlur={async () => {
          await new Promise((r) => setTimeout(r, 100));
          setIsInputFocused(false);
        }}
        ref={inputRef}
        id={type === "file" ? "fileInput" : null}
      />
      {type === "file" && (
        <label
          htmlFor="fileInput"
          className={`primary-button-style ${styles.fileInputLabel} ${
            shadow === "drop" && styles.dropShadow
          }`}
        >
          Import
        </label>
      )}
      {isDatalistShown && customList && (
        <ul
          className={styles.customDataList}
          // styling is to position relative to input field
          style={{
            top: inputRef.current.getBoundingClientRect().y + 50,
            left: inputRef.current.getBoundingClientRect().x + 20,
          }}
        >
          {customList.includes(value) && (
            <li className={styles.selected}>{value}</li>
          )}
          {customList.map((item) => {
            if (
              item !== value &&
              (item.toLowerCase().includes(value.toLowerCase()) ||
                customList.includes(value))
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
