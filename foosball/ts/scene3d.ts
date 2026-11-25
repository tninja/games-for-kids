import * as THREE from "three";
import {
  BALL_RADIUS,
  CORNER_RAMP_SIZE,
  FIELD_LENGTH,
  FIELD_WIDTH,
  GOAL_DEPTH,
  GOAL_HEIGHT,
  GOAL_WIDTH,
  HALF_GOAL_WIDTH,
  HALF_LENGTH,
  HALF_WIDTH,
  ROD_CONFIGS,
  ROD_RADIUS,
  ROD_Y,
  TEAM_PALETTES
} from "./constants";
import { FoosballGame } from "./game";
import { CameraMode, Team, TeamColorTheme } from "./types";

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

export interface SceneStats {
  rodMeshes: number;
  figureMeshes: number;
  scoreBeads: number;
  activeTrailCount: number;
  activeConfetti: number;
  cameraMode: CameraMode;
  webglAvailable: boolean;
}

interface RodVisual {
  index: number;
  team: Team;
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  jerseyMeshes: THREE.Mesh[];
  trimMeshes: THREE.Mesh[];
}

interface ConfettiParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
}

export class FoosballScene3D {
  public readonly headless: boolean;
  public readonly webglAvailable: boolean;

  private canvas: HTMLCanvasElement | null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private rodVisuals: RodVisual[] = [];
  private figureMeshCount = 0;
  private ballMesh: THREE.Mesh;
  private ballShadow: THREE.Mesh;
  private trailMeshes: THREE.Mesh[] = [];
  private trailHistory: Array<{ x: number; y: number; z: number; alpha: number }> = [];
  private blueBeads: THREE.Mesh[] = [];
  private redBeads: THREE.Mesh[] = [];
  private practiceTargetMesh: THREE.Mesh;
  private confetti: ConfettiParticle[] = [];

  private blueMat: THREE.MeshStandardMaterial;
  private blueTrimMat: THREE.MeshStandardMaterial;
  private redMat: THREE.MeshStandardMaterial;
  private redTrimMat: THREE.MeshStandardMaterial;
  private appliedTheme: TeamColorTheme = "classic";

  private shakeTimer = 0;
  private smoothCamPos = new THREE.Vector3(0, 1.05, 0.8);
  private smoothCamTarget = new THREE.Vector3(0, 0, 0.02);

  constructor(canvas: HTMLCanvasElement | null, headless = false) {
    this.canvas = canvas;
    this.headless = headless || !canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f1b24);

    this.camera = new THREE.PerspectiveCamera(42, 16 / 10, 0.05, 15);
    this.camera.position.copy(this.smoothCamPos);
    this.camera.lookAt(this.smoothCamTarget);

    const pal = TEAM_PALETTES.classic;
    this.blueMat = new THREE.MeshStandardMaterial({ color: pal.bluePrimary, roughness: 0.35, metalness: 0.08 });
    this.blueTrimMat = new THREE.MeshStandardMaterial({ color: pal.blueTrim, roughness: 0.45 });
    this.redMat = new THREE.MeshStandardMaterial({ color: pal.redPrimary, roughness: 0.35, metalness: 0.08 });
    this.redTrimMat = new THREE.MeshStandardMaterial({ color: pal.redTrim, roughness: 0.45 });

    this.setupLighting();
    this.buildTable();
    this.buildScoreBeads();
    this.buildRods();
    this.ballMesh = this.buildBall();
    this.ballShadow = this.buildBallShadow();
    this.practiceTargetMesh = this.buildPracticeTarget();
    this.buildTrailPool();

