import RecipeIngredientGrid from "./RecipeIngredientGrid";
import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { CraftingRecipeInfo, useGuide } from "../../Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";

export interface CraftingRecipeProps {
  recipe: CraftingRecipeInfo;
}

function CraftingRecipe({ recipe }: CraftingRecipeProps) {
  const guide = useGuide();
  const resultItem = guide.getItemInfo(recipe.resultItem);

  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <strong>
          {resultItem.displayName} {recipe.shapeless ? " (Shapeless)" : null}
        </strong>
        <RecipeIngredientGrid {...recipe} />
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default CraftingRecipe;
