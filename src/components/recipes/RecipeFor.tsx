import css from "./recipe.module.css";
import { useGuide } from "../../data/Guide.ts";
import ErrorText from "../ErrorText.tsx";
import Recipe from "./Recipe.tsx";

export interface RecipeForProps {
  /**
   * Item ID
   */
  id: string;
}

function RecipeFor({ id }: RecipeForProps) {
  const guide = useGuide();
  id = guide.resolveId(id);

  const recipes = guide.getRecipesForItem(id);

  if (recipes.length == 0) {
    return <ErrorText>No recipes for {id}</ErrorText>;
  }

  return (
    <div className={css.recipeContainer}>
      {recipes.map((recipe) => (
        <Recipe key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

export default RecipeFor;
