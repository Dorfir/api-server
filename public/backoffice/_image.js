/* Upload file */
function srcToFile(src, fileName, mimeType) {
  return (fetch(src)
    .then(function (res) { return res.arrayBuffer(); })
    .then(function (buf) { return new File([buf], fileName, { type: mimeType }); })
  );
}
function uploadImage() {

  const imagePath = './img/dragon2.jpg'
  const image = new Image()
  image.src = imagePath
  let myImage = document.getElementById('image')
  myImage.setAttribute('src', imagePath)

  srcToFile('./img/dragon2.jpg', 'new.jpg', 'image/jpg')
    .then(function (file) {
      var fd = new FormData();
      fd.append('image', file);
      return fetch('http://localhost/green_catalogue_rest/createImage.php', { method: 'POST', body: fd });
    })
    .then(function (res) {
      console.log(res.json())
      return res.json();
    })
    .then(console.log)
    .catch(console.error)
}