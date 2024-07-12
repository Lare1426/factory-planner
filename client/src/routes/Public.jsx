import { useState } from "react";
import { Input, Button } from "@/components";
import styles from "./Public.module.scss";
import { getSearch } from "@/utils/api";

export const Public = () => {
  const [searchValue, setSearchValue] = useState("");
  const [orderingValue, setOrderingValue] = useState("creationDate");
  const [orderDirection, setOrderDirection] = useState("ASC");

  const searchPlan = async () => {
    const plans = await getSearch(searchValue, orderingValue, orderDirection);
  };

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
            <option value="creationDate">Creation date</option>
            <option value="name">Plan name</option>
            <option value="product">Final product</option>
          </select>
          <select
            value={orderDirection}
            onChange={(e) => setOrderDirection(e.target.value)}
          >
            <option value="ASC">Ascending</option>
            <option value="DESC">Descending</option>
          </select>
        </div>
        <Button size="medium" color="primary" onClick={searchPlan}>
          Search
        </Button>
      </div>
    </main>
  );
};
