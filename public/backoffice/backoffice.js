displayLoader()
/* https://quilljs.com/docs/api#content */

let famillesReceived = false
let categoriesReceived = false

let liste_produits = null
let liste_familles = null
let id_famille_selected = null
let id_categorie_selected = null

const eventListeFamilleReceived = new Event("event-liste-famille-received")


// getAllProduits()
async function getAllProduits() {
  let json = null
  const url = "http://192.168.2.236/visiolab/greencity_miniconfig/green_catalogue_rest/getProduits.php";
  // const url = "http://localhost/green_catalogue_rest/getProduits.php";
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
      liste_produits = json['produits']
      window.dispatchEvent(eventListeFamilleReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}
getListeFamilles()
async function getListeFamilles() {
  let json = null
  const url = "http://192.168.2.236/visiolab/greencity_miniconfig/green_catalogue_rest/getFamillesAndCategories.php";
  // const url = "http://localhost/green_catalogue_rest/getFamillesAndCategories.php";
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
window.addEventListener('event-liste-famille-received', (e) => {
  initCreateProduct()
  window.setTimeout(() => {
    hideLoader()
  }, 400)
}, false)
function getFamilleIndex(id_famille) {
  let famille_index = null
  liste_familles.forEach((famille, index_famille) => {
    if (parseInt(famille['id_famille']) === id_famille) famille_index = index_famille
  });
  return famille_index
}

function initCreateProduct() {
  setSelectFamille()
  setSelectCategorie(id_famille_selected)
  initNom()
  initMarque()
  initTitre()
  initDescriptions()
  render()
}

function setSelectFamille() {

  let create_famille = document.getElementById('create_famille')
  create_famille.innerHTML = ""

  let famille_label = document.createElement('div')
  famille_label.classList.add('form_label')
  famille_label.innerText = "Famille"
  create_famille.appendChild(famille_label)

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
  // render()
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

  selectCategorieOnChange()

}
function selectCategorieOnChange() {
  let select_categorie = document.getElementById('select_categorie')
  id_categorie_selected = parseInt(select_categorie.value)
  render()
}

function initNom() {
  let input_nom = document.getElementById('input_nom')
  input_nom.addEventListener('keyup', (e) => {
    let produit_nom = document.getElementById('produit-nom')
    produit_nom.innerText = e.target.value
  })
}
function initMarque() {
  let input_marque = document.getElementById('input_marque')
  input_marque.addEventListener('keyup', (e) => {
    let produit_marque = document.getElementById('produit-marque')
    produit_marque.innerText = e.target.value.toUpperCase()
  })
}
function initTitre() {
  let input_titre_group = document.getElementById('input_titre_groupe')
  input_titre_group.addEventListener('keyup', (e) => {
    let produit_titre_groupe = document.getElementById('produit-titre-groupe')
    produit_titre_groupe.innerText = e.target.value
  })
}

/* Description group */
createDescriptionGroup()
function createDescriptionGroup() {

  let top_separator = document.createElement('hr')

  let titre_group = xCreateElement('div', 'ligne', 'create_titre_gorupe')
  let titre_group_label = xCreateElement('div', 'ligne form_label', '')
  titre_group_label.innerHTML = "Titre"
  titre_group.appendChild(titre_group_label)
  let titre_group_input = xCreateElement('input', '', 'input_titre_groupe')
  titre_group_input.setAttribute('type', 'text')
  titre_group_input.setAttribute('placeholder', 'Titre section')
  titre_group_input.setAttribute('autocomplete', 'new-password')
  titre_group.appendChild(titre_group_input)

  let description_big_container = xCreateElement('div', '', 'description-big-container')
  let description_form_label = xCreateElement('div', 'form_label', '')
  description_form_label.innerHTML = 'Descriptions'
  let quill_container = xCreateElement('div', 'quill-container', '')
  let editor_container = xCreateElement('div', 'editor-container', '')
  let description_editor = xCreateElement('div', 'description-editor', 'description-0')
  editor_container.appendChild(description_editor)
  quill_container.appendChild(editor_container)
  description_big_container.appendChild(quill_container)

  let image_ligne = xCreateElement('div', 'ligne', '')
  let image_form_label = xCreateElement('div', 'form_label', '')
  let image_input = xCreateElement('input', '', 'add_thumb')
  image_input.setAttribute('type', 'button')
  image_input.setAttribute('value', 'Ajouter une image vignette')
  image_form_label.appendChild(image_input)
  image_ligne.appendChild(image_form_label)

  

  // <hr />

  // <div class="ligne" id="create_titre_group">
  //   <div class="form_label">Titre</div>
  //   <input type="text" id="input_titre_groupe" placeholder="Titre section" autocomplete="new-password">
  // </div>

  // <div id="description-big-container">
  //   <div class="form_label">Descriptions</div>
  //   <div class="quill-container">
  //     <div class="editor-container">
  //       <div class="description-editor" id="description-0"></div>
  //     </div>
  //   </div>
  //   <input type="button" value="+ Ajouter un paragraphe de description" id="add_desciption_item">
  // </div>

  // <div class="ligne">
  //   <div class="form_label">Vignette</div>
  //   <input type="button" value="Ajouter une image vignette" id="add_thumb">
  // </div>
}

/* Descriptions */
var createProductDescriptionQuills = Array()
var createProductDescriptionQuillsIndex = 0
var description_content = []
function initDescriptions() {

  let quill_1 = new Quill('#description-0', {
    modules: {
      toolbar: true,
    },
    theme: 'snow',
    placeholder: "Votre description ..."
  })
  createProductDescriptionQuills[0] = quill_1
  initQuillEvent(createProductDescriptionQuills[0], 0)

  let add_description_item_btn = document.getElementById('add_desciption_item')
  add_description_item_btn.addEventListener('click', (e) => {
    createQuillDescription()
  })

  function createQuillDescription() {

    createProductDescriptionQuillsIndex++
    // let descriptionIndex = createProductDescriptionQuills.length
    let descriptionIndex = createProductDescriptionQuillsIndex

    let quill_container = document.createElement('div')
    quill_container.classList.add('quill-container')
    quill_container.setAttribute('id', 'quill_container-'+(descriptionIndex))
    let editor_container = document.createElement('div')
    editor_container.classList.add('editor-container')
    let description_editor = document.createElement('div')
    description_editor.classList.add('description-editor')
    description_editor.setAttribute('id', 'description-'+(descriptionIndex))
    editor_container.appendChild(description_editor)
    quill_container.appendChild(editor_container)
    let quill_btn_container = document.createElement('div')
    quill_btn_container.classList.add('quill_btn_container')
    let btn_remove_quill = document.createElement('input')
    btn_remove_quill.setAttribute('type', 'button')
    btn_remove_quill.setAttribute('value', "Supp.")
    btn_remove_quill.setAttribute('id', 'remove_description-'+(descriptionIndex))
    quill_btn_container.appendChild(btn_remove_quill)
    quill_container.appendChild(quill_btn_container)

    let description_big_container = document.getElementById('description-big-container')
    let add_description_item_btn = document.getElementById('add_desciption_item')
    description_big_container.insertBefore(quill_container, add_description_item_btn)

    let new_quill = new Quill('#description-'+(descriptionIndex), {
      modules: {
        toolbar: true,
      },
      theme: 'snow',
      placeholder: "Votre description ..."
    })
    createProductDescriptionQuills[descriptionIndex] = new_quill
    initQuillEvent(createProductDescriptionQuills[descriptionIndex], descriptionIndex)

    btn_remove_quill.addEventListener('click', (e) => {
      let quill_index = parseInt(e.target.getAttribute('id').split('-')[1])
      selected_quill = createProductDescriptionQuills[quill_index]
      selected_quill.enable(false)
      selected_quill = null
      // createProductDescriptionQuills.splice(quill_index, 1)
      // description_content.splice(quill_index, 1)
      delete createProductDescriptionQuills[quill_index]
      delete description_content[quill_index]
      description_big_container.removeChild(document.getElementById('quill_container-'+(quill_index)))
    })
  }

  function initQuillEvent(quill, quill_index) {
    quill.on('text-change', (delta, oldDelta, source) => {
      description_content[quill_index] = quill.getSemanticHTML()
      // console.log(description_content)
      // console.log(createProductDescriptionQuills)
      render()
    })
  }
  function renderPreview(html) {
    console.log("render")
    let renderDiv = document.getElementById('render')
    renderDiv.innerHTML = html
  }
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

/* Image */
document.getElementById('add_thumb').addEventListener('click', (e) => {
  let popup_canvas_container = document.getElementById('popup-canvas-container')
  popup_canvas_container.style.display = "block"
})
window.addEventListener('event-image-canvas2', (e) => {
  let popup_canvas_container = document.getElementById('popup-canvas-container')
  popup_canvas_container.style.display = "none"
  let display_result_img = document.getElementById('produit-picture')
    display_result_img.src = canvas2.toDataURL("image/jpeg", 0.7)
    display_result_img.style.display = "block"

}, false)
document.getElementById('close-popup-canvas-container').addEventListener('click', (e) => {
  let popup_canvas_container = document.getElementById('popup-canvas-container')
  popup_canvas_container.style.display = "none"
})





/* Render */
function render() {
  let select_categorie = document.getElementById('select_categorie')
  id_categorie_selected = parseInt(select_categorie.value)

  // console.log(id_famille_selected)
  // console.log(id_categorie_selected)
  
  let header_titre = document.getElementById('produit-header-titre-text')
  header_titre.innerText = getCategorieName(id_categorie_selected).toUpperCase()

  let produit_descriptif = document.getElementById('produit-descriptif')
  if (description_content.length > 0) 
    produit_descriptif.innerHTML = description_content[0]
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


/* Data manipulation */
function getCategorieName(id_cat) {
  let nom_cat = null
  liste_familles.forEach(famille => {
    famille.liste_categories.forEach(categorie => {
      if (categorie.id_categorie == id_cat) nom_cat = categorie.nom_categorie
    })
  })
  return nom_cat
}

/* Divers */
function splitColorNameProduit(nom_prod, separator) {
  nom_prod = nom_prod.split(' ')
  let blanc = ""
  let gold = ""
  nom_prod.forEach(mot => {
    if (mot.toUpperCase() === mot) {
      gold += mot + separator
    } else {
      blanc += mot + separator
    }
  })
  return [blanc, gold]
}

function xCreateElement(type, elem_classes, elem_id) {
  let element = document.createElement(type)
  if (elem_classes !== "") {
    elem_classes.split(' ').forEach((elem_class) => {
      element.classList.add(elem_class)
    })
  }
  if (elem_id !== "") element.id = elem_id
  return element
}

