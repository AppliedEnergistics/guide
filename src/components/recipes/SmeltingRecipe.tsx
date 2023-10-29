import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import smelt from "./smelt.png";
import RecipeArrow from "./RecipeArrow";
import { SmeltingRecipeInfo } from "../../build-data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import ItemIcon from "@component/guide-elements/ItemIcon.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";

export interface SmeltingRecipeProps extends CustomGuideElementProps {
  recipe: SmeltingRecipeInfo;
}

function SmeltingRecipe({ recipe, ...props }: SmeltingRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon {...props} nolink id="minecraft:furnace" /> Smelting
        </div>
        <div className={css.smeltingInputBox}>
          <RecipeIngredient {...props} itemIds={recipe.ingredient} />
          <div>
            <img className="item-icon" {...smelt} alt="fire" />
          </div>
        </div>
        <RecipeArrow />
        <RecipeIngredient {...props} itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default SmeltingRecipe;
