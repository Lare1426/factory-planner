import styles from "./TriangleSvg.module.scss";

export const TriangleSvg = ({ rotated }) => {
  return (
    <svg
      viewBox="0 0 70 80"
      xmlns="http://www.w3.org/2000/svg"
      width={"15"}
      height={"15"}
      className={`${styles.triangleSvg} ${rotated ? styles.rotated : ""}`}
    >
      <polygon points="0,0 69,40 0,80" fill="white" />
    </svg>
  );
};
