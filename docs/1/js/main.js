window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    /*
    const author = 'ytyaru';
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/JS.WebGL2.HelloWorld.20250222175800/`}, 'WebGL2.HelloWorld')),
        van.tags.p('WebGL2で最小限のコードを書く。'),
//        van.tags.p('Write minimal code in WebGL2.'),
    );
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make());
    */
//    Editor.init('#main');
    const editor = new Editor(500,500,'#main');
    await editor.build();
    /*
    const a = new Assertion();
    a.t(true);
    a.f(false);
    a.e(TypeError, `msg`, ()=>{throw new TypeError(`msg`)});
    a.fin();
    */
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

