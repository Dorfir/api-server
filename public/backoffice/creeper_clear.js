/* -------------------------------------------------------------------------------------- */
/* Variables - constantes */
var cropper_options = { cropperThumbMode: false, cropper_image_index: 0, export_mode: 'np' }
const canvasDebug = false
const cropFormatThumb = { w: 425, h: 250 }
const cropFormatLarge = { w: 650, h: 450 }
var cropFormat = { w: 650, h: 450 }
var isLineDragabble = true

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasSize = { w:900, h:600 }
canvas.width = canvasSize.w
canvas.height = canvasSize.h

const line_color = "#0000bb"

// const imagePath = './img/dragon2.jpg'
const imagePath = ''
const image = new Image()
image.src = imagePath
var imgWidth = 0
var imgHeight = 0
var aspectRatio = 0

// TODO - Gestion de la taille max de l'import - export



var cropBounds = null
// var cropBounds = { 
//     x1: Math.round((canvasSize.w - cropFormat.w)/2),
//     y1: Math.round((canvasSize.h - cropFormat.h)/2),
//     x2: cropFormat.w + Math.round((canvasSize.w - cropFormat.w)/2),
//     y2: cropFormat.h + Math.round((canvasSize.h - cropFormat.h)/2),
// }

let consoleGlobalCoord = document.getElementById('consoleGlobalCoord')
let consoleLocalCoord = document.getElementById('consoleLocalCoord')
let consoleCanvasCoord = document.getElementById('consoleCanvasCoord')

let imageCoord = { x:0, y:0, w:0, h:0 }
const appReadyEvent = new Event('app-ready')
const body = document.getElementsByTagName('body')[0]

const downloadBtn = document.querySelector("button.download");
const reloadBtn = document.getElementById('reload-button')

var imgDragActive = false
var lineDragActive = false
var pCoord1 = { x: 0, y: 0 }
var pCoord2 = { x: 0, y: 0 }
var canvasComputed = null

var cropLinesDragged = []
var cropLines = null
// var cropLines = [
//     { id: "vleft", type:"vertical", cursor: "ew-resize", 
//         x1: cropBounds.x1, y1: 0, x2: cropBounds.x1, y2: canvasSize.h },
//     { id: "vright", type:"vertical", cursor: "ew-resize", 
//         x1: cropBounds.x2, y1: 0, x2: cropBounds.x2, y2: canvasSize.h },
//     { id: "htop", type:"horizontal", cursor: "ns-resize", 
//         x1: 0, y1: cropBounds.y1, x2: canvasSize.w, y2: cropBounds.y1 },
//     { id: "hbottom", type:"horizontal", cursor: "ns-resize", 
//         x1: 0, y1: cropBounds.y2, x2: canvasSize.w, y2: cropBounds.y2 },
// ]

/* -------------------------------------------------------------------------------------- */
/* Init Cropper */
initCropper(false, 0, 'np')
function initCropper(isThumb, index, export_mode) {
    // TODO reset image chargée + affichage dragndrop/loading
    // + debug reset zoom
    console.log(`-- initCropper, isThumb: ${isThumb}`)

    resetZoom()
    cropper_options.export_mode = export_mode
    cropper_options.cropperThumbMode = isThumb
    cropper_options.cropper_image_index = index
    if (isThumb) { 
        cropFormat = cropFormatThumb 
        isLineDragabble = false
    } else { 
        cropFormat = cropFormatLarge
        isLineDragabble = true
    }
    cropBounds = { 
        x1: Math.round((canvasSize.w - cropFormat.w)/2),
        y1: Math.round((canvasSize.h - cropFormat.h)/2),
        x2: cropFormat.w + Math.round((canvasSize.w - cropFormat.w)/2),
        y2: cropFormat.h + Math.round((canvasSize.h - cropFormat.h)/2),
    }
    cropLines = [
        { id: "vleft", type:"vertical", cursor: "ew-resize", 
            x1: cropBounds.x1, y1: 0, x2: cropBounds.x1, y2: canvasSize.h },
        { id: "vright", type:"vertical", cursor: "ew-resize", 
            x1: cropBounds.x2, y1: 0, x2: cropBounds.x2, y2: canvasSize.h },
        { id: "htop", type:"horizontal", cursor: "ns-resize", 
            x1: 0, y1: cropBounds.y1, x2: canvasSize.w, y2: cropBounds.y1 },
        { id: "hbottom", type:"horizontal", cursor: "ns-resize", 
            x1: 0, y1: cropBounds.y2, x2: canvasSize.w, y2: cropBounds.y2 },
    ]

    draw()
}

