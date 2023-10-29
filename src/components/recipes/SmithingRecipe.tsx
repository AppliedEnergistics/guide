import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { SmithingRecipeInfo } from "../../build-data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import ItemIcon from "@component/guide-elements/ItemIcon.tsx";

export interface SmithingRecipeProps extends CustomGuideElementProps {
  recipe: SmithingRecipeInfo;
}

function SmithingRecipe({ recipe, ...props }: SmithingRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon {...props} nolink id="minecraft:smithing_table" /> Smithing
        </div>
        <div className={css.ingredientsBoxShapeless3Col}>
          <RecipeIngredient {...props} itemIds={recipe.base} />
          <RecipeIngredient {...props} itemIds={recipe.addition} />
          <RecipeIngredient {...props} itemIds={recipe.template} />
        </div>
        <RecipeArrow />
        <RecipeIngredient {...props} itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default SmithingRecipe;
