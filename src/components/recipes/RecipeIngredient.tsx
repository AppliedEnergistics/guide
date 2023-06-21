import { useEffect, useState } from "react";
import css from "./recipe.module.css";
import ItemIcon from "../ItemIcon";

export interface RecipeIngredientProps {
  itemIds: string[];
}

function CyclingIngredient({ itemIds }: RecipeIngredientProps) {
  const [visibleIndex, setVisibleIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((idx) => ++idx % itemIds.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [itemIds]);

  return <ItemIcon id={itemIds[visibleIndex]} />;
}

function RecipeIngredient({ itemIds }: RecipeIngredientProps) {
  return (
    <div className={css.ingredientBox}>
      {itemIds.length > 1 ? (
        <CyclingIngredient itemIds={itemIds} />
      ) : (
        <ItemIcon id={itemIds[0]} />
      )}
    </div>
  );
}

export default RecipeIngredient;
