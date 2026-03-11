export let defaultVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec4 aNorm;

    varying vec4 lightDir;
    varying vec4 normal;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main () {
        // Transform the vertex position to world space
        vec4 worldPos = mWorld * vec4(vertPosition, 1.0);
        gl_Position = mProj * mView * worldPos; // Transform to clip space

        lightDir = lightPosition - worldPos; // Calculate light direction in world space

        // Pass the normal to the fragment shader (already in world space)
        normal = aNorm; 
    }
`;

export let defaultFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;

    void main () {
        vec3 N = normalize(normal.xyz); 
        vec3 L = normalize(lightDir.xyz); 

        vec3 baseColor;
        vec3 aN = abs(N); // considers both positive and negative normals

        if (aN.x > 0.9) {
            baseColor = vec3(1.0, 0.0, 0.0);
        } else if (aN.y > 0.9) {
            baseColor = vec3(0.0, 1.0, 0.0);
        } else {
            baseColor = vec3(0.0, 0.0, 1.0);
        }

        float diffuse = max(dot(N, L), 0.0); 
        float ambient = 0.1; // Ambient lighting component this number is somewhat arbitrary, but amb + diffuse should not be > 1.0
        float lighting = ambient + 0.9 * diffuse; // Combine ambient and diffuse lighting

        gl_FragColor = vec4(baseColor * lighting, 1.0);
    }
`;

export let floorVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec4 aNorm;

    varying vec4 lightDir;
    varying vec4 normal;
    varying vec3 worldPos;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main () {
        vec4 wp = mWorld * vec4(vertPosition, 1.0);
        worldPos = wp.xyz;
        gl_Position = mProj * mView * wp;

        lightDir = lightPosition - wp;
        normal = aNorm;
    }
`;

export let floorFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;
    varying vec3 worldPos;

    void main () {
        vec3 N = normalize(normal.xyz);
        vec3 L = normalize(lightDir.xyz);

        float cellX = floor(worldPos.x / 5.0);
        float cellZ = floor(worldPos.z / 5.0);
        float checker = mod(cellX + cellZ, 2.0);

        vec3 baseColor = (checker < 1.0)
            ? vec3(0.05, 0.05, 0.05)
            : vec3(0.95, 0.95, 0.95);

        float diffuse = max(dot(N, L), 0.0);
        float ambient = 0.2;
        float lighting = ambient + 0.8 * diffuse;

        gl_FragColor = vec4(baseColor * lighting, 1.0);
    }
`;