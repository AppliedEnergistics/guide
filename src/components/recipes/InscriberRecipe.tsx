import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { InscriberRecipeInfo, useGuide } from "../../data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";

export interface InscriberRecipeProps {
  recipe: InscriberRecipeInfo;
}

function InscriberRecipe({ recipe }: InscriberRecipeProps) {
  const guide = useGuide();
  const resultItem = guide.getItemInfo(recipe.resultItem);

  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>{resultItem.displayName}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <RecipeIngredient itemIds={recipe.top} />
          <RecipeIngredient itemIds={recipe.middle} />
          <RecipeIngredient itemIds={recipe.bottom} />
        </div>
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default InscriberRecipe;
