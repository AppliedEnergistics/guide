import InscriberRecipe from "./InscriberRecipe";
import css from "./recipe.module.css";
import { useGuide } from "../../Guide.ts";

function InscriberRecipes() {
  const guide = useGuide();
  return (
    <div className={css.recipeContainer}>
      {Object.values(guide.inscriberRecipes).map((recipe) => (
        <InscriberRecipe key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

export default InscriberRecipes;
