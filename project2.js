/**
 * ** Eray Öztürk 29097 **
 * @Instructions
 *      @task1 : Complete the setTexture function to handle non power of 2 sized textures
 *      @task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: Introduce specular lighting to simulate reflective surfaces, enhancing the realism of the rendered scenes.
 *      @task4:
 *      setMesh, draw, setAmbientLight, setSpecularLight, and enableLighting functions
 */

// Function to compute the Model-View-Projection matrix
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
    
    var trans1 = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        translationX, translationY, translationZ, 1
    ];
    var rotatXCos = Math.cos(rotationX);
    var rotatXSin = Math.sin(rotationX);

    var rotatYCos = Math.cos(rotationY);
    var rotatYSin = Math.sin(rotationY);

    var rotatx = [
        1, 0, 0, 0,
        0, rotatXCos, -rotatXSin, 0,
        0, rotatXSin, rotatXCos, 0,
        0, 0, 0, 1
    ];

    var rotaty = [
        rotatYCos, 0, -rotatYSin, 0,
        0, 1, 0, 0,
        rotatYSin, 0, rotatYCos, 0,
        0, 0, 0, 1
    ];

    var test1 = MatrixMult(rotaty, rotatx);
    var test2 = MatrixMult(trans1, test1);
    var mvp = MatrixMult(projectionMatrix, test2);

    return mvp;
}

// MeshDrawer class
class MeshDrawer {
    constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.modelMatrixLoc = gl.getUniformLocation(this.prog, 'modelMatrix');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');

        // Lighting uniform locations
        this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
        this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
        this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
        this.specularIntensityLoc = gl.getUniformLocation(this.prog, 'specularIntensity'); // Added for specular lighting
        this.viewerPosLoc = gl.getUniformLocation(this.prog, 'viewerPos'); // Added for specular lighting

        // Attribute locations
        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalLoc = gl.getAttribLocation(this.prog, 'normal');

        // Buffers
        this.vertbuffer = gl.createBuffer();
        this.texbuffer = gl.createBuffer();
        this.normalbuffer = gl.createBuffer();

        this.numTriangles = 0;

        // Lighting parameters
        this.lightingEnabled = false;
        this.ambient = 0.2; // Default ambient light intensity
        this.specularIntensity = 0.5; // Default specular intensity
    }


    setMesh(vertPos, texCoords, normalCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        // Update texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        // Update normal vectors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

        this.numTriangles = vertPos.length / 3;
    }

    draw(trans) {
        gl.useProgram(this.prog);

        // Pass the MVP matrix
        gl.uniformMatrix4fv(this.mvpLoc, false, trans);

        // Recompute the model matrix within the draw method
        var trans1 = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, transZ, 1
        ];
        var rotatXCos = Math.cos(rotX);
        var rotatXSin = Math.sin(rotX);

        var rotatYCos = Math.cos(autorot + rotY);
        var rotatYSin = Math.sin(autorot + rotY);

        var rotatx = [
            1, 0, 0, 0,
            0, rotatXCos, -rotatXSin, 0,
            0, rotatXSin, rotatXCos, 0,
            0, 0, 0, 1
        ];

        var rotaty = [
            rotatYCos, 0, -rotatYSin, 0,
            0, 1, 0, 0,
            rotatYSin, 0, rotatYCos, 0,
            0, 0, 0, 1
        ];

        var modelMatrix = MatrixMult(trans1, MatrixMult(rotaty, rotatx));

        // Pass the model matrix to the shader
        gl.uniformMatrix4fv(this.modelMatrixLoc, false, modelMatrix);

        // Pass lighting uniforms
        gl.uniform1i(this.enableLightingLoc, this.lightingEnabled ? 1 : 0);
        gl.uniform1f(this.ambientLoc, this.ambient);
        gl.uniform1f(this.specularIntensityLoc, this.specularIntensity); // Pass specular intensity
        gl.uniform3f(this.lightPosLoc, window.lightX, window.lightY, -10.0); // Z position of the light is fixed
        gl.uniform3f(this.viewerPosLoc, 0.0, 0.0, 0.0); // Viewer at origin

        // Set up vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.enableVertexAttribArray(this.vertPosLoc);
        gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

        // Set up texture coordinates
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.enableVertexAttribArray(this.texCoordLoc);
        gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

        // Set up normal vectors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.enableVertexAttribArray(this.normalLoc);
        gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

        // Update light position based on key inputs
        updateLightPos();

        gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
    }

    // This method is called to set the texture of the mesh.
    // The argument is an HTML IMG element containing the texture data.
    setTexture(img) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // Set the texture image data
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            img
        );

        // Check if the image dimensions are powers of two
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            // Generate mipmaps for power-of-two textures
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // Handle non-power-of-two textures
            // Set wrapping modes to CLAMP_TO_EDGE
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // Set filtering modes to LINEAR
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }

        // Use the shader program and bind the texture
        gl.useProgram(this.prog);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const sampler = gl.getUniformLocation(this.prog, 'tex');
        gl.uniform1i(sampler, 0);
    }

    showTexture(show) {
        gl.useProgram(this.prog);
        gl.uniform1i(this.showTexLoc, show);
    }

    enableLighting(show) {
        this.lightingEnabled = show;
    }

    setAmbientLight(ambient) {
        this.ambient = ambient;
    }

    setSpecularLight(specularIntensity) {
        this.specularIntensity = specularIntensity;
    }
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
    dst = dst || new Float32Array(3);
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        dst[0] = v[0] / length;
        dst[1] = v[1] / length;
        dst[2] = v[2] / length;
    }
    return dst;
}

