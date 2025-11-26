displayLoader()
/* https://quilljs.com/docs/api#content */

/* -- Variables -------------------------------------------------------------------------------------------------------- */
let famillesReceived = false
let categoriesReceived = false

let liste_produits = null
let liste_familles = null

let firstLoad = true

let description_active = 0


/* -- Data created ----------------------------------------------------------------------------------------------------- */
let data = {
  'id_produit': 0,
  'id_famille': 0,
  'nom_famille': "",
  'id_categorie': 0,
  'nom_categorie': "",
  'nom': "",
  'marque': "",
  'description': [],
  'images': [],
  'prix': "",
  'thumb': "",
}

/* -- Gathering Data ---------------------------------------------------------------------------------------------------- */
const eventProduitsReceived = new Event("event-produits-received")
const eventListeFamilleReceived = new Event("event-liste-famille-received")

getAllProduits()
async function getAllProduits() {
  let json = null
  // const url = "http://192.168.2.236/visiolab/greencity_miniconfig/green_catalogue_rest/getProduits.php";
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
      liste_produits = json['produits']
      window.dispatchEvent(eventProduitsReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-produits-received', (e)=> {
  // console.log(liste_produits)
})

getListeFamilles()
async function getListeFamilles() {
  let json = null
  // const url = "http://192.168.2.236/visiolab/greencity_miniconfig/green_catalogue_rest/getFamillesAndCategories.php";
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
      // console.log(liste_familles)
      window.dispatchEvent(eventListeFamilleReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-liste-famille-received', (e) => {
  if (firstLoad) {
    firstLoad = false
    initCreateProduct()
    window.setTimeout(() => {
      hideLoader()
    }, 400)
  } else {
    setSelectFamille(liste_familles.length - 1)
    if (liste_familles[liste_familles.length - 1].liste_categories.length != 0) {
      setSelectCategorie(liste_familles[liste_familles.length - 1].id_famille)
    } else {
      openEditCategoriePopup()
    }
    
  }
  
}, false)
function getFamilleIndex(id_famille) {
  let famille_index = null
  liste_familles.forEach((famille, index_famille) => {
    if (parseInt(famille['id_famille']) === id_famille) famille_index = index_famille
  });
  return famille_index
}



/* -- Formulaire initialization ------------------------------------------------------------------------------------------- */
function initCreateProduct() {
  setSelectFamille(0)
  setSelectCategorie(data.id_famille)
  initNom()
  initMarque()
  initDescriptionGroup()
  initSendServer()
  render()
}

/* Famille et catégories */
function setSelectFamille(index_selected) {

  // console.log(`-- setSelectFamille ${index_selected}`)

  let create_famille = document.getElementById('create_famille')
  create_famille.innerHTML = ""

  let famille_label = xCreateElement('div', 'form_label', '')
  famille_label.innerText = "Famille"
  create_famille.appendChild(famille_label)

  let create_famille_container = xCreateElement('div', 'select_container')

  let select_famille = xCreateElement('select', '', 'select_famille')
  select_famille.setAttribute('name', 'select_famille')
  liste_familles.forEach((famille, index_famille) => {
    let option_famille = document.createElement('option')
    option_famille.setAttribute('value', parseInt(famille['id_famille']))
    if (index_famille == index_selected) {
      option_famille.setAttribute('selected', 'selected')
      data.id_famille = parseInt(famille['id_famille'])
    }
    option_famille.innerText = famille['nom_famille']
    select_famille.appendChild(option_famille)
  });
  create_famille_container.appendChild(select_famille)

  let add_famille_btn = xCreateElement('div', 'form_button', 'create_add_famille_button' )
  add_famille_btn.innerText = "+"
  create_famille_container.appendChild(add_famille_btn)
  create_famille.appendChild(create_famille_container)

  select_famille.addEventListener('change', selectFamilleOnChange)
  add_famille_btn.addEventListener('click', openEditFamillePopup)
}
function selectFamilleOnChange() {
  let select_famille = document.getElementById('select_famille')
  data.id_famille = parseInt(select_famille.value)
  data.nom_famille = getFamilleName(data.id_famille)
  setSelectCategorie(data.id_famille)
  render()
}

