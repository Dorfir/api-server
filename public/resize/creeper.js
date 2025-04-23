// resizeImage(imagePath, 535, 725)
// resizeImage(imagePath, 350)
const cropFormat = { w: 200, h: 147 }

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasSize = { w:600, h:600 }
canvas.width = canvasSize.w
canvas.height = canvasSize.h

const canvas2 = document.getElementById('canvas2')
const ctx2 = canvas2.getContext('2d')
canvas2.width = cropFormat.w
canvas2.height = cropFormat.h


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
var cropLines = [
    { id: "line-x1", x1: cropBounds.x1, y1: 0, x2: cropBounds.x1, y2: canvasSize.h },
    { id: "line-x2", x1: cropBounds.x2, y1: 0, x2: cropBounds.x2, y2: canvasSize.h },
    { id: "line-y1", x1: 0, y1: cropBounds.y1, x2: canvasSize.w, y2: cropBounds.y1 },
    { id: "line-y2", x1: 0, y1: cropBounds.y2, x2: canvasSize.w, y2: cropBounds.y2 },
]


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

    draw()
})

var dragActive = false
var pCoord1 = { x: 0, y: 0 }
var pCoord2 = { x: 0, y: 0 }
var delta = { x:0, y: 0 }
var canvasComputed = canvas.getBoundingClientRect()


canvas.addEventListener('pointerdown', (e) => {
    // console.log(`down ${e.pointerId} - ${e.pointerType} - (${e.clientX}, ${e.clientY}) `)
    pCoord1.x = e.clientX - canvasComputed.x
    pCoord1.y = e.clientY - canvasComputed.y
    console.log(`x: ${pCoord1.x}, y: ${pCoord1.y}`)
    dragActive = true
})
canvas.addEventListener('pointermove', (e) => {
    if (dragActive) {
        pCoord2.x = e.clientX - canvasComputed.x
        pCoord2.y = e.clientY - canvasComputed.y
        // console.log(`x: ${pCoord2.x}, y: ${pCoord2.y}`)
        delta.x = pCoord2.x - pCoord1.x
        delta.y = pCoord2.y - pCoord1.y

        imageCoord.x += delta.x
        imageCoord.y += delta.y
        draw()

        pCoord1.x = pCoord2.x
        pCoord1.y = pCoord2.y
    }
})
window.addEventListener('pointerup', (e) => {
    dragActive = false
})
canvas.addEventListener('pointerup', (e) => {
    dragActive = false
})
canvas.addEventListener('pointerout', (e) => {
    // dragActive = false
})
canvas.addEventListener('pointercancel', (e) => {
    dragActive = false
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
    ctx.fillRect(0, 0, canvasSize.w, cropBounds.y1)
    ctx.fillRect(0, cropBounds.y1, cropBounds.x1, cropBounds.y2 - cropBounds.y1)
    ctx.fillRect(cropBounds.x2, cropBounds.y1, canvasSize.w - cropBounds.x2, cropBounds.y2 - cropBounds.y1)
    ctx.fillRect(0, cropBounds.y2, canvasSize.w, canvasSize.h - cropBounds.y2)
}



const downloadBtn = document.querySelector("button.download");
downloadBtn.addEventListener('click', function() {
    
    let tmpBounds = {
        x : -(cropBounds.x1 - imageCoord.x),
        y : -(cropBounds.y1 - imageCoord.y),
        w : imageCoord.w,
        h : imageCoord.h,
    }
    console.log(tmpBounds)
    ctx2.drawImage(image, -(cropBounds.x1 - imageCoord.x), -(cropBounds.y1 - imageCoord.y), imageCoord.w, imageCoord.h)
    
    // let image2 = new Image(cropFormat.w, cropFormat.h)
    // image2.src = canvas2.toDataURL("image/jpeg", 0.7)
    // image2.addEventListener('load', () => {
    //     document.body.appendChild(image2)
    // })

    //create a temporary link for the download item
    let tempLink = document.createElement('a');

    //generate a new filename
    let fileName = `image-resized.jpg`;
  
    //configure the link to download the resized image
    tempLink.download = fileName;
    tempLink.href = canvas2.toDataURL("image/jpeg", 0.7);


    //trigger a click on the link to start the download
    tempLink.click();
  
    
})



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
    
    // console.log( `${centerx}, ${centery}` )
    // console.log( `${zoomValue} - (${imageCoord.w},${imageCoord.h})` )

    draw()  

    oldZoomRatio = zoomRatio

}






/* ------------------------------------------------------------------------------------------------------- */

function resizeImage(imagePath) {
    
    const originalImage = new Image();
    originalImage.src = imagePath;
 
    var newWidth = cropFormat.w
    var newHeight = cropFormat.h
    
    originalImage.addEventListener('load', function() {
        
        const originalWidth = originalImage.naturalWidth;
        const originalHeight = originalImage.naturalHeight;
        const aspectRatio = originalWidth/originalHeight;

        canvas.width = newWidth;
        canvas.height = newHeight;
        
        if (aspectRatio >= 1) {
            let drawX = 0
            let drawY = Math.floor( (cropFormat.h - cropFormat.w * aspectRatio) / 2) 
            let drawW = cropFormat.w
            let drawH = Math.floor(cropFormat.w * aspectRatio)
            ctx.drawImage(originalImage, drawX, drawY, drawW, drawH)    
        } else {
            let drawX = Math.floor( (cropFormat.w - cropFormat.h / aspectRatio) / 2)
            let drawY = 0 
            let drawW = Math.floor(cropFormat.h / aspectRatio)
            let drawH = cropFormat.h
            ctx.drawImage(originalImage, drawX, drawY, drawW, drawH)
        }
        
    })
}


 
//a click event handler for the download button
//download the resized image to the client computer


// downloadBtn.addEventListener('click', function() {
//     //create a temporary link for the download item
//     let tempLink = document.createElement('a');

//     //generate a new filename
//     let fileName = `image-resized.jpg`;
  
//     //configure the link to download the resized image
//     tempLink.download = fileName;
//     tempLink.href = document.getElementById('canvas').toDataURL("image/jpeg", 0.7);

//     //trigger a click on the link to start the download
//     tempLink.click();

    
  
    
// })



