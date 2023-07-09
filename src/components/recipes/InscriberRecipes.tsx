import InscriberRecipe from "./InscriberRecipe";
import css from "./recipe.module.css";
import { RecipeType, useGuide } from "../../data/Guide.ts";
import { useMemo } from "react";

function InscriberRecipes() {
  const guide = useGuide();
  const recipes = useMemo(
    () => guide.getRecipesByType(RecipeType.InscriberRecipeType),
    [guide]
  );
  return (
    <div className={css.recipeContainer}>
      {recipes.map((recipe) => (
        <InscriberRecipe key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

export default InscriberRecipes;