function setSelectCategorie() {

  // console.log(`-- setSelectCategorie ${data.id_famille}`)

  let create_categorie = document.getElementById('create_categorie')
  create_categorie.innerHTML = ""
  let categorie_label = xCreateElement('div', 'form_label', '')
  categorie_label.innerText = "Catégorie"
  create_categorie.appendChild(categorie_label)

  let create_cat_container = xCreateElement('div', 'select_container')

  let select_cat = xCreateElement('select', '', 'select_categorie')
  select_cat.setAttribute('name', 'select_categorie')
  let liste_cat = getFamilleObject(data.id_famille).liste_categories
  // let liste_cat = liste_familles[getFamilleIndex(data.id_famille)].liste_categories
  liste_cat.forEach(categorie => {
    let option_cat = document.createElement('option')
    option_cat.setAttribute('value', parseInt(categorie['id_categorie']))
    option_cat.innerText = categorie['nom_categorie']
    select_cat.appendChild(option_cat)
  })
  create_cat_container.appendChild(select_cat)

  let add_cat_btn = xCreateElement('div', 'form_button', 'edit_categorie_button')
  add_cat_btn.innerText = "+"
  create_cat_container.appendChild(add_cat_btn)

  create_categorie.appendChild(create_cat_container)

  select_cat.addEventListener('change', selectCategorieOnChange)
  add_cat_btn.addEventListener('click', openEditCategoriePopup)

  selectCategorieOnChange()

}
function selectCategorieOnChange() {
  let select_categorie = document.getElementById('select_categorie')
  data.id_categorie = parseInt(select_categorie.value)
  data.nom_categorie = getCategorieName(data.id_categorie)
  render()
}

