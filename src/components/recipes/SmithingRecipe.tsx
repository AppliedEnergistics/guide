import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { SmithingRecipeInfo } from "../../data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import ItemIcon from "../ItemIcon.tsx";

export interface SmithingRecipeProps {
  recipe: SmithingRecipeInfo;
}

function SmithingRecipe({ recipe }: SmithingRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon nolink id="minecraft:smithing_table" /> Smithing
        </div>
        <div className={css.ingredientsBoxShapeless3Col}>
          <RecipeIngredient itemIds={recipe.base} />
          <RecipeIngredient itemIds={recipe.addition} />
          <RecipeIngredient itemIds={recipe.template} />
        </div>
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default SmithingRecipe;
