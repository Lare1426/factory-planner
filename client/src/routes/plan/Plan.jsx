import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import styles from "./Plan.module.scss";
import {
  getNewPlan,
  getPlanById,
  putPlan,
  deletePlanApi,
  putFavouritePlan,
  getPlanFavourite,
} from "@/utils/api";
import { useAuthContext } from "@/utils/AuthContext";
import { round } from "../../../../shared/round";
import { LeftSidePanel } from "./LeftSidePanel";
import { RightSidePanel } from "./RightSidePanel";
import { ShareModal } from "./ShareModal";
import { PlanSection } from "./PlanSection";

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
          const { name, description, isPublic, creator, plan, isSharedTo } =
            await getPlanById(id);
          setPlan(plan);
          setInputName(name);
          setDescription(description);
          setIsPublic(isPublic);
          setCreator(creator);
          setIsSharedToUser(isSharedTo);
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
