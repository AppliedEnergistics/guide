import RecipeIngredientGrid from "./RecipeIngredientGrid";
import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { TransformRecipeInfo, useGuide } from "../../data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import ItemIcon from "../ItemIcon.tsx";
import ErrorText from "../ErrorText.tsx";
import { useEffect, useState } from "react";

export interface TransformRecipeProps {
  recipe: TransformRecipeInfo;
}

/**
 * Cycles through the fluids that this recipe can be done in.
 */
function FluidTransformCircumstance({ fluids }: { fluids: string[] }) {
  const guide = useGuide();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (fluids.length > 1) {
      interval = window.setInterval(
        () => setCurrentIndex((idx) => (idx + 1) % fluids.length),
        1000
      );
    }

    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
      setCurrentIndex(0);
    };
  }, [fluids]);

  if (fluids.length == 0) {
    return <ErrorText>No fluids in transform recipe</ErrorText>;
  }

  const fluidInfo = guide.getFluidInfo(fluids[currentIndex % fluids.length]);

  return (
    <>
      <img
        className={css.fluidIcon}
        src={guide.baseUrl + "/" + fluidInfo.icon}
        alt=""
      />
      {" Throw in " + fluidInfo.displayName}
    </>
  );
}

function TransformRecipe({ recipe }: TransformRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          {recipe.circumstance.type === "explosion" && (
            <>
              <ItemIcon id="minecraft:tnt" />
              Explode
            </>
          )}
          {recipe.circumstance.type === "fluid" && (
            <FluidTransformCircumstance fluids={recipe.circumstance.fluids} />
          )}
        </div>
        <RecipeIngredientGrid
          ingredients={recipe.ingredients}
          shapeless={true}
        />
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default TransformRecipe;
