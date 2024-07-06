import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, EditAndShareModal } from "@/components";
import { useAuthContext } from "@/utils/AuthContext";
import {
  postToggleFavouritePlan,
  deletePlanApi,
  getProducts,
  getPlanById,
  postPlan,
  putPlan,
} from "@/utils/api";
import styles from "./LeftSidePanel.module.scss";

export const LeftSidePanel = ({
  fetchPlan,
  idParam,
  plan,
  setPlan,
  isNewPlan,
  hasEditAccess,
  setHasEditAccess,
  setErrorMessage,
}) => {
  const {
    isLoggedIn,
    loggedInUsername,
    setIsLoginModalShow,
    setLoginModalMessage,
  } = useAuthContext();

  const [planId, setPlanId] = useState("");
  const [inputName, setInputName] = useState("");
  const [description, setDescription] = useState("");
  const [inputProduct, setInputProduct] = useState("");
  const [inputAmount, setInputAmount] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [creator, setCreator] = useState("");
  const [products, setProducts] = useState([]);
  const [stringifiedPlan, setStringifiedPlan] = useState();
  const [isShareModalShow, setIsShareModalShow] = useState(false);
  const [isPlanFavourited, setIsPlanFavourited] = useState(false);
  const [originalPlan, setOriginalPlan] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setProducts(await getProducts());
    })();
  }, []);

  useEffect(() => {
    if (idParam) {
      (async () => {
        try {
          const {
            name,
            description,
            isPublic,
            creator,
            plan,
            hasEditAccess,
            isFavourite,
          } = await getPlanById(idParam);
          setPlanId(idParam);
          setPlan(plan);
          setInputName(name);
          setDescription(description);
          setIsPublic(isPublic);
          setCreator(creator);
          setHasEditAccess(hasEditAccess);
          setIsPlanFavourited(isFavourite);
          setOriginalPlan({
            plan: JSON.stringify(plan),
            name,
            description,
            isPublic,
          });
        } catch (error) {
          if (error.status === 403 || error.status === 401) {
            setIsLoginModalShow(true);
            setLoginModalMessage(error.message);
          } else {
            setErrorMessage(error.message);
          }
        }
      })();
    }
  }, [loggedInUsername]);

  useEffect(() => {
    if (plan) {
      setStringifiedPlan(JSON.stringify(plan));
      setInputProduct(plan.item);
      setInputAmount(plan.amount);
    }
  }, [plan]);

  const savePlan = async () => {
    try {
      if (!planId) {
        const { planId } = await postPlan(
          plan,
          inputName,
          description,
          isPublic
        );
        setPlanId(planId);
        !creator && setCreator(loggedInUsername);
        setHasEditAccess(true);
        navigate(`/plan/${planId}`, { replace: true });
      } else {
        await putPlan(plan, planId, inputName, description, isPublic);
      }
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

  const favouritePlan = async () => {
    try {
      await postToggleFavouritePlan(planId);
      setIsPlanFavourited(!isPlanFavourited);
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const deletePlan = async () => {
    try {
      await deletePlanApi(planId);
      navigate("/");
    } catch (error) {
      setIsLoginModalShow(true);
      setLoginModalMessage(error.message);
    }
  };

  const isApplyDisabled = !(
    plan &&
    (inputProduct !== plan.item || inputAmount !== plan.amount) &&
    inputAmount > 0 &&
    inputAmount < 50001 &&
    products.includes(inputProduct)
  );

  const isSaveDisabled =
    !isLoggedIn ||
    (!isNewPlan && !hasEditAccess) ||
    !inputName ||
    !(
      originalPlan.name !== inputName ||
      originalPlan.description !== description ||
      originalPlan.isPublic !== isPublic ||
      originalPlan.plan !== stringifiedPlan
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
            disabled={!isNewPlan && !hasEditAccess}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            rows="5"
            cols="27"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isNewPlan && !hasEditAccess}
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
            disabled={!isNewPlan && !hasEditAccess}
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
            disabled={!isNewPlan && !hasEditAccess}
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
              new Blob([stringifiedPlan], {
                type: "application/json",
              })
            )}
            download={`${plan?.item}.json`}
            onClick={() => {}}
            className={`primary-button-style ${styles.exportLink} ${
              plan ? "" : styles.disabled
            }`}
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
      {plan && loggedInUsername === creator && (
        <EditAndShareModal
          isModalShow={isShareModalShow}
          setIsModalShow={setIsShareModalShow}
          plan={{ id: planId, creator }}
          share={true}
        />
      )}
    </aside>
  );
};
