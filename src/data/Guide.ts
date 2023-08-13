import { createContext, useContext } from "react";
import { Root as MdAstRoot } from "mdast";

export enum RecipeType {
  CraftingRecipeType = "minecraft:crafting",
  SmeltingRecipeType = "minecraft:smelting",
  StonecuttingRecipeType = "minecraft:stonecutting",
  SmithingRecipeType = "minecraft:smithing",
  TransformRecipeType = "ae2:transform",
  InscriberRecipeType = "ae2:inscriber",
  ChargerRecipeType = "ae2:charger",
  EntropyRecipeType = "ae2:entropy",
  MatterCannonAmmoType = "ae2:matter_cannon",
}

export interface RecipeInfo<T extends RecipeType> {
  type: T;
  id: string;
  resultItem: string;
  resultCount: number;
}

export interface CraftingRecipeInfo
  extends RecipeInfo<typeof RecipeType.CraftingRecipeType> {
  shapeless: boolean;
  ingredients: string[][];
  width: number;
  height: number;
}

export interface SmeltingRecipeInfo
  extends RecipeInfo<typeof RecipeType.SmeltingRecipeType> {
  ingredient: string[];
}

export interface SmithingRecipeInfo
  extends RecipeInfo<typeof RecipeType.SmithingRecipeType> {
  base: string[];
  addition: string[];
  template: string[];
}

export interface StonecuttingRecipeInfo
  extends RecipeInfo<typeof RecipeType.StonecuttingRecipeType> {
  ingredient: string[];
}

export interface InscriberRecipeInfo
  extends RecipeInfo<typeof RecipeType.InscriberRecipeType> {
  top: string[];
  middle: string[];
  bottom: string[];
  consumesTopAndBottom: boolean;
}

export type TransformCircumstanceInfo =
  | { type: "explosion" }
  | TransformInFluidCircumstanceInfo;

export interface TransformInFluidCircumstanceInfo {
  type: "fluid";
  // IDs of fluids
  fluids: string[];
}

export interface TransformRecipeInfo
  extends RecipeInfo<typeof RecipeType.TransformRecipeType> {
  ingredients: string[][];
  resultItem: string;
  circumstance: TransformCircumstanceInfo;
}

export interface EntropyRecipeInfo
  extends RecipeInfo<typeof RecipeType.EntropyRecipeType> {}

export interface ChargerRecipeInfo
  extends RecipeInfo<typeof RecipeType.ChargerRecipeType> {
  ingredient: string[];
}

export interface MatterCannonAmmoInfo
  extends RecipeInfo<typeof RecipeType.MatterCannonAmmoType> {}

export type TaggedRecipe =
  | CraftingRecipeInfo
  | SmithingRecipeInfo
  | SmeltingRecipeInfo
  | StonecuttingRecipeInfo
  | InscriberRecipeInfo
  | TransformRecipeInfo
  | EntropyRecipeInfo
  | ChargerRecipeInfo
  | MatterCannonAmmoInfo;

export type Rarity = "common" | "uncommon" | "rare" | "epic";

export interface ItemInfo {
  id: string;
  displayName: string;
  rarity: Rarity;
  icon: string;
}

export interface FluidInfo {
  id: string;
  displayName: string;
  icon: string;
}

export interface P2PTypeInfo {
  tunnelItemId: string;

  attunementItemIds: string[];
  attunementApiClasses: string[];
}

export type ExportedPage = {
  title: string;
  astRoot: MdAstRoot;
  frontmatter: Record<string, unknown>;
};

export type AnimationInfo = {
  frameWidth: number;
  frameHeight: number;
  length: number;
  frameCount: number;
  keyFrames: AnimationFrame[];
};

export type AnimationFrame = {
  index: number;
  frameX: number;
  frameY: number;
};

export type DyeColor =
  | "yellow"
  | "blue"
  | "orange"
  | "gray"
  | "purple"
  | "magenta"
  | "lime"
  | "white"
  | "pink"
  | "light_blue"
  | "light_gray"
  | "red"
  | "green"
  | "black"
  | "cyan"
  | "brown";

export type GuideIndex = {
  defaultNamespace: string;
  pages: Record<string, ExportedPage>;
  navigationRootNodes: NavigationNode[];

  startPageId?: string;

  items: Record<string, ItemInfo>;
  fluids: Record<string, FluidInfo>;

  recipes: Record<string, TaggedRecipe>;

  coloredVersions: Record<string, Record<DyeColor, string>>;

  pageIndices: Record<string, Array<any>>;

  animations: Record<string, AnimationInfo>;
};

export type NavigationNode = {
  pageId: string;
  title: string;
  icon?: string;
  children: NavigationNode[];
  position: number;
  hasPage: boolean;
};

// Map item id -> page id
export type ItemIndex = Map<string, string>;
export type CategoryIndex = Map<string, string[]>;

export class Guide {
  readonly baseUrl: string;

  readonly coloredVersionItemIds = new Set<string>();

  readonly pageByItemIndex: ItemIndex;

  /**
   * Maps category name to list of page-ids within that category.
   */
  readonly pagesByCategoryIndex: CategoryIndex;

