import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { InscriberRecipeInfo, useGuide } from "../../data/Guide.ts";

export interface InscriberRecipeProps {
  recipe: InscriberRecipeInfo;
}

function InscriberRecipe({ recipe }: InscriberRecipeProps) {
  const guide = useGuide();
  const resultItem = guide.getItemInfo(recipe.resultItem);

  return (
    <div className={css.recipeBoxLayout}>
      <strong>{resultItem.displayName}</strong>
      <RecipeArrow />
      <RecipeIngredient itemIds={[recipe.resultItem]} />
    </div>
  );
}

export default InscriberRecipe;
