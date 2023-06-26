import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Box3,
  LinearEncoding,
  LinearSRGBColorSpace,
  LineBasicMaterial,
  Matrix4,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Vector3,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import css from "./ModelViewerInternal.module.css";
import { guiScaledDimension } from "../../css.ts";
import ErrorText from "../ErrorText.tsx";

const DEBUG = false;

export type ModelViewerProps = {
  src: string;
  placeholder?: string;
  cameraControls?: boolean;
  zoom: number;
  width: number;
  height: number;
  background: string;
};

enum Mode {
  ORTOGRAPHIC = "ORTOGRAPHIC",
  // ... other modes as required
}

class CameraSettings {
  offsetX = 0;
  offsetY = 0;
  zoom = 1;
  rotationCenter: Vector3 = new Vector3(0, 0, 0);
  rotationX = 0;
  rotationY = 0;
  rotationZ = 0;
  mode: Mode = Mode.ORTOGRAPHIC;

  getViewMatrix(): Matrix4 {
    const result = new Matrix4();

    // result.makeTranslation(this.offsetX, this.offsetY, 0);

    // Assuming 0.625 comes from the default block model json GUI transform
    const scaleFactor = 0.625 * 16 * this.zoom;
    result.scale(new Vector3(scaleFactor, scaleFactor, scaleFactor));

    if (this.mode == Mode.ORTOGRAPHIC) {
      result.multiply(
        new Matrix4().makeTranslation(
          this.rotationCenter.x,
          this.rotationCenter.y,
          this.rotationCenter.z
        )
      );
      result.multiply(
        new Matrix4().makeRotationZ(CameraSettings.degToRad(this.rotationZ))
      );
      result.multiply(
        new Matrix4().makeRotationX(CameraSettings.degToRad(this.rotationX))
      );
      result.multiply(
        new Matrix4().makeRotationY(CameraSettings.degToRad(this.rotationY))
      );
      result.multiply(
        new Matrix4().makeTranslation(
          -this.rotationCenter.x,
          -this.rotationCenter.y,
          -this.rotationCenter.z
        )
      );
    }

    return result;
  }

  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

async function initialize(
  source: string,
  viewportEl: HTMLDivElement,
  zoom: number,
  cameraControls: boolean
) {
  const response = await fetch(source);
  if (!response.ok) {
    throw response;
  }

  const blob = await response.blob();
  const ds = new DecompressionStream("gzip");
  const decompressedStream = blob.stream().pipeThrough(ds);
  const gltfContent = await new Response(decompressedStream).blob();
  console.info(
    "Loaded %s, %d byte compressed, %d byte uncompressed",
    source,
    blob.size,
    gltfContent.size
  );
  const blobUrl = URL.createObjectURL(gltfContent); // TODO: REVOKE -> MEMORY LEAK

  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    if (source === url) {
      return blobUrl;
    } else {
      return url;
    }
  });

  // Instantiate a loader
  const loader = new GLTFLoader(manager);
  const gltf = await loader.loadAsync(source);

  const b = new Box3();
  gltf.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.computeBoundingBox();
      b.union(object.geometry.boundingBox);
      object.frustumCulled = false;

      if (object.material instanceof MeshStandardMaterial) {
        // Minecraft somewhat incorrectly loads all textures in linear space,
        // while GLTF assumes sRGB
        const { alphaTest, alphaToCoverage, blending, vertexColors } =
          object.material;
        const map = object.material.map;
        if (map) {
          map.colorSpace = LinearSRGBColorSpace;
          map.encoding = LinearEncoding;
          map.needsUpdate = true;
        }
        object.material = new MeshPhongMaterial({
          // Copy standard Material properties we actually use
          alphaTest,
          alphaToCoverage,
          blending,
          vertexColors,
          map,
        });
      }
    }
  });
  const sceneBounds = new Box3();
  sceneBounds.expandByObject(gltf.scene);
  const sceneCenter = sceneBounds.getCenter(new Vector3());

  const viewportWidth = viewportEl.offsetWidth;
  const viewportHeight = viewportEl.offsetHeight;

  const scene = new THREE.Scene();

  // Meshes have pre-baked directional lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  scene.add(gltf.scene);

  const camera = new THREE.OrthographicCamera(
    -viewportWidth / 2,
    viewportWidth / 2,
    viewportHeight / 2,
    -viewportHeight / 2,
    0,
    30000
  );

  const lookVector = new Vector3(0, 0, -1);
  const cc = new CameraSettings();
  cc.rotationX = 30;
  cc.rotationY = 225; // I don't know why everything is rotate +90°...
  cc.rotationZ = 0;
  lookVector
    .transformDirection(cc.getViewMatrix())
    .multiplyScalar(sceneBounds.max.length());

  gltf.scene.position.copy(sceneCenter.negate());
  scene.rotation.set(
    CameraSettings.degToRad(30),
    CameraSettings.degToRad(225),
    0,
    "ZXY"
  );

  const s = (1 / 0.625) * 16 * zoom;
  camera.scale.set(1 / s, 1 / s, 1 / s);
  camera.position.set(0, 0, 10);
  camera.updateMatrix();
  camera.updateMatrixWorld();

  if (DEBUG) {
    const axesHelper = new THREE.AxesHelper(32);
    axesHelper.material = new LineBasicMaterial({
      vertexColors: true,
      toneMapped: false,
      depthTest: false,
      depthWrite: false,
    });
    scene.add(axesHelper);
  }

  let controls: OrbitControls | undefined;
  if (cameraControls) {
    controls = new OrbitControls(camera, viewportEl);
    controls.zoom0 = zoom;
    controls.update();
  }

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    premultipliedAlpha: false,
  });
  viewportEl.append(renderer.domElement);
  renderer.setSize(viewportWidth, viewportHeight);
  renderer.useLegacyLights = true;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  let disposed = false;

  const animate = function () {
    if (disposed) {
      return;
    }
    requestAnimationFrame(animate);

    controls?.update();
    // required if controls.enableDamping or controls.autoRotate are set to true
    renderer.render(scene, camera);
  };

  animate();

  return () => {
    if (!disposed) {
      console.debug("Disposing model viewer for %s", source);
      disposed = true;
      viewportEl.removeChild(renderer.domElement);
      renderer.dispose();
      controls?.dispose();
    }
  };
}

