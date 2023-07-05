import RecipeIngredientGrid from "./RecipeIngredientGrid";
import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { CraftingRecipeInfo, useGuide } from "../../data/Guide.ts";
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
        <div title={resultItem.displayName}>
          Crafting {recipe.shapeless ? " (Shapeless)" : null}
        </div>
        <RecipeIngredientGrid {...recipe} />
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default CraftingRecipe;
