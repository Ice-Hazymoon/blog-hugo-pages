const Editor = toastui.Editor;
const { codeSyntaxHighlight, colorSyntax } = Editor.plugin;

const editor = new Editor({
    el: document.querySelector('#editor'),
    height: '500px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    language: 'zh-CN',
    initialValue: '在这里输入文章内容',
    plugins: [codeSyntaxHighlight, colorSyntax],
    theme: 'dark',
    customHTMLRenderer: {
        latex(node) {
            console.log(node, katex)
            const html = katex.renderToString(node.literal, {
                throwOnError: false
            });
        
            return [
                { type: 'openTag', tagName: 'div', outerNewLine: true },
                { type: 'html', content: html },
                { type: 'closeTag', tagName: 'div', outerNewLine: true }
            ];
        },
    }
});

console.log(editor.getMarkdown());