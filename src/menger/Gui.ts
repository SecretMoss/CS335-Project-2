import { Camera } from "../lib/webglutils/Camera.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { MengerSponge } from "./MengerSponge.js";
import { Mat4, Vec3 } from "../lib/TSM.js";

interface IGUI {
  viewMatrix(): Mat4;
  projMatrix(): Mat4;
  dragStart(me: MouseEvent): void;
  drag(me: MouseEvent): void;
  dragEnd(me: MouseEvent): void;
  onKeydown(ke: KeyboardEvent): void;
}

export class GUI implements IGUI {
  private static readonly rotationSpeed: number = 0.05;
  private static readonly zoomSpeed: number = 0.1;
  private static readonly rollSpeed: number = 0.1;
  private static readonly panSpeed: number = 0.1;

  private camera: Camera;
  private dragging: boolean;
  private fps: boolean;
  private prevX: number;
  private prevY: number;

  private height: number;
  private width: number;

  private sponge: MengerSponge;
  private animation: CanvasAnimation;

  private eye: Vec3;
  private center: Vec3;
  private look: Vec3;
  private up: Vec3;
  private right: Vec3;
  private cameraDistance: number;

  constructor(
    canvas: HTMLCanvasElement,
    animation: CanvasAnimation,
    sponge: MengerSponge
  ) {
    this.height = canvas.height;
    this.width = canvas.width;
    this.prevX = 0;
    this.prevY = 0;

    this.sponge = sponge;
    this.animation = animation;

    this.reset();
    this.registerEventListeners(canvas);
  }

  public reset(): void {
    this.fps = true;
    this.dragging = false;

    this.cameraDistance = 6.0;
    this.center = new Vec3([0, 0, 0]);
    this.look = new Vec3([0, 0, -1]);
    this.up = new Vec3([0, 1, 0]);
    this.right = Vec3.cross(this.look, this.up, new Vec3()).normalize();
    this.eye = new Vec3([0, 0, this.cameraDistance]);

    this.rebuildCamera();
  }

  private rebuildCamera(): void {
    this.camera = new Camera(
      this.eye.copy(),
      this.center.copy(),
      this.up.copy(),
      45,
      this.width / this.height,
      0.1,
      1000.0
    );
  }

  private syncCenterFromEye(): void {
    this.center = this.eye.copy().add(this.look.copy().scale(this.cameraDistance));
  }

  private syncEyeFromCenter(): void {
    this.eye = this.center.copy().subtract(this.look.copy().scale(this.cameraDistance));
  }

  private reOrthonormalize(): void {
    this.look.normalize();
    this.right = Vec3.cross(this.look, this.up, new Vec3()).normalize();
    this.up = Vec3.cross(this.right, this.look, new Vec3()).normalize();
  }

  private rotateAroundAxis(v: Vec3, axis: Vec3, angle: number): Vec3 {
    const k = axis.copy().normalize();
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const term1 = v.copy().scale(cosA);
    const term2 = Vec3.cross(k, v, new Vec3()).scale(sinA);
    const term3 = k.copy().scale(Vec3.dot(k, v) * (1.0 - cosA));

    return term1.add(term2).add(term3);
  }

  public setCamera(
    pos: Vec3,
    target: Vec3,
    upDir: Vec3,
    fov: number,
    aspect: number,
    zNear: number,
    zFar: number
  ) {
    this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
  }

  public viewMatrix(): Mat4 {
    return this.camera.viewMatrix();
  }

  public projMatrix(): Mat4 {
    return this.camera.projMatrix();
  }

  public dragStart(mouse: MouseEvent): void {
    this.dragging = true;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
  }

