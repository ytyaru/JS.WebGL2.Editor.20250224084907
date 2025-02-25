;(function(){
class Editor {
    constructor(width, height, q) {
        this._textAreaIds = 'vertex-shader fragment-shader javascript'.split(' ');
        this._webgl2 = WebGL2.of(width, height);
        this.#init(q);
    }
    get webgl2() {return this._webgl2;}
    async build() {await this.#build(...this.#allSources)}
    #init(q) {
        this._webgl2.canvas.id = 'result';
        document.querySelector(q).append(...this.#make());
    }
    #make() {
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
            js: `/*const webgl2 = WebGL2.of(500, 500);
const program = await webgl2.build(
    vertexShaderSource,
    fragmentShaderSource);
const gl = webgl2.context;
*/
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
        return [
            van.tags.textarea({id:'vertex-shader',resize:'none',value:code.vertex, oninput:async(e)=>await this.#build(...this.#getSource(e,0))}),
            van.tags.textarea({id:'fragment-shader',resize:'none',value:code.fragment, oninput:async(e)=>await this.#build(...this.#getSource(e,1))}),
            van.tags.textarea({id:'javascript',resize:'none',value:code.js, oninput:async(e)=>await this.#build(...this.#getSource(e,2))}),
            van.tags.textarea({id:'log',resize:'none'}),
            this._webgl2.canvas,
        ];
    }
    get #textAreaIds(){return this._textAreaIds}
    get #allSources(){return this.#textAreaIds.map(id=>document.querySelector(`#${id}`).value)}
    #getSource(e, inputNo) {
        if (inputNo < 0 || this.#textAreaIds.length <= inputNo){throw new TypeError(`引数inputNoは0〜2の整数であるべきです。`)}
        return this.#textAreaIds.map((id,i)=>i===inputNo ? e.target.value : document.querySelector(`#${this.#textAreaIds[i]}`).value)
    }
    async #build(vsCode, fsCode, jsCode) {
        console.log(vsCode);
        console.log(fsCode);
        const LOG = document.querySelector(`#log`);
        LOG.value = '';
        try {await this._webgl2.build(vsCode, fsCode);}
        catch(err){}//握りつぶす
        finally {LOG.value = this._webgl2.msg}
        try {this.#jsBuild(jsCode);}
        catch(err) {console.warn('X');LOG.value += (0 < LOG.value.length ? '\n' : '') + 'JavaScript Error:\n' + err.message;}
    }
    #jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', jsCode))(this._webgl2.gl, this._webgl2.program);}
    //#jsBuild(jsCode) {console.log(jsCode, this._webgl2.gl);return (new Function('gl', 'program', `(async function() {${jsCode}})();`))(this._webgl2.gl, this._webgl2.program);}
}
window.Editor = Editor;
})();
