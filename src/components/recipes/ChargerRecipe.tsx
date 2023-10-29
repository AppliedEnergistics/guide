import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import RecipeArrow from "./RecipeArrow";
import { ChargerRecipeInfo } from "../../build-data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import React from "react";
import ItemIcon from "@component/guide-elements/ItemIcon.tsx";

export interface ChargerRecipeProps extends CustomGuideElementProps {
  recipe: ChargerRecipeInfo;
}

function ChargerRecipe({ recipe, ...rest }: ChargerRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon {...rest} nolink id="charger" /> Charger
        </div>
        <RecipeIngredient itemIds={recipe.ingredient} {...rest} />
        <RecipeArrow />
        <RecipeIngredient itemIds={[recipe.resultItem]} {...rest} />
      </div>
    </MinecraftFrame>
  );
}

export default ChargerRecipe;