/* -------------------------------------------------------------------------------------- */
/* Drag and drop - image + Button search file */
let dragDropArea = document.getElementById('drag-drop-area')
dragDropArea.addEventListener('drop', dropHandler, false)
dragDropArea.addEventListener('dragover', dragOverHandler, false)
dragDropArea.addEventListener('dragenter', dragEnter, false)
function dropHandler(e) {
    console.log('File(s) dropped')
    // Preventdefault behaviour (opening file)
    e.preventDefault()
    let file = null

    if (e.dataTransfer.items) {
        [...e.dataTransfer.items].forEach((item, i) => {
            if (item.kind === "file") {
                item = item.getAsFile()
                console.log(`… file[${i}].name = ${item.name}`)
                file = item
            }
        })
    } else {
        [...e.dataTransfer.files].forEach((item, i) => {
            console.log(`_ file[${i}].name = ${item.name}`)
            file = item
        })
    }

    console.log(file.type)

    if (file.type.includes('image')) {
        image.src = URL.createObjectURL(file)
    }

}
function dragOverHandler(e) {
    console.log('File(s) in drop zone')
    e.stopPropagation()
    e.preventDefault()
}
function dragEnter(e) {
    console.log('File(s) enter in drop zone')
    e.stopPropagation()
    e.preventDefault()
}

let filesearch_button = document.getElementById('filesearch_button')
filesearch_button.addEventListener('change', (e) => {
    let file = e.target.files[0]
    if (file.type.includes('image')) {
        image.src = URL.createObjectURL(file)
    }
})

/* -------------------------------------------------------------------------------------- */
/* Image du canvas load listener - déclencheur d'initialisation de l'outil */
image.addEventListener('load', () => {
    imgWidth = image.naturalWidth
    imgHeight = image.naturalHeight
    aspectRatio = imgWidth/imgHeight
    // console.log(`image size : (${imgWidth}, ${imgHeight})`)
    if (aspectRatio >= 1) {
        imageCoord.w = canvasSize.w
        imageCoord.h = Math.round(imageCoord.w / aspectRatio)
        imageCoord.x = 0
        imageCoord.y = Math.round( (canvasSize.h - imageCoord.h) / 2 )
    } else {
        imageCoord.h = canvasSize.h
        imageCoord.w = canvasSize.h * aspectRatio
        imageCoord.y = 0
        imageCoord.x = Math.round( (canvasSize.w - imageCoord.w) / 2 )
    }

    body.dispatchEvent(appReadyEvent)
})
body.addEventListener('app-ready', (e) => {

    console.log("-- content loaded")
    dragDropArea.style.display = "none"
    canvasComputed = canvas.getBoundingClientRect()
    canvasComputed.x += window.scrollX
    canvasComputed.y += window.scrollY
    if (canvasDebug) consoleCanvasCoord.innerHTML = `(${Math.floor(canvasComputed.x)}, ${Math.floor(canvasComputed.y)})`
    draw()
    // document.getElementById('download_btn_container').style.display = "flex"
})



/* Recalculate canvas bounds */
document.addEventListener('scroll', (e) => {
    canvasComputed = canvas.getBoundingClientRect()
    canvasComputed.x += window.scrollX
    canvasComputed.y += window.scrollY
    if (canvasDebug) consoleCanvasCoord.innerHTML = `(${Math.floor(canvasComputed.x)}, ${Math.floor(canvasComputed.y)})`
})

