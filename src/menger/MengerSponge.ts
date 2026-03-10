import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IMengerSponge {
  setLevel(level: number): void;
  isDirty(): boolean;
  setClean(): void;
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

/**
 * Represents a Menger Sponge
 */
export class MengerSponge implements IMengerSponge {

  // TODO: sponge data structures
  
  private positions: number[] = [];
  private indices: number[] = [];
  private normals: number[] = [];
  private dirty: boolean = true;
  
  constructor(level: number) {
	  this.setLevel(level);
	  // TODO: other initialization	  
  }

  /**
   * Returns true if the sponge has changed.
   */
  public isDirty(): boolean {
       return this.dirty;
  }

  public setClean(): void {
    this.dirty = false;
  }
  
  public setLevel(level: number)
  {
	  // TODO: initialize the cube

    this.positions = [];
    this.indices = [];
    this.normals = [];

    this.buildSponge(-0.5, -0.5, -0.5, 1.0, level);

    this.dirty = true;
  }

private buildSponge(x: number, y: number, z: number, size: number, currentLevel: number) {
    // Base Case: We've reached the bottom level, so draw a real cube
    if (currentLevel === 0) {
      this.generateCube(x, y, z, size);
    } 
    // Subdivide into 27 smaller cubes and filter out the centers
    else {
      const newSize = size / 3.0;

      // Loop through the 3x3x3 grid
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            
            // To delete the 7 inner subcubes, check if the current grid coordinate (i, j, k) 
            // is in the center (index 1)
            let centerCount = 0;
            if (i === 1) centerCount++;
            if (j === 1) centerCount++;
            if (k === 1) centerCount++;

            if (centerCount >= 2) {
              continue; // Skip drawing this subcube
            }

            // Calculate the starting coordinates for this specific subcube
            const newX = x + (i * newSize);
            const newY = y + (j * newSize);
            const newZ = z + (k * newSize);

            // Recurse down
            this.buildSponge(newX, newY, newZ, newSize, currentLevel - 1);
          }
        }
      }
    }
  }

  private generateCube(x: number, y: number, z: number, size: number) {
    const minX = x, minY = y, minZ = z;
    const maxX = x + size, maxY = y + size, maxZ = z + size;

    const offset = this.positions.length / 4; 

    // FRONT FACE (z = maxZ) - Normal (0, 0, 1)
    this.positions.push(
      minX, minY, maxZ, 1.0,  maxX, minY, maxZ, 1.0,
      maxX, maxY, maxZ, 1.0,  minX, maxY, maxZ, 1.0
    );
    this.normals.push(
      0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 1.0, 0.0,  0.0, 0.0, 1.0, 0.0
    );
    this.indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);

    // BACK FACE (z = minZ) - Normal (0, 0, -1)
    this.positions.push(
      minX, minY, minZ, 1.0,  minX, maxY, minZ, 1.0,
      maxX, maxY, minZ, 1.0,  maxX, minY, minZ, 1.0
    );
    this.normals.push(
      0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0,
      0.0, 0.0, -1.0, 0.0,  0.0, 0.0, -1.0, 0.0
    );
    this.indices.push(offset + 4, offset + 5, offset + 6, offset + 4, offset + 6, offset + 7);

    // TOP FACE (y = maxY) - Normal (0, 1, 0)
    this.positions.push(
      minX, maxY, minZ, 1.0,  minX, maxY, maxZ, 1.0,
      maxX, maxY, maxZ, 1.0,  maxX, maxY, minZ, 1.0
    );
    this.normals.push(
      0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,  0.0, 1.0, 0.0, 0.0
    );
    this.indices.push(offset + 8, offset + 9, offset + 10, offset + 8, offset + 10, offset + 11);

    // BOTTOM FACE (y = minY) - Normal (0, -1, 0)
    this.positions.push(
      minX, minY, minZ, 1.0,  maxX, minY, minZ, 1.0,
      maxX, minY, maxZ, 1.0,  minX, minY, maxZ, 1.0
    );
    this.normals.push(
      0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0,
      0.0, -1.0, 0.0, 0.0,  0.0, -1.0, 0.0, 0.0
    );
    this.indices.push(offset + 12, offset + 13, offset + 14, offset + 12, offset + 14, offset + 15);

    // RIGHT FACE (x = maxX) - Normal (1, 0, 0)
    this.positions.push(
      maxX, minY, minZ, 1.0,  maxX, maxY, minZ, 1.0,
      maxX, maxY, maxZ, 1.0,  maxX, minY, maxZ, 1.0
    );
    this.normals.push(
      1.0, 0.0, 0.0, 0.0,  1.0, 0.0, 0.0, 0.0,
      1.0, 0.0, 0.0, 0.0,  1.0, 0.0, 0.0, 0.0
    );
    this.indices.push(offset + 16, offset + 17, offset + 18, offset + 16, offset + 18, offset + 19);

    // LEFT FACE (x = minX) - Normal (-1, 0, 0)
    this.positions.push(
      minX, minY, minZ, 1.0,  minX, minY, maxZ, 1.0,
      minX, maxY, maxZ, 1.0,  minX, maxY, minZ, 1.0
    );
    this.normals.push(
      -1.0, 0.0, 0.0, 0.0,  -1.0, 0.0, 0.0, 0.0,
      -1.0, 0.0, 0.0, 0.0,  -1.0, 0.0, 0.0, 0.0
    );
    this.indices.push(offset + 20, offset + 21, offset + 22, offset + 20, offset + 22, offset + 23);
  }

  /* Returns a flat Float32Array of the sponge's vertex positions */
  public positionsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return new Float32Array(this.positions);
  }

  /**
   * Returns a flat Uint32Array of the sponge's face indices
   */
  public indicesFlat(): Uint32Array {
    // TODO: right now this makes a single triangle. Make the cube fractal instead.
    return new Uint32Array(this.indices);
  }

  /**
   * Returns a flat Float32Array of the sponge's normals
   */
  public normalsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return new Float32Array(this.normals);
  }

  /**
   * Returns the model matrix of the sponge
   */
  public uMatrix(): Mat4 {

    // TODO: change this, if it's useful
    const ret : Mat4 = new Mat4().setIdentity();
    
    // Add this line to tilt the cube on the X and Y axes
    ret.rotate(0.5, new Vec3([1.0, 1.0, 0.0]));

    return ret;
  }
  
}
