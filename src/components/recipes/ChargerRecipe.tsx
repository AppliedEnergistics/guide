import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { ChargerRecipeInfo } from "../../data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import ItemIcon from "../ItemIcon.tsx";

export interface ChargerRecipeProps {
  recipe: ChargerRecipeInfo;
}

function ChargerRecipe({ recipe }: ChargerRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon nolink id="charger" /> Charger
        </div>
        <RecipeIngredient itemIds={recipe.ingredient} />
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default ChargerRecipe;
