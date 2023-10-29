import RecipeIngredientGrid from "./RecipeIngredientGrid";
import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { CraftingRecipeInfo } from "../../build-data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import ItemIcon from "@component/guide-elements/ItemIcon.tsx";

export interface CraftingRecipeProps extends CustomGuideElementProps {
  recipe: CraftingRecipeInfo;
}

function CraftingRecipe({ recipe, ...props }: CraftingRecipeProps) {
  const resultItem = props.guide.getItemInfo(recipe.resultItem);

  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div title={resultItem.displayName}>
          <ItemIcon {...props} nolink id="minecraft:crafting_table" />
          Crafting
          {recipe.shapeless ? " (Shapeless)" : null}
        </div>
        <RecipeIngredientGrid {...props} {...recipe} />
        <RecipeArrow />
        <RecipeIngredient {...props} itemIds={[recipe.resultItem]} />
      </div>
    </MinecraftFrame>
  );
}

export default CraftingRecipe;