/* Pointer listeners on canvas */
// TODO resize drag when out of canvas - ou pas
canvas.addEventListener('pointerdown', (e) => {
    pCoord1.x = e.pageX - canvasComputed.x
    pCoord1.y = e.pageY - canvasComputed.y
    cropLinesDragged = []
    if (isLineDragabble) {
        cropLines.forEach((line, index) => {
            if (pointerOverLine(pCoord1, line)) cropLinesDragged.push(index) 
        })
    } 
    lineDragActive = (cropLinesDragged.length > 0)
    imgDragActive = !lineDragActive
})
window.addEventListener('pointermove', (e) => {
    if (canvasDebug) consoleGlobalCoord.innerHTML = `(${Math.floor(e.pageX)}, ${Math.floor(e.pageY)})`
})
canvas.addEventListener('pointermove', (e) => {
    
    if (canvasDebug) consoleLocalCoord.innerHTML = `(${Math.floor(e.pageX)}, ${Math.floor(e.pageY)})`
    pCoord2.x = e.pageX - canvasComputed.x
    pCoord2.y = e.pageY - canvasComputed.y
    
    if (imgDragActive) {

        imageCoord.x += pCoord2.x - pCoord1.x
        imageCoord.y += pCoord2.y - pCoord1.y
        draw()
        pCoord1.x = pCoord2.x
        pCoord1.y = pCoord2.y

    } 
    if (lineDragActive) {

        let gap = 30
        cropLinesDragged.forEach(lineIndex => {
            if (cropLines[lineIndex].id === "vleft") {
                let destination = cropLines[0].x1 + pCoord2.x - pCoord1.x
                if ( (0 < destination) && (destination < (cropLines[1].x1 - gap)) ) {
                    cropLines[0].x1 = destination
                    cropLines[0].x2 = destination
                }                
            } else if (cropLines[lineIndex].id === "vright") {
                let destination = cropLines[1].x1 + pCoord2.x - pCoord1.x
                if ( ((cropLines[0].x1 + gap) < destination) && (destination < (canvasSize.w)) ) {
                    cropLines[1].x1 = destination
                    cropLines[1].x2 = destination
                }                
            } else if (cropLines[lineIndex].id === "htop") {
                let destination = cropLines[2].y1 + pCoord2.y - pCoord1.y
                if ( (0 < destination) && (destination < (cropLines[3].y1 - gap)) ) {
                    cropLines[2].y1 = destination
                    cropLines[2].y2 = destination
                }                
            } else if (cropLines[lineIndex].id === "hbottom") {
                let destination = cropLines[3].y1 + pCoord2.y - pCoord1.y
                if ( ((cropLines[2].y1 + gap) < destination) && (destination < (canvasSize.h)) ) {
                    cropLines[3].y1 = destination
                    cropLines[3].y2 = destination
                }                
            }
        })

        draw()
        pCoord1.x = pCoord2.x
        pCoord1.y = pCoord2.y

    } else if (isLineDragabble) {
        let cropLineHover = []
        cropLines.forEach((line, index) => {
            if (pointerOverLine(pCoord2, line)) cropLineHover.push(index)
        })
        if (cropLineHover.length == 0) {
            canvas.style.cursor = ""
        } else if (cropLineHover.length == 1) {
            if (cropLines[cropLineHover[0]].type == "vertical") {
                canvas.style.cursor = "ew-resize"
            } else {
                canvas.style.cursor = "ns-resize"
            }
        } else if (cropLineHover.length == 2) {
            if ((cropLines[cropLineHover[0]].id == "vleft")&&(cropLines[cropLineHover[1]].id == "htop")) {
                canvas.style.cursor = "nwse-resize"
            } else if ((cropLines[cropLineHover[0]].id == "vleft")&&(cropLines[cropLineHover[1]].id == "hbottom")) {
                canvas.style.cursor = "nesw-resize"
            } else if ((cropLines[cropLineHover[0]].id == "vright")&&(cropLines[cropLineHover[1]].id == "htop")) {
                canvas.style.cursor = "nesw-resize"
            } else if ((cropLines[cropLineHover[0]].id == "vright")&&(cropLines[cropLineHover[1]].id == "hbottom")) {
                canvas.style.cursor = "nwse-resize"
            }
        }
    }

})
/* Pointer events off */ 
window.addEventListener('pointerup', (e) => {
    imgDragActive = false
    lineDragActive = false
    if (isLineDragabble) {
        cropLines.forEach(line => {
            line.isGrabbed = false
        })
    }
})
canvas.addEventListener('pointerup', (e) => {
    imgDragActive = false
    lineDragActive = false
    cropLines.forEach(line => {
        line.isGrabbed = false
    })
})
canvas.addEventListener('pointerout', (e) => {
    // imgDragActive = false
    // lineDragActive = false
})
canvas.addEventListener('pointercancel', (e) => {
    imgDragActive = false
    lineDragActive = false
    cropLines.forEach(line => {
        line.isGrabbed = false
    })
})

/* Draw engine on canvas */
function draw() {

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

    ctx.drawImage(image, imageCoord.x, imageCoord.y, imageCoord.w, imageCoord.h)    
    
    ctx.strokeStyle = line_color
    ctx.lineWidth = 3
    cropLines.forEach(line => {
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.closePath()
        ctx.stroke()
    })

    ctx.fillStyle = "rgba(120,120,120,0.8)"
    ctx.fillRect(0, 0, canvasSize.w, cropLines[2].y1)
    ctx.fillRect(0, cropLines[2].y1, cropLines[0].x1, cropLines[3].y1 - cropLines[2].y1)
    ctx.fillRect(cropLines[1].x1, cropLines[2].y1, canvasSize.w - cropLines[1].x1, cropLines[3].y1 - cropLines[2].y1)
    ctx.fillRect(0, cropLines[3].y1, canvasSize.w, canvasSize.h - cropLines[3].y1)

}

