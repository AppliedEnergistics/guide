import css from "./recipe.module.css";
import RecipeIngredient from "./RecipeIngredient";
import { InscriberRecipeInfo } from "../../build-data/Guide.ts";
import MinecraftFrame from "../MinecraftFrame.tsx";
import topArrow from "@assets/inscriber_top.png";
import bottomArrow from "@assets/inscriber_bottom.png";
import rightArrow from "@assets/inscriber_right.png";
import ItemIcon from "@component/guide-elements/ItemIcon.tsx";
import { CustomGuideElementProps } from "@component/CustomGuideElementProps.ts";
import Image from "next/image";

export interface InscriberRecipeProps extends CustomGuideElementProps {
  recipe: InscriberRecipeInfo;
}

function InscriberRecipe({ recipe, ...rest }: InscriberRecipeProps) {
  return (
    <MinecraftFrame>
      <div className={css.recipeBoxLayout}>
        <div>
          <ItemIcon {...rest} nolink id="inscriber" /> Inscriber
        </div>
        <div className={css.inscriberGrid}>
          <RecipeIngredient {...rest} itemIds={recipe.top} />
          <RecipeIngredient {...rest} itemIds={recipe.middle} />
          <RecipeIngredient {...rest} itemIds={recipe.bottom} />
          <RecipeIngredient {...rest} itemIds={[recipe.resultItem]} />
          <Image src={topArrow} alt="" />
          <Image src={bottomArrow} alt="" />
          <Image src={rightArrow} alt="" />
        </div>
      </div>
    </MinecraftFrame>
  );
}

export default InscriberRecipe;
