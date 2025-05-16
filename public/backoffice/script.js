displayLoader()

var app = app || {}
app.edit = app.edit || {}
app.edit = {

    /* https://quilljs.com/docs/api#content */
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


let famillesReceived = false
let categoriesReceived = false

let liste_familles = null
let id_famille_selected = null

const eventListeFamilleReceived = new Event("event-liste-famille-received")



// getAllProduits()
async function getAllProduits() {
  let json = null
  const url = "http://localhost/green_catalogue_rest/getProduits.php";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    json = await response.json()
    if (json['status'] == 200) {
      liste_familles = json['produits']
      window.dispatchEvent(eventListeFamilleReceived)
    }  
  } catch (error) {
    console.error(error.message);
  }
}
getListeFamilles()
async function getListeFamilles() {
  let json = null
  const url = "http://localhost/green_catalogue_rest/getFamillesAndCategories.php";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    json = await response.json()
    if (json['status'] == 200) {
      liste_familles = json['familles']
      console.log(liste_familles)
      window.dispatchEvent(eventListeFamilleReceived)
    }  
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-liste-famille-received', (e)=> {
  initCreateProduct()
  window.setTimeout(()=>{
    hideLoader()
  },400)
}, false)
function getFamilleIndex(id_famille) {
  let famille_index = null
  liste_familles.forEach((famille, index_famille) => {
    if (famille['id_famille'] === id_famille) famille_index = index_famille
  });
  return famille_index
}


function initCreateProduct() {
  setSelectFamille()
  setSelectCategorie(id_famille_selected)
}

function setSelectFamille() {

  let create_famille = document.getElementById('create_famille')
  let create_famille_container = document.createElement('div')
  create_famille_container.classList.add('select_container')

  let select_famille = document.createElement('select')
  select_famille.setAttribute('name', 'select_famille')
  select_famille.setAttribute('id', 'select_famille')
  liste_familles.forEach((famille, index_famille) => {
    let option_famille = document.createElement('option')
    option_famille.setAttribute('value', parseInt(famille['id_famille']))
    if (index_famille == 0) {
      option_famille.setAttribute('selected', 'selected')
      id_famille_selected = parseInt(famille['id_famille'])
    }      
    option_famille.innerText = famille['nom_famille']
    select_famille.appendChild(option_famille)
  });
  create_famille_container.appendChild(select_famille)

  let add_famille_btn = document.createElement('div')
  add_famille_btn.classList.add('form_button')
  add_famille_btn.setAttribute('id', 'create_add_famille_button')
  add_famille_btn.innerText = "+"
  create_famille_container.appendChild(add_famille_btn)
  create_famille.appendChild(create_famille_container)

  select_famille.addEventListener('change', selectFamilleOnChange)
  add_famille_btn.addEventListener('click', openEditFamillePopup)
}
function selectFamilleOnChange() {
  let select_famille = document.getElementById('select_famille')
  id_famille_selected = parseInt(select_famille.value)
  setSelectCategorie(parseInt(select_famille.value))
} 

function setSelectCategorie(id_famille) {

  console.log('-- setSelectCategorie')

  let create_categorie = document.getElementById('create_categorie')
  create_categorie.innerHTML = ""
  let categorie_label = document.createElement('div')
  categorie_label.classList.add('form_label')
  categorie_label.innerText = "Catégorie"
  create_categorie.appendChild(categorie_label)

  let create_cat_container = document.createElement('div')
  create_cat_container.classList.add('select_container')
  
  let select_cat = document.createElement('select')
  select_cat.setAttribute('name', 'select_categorie')
  select_cat.setAttribute('id', 'select_categorie')
  let liste_cat = liste_familles[getFamilleIndex(id_famille)].liste_categories
  liste_cat.forEach(categorie => {
    let option_cat = document.createElement('option')
    option_cat.setAttribute('value', parseInt(categorie['id_categorie']))
    option_cat.innerText = categorie['nom_categorie']
    select_cat.appendChild(option_cat)
  })
  create_cat_container.appendChild(select_cat)

  let add_cat_btn = document.createElement('div')
  add_cat_btn.classList.add('form_button')
  add_cat_btn.setAttribute('id', 'edit_categorie_button')
  add_cat_btn.innerText = "+"
  create_cat_container.appendChild(add_cat_btn)

  create_categorie.appendChild(create_cat_container)

  select_cat.addEventListener('change', selectCategorieOnChange)
  add_cat_btn.addEventListener('click', openEditCategoriePopup)
  
}
function selectCategorieOnChange() {
  let select_categorie = document.getElementById('select_categorie')
  console.log(parseInt(select_categorie.value))
} 


/* Popup d'édition Familles - Catégories */
function openEditFamillePopup() {

  let popup_container = document.getElementById('popup-container')
  popup_container.style.display = 'block'
  popup_container.style.zIndex = 20

  let popup_add_famille = document.getElementById('popup-add-famille')
  let popup_add_categorie = document.getElementById('popup-add-categorie')
  popup_add_famille.style.display = "flex"
  popup_add_categorie.style.display = "none"

  let popup_add_famille_close = document.getElementById('popup-add-famille-close')
  popup_add_famille_close.addEventListener('click', closeEditFamillePopup)

  let add_famille_input = document.getElementById('add-famille-input')
  add_famille_input.addEventListener('keyup', (e) => {
    console.log(add_famille_input.value)
    if (e.key === "Enter") { createNewFamille() }
    if (add_famille_input.value.length > 2) { 
      add_famille_input.style.border = "1px solid rgb(118,118,118)" 
      add_famille_input.style.outlineColor = "rgb(118,118,118)"
    } else {
      add_famille_input.style.border = "1px solid rgb(255,0,0)"
      add_famille_input.style.outlineColor = "rgb(255,0,0)"
    }
  })
  let popup_add_famille_button = document.getElementById('add-famille-button')
  popup_add_famille_button.addEventListener('click', createNewFamille)

}
function closeEditFamillePopup() {
  let popup_container = document.getElementById('popup-container')
  popup_container.style.display = 'none'
  popup_container.style.zIndex = -1
}

