import * as THREE from "three";
import { FlappyGame } from "./game";
import { Bird, Pipe } from "./sprites";
import {
  BackgroundKind,
  BASE_Y,
  BirdColor,
  PIPE_HEIGHT,
  PIPE_WIDTH,
  PipeColor,
  SCREEN_WIDTH
} from "./types";

export type CameraMode = "chase" | "side";
export type Vec3Tuple = [number, number, number];

export interface CameraPose {
  position: Vec3Tuple;
  target: Vec3Tuple;
}

export interface SceneStats {
  pipeMeshes: number;
  hasBird2: boolean;
  cameraMode: CameraMode;
  background: BackgroundKind;
}

export const WORLD_SCALE = 0.03;

export function worldX(screenX: number): number {
  return screenX * WORLD_SCALE;
}

export function worldY(screenY: number): number {
  return (BASE_Y - screenY) * WORLD_SCALE;
}

function birdHexColor(color: BirdColor): number {
  if (color === "red") {
    return 0xf96d55;
  }
  if (color === "blue") {
    return 0x60bef7;
  }
  return 0xffcf6b;
}

function createBirdMesh(color: BirdColor): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: birdHexColor(color),
    roughness: 0.45,
    metalness: 0.08
  });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfff3d6, roughness: 0.6 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xff8c24, roughness: 0.4 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.2 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), bodyMat);
  body.scale.set(1.18, 0.92, 0.96);
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), bellyMat);
  belly.position.set(0.06, -0.13, 0);
  belly.scale.set(1.05, 0.72, 0.86);
  group.add(belly);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 10), beakMat);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.56, -0.02, 0);
  group.add(beak);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), eyeWhiteMat);
    eye.position.set(0.24, 0.14, side * 0.24);
    group.add(eye);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), pupilMat);
    pupil.position.set(0.32, 0.14, side * 0.28);
    group.add(pupil);
  }

  const wingGeo = new THREE.BoxGeometry(0.34, 0.08, 0.38);
  const leftWing = new THREE.Mesh(wingGeo, bellyMat);
  leftWing.position.set(-0.04, 0.06, -0.36);
  leftWing.castShadow = true;
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, bellyMat);
  rightWing.position.set(-0.04, 0.06, 0.36);
  rightWing.castShadow = true;
  group.add(rightWing);

  group.userData.leftWing = leftWing;
  group.userData.rightWing = rightWing;
  group.userData.birdColor = color;
  return group;
}

function createPipeMesh(pipe: Pipe, color: PipeColor): THREE.Group {
  const group = new THREE.Group();
  const radius = PIPE_WIDTH * WORLD_SCALE * 0.5;
  const height = PIPE_HEIGHT * WORLD_SCALE;
  const mainColor = color === "green" ? 0x66c930 : 0xd95b43;
  const rimColor = color === "green" ? 0x80e346 : 0xf2765e;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: 0.4,
    metalness: 0.1
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: rimColor,
    roughness: 0.35,
    metalness: 0.12
  });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x162a1d, roughness: 0.9 });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 18), bodyMat);
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  const collarH = 0.42;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.14, radius * 1.14, collarH, 18),
    rimMat
  );
  const collarY = pipe.top ? -height / 2 + collarH / 2 : height / 2 - collarH / 2;
  collar.position.set(0, collarY, 0);
  collar.castShadow = true;
  collar.receiveShadow = true;
  group.add(collar);

  const innerCap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.85, radius * 0.85, 0.08, 16), capMat);
  innerCap.position.set(0, pipe.top ? -height / 2 : height / 2, 0);
  group.add(innerCap);

  return group;
}

export class FlappyScene3D {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  public webglAvailable = false;
  private bird1Mesh: THREE.Group | null = null;
  private bird2Mesh: THREE.Group | null = null;
  private pipeMeshes = new Map<Pipe, THREE.Group>();
  private groundSegments: THREE.Mesh[] = [];
  private clouds: THREE.Group[] = [];
  private hemiLight: THREE.HemisphereLight;
  private dirLight: THREE.DirectionalLight;
  private currentBg: BackgroundKind | null = null;
  private currentPipeColor: PipeColor | null = null;
  private camInitialized = false;

