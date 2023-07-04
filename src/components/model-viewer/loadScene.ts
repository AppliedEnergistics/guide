import * as flatbuffers from "flatbuffers";
import { ExpScene } from "../../generated/scene.ts";
import { Group, Mesh } from "three";
import TextureManager from "./TextureManager.ts";
import loadGeometry from "./loadGeometry.ts";
import loadMaterial from "./loadMaterial.ts";
import decompress from "../../decompress.ts";

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

async function decompressResponse(response: Response) {
  const blob = await response.blob();
  response = await decompress(blob);
  const sceneContent = await response.arrayBuffer();

  console.debug(
    "Loaded %s, %d byte compressed, %d byte uncompressed",
    response.url,
    blob.size,
    sceneContent.byteLength
  );

  return sceneContent;
}

export default async function loadScene(
  textureManager: TextureManager,
  source: string,
  abortSignal: AbortSignal
): Promise<LoadedScene> {
  const response = await fetch(source, { signal: abortSignal });
  if (!response.ok) {
    throw response;
  }

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
    const expMaterial = expMesh.material();
    if (!expMaterial) {
      console.warn("Missing material for mesh %o", i);
      continue;
    }

    const geometry = loadGeometry(expMesh);
    const material = await loadMaterial(textureManager, expMaterial);
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
