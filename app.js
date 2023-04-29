// var vertexShaderText = [
//     'precision mediump float;',
//     '',
//     'attribute vec2 vertPosition;',
//     '',
//     'void main()',
//     '{',
//     ' gl_Position = vec4(vertPosition, 0.0, 1.0);',
//     '}'
// ].join('\n')

// var fragmentShaderText = [
//     'precision mediump float;',
//     '',
//     'void main()',
//     '{',
//     ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
//     '}'
// ].join('\n')


var vertexShaderSource = `
    precision mediump float; 
    attribute vec2 vertPosition; 
    void main() { 
        gl_Position = vec4(vertPosition, 0.0, 1.0); 
    }`; 

var fragmentShaderSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`;

const InitDemo = () => {
    console.log("this is working")

    var canvas = document.getElementById("game-surface")
    var gl = canvas.getContext('webgl')

    if (!gl) {
        gl = canvas.getContext('experimental-webgl')
        alert("Your browser does not support webgl")
    }

    gl.clearColor(0.75, 0.85, 0.8, 1 )
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
 
    // create shaders
    var vertexShader = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.shaderSource(fragmentShader, fragmentShaderSource)

    gl.compileShader(vertexShader)
    gl.compileShader(fragmentShader)


    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling vertex shader!", gl.getShaderInfoLog(vertexShader))
        return
    }

    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
        console.error("ERROR compiling fragment shader!", gl.getShaderInfoLog(fragmentShader))
        return
    }

    var program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error("ERROR linking program!", gl.getProgramInfoLog(program))
        return
    }

    gl.validateProgram(program)
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error("ERROR validating program!", gl.getProgramInfoLog(program))
        return
    }

    // create buffer
    var triangleVertices = [
        // X, Y
        0.0, 0.5,
        -0.5, -0.5,
        0.5, -0.5
    ]

    var triangleVertexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
    gl.vertexAttribPointer(
        positionAttribLocation, // attribute location
        2, // number of elements per attribute
        gl.FLOAT, // type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    )

    gl.enableVertexAttribArray(positionAttribLocation)
    gl.useProgram(program)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}