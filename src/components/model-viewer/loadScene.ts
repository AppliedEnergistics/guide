import * as flatbuffers from "flatbuffers";
import {
  ExpIndexElementType,
  ExpMaterial,
  ExpScene,
  ExpTransparency,
  ExpVertexElementType,
  ExpVertexElementUsage,
} from "../../generated/scene.ts";
import {
  AdditiveBlending,
  BufferGeometry,
  CustomBlending,
  DstColorFactor,
  Group,
  ImageBitmapLoader,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  LinearFilter,
  LinearMipMapLinearFilter,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  MeshLambertMaterial,
  MeshLambertMaterialParameters,
  NearestFilter,
  NearestMipMapNearestFilter,
  NoBlending,
  OneFactor,
  OneMinusSrcAlphaFactor,
  RepeatWrapping,
  SrcAlphaFactor,
  SrcColorFactor,
  Texture,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
  ZeroFactor,
} from "three";
import shaderInfos from "./shaderInfo.ts";

type LoadedScene = {
  group: Group;
  cameraProps: CameraProps;
};

export type CameraProps = {
  yaw: number;
  pitch: number;
  roll: number;
  zoom: number;
};

interface TypedArrayCtor<T> {
  readonly BYTES_PER_ELEMENT: number;

  new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): T;
}

function castArray<T extends ArrayLike<number>>(
  base: ArrayBufferView,
  ctor: TypedArrayCtor<T>
): T {
  return new ctor(
    base.buffer,
    base.byteOffset,
    base.byteLength / ctor.BYTES_PER_ELEMENT
  );
}

async function decompressResponse(response: Response) {
  const blob = await response.blob();
  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  const sceneContent = await new Response(decompressedStream).arrayBuffer();

  console.debug(
    "Loaded %s, %d byte compressed, %d byte uncompressed",
    response.url,
    blob.size,
    sceneContent.byteLength
  );

  return sceneContent;
}

function setBlending(
  expMaterial: ExpMaterial,
  materialParams: MeshLambertMaterialParameters
) {
  switch (expMaterial.transparency()) {
    case ExpTransparency.DISABLED:
      materialParams.blending = NoBlending;
      break;
    case ExpTransparency.ADDITIVE:
      materialParams.blending = AdditiveBlending;
      break;
    case ExpTransparency.LIGHTNING:
      materialParams.blending = CustomBlending;
      materialParams.blendSrc = SrcAlphaFactor;
      materialParams.blendDst = OneFactor;
      break;
    case ExpTransparency.GLINT:
      materialParams.blending = CustomBlending;
      materialParams.blendSrc = SrcColorFactor;
      materialParams.blendDst = OneFactor;
      materialParams.blendSrcAlpha = ZeroFactor;
      materialParams.blendDstAlpha = OneFactor;
      break;
    case ExpTransparency.CRUMBLING:
      materialParams.blending = CustomBlending;
      materialParams.blendSrc = DstColorFactor;
      materialParams.blendDst = SrcColorFactor;
      materialParams.blendSrcAlpha = OneFactor;
      materialParams.blendDstAlpha = ZeroFactor;
      break;
    case ExpTransparency.TRANSLUCENT:
      materialParams.blending = CustomBlending;
      materialParams.blendSrc = SrcAlphaFactor;
      materialParams.blendDst = OneMinusSrcAlphaFactor;
      materialParams.blendSrcAlpha = OneFactor;
      materialParams.blendDstAlpha = OneMinusSrcAlphaFactor;
      break;
  }
}

class CachingImageLoader {
  private readonly loader = new ImageBitmapLoader();
  private readonly requests = new Map<string, Promise<ImageBitmap>>();

  constructor(private readonly assetBaseUrl: string) {}

  load(url: string): Promise<ImageBitmap> {
    let request = this.requests.get(url);
    if (!request) {
      const textureUrl = this.assetBaseUrl + "/" + url;
      request = this.loader.loadAsync(textureUrl);
      this.requests.set(url, request);
    }
    return request;
  }
}

