import styles from "./Button.module.scss";

export default function Button({
  children,
  size,
  color,
  shadow,
  onClick,
  disabled = false,
}) {
  let classNames = styles.customButton;

  if (["small", "large"].includes(size)) {
    classNames += ` ${styles[size]}`;
  }

  if (["primary", "tertiary", "red"].includes(color)) {
    classNames += ` ${styles[`color-${color}`]}`;
  }

  if (shadow === "drop") {
    classNames += ` ${styles.dropShadow}`;
  }

  return (
    <button className={classNames} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
