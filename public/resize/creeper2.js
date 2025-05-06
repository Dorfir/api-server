const cropFormat = { w: 400, h: 550 }

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasSize = { w:600, h:600 }
canvas.width = canvasSize.w
canvas.height = canvasSize.h


const imagePath = './img/dragon2.jpg'
const image = new Image()
image.src = imagePath
var imgWidth = 0
var imgHeight = 0
var aspectRatio = 0

var cropBounds = { 
    x1: Math.round((canvasSize.w - cropFormat.w)/2),
    y1: Math.round((canvasSize.h - cropFormat.h)/2),
    x2: cropFormat.w + Math.round((canvasSize.w - cropFormat.w)/2),
    y2: cropFormat.h + Math.round((canvasSize.h - cropFormat.h)/2),
}


let consoleGlobalCoord = document.getElementById('consoleGlobalCoord')
let consoleLocalCoord = document.getElementById('consoleLocalCoord')
let consoleCanvasCoord = document.getElementById('consoleCanvasCoord')



/* ----------------------------------------------------- */
/* Drag and drop - image */
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
/* Image def - load */
let imageCoord = { x:0, y:0, w:0, h:0 }
const appReadyEvent = new Event('app-ready')
const body = document.getElementsByTagName('body')[0]
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
    
    canvasComputed = canvas.getBoundingClientRect()
    canvasComputed.x += window.scrollX
    canvasComputed.y += window.scrollY
    consoleCanvasCoord.innerHTML = `(${Math.floor(canvasComputed.x)}, ${Math.floor(canvasComputed.y)})`
    draw()

})

var imgDragActive = false
var lineDragActive = false
var pCoord1 = { x: 0, y: 0 }
var pCoord2 = { x: 0, y: 0 }
var canvasComputed = null

var cropLinesDragged = []
var cropLines = [
    { id: "vleft", type:"vertical", cursor: "ew-resize", 
        x1: cropBounds.x1, y1: 0, x2: cropBounds.x1, y2: canvasSize.h },
    { id: "vright", type:"vertical", cursor: "ew-resize", 
        x1: cropBounds.x2, y1: 0, x2: cropBounds.x2, y2: canvasSize.h },
    { id: "htop", type:"horizontal", cursor: "ns-resize", 
        x1: 0, y1: cropBounds.y1, x2: canvasSize.w, y2: cropBounds.y1 },
    { id: "hbottom", type:"horizontal", cursor: "ns-resize", 
        x1: 0, y1: cropBounds.y2, x2: canvasSize.w, y2: cropBounds.y2 },
]

/* Recalculate canvas bounds */
document.addEventListener('scroll', (e) => {
    canvasComputed = canvas.getBoundingClientRect()
    canvasComputed.x += window.scrollX
    canvasComputed.y += window.scrollY
    consoleCanvasCoord.innerHTML = `(${Math.floor(canvasComputed.x)}, ${Math.floor(canvasComputed.y)})`
})

/* Pointer listeners on canvas */
canvas.addEventListener('pointerdown', (e) => {
    pCoord1.x = e.pageX - canvasComputed.x
    pCoord1.y = e.pageY - canvasComputed.y
    cropLinesDragged = []
    cropLines.forEach((line, index) => {
        if (pointerOverLine(pCoord1, line)) cropLinesDragged.push(index) 
    })
    lineDragActive = (cropLinesDragged.length > 0) 
    imgDragActive = !lineDragActive
})
window.addEventListener('pointermove', (e) => {
    consoleGlobalCoord.innerHTML = `(${Math.floor(e.pageX)}, ${Math.floor(e.pageY)})`
})
canvas.addEventListener('pointermove', (e) => {
    
    consoleLocalCoord.innerHTML = `(${Math.floor(e.pageX)}, ${Math.floor(e.pageY)})`
    // console.log(`(${e.pageX}, ${e.pageY})`)
    pCoord2.x = e.pageX - canvasComputed.x
    pCoord2.y = e.pageY - canvasComputed.y
    
    if (imgDragActive) {

        imageCoord.x += pCoord2.x - pCoord1.x
        imageCoord.y += pCoord2.y - pCoord1.y
        draw()
        pCoord1.x = pCoord2.x
        pCoord1.y = pCoord2.y

    } if (lineDragActive) {

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

    } else {
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


function draw() {

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

    ctx.drawImage(image, imageCoord.x, imageCoord.y, imageCoord.w, imageCoord.h)    
    
    ctx.strokeStyle = "#ff0000"
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

/* Zoom */
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

/* Pointer events off */ 
// TODO resize drag when out of canvas
window.addEventListener('pointerup', (e) => {
    imgDragActive = false
    lineDragActive = false
    cropLines.forEach(line => {
        line.isGrabbed = false
    })
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

const downloadBtn = document.querySelector("button.download");
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
    

    
    // let image2 = new Image(cropFormat.w, cropFormat.h)
    // image2.src = canvas2.toDataURL("image/jpeg", 0.7)
    // image2.addEventListener('load', () => {
    //     document.body.appendChild(image2)
    // })

    //create a temporary link for the download item
    let tempLink = document.createElement('a');

    //generate a new filename
    let fileName = `image-cropped.jpg`;
  
    //configure the link to download the resized image
    tempLink.download = fileName;
    tempLink.href = canvas2.toDataURL("image/jpeg", 0.7);


    //trigger a click on the link to start the download
    // tempLink.click();
  
    
})




