import { useParams, useOutletContext } from "react-router-dom";

export default function Book() {
  const { id } = useParams();
  const context = useOutletContext();

  return (
    <h1>
      Book {id} {context.hello}
    </h1>
  );
}
