import CraftingRecipe from "./CraftingRecipe";
import InscriberRecipe from "./InscriberRecipe";
import SmeltingRecipe from "./SmeltingRecipe";
import css from "./recipe.module.css";
import { RecipeType, TaggedRecipe, useGuide } from "../../data/Guide.ts";
import ErrorText from "../ErrorText.tsx";
import React, { JSXElementConstructor } from "react";
import TransformRecipe from "./TransformRecipe.tsx";
import ChargerRecipe from "./ChargerRecipe.tsx";
import SmithingRecipe from "./SmithingRecipe.tsx";

export type RecipeProps =
  | {
      /**
       * Recipe ID
       */
      id: string;
      recipe?: never;
    }
  | { id?: never; recipe: TaggedRecipe };

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

function Recipe(props: RecipeProps) {
  const guide = useGuide();
  let recipe: TaggedRecipe | undefined;
  if (typeof props.recipe !== "undefined") {
    recipe = props.recipe;
  } else {
    recipe = guide.getRecipeById(props.id);
  }

  if (!recipe) {
    return <ErrorText>Missing recipe {props.id}</ErrorText>;
  }

  const componentType = RecipeTypeMap[recipe.type];
  if (!componentType) {
    return <ErrorText>Unknown recipe type {recipe.type}</ErrorText>;
  }

  const recipeEl = React.createElement(componentType, {
    recipe,
  });

  return <div className={css.recipeContainer}>{recipeEl}</div>;
}

export default Recipe;
