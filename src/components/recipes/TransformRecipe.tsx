import RecipeIngredientGrid from "./RecipeIngredientGrid";
import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { TransformRecipeInfo } from "../../build-data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import { FluidTransformCircumstance } from "@component/recipes/FluidTransformCircumstance.tsx";
import ItemIcon from "@component/guide-elements/ItemIcon.tsx";

export interface TransformRecipeProps extends CustomGuideElementProps {
  recipe: TransformRecipeInfo;
}

function TransformRecipe({ recipe, ...props }: TransformRecipeProps) {
  const { guide } = props;

  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          {recipe.circumstance.type === "explosion" && (
            <>
              <ItemIcon {...props} id="minecraft:tnt" />
              Explode
            </>
          )}
          {recipe.circumstance.type === "fluid" && (
            <FluidTransformCircumstance
              fluids={recipe.circumstance.fluids.map((fluidId) =>
                guide.getFluidInfo(fluidId),
              )}
              baseUrl={guide.baseUrl}
            />
          )}
        </div>
        <RecipeIngredientGrid
          ingredients={recipe.ingredients}
          shapeless={true}
          {...props}
        />
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} {...props} />
      </div>
    </MinecraftFrame>
  );
}

export default TransformRecipe;