function ModelViewerInternal({
  src,
  placeholder,
  cameraControls = false,
  background,
  width,
  height,
  zoom,
}: ModelViewerProps) {
  const [error, setError] = useState();
  const [initialized, setInitialized] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) {
      throw new Error("Viewport not initialized!");
    }

    let disposed = false;
    let disposer: undefined | (() => void) = undefined;
    setInitialized(false);
    initialize(src, viewportEl, zoom, cameraControls)
      .then((f) => {
        if (disposed) {
          f();
        } else {
          setInitialized(true);
          disposer = f;
        }
      })
      .catch((err) => setError(err));

    return () => {
      disposed = true;
      if (disposer) {
        disposer();
      }
    };
  }, [cameraControls, src, zoom]);

  return (
    <>
      {error && <ErrorText>{error}</ErrorText>}
      <div
        className={css.root}
        style={{
          background,
          width: guiScaledDimension(width),
          height: guiScaledDimension(height),
        }}
      >
        {!initialized && (
          <img
            src={placeholder}
            style={{
              width: guiScaledDimension(width),
              height: guiScaledDimension(height),
            }}
            alt="Scene placeholder"
          />
        )}

        <div
          className={css.viewport}
          ref={viewportRef}
          style={{
            width: guiScaledDimension(width),
            height: guiScaledDimension(height),
          }}
        ></div>
      </div>
    </>
  );
}

export default ModelViewerInternal;
