"use client";

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
import { guiScaledDimension } from "@component/css.ts";
import ErrorText from "../ErrorText.tsx";
import loadScene from "./loadScene.ts";

import MinecraftTooltip from "../MinecraftTooltip.tsx";
import { buildInWorldAnnotation } from "./buildInWorldAnnotation.ts";
import addLevelLighting from "./addSceneLighting.ts";
import buildOverlayAnnotation from "./buildOverlayAnnotations.ts";
import TextureManager from "./TextureManager.ts";
import plusIcon from "@assets/button_plus.png";
import minusIcon from "@assets/button_minus.png";
import resetIcon from "@assets/button_reset.png";
import Image from "next/image";

const DEBUG = false;

// Add our CSS variables
declare module "csstype" {
  interface Properties {
    "--modelviewer-width"?: string;
    "--modelviewer-height"?: string;
    "--modelviewer-aspect-ratio"?: number;
  }
}

interface ControlInterface {
  zoomIn(): void;

  zoomOut(): void;

  resetView(): void;

  dispose(): void;
}

const DummyControlInterface: ControlInterface = {
  dispose(): void {},
  resetView(): void {},
  zoomIn(): void {},
  zoomOut(): void {},
};

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
  scene: Scene,
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
  abortSignal: AbortSignal,
  originalWidth: number,
): Promise<ControlInterface> {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    premultipliedAlpha: false,
  });
  renderer.useLegacyLights = true;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const textureManager = new TextureManager(assetBaseUrl);

  const { cameraProps, group, animatedTextureParts } = await loadScene(
    textureManager,
    source,
    abortSignal,
  );

  // Center the scene
  const sceneBounds = new Box3();
  sceneBounds.expandByObject(group);
  const sceneCenter = sceneBounds.getCenter(new Vector3());
  group.position.copy(sceneCenter.clone().negate());

  // Add a plane for orientation if camera controls are enabled
  if (cameraControls) {
    // Get the extent on the x/z axis
    const sceneSize = sceneBounds.getSize(new Vector3());
    const gridDim = Math.max(sceneSize.x, sceneSize.z) + 2;

    const grid = new GridHelper(gridDim, gridDim, 0xffffffff, 0xffffffff);
    grid.material = new LineBasicMaterial({
      transparent: true,
      opacity: 0.5,
    });
    grid.position.copy(new Vector3(sceneCenter.x, 0, sceneCenter.z));
    group.add(grid);
  }

  const scene = new THREE.Scene();
  addLevelLighting(scene);
  scene.add(group);

  for (const annotation of inWorldAnnotations) {
    group.add(buildInWorldAnnotation(annotation));
  }

  for (const annotation of overlayAnnotations) {
    group.add(await buildOverlayAnnotation(textureManager, annotation));
  }

  const camera = new THREE.OrthographicCamera();
  camera.near = 0;
  camera.far = 30000;

  const updateViewportSize = (width: number, height: number) => {
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    // We only scale down, not up
    const scaling = Math.min(1, width / (originalWidth * 3));
    camera.zoom = (1 / 0.625) * 16 * cameraProps.zoom * scaling;
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
  };
  updateViewportSize(viewportEl.offsetWidth, viewportEl.offsetHeight);

  camera.position.set(0, 0, 15);
  // We are rotating the camera position here instead of the scene,
  // which is why the angles are in reverse
  camera.position.applyEuler(
    new Euler(
      MathUtils.degToRad(-cameraProps.pitch),
      MathUtils.degToRad(-cameraProps.yaw),
      MathUtils.degToRad(-cameraProps.roll),
      "YXZ",
    ),
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
    controls.enableZoom = false;
    controls.update();
  } else {
    camera.lookAt(new Vector3());
  }

  // Declare a resize observer to automatically resize the viewport
  let resizeObserver: ResizeObserver | undefined;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const { inlineSize: width, blockSize: height } =
            entry.contentBoxSize[0];

          updateViewportSize(width, height);

          if (cameraControls) {
            controls?.dispose();
            controls = new OrbitControls(camera, viewportEl);
            controls.enableZoom = false;
            controls.update();
          } else {
            camera.lookAt(new Vector3());
          }
        }
      }
    });
    resizeObserver.observe(viewportEl, {
      box: "content-box",
    });
  }

  let disposed = false;

  let nextTick = 0;
  const animate = function (time: number) {
    if (disposed) {
      return;
    }

    controls?.update();

    // Update textures

    if (time > nextTick) {
      nextTick = time + 1000 / 20;

      for (const animatedPart of animatedTextureParts) {
        const { x, y, frameTextures, frames, currentFrame } = animatedPart;
        if (++animatedPart.subFrame >= frames[currentFrame].time) {
          animatedPart.currentFrame = (currentFrame + 1) % frames.length;
          animatedPart.subFrame = 0;
        }

        for (const targetTexture of animatedPart.targetTextures) {
          renderer.copyTextureToTexture(
            new Vector2(x, y),
            frameTextures[frames[currentFrame].index],
            targetTexture,
          );
        }
      }
    }

    renderer.render(scene, camera);

    // Update what's under the mouse
    const mousePos = mousePosRef.current;
    if (mousePos) {
      setTooltipObject(getTooltipContent(mousePos, camera, scene));
    } else {
      setTooltipObject(undefined);
    }
  };

  renderer.setAnimationLoop(animate);

  viewportEl.append(renderer.domElement);

  return {
    dispose(): void {
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
    },
    resetView(): void {
      controls?.reset();
    },
    zoomIn(): void {
      if (controls) {
        controls.enableZoom = true;
        try {
          for (let i = 0; i < 5; i++) {
            const e = new WheelEvent("wheel", {
              deltaY: -120,
            });
            controls.domElement.dispatchEvent(e);
          }
        } finally {
          controls.enableZoom = false;
        }
      }
    },
    zoomOut(): void {
      if (controls) {
        controls.enableZoom = true;
        try {
          for (let i = 0; i < 5; i++) {
            const e = new WheelEvent("wheel", {
              deltaY: 120,
            });
            controls.domElement.dispatchEvent(e);
          }
        } finally {
          controls.enableZoom = false;
        }
      }
    },
  };
}

