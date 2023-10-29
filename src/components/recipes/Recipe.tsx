import CraftingRecipe from "./CraftingRecipe";
import InscriberRecipe from "./InscriberRecipe";
import SmeltingRecipe from "./SmeltingRecipe";
import css from "./recipe.module.css";
import { RecipeType, TaggedRecipe } from "../../build-data/Guide.ts";
import ErrorText from "../ErrorText.tsx";
import React, { JSXElementConstructor } from "react";
import TransformRecipe from "./TransformRecipe.tsx";
import ChargerRecipe from "./ChargerRecipe.tsx";
import SmithingRecipe from "./SmithingRecipe.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";

export type RecipeProps = (
  | {
      /**
       * Recipe ID
       */
      id: string;
      recipe?: never;
    }
  | { id?: never; recipe: TaggedRecipe }
) &
  CustomGuideElementProps;

function UnsupportedRecipeType({ recipe }: { recipe: TaggedRecipe }) {
  return <ErrorText>Unsupported Recipe Type ({recipe.type})</ErrorText>;
}

const RecipeTypeMap: Record<RecipeType, JSXElementConstructor<any>> = {
  [RecipeType.CraftingRecipeType]: CraftingRecipe,
  [RecipeType.SmeltingRecipeType]: SmeltingRecipe,
  [RecipeType.StonecuttingRecipeType]: UnsupportedRecipeType,
  [RecipeType.SmithingRecipeType]: SmithingRecipe,
  [RecipeType.TransformRecipeType]: TransformRecipe,
  [RecipeType.InscriberRecipeType]: InscriberRecipe,
  [RecipeType.ChargerRecipeType]: ChargerRecipe,
  [RecipeType.EntropyRecipeType]: UnsupportedRecipeType,
  [RecipeType.MatterCannonAmmoType]: UnsupportedRecipeType,
};

function Recipe({ id, recipe, ...props }: RecipeProps) {
  if (recipe === undefined) {
    recipe = props.guide.getRecipeById(id);
  }

  if (!recipe) {
    return <ErrorText>Missing recipe {id}</ErrorText>;
  }

  const componentType = RecipeTypeMap[recipe.type];
  if (!componentType) {
    return <ErrorText>Unknown recipe type {recipe.type}</ErrorText>;
  }

  const recipeEl = React.createElement(componentType, {
    recipe,
    ...props,
  });

  return <div className={css.recipeContainer}>{recipeEl}</div>;
}

export default Recipe;
