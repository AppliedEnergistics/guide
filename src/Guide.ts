import { createContext, useContext } from "react";

export interface RecipeInfo {
  id: string;
  resultItem: string;
  resultCount: number;
}

export interface CraftingRecipeInfo extends RecipeInfo {
  shapeless: boolean;
  ingredients: string[][];
  width: number;
  height: number;
}

export interface SmeltingRecipeInfo extends RecipeInfo {
  ingredient: string[];
}

export interface InscriberRecipeInfo extends RecipeInfo {
  top: string[];
  middle: string[];
  bottom: string[];
  consumesTopAndBottom: boolean;
}

export type TaggedRecipe =
  | ({ type: "crafting" } & CraftingRecipeInfo)
  | ({ type: "smelting" } & SmeltingRecipeInfo)
  | ({ type: "inscriber" } & InscriberRecipeInfo);

const validRarity = ["common", "uncommon", "rare", "epic"];
export type Rarity = "common" | "uncommon" | "rare" | "epic";

export interface ItemInfo {
  id: string;
  displayName: string;
  rarity: Rarity;
  icon: string;
}

export interface P2PTypeInfo {
  tunnelItemId: string;

  attunementItemIds: string[];
  attunementApiClasses: string[];
}

export type PageSummary = {};

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
  generated: number;

  gameVersion: string;

  modVersion: string;
  defaultNamespace: string;
  pages: Record<string, PageSummary>;
  navigationRootNodes: NavigationNode[];

  items: ItemInfo[];

  craftingRecipes: Record<string, CraftingRecipeInfo>;
  smeltingRecipes: Record<string, SmeltingRecipeInfo>;
  inscriberRecipes: Record<string, InscriberRecipeInfo>;

  coloredVersions: Record<string, Record<DyeColor, string>>;

  pageIndices: Record<string, Array<any>>;
};

export type NavigationNode = {
  pageId: string;
  title: string;
  icon: string;
  children: NavigationNode[];
  position: number;
  hasPage: boolean;
};

// Map item id -> page id
export type ItemIndex = Map<string, string>;
export type CategoryIndex = Map<string, string[]>;

export class Guide {
  readonly baseUrl: string;
  private readonly indexByItemId: Map<string, ItemInfo>;

  readonly coloredVersionItemIds = new Set<string>();

  readonly pageByItemIndex: ItemIndex;

  constructor(baseUrl: string, readonly index: GuideIndex) {
    this.index = index;
    this.baseUrl = baseUrl.replace(/\/+$/, "");

    /**
     * Find all item ids of items that are just colored versions of something else.
     */
    for (const [, variants] of Object.entries(index.coloredVersions)) {
      for (const coloredItemId of Object.values(variants)) {
        this.coloredVersionItemIds.add(coloredItemId);
      }
    }

    const itemIndex =
      index.pageIndices["appeng.client.guidebook.indices.ItemIndex"];
    this.pageByItemIndex = new Map<string, string>(
      (function* () {
        for (let i = 0; i < itemIndex.length; i += 2) {
          yield [itemIndex[i], itemIndex[i + 1]];
        }
      })()
    );

    this.indexByItemId = new Map<string, ItemInfo>(
      Object.values(index.items).map((item) => {
        const icon = item.icon
          .replaceAll("\\", "/")
          .replaceAll(/^icons\//g, "/icons/");
        if (!validRarity.includes(item.rarity)) {
          throw new Error(`Invalid rarity: ${item.rarity}`);
        }
        const info: ItemInfo = {
          ...item,
          rarity: item.rarity as Rarity,
          icon,
        };
        return [item.id, info];
      })
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

  get craftingRecipes(): Record<string, CraftingRecipeInfo> {
    return this.index.craftingRecipes;
  }

  get smeltingRecipes(): Record<string, SmeltingRecipeInfo> {
    return this.index.smeltingRecipes;
  }

  get inscriberRecipes(): Record<string, InscriberRecipeInfo> {
    return this.index.inscriberRecipes;
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

  tryGetItemInfo(itemId: string): ItemInfo | undefined {
    itemId = this.resolveId(itemId);
    return this.indexByItemId.get(itemId);
  }

  getRecipeById(id: string): TaggedRecipe | undefined {
    return (
      Guide.getRecipeTagged("crafting", this.craftingRecipes, id) ??
      Guide.getRecipeTagged("smelting", this.smeltingRecipes, id) ??
      Guide.getRecipeTagged("inscriber", this.inscriberRecipes, id)
    );
  }

  private static getRecipeTagged<T extends string, U>(
    type: T,
    recipes: Record<string, U>,
    id: string
  ): ({ type: T } & U) | undefined {
    const recipe = recipes[id];
    if (recipe) {
      return {
        type,
        ...recipe,
      };
    } else {
      return undefined;
    }
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
