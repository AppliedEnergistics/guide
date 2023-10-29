import { useEffect, useState } from "react";
import css from "./recipe.module.css";
import ItemIcon from "@component/guide-elements/ItemIcon.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import CyclingIngredient from "@component/recipes/CyclingIngredient.tsx";

export interface RecipeIngredientProps extends CustomGuideElementProps {
  itemIds: string[];
}

function RecipeIngredient({ itemIds, ...props }: RecipeIngredientProps) {
  return (
    <div className={css.ingredientBox}>
      {itemIds.length > 1 && (
        <CyclingIngredient>
          {itemIds.map((itemId) => (
            <ItemIcon {...props} id={itemId} key={itemId} />
          ))}
        </CyclingIngredient>
      )}
      {itemIds.length === 1 && <ItemIcon {...props} id={itemIds[0]} />}
    </div>
  );
}

export default RecipeIngredient;
