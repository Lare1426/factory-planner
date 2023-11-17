import styles from "./Input.module.scss";

export const Input = ({
  size,
  type,
  placeholder,
  min,
  max,
  setValue,
  value,
}) => {
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
    <input
      className={classNames}
      type={type}
      placeholder={placeholder}
      min={min}
      max={max}
      value={value}
      onChange={onInputChange}
    />
  );
};