/* Gestion du Zoom de l'image dans le canvas via le input slide */
var oldZoomRatio = 0
document.getElementById('zoom').addEventListener('input', (e) => {
    zoomImage(e.target.value)
})
function zoomImage(zoomRatio) {
    
    zoomValue = zoomRatio - oldZoomRatio

    let centerx = Math.round(imageCoord.w / 2) + imageCoord.x 
    let centery = Math.round(imageCoord.h / 2) + imageCoord.y
    let old_w = imageCoord.w
    let old_h = imageCoord.h

    imageCoord.w = imageCoord.w + Math.round(imageCoord.w * zoomValue)
    imageCoord.h = Math.round(imageCoord.w / aspectRatio)

    imageCoord.x = imageCoord.x + Math.round( (old_w - imageCoord.w) / 2)
    imageCoord.y = imageCoord.y + Math.round( (old_h - imageCoord.h) / 2)
   
    draw()  

    oldZoomRatio = zoomRatio

}
function resetZoom() {
    oldZoomRatio = 0
    document.getElementById('zoom').value = 0
}

/* -------------------------------------------------------------------------------------- */
/* Check if pointer hover a line */
function pointerOverLine(pointerCoords, line) {
    let marge = 4
    let result = false
    if (line.type == "vertical") {
        result = ((line.x1 - marge) <= pointerCoords.x) && 
                 (pointerCoords.x <= (line.x1 + marge)) &&
                 (line.y1 <= pointerCoords.y) &&
                 (pointerCoords.y <= line.y2)
    } else if (line.type == "horizontal") {
        result = (line.x1 <= pointerCoords.x) &&
                 (pointerCoords.x <= line.x2) &&
                 ((line.y1 - marge) <= pointerCoords.y) && 
                 (pointerCoords.y <= (line.y1 + marge))               
    }
    return result
}

/* -------------------------------------------------------------------------------------- */
reloadBtn.addEventListener('click', function() {
    dragDropArea.style.display = "block"
})

var canvas2 = document.getElementById('canvas2')

downloadBtn.addEventListener('click', function() {
    
    const canvas2 = document.getElementById('canvas2')
    const ctx2 = canvas2.getContext('2d')
    
    let canvas2Size = {
        w: cropLines[1].x1 - cropLines[0].x1,
        h : cropLines[3].y1 - cropLines[2].y1,
    }
    canvas2.width = canvas2Size.w
    canvas2.height = canvas2Size.h

    let imageBounds = {
        x : -(cropLines[0].x1 - imageCoord.x),
        y : -(cropLines[2].y1 - imageCoord.y),
        w : imageCoord.w,
        h : imageCoord.h,
    }
    
    ctx2.fillStyle = "#ffffff"
    ctx2.fillRect(0, 0, canvas2Size.w, canvas2Size.h)
    ctx2.drawImage(image, imageBounds.x, imageBounds.y, imageBounds.w, imageBounds.h)
    
    if (!cropper_options.cropperThumbMode) {
        let event_image_canvas2 = new Event('event-image-canvas2')
        event_image_canvas2.export_mode = cropper_options.export_mode
        event_image_canvas2.image_index = cropper_options.cropper_image_index
        window.dispatchEvent(event_image_canvas2)
    } else {
        let event_thumb_canvas2 = new Event('event-thumb-canvas2')
        event_thumb_canvas2.export_mode = cropper_options.export_mode
        window.dispatchEvent(event_thumb_canvas2)
    }
    

    
    // let image2 = new Image(cropFormat.w, cropFormat.h)
    // image2.src = canvas2.toDataURL("image/jpeg", 0.7)
    // image2.addEventListener('load', () => {
    //     document.body.appendChild(image2)
    // })

    // let display_result_img = document.getElementById('display-result-img')
    // display_result_img.src = canvas2.toDataURL("image/jpeg", 0.7)
    // display_result_img.addEventListener('load', () => {
    //     console.log('image2 loaded')
    //     let display_result  = document.getElementById('display-result')
    //     display_result.style.display = "block"
    // })

    //create a temporary link for the download item
    // let tempLink = document.createElement('a');

    //generate a new filename
    // let fileName = `image-cropped.jpg`;
  
    //configure the link to download the resized image
    // tempLink.download = fileName;
    // tempLink.href = canvas2.toDataURL("image/jpeg", 0.7);
    // console.log(tempLink.href)


    //trigger a click on the link to start the download
    // tempLink.click();
  
    
})