  constructor(canvas: HTMLCanvasElement | null, headless: boolean = false) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, 9 / 16, 0.1, 140);

    this.hemiLight = new THREE.HemisphereLight(0xdff6ff, 0x3b6e3f, 1.0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    this.dirLight.position.set(6, 14, 9);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    this.buildEnvironment();

    if (!headless && canvas && typeof window !== "undefined") {
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.webglAvailable = true;
      } catch {
        this.renderer = null;
        this.webglAvailable = false;
      }
    }
  }

  private buildEnvironment(): void {
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x73bf2e, roughness: 0.85 });
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xded895, roughness: 0.9 });

    const baseSlab = new THREE.Mesh(new THREE.BoxGeometry(70, 2.2, 22), sandMat);
    baseSlab.position.set(6, -1.25, 0);
    baseSlab.receiveShadow = true;
    this.scene.add(baseSlab);

    for (let i = 0; i < 18; i++) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.24, 22),
        i % 2 === 0 ? grassMat : new THREE.MeshStandardMaterial({ color: 0x5ca520, roughness: 0.85 })
      );
      strip.position.set(-10 + i * 2.2, -0.12, 0);
      strip.receiveShadow = true;
      this.scene.add(strip);
      this.groundSegments.push(strip);
    }

    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Group();
      for (let p = 0; p < 3; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.55 - p * 0.08, 10, 8), cloudMat);
        puff.position.set((p - 1) * 0.55, p === 1 ? 0.18 : 0, 0);
        cloud.add(puff);
      }
      const zSide = i % 2 === 0 ? -5.5 - (i % 3) * 1.8 : 5.5 + (i % 3) * 1.4;
      cloud.position.set(-6 + i * 3.8, 6.2 + (i % 3) * 1.1, zSide);
      this.scene.add(cloud);
      this.clouds.push(cloud);
    }
  }

  public resize(width: number, height: number): void {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.renderer) {
      this.renderer.setSize(w, h, false);
    }
  }

  private applyTheme(game: FlappyGame): void {
    const bg = game.theme.background;
    if (this.currentBg !== bg) {
      this.currentBg = bg;
      const skyHex = bg === "day" ? 0x62cde0 : 0x0f2038;
      this.scene.background = new THREE.Color(skyHex);
      this.scene.fog = new THREE.Fog(skyHex, 14, 46);
      this.hemiLight.intensity = bg === "day" ? 1.05 : 0.6;
      this.dirLight.intensity = bg === "day" ? 1.25 : 0.75;
    }
    if (this.currentPipeColor !== game.theme.pipe) {
      this.currentPipeColor = game.theme.pipe;
      for (const mesh of this.pipeMeshes.values()) {
        this.scene.remove(mesh);
      }
      this.pipeMeshes.clear();
    }
  }

  private syncBird(
    existing: THREE.Group | null,
    bird: Bird | null,
    zOffset: number
  ): THREE.Group | null {
    if (!bird) {
      if (existing) {
        this.scene.remove(existing);
      }
      return null;
    }
    let mesh = existing;
    if (!mesh || mesh.userData.birdColor !== bird.color) {
      if (mesh) {
        this.scene.remove(mesh);
      }
      mesh = createBirdMesh(bird.color);
      this.scene.add(mesh);
    }
    mesh.position.set(worldX(bird.centerX), worldY(bird.y + bird.height / 2), zOffset);
    mesh.rotation.z = Math.max(-0.85, Math.min(0.45, bird.speed * 0.14));

    const frame = bird.currentFlapFrame();
    const wingAngle = frame === "up" ? 0.55 : frame === "down" ? -0.55 : 0.0;
    const lw = mesh.userData.leftWing as THREE.Mesh | undefined;
    const rw = mesh.userData.rightWing as THREE.Mesh | undefined;
    if (lw) {
      lw.rotation.x = wingAngle;
    }
    if (rw) {
      rw.rotation.x = -wingAngle;
    }
    return mesh;
  }

  public computeCameraPose(game: FlappyGame, mode: CameraMode): CameraPose {
    if (mode === "side") {
      const cx = worldX(SCREEN_WIDTH / 2);
      const cy = worldY(BASE_Y / 2);
      return {
        position: [cx, cy + 0.35, 12.6],
        target: [cx, cy, 0]
      };
    }
    const bx = worldX(game.bird1.centerX);
    const by = worldY(game.bird1.y + game.bird1.height / 2);
    const bz = game.bird2 ? 0.25 : 0;
    return {
      position: [bx - 4.8, Math.max(1.15, by + 1.1), bz + 0.55],
      target: [bx + 6.5, Math.max(0.85, by - 0.15), 0]
    };
  }

  public sync(game: FlappyGame, dt: number, mode: CameraMode): void {
    this.applyTheme(game);

    const b1Z = game.bird2 ? 0.25 : 0;
    this.bird1Mesh = this.syncBird(this.bird1Mesh, game.bird1, b1Z);
    this.bird2Mesh = this.syncBird(this.bird2Mesh, game.bird2, -0.85);

    const activeSet = new Set<Pipe>(game.pipes);
    for (const [pipe, mesh] of this.pipeMeshes.entries()) {
      if (!activeSet.has(pipe)) {
        this.scene.remove(mesh);
        this.pipeMeshes.delete(pipe);
      }
    }
    for (const pipe of game.pipes) {
      let mesh = this.pipeMeshes.get(pipe);
      if (!mesh) {
        mesh = createPipeMesh(pipe, game.theme.pipe);
        this.scene.add(mesh);
        this.pipeMeshes.set(pipe, mesh);
      }
      mesh.position.set(worldX(pipe.centerX), worldY(pipe.y + pipe.height / 2), 0);
    }

    const groundShift = (game.ground.x * WORLD_SCALE) % 4.4;
    for (let i = 0; i < this.groundSegments.length; i++) {
      this.groundSegments[i].position.x = -10 + i * 2.2 + groundShift;
    }

    for (const cloud of this.clouds) {
      cloud.position.x -= dt * 0.9;
      if (cloud.position.x < -10) {
        cloud.position.x = 20;
      }
    }

    const pose = this.computeCameraPose(game, mode);
    if (!this.camInitialized || dt <= 0) {
      this.camera.position.set(pose.position[0], pose.position[1], pose.position[2]);
      this.camera.lookAt(pose.target[0], pose.target[1], pose.target[2]);
      this.camInitialized = true;
    } else {
      const alpha = 1 - Math.exp(-10 * Math.min(0.1, dt));
      this.camera.position.x += (pose.position[0] - this.camera.position.x) * alpha;
      this.camera.position.y += (pose.position[1] - this.camera.position.y) * alpha;
      this.camera.position.z += (pose.position[2] - this.camera.position.z) * alpha;
      this.camera.lookAt(pose.target[0], pose.target[1], pose.target[2]);
    }
  }

  public render(game: FlappyGame, dt: number, mode: CameraMode): void {
    this.sync(game, dt, mode);
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public stats(mode: CameraMode, game: FlappyGame): SceneStats {
    return {
      pipeMeshes: this.pipeMeshes.size,
      hasBird2: this.bird2Mesh !== null,
      cameraMode: mode,
      background: game.theme.background
    };
  }
}
