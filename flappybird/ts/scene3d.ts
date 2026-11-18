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
  birdAnatomyParts: number;
  activeParticles: number;
  shakeRemaining: number;
}

interface VfxParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
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
    return 0x5ab8f5;
  }
  return 0xffd24c;
}

function birdShadeColor(color: BirdColor): number {
  if (color === "red") {
    return 0xd64833;
  }
  if (color === "blue") {
    return 0x3b8ec9;
  }
  return 0xe5a818;
}

function createPipeTexture(color: PipeColor): THREE.CanvasTexture | null {
  if (typeof document === "undefined") {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  const stops =
    color === "green"
      ? [
          [0.0, "#3b7d14"],
          [0.18, "#67c82c"],
          [0.28, "#b7f477"],
          [0.36, "#d7ffaa"],
          [0.48, "#73bf2e"],
          [0.78, "#4b951b"],
          [1.0, "#2f660f"]
        ]
      : [
          [0.0, "#7c2618"],
          [0.18, "#d14e38"],
          [0.28, "#ff9b86"],
          [0.36, "#ffd0c4"],
          [0.48, "#d95b43"],
          [0.78, "#9b3322"],
          [1.0, "#661d12"]
        ];
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  for (const [pos, hex] of stops) {
    grad.addColorStop(pos as number, hex as string);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createGroundTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }
  ctx.fillStyle = "#6ec02b";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#98e554";
  for (let i = -128; i < 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 16, 0);
    ctx.lineTo(i - 16, 128);
    ctx.lineTo(i - 32, 128);
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 4);
  return tex;
}

function createWingPivot(side: -1 | 1, color: BirdColor): THREE.Group {
  const pivot = new THREE.Group();
  pivot.position.set(0.02, 0.08, side * 0.3);

  const wingBaseMat = new THREE.MeshStandardMaterial({ color: 0xfff7df, roughness: 0.55 });
  const wingTipMat = new THREE.MeshStandardMaterial({
    color: birdShadeColor(color),
    roughness: 0.5
  });

  const inner = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), wingBaseMat);
  inner.scale.set(1.3, 0.35, 1.4);
  inner.position.set(-0.04, 0, side * 0.16);
  inner.castShadow = true;
  pivot.add(inner);

  for (let f = 0; f < 3; f++) {
    const feather = new THREE.Mesh(new THREE.BoxGeometry(0.28 - f * 0.04, 0.055, 0.24), wingTipMat);
    feather.position.set(-0.14 - f * 0.05, -0.01 * f, side * (0.28 + f * 0.1));
    feather.rotation.y = side * (-0.18 - f * 0.08);
    feather.castShadow = true;
    pivot.add(feather);
  }

  return pivot;
}

function createBirdMesh(color: BirdColor): THREE.Group {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: birdHexColor(color),
    roughness: 0.38,
    metalness: 0.06
  });
  const shadeMat = new THREE.MeshStandardMaterial({
    color: birdShadeColor(color),
    roughness: 0.45
  });
  const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfff4d6, roughness: 0.58 });
  const upperBeakMat = new THREE.MeshStandardMaterial({ color: 0xff8b1f, roughness: 0.35 });
  const lowerBeakMat = new THREE.MeshStandardMaterial({ color: 0xec5b17, roughness: 0.4 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.15 });

  // Plump torso + raised head silhouette
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 14), bodyMat);
  torso.scale.set(1.16, 0.92, 0.94);
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 14), bodyMat);
  head.position.set(0.22, 0.16, 0);
  head.castShadow = true;
  group.add(head);

  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), shadeMat);
  crest.position.set(0.14, 0.46, 0);
  crest.rotation.z = 0.55;
  group.add(crest);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.31, 14, 12), bellyMat);
  belly.position.set(0.08, -0.14, 0);
  belly.scale.set(1.06, 0.72, 0.84);
  group.add(belly);

  // Expressive eyes with sclera, pupil, and glint
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 10), eyeWhiteMat);
    eye.position.set(0.34, 0.24, side * 0.19);
    eye.scale.set(0.95, 1.15, 0.82);
    group.add(eye);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), pupilMat);
    pupil.position.set(0.42, 0.24, side * 0.22);
    group.add(pupil);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), eyeWhiteMat);
    glint.position.set(0.46, 0.27, side * 0.24);
    group.add(glint);
  }

  // Classic Flappy Bird thick double-lip beak
  const upperBeak = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), upperBeakMat);
  upperBeak.scale.set(1.65, 0.62, 1.1);
  upperBeak.position.set(0.54, 0.12, 0);
  upperBeak.castShadow = true;
  group.add(upperBeak);

  const lowerBeak = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), lowerBeakMat);
  lowerBeak.scale.set(1.45, 0.52, 0.96);
  lowerBeak.position.set(0.51, 0.02, 0);
  lowerBeak.castShadow = true;
  group.add(lowerBeak);

  // 3-feather tail fan extending behind the bird
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.42, 0.06, 0);
  for (let t = -1; t <= 1; t++) {
    const feather = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.12), shadeMat);
    feather.position.set(-0.12, Math.abs(t) * -0.02, t * 0.11);
    feather.rotation.y = t * 0.34;
    feather.rotation.z = -0.25;
    feather.castShadow = true;
    tailGroup.add(feather);
  }
  group.add(tailGroup);

  const leftWingPivot = createWingPivot(-1, color);
  const rightWingPivot = createWingPivot(1, color);
  group.add(leftWingPivot);
  group.add(rightWingPivot);

  group.userData.leftWingPivot = leftWingPivot;
  group.userData.rightWingPivot = rightWingPivot;
  group.userData.tailGroup = tailGroup;
  group.userData.upperBeak = upperBeak;
  group.userData.lowerBeak = lowerBeak;
  group.userData.birdColor = color;
  return group;
}

