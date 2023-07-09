import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { ChargerRecipeInfo, useGuide } from "../../data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import ItemIcon from "../ItemIcon.tsx";

export interface ChargerRecipeProps {
  recipe: ChargerRecipeInfo;
}

function ChargerRecipe({ recipe }: ChargerRecipeProps) {
  const guide = useGuide();
  const resultItem = guide.getItemInfo(recipe.resultItem);

  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon nolink id="charger" /> Charger: {resultItem.displayName}
        </div>
        <RecipeIngredient itemIds={recipe.ingredient} />
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default ChargerRecipe;