export default async function loadScene(
  assetBaseUrl: string,
  source: string,
  abortSignal: AbortSignal
): Promise<LoadedScene> {
  const response = await fetch(source, { signal: abortSignal });
  if (!response.ok) {
    throw response;
  }

  const imageLoader = new CachingImageLoader(assetBaseUrl);
  const arrayBuffer = await decompressResponse(response);

  const data = new Uint8Array(arrayBuffer);
  const buf = new flatbuffers.ByteBuffer(data);

  const group = new Group();

  const expScene = ExpScene.getRootAsExpScene(buf);
  for (let i = 0; i < expScene.meshesLength(); i++) {
    const expMesh = expScene.meshes(i);
    if (!expMesh) {
      continue;
    }

    const vertexBufferData = expMesh.vertexBufferArray();
    const indexBufferData = expMesh.indexBufferArray();
    if (!vertexBufferData || !indexBufferData) {
      console.warn("Missing vertex or index buffer data");
      continue;
    }
    console.debug(
      "Vertex buffer size: %d, Index buffer size: %d",
      vertexBufferData.byteLength,
      indexBufferData.byteLength
    );
    const expVertexFormat = expMesh.vertexFormat();
    if (!expVertexFormat) {
      console.warn("Missing vertex format");
      continue;
    }
    console.debug("Vertex format, stride=%d", expVertexFormat.vertexSize());

    const geometry = new BufferGeometry();

    if (expMesh.indexType() == ExpIndexElementType.UINT) {
      const typedData = castArray(indexBufferData, Uint32Array);
      geometry.setIndex(new Uint32BufferAttribute(typedData, 1, false));
    } else if (expMesh.indexType() == ExpIndexElementType.USHORT) {
      const typedData = castArray(indexBufferData, Uint16Array);
      geometry.setIndex(new Uint16BufferAttribute(typedData, 1, false));
    } else {
      console.warn("Unknown index type: %o", expMesh.indexType());
      continue;
    }

    for (let j = 0; j < expVertexFormat.elementsLength(); j++) {
      const vertexEl = expVertexFormat.elements(j);
      if (!vertexEl) {
        continue;
      }

      // We don't support uv2 (lightmap)
      if (vertexEl.index() > 0) {
        continue;
      }

      let attributeName: string;
      switch (vertexEl.usage()) {
        case ExpVertexElementUsage.POSITION:
          attributeName = "position";
          break;
        case ExpVertexElementUsage.NORMAL:
          attributeName = "normal";
          break;
        case ExpVertexElementUsage.COLOR:
          attributeName = "color";
          break;
        case ExpVertexElementUsage.UV:
          attributeName = "uv";
          break;
        default:
          console.warn(
            "Unsupported vertex format attribute usage: %o",
            vertexEl.usage()
          );
          continue;
      }

      console.debug(
        "Element %s, Count=%o, Offset=%o, Normalized=%o",
        attributeName,
        vertexEl.count(),
        vertexEl.offset(),
        vertexEl.normalized()
      );

      let interleavedCtor: any;
      switch (vertexEl.type()) {
        case ExpVertexElementType.FLOAT:
          interleavedCtor = Float32Array;
          break;
        case ExpVertexElementType.UBYTE:
          interleavedCtor = Uint8Array;
          break;
        case ExpVertexElementType.BYTE:
          interleavedCtor = Int8Array;
          break;
        case ExpVertexElementType.USHORT:
          interleavedCtor = Uint16Array;
          break;
        case ExpVertexElementType.SHORT:
          interleavedCtor = Int16Array;
          break;
        case ExpVertexElementType.UINT:
          interleavedCtor = Uint32Array;
          break;
        case ExpVertexElementType.INT:
          interleavedCtor = Int32Array;
          break;
        default:
          console.warn("Unsupported element type: %o", vertexEl.type());
          continue;
      }

      const bytesPerEl = interleavedCtor.BYTES_PER_ELEMENT;
      const array = castArray(vertexBufferData, interleavedCtor);

      const interleavedBuffer = new InterleavedBuffer(
        array,
        expVertexFormat.vertexSize() / bytesPerEl
      );

      geometry.setAttribute(
        attributeName,
        new InterleavedBufferAttribute(
          interleavedBuffer,
          vertexEl.count(),
          vertexEl.offset() / bytesPerEl,
          vertexEl.normalized()
        )
      );
    }

    const textures: Texture[] = [];
    const expMaterial = expMesh.material()!;
    for (let i = 0; i < expMaterial.samplersLength(); ++i) {
      const sampler = expMaterial.samplers(i)!;
      const textureUrl = sampler.texture();
      if (!textureUrl) {
        console.warn("Sampler %o is missing texture.", i);
        continue;
      }
      const image = await imageLoader.load(textureUrl);
      const texture = new Texture(image);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;

      texture.magFilter = sampler.linearFiltering()
        ? LinearFilter
        : NearestFilter;

      if (texture.mipmaps) {
        texture.minFilter = sampler.linearFiltering()
          ? LinearMipMapLinearFilter
          : NearestMipMapNearestFilter;
        texture.generateMipmaps = true;
      } else {
        texture.minFilter = sampler.linearFiltering()
          ? LinearFilter
          : NearestFilter;
      }

      texture.needsUpdate = true;
      textures.push(texture);
    }

    // These parameters are usually set via the shader
    const materialName = expMaterial.name();
    const shaderName = expMaterial.shaderName() ?? "none";
    const shaderProps = shaderInfos[shaderName];
    const materialParams:
      | MeshLambertMaterialParameters
      | MeshBasicMaterialParameters = {};
    setBlending(expMaterial, materialParams);
    let material: Material;

    if (!shaderProps) {
      console.warn("Unknown shader: %s", shaderName);
      material = new MeshBasicMaterial({ color: "red" });
    } else {
      if (shaderProps.alphaTest !== null) {
        materialParams.alphaTest = shaderProps.alphaTest;
      }
      materialParams.vertexColors = shaderProps.vertexColor;

      if (shaderProps.textured) {
        materialParams.map = textures[0];
      }

      switch (shaderProps.lighting) {
        // Uses pre-baked diffuse lighting, meaning it's effectively unlit,
        // since we don't actually do a lightmap here
        case "lightmap":
        case "none":
          material = new MeshBasicMaterial(materialParams);
          break;
        case "diffuse":
          material = new MeshLambertMaterial(materialParams);
          break;
      }
    }

    material.name = materialName ?? "";

    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  const expCamera = expScene.camera();
  if (!expCamera) {
    throw new Error("Scene is missing camera settings");
  }
  const cameraProps = {
    yaw: expCamera.yaw(),
    pitch: expCamera.pitch(),
    roll: expCamera.roll(),
    zoom: expCamera.zoom(),
  };

  return { cameraProps, group };
}
