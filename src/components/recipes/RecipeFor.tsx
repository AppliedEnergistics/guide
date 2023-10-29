import css from "./recipe.module.css";
import ErrorText from "../ErrorText.tsx";
import Recipe from "./Recipe.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";

export interface RecipeForProps extends CustomGuideElementProps {
  /**
   * Item ID
   */
  id: string;
}

function RecipeFor({ id, ...props }: RecipeForProps) {
  id = props.guide.resolveId(id);

  const recipes = props.guide.getRecipesForItem(id);

  if (recipes.length == 0) {
    return <ErrorText>No recipes for {id}</ErrorText>;
  }

  return (
    <div className={css.recipeContainer}>
      {recipes.map((recipe) => (
        <Recipe key={recipe.id} recipe={recipe} {...props} />
      ))}
    </div>
  );
}

export default RecipeFor;