/* Nom et marque */
function initNom() {
  let input_nom = document.getElementById('input_nom')
  input_nom.addEventListener('keyup', (e) => {
    data.nom = e.target.value
    render()
    // let produit_nom = document.getElementById('produit-nom')
    // produit_nom.innerText = e.target.value
  })
}
function initMarque() {
  let input_marque = document.getElementById('input_marque')
  input_marque.addEventListener('keyup', (e) => {
    data.marque = e.target.value.toUpperCase()
    render()
    // let produit_marque = document.getElementById('produit-marque')
    // produit_marque.innerText = e.target.value.toUpperCase()
  })
}
/* Description group */
var xliste_descriptions = Array()
function initDescriptionGroup() {

  // only one group at start
  createDescriptionGroup()

  let add_description_group_btn = document.getElementById('add_desciption_group')
  add_description_group_btn.addEventListener('click', (e) => {
    createDescriptionGroup()
  })

}
function createDescriptionGroup() {

  // console.log('-- createDescriptionGroup')

  let desc_handler = initDescriptionGroupHandler()
  data.description.push({'title': '', 'content': '', 'global_index': desc_handler.global_index})
  data.images.push({'data': '', 'global_index': desc_handler.global_index})
  description_active = parseInt(desc_handler.global_index)

  // création des éléments du groupe de description
  let description_group_container = document.getElementById('description-group-container')
  let description_group = xCreateElement('div', 'description-group', `description-group-${desc_handler.global_index}`)

  let top_separator = document.createElement('hr')

  let delete_description_group_btn = null
  if (desc_handler.global_index != 0) {
    delete_description_group_btn = xCreateElement('div', 'delete-description-group', `delete-description-group-${desc_handler.global_index}`)
    delete_description_group_btn.innerHTML = "X"
  }

  let titre_group = xCreateElement('div', 'ligne', '')
  let titre_group_label = xCreateElement('div', 'ligne form_label', '')
  titre_group_label.innerHTML = "Bloc de description"
  titre_group.appendChild(titre_group_label)
  let titre_group_input = xCreateElement('input', 'input_titre_groupe', `input_titre_groupe-${desc_handler.global_index}`)
  titre_group_input.setAttribute('type', 'text')
  titre_group_input.setAttribute('placeholder', 'Titre section')
  titre_group_input.setAttribute('autocomplete', 'new-password')
  titre_group.appendChild(titre_group_input)

  let description_big_container = xCreateElement('div', '', 'description-big-container')
  let description_form_label = xCreateElement('div', 'form_label', '')
  description_form_label.innerHTML = 'Descriptions'
  let quill_container = xCreateElement('div', 'quill-container', '')
  let editor_container = xCreateElement('div', 'editor-container', '')
  let description_editor = xCreateElement('div', 'description-editor', `description-${desc_handler.global_index}`)
  editor_container.appendChild(description_editor)
  quill_container.appendChild(editor_container)
  description_big_container.appendChild(quill_container)

  let image_ligne = xCreateElement('div', 'ligne', '')
  let image_form_label = xCreateElement('div', 'form_label', '')
  let image_input = xCreateElement('input', 'description-add-image', `add-desc-image-${desc_handler.global_index}`)
  image_input.setAttribute('type', 'image')
  image_input.setAttribute('src', './img/image-add.svg')
  image_form_label.appendChild(image_input)
  image_ligne.appendChild(image_form_label)

  // assemblage des éléments du groupe de description
  description_group.appendChild(top_separator)
  if (delete_description_group_btn !== null)
    description_group.appendChild(delete_description_group_btn)
  description_group.appendChild(titre_group)
  description_group.appendChild(description_big_container)
  description_group.appendChild(image_ligne)

  description_group_container.appendChild(description_group)

  // ajout du conteneur html du groupe de description dans la liste des groupes
  desc_handler.html_object = description_group

  // event de suppression du groupe de description
  if (delete_description_group_btn !== null) {
    delete_description_group_btn.addEventListener('click', (e) => {
      removeDescriptionGroup(desc_handler.global_index)
    })
  }

  // event de transposition du titre du groupe de description dans l'aperçu
  titre_group_input.addEventListener('keyup', (e) => {
    let index = getDescriptionGroupHandlerIndex(desc_handler.global_index)
    data.description[index].title = e.target.value
    render()
    // let produit_titre_groupe = document.getElementById('produit-titre-groupe')
    // produit_titre_groupe.innerText = e.target.value
  })

  // création du quill
  let new_quill = new Quill(`#description-${desc_handler.global_index}`, {
    modules: {
      toolbar: true,
    },
    theme: 'snow',
    placeholder: "Votre description ..."
  })
  desc_handler.quill_object = new_quill
  
  xliste_descriptions.push(desc_handler)

  new_quill.on('text-change', (delta, oldDelta, source) => {
    desc_handler.text_content = new_quill.getSemanticHTML()
    let index = getDescriptionGroupHandlerIndex(desc_handler.global_index)
    data.description[index].content = desc_handler.text_content
    render()
  })

  initImage()

  // console.log(desc_handler)

}

function removeDescriptionGroup(global_index) {
  // console.log(`-- removeDescriptionGroup - ${global_index}`)
  let desc_handler_index = getDescriptionGroupHandlerIndex(global_index)
  xliste_descriptions.splice(desc_handler_index, 1)
  data.description.splice(desc_handler_index, 1)
  data.images.splice(desc_handler_index, 1)
  let description_group = document.getElementById(`description-group-${global_index}`)
  description_group.parentNode.removeChild(description_group)
  render()
}

function initDescriptionGroupHandler() {
  let new_desc = {
    'text_content' : '',
    'quill_object' : null,
    'html_object' : null,
    'global_index' : 0,
    'image_object' : null
  }
  if (xliste_descriptions.length != 0) {
    let index = 0
    xliste_descriptions.forEach(element => {
      if (element.global_index > index) index = element.global_index      
    });
    new_desc.global_index = index + 1 
  }
  return new_desc
}
function getDescriptionGroupHandlerIndex(global_index) {
  let return_value = null
  xliste_descriptions.forEach((element, element_index) => {
    if (parseInt(element.global_index) == parseInt(global_index)) return_value = element_index
  })
  return return_value
}