function createPipeMesh(
  pipe: Pipe,
  color: PipeColor,
  pipeTex: THREE.CanvasTexture | null
): THREE.Group {
  const group = new THREE.Group();
  const radius = PIPE_WIDTH * WORLD_SCALE * 0.5;
  const height = PIPE_HEIGHT * WORLD_SCALE;
  const mainColor = pipeTex ? 0xffffff : color === "green" ? 0x66c930 : 0xd95b43;
  const rimColor = pipeTex ? 0xffffff : color === "green" ? 0x80e346 : 0xf2765e;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: mainColor,
    map: pipeTex,
    roughness: 0.34,
    metalness: 0.14
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: rimColor,
    map: pipeTex,
    roughness: 0.28,
    metalness: 0.18
  });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0f2014, roughness: 0.92 });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 22), bodyMat);
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  const collarH = 0.48;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.15, radius * 1.15, collarH, 22),
    rimMat
  );
  const collarY = pipe.top ? -height / 2 + collarH / 2 : height / 2 - collarH / 2;
  collar.position.set(0, collarY, 0);
  collar.castShadow = true;
  collar.receiveShadow = true;
  group.add(collar);

  const innerCap = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.84, radius * 0.84, 0.1, 18),
    capMat
  );
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
  private groundTex: THREE.CanvasTexture | null = null;
  private greenPipeTex: THREE.CanvasTexture | null = null;
  private redPipeTex: THREE.CanvasTexture | null = null;
  private clouds: THREE.Group[] = [];
  private skyline: THREE.Group[] = [];
  private sunOrb: THREE.Mesh | null = null;
  private moonOrb: THREE.Mesh | null = null;
  private stars: THREE.Points | null = null;
  private particles: VfxParticle[] = [];
  private hemiLight: THREE.HemisphereLight;
  private dirLight: THREE.DirectionalLight;
  private currentBg: BackgroundKind | null = null;
  private currentPipeColor: PipeColor | null = null;
  private camInitialized = false;
  public shakeRemaining = 0;
  private clock = 0;

  constructor(canvas: HTMLCanvasElement | null, headless: boolean = false) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, 9 / 14, 0.1, 140);

    this.hemiLight = new THREE.HemisphereLight(0xdff6ff, 0x3b6e3f, 1.0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    this.dirLight.position.set(7, 15, 10);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    if (!headless) {
      this.groundTex = createGroundTexture();
      this.greenPipeTex = createPipeTexture("green");
      this.redPipeTex = createPipeTexture("red");
    }

    this.buildEnvironment();

    if (!headless && canvas && typeof window !== "undefined") {
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.08;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.webglAvailable = true;
      } catch {
        this.renderer = null;
        this.webglAvailable = false;
      }
    }
  }

  private buildEnvironment(): void {
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xded895, roughness: 0.9 });
    const turfMat = new THREE.MeshStandardMaterial({
      color: this.groundTex ? 0xffffff : 0x73bf2e,
      map: this.groundTex,
      roughness: 0.8
    });

    const baseSlab = new THREE.Mesh(new THREE.BoxGeometry(80, 2.2, 24), sandMat);
    baseSlab.position.set(6, -1.28, 0);
    baseSlab.receiveShadow = true;
    this.scene.add(baseSlab);

    const turfTop = new THREE.Mesh(new THREE.BoxGeometry(80, 0.24, 24), turfMat);
    turfTop.position.set(6, -0.12, 0);
    turfTop.receiveShadow = true;
    this.scene.add(turfTop);

    for (let i = 0; i < 16; i++) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.04, 24),
        new THREE.MeshStandardMaterial({ color: 0x5ca520, roughness: 0.85 })
      );
      strip.position.set(-10 + i * 2.2, 0.01, 0);
      strip.receiveShadow = true;
      this.scene.add(strip);
      this.groundSegments.push(strip);
    }

    // Distant skyline silhouettes & bushes
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x6ea6b5, roughness: 0.85 });
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x4ca338, roughness: 0.85 });
    for (let i = 0; i < 12; i++) {
      const bHeight = 2.4 + ((i * 7) % 5) * 0.75;
      const bGroup = new THREE.Group();
      const tower = new THREE.Mesh(new THREE.BoxGeometry(2.1, bHeight, 2.1), buildingMat);
      tower.position.set(0, bHeight / 2, 0);
      bGroup.add(tower);

      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.95, 10, 8), bushMat);
      bush.scale.set(1.4, 0.8, 1.0);
      bush.position.set(0.8, 0.4, 3.2);
      bGroup.add(bush);

      bGroup.position.set(-10 + i * 3.6, 0, -10.5 - (i % 2) * 1.8);
      this.scene.add(bGroup);
      this.skyline.push(bGroup);
    }

    // Fluffy 3D clouds
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
    for (let i = 0; i < 8; i++) {
      const cloud = new THREE.Group();
      for (let p = 0; p < 3; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.62 - p * 0.09, 10, 8), cloudMat);
        puff.position.set((p - 1) * 0.62, p === 1 ? 0.22 : 0, 0);
        cloud.add(puff);
      }
      const zSide = i % 2 === 0 ? -6.5 - (i % 3) * 1.8 : 6.8 + (i % 3) * 1.4;
      cloud.position.set(-6 + i * 4.0, 6.8 + (i % 3) * 1.1, zSide);
      this.scene.add(cloud);
      this.clouds.push(cloud);
    }

    // Celestial orbs for Day / Night
    this.sunOrb = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe67a })
    );
    this.sunOrb.position.set(22, 12.5, -18);
    this.scene.add(this.sunOrb);

    this.moonOrb = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xf6f1d1 })
    );
    this.moonOrb.position.set(22, 12.5, -18);
    this.scene.add(this.moonOrb);

    const starCoords: number[] = [];
    for (let s = 0; s < 90; s++) {
      starCoords.push(
        ((s * 37) % 50) - 12,
        6 + ((s * 23) % 14),
        -12 - ((s * 13) % 14)
      );
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starCoords, 3));
    this.stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xe7f1f4, size: 0.16 })
    );
    this.scene.add(this.stars);
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

  public spawnFlapBurst(bird: Bird, is2p: boolean): void {
    const bx = worldX(bird.centerX);
    const by = worldY(bird.y + bird.height / 2);
    const bz = is2p ? 0.25 : 0;
    const mat = new THREE.MeshBasicMaterial({ color: 0xfff8e6 });
    for (let i = 0; i < 6; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), mat);
      puff.position.set(bx - 0.25, by - 0.15, bz + (i - 2.5) * 0.08);
      this.scene.add(puff);
      this.particles.push({
        mesh: puff,
        vx: -1.8 - (i % 3) * 0.6,
        vy: -0.6 - (i % 2) * 0.5,
        vz: (i - 2.5) * 0.45,
        life: 0.42,
        maxLife: 0.42
      });
    }
  }

  public spawnScoreBurst(bird: Bird): void {
    const bx = worldX(bird.centerX);
    const by = worldY(bird.y + bird.height / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffcf6b });
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), mat);
      spark.position.set(bx, by, 0);
      this.scene.add(spark);
      this.particles.push({
        mesh: spark,
        vx: Math.cos(angle) * 2.2,
        vy: Math.sin(angle) * 2.2 + 0.8,
        vz: ((i % 3) - 1) * 0.9,
        life: 0.55,
        maxLife: 0.55
      });
    }
  }

  public triggerShake(duration: number = 0.35): void {
    this.shakeRemaining = duration;
  }

  private applyTheme(game: FlappyGame): void {
    const bg = game.theme.background;
    if (this.currentBg !== bg) {
      this.currentBg = bg;
      const isDay = bg === "day";
      const skyHex = isDay ? 0x62cde0 : 0x0f2038;
      this.scene.background = new THREE.Color(skyHex);
      this.scene.fog = new THREE.Fog(skyHex, 15, 48);
      this.hemiLight.intensity = isDay ? 1.05 : 0.6;
      this.dirLight.intensity = isDay ? 1.3 : 0.78;
      if (this.sunOrb) {
        this.sunOrb.visible = isDay;
      }
      if (this.moonOrb) {
        this.moonOrb.visible = !isDay;
      }
      if (this.stars) {
        this.stars.visible = !isDay;
      }
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
    mesh.rotation.z = Math.max(-0.9, Math.min(0.48, bird.speed * 0.14));

    const frame = bird.currentFlapFrame();
    const baseAngle = frame === "up" ? 0.68 : frame === "down" ? -0.68 : 0.08;
    const flapWave = baseAngle + Math.sin(this.clock * 14) * 0.12;
    const lw = mesh.userData.leftWingPivot as THREE.Group | undefined;
    const rw = mesh.userData.rightWingPivot as THREE.Group | undefined;
    if (lw) {
      lw.rotation.x = flapWave;
    }
    if (rw) {
      rw.rotation.x = -flapWave;
    }
    const tail = mesh.userData.tailGroup as THREE.Group | undefined;
    if (tail) {
      tail.rotation.z = Math.sin(this.clock * 10) * 0.12;
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
      position: [bx - 4.2, Math.max(1.25, by + 1.15), bz + 2.35],
      target: [bx + 5.8, Math.max(0.8, by - 0.1), 0]
    };
  }

  public sync(game: FlappyGame, dt: number, mode: CameraMode): void {
    this.clock += Math.max(0, dt);
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
    const pipeTex = game.theme.pipe === "green" ? this.greenPipeTex : this.redPipeTex;
    for (const pipe of game.pipes) {
      let mesh = this.pipeMeshes.get(pipe);
      if (!mesh) {
        mesh = createPipeMesh(pipe, game.theme.pipe, pipeTex);
        this.scene.add(mesh);
        this.pipeMeshes.set(pipe, mesh);
      }
      mesh.position.set(worldX(pipe.centerX), worldY(pipe.y + pipe.height / 2), 0);
    }

    const groundShift = (game.ground.x * WORLD_SCALE) % 4.4;
    if (this.groundTex) {
      this.groundTex.offset.x = -game.ground.x / 180;
    }
    for (let i = 0; i < this.groundSegments.length; i++) {
      this.groundSegments[i].position.x = -10 + i * 2.2 + groundShift;
    }

    for (const b of this.skyline) {
      b.position.x -= dt * 0.55;
      if (b.position.x < -14) {
        b.position.x = 28;
      }
    }

    for (const cloud of this.clouds) {
      cloud.position.x -= dt * 0.9;
      if (cloud.position.x < -10) {
        cloud.position.x = 20;
      }
    }

    const aliveParticles: VfxParticle[] = [];
    for (const p of this.particles) {
      p.life -= dt;
      if (p.life > 0) {
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 3.2 * dt;
        const scale = Math.max(0.15, p.life / p.maxLife);
        p.mesh.scale.setScalar(scale);
        aliveParticles.push(p);
      } else {
        this.scene.remove(p.mesh);
      }
    }
    this.particles = aliveParticles;

    if (this.shakeRemaining > 0) {
      this.shakeRemaining = Math.max(0, this.shakeRemaining - dt);
    }

    const pose = this.computeCameraPose(game, mode);
    const shakeAmp = this.shakeRemaining > 0 ? this.shakeRemaining * 0.55 : 0;
    const sx = shakeAmp ? Math.sin(this.clock * 65) * shakeAmp : 0;
    const sy = shakeAmp ? Math.cos(this.clock * 78) * shakeAmp : 0;

    if (!this.camInitialized || dt <= 0) {
      this.camera.position.set(pose.position[0] + sx, pose.position[1] + sy, pose.position[2]);
      this.camera.lookAt(pose.target[0], pose.target[1], pose.target[2]);
      this.camInitialized = true;
    } else {
      const alpha = 1 - Math.exp(-10 * Math.min(0.1, dt));
      this.camera.position.x += (pose.position[0] - this.camera.position.x) * alpha + sx;
      this.camera.position.y += (pose.position[1] - this.camera.position.y) * alpha + sy;
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
    let anatomyCount = 0;
    if (this.bird1Mesh) {
      const ud = this.bird1Mesh.userData;
      for (const k of ["leftWingPivot", "rightWingPivot", "tailGroup", "upperBeak", "lowerBeak"]) {
        if (ud[k]) {
          anatomyCount += 1;
        }
      }
    }
    return {
      pipeMeshes: this.pipeMeshes.size,
      hasBird2: this.bird2Mesh !== null,
      cameraMode: mode,
      background: game.theme.background,
      birdAnatomyParts: anatomyCount,
      activeParticles: this.particles.length,
      shakeRemaining: this.shakeRemaining
    };
  }
}