  public drag(mouse: MouseEvent): void {
    if (!this.dragging) return;

    const dx = mouse.screenX - this.prevX;
    const dy = mouse.screenY - this.prevY;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;

    /* Left mouse = rotate/swivel */
    if ((mouse.buttons & 1) !== 0) {
      const dragWorld = this.right.copy().scale(dx).add(this.up.copy().scale(-dy));
      const axis = Vec3.cross(dragWorld, this.look, new Vec3());

      if (axis.length() > 1e-6) {
        const rotAxis = axis.normalize();
        this.look = this.rotateAroundAxis(this.look, rotAxis, GUI.rotationSpeed);
        this.up = this.rotateAroundAxis(this.up, rotAxis, GUI.rotationSpeed);
        this.reOrthonormalize();
        this.syncCenterFromEye();
        this.rebuildCamera();
      }
    }

    /* Right mouse = zoom */
    if ((mouse.buttons & 2) !== 0) {
      this.cameraDistance -= Math.sign(-dy) * GUI.zoomSpeed;

      if (this.cameraDistance < 0.2) {
        this.cameraDistance = 0.2;
      }

      this.syncEyeFromCenter();
      this.rebuildCamera();
    }
  }

  public dragEnd(mouse: MouseEvent): void {
    this.dragging = false;
    this.prevX = 0;
    this.prevY = 0;
  }

  public onKeydown(key: KeyboardEvent): void {
    switch (key.code) {
      case "KeyW": {
        if (this.fps) {
          const d = this.look.copy().scale(GUI.zoomSpeed);
          this.eye.add(d);
          this.center.add(d);
          this.rebuildCamera();
        }
        break;
      }

      case "KeyS": {
        if (this.fps) {
          const d = this.look.copy().scale(-GUI.zoomSpeed);
          this.eye.add(d);
          this.center.add(d);
          this.rebuildCamera();
        }
        break;
      }

      case "KeyA": {
        if (this.fps) {
          const d = this.right.copy().scale(-GUI.panSpeed);
          this.eye.add(d);
          this.center.add(d);
          this.rebuildCamera();
        }
        break;
      }

      case "KeyD": {
        if (this.fps) {
          const d = this.right.copy().scale(GUI.panSpeed);
          this.eye.add(d);
          this.center.add(d);
          this.rebuildCamera();
        }
        break;
      }

      case "ArrowUp": {
        if (this.fps) {
          const d = this.up.copy().scale(GUI.panSpeed);
          this.eye.add(d);
          this.center.add(d);
          this.rebuildCamera();
        }
        break;
      }

      case "ArrowDown": {
        if (this.fps) {
          const d = this.up.copy().scale(-GUI.panSpeed);
          this.eye.add(d);
          this.center.add(d);
          this.rebuildCamera();
        }
        break;
      }

      case "ArrowLeft": {
        this.up = this.rotateAroundAxis(this.up, this.look, GUI.rollSpeed);
        this.right = this.rotateAroundAxis(this.right, this.look, GUI.rollSpeed);
        this.reOrthonormalize();
        this.rebuildCamera();
        break;
      }

      case "ArrowRight": {
        this.up = this.rotateAroundAxis(this.up, this.look, -GUI.rollSpeed);
        this.right = this.rotateAroundAxis(this.right, this.look, -GUI.rollSpeed);
        this.reOrthonormalize();
        this.rebuildCamera();
        break;
      }

      case "Digit1": {
        (this.animation as any).setLevel(0);
        break;
      }

      case "Digit2": {
        (this.animation as any).setLevel(1);
        break;
      }

      case "Digit3": {
        (this.animation as any).setLevel(2);
        break;
      }

      case "Digit4": {
        (this.animation as any).setLevel(3);
        break;
      }

      case "KeyR": {
        this.reset();
        break;
      }

      default: {
        console.log("Key : '", key.code, "' was pressed.");
        break;
      }
    }
  }

  private registerEventListeners(canvas: HTMLCanvasElement): void {
    window.addEventListener("keydown", (key: KeyboardEvent) =>
      this.onKeydown(key)
    );

    canvas.addEventListener("mousedown", (mouse: MouseEvent) =>
      this.dragStart(mouse)
    );

    canvas.addEventListener("mousemove", (mouse: MouseEvent) =>
      this.drag(mouse)
    );

    canvas.addEventListener("mouseup", (mouse: MouseEvent) =>
      this.dragEnd(mouse)
    );

    canvas.addEventListener("contextmenu", (event: any) =>
      event.preventDefault()
    );
  }
}