function openEditCategoriePopup() {

  let popup_container = document.getElementById('popup-container')
  popup_container.style.display = 'block'
  popup_container.style.zIndex = 20

  let popup_add_famille = document.getElementById('popup-add-famille')
  let popup_add_categorie = document.getElementById('popup-add-categorie')
  popup_add_famille.style.display = "none"
  popup_add_categorie.style.display = "flex"
  
  let popup_add_categorie_close = document.getElementById('popup-add-categorie-close')
  popup_add_categorie_close.addEventListener('click', closeEditCategoriePopup)

  let add_categorie_input = document.getElementById('add-categorie-input')
  add_categorie_input.addEventListener('keyup', (e) => {
    console.log(add_categorie_input.value)
    if (e.key === "Enter") { createNewCategorie() }
    if (add_categorie_input.value.length > 2) { 
      add_categorie_input.style.border = "1px solid rgb(118,118,118)" 
      add_categorie_input.style.outlineColor = "rgb(118,118,118)"
    } else {
      add_categorie_input.style.border = "1px solid rgb(255,0,0)"
      add_categorie_input.style.outlineColor = "rgb(255,0,0)"
    }
  })
  let popup_add_categorie_button = document.getElementById('add-categorie-button')
  popup_add_categorie_button.addEventListener('click', createNewCategorie)

}
function closeEditCategoriePopup() {
  let popup_container = document.getElementById('popup-container')
  popup_container.style.display = 'none'
  popup_container.style.zIndex = -1
}

function createNewFamille() {
  let add_famille_input = document.getElementById('add-famille-input')
  let input_value = add_famille_input.value
  if (input_value.length > 2) {
    input_value = input_value.charAt(0).toUpperCase() + input_value.slice(1)
    sendNewFamille(input_value)
  }
}
function createNewCategorie() {
  let add_categorie_input = document.getElementById('add-categorie-input')
  let input_value = add_categorie_input.value
  if (input_value.length > 2) {
    input_value = input_value.charAt(0).toUpperCase() + input_value.slice(1)
    sendNewCategorie(input_value, id_famille_selected)
  }
}

/* Définition des event de fin d'envoi */
const eventNewFamilleInserted = new Event("event-new-famille-inserted")
const eventNewCategorieInserted = new Event("event-new-categorie-inserted")

/* Send new famille création */
async function sendNewFamille(nom_famille) {
  
  let json = null
  const url = "http://localhost/green_catalogue_rest/createFamille.php"
  let formData = new FormData()
  formData.append('nom_famille', nom_famille)
  try {
    const response = await fetch(url, {
      method: "post",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    json = await response.json()
    console.log(json)
    if (json['status'] == 200) {
      let inserted_id_famille = json['id_famille']
      console.log(inserted_id_famille)
      window.dispatchEvent(eventNewFamilleInserted)
    }  
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-new-famille-inserted', newFamilleInserted, false)
function newFamilleInserted() {
  console.log('-- new famille inserted')
  // todo popup message
  closeEditFamillePopup()
}
/* Send new categorie création */
async function sendNewCategorie(nom_categorie, id_famille) {
  
  let json = null
  const url = "http://localhost/green_catalogue_rest/createCategorie.php"
  let formData = new FormData()
  formData.append('nom_categorie', nom_categorie)
  formData.append('id_famille', id_famille)
  try {
    const response = await fetch(url, {
      method: "post",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    json = await response.json()
    console.log(json)
    if (json['status'] == 200) {
      let inserted_id_categorie = json['id_categorie']
      console.log(inserted_id_categorie)
      window.dispatchEvent(eventNewCategorieInserted)
    }  
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-new-categorie-inserted', newCategorieInserted, false)
function newCategorieInserted() {
  console.log('-- new categorie inserted')
  // todo popup message
  closeEditCategoriePopup()
}

/* Upload file */
function srcToFile(src, fileName, mimeType){
  return (fetch(src)
      .then(function(res){return res.arrayBuffer();})
      .then(function(buf){return new File([buf], fileName, {type:mimeType});})
  );
}

function uploadImage() {
  
  const imagePath = './img/dragon2.jpg'
  const image = new Image()
  image.src = imagePath
  let myImage = document.getElementById('image')
  myImage.setAttribute('src', imagePath)

  srcToFile('./img/dragon2.jpg', 'new.jpg', 'image/jpg')
  .then(function(file){
    var fd = new FormData();
    fd.append('image', file);
    return fetch('http://localhost/green_catalogue_rest/createImage.php', {method:'POST', body:fd});
  })
  .then(function(res){
    return res.json();
  })
  .then(console.log)
  .catch(console.error)
}


/* Loader */
function displayLoader() {
  let loaderContainer = document.getElementById('loader-container')
  loaderContainer.style.display = "block"
}
function hideLoader() {
  let loaderContainer = document.getElementById('loader-container')
  loaderContainer.style.display = "none"
}