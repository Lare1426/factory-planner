import { useEffect, useState } from "react";
import { round } from "../../../../shared/round";
import { ores } from "../../../../shared/ores";
import styles from "./RightSidePanel.module.scss";

const findTotalAmounts = (plan) => {
  const totalAmounts = {
    items: {
      [plan.item]: {
        amount: plan.amount,
        count: 1,
      },
    },
    buildings: {},
  };

  if (plan.producedIn) {
    totalAmounts.buildings[plan.producedIn] = plan.buildingCount;
  }

  if (plan.ingredients) {
    for (const ingredient of plan.ingredients) {
      const returnedTotalAmounts = findTotalAmounts(ingredient);

      for (const [item, { amount, count }] of Object.entries(
        returnedTotalAmounts.items
      )) {
        if (item in totalAmounts.items) {
          totalAmounts.items[item].amount += amount;
          totalAmounts.items[item].count += count;
        } else {
          totalAmounts.items[item] = {
            amount,
            count,
          };
        }
      }

      for (const [building, amount] of Object.entries(
        returnedTotalAmounts.buildings
      )) {
        if (building in totalAmounts.buildings) {
          totalAmounts.buildings[building] += amount;
        } else {
          totalAmounts.buildings[building] = amount;
        }
      }
    }
  }

  return totalAmounts;
};

export const RightSidePanel = ({ plan }) => {
  const [totalOres, setTotalOres] = useState({});
  const [allProducts, setAllProducts] = useState({});
  const [totalBuildings, setTotalBuildings] = useState({});

  useEffect(() => {
    const totalAmounts = findTotalAmounts(plan);

    const preTotalOres = {};
    const preAllProducts = {};

    setTotalBuildings(totalAmounts.buildings);

    for (const [item, { amount }] of Object.entries(totalAmounts.items)) {
      if (ores.includes(item)) {
        preTotalOres[item] = amount;
      } else {
        preAllProducts[item] = amount;
      }
    }

    setTotalOres(preTotalOres);
    setAllProducts(preAllProducts);
  }, [plan]);

  return (
    <aside className={styles.sidePanel}>
      <ul>
        <div className={styles.title}>Total ores:</div>
        {Object.entries(totalOres)
          .toSorted((a, b) => b[1] - a[1])
          .map(([ore, amount], index) => (
            <li key={`${ore}${index}`}>
              {ore}: {round(amount, 4)}/min
            </li>
          ))}
      </ul>
      <ul>
        <div className={styles.title}>Total products:</div>
        {Object.entries(allProducts)
          .toSorted((a, b) => b[1] - a[1])
          .map(([item, amount], index) => (
            <li key={`${item}${index}`}>
              {item}: {round(amount, 4)}/min
            </li>
          ))}
      </ul>
      <ul>
        <div className={styles.title}>Total buildings:</div>
        {Object.entries(totalBuildings)
          .toSorted((a, b) => b[1] - a[1])
          .map(([building, amount], index) => (
            <li key={`${building}${index}`}>
              {building}: {round(amount, 4)}
            </li>
          ))}
      </ul>
    </aside>
  );
};
