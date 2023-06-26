function assertSet(name: string, value: string) {
  if (!value) {
    throw new Error("Environment variable " + name + " is not set");
  }
  return value;
}

export const guideAssetsUrl = assertSet(
  "VITE_GUIDE_ASSETS_URL",
  import.meta.env.VITE_GUIDE_ASSETS_URL
);
