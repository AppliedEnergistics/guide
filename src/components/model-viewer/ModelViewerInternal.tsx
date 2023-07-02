import React, {
  ReactNode,
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import {
  Box3,
  Euler,
  LineBasicMaterial,
  MathUtils,
  Matrix4,
  Raycaster,
  Sprite,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import css from "./ModelViewerInternal.module.css";
import { guiScaledDimension } from "../../css.ts";
import ErrorText from "../ErrorText.tsx";
import diamond from "../../assets/diamond.png";
import diamondColored from "../../assets/diamond_colored.png";
import loadScene, { CameraProps } from "./loadScene.ts";

import MinecraftTooltip from "../MinecraftTooltip.tsx";
import { buildInWorldAnnotation } from "./buildInWorldAnnotation.ts";
import addLevelLighting from "./addSceneLighting.ts";

const DEBUG = false;

export type Annotation = OverlayAnnotation | InWorldAnnotation;

export type OverlayAnnotation = {
  type: "overlay";
  position: [number, number, number];
  color: string;
  content: ReactNode;
};

export type InWorldAnnotation = InWorldBoxAnnotation | InWorldLineAnnotation;

export type InWorldBoxAnnotation = {
  type: "box";
  minCorner: [number, number, number];
  maxCorner: [number, number, number];
  color: string;
  thickness?: number;
  content: ReactNode;
  alwaysOnTop: boolean;
};

export type InWorldLineAnnotation = {
  type: "line";
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  thickness?: number;
  content: ReactNode;
  alwaysOnTop: boolean;
};

export type ModelViewerProps = {
  assetBaseUrl: string;

  background?: string;
  interactive?: boolean;

  // These are added during export
  src: string;
  placeholder: string;
  width: number;
  height: number;

  inWorldAnnotations?: InWorldAnnotation[];
  overlayAnnotations?: OverlayAnnotation[];
};

function getViewMatrix({ yaw, pitch, roll }: CameraProps): Matrix4 {
  const result = new Matrix4();
  result.multiply(new Matrix4().makeRotationZ(MathUtils.degToRad(roll)));
  result.multiply(new Matrix4().makeRotationX(MathUtils.degToRad(pitch)));
  result.multiply(new Matrix4().makeRotationY(MathUtils.degToRad(yaw)));
  return result;
}

async function initialize(
  assetBaseUrl: string,
  source: string,
  viewportEl: HTMLDivElement,
  cameraControls: boolean,
  inWorldAnnotations: InWorldAnnotation[] | undefined = [],
  overlayAnnotations: OverlayAnnotation[] | undefined = [],
  mousePosRef: RefObject<Vector2>,
  setTooltipObject: (object: ReactNode | undefined) => void,
  abortSignal: AbortSignal
) {
  const { cameraProps, group } = await loadScene(
    assetBaseUrl,
    source,
    abortSignal
  );

  const sceneBounds = new Box3();
  sceneBounds.expandByObject(group);
  const sceneCenter = sceneBounds.getCenter(new Vector3());

  const viewportWidth = viewportEl.offsetWidth;
  const viewportHeight = viewportEl.offsetHeight;

  const scene = new THREE.Scene();
  addLevelLighting(scene);
  scene.add(group);

  // Add "diamond overlays"
  const textureLoader = new TextureLoader();
  const diamondTexture = await textureLoader.loadAsync(diamond);
  diamondTexture.minFilter = THREE.NearestFilter;
  diamondTexture.magFilter = THREE.NearestFilter;
  diamondTexture.wrapS = THREE.ClampToEdgeWrapping;
  diamondTexture.wrapT = THREE.ClampToEdgeWrapping;

  const diamondColoredTexture = await textureLoader.loadAsync(diamondColored);
  diamondColoredTexture.minFilter = THREE.NearestFilter;
  diamondColoredTexture.magFilter = THREE.NearestFilter;
  diamondColoredTexture.wrapS = THREE.ClampToEdgeWrapping;
  diamondColoredTexture.wrapT = THREE.ClampToEdgeWrapping;

  const diamondMaterial = new THREE.SpriteMaterial({
    map: diamondTexture,
    transparent: true,
    depthTest: false,
    sizeAttenuation: false,
    fog: false,
  });

  for (const annotation of inWorldAnnotations) {
    group.add(buildInWorldAnnotation(annotation));
  }

  for (const annotation of overlayAnnotations) {
    const spriteScale = 1 / 4;

    const annotationNodeBottom = new Sprite(diamondMaterial);
    annotationNodeBottom.position.set(
      annotation.position[0],
      annotation.position[1],
      annotation.position[2]
    );
    annotationNodeBottom.scale.set(spriteScale, spriteScale, 1);
    annotationNodeBottom.userData.annotation = annotation;
    group.add(annotationNodeBottom);

    const diamondColoredMaterial = new THREE.SpriteMaterial({
      map: diamondColoredTexture,
      transparent: true,
      depthTest: false,
      sizeAttenuation: false,
      fog: false,
      color: annotation.color,
    });
    const annotationNodeTop = new Sprite(diamondColoredMaterial);
    annotationNodeTop.position.set(
      annotation.position[0],
      annotation.position[1],
      annotation.position[2]
    );
    annotationNodeTop.scale.set(spriteScale, spriteScale, 1);
    annotationNodeTop.userData.annotation = annotation;
    group.add(annotationNodeTop);
  }

  const camera = new THREE.OrthographicCamera(
    -viewportWidth / 2,
    viewportWidth / 2,
    viewportHeight / 2,
    -viewportHeight / 2,
    0,
    30000
  );

  const lookVector = new Vector3(0, 0, -1);
  lookVector
    .transformDirection(getViewMatrix(cameraProps))
    .multiplyScalar(sceneBounds.max.length());

  group.position.copy(sceneCenter.negate());

  camera.zoom = (1 / 0.625) * 16 * cameraProps.zoom;
  camera.position.set(0, 0, 10);
  // We are rotating the camera position here instead of the scene,
  // which is why the angles are in reverse
  camera.position.applyEuler(
    new Euler(
      MathUtils.degToRad(-cameraProps.pitch),
      MathUtils.degToRad(-cameraProps.yaw),
      MathUtils.degToRad(-cameraProps.roll),
      "YXZ"
    )
  );
  camera.updateProjectionMatrix();
  scene.add(camera);

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

  const raycaster = new Raycaster();

  let disposed = false;

  const animate = function () {
    if (disposed) {
      return;
    }
    requestAnimationFrame(animate);

    controls?.update();

    const mousePos = mousePosRef.current ?? new Vector2();
    raycaster.setFromCamera(mousePos, camera);
    const intersections = raycaster.intersectObjects(scene.children);
    let tooltipContent: ReactNode | undefined;
    for (const intersection of intersections) {
      const object = intersection.object;

      const annotation = object.userData.annotation as Annotation;
      if (annotation && annotation.content) {
        tooltipContent = annotation.content;
        break;
      }
    }
    setTooltipObject(tooltipContent);

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
      setTooltipObject(undefined);
    }
  };
}

function ModelViewerInternal({
  assetBaseUrl,
  src,
  placeholder,
  interactive = false,
  background = "transparent",
  width,
  height,
  inWorldAnnotations,
  overlayAnnotations,
}: ModelViewerProps) {
  const [error, setError] = useState();
  const [initialized, setInitialized] = useState(false);
  const [tooltipObject, setTooltipObject] = useState<ReactNode | undefined>();
  const mousePos = useRef(new Vector2());
  const viewportRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) {
      throw new Error("Viewport not initialized!");
    }

    let disposed = false;
    let disposer: undefined | (() => void) = undefined;
    const abortController = new AbortController();
    setInitialized(false);
    initialize(
      assetBaseUrl,
      src,
      viewportEl,
      interactive,
      inWorldAnnotations,
      overlayAnnotations,
      mousePos,
      setTooltipObject,
      abortController.signal
    )
      .then((f) => {
        if (disposed) {
          f();
        } else {
          setInitialized(true);
          disposer = f;
        }
      })
      .catch((err) => {
        if (abortController.signal.aborted) {
          return;
        }
        setError(err);
      });

    return () => {
      disposed = true;
      abortController.abort();
      if (disposer) {
        disposer();
      }
    };
  }, [interactive, src, overlayAnnotations, assetBaseUrl, inWorldAnnotations]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const canvas = viewportRef.current?.querySelector("canvas");
    if (!canvas) {
      return;
    }

    const clientRect = canvas.getBoundingClientRect();
    let x = (e.clientX - clientRect.x) / clientRect.width;
    let y = (e.clientY - clientRect.y) / clientRect.height;

    x = x * 2 - 1;
    y = -(y * 2 - 1);

    mousePos.current = new Vector2(x, y);
  }

  function onMouseLeave() {
    mousePos.current = new Vector2(-10000, -10000);
    setTooltipObject(null);
  }

  return (
    <>
      {error && <ErrorText>{String(error)}</ErrorText>}
      <MinecraftTooltip
        content={tooltipObject}
        visible={Boolean(tooltipObject)}
      >
        <div
          className={css.root}
          style={{
            background,
            width: guiScaledDimension(width),
            height: guiScaledDimension(height),
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
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
      </MinecraftTooltip>
    </>
  );
}

export default ModelViewerInternal;
