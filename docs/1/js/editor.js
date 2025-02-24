;(function(){
class Editor {
    /*
    constructor() {
        this._webgl2 = WebGL2.of(500,500);

    }
    */
    static init(q='body') {
        webgl2.canvas.id = 'result';
        document.querySelector(q).append(...this.#make(webgl2));
    }
    static #make(webgl2) {
        const code = {
            vertex: `#version 300 es
in vec3 vertexPosition;
in vec4 color;
out vec4 vColor;
void main() {
  vColor = color;
  gl_Position = vec4(vertexPosition, 1.0);
}`,
            fragment: `#version 300 es
precision highp float;
in vec4 vColor;
out vec4 fragmentColor;
void main() {
  fragmentColor = vColor;
}
`,
            js: `const webgl2 = WebGL2.of(500, 500);
const program = await webgl2.build(
    vertexShaderSource,
    fragmentShaderSource);
const gl = webgl2.context;

const vertexBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();
const vertexAttribLocation = gl.getAttribLocation(program, 'vertexPosition');
const colorAttribLocation  = gl.getAttribLocation(program, 'color');
const VERTEX_SIZE = 3; // vec3
const COLOR_SIZE  = 4; // vec4
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.enableVertexAttribArray(vertexAttribLocation);
gl.vertexAttribPointer(vertexAttribLocation, VERTEX_SIZE, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.enableVertexAttribArray(colorAttribLocation);
gl.vertexAttribPointer(colorAttribLocation, COLOR_SIZE, gl.FLOAT, false, 0, 0);
const vertices = new Float32Array([
    -0.5, 0.5,  0.0,
    -0.5, -0.5, 0.0,
    0.5,  0.5,  0.0,
    -0.5, -0.5, 0.0,
    0.5,  -0.5, 0.0,
    0.5,  0.5,  0.0
]);
const colors = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0
]);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
const VERTEX_NUMS = 6;
gl.drawArrays(gl.TRIANGLES, 0, VERTEX_NUMS);
gl.flush();
`};
        e.target.value
        document.querySelector(`#vertex-shader`).value
        document.querySelector(`#fragment-shader`).value
        return [
            van.tags.textarea({id:'vertex-shader',resize:'none',value:code.vertex, oninput:(e)=>this.#build(webgl2,...this.#getSource(e,0)}),
            van.tags.textarea({id:'fragment-shader',resize:'none',value:code.fragment, oninput:(e)=>this.#build(webgl2,...this.#getSource(e,0))}),
            van.tags.textarea({id:'javascript',resize:'none',value:code.js, oninput:(e)=>this.#build(webgl2,...this.#getSource(e,0))}),

        /*
            van.tags.textarea({id:'vertex-shader',resize:'none',value:code.vertex, oninput:(e)=>this.#build(webgl2,e.target.value,document.querySelector(`#fragment-shader`).value,document.querySelector(`#javascript`).value)}),
            van.tags.textarea({id:'fragment-shader',resize:'none',value:code.fragment, oninput:(e)=>this.#build(webgl2,document.querySelector(`#vertex-shader`).value,e.target.value,document.querySelector(`#javascript`).value)}),
            van.tags.textarea({id:'javascript',resize:'none',value:code.js, oninput:(e)=>this.#build(webgl2,document.querySelector(`#vertex-shader`).value,document.querySelector(`#fragment-shader`).value,e.target.value)}),
            */
            van.tags.textarea({id:'log',resize:'none'}),
            webgl2.canvas,
//            van.tags.canvas({id:'result'}),
        ];
    }
    static #getSousrce(e, inputNo) {
        const srcs = 'vertex-shader fragment-shader javascript'.split(' ');
        if (inputNo < 0 || srcs.length <= inputNo){throw new TypeError(`引数inputNoは0〜2の整数であるべきです。`)}
        return srcs.map((id,i)=>i===inputNo ? e.target.value : document.querySelector(`#${srcs[i]}`).value)
    }
    static #build(webgl2, vsCode, fsCode, jsCode) {
        webgl2.build(vsCode, fsCode);
        document.querySelector(`#log`).value = webgl2.msg;
        this.#jsBuild(webgl2, jsCode); // ここで例外発生したらどうなるの？
    }
//webgl2.build(e.target.value, document.querySelector(`#fragment-shader`).value) 
    //static #jsBuild(webgl2, jsCode) {return (new Function('gl', 'program', `(async function() {${document.querySelector(`#javascript`).value}})();`))(webgl2.gl, webgl2.program);}
    static #jsBuild(webgl2, jsCode) {return (new Function('gl', 'program', `(async function() {${jsCode}})();`))(webgl2.gl, webgl2.program);}
        
        
        

        
    }

}