  private readonly recipesForItems = new Map<string, TaggedRecipe[]>();

  constructor(
    baseUrl: string,
    readonly gameVersion: string,
    readonly modVersion: string,
    readonly index: GuideIndex
  ) {
    this.index = index;
    this.baseUrl = baseUrl.replace(/\/+$/, "");

    // Index recipes by item.
    for (const [key, recipe] of Object.entries(index.recipes)) {
      recipe.id = key; // ID is not part of the actual recipe object to save space

      if (recipe.resultItem) {
        const list = this.recipesForItems.get(recipe.resultItem);
        if (list) {
          list.push(recipe);
        } else {
          this.recipesForItems.set(recipe.resultItem, [recipe]);
        }
      }
    }

    // Find all item ids of items that are just colored versions of something else.
    for (const [, variants] of Object.entries(index.coloredVersions)) {
      for (const coloredItemId of Object.values(variants)) {
        this.coloredVersionItemIds.add(coloredItemId);
      }
    }

    this.pageByItemIndex = Guide.indexToMap(
      index,
      "appeng.client.guidebook.indices.ItemIndex"
    );
    this.pagesByCategoryIndex = Guide.indexToMap(
      index,
      "appeng.client.guidebook.indices.CategoryIndex"
    );
  }

  private static indexToMap<T>(
    root: GuideIndex,
    indexName: string
  ): Map<string, T> {
    // Indices are serialized as [key, value, key, value, key, value] in one large array.
    // Convert this to [[key,value], [key,value], ...] and pass it to the map ctor.
    const elements = root.pageIndices[indexName] ?? [];
    return new Map<string, T>(
      (function* () {
        for (let i = 0; i < elements.length; i += 2) {
          yield [elements[i], elements[i + 1]];
        }
      })()
    );
  }

  getPageUrlForItem(id: string): string | undefined {
    return this.pageByItemIndex.get(id) ?? undefined;
  }

  getAssetUrl(id: string): string {
    const [namespace, path] = id.split(":", 2);
    return `${this.baseUrl}/${namespace}/${path}`;
  }

  fetchAsset(id: string): Promise<Response> {
    return fetch(this.getAssetUrl(id));
  }

  get defaultNamespace(): string {
    return this.index.defaultNamespace;
  }

  /**
   * Resolves a potentially namespace-less id to an id that is guaranteed to have a namespace.
   * @param idText
   */
  resolveId(idText: string): string {
    if (!idText.includes(":")) {
      return this.defaultNamespace + ":" + idText;
    }
    return idText;
  }

  /**
   * Supports relative resource locations such as: ./somepath, which would resolve relative to a given anchor
   * location. Relative locations must not be namespaced since we would otherwise run into the problem if namespaced
   * locations potentially having a different namespace than the anchor.
   */
  resolveLink(idText: string, anchor: string): string {
    if (!idText.includes(":")) {
      const [anchorNs, anchorPath] = anchor.split(":");
      const relativeId = new URL(
        idText,
        "http://dummy/" + anchorPath
      ).pathname.slice(1);

      return anchorNs + ":" + relativeId;
    }

    // if it contains a ":" it's assumed to be absolute
    return idText;
  }

  /**
   * Test if an item id is a colored version of something else.
   */
  isColoredVariant(itemId: string) {
    return this.coloredVersionItemIds.has(itemId);
  }

  getItemInfo(itemId: string): ItemInfo {
    const entry = this.tryGetItemInfo(itemId);
    if (!entry) {
      throw new Error(`Missing item-info for '${itemId}'.`);
    }
    return entry;
  }

  getFluidInfo(fluidId: string): FluidInfo {
    const entry = this.tryGetFluidInfo(fluidId);
    if (!entry) {
      throw new Error(`Missing fluid-info for '${fluidId}'.`);
    }
    return entry;
  }

  tryGetItemInfo(itemId: string): ItemInfo | undefined {
    itemId = this.resolveId(itemId);
    return this.index.items[itemId];
  }

  tryGetFluidInfo(fluidId: string): FluidInfo | undefined {
    fluidId = this.resolveId(fluidId);
    return this.index.fluids[fluidId];
  }

  getRecipeById(recipeId: string): TaggedRecipe | undefined {
    recipeId = this.resolveId(recipeId);
    return this.index.recipes[recipeId];
  }

  getRecipesByType<T extends RecipeType, RT = TaggedRecipe & { type: T }>(
    recipeType: T
  ): RT[] {
    return Object.values(this.index.recipes).filter(
      (recipe) => recipe.type === recipeType
    ) as RT[];
  }

  getRecipesForItem(item: string): TaggedRecipe[] {
    return this.recipesForItems.get(item) ?? [];
  }

  pageExists(pageId: string): boolean {
    return this.index.pages[pageId] !== undefined;
  }
}

const GuideContext = createContext<Guide | undefined>(undefined);

export const GuideProvider = GuideContext.Provider;

export function useGuide(): Guide {
  const guide = useContext(GuideContext);
  if (!guide) {
    throw new Error(
      "No Guide available. Missing <GuideProvider></GuideProvider>"
    );
  }
  return guide;
}
