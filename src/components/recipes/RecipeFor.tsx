import CraftingRecipe from "./CraftingRecipe";
import InscriberRecipe from "./InscriberRecipe";
import SmeltingRecipe from "./SmeltingRecipe";
import css from "./recipe.module.css";
import { useGuide } from "../../Guide.ts";
import ErrorText from "../ErrorText.tsx";

export interface RecipeForProps {
  /**
   * Item ID
   */
  id: string;
}

function RecipeFor({ id }: RecipeForProps) {
  const guide = useGuide();
  id = guide.resolveId(id);

  const crafting = Object.values(guide.craftingRecipes).filter(
    (recipe) => recipe.resultItem === id
  );
  const smelting = Object.values(guide.smeltingRecipes).filter(
    (recipe) => recipe.resultItem === id
  );
  const inscriber = Object.values(guide.inscriberRecipes).filter(
    (recipe) => recipe.resultItem === id
  );

  if (
    crafting.length === 0 &&
    smelting.length === 0 &&
    inscriber.length === 0
  ) {
    return <ErrorText>No recipes for {id}</ErrorText>;
  }

  return (
    <div className={css.recipeContainer}>
      {crafting.map((recipe) => (
        <CraftingRecipe key={recipe.id} recipe={recipe} />
      ))}
      {inscriber.map((recipe) => (
        <InscriberRecipe key={recipe.id} recipe={recipe} />
      ))}
      {smelting.map((recipe) => (
        <SmeltingRecipe key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

export default RecipeFor;
