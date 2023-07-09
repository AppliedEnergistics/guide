import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import smelt from "./smelt.png";
import RecipeArrow from "./RecipeArrow";
import { SmeltingRecipeInfo, useGuide } from "../../data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import ItemIcon from "../ItemIcon.tsx";

export interface SmeltingRecipeProps {
  recipe: SmeltingRecipeInfo;
}

function SmeltingRecipe({ recipe }: SmeltingRecipeProps) {
  const guide = useGuide();
  const resultItem = guide.getItemInfo(recipe.resultItem);

  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon nolink id="minecraft:furnace" /> Smelting:{" "}
          {resultItem.displayName}
        </div>
        <div className={css.smeltingInputBox}>
          <RecipeIngredient itemIds={recipe.ingredient} />
          <div className={css.ingredientBox}>
            <img className="item-icon" src={smelt} alt="fire" />
          </div>
        </div>
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default SmeltingRecipe;
