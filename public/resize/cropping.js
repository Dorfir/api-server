//draw the image on first load
cropImage(imagePath, 0, 0, 200, 200);


//crop the image and draw it to the canvas
function cropImage(imagePath, newX, newY, newWidth, newHeight) {
    //create an image object from the path
    const originalImage = new Image();
    originalImage.src = imagePath;
 
    //initialize the canvas object
    const canvas = document.getElementById('canvas'); 
    const ctx = canvas.getContext('2d');
 
    //wait for the image to finish loading
    originalImage.addEventListener('load', function() {
 
        //set the canvas size to the new width and height
        canvas.width = newWidth;
        canvas.height = newHeight;
         
        //draw the image
        ctx.drawImage(originalImage, newX, newY, newWidth, newHeight, 0, 0, newWidth, newHeight); 
    });
}

//find the input elements in the html
const downloadBtn = document.querySelector("button.download");

//bind a click listener to the download button
downloadBtn.addEventListener('click', function() {
    //create a temporary link for the download item
    let tempLink = document.createElement('a');
  
    //generate a new filename
    let fileName = `image-cropped.jpg`;
    
    //configure the link to download the resized image
    tempLink.download = fileName;
    tempLink.href = document.getElementById('canvas').toDataURL("image/jpeg", 0.9);
  
    //trigger a click on the link to start the download
    tempLink.click();
});