function initImage() {
  // todo reset handlers au recall d'initImage()
  let boutons_add_desc_image = document.querySelectorAll('.description-add-image')
  boutons_add_desc_image.forEach(btn_add_img => {
    btn_add_img.addEventListener('click', (e) => {
      //todo passer l'index 'absolu' de la description a la popup de cropping image pour qu'elle soit renvoyé en data avec l'event de event-image-canvas2
      description_active = parseInt(e.currentTarget.getAttribute('id').split('-').slice(-1))
      let popup_canvas_container = document.getElementById('popup-canvas-container')
      popup_canvas_container.style.display = "block"
    })
  })
  window.addEventListener('event-image-canvas2', (e) => {
    let popup_canvas_container = document.getElementById('popup-canvas-container')
    popup_canvas_container.style.display = "none"
    
    data.images[getDescriptionIndex(description_active)].data = canvas2.toDataURL("image/jpeg", 0.7)
    render()

  }, false)
  document.getElementById('close-popup-canvas-container').addEventListener('click', (e) => {
    let popup_canvas_container = document.getElementById('popup-canvas-container')
    popup_canvas_container.style.display = "none"
  })
}




/* -- Popup d'édition Familles - Catégories ---------------------------------------------------------------------------------- */
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

/* -- Render ------------------------------------------------------------------------------------------------------------------ */
function render() {

  let header_titre = document.getElementById('produit-header-titre-text')
  header_titre.innerText = getCategorieName(data.id_categorie).toUpperCase()

  let render_parent = document.getElementById('render-parent')
  render_parent.innerHTML = ""
  let separator = xCreateElement('div', 'modal-main-separator', '')
  separator.innerHTML = "&nbsp;"
  render_parent.appendChild(separator)


  let produit_marque_container = xCreateElement('div', 'produit-marque-container', '')
  let produit_nom = xCreateElement('div', 'produit-nom', 'produit-nom')
  produit_nom.innerHTML = data.nom
  produit_marque_container.appendChild(produit_nom)
  let produit_marque = xCreateElement('div', 'produit-marque', 'produit-marque')
  produit_marque.innerHTML = data.marque
  produit_marque_container.appendChild(produit_marque)
  produit_marque_container.innerHTML += `
    <svg viewBox="0 0 100 5" class="produit-separator">
      <line x1="0" y1="3" x2="100" y2="3" class="line-svg-thin" />
    </svg>
  `
  render_parent.appendChild(produit_marque_container)
  
  data.description.forEach((desc, index_desc) => {
    let produit_titre_groupe = xCreateElement('div', 'produit-titre-groupe', `produit-titre-groupe-${desc.global_index}`)
    produit_titre_groupe.innerHTML = desc.title
    let produit_group = xCreateElement('div', 'produit-group', `produit-group-${desc.global_index}`)
    let produit_descriptif = xCreateElement('div', 'produit-descriptif', `produit-descriptif-${desc.global_index}`)
    produit_descriptif.innerHTML = desc.content
    produit_group.appendChild(produit_descriptif)
    let produit_image = xCreateElement('img', 'produit-picture', 'produit-picture')
    // console.log(data.images[index_desc])
    produit_image.setAttribute('src', data.images[index_desc].data)
    produit_image.style.display = "block"
    produit_group.appendChild(produit_image)
    
    render_parent.appendChild(produit_titre_groupe)
    render_parent.appendChild(produit_group)
  })

  // <div class="produit-titre-groupe" id="produit-titre-groupe"></div>
  // <div class="produit-group">
  //   <div class="produit-descriptif" id='produit-descriptif'></div>
  //   <img src="../img/produits/paroisDouche_concertoWalkAlterna.jpg" class="produit-picture" id="produit-picture">
  // </div>

  // let produit_descriptif = document.getElementById('produit-descriptif')
  // if (xliste_descriptions.length > 0)
  //   produit_descriptif.innerHTML = xliste_descriptions[0].text_content
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
    // console.log(json)
    if (json['status'] == 200) {
      let inserted_id_famille = json['id_famille']
      // console.log(inserted_id_famille)
      window.dispatchEvent(eventNewFamilleInserted)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-new-famille-inserted', newFamilleInserted, false)
function newFamilleInserted() {
  // console.log('-- new famille inserted')
  // todo popup message
  getListeFamilles()
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
    // console.log(json)
    if (json['status'] == 200) {
      let inserted_id_categorie = json['id_categorie']
      // console.log(inserted_id_categorie)
      window.dispatchEvent(eventNewCategorieInserted)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-new-categorie-inserted', newCategorieInserted, false)
function newCategorieInserted() {
  // console.log('-- new categorie inserted')
  // todo popup message
  getListeFamilles()
  closeEditCategoriePopup()
}




/* Send server */
function initSendServer() {
  document.getElementById('send_server').addEventListener('click', (e) => {

    // TODO gestion de la taille max de la requete POST -+ 8Mb max
    console.log('-- sendServer()')

    console.log(data)
    sendProduit()


    // if (data.images.length > 0) {
    //   if (data.images[0].data != '') {

    //     imgBase64 = data.images[0].data
    //     const myfile = DataURIToBlob(imgBase64)
      
    //     sendImageDescription(myfile)

    //   }      
    // }

  })
}
async function sendProduit() {

  let json = null
  const url = "http://localhost/green_catalogue_rest/uploadProduit.php"
  let formData = new FormData()
  formData.append('id_famille', data.id_famille)
  formData.append('id_categorie', data.id_categorie)
  formData.append('nom', data.nom)
  formData.append('marque', data.marque)
  data.description.forEach((desc, index_desc) => {
    formData.append(`desc_${index_desc}`, desc.content)
  })
  data.images.forEach((image_produit, index_image) => {
    let imgBase64 = image_produit.data
    let myfile = DataURIToBlob(imgBase64)
    formData.append(`file_image_${index_image}`, myfile, `file_image_${index_image}.jpeg`)
  })

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
    
  } catch (error) {
    console.error(error.message);
  }
  
  
}

/* Send new categorie création */
async function sendImageDescription(myfile) {

  let json = null
  const url = "http://localhost/green_catalogue_rest/upload_image.php"
  let formData = new FormData()
  formData.append('fichier_image', myfile, 'myfile.jpeg')
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
    // if (json['status'] == 200) {
    //   let inserted_id_categorie = json['id_categorie']
    //   window.dispatchEvent(eventNewCategorieInserted)
    // }
  } catch (error) {
    console.error(error.message);
  }
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
      console.log(res.json())
      return res.json();
    })
    .then(console.log)
    .catch(console.error)
}
function DataURIToBlob(dataURI) {
  const splitDataURI = dataURI.split(',')
  const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

  const ia = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i)

  return new Blob([ia], { type: mimeString })
}



