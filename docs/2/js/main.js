window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    const editor = new Editor(500,500,'#main');
    await editor.build();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

