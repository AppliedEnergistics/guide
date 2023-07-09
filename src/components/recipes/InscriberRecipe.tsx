import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import { InscriberRecipeInfo } from "../../data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import ItemIcon from "../ItemIcon.tsx";
import topArrow from "../../assets/inscriber_top.png";
import bottomArrow from "../../assets/inscriber_bottom.png";
import rightArrow from "../../assets/inscriber_right.png";

export interface InscriberRecipeProps {
  recipe: InscriberRecipeInfo;
}

function InscriberRecipe({ recipe }: InscriberRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon nolink id="inscriber" /> Inscriber
        </div>
        <div className={css.inscriberGrid}>
          <RecipeIngredient itemIds={recipe.top} />
          <RecipeIngredient itemIds={recipe.middle} />
          <RecipeIngredient itemIds={recipe.bottom} />
          <RecipeIngredient itemIds={[recipe.resultItem]} />
          <img src={topArrow} alt="" />
          <img src={bottomArrow} alt="" />
          <img src={rightArrow} alt="" />
        </div>
      </div>
    </MinecraftFrame>
  );
}

export default InscriberRecipe;
