;(function(){
// const webgl2 = WebGL2.of(640,480);
// const program = await webgl2.build(vertexShaderSource, fragmentShaderSource);
class WebGL2 {
    static #FROM = 'WebGL2はコンストラクタ呼出禁止です。代わりにWebGL2.of()を呼出てください。';
    static of(width=500, height=500, options={throw:true,log:true,msg:true,use:true}, contextName='webgl2') {return new WebGL2(width, height, options, contextName, WebGL2.#FROM)}
    constructor(width=500, height=500, options={throw:true,log:true,msg:true,use:true}, contextName='webgl2', from){//gl:canvas.getContext('webgl2')
        if (from!==WebGL2.#FROM){throw new TypeError(WebGL2.#FROM)}
        this._canvas = Canvas.makeAdd(width, height);
        this._context = this.canvas.getContext(contextName);
        if (!this._context){throw new TypeError(`Canvas.getContext('${contextName}')に失敗しました。`)}
        this._builder = Builder.of(this._context, options);
    }
    get canvas() {return this._canvas}
    get context() {return this._context}
    get ctx()     {return this._context}
    get gl()      {return this._context}
    get program() {return this._builder.program}
    get msg() {return this._builder.msg}
    async build(vertexShaderSource, fragmentShaderSource) {
        const sources = await Source.gets(vertexShaderSource, fragmentShaderSource);
        return this._builder.build(...sources);
    }
}
class Canvas {
    static makeAdd(width=500, height=500, el=null) {
             if (el instanceof HTMLElement) {}
        else if ('string'===typeof el || el instanceof String) {el = document.querySelector(el)}
        else {el = document.body}
        const canvas = this.make(width, height);
        el.appendChild(canvas);
        return canvas;
    }
    static make(width=500, height=500) {
        const canvas = document.createElement('canvas');
        canvas.width = Number.isInteger(width) ? width : 500;
        canvas.height = Number.isInteger(height) ? height : 500;
        return canvas;
    }
}
class Source {// GLSLソースコード
    static ERR_MSG = '引数はVertexShaderとFragmentShaderのソースを指定してください。その内容はGLSLです。引数の型はHTMLElementかStringです。HTMLElementなら<script>要素のtextContentにGLSLが書いてある想定です。Stringならその内容はGLSLコード、GLSLファイルパス、HTML要素指定クエリのいずれかです。コードなら複数行、パスなら末尾が.glsl、それ以外ならクエリと判断します。クエリはdocument.querySelector()の引数です。';
    static async gets(...src) {
        if (2!==src.length) {throw new TypeError(`Source.gets()の引数は2つであるべきです。両者の型は統一してください。${ERR_MSG }`)}
        if (src.every(s=>s instanceof HTMLElement)) {return [...src].map(s=>this.fromElement(s))}
        else if (src.every(s=>'string'===typeof s || s instanceof String)) {
            src = [...src].map(s=>s.replace(/[\r\n|\r]/g, '\n').replace(/^\n/gm,'').replace(/\n$/gm,''));//改行コード統一＆先頭と末尾の空行削除
            const lineNums = src.map(s=>s.split('\n').length);
            if (lineNums.every(n=>1===n)) {
                if ([...src].every(s=>s.endsWith('.glsl'))) {return await this.fromFilePath(...src)}
                else {return [...src].map(s=>this.fromElementQuery(s))}
            } else {return [...src].map(s=>this.fromString(s))}
        }
        else {throw new TypeError(`Source.gets()の引数はHTMLElementかString型であるべきです。引数は2つあり両者の型は統一してください。${ERR_MSG }`)}
    }
    static fromString(code) {return code}// GLSLソースコード文字列
    static async fromFilePath(vsPath, fsPath) { // .glsl（拡張子）
        const res = await Promise.all([fetch(vsPath), fetch(fsPath)]);
        return await Promise.all([res[0].text(), res[1].text()]);
    }
    static fromElementQuery(q) {// <script>等の要素を指定する文字列(document.querySelector()の引数)
        if (''===q){return q}
        const el = document.querySelector(q);
        if (!el){throw new TypeError(`Source.fromElementQuery()の引数で指定されたクエリでHTML要素を取得できませんでした。GLSLコードが記載されたHTML要素を指定できるクエリを引数に渡してください。:${q}`)}
        else {return this.fromElement(el)}
    }
    static fromElement(el) {// <script>要素
        if (el instanceof HTMLScriptElement) {return el.textContent}
        else if ([HTMLTextAreaElement, HTMLInputElement].some(t=>el instanceof t)) {return el.value}
        else if (el instanceof HTMLElement) {return el.textContent}
        else {throw new TypeError(`Source.fromElement()の引数はHTMLElement型であるべきです。`)}
    }
}
class Builder {// GLSLのコンパイルとリンク
    static #FROM = 'Builderはコンストラクタ呼出禁止です。代わりにBuilder.of()を呼出てください。';
    static of(gl, options={throw:true,log:true,msg:true,use:true}){return new Builder(gl, options, this.#FROM)}
    constructor(gl,options,from){//gl:canvas.getContext('webgl2')
        if (from!==Builder.#FROM){throw new TypeError(Builder.#FROM)}
        // ReferenceError: GPUCanvasContext is not defined
//        if (![CanvasRenderingContext2D, WebGLRenderingContext, GPUCanvasContext, CanvasRenderingContext2D, ImageBitmapRenderingContext].some(t=>gl instanceof t)){throw new TypeError(`Builder.of()の引数はcanvas.getContext()で取得した値であるべきです。`)}
        this._gl = gl;
        this._options = options ?? {throw:true,log:true,msg:true,use:true};
        this._program = null;
    }
    get gl() {return this._gl}
    get program() {return this._program}
    get msg(){return this._msg}
    build(vertexShaderSource, fragmentShaderSource) {
        this._msg = '';
        this._program = this.link(
            this.compile(this._gl.VERTEX_SHADER, vertexShaderSource),
            this.compile(this._gl.FRAGMENT_SHADER, fragmentShaderSource));
        if (this._options.use){this._gl.useProgram(this._program)}
        return this._program;
    }
    compile(type, source) {
        if (![this._gl.VERTEX_SHADER, this._gl.FRAGMENT_SHADER].some(t=>t===type)){throw new TypeError(`Builder.compile()の第一引数値が不正です。:${type}`)}
        const shader = this._gl.createShader(type);
        this._gl.shaderSource(shader, source);
        this._gl.compileShader(shader);
        const status = this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS);
        if(!status) {
            const info = this._gl.getShaderInfoLog(shader);
            this.#makeRet(`${type===this._gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'}シェーダのコンパイルに失敗しました。\n${info}`)
        }
        console.log(source)
        return shader
    }
    link(...objects) {// objects: vertexShaderObject, fragmentShaderObject
        const program = this._gl.createProgram();
        for (let o of objects){this._gl.attachShader(program, o)}
        this._gl.linkProgram(program);
        const linkStatus = this._gl.getProgramParameter(program, this._gl.LINK_STATUS);
        if(!linkStatus) {
            const info = this._gl.getProgramInfoLog(program);
            this.#makeRet(`シェーダプログラムオブジェクトの生成に失敗しました。\n${info}`)
        }
        this._program = program;
        return program;
    }
    #makeRet(msg) {
        if (this._options.msg) {this._msg += `${msg}\n`}
        if (this._options.log) {console.error(msg)}
        if (this._options.throw) {throw new Error(msg)}
    }
}
window.WebGL2 = WebGL2;
})();
