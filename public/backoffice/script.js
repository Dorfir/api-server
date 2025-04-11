var app = app || {}

app.edit = app.edit || {}

app.edit = {

    quill : new Quill('#editor', {
        modules: {
            toolbar: true,
        },  
        theme: 'snow',
        placeholder: "Votre description ..."
    }),

    initQuillEvent : () => {
        app.edit.quill.on('text-change', (delta, oldDelta, source) => {
            app.edit.renderPreview(app.edit.quill.getSemanticHTML())
        })
    },

    renderPreview : ((html) => {
        console.log("render")
        let renderDiv = document.getElementById('render')
        renderDiv.innerHTML = html
    })
}

// console.log(app.edit.quill)
app.edit.initQuillEvent()






/* quill */
// const quill = new Quill('#editor', {
//     // debug: "info",
//     modules: {
//         toolbar: true,
//     },  
//     theme: 'snow',
//     placeholder: "Votre description ..."
// });

// quill.on('text-change', (delta, oldDelta, source) => {
//     if (source == 'api') {
//         // console.log('An API call triggered this change')
//     } else {
//         // console.log('A user action triggered this change')
//         // console.log(oldDelta)
//         // let contentDelta = quill.getContents()
//         // console.log(contentDelta)
//         // console.log(quill.getText())
//         // console.log(quill.getSemanticHTML())

//         app.edit.renderPreview(quill.getSemanticHTML())
//     }
// })