/* ------------------- Loader ------------------- */
function displayLoader() {
  let loaderContainer = document.getElementById('loader-container')
  loaderContainer.style.display = "block"
}
function hideLoader() {
  let loaderContainer = document.getElementById('loader-container')
  loaderContainer.style.display = "none"
}

/* ------------------- Data manipulation ------------------- */
function getFamilleObject(id_fam) {
  let obj_fam = null
  liste_familles.forEach(famille => {
    if (famille.id_famille == id_fam) obj_fam = famille
  })
  return obj_fam
}
function getFamilleName(id_fam) {
  let nom_fam = null
  let obj_fam = getFamilleObject(id_fam)
  if (obj_fam == null) {
    nom_fam = null
  } else {
    nom_fam = obj_fam.nom_famille
  }
  return nom_fam
}
function getCategorieName(id_cat) {
  let nom_cat = null
  liste_familles.forEach(famille => {
    famille.liste_categories.forEach(categorie => {
      if (categorie.id_categorie == id_cat) nom_cat = categorie.nom_categorie
    })
  })
  return nom_cat
}
function getDescriptionIndex(index_absolute) {
  let index = 0
  data.description.forEach((desc, desc_index)=> {
    if (desc.global_index == index_absolute) index = desc_index
  })
  return index
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
function xCreateElement(type, elem_classes) {
  return xCreateElement(type, elem_classes, '')
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

