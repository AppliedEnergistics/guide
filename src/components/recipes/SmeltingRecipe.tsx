import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import smelt from "./smelt.png";
import RecipeArrow from "./RecipeArrow";
import { SmeltingRecipeInfo, useGuide } from "../../Guide.ts";

export interface SmeltingRecipeProps {
  recipe: SmeltingRecipeInfo;
}

function SmeltingRecipe({ recipe }: SmeltingRecipeProps) {
  const guide = useGuide();
  const resultItem = guide.getItemInfo(recipe.resultItem);

  return (
    <div className={css.recipeBoxLayout}>
      <strong>Smelting - {resultItem.displayName}</strong>
      <div className={css.smeltingInputBox}>
        <RecipeIngredient itemIds={recipe.ingredient} />
        <div className={css.ingredientBox}>
          <img className="item-icon" src={smelt} alt="fire" />
        </div>
      </div>
      <RecipeArrow />
      <RecipeIngredient itemIds={[recipe.resultItem]} />
    </div>
  );
}

export default SmeltingRecipe;
