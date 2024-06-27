import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useParams,
  useNavigate,
} from "react-router-dom";
import styles from "./Plan.module.scss";
import { getNewPlan, getPlanById, postPlan, putPlan } from "@/utils/api";
import { useAuthContext } from "@/utils/AuthContext";
import { Button } from "@/components";
import { round } from "../../../../shared/round";
import { LeftSidePanel } from "./LeftSidePanel";
import { RightSidePanel } from "./RightSidePanel";
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
  const [planCopy, setPlanCopy] = useState();
  const [planId, setPlanId] = useState("");
  const [inputName, setInputName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [creator, setCreator] = useState("");
  const [originalPlan, setOriginalPlan] = useState({});
  const [hasEditAccess, setHasEditAccess] = useState(false);
  const [isPlanFavourited, setIsPlanFavourited] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

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
          } = await getPlanById(id);
          setPlanId(id);
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
          if (error.status === 404) {
            setErrorMessage(error.message);
          } else {
            setIsLoginModalShow(true);
            setLoginModalMessage(error.message);
          }
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

  useEffect(() => {
    setPlanCopy({ ...plan });
  }, [plan]);

  if (!state && !id) {
    return <Navigate to="/" replace />;
  }

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

  return (
    <>
      {errorMessage && (
        <main className={styles.error}>
          <h2 className={styles.message}>{errorMessage}</h2>
          <Button
            size={"large"}
            color={"primary"}
            onClick={() => navigate("/")}
          >
            Return home
          </Button>
        </main>
      )}
      <main className={styles.plan}>
        {plan && (
          <>
            <LeftSidePanel
              fetchPlan={fetchPlan}
              plan={plan}
              planId={planId}
              isNewPlan={!id}
              inputName={inputName}
              setInputName={setInputName}
              description={description}
              setDescription={setDescription}
              isPublic={isPublic}
              setIsPublic={setIsPublic}
              creator={creator}
              savePlan={savePlan}
              hasEditAccess={hasEditAccess}
              originalPlan={originalPlan}
              isPlanFavourited={isPlanFavourited}
              setIsPlanFavourited={setIsPlanFavourited}
            />
            <div className={styles.planView}>
              <PlanSection
                fullPlanCopy={planCopy}
                plan={planCopy}
                setPlan={setPlan}
                layer={1}
                isNewPlan={!id}
                hasEditAccess={hasEditAccess}
              />
            </div>
            <RightSidePanel plan={plan} />
          </>
        )}
      </main>
    </>
  );
};
