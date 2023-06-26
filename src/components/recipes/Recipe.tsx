import CraftingRecipe from "./CraftingRecipe";
import InscriberRecipe from "./InscriberRecipe";
import SmeltingRecipe from "./SmeltingRecipe";
import css from "./recipe.module.css";
import { useGuide } from "../../data/Guide.ts";
import ErrorText from "../ErrorText.tsx";

export interface RecipeProps {
  /**
   * Recipe ID
   */
  id: string;
}

function Recipe({ id }: RecipeProps) {
  const guide = useGuide();
  id = guide.resolveId(id);

  const recipe = guide.getRecipeById(id);

  if (!recipe) {
    return <ErrorText>Missing recipe {id}</ErrorText>;
  }

  return (
    <div className={css.recipeContainer}>
      {recipe.type === "crafting" && (
        <CraftingRecipe key={recipe.id} recipe={recipe} />
      )}
      {recipe.type === "inscriber" && (
        <InscriberRecipe key={recipe.id} recipe={recipe} />
      )}
      {recipe.type === "smelting" && (
        <SmeltingRecipe key={recipe.id} recipe={recipe} />
      )}
    </div>
  );
}

export default Recipe;
