import { useEffect, useState } from "react";
import { Button, Input } from "@/components";
import { useAuthContext } from "@/utils/AuthContext";
import styles from "./LeftSidePanel.module.scss";

export const LeftSidePanel = ({
  fetchPlan,
  plan,
  isNewPlan,
  inputName,
  setInputName,
  description,
  setDescription,
  isPublic,
  setIsPublic,
  creator,
  savePlan,
  deletePlan,
  favouritePlan,
  setIsShareModalShow,
  hasEditAccess,
  isPlanFavourited,
  originalPlan,
}) => {
  const { isLoggedIn, loggedInUsername } = useAuthContext();

  const [inputProduct, setInputProduct] = useState(plan.item);
  const [inputAmount, setInputAmount] = useState(plan.amount);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/products");
      setProducts(await response.json());
    })();
  }, []);

  const isApplyDisabled = !(
    (inputProduct !== plan.item || inputAmount !== plan.amount) &&
    inputAmount > 0 &&
    inputAmount < 50001 &&
    products.includes(inputProduct)
  );

  const isSaveDisabled =
    !isLoggedIn ||
    (!isNewPlan && loggedInUsername !== creator && !hasEditAccess) ||
    !(
      originalPlan.name !== inputName ||
      originalPlan.description !== description ||
      originalPlan.isPublic !== isPublic ||
      originalPlan.plan !== JSON.stringify(plan)
    );

  return (
    <aside className={styles.sidePanel}>
      <>
        <div>
          <Input
            size="large"
            type="text"
            placeholder="Plan name"
            value={inputName}
            setValue={setInputName}
            characterLimit={30}
            disabled={
              !isNewPlan && creator !== loggedInUsername && !hasEditAccess
            }
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            rows="5"
            cols="27"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={
              !isNewPlan && creator !== loggedInUsername && !hasEditAccess
            }
          ></textarea>
        </div>
        <div>
          <label>Product</label>
          <Input
            size="large"
            type="text"
            value={inputProduct}
            setValue={setInputProduct}
            customList={products}
            disabled={
              !isNewPlan && creator !== loggedInUsername && !hasEditAccess
            }
          />
        </div>
        <div>
          <label>Production amount</label>
          <Input
            size="small"
            type="number"
            placeholder="0"
            min={1}
            max={50000}
            value={inputAmount}
            setValue={(value) => {
              setInputAmount(parseInt(value));
            }}
            disabled={
              !isNewPlan && creator !== loggedInUsername && !hasEditAccess
            }
          />
        </div>
        <div>
          {isNewPlan || loggedInUsername === creator ? (
            <span>
              <label className={styles.inline}>Public</label>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            </span>
          ) : (
            <label>Creator: {creator}</label>
          )}
        </div>
        <div className={styles.buttons}>
          <Button
            size="small"
            color="primary"
            disabled={isApplyDisabled}
            onClick={() => {
              fetchPlan(inputProduct, inputAmount);
            }}
          >
            Apply
          </Button>
          <a
            href={URL.createObjectURL(
              new Blob([JSON.stringify(plan)], {
                type: "application/json",
              })
            )}
            download={`${plan.item}.json`}
            onClick={() => {}}
            className={`primary-button-style ${styles.exportLink}`}
          >
            Export
          </a>
          <Button
            size="small"
            color="primary"
            onClick={savePlan}
            disabled={isSaveDisabled}
          >
            Save
          </Button>
          <Button
            size="small"
            color="primary"
            disabled={
              isNewPlan ||
              !isLoggedIn ||
              !(loggedInUsername === creator || hasEditAccess)
            }
            onClick={favouritePlan}
          >
            {isPlanFavourited ? "Unfavourite" : "Favourite"}
          </Button>
          <Button
            size="small"
            color="primary"
            disabled={isNewPlan || loggedInUsername !== creator}
            onClick={() => setIsShareModalShow(true)}
          >
            Share
          </Button>
          <Button
            size="small"
            color="red"
            disabled={isNewPlan || loggedInUsername !== creator}
            onClick={deletePlan}
          >
            Delete
          </Button>
        </div>
      </>
    </aside>
  );
};
