import { useState } from "react";
import { Input } from "@/components";
import styles from "./Public.module.scss";

export const Public = () => {
  const [searchValue, setSearchValue] = useState("");
  const [orderingValue, setOrderingValue] = useState("Creation date");
  const [orderDirection, setOrderDirection] = useState("Ascending");

  return (
    <main className={styles.public}>
      <div className={styles.sidePanel}>
        <Input
          type="text"
          placeholder="Search"
          className={styles.search}
          size="large"
          setValue={setSearchValue}
          value={searchValue}
        />
        <div className={styles.orderBy}>
          Order by:
          <select
            value={orderingValue}
            onChange={(e) => setOrderingValue(e.target.value)}
          >
            <option value="Creation date">Creation date</option>
            <option value="Plan name">Plan name</option>
            <option value="Final product">Final product</option>
          </select>
          <select
            value={orderDirection}
            onChange={(e) => setOrderDirection(e.target.value)}
          >
            <option value="Ascending">Ascending</option>
            <option value="Descending">Descending</option>
          </select>
        </div>
      </div>
    </main>
  );
};
