import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Book() {
  const { id } = useParams();
  const context = useOutletContext();
  const navigate = useNavigate();
  const [isButtonActive, setIsButtonActive] = useState(false);

  const sleep = (time) =>
    new Promise((resolve) => {
      setTimeout(resolve, time);
    });

  return (
    <>
      <h1>
        Book {id} {context.hello}
      </h1>
      <button
        disabled={isButtonActive}
        onClick={async () => {
          setIsButtonActive(true);
          await sleep(2000);
          navigate("../");
        }}
      >
        Back to books
      </button>
    </>
  );
}