// Vertex shader source code
const meshVS = `
            attribute vec3 pos; 
            attribute vec2 texCoord; 
            attribute vec3 normal;

            uniform mat4 mvp; 
            uniform mat4 modelMatrix; // New uniform added

            varying vec2 v_texCoord; 
            varying vec3 v_normal; 
            varying vec3 v_pos;

            void main()
            {
                v_texCoord = texCoord;
                v_normal = normalize( (modelMatrix * vec4(normal, 0.0)).xyz ); // Transform normal to world space
                v_pos = (modelMatrix * vec4(pos,1.0)).xyz; // Transform position to world space

                gl_Position = mvp * vec4(pos,1);
            }
        `;

// Fragment shader source code
const meshFS = `
            precision mediump float;
            uniform bool showTex;
            uniform bool enableLighting;
            uniform sampler2D tex;
            uniform vec3 color; 
            uniform vec3 lightPos;
            uniform vec3 viewerPos; // Added for specular lighting
            uniform float ambient;
            uniform float specularIntensity; // Added for specular lighting

            varying vec2 v_texCoord;
            varying vec3 v_normal;
            varying vec3 v_pos;

            void main()
            {
                vec4 texColor = texture2D(tex, v_texCoord);
                vec3 finalColor = texColor.rgb;

                if(enableLighting){
                    // Calculate ambient light
                    vec3 ambientLight = ambient * vec3(1.0, 1.0, 1.0);

                    // Calculate diffuse light
                    vec3 normal = normalize(v_normal);
                    vec3 lightDir = normalize(lightPos - v_pos);
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 diffuse = diff * vec3(1.0, 1.0, 1.0);

                    // Calculate specular light
                    vec3 viewDir = normalize(viewerPos - v_pos);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0); // Shininess exponent
                    vec3 specular = specularIntensity * spec * vec3(1.0, 1.0, 1.0);

                    // Combine the lighting components
                    finalColor = (ambientLight + diffuse + specular) * texColor.rgb;
                }

                if(showTex){
                    gl_FragColor = vec4(finalColor, texColor.a);
                }
                else{
                    gl_FragColor = vec4(1.0, 0, 0, 1.0);
                }
            }
`;

// Since the HTML file cannot be modified, and functions like SetSpecularLight are called from the HTML,
// we need to define them here.

function SetSpecularLight(param) {
    meshDrawer.setSpecularLight(param.value / 100);
    DrawScene();
}

function SetAmbientLight(param) {
    meshDrawer.setAmbientLight(param.value / 100);
    DrawScene();
}

function EnableLight(param) {
    meshDrawer.enableLighting(param.checked);
    DrawScene();
}

function ShowTexture(param) {
    meshDrawer.showTexture(param.checked);
    DrawScene();
}

// Ensure global variables are accessible
window.SetSpecularLight = SetSpecularLight;
window.SetAmbientLight = SetAmbientLight;
window.EnableLight = EnableLight;
window.ShowTexture = ShowTexture;

// Light direction parameters
window.lightX = 1;
window.lightY = 1;

// Keys object for arrow key handling
window.keys = {};

// Update light position function
function updateLightPos() {
    const translationSpeed = 0.5; 
    if (window.keys['ArrowUp']) window.lightY += translationSpeed;
    if (window.keys['ArrowDown']) window.lightY -= translationSpeed;
    if (window.keys['ArrowRight']) window.lightX += translationSpeed;
    if (window.keys['ArrowLeft']) window.lightX -= translationSpeed;
}
window.updateLightPos = updateLightPos;

// Event listeners for key presses
window.addEventListener('keydown', function(e) {
    window.keys[e.key] = true;
});
window.addEventListener('keyup', function(e) {
    window.keys[e.key] = false;
});