    let webglOk = false;
    if (!this.headless && canvas) {
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.resize();
        webglOk = true;
      } catch {
        this.renderer = null;
        webglOk = false;
      }
    }
    this.webglAvailable = webglOk;
  }

  private setupLighting(): void {
    const hemi = new THREE.HemisphereLight(0xf6f9ff, 0x2a1c12, 0.75);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff6e5, 1.35);
    key.position.set(0.45, 1.8, 0.75);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.3;
    key.shadow.camera.far = 4.5;
    key.shadow.camera.left = -1.0;
    key.shadow.camera.right = 1.0;
    key.shadow.camera.top = 0.8;
    key.shadow.camera.bottom = -0.8;
    key.shadow.bias = -0.001;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x9fc6ff, 0.42);
    fill.position.set(-0.7, 1.1, -0.65);
    this.scene.add(fill);
  }

  private buildTable(): void {
    const tableGroup = new THREE.Group();

    // Floor shadow catcher
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b151d, roughness: 0.92 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.52;
    floor.receiveShadow = true;
    tableGroup.add(floor);

    // Green tournament pitch
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x167a3f, roughness: 0.76, metalness: 0.04 });
    const pitch = new THREE.Mesh(new THREE.BoxGeometry(FIELD_LENGTH + 0.02, 0.025, FIELD_WIDTH + 0.02), pitchMat);
    pitch.position.y = -0.0125;
    pitch.receiveShadow = true;
    tableGroup.add(pitch);

    // Crisp white painted pitch lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf0f7f2 });
    const addLine = (w: number, d: number, x: number, z: number): void => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineMat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(x, 0.001, z);
      tableGroup.add(m);
    };
    const lw = 0.007;
    // Outer pitch border lines
    addLine(FIELD_LENGTH - 0.02, lw, 0, -HALF_WIDTH + 0.012);
    addLine(FIELD_LENGTH - 0.02, lw, 0, HALF_WIDTH - 0.012);
    addLine(lw, FIELD_WIDTH - 0.02, -HALF_LENGTH + 0.012, 0);
    addLine(lw, FIELD_WIDTH - 0.02, HALF_LENGTH - 0.012, 0);
    // Halfway line
    addLine(lw, FIELD_WIDTH - 0.02, 0, 0);
    // Center circle & dot
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.088, 0.095, 40), lineMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.0012;
    tableGroup.add(ring);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), lineMat);
    dot.rotation.x = -Math.PI / 2;
    dot.position.y = 0.0013;
    tableGroup.add(dot);
    // Penalty boxes (left & right)
    const boxW = 0.16;
    const boxD = 0.34;
    for (const side of [-1, 1]) {
      addLine(boxW, lw, side * (HALF_LENGTH - boxW / 2 - 0.01), -boxD / 2);
      addLine(boxW, lw, side * (HALF_LENGTH - boxW / 2 - 0.01), boxD / 2);
      addLine(lw, boxD, side * (HALF_LENGTH - boxW - 0.01), 0);
    }

    // 4 visible corner anti-dead-ball sloped wedges
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x1c8c4a, roughness: 0.72 });
    const cornerSigns: Array<[number, number]> = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ];
    for (const [sx, sz] of cornerSigns) {
      const wedge = new THREE.Mesh(new THREE.BoxGeometry(CORNER_RAMP_SIZE * 0.9, 0.008, CORNER_RAMP_SIZE * 0.9), rampMat);
      wedge.position.set(
        sx * (HALF_LENGTH - CORNER_RAMP_SIZE * 0.34),
        0.001,
        sz * (HALF_WIDTH - CORNER_RAMP_SIZE * 0.34)
      );
      wedge.rotation.y = Math.PI / 4;
      wedge.rotation.z = sx * 0.08;
      wedge.rotation.x = -sz * 0.08;
      tableGroup.add(wedge);
    }

    // Classic dark walnut wood cabinet walls
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x5c341d, roughness: 0.55, metalness: 0.05 });
    const woodTop = new THREE.MeshStandardMaterial({ color: 0x7a4828, roughness: 0.42, metalness: 0.08 });
    const innerTrim = new THREE.MeshStandardMaterial({ color: 0xdecbb0, roughness: 0.65 });
    const wallT = 0.048;
    const wallH = 0.155;
    const wallY = wallH / 2 - 0.03;

    // Long side walls (+/- Z)
    for (const sz of [-1, 1]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(FIELD_LENGTH + wallT * 2, wallH, wallT), woodDark);
      wall.position.set(0, wallY, sz * (HALF_WIDTH + wallT / 2));
      wall.castShadow = true;
      wall.receiveShadow = true;
      tableGroup.add(wall);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(FIELD_LENGTH + wallT * 2 + 0.008, 0.014, wallT + 0.01), woodTop);
      cap.position.set(0, wallY + wallH / 2 + 0.005, sz * (HALF_WIDTH + wallT / 2));
      tableGroup.add(cap);

      const liner = new THREE.Mesh(new THREE.BoxGeometry(FIELD_LENGTH, 0.028, 0.006), innerTrim);
      liner.position.set(0, 0.014, sz * (HALF_WIDTH + 0.002));
      tableGroup.add(liner);

      // Side serve hole port cup
      const serveCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.02, 20),
        new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.4, metalness: 0.4 })
      );
      serveCup.rotation.x = Math.PI / 2;
      serveCup.position.set(0, 0.048, sz * (HALF_WIDTH + wallT * 0.52));
      tableGroup.add(serveCup);
    }

    // End walls with recessed goal cutouts (+/- X)
    const sideSegmentZ = (FIELD_WIDTH - GOAL_WIDTH) / 2;
    const metalGoalMat = new THREE.MeshStandardMaterial({ color: 0x2b333b, roughness: 0.4, metalness: 0.6 });
    const goalBackMat = new THREE.MeshStandardMaterial({ color: 0x8f9aa4, roughness: 0.35, metalness: 0.7 });

    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const seg = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, sideSegmentZ), woodDark);
        seg.position.set(
          sx * (HALF_LENGTH + wallT / 2),
          wallY,
          sz * (HALF_GOAL_WIDTH + sideSegmentZ / 2)
        );
        seg.castShadow = true;
        seg.receiveShadow = true;
        tableGroup.add(seg);
      }
      // Header bar above goal opening
      const headerH = wallH - GOAL_HEIGHT - 0.03;
      const header = new THREE.Mesh(new THREE.BoxGeometry(wallT, headerH, GOAL_WIDTH + 0.01), woodDark);
      header.position.set(sx * (HALF_LENGTH + wallT / 2), GOAL_HEIGHT + headerH / 2, 0);
      tableGroup.add(header);

      const endCap = new THREE.Mesh(new THREE.BoxGeometry(wallT + 0.01, 0.014, FIELD_WIDTH + wallT * 2 + 0.008), woodTop);
      endCap.position.set(sx * (HALF_LENGTH + wallT / 2), wallY + wallH / 2 + 0.005, 0);
      tableGroup.add(endCap);

      // Metallic goal posts
      for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, GOAL_HEIGHT, 12), goalBackMat);
        post.position.set(sx * HALF_LENGTH, GOAL_HEIGHT / 2, sz * HALF_GOAL_WIDTH);
        tableGroup.add(post);
      }

      // Recessed goal box & tin catch plate
      const goalFloor = new THREE.Mesh(new THREE.BoxGeometry(GOAL_DEPTH, 0.016, GOAL_WIDTH + 0.01), metalGoalMat);
      goalFloor.position.set(sx * (HALF_LENGTH + GOAL_DEPTH / 2), -0.008, 0);
      tableGroup.add(goalFloor);

      const goalBack = new THREE.Mesh(new THREE.BoxGeometry(0.012, GOAL_HEIGHT + 0.01, GOAL_WIDTH + 0.012), goalBackMat);
      goalBack.position.set(sx * (HALF_LENGTH + GOAL_DEPTH), GOAL_HEIGHT / 2, 0);
      tableGroup.add(goalBack);

      for (const sz of [-1, 1]) {
        const goalSide = new THREE.Mesh(new THREE.BoxGeometry(GOAL_DEPTH, GOAL_HEIGHT, 0.01), metalGoalMat);
        goalSide.position.set(sx * (HALF_LENGTH + GOAL_DEPTH / 2), GOAL_HEIGHT / 2, sz * (HALF_GOAL_WIDTH + 0.004));
        tableGroup.add(goalSide);
      }
    }

    // Lower cabinet apron + 4 sturdy wooden legs
    const apron = new THREE.Mesh(new THREE.BoxGeometry(FIELD_LENGTH + 0.04, 0.09, FIELD_WIDTH + 0.04), woodDark);
    apron.position.y = -0.075;
    tableGroup.add(apron);

    const legGeo = new THREE.BoxGeometry(0.065, 0.44, 0.065);
    for (const [sx, sz] of cornerSigns) {
      const leg = new THREE.Mesh(legGeo, woodDark);
      leg.position.set(sx * (HALF_LENGTH - 0.05), -0.3, sz * (HALF_WIDTH - 0.05));
      tableGroup.add(leg);
    }

    this.scene.add(tableGroup);
  }

  private buildScoreBeads(): void {
    const barMat = new THREE.MeshStandardMaterial({ color: 0xcfd6de, roughness: 0.25, metalness: 0.85 });
    const beadGeo = new THREE.BoxGeometry(0.018, 0.022, 0.016);
    const barZSpan = 0.28;

    const addRack = (team: Team, x: number, mat: THREE.MeshStandardMaterial, targetList: THREE.Mesh[]): void => {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, barZSpan, 10), barMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(x, 0.148, 0);
      this.scene.add(bar);

      for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.024, 8), barMat);
        post.position.set(x, 0.136, sz * (barZSpan / 2));
        this.scene.add(post);
      }

      for (let i = 0; i < 10; i++) {
        const bead = new THREE.Mesh(beadGeo, mat);
        bead.position.set(x, 0.148, -barZSpan * 0.42 + i * 0.017);
        bead.userData.team = team;
        bead.castShadow = true;
        this.scene.add(bead);
        targetList.push(bead);
      }
    };

    // Blue beads on left end (-X), Red beads on right end (+X)
    addRack("blue", -HALF_LENGTH - 0.024, this.blueMat, this.blueBeads);
    addRack("red", HALF_LENGTH + 0.024, this.redMat, this.redBeads);
  }

  private buildRods(): void {
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd9e1e8, roughness: 0.18, metalness: 0.9 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x1b1e23, roughness: 0.78, metalness: 0.08 });
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.85 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x261d17, roughness: 0.75 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.5 });

    const rodLength = FIELD_WIDTH + 0.36;

    for (const cfg of ROD_CONFIGS) {
      const group = new THREE.Group();
      group.position.set(cfg.x, ROD_Y, 0);

      // Chrome steel shaft along Z
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(ROD_RADIUS, ROD_RADIUS, rodLength, 14), chromeMat);
      shaft.rotation.x = Math.PI / 2;
      shaft.castShadow = true;
      group.add(shaft);

      // Ergonomic handle on team's playing side (+Z for Blue, -Z for Red)
      const handleSide = cfg.team === "blue" ? 1 : -1;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.0155, 0.0135, 0.105, 16), gripMat);
      handle.rotation.x = Math.PI / 2;
      handle.position.z = handleSide * (rodLength / 2 + 0.032);
      group.add(handle);

      // Rubber wall bumpers
      for (const sz of [-1, 1]) {
        const bumper = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.018, 12), bumperMat);
        bumper.rotation.x = Math.PI / 2;
        bumper.position.z = sz * (HALF_WIDTH - 0.016);
        group.add(bumper);
      }

      // Subtle glowing indicator ring near handle (lights up when charging or active in advanced mode)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffd166,
        transparent: true,
        opacity: 0
      });
      const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.004, 10, 20), ringMat);
      ringMesh.position.z = handleSide * (HALF_WIDTH + 0.068);
      group.add(ringMesh);

      const primaryMat = cfg.team === "blue" ? this.blueMat : this.redMat;
      const trimMat = cfg.team === "blue" ? this.blueTrimMat : this.redTrimMat;
      const jerseyMeshes: THREE.Mesh[] = [];
      const trimMeshes: THREE.Mesh[] = [];
      const facingDir = cfg.team === "blue" ? 1 : -1;

      for (const zOff of cfg.figureOffsets) {
        const fig = new THREE.Group();
        fig.position.z = zOff;

        // Collar around rod
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.022, 10), primaryMat);
        collar.rotation.x = Math.PI / 2;
        fig.add(collar);
        jerseyMeshes.push(collar);

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.021, 0.034, 0.026), primaryMat);
        torso.position.y = 0.016;
        torso.castShadow = true;
        fig.add(torso);
        jerseyMeshes.push(torso);

        // Jersey chest stripe
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.0225, 0.01, 0.027), trimMat);
        stripe.position.y = 0.018;
        fig.add(stripe);
        trimMeshes.push(stripe);

        // Head + hair cap
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 12, 10), skinMat);
        head.position.y = 0.043;
        head.castShadow = true;
        fig.add(head);

        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.0118, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
        cap.position.y = 0.045;
        fig.add(cap);

        // Shorts
        const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.019, 0.018, 0.024), trimMat);
        shorts.position.y = -0.014;
        fig.add(shorts);
        trimMeshes.push(shorts);

        // Tapered kicking leg & foot
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.036, 0.021), primaryMat);
        leg.position.y = -0.038;
        leg.castShadow = true;
        fig.add(leg);
        jerseyMeshes.push(leg);

        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.021, 0.013, 0.023), shoeMat);
        foot.position.set(facingDir * 0.003, -0.056, 0);
        foot.castShadow = true;
        fig.add(foot);

        group.add(fig);
        this.figureMeshCount += 1;
      }

      this.scene.add(group);
      this.rodVisuals.push({
        index: cfg.index,
        team: cfg.team,
        group,
        ringMesh,
        jerseyMeshes,
        trimMeshes
      });
    }
  }

  private buildBall(): THREE.Mesh {
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xf7f8fa,
      roughness: 0.25,
      metalness: 0.05,
      emissive: 0xffaa22,
      emissiveIntensity: 0
    });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS, 20, 16), ballMat);
    ball.castShadow = true;
    ball.position.set(0, BALL_RADIUS, 0);
    this.scene.add(ball);
    return ball;
  }

  private buildBallShadow(): THREE.Mesh {
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(BALL_RADIUS * 1.05, 16), mat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.set(0, 0.002, 0);
    this.scene.add(disc);
    return disc;
  }

  private buildPracticeTarget(): THREE.Mesh {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      emissive: 0xff9f1c,
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.058, 0.096), mat);
    mesh.position.set(HALF_LENGTH + 0.015, 0.032, 0);
    mesh.visible = false;
    this.scene.add(mesh);
    return mesh;
  }

  private buildTrailPool(): void {
    for (let i = 0; i < 8; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffcf5c,
        transparent: true,
        opacity: 0
      });
      const m = new THREE.Mesh(new THREE.SphereGeometry(BALL_RADIUS * (0.85 - i * 0.07), 10, 8), mat);
      m.visible = false;
      this.scene.add(m);
      this.trailMeshes.push(m);
    }
  }

  public spawnGoalConfetti(scorer: Team): void {
    const pal = TEAM_PALETTES[this.appliedTheme];
    const color = scorer === "blue" ? pal.bluePrimary : pal.redPrimary;
    const goalX = scorer === "blue" ? HALF_LENGTH : -HALF_LENGTH;
    const geo = new THREE.BoxGeometry(0.014, 0.014, 0.006);
    for (let i = 0; i < 22; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xffd166 : color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(goalX, 0.08, (Math.random() - 0.5) * GOAL_WIDTH);
      this.scene.add(mesh);
      this.confetti.push({
        mesh,
        vx: -Math.sign(goalX) * (0.2 + Math.random() * 0.5) + (Math.random() - 0.5) * 0.3,
        vy: 0.55 + Math.random() * 0.75,
        vz: (Math.random() - 0.5) * 0.7,
        life: 1.1 + Math.random() * 0.4
      });
    }
  }

  public triggerShake(duration = 0.22): void {
    this.shakeTimer = Math.max(this.shakeTimer, duration);
  }

  public applyTheme(theme: TeamColorTheme): void {
    if (this.appliedTheme === theme) return;
    this.appliedTheme = theme;
    const pal = TEAM_PALETTES[theme];
    this.blueMat.color.setHex(pal.bluePrimary);
    this.blueTrimMat.color.setHex(pal.blueTrim);
    this.redMat.color.setHex(pal.redPrimary);
    this.redTrimMat.color.setHex(pal.redTrim);
  }

  public computeCameraPose(game: FoosballGame, mode: CameraMode): CameraPose {
    const bx = Math.max(-0.45, Math.min(0.45, game.ball.x));
    const bz = Math.max(-0.25, Math.min(0.25, game.ball.z));
    if (mode === "top") {
      return {
        position: [0, 1.56, 0.015],
        target: [0, 0, 0]
      };
    }
    if (mode === "closeup") {
      return {
        position: [bx * 0.28, 0.66, 0.68],
        target: [bx * 0.22, 0.03, bz * 0.2]
      };
    }
    // Default "angled" classic 3/4 table view
    return {
      position: [bx * 0.14, 1.06, 0.82],
      target: [bx * 0.1, 0.0, 0.02]
    };
  }

  public resize(): void {
    if (!this.renderer || !this.canvas) return;
    const w = Math.max(1, this.canvas.clientWidth || 640);
    const h = Math.max(1, this.canvas.clientHeight || 400);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  public render(game: FoosballGame, dt: number, cameraMode: CameraMode): void {
    this.applyTheme(game.theme);

    // Sync rods & highlights
    for (const rv of this.rodVisuals) {
      const rod = game.rods[rv.index];
      const teamDir = rod.team === "blue" ? 1 : -1;
      rv.group.position.set(rod.x, ROD_Y, rod.z);
      rv.group.rotation.z = rod.angle * teamDir;

      const ringMat = rv.ringMesh.material as THREE.MeshBasicMaterial;
      const isCharging = rod.kickPhase === "charging" && rod.chargeTime > 0.06;
      const isActiveAdv =
        game.controlMode === "advanced" &&
        ((rod.team === "blue" && rod.role === game.activeRodRole.blue) ||
          (rod.team === "red" && game.mode === "2p_pvp" && rod.role === game.activeRodRole.red));
      if (isCharging) {
        ringMat.color.setHex(0xffb703);
        ringMat.opacity = Math.min(0.95, 0.35 + rod.chargeTime * 1.1);
      } else if (isActiveAdv) {
        ringMat.color.setHex(0x80ffdb);
        ringMat.opacity = 0.72;
      } else {
        ringMat.opacity = 0;
      }
    }

    // Sync ball + spin + glow
    this.ballMesh.position.set(game.ball.x, game.ball.y, game.ball.z);
    this.ballMesh.rotation.z += game.ball.spinZ * dt;
    this.ballMesh.rotation.x += game.ball.spinX * dt;
    const bMat = this.ballMesh.material as THREE.MeshStandardMaterial;
    bMat.emissiveIntensity = game.ball.powerGlow * 0.9;
    this.ballShadow.position.set(game.ball.x, 0.002, game.ball.z);

    // Update power-shot ball trail
    if (game.ball.powerGlow > 0.15 && game.phase === "playing") {
      this.trailHistory.unshift({ x: game.ball.x, y: game.ball.y, z: game.ball.z, alpha: game.ball.powerGlow });
      if (this.trailHistory.length > this.trailMeshes.length) {
        this.trailHistory.pop();
      }
    } else if (this.trailHistory.length > 0) {
      this.trailHistory.pop();
    }
    for (let i = 0; i < this.trailMeshes.length; i++) {
      const m = this.trailMeshes[i];
      const h = this.trailHistory[i];
      if (h) {
        m.visible = true;
        m.position.set(h.x, h.y, h.z);
        (m.material as THREE.MeshBasicMaterial).opacity = h.alpha * (1 - i / this.trailMeshes.length) * 0.55;
      } else {
        m.visible = false;
      }
    }

    // Sync mechanical score beads (slide scored beads cleanly to the scored end of the bar)
    const updateBeads = (beads: THREE.Mesh[], count: number): void => {
      const clamped = Math.max(0, Math.min(10, count));
      for (let i = 0; i < beads.length; i++) {
        const isScored = i < clamped;
        const targetZ = isScored ? 0.118 - i * 0.016 : -0.118 + (9 - i) * 0.016;
        beads[i].position.z += (targetZ - beads[i].position.z) * Math.min(1, dt * 10 + 0.12);
      }
    };
    updateBeads(this.blueBeads, game.score.blue);
    updateBeads(this.redBeads, game.score.red);

    // Sync practice target
    this.practiceTargetMesh.visible = game.mode === "practice";
    if (game.mode === "practice") {
      this.practiceTargetMesh.position.z = game.practiceTarget.z;
      const scale = 1 + game.practiceTarget.pulse * 0.35;
      this.practiceTargetMesh.scale.set(1, scale, scale);
    }

    // Update goal celebration confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const p = this.confetti[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.confetti.splice(i, 1);
      } else {
        p.vy -= 2.4 * dt;
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y = Math.max(0.01, p.mesh.position.y + p.vy * dt);
        p.mesh.position.z += p.vz * dt;
        p.mesh.rotation.x += 8 * dt;
        p.mesh.rotation.y += 6 * dt;
      }
    }

    // Smooth camera tracking + subtle impact shake
    const desired = this.computeCameraPose(game, cameraMode);
    const lerpFactor = Math.min(1, dt * 6.5 + 0.12);
    this.smoothCamPos.lerp(new THREE.Vector3(...desired.position), lerpFactor);
    this.smoothCamTarget.lerp(new THREE.Vector3(...desired.target), lerpFactor);

    let shakeX = 0;
    let shakeZ = 0;
    if (this.shakeTimer > 0) {
      this.shakeTimer = Math.max(0, this.shakeTimer - dt);
      const mag = this.shakeTimer * 0.045;
      shakeX = (Math.random() - 0.5) * mag;
      shakeZ = (Math.random() - 0.5) * mag;
    }

    this.camera.position.set(this.smoothCamPos.x + shakeX, this.smoothCamPos.y, this.smoothCamPos.z + shakeZ);
    this.camera.lookAt(this.smoothCamTarget);

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public stats(cameraMode: CameraMode): SceneStats {
    return {
      rodMeshes: this.rodVisuals.length,
      figureMeshes: this.figureMeshCount,
      scoreBeads: this.blueBeads.length + this.redBeads.length,
      activeTrailCount: this.trailHistory.length,
      activeConfetti: this.confetti.length,
      cameraMode,
      webglAvailable: this.webglAvailable
    };
  }
}
