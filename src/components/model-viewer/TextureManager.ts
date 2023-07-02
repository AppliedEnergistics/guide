import {
  ImageBitmapLoader,
  LinearFilter,
  LinearMipMapLinearFilter,
  NearestFilter,
  NearestMipMapNearestFilter,
  RepeatWrapping,
  Texture,
  UVMapping,
} from "three";

const missingImageData = new ImageData(
  new Uint8ClampedArray([255, 0, 255, 255]),
  1,
  1
);

export default class TextureManager {
  private readonly enableCaching = true;
  private readonly images: Record<string, ImageBitmap> = {};
  private readonly textures: Texture[] = [];
  private readonly loader = new ImageBitmapLoader();

  constructor(private readonly assetBaseUrl: string) {}

  async getImage(url: string): Promise<ImageBitmap> {
    let image = this.images[url];
    if (!this.enableCaching || !image) {
      const fullUrl = this.assetBaseUrl + "/" + url;
      console.debug("Loading image %s", fullUrl);
      try {
        image = await this.loader.loadAsync(fullUrl);
      } catch (e) {
        console.error("Failed to load image %s", fullUrl);
        return createImageBitmap(missingImageData);
      }
      this.images[url] = image;
    } else {
      console.debug("Reusing loaded image %s", url);
    }
    return image;
  }

  async get(
    url: string,
    linearFiltering: boolean,
    mipmaps: boolean
  ): Promise<Texture> {
    // Acquire the image first
    const image = await this.getImage(url);

    const magFilter = linearFiltering ? LinearFilter : NearestFilter;
    let minFilter: Texture["minFilter"];
    if (mipmaps) {
      minFilter = linearFiltering
        ? LinearMipMapLinearFilter
        : NearestMipMapNearestFilter;
    } else {
      minFilter = linearFiltering ? LinearFilter : NearestFilter;
    }

    // Then search for matching texture
    if (this.enableCaching) {
      for (const existingTexture of this.textures) {
        if (
          existingTexture.image === image &&
          existingTexture.minFilter === minFilter &&
          existingTexture.magFilter === magFilter &&
          existingTexture.generateMipmaps == mipmaps
        ) {
          console.debug(
            "Reusing existing texture for %s (linear=%s,mipmaps=%s)",
            url,
            linearFiltering,
            mipmaps
          );
          return existingTexture;
        }
      }
    }

    console.debug(
      "Creating new texture for %s (linear=%s,mipmaps=%s)",
      url,
      linearFiltering,
      mipmaps
    );

    // Check first if already loaded
    const texture = new Texture(
      image,
      UVMapping,
      RepeatWrapping,
      RepeatWrapping,
      magFilter,
      minFilter
    );
    texture.needsUpdate = true;
    this.textures.push(texture);
    return texture;
  }
}
