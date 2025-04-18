//resize and draw the image on first load
// resizeImage(imagePath, 535, 725)
resizeImage(imagePath, 350)

//resize the image and draw it to the canvas
function resizeImage(imagePath, newWidth, newHeight) {
    //create an image object from the path
    const originalImage = new Image();
    originalImage.src = imagePath;
 
    //get a reference to the canvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
 
    //wait for the image to load
    originalImage.addEventListener('load', function() {
        
        //get the original image size and aspect ratio
        const originalWidth = originalImage.naturalWidth;
        const originalHeight = originalImage.naturalHeight;
        const aspectRatio = originalWidth/originalHeight;

        //if the new height wasn't specified, use the width and the original aspect ratio
        if (newHeight === undefined) {
        // if (isNaN(newHeight)) {

            //calculate the new height
            newHeight = newWidth/aspectRatio;
            newHeight = Math.floor(newHeight);
            
            //update the input element with the new height
            // hInput.placeholder = `Height (${newHeight})`;
            // hInput.value = newHeight;
        }
      
        //set the canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;
         
        //render the image
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
    });
}

const downloadBtn = document.querySelector("button.download");
 
//a click event handler for the download button
//download the resized image to the client computer
downloadBtn.addEventListener('click', function() {
    //create a temporary link for the download item
    let tempLink = document.createElement('a');

    //generate a new filename
    let fileName = `image-resized.jpg`;
  
    //configure the link to download the resized image
    tempLink.download = fileName;
    tempLink.href = document.getElementById('canvas').toDataURL("image/jpeg", 0.7);
  
    //trigger a click on the link to start the download
    tempLink.click();
});

