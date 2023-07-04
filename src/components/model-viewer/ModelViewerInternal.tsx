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
  Camera,
  Euler,
  GridHelper,
  LineBasicMaterial,
  MathUtils,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import css from "./ModelViewerInternal.module.css";
import { guiScaledDimension } from "../../css.ts";
import ErrorText from "../ErrorText.tsx";
import loadScene from "./loadScene.ts";

import MinecraftTooltip from "../MinecraftTooltip.tsx";
import { buildInWorldAnnotation } from "./buildInWorldAnnotation.ts";
import addLevelLighting from "./addSceneLighting.ts";
import buildOverlayAnnotation from "./buildOverlayAnnotations.ts";
import TextureManager from "./TextureManager.ts";

const DEBUG = false;

// Add our CSS variables
declare module "csstype" {
  interface Properties {
    "--modelviewer-width"?: string;
    "--modelviewer-height"?: string;
    "--modelviewer-aspect-ratio"?: number;
  }
}

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

const raycaster = new Raycaster();

function getTooltipContent(
  mousePos: Vector2,
  camera: Camera,
  scene: Scene
): React.ReactNode | undefined {
  raycaster.setFromCamera(mousePos, camera);
  const intersections = raycaster.intersectObjects(scene.children);
  for (const intersection of intersections) {
    const object = intersection.object;

    const annotation = object.userData.annotation as Annotation;
    if (annotation && annotation.content) {
      return annotation.content;
    }
  }
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
  const textureManager = new TextureManager(assetBaseUrl);

  const { cameraProps, group } = await loadScene(
    textureManager,
    source,
    abortSignal
  );

  // Center the scene
  const sceneBounds = new Box3();
  sceneBounds.expandByObject(group);
  const sceneCenter = sceneBounds.getCenter(new Vector3());
  group.position.copy(sceneCenter.clone().negate());

  // Add a plane for orientation
  if (cameraControls) {
    const grid = new GridHelper(20, 20, 0xffffffff, 0xffffffff);
    grid.material = new LineBasicMaterial({
      transparent: true,
      opacity: 0.5,
    });
    group.add(grid);
  }

  const viewportWidth = viewportEl.offsetWidth;
  const viewportHeight = viewportEl.offsetHeight;

  const scene = new THREE.Scene();
  addLevelLighting(scene);
  scene.add(group);

  for (const annotation of inWorldAnnotations) {
    group.add(buildInWorldAnnotation(annotation));
  }

  for (const annotation of overlayAnnotations) {
    group.add(await buildOverlayAnnotation(textureManager, annotation));
  }

  const camera = new THREE.OrthographicCamera(
    -viewportWidth / 2,
    viewportWidth / 2,
    viewportHeight / 2,
    -viewportHeight / 2,
    0,
    30000
  );

  // group.position.copy(sceneCenter.negate());

  camera.zoom = (1 / 0.625) * 16 * cameraProps.zoom;
  camera.position.set(0, 0, 15);
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
  } else {
    camera.lookAt(new Vector3());
  }

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    premultipliedAlpha: false,
  });
  viewportEl.append(renderer.domElement);
  renderer.setSize(viewportWidth, viewportHeight);
  renderer.useLegacyLights = true;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  let resizeObserver: ResizeObserver | undefined;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const size = entry.contentBoxSize[0];
          renderer.setSize(size.inlineSize, size.blockSize);
        }
      }
    });
    resizeObserver.observe(viewportEl, {
      box: "content-box",
    });
  }

  let disposed = false;

  const animate = function () {
    if (disposed) {
      return;
    }
    requestAnimationFrame(animate);

    controls?.update();

    renderer.render(scene, camera);

    // Update what's under the mouse
    const mousePos = mousePosRef.current;
    if (mousePos) {
      setTooltipObject(getTooltipContent(mousePos, camera, scene));
    } else {
      setTooltipObject(undefined);
    }
  };

  animate();

  return () => {
    if (!disposed) {
      console.debug("Disposing model viewer for %s", source);
      disposed = true;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
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
  const mousePos = useRef<Vector2 | null>(null);
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
    setError(undefined);
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
        console.error(
          "An error occurred while loading scene %s: %o",
          src,
          err,
          err.stack
        );
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
    mousePos.current = null;
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
            "--modelviewer-width": guiScaledDimension(width),
            "--modelviewer-height": guiScaledDimension(height),
            "--modelviewer-aspect-ratio": width / height,
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {!initialized && <img src={placeholder} alt="" />}

          <div className={css.viewport} ref={viewportRef}></div>
        </div>
      </MinecraftTooltip>
    </>
  );
}

export default ModelViewerInternal;