function ModelViewerInternal({
  assetBaseUrl,
  src,
  placeholder,
  interactive = false,
  background,
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
  const controlRef = useRef<ControlInterface>(DummyControlInterface);
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
      abortController.signal,
      width,
    )
      .then((control) => {
        if (disposed) {
          control.dispose();
        } else {
          setInitialized(true);
          controlRef.current = control;
          disposer = () => control.dispose();
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
          err.stack,
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
  }, [
    interactive,
    src,
    overlayAnnotations,
    assetBaseUrl,
    inWorldAnnotations,
    width,
  ]);

  function zoomIn(e: React.MouseEvent) {
    e.preventDefault();
    controlRef?.current?.zoomIn();
  }

  function zoomOut(e: React.MouseEvent) {
    e.preventDefault();
    controlRef?.current?.zoomOut();
  }

  function resetView(e: React.MouseEvent) {
    e.preventDefault();
    controlRef?.current?.resetView();
  }

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
    <div
      className={css.wrapper + " " + (!initialized ? css.loading : "")}
      style={{
        background,
        "--modelviewer-width": guiScaledDimension(width),
        "--modelviewer-height": guiScaledDimension(height),
        "--modelviewer-aspect-ratio": width / height,
      }}
    >
      {error && <ErrorText>{String(error)}</ErrorText>}
      <MinecraftTooltip
        content={tooltipObject}
        visible={Boolean(tooltipObject)}
      >
        <div
          className={css.root}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {!initialized && <img src={placeholder} alt="" />}

          <div className={css.viewport} ref={viewportRef}></div>
        </div>
      </MinecraftTooltip>
      {interactive && (
        <div className={css.controls}>
          <MinecraftTooltip content={"Zoom in"}>
            <button onClick={zoomIn}>
              <Image src={plusIcon} alt="" />
            </button>
          </MinecraftTooltip>
          <MinecraftTooltip content={"Zoom out"}>
            <button onClick={zoomOut}>
              <Image src={minusIcon} alt="" />
            </button>
          </MinecraftTooltip>
          <MinecraftTooltip content={"Reset view"}>
            <button onClick={resetView}>
              <Image src={resetIcon} alt="" />
            </button>
          </MinecraftTooltip>
        </div>
      )}
    </div>
  );
}

export default ModelViewerInternal;
