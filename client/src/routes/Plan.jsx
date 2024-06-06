import { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import styles from "./Plan.module.scss";
import { Button, Input } from "@/components";
import {
  getNewPlan,
  getPlanById,
  putPlan,
  deletePlanApi,
  putFavouritePlan,
  getPlanFavourite,
  putSharedPlan,
  getPlanSharedTo,
} from "@/utils/api";
import { useAuthContext } from "@/utils/AuthContext";
import { round } from "../../../shared/round";
import { ores } from "../../../shared/ores";

const LeftSidePanel = ({
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
  isSharedToUser,
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
    (!isNewPlan && loggedInUsername !== creator && !isSharedToUser) ||
    !(
      originalPlan.name !== inputName ||
      originalPlan.description !== description ||
      originalPlan.isPublic !== isPublic ||
      originalPlan.plan !== JSON.stringify(plan)
    );

  return (
    <aside className={styles.sidePanel}>
      <>
        <Input
          size="large"
          type="text"
          placeholder="Plan name"
          value={inputName}
          setValue={setInputName}
          disabled={
            !isNewPlan && creator !== loggedInUsername && !isSharedToUser
          }
        />
        <div>
          <label>Description</label>
          <textarea
            rows="5"
            cols="27"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={
              !isNewPlan && creator !== loggedInUsername && !isSharedToUser
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
              !isNewPlan && creator !== loggedInUsername && !isSharedToUser
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
              !isNewPlan && creator !== loggedInUsername && !isSharedToUser
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
              !(loggedInUsername === creator || isSharedToUser)
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

const PlanSection = ({
  plan,
  layer,
  updatePlan,
  path = [],
  creator,
  isNewPlan,
  isSharedToUser,
}) => {
  const { loggedInUsername } = useAuthContext();

  const layerColor = `layer${layer}`;

  const onChange = async (e) => {
    const recipe = e.target.value;
    if (recipe !== plan.recipe) {
      const response = await fetch(
        `/api/plan/new/${plan.item}/${recipe}?amount=${plan.amount}`
      );
      const newPlan = await response.json();
      updatePlan(path, newPlan);
    }
  };

  return (
    <section className={`${styles.planSection} ${styles[layerColor]}`}>
      <div>{plan.item}</div>
      {plan.recipe && (
        <div>
          Recipe:
          {isNewPlan || creator === loggedInUsername || isSharedToUser ? (
            <select value={plan.recipe} onChange={onChange}>
              <option value={plan.recipe}>{plan.recipe}</option>
              {plan.alternateRecipes.map((alternateRecipe, index) => (
                <option value={alternateRecipe} key={index}>
                  {alternateRecipe}
                </option>
              ))}
            </select>
          ) : (
            " " + plan.recipe
          )}
        </div>
      )}
      {plan.buildingCount && (
        <div>
          Buildings: {round(plan.buildingCount, 4)} {plan.producedIn}
        </div>
      )}
      <div>Amount: {round(plan.amount, 4)}/min</div>
      <div className={styles.ingredients}>
        {plan.ingredients?.map((ingredient, index) => (
          <PlanSection
            plan={ingredient}
            layer={layer % 10 === 0 ? 1 : layer + 1}
            updatePlan={updatePlan}
            path={[...path, ingredient.item]}
            key={`${plan.recipe}-${ingredient.item}-${index}`}
            creator={creator}
            isNewPlan={isNewPlan}
            isSharedToUser={isSharedToUser}
          />
        ))}
      </div>
    </section>
  );
};

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

const updatePlanAmounts = async (plan, amount) => {
  if (plan.ingredients) {
    for (const ingredient of plan.ingredients) {
      updatePlanAmounts(ingredient, (ingredient.amount / plan.amount) * amount);
    }
  }
  if (plan.buildingCount) {
    plan.buildingCount = round((plan.buildingCount / plan.amount) * amount, 5);
  }
  plan.amount = round(amount, 5);
};

const RightSidePanel = ({ plan }) => {
  const [totalOres, setTotalOres] = useState({});
  const [allProducts, setAllProducts] = useState({});
  const [totalBuildings, setTotalBuildings] = useState({});

  useEffect(() => {
    const totalAmounts = findTotalAmounts(plan);

    const preTotalOres = {};
    const preAllProducts = {};

    setTotalBuildings(totalAmounts.buildings);

    for (const [item, { amount, count }] of Object.entries(
      totalAmounts.items
    )) {
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
              {building}: {round(amount, 4)}/min
            </li>
          ))}
      </ul>
    </aside>
  );
};

const ShareModal = ({
  isShareModalShow,
  setIsShareModalShow,
  planId,
  creator,
}) => {
  const { loggedInUsername, setIsLoginModalShow, setLoginModalMessage } =
    useAuthContext();

  const [isError, setIsError] = useState(false);
  const [inputAccount, setInputAccount] = useState("");
  const [shareError, setShareError] = useState("");
  const [sharedTo, setSharedTo] = useState([]);
  const modalRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        setSharedTo(await getPlanSharedTo(planId));
      } catch (error) {
        setIsLoginModalShow(true);
        setLoginModalMessage(error.message);
      }
    })();
    document.addEventListener("keydown", onEscapeKeyDown);
    return () => document.removeEventListener("keydown", onEscapeKeyDown);
  }, []);

  const sharePlan = async () => {
    if (inputAccount === creator) {
      setIsError(true);
      setShareError("Can't share to creator of plan");
      return;
    }
    try {
      await putSharedPlan(planId, inputAccount);
      isError && setIsError(false);
      setSharedTo(await getPlanSharedTo(planId));
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const removeShare = async (usernameToRemove) => {
    try {
      await putSharedPlan(planId, usernameToRemove);
      setSharedTo(sharedTo.filter((username) => username !== usernameToRemove));
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const hide = () => {
    modalRef.current.close();
    setIsShareModalShow(false);
    setInputAccount("");
  };

  const onEscapeKeyDown = (event) => event.key === "Escape" && hide();

  if (isShareModalShow && !modalRef.current.open) {
    modalRef.current.showModal();
  }

  return (
    <dialog ref={modalRef} open={false} className={styles.shareModal}>
      <div>
        {isError && <p className={styles.error}>{shareError}</p>}
        <Input
          type="text"
          placeholder="Username"
          size={"large"}
          value={inputAccount}
          setValue={setInputAccount}
        />
        <Button size={"small"} color={"tertiary"} onClick={sharePlan}>
          Share
        </Button>
        {sharedTo?.map((username, index) => (
          <div key={index} className={styles.sharedTo}>
            {username}
            <Button
              size={"small"}
              color={"red"}
              onClick={() => removeShare(username)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button size="small" color="tertiary" onClick={hide}>
          Close
        </Button>
      </div>
    </dialog>
  );
};

export const Plan = () => {
  const { loggedInUsername, setIsLoginModalShow, setLoginModalMessage } =
    useAuthContext();

  const [plan, setPlan] = useState();
  const [planId, setPlanId] = useState(uuidv4());
  const [inputName, setInputName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creator, setCreator] = useState("");
  const [isShareModalShow, setIsShareModalShow] = useState(false);
  const [isPlanFavourited, setIsPlanFavourited] = useState(false);
  const [originalPlan, setOriginalPlan] = useState({});
  const [isSharedToUser, setIsSharedToUser] = useState(false);

  const fetchPlan = (product, amount) => {
    (async () => {
      if (!plan || product !== plan.item) {
        const newPlan = await getNewPlan(product, amount);
        setPlan(newPlan);
      } else {
        const newPlan = { ...plan };
        updatePlanAmounts(newPlan, amount);
        setPlan(newPlan);
      }
    })();
  };

  const { state } = useLocation();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setPlanId(id);
      (async () => {
        try {
          const { name, description, isPublic, creator, plan, sharedPlan } =
            await getPlanById(id);
          setPlan(plan);
          setInputName(name);
          setDescription(description);
          setIsPublic(isPublic);
          setCreator(creator);
          setIsSharedToUser(sharedPlan);
          setOriginalPlan({
            plan: JSON.stringify(plan),
            name,
            description,
            isPublic,
          });

          if (loggedInUsername) {
            const result = await getPlanFavourite(id);
            result?.favourite && setIsPlanFavourited(result.favourite);
          }
        } catch (error) {
          setIsLoginModalShow(true);
          setLoginModalMessage(error.message);
        }
      })();
    } else if (state) {
      if (state.plan) {
        setPlan(state.plan);
      } else {
        fetchPlan(state.inputProduct, state.inputAmount);
      }
    }
  }, [loggedInUsername]);

  if (!state && !id) {
    return <Navigate to="/" replace />;
  }

  const updatePlan = (path, newNode, parent = null) => {
    const node = parent ?? { ...plan };

    if (path.length) {
      const nextStep = path.shift();
      for (const [index, child] of node.ingredients.entries()) {
        if (child.item === nextStep) {
          if (!path.length) {
            node.ingredients[index] = newNode;
          } else {
            updatePlan(path, newNode, child);
          }

          if (!parent) {
            setPlan(node);
            break;
          } else {
            return;
          }
        }
      }
    } else {
      setPlan(newNode);
    }
  };

  const savePlan = async () => {
    try {
      await putPlan(
        plan,
        loggedInUsername,
        planId,
        inputName,
        description,
        isPublic
      );
      !isSharedToUser && setCreator(loggedInUsername);
      setOriginalPlan({
        plan: JSON.stringify(plan),
        name: inputName,
        description,
        isPublic,
      });
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const deletePlan = async () => {
    try {
      await deletePlanApi(planId);
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const favouritePlan = async () => {
    try {
      await putFavouritePlan(planId);
      setIsPlanFavourited(isPlanFavourited ? false : true);
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  return (
    <main className={styles.plan}>
      {plan && (
        <LeftSidePanel
          fetchPlan={fetchPlan}
          plan={plan}
          isNewPlan={!id}
          inputName={inputName}
          setInputName={setInputName}
          description={description}
          setDescription={setDescription}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          creator={creator}
          savePlan={savePlan}
          deletePlan={deletePlan}
          favouritePlan={favouritePlan}
          setIsShareModalShow={setIsShareModalShow}
          isSharedToUser={isSharedToUser}
          isPlanFavourited={isPlanFavourited}
          originalPlan={originalPlan}
        />
      )}
      <div className={styles.planView}>
        {plan && (
          <PlanSection
            plan={plan}
            layer={1}
            updatePlan={updatePlan}
            creator={creator}
            isNewPlan={!id}
            isSharedToUser={isSharedToUser}
          />
        )}
      </div>
      {plan && <RightSidePanel plan={plan} />}
      {plan && loggedInUsername === creator && !isSharedToUser && (
        <ShareModal
          isShareModalShow={isShareModalShow}
          setIsShareModalShow={setIsShareModalShow}
          planId={planId}
          creator={creator}
        />
      )}
    </main>
  );
};
