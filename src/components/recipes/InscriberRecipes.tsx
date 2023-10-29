import InscriberRecipe from "./InscriberRecipe";
import css from "./recipe.module.css";
import { RecipeType } from "../../build-data/Guide.ts";
import { useMemo } from "react";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";

function InscriberRecipes(props: CustomGuideElementProps) {
  const recipes = useMemo(
    () => props.guide.getRecipesByType(RecipeType.InscriberRecipeType),
    [props.guide],
  );
  return (
    <div className={css.recipeContainer}>
      {recipes.map((recipe) => (
        <InscriberRecipe key={recipe.id} recipe={recipe} {...props} />
      ))}
    </div>
  );
}

export default InscriberRecipes;
