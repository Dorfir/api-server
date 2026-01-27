displayLoader()
/* https://quilljs.com/docs/api#content */

/* -- Variables -------------------------------------------------------------------------------------------------------- */
let famillesReceived = false
let categoriesReceived = false

let liste_produits = null
let liste_familles = null

let firstLoad = true


const image_path = `${path_prefix}green_catalogue_rest/uploads/`

var np_liste_descriptions_infos = Array()
var ep_liste_descriptions_infos = Array()

var current_mode = "new_produit"
// var current_mode = "edit_produit"

const url_rest_prefix = `${path_prefix}green_catalogue_rest/`

const url_send_new_produit = url_rest_prefix + "uploadProduit.php"
const url_send_edit_produit = url_rest_prefix + "updateProduit.php"
const url_create_famille = url_rest_prefix + "createFamille.php"
const url_get_produits = url_rest_prefix + "getProduits.php"
const url_get_produit = url_rest_prefix + "getProduit.php"
const url_get_familles_et_cats = url_rest_prefix + "getFamillesAndCategories.php"
const url_create_categorie = url_rest_prefix + "createCategorie.php"




/* -- Gathering Data ---------------------------------------------------------------------------------------------------- */
const eventProduitsReceived = new Event("event-produits-received")

// TODO 
// redirection des callbacks pour edit / new
// gestion reset / reloading
getAllProduits()
async function getAllProduits() {
  let json = null
  // const url_get_produits = "http://localhost/green_catalogue_rest/getProduits.php";
  try {
    const response = await fetch(url_get_produits, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    json = await response.json()
    if (json['status'] == 200) {
      liste_produits = json['produits']
      console.log(liste_produits)
      window.dispatchEvent(eventProduitsReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-produits-received', (e)=> {
  // console.log(liste_produits)
  hideLoader()
  initListeProduits()
})

async function getListeFamilles(mode) {
  displayLoader()
  let json = null
  // const url = "http://localhost/green_catalogue_rest/getFamillesAndCategories.php";
  try {
    const response = await fetch(url_get_familles_et_cats, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    json = await response.json()
    if (json['status'] == 200) {
      liste_familles = json['familles']
      console.log(liste_familles)
      let event_familles = new Event("event-liste-famille-received")
      event_familles.mode = mode
      window.dispatchEvent(event_familles)
    }
  } catch (error) {
    console.error(error.message);
  }
}
// BORDEL ICI - repenser le loading général + gestion select famille
window.addEventListener('event-liste-famille-received', (e) => {

  console.log(`event-liste-famille-received - mode : ${e.mode}`)

  // se débarrasser du current_mode
  if (e.mode == "new") {
    if (current_mode == "new_produit") {
      data.id_famille = liste_familles[0].id_famille
      data.nom_famille = liste_familles[0].nom_famille
      data.id_categorie = liste_familles[0].liste_categories[0].id_categorie
      data.nom_categorie = liste_familles[0].liste_categories[0].nom_categorie
      initCreateProduct()
    } else if (current_mode == "edit_produit") {
      ep_initEditProduit()
    }  
    
  } else if (e.mode == "maj") {
    if (current_mode == "new_produit") {
      // np_setSelectFamille(liste_familles.length - 1)
      // np_setSelectFamille(data.id_famille)
      np_setSelectFamille()
      if (liste_familles[liste_familles.length - 1].liste_categories.length != 0) {
        data.id_famille = liste_familles[liste_familles.length - 1].id_famille
        np_setSelectCategorie()
      } else {
        openEditCategoriePopup()
      }
    } else if (current_mode == "edit_produit") {
        ep_setSelectFamille()
        if (liste_familles[getFamilleIndex(data_edit.id_famille)].liste_categories.length != 0) {
          ep_setSelectCategorie()
        } else {
          openEditCategoriePopup()
        }
    }  
  }
  window.setTimeout(() => { hideLoader() }, 400)

}, false)
function getFamilleIndex(id_famille) {
  let famille_index = null
  liste_familles.forEach((famille, index_famille) => {
    if (parseInt(famille['id_famille']) === id_famille) famille_index = index_famille
  });
  return famille_index
}


/* -- Popup d'édition Familles - Catégories ---------------------------------------------------------------------------------- */
function openEditFamillePopup() {

  console.log('-- openEditFamillePopup')

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
    // console.log(add_famille_input.value)
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
  console.log('-- closeEditFamillePopup()')
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
    // console.log(add_categorie_input.value)
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
  console.log('-- closeEditCategoriePopup')
  let popup_container = document.getElementById('popup-container')
  popup_container.style.display = 'none'
  popup_container.style.zIndex = -1
}
function createNewFamille() {
  console.log('-- createNewFamille()')
  let add_famille_input = document.getElementById('add-famille-input')
  let input_value = add_famille_input.value
  if (input_value.length > 2) {
    input_value = input_value.charAt(0).toUpperCase() + input_value.slice(1)
    sendNewFamille(input_value)
  }
}
function createNewCategorie() {
  console.log('-- createNewCategorie')
  let add_categorie_input = document.getElementById('add-categorie-input')
  let input_value = add_categorie_input.value
  if (input_value.length > 2) {
    input_value = input_value.charAt(0).toUpperCase() + input_value.slice(1)
    // sendNewCategorie(input_value, id_famille_selected)
    console.log(current_mode)
    switch (current_mode) {
      case 'new_produit' :
        sendNewCategorie(input_value, data.id_famille)
        break;
      case 'edit_produit' :
        sendNewCategorie(input_value, data_edit.id_famille)
        break;
    } 
    
  }
}

/* Send new famille création */
async function sendNewFamille(nom_famille) {

  console.log('-- sendNewFamille()')

  let json = null
  // const url_create_famille = "http://localhost/green_catalogue_rest/createFamille.php"
  let formData = new FormData()
  formData.append('nom_famille', nom_famille)
  try {
    const response = await fetch(url_create_famille, {
      method: "post",
      body: formData,
    });
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    json = await response.json()
    if (json['status'] == 200) {
      // data.id_famille = json['id_famille']
      let event_new_famille = new Event("event-new-famille-inserted")
      event_new_famille.id_famille = parseInt(json['id_famille'])
      window.dispatchEvent(event_new_famille)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-new-famille-inserted', newFamilleInserted, false)
function newFamilleInserted(e) {
  console.log(`++ event-new-famille-inserted - id : ${e.id_famille}`)
  if (current_mode == "new_produit") {
    data.id_famille = e.id_famille
  } else if (current_mode == "edit_produit") {
    data_edit.id_famille = e.id_famille
  }
  getListeFamilles('maj')
  closeEditFamillePopup()
}
/* Send new categorie création */
async function sendNewCategorie(nom_categorie, id_famille) {

  console.log(`sendNewCategorie(${nom_categorie}, ${id_famille})`)

  let json = null
  // const url = "http://localhost/green_catalogue_rest/createCategorie.php"
  let formData = new FormData()
  formData.append('nom_categorie', nom_categorie)
  formData.append('id_famille', id_famille)
  try {
    const response = await fetch(url_create_categorie, {
      method: "post",
      body: formData,
    });
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    json = await response.json()
    if (json['status'] == 200) {
      let event_new_categorie_inserted = new Event("event-new-categorie-inserted")
      event_new_categorie_inserted.id_categorie = json['id_categorie']
      window.dispatchEvent(event_new_categorie_inserted)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-new-categorie-inserted', newCategorieInserted, false)
function newCategorieInserted(e) {
  console.log(`++ event-new-categorie-inserted - id : ${e.id_categorie}`)
  if (current_mode == "new_produit") {
    data.id_categorie = e.id_categorie
  } else if (current_mode == "edit_produit") {
    data_edit.id_categorie = e.id_categorie
  }
  getListeFamilles('maj')
  closeEditCategoriePopup()
}


/* MENU */
initMenu()
function initMenu() {
  let list_produit_container = document.getElementById('list-produit-container')
  list_produit_container.style.display = 'flex'
  let edit_produit_container = document.getElementById('edit-produit-container')
  edit_produit_container.style.display = 'none'
  let new_produit_container = document.getElementById('new-produit-container')
  new_produit_container.style.display = 'none'
  // current_mode = "new_produit"
  current_mode = "edit_produit"

  let btns_menu = document.querySelectorAll('.menu-item')
  btns_menu.forEach((btn_menu) => {
    btn_menu.addEventListener('click', (e) => {
      let btn_menu_clicked = e.currentTarget
      btns_menu.forEach((btn) => {
        if (btn == btn_menu_clicked) {
          btn.classList.add('active')
        } else {
          btn.classList.remove('active')
        }
      })
      switch (btn_menu_clicked.id) {
        case "btn-menu-lister-produits":
          list_produit_container.style.display = 'flex'
          new_produit_container.style.display = 'none'
          break;
        case "btn-menu-nouveau-produit":
          menuSetPage('new')
          break;
        case "btn-menu-reset-produit":
          resetNouveauProduitPage()
          break;
      } 
    })    
  })
}
function menuSetPage(page_ref) {
  let list_produit_container = document.getElementById('list-produit-container')
  let edit_produit_container = document.getElementById('edit-produit-container')
  let new_produit_container = document.getElementById('new-produit-container')
  switch (page_ref) {
    case "edit":
      list_produit_container.style.display = 'none'
      edit_produit_container.style.display = 'flex'
      new_produit_container.style.display = 'none'
      current_mode = "edit_produit"
      break
    case "new":
      list_produit_container.style.display = 'none'
      edit_produit_container.style.display = 'none'
      new_produit_container.style.display = 'flex'
      current_mode = "new_produit"
      getListeFamilles('new')
      break
  }
}

/* -- Liste des produits initialization ----------------------------------------------------------------------------- */
function initListeProduits() {

  // reset des handlers de click des boutons d'edition des produits
  let list_edit_btns = document.querySelectorAll('.list-produit-element-edit')
  list_edit_btns.forEach((btn) => {
    btn.removeEventListener('click', listProduitEditBtnHandler)
  })

  // creation de la liste des produits
  let list_produit_container = document.getElementById('list-produit-container')
  let last_id_famille = -1
  let last_id_categorie = -1
  list_produit_container.innerHTML = ""

  liste_produits.forEach((produit) => {
    if (last_id_famille != produit.id_famille) {
      let list_produit_famille_title = xCreateElement('h3', 'list-produit-famille-title', '')
      list_produit_famille_title.innerHTML = produit.nom_famille
      list_produit_container.appendChild(list_produit_famille_title)
      last_id_famille = produit.id_famille
    }
    if (last_id_categorie != produit.id_categorie) {
      let list_produit_categorie_title = xCreateElement('h5', 'list-produit-categorie-title', '')
      list_produit_categorie_title.innerHTML = produit.nom_categorie
      list_produit_container.appendChild(list_produit_categorie_title)
      last_id_categorie = produit.id_categorie
    }

    let list_produit_element = xCreateElement('div', 'list-produit-element', `list-produit-element-${produit.id_produit}`)
    list_produit_element.innerHTML = `${produit.nom} - ${produit.marque}`
    let list_produit_element_edit = xCreateElement('input', 'list-produit-element-edit', `list_produit_element_edit_${produit.id_produit}`)
    list_produit_element_edit.setAttribute('type', 'button')
    list_produit_element_edit.setAttribute('value', 'Edition')
    list_produit_element.appendChild(list_produit_element_edit)
    list_produit_container.appendChild(list_produit_element)

    list_produit_element_edit.addEventListener('click', listProduitEditBtnHandler)
  })


}
function listProduitEditBtnHandler(e) {
  let produit_id = parseInt(e.target.id.split('_').splice(-1))
  // console.log(`listProduitEditBtnHandler() - ${produit_id}`)
  ep_getProduit(produit_id)
  menuSetPage('edit')
}




/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Editer un nouveau produit ------------------------------------------------------------------------------------- */
let data_edit = {
  'id_produit': 0,
  'id_famille': 0,
  'nom_famille': "",
  'id_categorie': 0,
  'nom_categorie': "",
  'nom': "",
  'marque': "",
  'description': [],
  'images': [],
  'prix': -1,
  'thumb': "",
}
let data_edit_received = null

// ep_getProduit(1)
function ep_initEditProduit() {

  console.log('-- ep_initEditProduit()')
  ep_setSelectFamille()
  ep_setSelectCategorie()
  ep_initImageThumb()
  ep_initNomEtMarque()
  ep_initPrix()
  ep_liste_descriptions_infos = Array()
  ep_createExistingDescritionGroups()
  ep_initAddDescriptionGroup()
  ep_initSendServer()
  ep_render()
}

/* Famille et catégories */
function ep_setSelectFamille() {

  console.log('-- ep_setSelectFamille()')

  // reset des eventListeners si déjà existants
  let old_select_famille = document.getElementById('ep_select_famille')
  let old_add_famille_btn = document.getElementById('ep_create_add_famille_button')
  if ((old_select_famille !== null)&&(old_select_famille !== null)) {
    // console.log('++ setSelectFamille not first load - EDIT')
    old_select_famille.removeEventListener('change', ep_selectFamilleOnChange)
    old_add_famille_btn.removeEventListener('click', openEditFamillePopup)
  }

  // création du select des familles
  let ligne_famille = document.getElementById('ep_ligne_famille')

  let famille_label = xCreateElement('div', 'form_label', '')
  famille_label.innerText = "Famille"

  let select_famille_container = xCreateElement('div', 'select_container')

  let select_famille = xCreateElement('select', '', 'ep_select_famille')
  select_famille.setAttribute('name', 'ep_select_famille')
  liste_familles.forEach((famille, index_famille) => {
    let option_famille = document.createElement('option')
    option_famille.setAttribute('value', parseInt(famille['id_famille']))
    if (famille.id_famille == data_edit.id_famille) {
      option_famille.setAttribute('selected', 'selected')
      data_edit.id_famille = parseInt(famille['id_famille'])
    }
    option_famille.innerText = famille['nom_famille']
    select_famille.appendChild(option_famille)
  });
  select_famille_container.appendChild(select_famille)

  let add_famille_btn = xCreateElement('div', 'form_button', 'ep_create_add_famille_button' )
  add_famille_btn.innerText = "+"
  select_famille_container.appendChild(add_famille_btn)

  ligne_famille.innerHTML = ""
  ligne_famille.appendChild(famille_label)
  ligne_famille.appendChild(select_famille_container)

  select_famille.addEventListener('change', ep_selectFamilleOnChange)
  add_famille_btn.addEventListener('click', openEditFamillePopup)
}
function ep_selectFamilleOnChange() {
  let select_famille = document.getElementById('ep_select_famille')
  data_edit.id_famille = parseInt(select_famille.value)
  data_edit.nom_famille = getFamilleName(data_edit.id_famille)
  ep_setSelectCategorie()
  ep_render()
}
function ep_setSelectCategorie() {

  console.log('-- ep_setSelectCategorie')
  // console.log(data_edit)

  // reset des eventListeners si déjà existants
  let old_select_cat = document.getElementById('ep_select_categorie')
  let old_add_cat_btn = document.getElementById('ep_edit_categorie_button')
  if ((old_select_cat !== null) && (old_add_cat_btn !== null)) {
    old_select_cat.removeEventListener('change', ep_selectCategorieOnChange)
    old_add_cat_btn.removeEventListener('click', openEditCategoriePopup)
  }

  // création du select des catégories
  let ligne_categorie = document.getElementById('ep_ligne_categorie')
  let categorie_label = xCreateElement('div', 'form_label', '')
  categorie_label.innerText = "Catégorie"

  let select_cat_container = xCreateElement('div', 'select_container')

  let select_cat = xCreateElement('select', '', 'ep_select_categorie')
  select_cat.setAttribute('name', 'select_categorie')
  let liste_cat = getFamilleObject(data_edit.id_famille).liste_categories
  liste_cat.forEach(categorie => {
    let option_cat = document.createElement('option')
    option_cat.setAttribute('value', parseInt(categorie['id_categorie']))
    if (categorie.id_categorie == data_edit.id_categorie) option_cat.setAttribute('selected', 'selected')
    option_cat.innerText = categorie['nom_categorie']
    select_cat.appendChild(option_cat)
  })
  select_cat_container.appendChild(select_cat)

  let add_cat_btn = xCreateElement('div', 'form_button', 'ep_edit_categorie_button')
  add_cat_btn.innerText = "+"
  select_cat_container.appendChild(add_cat_btn)

  // ici si existants on supprime tous les enfants du DOM
  ligne_categorie.innerHTML = ""
  ligne_categorie.appendChild(categorie_label)
  ligne_categorie.appendChild(select_cat_container)

  select_cat.addEventListener('change', ep_selectCategorieOnChange)
  add_cat_btn.addEventListener('click', openEditCategoriePopup)

  // ep_selectCategorieOnChange()

}
function ep_selectCategorieOnChange() {
  let select_categorie = document.getElementById('ep_select_categorie')
  data_edit.id_categorie = parseInt(select_categorie.value)
  data_edit.nom_categorie = getCategorieName(data_edit.id_categorie)
  ep_render()
}

/* Thumb du produit */
function ep_initImageThumb() {

  // reset des eventListeners si déjà existants
  let old_thumb_input = document.getElementById('ep_add_thumb')
  if (old_thumb_input !== null) {
    console.log('+initImageThumb() remove handler - EDIT')
    old_thumb_input.removeEventListener('click', ep_addThumbClickHandler)
  }

  // initialisation du bouton de creation du thumb
  let ligne_thumb = document.getElementById('ep_ligne_thumb')

  let thumb_label = xCreateElement('div', 'form_label', '')
  thumb_label.innerText = "Vignette / thumb"

  let image_form_label = xCreateElement('div', 'form_label', '')
  let thumb_input = xCreateElement('input', 'add-thumb', `ep_add_thumb`)
  thumb_input.setAttribute('type', 'image')
  thumb_input.setAttribute('src', './img/image-add.svg')
  image_form_label.appendChild(thumb_input)
  
  let thumb_overview_container = document.getElementById('ep_thumb_overview_container')
  let thumb_overview = xCreateElement('img', 'thumb_overview', 'ep_thumb_overview')
  thumb_overview.setAttribute('src', '')

  ligne_thumb.innerHTML = ""
  thumb_overview_container.innerHTML = ""
  ligne_thumb.appendChild(thumb_label)
  ligne_thumb.appendChild(image_form_label)
  thumb_overview_container.appendChild(thumb_overview)

  thumb_input.addEventListener('click', ep_addThumbClickHandler)
}
function ep_addThumbClickHandler(e) {
  initCropper(true, 0, 'ep')
  let popup_canvas_container = document.getElementById('popup-canvas-container')
  popup_canvas_container.style.display = "block"
}

/* Nom et marque */
function ep_initNomEtMarque() {

  // reset des eventListeners si déjà existants
  let old_input_nom = document.getElementById('ep_input_nom')
  let old_input_marque = document.getElementById('ep_input_marque')
  if ( (old_input_nom !== null) && (old_input_marque !== null) ) {
    old_input_nom.removeEventListener('keyup', ep_nomMarqueKeyupHandler)
    old_input_marque.removeEventListener('keyup', ep_nomMarqueKeyupHandler)
  }
  
  let ligne_nom = document.getElementById('ep_ligne_nom')
  let nom_form_label = xCreateElement('div', 'form_label', '')
  nom_form_label.innerHTML = "Nom"
  let input_nom = xCreateElement('input', '', 'ep_input_nom')
  input_nom.setAttribute('type', 'text')
  input_nom.setAttribute('placeholder', 'Nom du produit')
  input_nom.setAttribute('autocomplete', 'new-password')
  input_nom.setAttribute('value', data_edit.nom)
  ligne_nom.innerHTML = ""
  ligne_nom.appendChild(nom_form_label)
  ligne_nom.appendChild(input_nom)

  let ligne_marque = document.getElementById('ep_ligne_marque')
  let marque_form_label = xCreateElement('div', 'form_label', '')
  marque_form_label.innerHTML = "Marque"
  let input_marque = xCreateElement('input', '', 'ep_input_marque')
  input_marque.setAttribute('type', 'text')
  input_marque.setAttribute('placeholder', 'Marque du produit')
  input_marque.setAttribute('autocomplete', 'new-password')
  input_marque.setAttribute('value', data_edit.marque)
  ligne_marque.innerHTML = ""
  ligne_marque.appendChild(marque_form_label)
  ligne_marque.appendChild(input_marque)

  input_nom.addEventListener('keyup', ep_nomMarqueKeyupHandler)
  ligne_marque.addEventListener('keyup', ep_nomMarqueKeyupHandler)

}
function ep_nomMarqueKeyupHandler(e) {
  if (e.target.id == 'ep_input_nom') data_edit.nom = e.target.value
  if (e.target.id == 'ep_input_marque') data_edit.marque = e.target.value.toUpperCase()
  ep_render()
}

/* Prix */
function ep_initPrix() {

  // reset des eventListeners si déjà existants
  let old_input_prix = document.getElementById('ep_input_prix')
  if (old_input_prix !== null) old_input_prix.removeEventListener('keyup', ep_prixHandler)

  // initialisation de la saisie du prix
  let ligne_prix = document.getElementById('ep_ligne_prix')
  let prix_form_label = xCreateElement('div', 'form_label', '')
  prix_form_label.innerHTML = 'Prix'
  let prix_ligne_large = xCreateElement('div', '', 'ligne-large')
  let input_prix = xCreateElement('input', '', 'ep_input_prix')
  input_prix.setAttribute('type', 'number')
  input_prix.setAttribute('placeholder', '0')
  input_prix.setAttribute('autocomplete', 'off')
  input_prix.setAttribute('value', parseInt(data_edit.prix))
  let input_prix_suffix = xCreateElement('span', '', '')
  input_prix_suffix.innerHTML = '&nbsp;&euro;'

  ligne_prix.innerHTML = ""
  ligne_prix.appendChild(prix_form_label)
  prix_ligne_large.appendChild(input_prix)
  prix_ligne_large.appendChild(input_prix_suffix)
  ligne_prix.appendChild(prix_ligne_large)

  input_prix.addEventListener('keyup', ep_prixHandler)

}
function ep_prixHandler(e) {
  data_edit.prix = parseInt(e.target.value)
  ep_render()
}

/* Description group */
function ep_initAddDescriptionGroup() {

  let old_add_description_group_btn = document.getElementById('ep_add_description_group')
  if (old_add_description_group_btn !== null) old_add_description_group_btn.removeEventListener('click', ep_createNewDescriptionGroup)

  let add_description_group_container = document.getElementById('ep_add_description_group_container')
  let add_description_group_btn = xCreateElement('input', '', 'ep_add_description_group')
  add_description_group_btn.setAttribute('type', 'button')
  add_description_group_btn.setAttribute('value', '+ Ajouter un bloc de description')
  add_description_group_container.innerHTML = ''
  add_description_group_container.appendChild(add_description_group_btn)
  add_description_group_btn.addEventListener('click', ep_createNewDescriptionGroup)

}
function ep_createExistingDescritionGroups() {
  let description_group_container = document.getElementById('ep_description_group_container')
  // TODO proper reset
  description_group_container.innerHTML = ""
  console.log(ep_liste_descriptions_infos)
  data_edit.description.forEach((desc, desc_index) => {
    ep_createExistingDescriptionGroup(desc)
  })
}

function ep_createExistingDescriptionGroup(desc) {

  // creation d'un objet handle des informations du description group
  // let new_desc_info = {
  //   'global_index' : 0,
  //   'text_content' : '',
  //   'quill_object' : null,
  //   'image_object' : null,
  //   'titre_handler' : null,
  //   'suppr_handler' : null,
  // }
  let desc_info = ep_createDescriptionGroupInfo()
  desc_info.text_content = desc.content
  desc_info.global_index = desc.global_index
  //TODO modifier
  // data_edit.description.push({'title': '', 'content': '', 'global_index': desc_info.global_index})
  // data_edit.images.push({'data': '', 'global_index': desc_info.global_index, 'display_size': 'medium'})

  // création des éléments du groupe de description
  let description_group_container = document.getElementById('ep_description_group_container')
  let description_group = xCreateElement('div', 'description-group', `ep_description_group_${desc_info.global_index}`)

  let top_separator = document.createElement('hr')

  let delete_description_group_btn = null
  if (desc_info.global_index != 0) {
    delete_description_group_btn = xCreateElement('div', 'delete-description-group', `ep_delete-description-group_${desc_info.global_index}`)
    delete_description_group_btn.innerHTML = "X"
  }

  let titre_group = xCreateElement('div', 'ligne', '')
  let titre_group_label = xCreateElement('div', 'ligne form_label', '')
  titre_group_label.innerHTML = "Bloc de description"
  titre_group.appendChild(titre_group_label)
  let titre_group_input = xCreateElement('input', 'input_titre_groupe', `ep_input_titre_groupe_${desc_info.global_index}`)
  titre_group_input.setAttribute('type', 'text')
  titre_group_input.setAttribute('placeholder', 'Titre section')
  titre_group_input.setAttribute('autocomplete', 'off')
  titre_group_input.value  = desc.title
  titre_group.appendChild(titre_group_input)

  let description_big_container = xCreateElement('div', '', 'ep_description_big_container')
  let description_form_label = xCreateElement('div', 'form_label', '')
  description_form_label.innerHTML = 'Descriptions'
  let quill_container = xCreateElement('div', 'quill-container', '')
  let editor_container = xCreateElement('div', 'editor-container', '')
  let description_editor = xCreateElement('div', 'description-editor', `ep_description_${desc_info.global_index}`)
  editor_container.appendChild(description_editor)
  quill_container.appendChild(editor_container)
  description_big_container.appendChild(quill_container)

  let image_ligne = xCreateElement('div', 'ligne-large', '')
  let image_form_label = xCreateElement('div', 'form_label', '')
  let image_input = xCreateElement('input', 'ep_description-add-image', `ep_add_desc_image_${desc_info.global_index}`)
  image_input.setAttribute('type', 'image')
  image_input.setAttribute('src', './img/image-add.svg')
  image_form_label.appendChild(image_input)
  image_ligne.appendChild(image_form_label)

  // TODO

  let image_size_large_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_large_label = xCreateElement('label', '', '')
  image_size_large_label.setAttribute('for', `ep_add_desc_image_large_${desc_info.global_index}`)
  image_size_large_label.innerHTML = 'large&nbsp;'
  let image_size_large = xCreateElement('input', 'ep_add-desc-image-radio', `ep_add_desc_image_large_${desc_info.global_index}`)
  image_size_large.setAttribute('type', 'radio')
  image_size_large.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_large_container.appendChild(image_size_large_label)
  image_size_large_container.appendChild(image_size_large)
  image_ligne.appendChild(image_size_large_container)

  let image_size_medium_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_medium_label = xCreateElement('label', '', '')
  image_size_medium_label.setAttribute('for', `ep_add_desc_image_medium_${desc_info.global_index}`)
  image_size_medium_label.innerHTML = 'medium&nbsp;'
  let image_size_medium = xCreateElement('input', 'ep_add-desc-image-radio', `ep_add_desc_image_medium_${desc_info.global_index}`)
  image_size_medium.setAttribute('type', 'radio')
  image_size_medium.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_medium.checked = true
  image_size_medium_container.appendChild(image_size_medium_label)
  image_size_medium_container.appendChild(image_size_medium)
  image_ligne.appendChild(image_size_medium_container)

  let image_size_small_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_small_label = xCreateElement('label', '', '')
  image_size_small_label.setAttribute('for', `ep_add_desc_image_small_${desc_info.global_index}`)
  image_size_small_label.innerHTML = 'small&nbsp;'
  let image_size_small = xCreateElement('input', 'ep_add-desc-image-radio', `ep_add_desc_image_small_${desc_info.global_index}`)
  image_size_small.setAttribute('type', 'radio')
  image_size_small.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_small_container.appendChild(image_size_small_label)
  image_size_small_container.appendChild(image_size_small)
  image_ligne.appendChild(image_size_small_container)

  // assemblage des éléments du groupe de description
  description_group.appendChild(top_separator)
  if (delete_description_group_btn !== null)
    description_group.appendChild(delete_description_group_btn)
  description_group.appendChild(titre_group)
  description_group.appendChild(description_big_container)
  description_group.appendChild(image_ligne)

  description_group_container.appendChild(description_group)

  // ajout du conteneur html du groupe de description dans la liste des groupes
  desc_info.html_object = description_group

  // event de suppression du groupe de description
  if (delete_description_group_btn !== null) {
    delete_description_group_btn.addEventListener('click', ep_removeDescriptionGroup)
  }

  // event de transposition du titre du groupe de description dans l'aperçu
  desc_info.titre_handler = (e) => {
    let index = ep_getDescriptionGroupInfoIndex(desc_info.global_index)
    data_edit.description[index].title = e.target.value
    ep_render()
  }
  titre_group_input.addEventListener('keyup', desc_info.titre_handler)

  // création du quill
  let new_quill = new Quill(`#ep_description_${desc_info.global_index}`, {
    modules: { toolbar: true, },
    theme: 'snow',
    placeholder: "Votre description ..."
  })
  
  ep_liste_descriptions_infos.push(desc_info)

  new_quill.on('text-change', (delta, oldDelta, source) => {
    // if (source == 'user') {
      console.log(source)
      desc_info.text_content = new_quill.getSemanticHTML()
      let index = ep_getDescriptionGroupInfoIndex(desc_info.global_index)
      data_edit.description[index].content = desc_info.text_content
      ep_render()
    // }    
  })

  
  let delta = new_quill.clipboard.convert({html: desc_info.text_content})
  new_quill.setContents(delta, 'api')
  

  ep_initImageDescription(desc_info.global_index)

}

function ep_createNewDescriptionGroup() {

  // creation d'un objet handle des informations du description group
  let desc_info = ep_createDescriptionGroupInfo()
  //TODO modifier
  data_edit.description.push({'title': '', 'content': '', 'global_index': desc_info.global_index})
  data_edit.images.push({'data': '', 'global_index': desc_info.global_index, 'display_size': 'medium'})

  // création des éléments du groupe de description
  let description_group_container = document.getElementById('ep_description_group_container')
  let description_group = xCreateElement('div', 'description-group', `ep_description_group_${desc_info.global_index}`)

  let top_separator = document.createElement('hr')

  let delete_description_group_btn = null
  if (desc_info.global_index != 0) {
    delete_description_group_btn = xCreateElement('div', 'delete-description-group', `ep_delete-description-group_${desc_info.global_index}`)
    delete_description_group_btn.innerHTML = "X"
  }

  let titre_group = xCreateElement('div', 'ligne', '')
  let titre_group_label = xCreateElement('div', 'ligne form_label', '')
  titre_group_label.innerHTML = "Bloc de description"
  titre_group.appendChild(titre_group_label)
  let titre_group_input = xCreateElement('input', 'input_titre_groupe', `ep_input_titre_groupe_${desc_info.global_index}`)
  titre_group_input.setAttribute('type', 'text')
  titre_group_input.setAttribute('placeholder', 'Titre section')
  titre_group_input.setAttribute('autocomplete', 'off')
  titre_group.appendChild(titre_group_input)

  let description_big_container = xCreateElement('div', '', 'ep_description_big_container')
  let description_form_label = xCreateElement('div', 'form_label', '')
  description_form_label.innerHTML = 'Descriptions'
  let quill_container = xCreateElement('div', 'quill-container', '')
  let editor_container = xCreateElement('div', 'editor-container', '')
  let description_editor = xCreateElement('div', 'description-editor', `ep_description_${desc_info.global_index}`)
  editor_container.appendChild(description_editor)
  quill_container.appendChild(editor_container)
  description_big_container.appendChild(quill_container)

  let image_ligne = xCreateElement('div', 'ligne-large', '')
  let image_form_label = xCreateElement('div', 'form_label', '')
  let image_input = xCreateElement('input', 'ep_description-add-image', `ep_add_desc_image_${desc_info.global_index}`)
  image_input.setAttribute('type', 'image')
  image_input.setAttribute('src', './img/image-add.svg')
  image_form_label.appendChild(image_input)
  image_ligne.appendChild(image_form_label)

  let image_size_large_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_large_label = xCreateElement('label', '', '')
  image_size_large_label.setAttribute('for', `ep_add_desc_image_large_${desc_info.global_index}`)
  image_size_large_label.innerHTML = 'large&nbsp;'
  let image_size_large = xCreateElement('input', 'ep_add-desc-image-radio', `ep_add_desc_image_large_${desc_info.global_index}`)
  image_size_large.setAttribute('type', 'radio')
  image_size_large.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_large_container.appendChild(image_size_large_label)
  image_size_large_container.appendChild(image_size_large)
  image_ligne.appendChild(image_size_large_container)

  let image_size_medium_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_medium_label = xCreateElement('label', '', '')
  image_size_medium_label.setAttribute('for', `ep_add_desc_image_medium_${desc_info.global_index}`)
  image_size_medium_label.innerHTML = 'medium&nbsp;'
  let image_size_medium = xCreateElement('input', 'ep_add-desc-image-radio', `ep_add_desc_image_medium_${desc_info.global_index}`)
  image_size_medium.setAttribute('type', 'radio')
  image_size_medium.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_medium.checked = true
  image_size_medium_container.appendChild(image_size_medium_label)
  image_size_medium_container.appendChild(image_size_medium)
  image_ligne.appendChild(image_size_medium_container)

  let image_size_small_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_small_label = xCreateElement('label', '', '')
  image_size_small_label.setAttribute('for', `ep_add_desc_image_small_${desc_info.global_index}`)
  image_size_small_label.innerHTML = 'small&nbsp;'
  let image_size_small = xCreateElement('input', 'ep_add-desc-image-radio', `ep_add_desc_image_small_${desc_info.global_index}`)
  image_size_small.setAttribute('type', 'radio')
  image_size_small.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_small_container.appendChild(image_size_small_label)
  image_size_small_container.appendChild(image_size_small)
  image_ligne.appendChild(image_size_small_container)

  // assemblage des éléments du groupe de description
  description_group.appendChild(top_separator)
  if (delete_description_group_btn !== null)
    description_group.appendChild(delete_description_group_btn)
  description_group.appendChild(titre_group)
  description_group.appendChild(description_big_container)
  description_group.appendChild(image_ligne)

  description_group_container.appendChild(description_group)

  // ajout du conteneur html du groupe de description dans la liste des groupes
  desc_info.html_object = description_group

  // event de suppression du groupe de description
  if (delete_description_group_btn !== null) {
    delete_description_group_btn.addEventListener('click', ep_removeDescriptionGroup)
  }

  // event de transposition du titre du groupe de description dans l'aperçu
  desc_info.titre_handler = (e) => {
    let index = ep_getDescriptionGroupInfoIndex(desc_info.global_index)
    data_edit.description[index].title = e.target.value
    ep_render()
  }
  titre_group_input.addEventListener('keyup', desc_info.titre_handler)

  // création du quill
  let new_quill = new Quill(`#ep_description_${desc_info.global_index}`, {
    modules: { toolbar: true, },
    theme: 'snow',
    placeholder: "Votre description ..."
  })

  new_quill.on('text-change', (delta, oldDelta, source) => {
    desc_info.text_content = new_quill.getSemanticHTML()
    let index = ep_getDescriptionGroupInfoIndex(desc_info.global_index)
    data_edit.description[index].content = desc_info.text_content
    np_render()
  })
  
  ep_liste_descriptions_infos.push(desc_info)

  ep_initImageDescription(desc_info.global_index)

}
function ep_removeDescriptionGroup(e) {
  let global_index = parseInt(e.target.id.split('_').splice(-1))
  console.log(`-- removeDescriptionGroup - ${global_index}`)
  let desc_info_index = ep_getDescriptionGroupInfoIndex(global_index)
  let desc_info = ep_liste_descriptions_infos[desc_info_index]
  let titre_group_input = document.getElementById(`ep_input_titre_groupe_${desc_info.global_index}`)
  titre_group_input.removeEventListener('keyup', desc_info.titre_handler)
  let delete_description_group_btn = document.getElementById(`ep_delete-description-group_${desc_info.global_index}`)
  delete_description_group_btn.removeEventListener('click', ep_removeDescriptionGroup)
  ep_liste_descriptions_infos.splice(desc_info_index, 1)
  data_edit.description.splice(desc_info_index, 1)
  data_edit.images.splice(desc_info_index, 1)
  let description_group = document.getElementById(`ep_description_group_${global_index}`)
  description_group.parentNode.removeChild(description_group)
  ep_renderNewProduit()
}

function ep_createDescriptionGroupInfo() {
  let new_desc_info = {
    'global_index' : 0,
    'text_content' : '',
    'quill_object' : null,
    'image_object' : null,
    'titre_handler' : null,
    'suppr_handler' : null,
  }
  if (ep_liste_descriptions_infos.length != 0) {
    let index = 0
    ep_liste_descriptions_infos.forEach(element => {
      if (element.global_index > index) index = element.global_index      
    });
    new_desc_info.global_index = index + 1 
  }
  return new_desc_info
}
function ep_getDescriptionGroupInfoIndex(global_index) {
  let return_value = null
  ep_liste_descriptions_infos.forEach((element, element_index) => {
    if (parseInt(element.global_index) == parseInt(global_index)) return_value = element_index
  })
  return return_value
}
/* Description group Image */
function ep_initImageDescription(global_index) {

  // todo reset handlers au recall d'initImageDescription()
  let boutons_add_desc_image = document.querySelectorAll('.ep_description-add-image')
  boutons_add_desc_image.forEach(btn_add_img => {
    btn_add_img.addEventListener('click', (e) => {
      //todo passer l'index 'absolu' de la description a la popup de cropping image pour qu'elle soit renvoyé en data avec l'event de event-image-canvas2
      let description_active = parseInt(e.currentTarget.getAttribute('id').split('_').slice(-1))
      initCropper(false, description_active, 'np')
      let popup_canvas_container = document.getElementById('popup-canvas-container')
      popup_canvas_container.style.display = "block"
    })
    
    let all_radios = document.querySelectorAll(`#ep_description_group_${global_index} .ep_add-desc-image-radio`)
    all_radios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        let image_index = parseInt(e.currentTarget.id.split('_').splice(-1))
        let value = ""
        if (e.target.id.includes('large')) value = 'large'
        if (e.target.id.includes('medium')) value = 'medium'
        if (e.target.id.includes('small')) value = 'small'
        data_edit.images[ep_getDescriptionIndexFromGlobalIndex(image_index)].display_size = value
        ep_render()
      })
    })
  })
  

  document.getElementById('close-popup-canvas-container').addEventListener('click', (e) => {
    let popup_canvas_container = document.getElementById('popup-canvas-container')
    popup_canvas_container.style.display = "none"
  })
}


/* Génération / maj de l'apercu de la page produit en cours d'édition */
function ep_render() {
  console.log('-- ep_render')
  console.log(data_edit)
  console.log(data_edit_received)

  let header_titre = document.getElementById('ep_produit-header-titre-text')
  header_titre.innerText = getCategorieName(data_edit.id_categorie).toUpperCase()

  let render_parent = document.getElementById('ep_render_parent')
  render_parent.innerHTML = ""
  let separator = xCreateElement('div', 'modal-main-separator', '')
  separator.innerHTML = "&nbsp;"
  render_parent.appendChild(separator)

  let produit_marque_container = xCreateElement('div', 'produit-marque-container', '')
  let produit_nom = xCreateElement('div', 'produit-nom', 'ep_produit-nom')
  produit_nom.innerHTML = data_edit.nom
  produit_marque_container.appendChild(produit_nom)
  let produit_marque = xCreateElement('div', 'produit-marque', 'ep_produit-marque')
  produit_marque.innerHTML = data_edit.marque
  produit_marque_container.appendChild(produit_marque)
  produit_marque_container.innerHTML += `
    <svg viewBox="0 0 100 5" class="produit-separator">
      <line x1="0" y1="3" x2="100" y2="3" class="line-svg-thin" />
    </svg>
  `
  render_parent.appendChild(produit_marque_container)

  if (data_edit.prix > 10) {
    let produit_prix_container = xCreateElement('div', 'produit-prix-container', '')
    let produit_prix = xCreateElement('div', 'produit-prix')
    produit_prix.innerHTML = `<b>Prix :</b> ${data_edit.prix} &nbsp;&euro;`
    produit_prix_container.appendChild(produit_prix)
    render_parent.appendChild(produit_prix_container)
  }


  if ((data_edit.thumb != "") ) {
    let thumb_overview = document.getElementById('ep_thumb_overview')
    if (data_edit.thumb.split('.').splice(-1) == "jpg") {
      if (data_edit.id_produit <= 20) {
        // TODO corriger nom des fichiers images préenregistrés
        let tmp_filename = data_edit.thumb.split('/').splice(-1)
        thumb_overview.setAttribute('src', image_path + tmp_filename)
      } else {
        thumb_overview.setAttribute('src', image_path + data_edit.thumb)
      }
      
    } else {
      thumb_overview.setAttribute('src', data_edit.thumb)
    }
  }

  data_edit.description.forEach((desc, index_desc) => {
    let produit_titre_groupe = xCreateElement('div', 'produit-titre-groupe', `ep_produit-titre-groupe-${desc.global_index}`)
    produit_titre_groupe.innerHTML = desc.title
    let produit_group = xCreateElement('div', `produit-group ${data_edit.images[index_desc].display_size}`, `ep_produit-group-${desc.global_index}`)
    let produit_descriptif = xCreateElement('div', 'produit-descriptif', `ep_produit-descriptif-${desc.global_index}`)
    produit_descriptif.innerHTML = convertQuillOutput(desc.content)
    produit_group.appendChild(produit_descriptif)
    let produit_image = xCreateElement('img', `produit-picture`, `ep_produit-picture-${desc.global_index}`)
    if (data_edit.images[index_desc].data != "") {
      produit_image.setAttribute('src', data_edit.images[index_desc].data)
    } else if (data_edit.images[index_desc].image_url != "") {
      // TODO deal with url images preexist
      let tmp_url = data_edit.images[index_desc].image_url.split('/').splice(-1)
      produit_image.setAttribute('src', image_path + tmp_url)
    }
    
    produit_image.style.display = "block"
    produit_group.appendChild(produit_image)
    
    render_parent.appendChild(produit_titre_groupe)
    render_parent.appendChild(produit_group)
  })

}


/* Reset */
function ep_reset() {

}

async function ep_getProduit(id_produit) {
  // console.log(`-- getProduit ${id_produit}`)
  let json = null
  // const url_get_produit = "http://localhost/green_catalogue_rest/getProduit.php";
  let formData = new FormData()
  formData.append('id_produit', id_produit)
  try {
    const response = await fetch(url_get_produit, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error(`Response status: ${response.status}`)
    json = await response.json()
    if (json['status'] == 200) {
      let produit_received = json['produit']
      let eventProduitReceived = new CustomEvent("event-produit-received", { 'detail': produit_received })
      window.dispatchEvent(eventProduitReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-produit-received', (e)=> {
  // console.log('------------------------------------')
  // console.log('++ event-produit-received')

  let data_received = e.detail
  // console.log(data_received)
  // data_edit = e.detail
  // console.log(data_edit)

  data_edit = {
    'id_produit': 0,
    'id_famille': 0,
    'nom_famille': "",
    'id_categorie': 0,
    'nom_categorie': "",
    'nom': "",
    'marque': "",
    'description': [],
    'images': [],
    'prix': -1,
    'thumb': "",
  }


  data_edit.id_produit = data_received.id_produit
  
  data_edit.id_famille = data_received.id_famille
  data_edit.nom_famille = data_received.nom_famille
  data_edit.id_categorie = data_received.id_categorie
  data_edit.nom_categorie = data_received.nom_categorie

  if (!isNaN(data_received.prix)) {
    data_edit.prix = parseInt(data_received.prix)
  } else {
    data_edit.prix = -1
  }

  data_edit.nom = data_received.nom
  data_edit.marque = data_received.marque

  data_edit.thumb = data_received.thumb

  data_received.descriptifs.forEach((desc, desc_index) => {
    data_edit.description.push({'title': desc.titre, 'content': desc.html, 'global_index': desc_index})
  })
  
  data_received.images.forEach((image, image_index) => {
    data_edit.images.push({ 'image_url': image.image_url, 'data': '', 'global_index': image.index_descriptif, 'display_size': image.display_size })
  })
    
  console.log('---------- data_edit :')
  console.log(data_edit)

  data_edit_received = structuredClone(data_edit)

  
  // console.log('------------------------------------')
  getListeFamilles('new')
}, false)


/* Send server */
function ep_initSendServer() {

  let old_send_server_btn = document.getElementById('ep_send_server_btn')
  if (old_send_server_btn !== null) old_send_server_btn.removeEventListener('click', ep_sendProduit)

  let send_server_container = document.getElementById('ep_send_server_container')
  let send_server_btn = xCreateElement('button', '', 'ep_send_server_btn')
  send_server_btn.innerHTML = "Envoyer au serveur"
  send_server_container.appendChild(send_server_btn)

  send_server_btn.addEventListener('click', ep_sendProduit)

}
async function ep_sendProduit() {

  // on n'envoie que les éléments modifiés

  let json = null
  // const url_send_new_produit = "http://localhost/green_catalogue_rest/updateProduit.php"
  let formData = new FormData()
  formData.append('id_produit', data_edit.id_produit)

  formData.append('id_famille', data_edit.id_famille)
  formData.append('id_categorie', data_edit.id_categorie)
  formData.append('nom', data_edit.nom)
  formData.append('marque', data_edit.marque)
  formData.append('prix', data_edit.prix)
  data_edit.description.forEach((desc, index_desc) => {
    formData.append(`desc_${index_desc}`, desc.content)
    formData.append(`desc_titre_${index_desc}`, desc.title)
    formData.append(`desc_index_${index_desc}`, index_desc)
  })
  data_edit.images.forEach((image_produit, index_image) => {
    let imgBase64 = image_produit.data_edit
    if (imgBase64 !== "") {   
      let myfile = DataURIToBlob(imgBase64)
      formData.append(`file_image_${index_image}`, myfile, `file_image_${index_image}.jpeg`)
      formData.append(`image_display_size_${index_image}`, image_produit.display_size)
      formData.append(`image_modified_${index_image}`, true)
    } else {
      formData.append(`image_modified_${index_image}`, false)
    }
  })
  if (data_edit.thumb !== "") {
    if (data_edit.thumb.split('.').splice(-1) !== 'jpg') {
      let thumbBase64 = data_edit.thumb
      let fileThumb = DataURIToBlob(thumbBase64)
      formData.append('file_thumb', fileThumb, 'fileThumb.jpeg')
      formData.append(`thumb_modified`, true)
    } else {
      formData.append(`thumb_modified`, false)
    }
  }
  
  try {
    const response = await fetch(url_send_edit_produit, {
      method: "post",
      body: formData,
    });
    if (!response.ok) { throw new Error(`Response status: ${response.status}`); }
    json = await response.json()
    console.log(json)
    
  } catch (error) { console.error(error.message); }
  
}










/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
/* -- Ajouter un nouveau produit ------------------------------------------------------------------------------------- */
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
  'prix': -1,
  'thumb': "",
}


function initCreateProduct() {
  console.log('-- initCreateProduct()')
  np_setSelectFamille()
  np_setSelectCategorie()
  np_initImageThumb()
  np_initNomEtMarque()
  np_initPrix()  
  np_liste_descriptions_infos = Array()
  np_createDescriptionGroup()
  np_initAddDescriptionGroup()
  np_initSendServer()
  np_render()
}

/* Famille et catégories */
function np_setSelectFamille() {

  // reset des eventListeners si déjà existants
  let old_select_famille = document.getElementById('np_select_famille')
  let old_add_famille_btn = document.getElementById('np_create_add_famille_button')
  if ((old_select_famille !== null)&&(old_select_famille !== null)) {
    console.log('++ setSelectFamille not first load')
    old_select_famille.removeEventListener('change', np_selectFamilleOnChange)
    old_add_famille_btn.removeEventListener('click', openEditFamillePopup)
  }

  // création du select des familles
  let ligne_famille = document.getElementById('np_ligne_famille')

  let famille_label = xCreateElement('div', 'form_label', '')
  famille_label.innerText = "Famille"

  let select_famille_container = xCreateElement('div', 'select_container')

  let select_famille = xCreateElement('select', '', 'np_select_famille')
  select_famille.setAttribute('name', 'select_famille')
  liste_familles.forEach((famille) => {
    let option_famille = document.createElement('option')
    option_famille.setAttribute('value', parseInt(famille['id_famille']))
    if (famille.id_famille == data.id_famille)
      option_famille.setAttribute('selected', 'selected')
    option_famille.innerText = famille['nom_famille']
    select_famille.appendChild(option_famille)
  });
  select_famille_container.appendChild(select_famille)

  let add_famille_btn = xCreateElement('div', 'form_button', 'np_create_add_famille_button' )
  add_famille_btn.innerText = "+"
  select_famille_container.appendChild(add_famille_btn)

  ligne_famille.innerHTML = ""
  ligne_famille.appendChild(famille_label)
  ligne_famille.appendChild(select_famille_container)

  select_famille.addEventListener('change', np_selectFamilleOnChange)
  add_famille_btn.addEventListener('click', openEditFamillePopup)
}
function np_selectFamilleOnChange() {
  let select_famille = document.getElementById('np_select_famille')
  data.id_famille = parseInt(select_famille.value)
  data.nom_famille = getFamilleName(data.id_famille)
  np_setSelectCategorie()
  np_render()
}
function np_setSelectCategorie() {

  console.log('-- np_setSelectCategorie')
  console.log(data)

  // reset des eventListeners si déjà existants
  let old_select_cat = document.getElementById('np_select_categorie')
  let old_add_cat_btn = document.getElementById('np_edit_categorie_button')
  if ((old_select_cat !== null) && (old_add_cat_btn !== null)) {
    old_select_cat.removeEventListener('change', np_selectCategorieOnChange)
    old_add_cat_btn.removeEventListener('click', openEditCategoriePopup)
  }

  // création du select des catégories
  let ligne_categorie = document.getElementById('np_ligne_categorie')
  let categorie_label = xCreateElement('div', 'form_label', '')
  categorie_label.innerText = "Catégorie"

  let select_cat_container = xCreateElement('div', 'select_container')

  let select_cat = xCreateElement('select', '', 'np_select_categorie')
  select_cat.setAttribute('name', 'select_categorie')
  let liste_cat = getFamilleObject(data.id_famille).liste_categories
  liste_cat.forEach(categorie => {
    let option_cat = document.createElement('option')
    option_cat.setAttribute('value', parseInt(categorie['id_categorie']))
    option_cat.innerText = categorie['nom_categorie']
    if (categorie.id_categorie == data.id_categorie)
      option_cat.setAttribute('selected', 'selected')
    select_cat.appendChild(option_cat)
  })
  select_cat_container.appendChild(select_cat)

  let add_cat_btn = xCreateElement('div', 'form_button', 'np_edit_categorie_button')
  add_cat_btn.innerText = "+"
  select_cat_container.appendChild(add_cat_btn)

  // ici si existants on supprime tous les enfants du DOM
  ligne_categorie.innerHTML = ""
  ligne_categorie.appendChild(categorie_label)
  ligne_categorie.appendChild(select_cat_container)

  select_cat.addEventListener('change', np_selectCategorieOnChange)
  add_cat_btn.addEventListener('click', openEditCategoriePopup)

  np_selectCategorieOnChange()

}
function np_selectCategorieOnChange() {
  let select_categorie = document.getElementById('np_select_categorie')
  data.id_categorie = parseInt(select_categorie.value)
  data.nom_categorie = getCategorieName(data.id_categorie)
  np_render()
}

/* Thumb du produit */
function np_initImageThumb() {

  // reset des eventListeners si déjà existants
  let old_thumb_input = document.getElementById('np_add_thumb')
  if (old_thumb_input !== null) {
    console.log('+initImageThumb() remove handler')
    old_thumb_input.removeEventListener('click', np_addThumbClickHandler)
  }

  // initialisation du bouton de creation du thumb
  let ligne_thumb = document.getElementById('np_ligne_thumb')

  let thumb_label = xCreateElement('div', 'form_label', '')
  thumb_label.innerText = "Vignette / thumb"

  let image_form_label = xCreateElement('div', 'form_label', '')
  let thumb_input = xCreateElement('input', 'add-thumb', `np_add_thumb`)
  thumb_input.setAttribute('type', 'image')
  thumb_input.setAttribute('src', './img/image-add.svg')
  image_form_label.appendChild(thumb_input)

  let thumb_overview_container = document.getElementById('np_thumb_overview_container')
  let thumb_overview = xCreateElement('img', 'thumb_overview', 'np_thumb_overview')
  thumb_overview.setAttribute('src', '')

  ligne_thumb.innerHTML = ""
  thumb_overview_container.innerHTML = ""
  ligne_thumb.appendChild(thumb_label)
  ligne_thumb.appendChild(image_form_label)
  thumb_overview_container.appendChild(thumb_overview)

  thumb_input.addEventListener('click', np_addThumbClickHandler)
}
function np_addThumbClickHandler(e) {
  initCropper(true, 0, 'np')
  let popup_canvas_container = document.getElementById('popup-canvas-container')
  popup_canvas_container.style.display = "block"
}

/* Nom et marque */
function np_initNomEtMarque() {

  // reset des eventListeners si déjà existants
  let old_input_nom = document.getElementById('np_input_nom')
  let old_input_marque = document.getElementById('np_input_marque')
  if ( (old_input_nom !== null) && (old_input_marque !== null) ) {
    old_input_nom.removeEventListener('keyup', np_nomMarqueKeyupHandler)
    old_input_marque.removeEventListener('keyup', np_nomMarqueKeyupHandler)
  }
  
  let ligne_nom = document.getElementById('np_ligne_nom')
  let nom_form_label = xCreateElement('div', 'form_label', '')
  nom_form_label.innerHTML = "Nom"
  let input_nom = xCreateElement('input', '', 'np_input_nom')
  input_nom.setAttribute('type', 'text')
  input_nom.setAttribute('placeholder', 'Nom du produit')
  input_nom.setAttribute('autocomplete', 'new-password')
  ligne_nom.innerHTML = ""
  ligne_nom.appendChild(nom_form_label)
  ligne_nom.appendChild(input_nom)

  let ligne_marque = document.getElementById('np_ligne_marque')
  let marque_form_label = xCreateElement('div', 'form_label', '')
  marque_form_label.innerHTML = "Marque"
  let input_marque = xCreateElement('input', '', 'np_input_marque')
  input_marque.setAttribute('type', 'text')
  input_marque.setAttribute('placeholder', 'Marque du produit')
  input_marque.setAttribute('autocomplete', 'new-password')
  ligne_marque.innerHTML = ""
  ligne_marque.appendChild(marque_form_label)
  ligne_marque.appendChild(input_marque)

  input_nom.addEventListener('keyup', np_nomMarqueKeyupHandler)
  ligne_marque.addEventListener('keyup', np_nomMarqueKeyupHandler)

}
function np_nomMarqueKeyupHandler(e) {
  if (e.target.id == 'np_input_nom') data.nom = e.target.value
  if (e.target.id == 'np_input_marque') data.marque = e.target.value.toUpperCase()
  np_render()
}

/* Prix */
function np_initPrix() {

  // reset des eventListeners si déjà existants
  let old_input_prix = document.getElementById('np_input_prix')
  if (old_input_prix !== null) old_input_prix.removeEventListener('keyup', np_prixHandler)

  // initialisation de la saisie du prix
  let ligne_prix = document.getElementById('np_ligne_prix')
  let prix_form_label = xCreateElement('div', 'form_label', '')
  prix_form_label.innerHTML = 'Prix'
  let prix_ligne_large = xCreateElement('div', '', 'ligne-large')
  let input_prix = xCreateElement('input', '', 'np_input_prix')
  input_prix.setAttribute('type', 'number')
  input_prix.setAttribute('placeholder', '0')
  input_prix.setAttribute('autocomplete', 'off')
  let input_prix_suffix = xCreateElement('span', '', '')
  input_prix_suffix.innerHTML = '&nbsp;&euro;'

  ligne_prix.innerHTML = ""
  ligne_prix.appendChild(prix_form_label)
  prix_ligne_large.appendChild(input_prix)
  prix_ligne_large.appendChild(input_prix_suffix)
  ligne_prix.appendChild(prix_ligne_large)

  input_prix.addEventListener('keyup', np_prixHandler)

}
function np_prixHandler(e) {
  data.prix = parseInt(e.target.value)
  np_render()
}

/* Description group */
function np_initAddDescriptionGroup() {

  let old_add_description_group_btn = document.getElementById('np_add_description_group')
  if (old_add_description_group_btn !== null) old_add_description_group_btn.removeEventListener('click', np_createDescriptionGroup)

  let add_description_group_container = document.getElementById('np_add_description_group_container')
  let add_description_group_btn = xCreateElement('input', '', 'np_add_description_group')
  add_description_group_btn.setAttribute('type', 'button')
  add_description_group_btn.setAttribute('value', '+ Ajouter un bloc de description')
  add_description_group_container.innerHTML = ''
  add_description_group_container.appendChild(add_description_group_btn)
  add_description_group_btn.addEventListener('click', np_createDescriptionGroup)

}
function np_createDescriptionGroup() {

  // creation d'un objet handle des informations du description group
  let desc_info = np_createDescriptionGroupInfo()
  data.description.push({'title': '', 'content': '', 'global_index': desc_info.global_index})
  data.images.push({'data': '', 'global_index': desc_info.global_index, 'display_size': 'medium'})

  // création des éléments du groupe de description
  let description_group_container = document.getElementById('np_description_group_container')
  let description_group = xCreateElement('div', 'description-group', `np_description_group_${desc_info.global_index}`)

  let top_separator = document.createElement('hr')

  let delete_description_group_btn = null
  if (desc_info.global_index != 0) {
    delete_description_group_btn = xCreateElement('div', 'delete-description-group', `np_delete-description-group_${desc_info.global_index}`)
    delete_description_group_btn.innerHTML = "X"
  }

  let titre_group = xCreateElement('div', 'ligne', '')
  let titre_group_label = xCreateElement('div', 'ligne form_label', '')
  titre_group_label.innerHTML = "Bloc de description"
  titre_group.appendChild(titre_group_label)
  let titre_group_input = xCreateElement('input', 'input_titre_groupe', `np_input_titre_groupe_${desc_info.global_index}`)
  titre_group_input.setAttribute('type', 'text')
  titre_group_input.setAttribute('placeholder', 'Titre section')
  titre_group_input.setAttribute('autocomplete', 'off')
  titre_group.appendChild(titre_group_input)

  let description_big_container = xCreateElement('div', '', 'np_description_big_container')
  let description_form_label = xCreateElement('div', 'form_label', '')
  description_form_label.innerHTML = 'Descriptions'
  let quill_container = xCreateElement('div', 'quill-container', '')
  let editor_container = xCreateElement('div', 'editor-container', '')
  let description_editor = xCreateElement('div', 'description-editor', `np_description_${desc_info.global_index}`)
  editor_container.appendChild(description_editor)
  quill_container.appendChild(editor_container)
  description_big_container.appendChild(quill_container)

  let image_ligne = xCreateElement('div', 'ligne-large', '')
  let image_form_label = xCreateElement('div', 'form_label', '')
  let image_input = xCreateElement('input', 'np_description-add-image', `np_add_desc_image_${desc_info.global_index}`)
  image_input.setAttribute('type', 'image')
  image_input.setAttribute('src', './img/image-add.svg')
  image_form_label.appendChild(image_input)
  image_ligne.appendChild(image_form_label)

  let image_size_large_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_large_label = xCreateElement('label', '', '')
  image_size_large_label.setAttribute('for', `np_add_desc_image_large_${desc_info.global_index}`)
  image_size_large_label.innerHTML = 'large&nbsp;'
  let image_size_large = xCreateElement('input', 'np_add-desc-image-radio', `np_add_desc_image_large_${desc_info.global_index}`)
  image_size_large.setAttribute('type', 'radio')
  image_size_large.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_large_container.appendChild(image_size_large_label)
  image_size_large_container.appendChild(image_size_large)
  image_ligne.appendChild(image_size_large_container)

  let image_size_medium_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_medium_label = xCreateElement('label', '', '')
  image_size_medium_label.setAttribute('for', `np_add_desc_image_medium_${desc_info.global_index}`)
  image_size_medium_label.innerHTML = 'medium&nbsp;'
  let image_size_medium = xCreateElement('input', 'np_add-desc-image-radio', `np_add_desc_image_medium_${desc_info.global_index}`)
  image_size_medium.setAttribute('type', 'radio')
  image_size_medium.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_medium.checked = true
  image_size_medium_container.appendChild(image_size_medium_label)
  image_size_medium_container.appendChild(image_size_medium)
  image_ligne.appendChild(image_size_medium_container)

  let image_size_small_container = xCreateElement('div', 'checkbox_container', '')
  let image_size_small_label = xCreateElement('label', '', '')
  image_size_small_label.setAttribute('for', `np_add_desc_image_small_${desc_info.global_index}`)
  image_size_small_label.innerHTML = 'small&nbsp;'
  let image_size_small = xCreateElement('input', 'np_add-desc-image-radio', `np_add_desc_image_small_${desc_info.global_index}`)
  image_size_small.setAttribute('type', 'radio')
  image_size_small.setAttribute('name', `image-size-${desc_info.global_index}`)
  image_size_small_container.appendChild(image_size_small_label)
  image_size_small_container.appendChild(image_size_small)
  image_ligne.appendChild(image_size_small_container)

  // assemblage des éléments du groupe de description
  description_group.appendChild(top_separator)
  if (delete_description_group_btn !== null)
    description_group.appendChild(delete_description_group_btn)
  description_group.appendChild(titre_group)
  description_group.appendChild(description_big_container)
  description_group.appendChild(image_ligne)

  description_group_container.appendChild(description_group)

  // ajout du conteneur html du groupe de description dans la liste des groupes
  desc_info.html_object = description_group

  // event de suppression du groupe de description
  if (delete_description_group_btn !== null) {
    delete_description_group_btn.addEventListener('click', np_removeDescriptionGroup)
  }

  // event de transposition du titre du groupe de description dans l'aperçu
  desc_info.titre_handler = (e) => {
    let index = np_getDescriptionGroupInfoIndex(desc_info.global_index)
    data.description[index].title = e.target.value
    np_render()
  }
  titre_group_input.addEventListener('keyup', desc_info.titre_handler)

  // création du quill
  let new_quill = new Quill(`#np_description_${desc_info.global_index}`, {
    modules: { toolbar: true, },
    theme: 'snow',
    placeholder: "Votre description ..."
  })

  new_quill.on('text-change', (delta, oldDelta, source) => {
    // desc_info.text_content = convertQuillOutput(new_quill.getSemanticHTML())
    desc_info.text_content = new_quill.getSemanticHTML()
    let index = np_getDescriptionGroupInfoIndex(desc_info.global_index)
    data.description[index].content = desc_info.text_content
    np_render()
  })
  
  np_liste_descriptions_infos.push(desc_info)

  np_initImageDescription(desc_info.global_index)

}
function np_removeDescriptionGroup(e) {
  let global_index = parseInt(e.target.id.split('_').splice(-1))
  console.log(`-- removeDescriptionGroup - ${global_index}`)
  let desc_info_index = np_getDescriptionGroupInfoIndex(global_index)
  let desc_info = np_liste_descriptions_infos[desc_info_index]
  let titre_group_input = document.getElementById(`np_input_titre_groupe_${desc_info.global_index}`)
  titre_group_input.removeEventListener('keyup', desc_info.titre_handler)
  let delete_description_group_btn = document.getElementById(`np_delete-description-group_${desc_info.global_index}`)
  delete_description_group_btn.removeEventListener('click', np_removeDescriptionGroup)
  np_liste_descriptions_infos.splice(desc_info_index, 1)
  data.description.splice(desc_info_index, 1)
  data.images.splice(desc_info_index, 1)
  let description_group = document.getElementById(`np_description_group_${global_index}`)
  description_group.parentNode.removeChild(description_group)
  np_render()
}

function np_createDescriptionGroupInfo() {
  let new_desc_info = {
    'global_index' : 0,
    'text_content' : '',
    'quill_object' : null,
    'image_object' : null,
    'titre_handler' : null,
    'suppr_handler' : null,
  }
  if (np_liste_descriptions_infos.length != 0) {
    let index = 0
    np_liste_descriptions_infos.forEach(element => {
      if (element.global_index > index) index = element.global_index      
    });
    new_desc_info.global_index = index + 1 
  }
  return new_desc_info
}
function np_getDescriptionGroupInfoIndex(global_index) {
  let return_value = null
  np_liste_descriptions_infos.forEach((element, element_index) => {
    if (parseInt(element.global_index) == parseInt(global_index)) return_value = element_index
  })
  return return_value
}
/* Description group Image */
function np_initImageDescription(global_index) {


  // todo reset handlers au recall d'initImageDescription()
  let boutons_add_desc_image = document.querySelectorAll('.np_description-add-image')
  boutons_add_desc_image.forEach(btn_add_img => {
    btn_add_img.addEventListener('click', (e) => {
      //todo passer l'index 'absolu' de la description a la popup de cropping image pour qu'elle soit renvoyé en data avec l'event de event-image-canvas2
      let description_active = parseInt(e.currentTarget.getAttribute('id').split('_').slice(-1))
      initCropper(false, description_active, 'np')
      let popup_canvas_container = document.getElementById('popup-canvas-container')
      popup_canvas_container.style.display = "block"
    })
    
    let all_radios = document.querySelectorAll(`#np_description_group_${global_index} .np_add-desc-image-radio`)
    all_radios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        let image_index = parseInt(e.currentTarget.id.split('_').splice(-1))
        let value = ""
        if (e.target.id.includes('large')) value = 'large'
        if (e.target.id.includes('medium')) value = 'medium'
        if (e.target.id.includes('small')) value = 'small'
        data.images[np_getDescriptionIndexFromGlobalIndex(image_index)].display_size = value
        np_render()
      })
    })
  })
  

  document.getElementById('close-popup-canvas-container').addEventListener('click', (e) => {
    let popup_canvas_container = document.getElementById('popup-canvas-container')
    popup_canvas_container.style.display = "none"
  })
}


/* -- Render New Produit ----------------------------------------------------------------------------------------------------- */
function np_render() {

  // TODO gerer le rename prefixe np_
  let header_titre = document.getElementById('np_produit-header-titre-text')
  header_titre.innerText = getCategorieName(data.id_categorie).toUpperCase()

  let render_parent = document.getElementById('np_render_parent')
  render_parent.innerHTML = ""
  let separator = xCreateElement('div', 'modal-main-separator', '')
  separator.innerHTML = "&nbsp;"
  render_parent.appendChild(separator)

  let produit_marque_container = xCreateElement('div', 'produit-marque-container', '')
  let produit_nom = xCreateElement('div', 'produit-nom', 'np_produit-nom')
  produit_nom.innerHTML = data.nom
  produit_marque_container.appendChild(produit_nom)
  let produit_marque = xCreateElement('div', 'produit-marque', 'np_produit-marque')
  produit_marque.innerHTML = data.marque
  produit_marque_container.appendChild(produit_marque)
  produit_marque_container.innerHTML += `
    <svg viewBox="0 0 100 5" class="produit-separator">
      <line x1="0" y1="3" x2="100" y2="3" class="line-svg-thin" />
    </svg>
  `
  render_parent.appendChild(produit_marque_container)

  // console.log(data.prix)
  if (data.prix > 10) {
    let produit_prix_container = xCreateElement('div', 'produit-prix-container', '')
    let produit_prix = xCreateElement('div', 'produit-prix')
    produit_prix.innerHTML = `<b>Prix :</b> ${data.prix} &nbsp;&euro;`
    produit_prix_container.appendChild(produit_prix)
    render_parent.appendChild(produit_prix_container)
  }

  if (data.thumb != "") {
    let thumb_overview = document.getElementById('np_thumb_overview')
    thumb_overview.setAttribute('src', data.thumb)
  }
  

  data.description.forEach((desc, index_desc) => {
    let produit_titre_groupe = xCreateElement('div', 'produit-titre-groupe', `produit-titre-groupe-${desc.global_index}`)
    produit_titre_groupe.innerHTML = desc.title
    let produit_group = xCreateElement('div', `produit-group ${data.images[index_desc].display_size}`, `produit-group-${desc.global_index}`)
    let produit_descriptif = xCreateElement('div', 'produit-descriptif', `produit-descriptif-${desc.global_index}`)
    produit_descriptif.innerHTML = convertQuillOutput(desc.content)
    produit_group.appendChild(produit_descriptif)
    let produit_image = xCreateElement('img', `produit-picture`, 'produit-picture')
    produit_image.setAttribute('src', data.images[index_desc].data)
    produit_image.style.display = "block"
    produit_group.appendChild(produit_image)
    
    render_parent.appendChild(produit_titre_groupe)
    render_parent.appendChild(produit_group)
  })

}


/* Reset nouveau produit page */
function resetNouveauProduitPage() {
  console.log('-- resetNouveauProduitPage()')
  data = {
  'id_produit': 0,
  'id_famille': 0,
  'nom_famille': "",
  'id_categorie': 0,
  'nom_categorie': "",
  'nom': "",
  'marque': "",
  'description': [],
  'images': [],
  'prix': -1,
  'thumb': "",
}
  // np_setSelectFamille(0)
  // np_setSelectCategorie()
  // np_initImageThumb()
  // np_initNomEtMarque()
  // np_initPrix()
  // initDescriptionGroup()
  // np_initSendServer()
  // np_render()
}


/* Send server */
function np_initSendServer() {

  let old_send_server_btn = document.getElementById('np_send_server_btn')
  if (old_send_server_btn !== null) old_send_server_btn.removeEventListener('click', np_sendProduit)

  let send_server_container = document.getElementById('np_send_server_container')
  let send_server_btn = xCreateElement('button', '', 'np_send_server_btn')
  send_server_btn.innerHTML = "Envoyer au serveur"
  send_server_container.appendChild(send_server_btn)

  send_server_btn.addEventListener('click', np_sendProduit)

}
async function np_sendProduit() {

  let json = null
  // const url_send_new_produit = "http://localhost/green_catalogue_rest/uploadProduit.php"
  let formData = new FormData()
  formData.append('id_famille', data.id_famille)
  formData.append('id_categorie', data.id_categorie)
  formData.append('nom', data.nom)
  formData.append('marque', data.marque)
  formData.append('prix', data.prix)
  data.description.forEach((desc, index_desc) => {
    formData.append(`desc_${index_desc}`, desc.content)
    formData.append(`desc_titre_${index_desc}`, desc.title)
    formData.append(`desc_index_${index_desc}`, index_desc)
  })
  data.images.forEach((image_produit, index_image) => {
    let imgBase64 = image_produit.data
    if (imgBase64 !== "") {   
      let myfile = DataURIToBlob(imgBase64)
      formData.append(`file_image_${index_image}`, myfile, `file_image_${index_image}.jpeg`)
      formData.append(`image_display_size_${index_image}`, image_produit.display_size)
    }
  })
  if (data.thumb !== "") {
    let thumbBase64 = data.thumb
    let fileThumb = DataURIToBlob(thumbBase64)
    formData.append('file_thumb', fileThumb, 'fileThumb.jpeg')
  }
  
  try {
    const response = await fetch(url_send_new_produit, {
      method: "post",
      body: formData,
    });
    if (!response.ok) { throw new Error(`Response status: ${response.status}`); }
    json = await response.json()
    console.log(json)
    
  } catch (error) { console.error(error.message); }
  
}



/* -- Cropper handlers loaded images -------------------------------------------- */
cropperLoadEventListeners()
function cropperLoadEventListeners() {
  window.addEventListener('event-thumb-canvas2', (e) => {
    let popup_canvas_container = document.getElementById('popup-canvas-container')
    popup_canvas_container.style.display = "none"
    switch (e.export_mode) {
      case 'np':
        data.thumb = canvas2.toDataURL("image/jpeg", 0.7)
        np_render()
        break
      case 'ep':
        data_edit.thumb = canvas2.toDataURL("image/jpeg", 0.7)
        ep_render()
    }
    
  }, false)
  window.addEventListener('event-image-canvas2', (e) => {
    console.log(`image created index : ${e.image_index}`)
    let popup_canvas_container = document.getElementById('popup-canvas-container')
    popup_canvas_container.style.display = "none"
    data.images[np_getDescriptionIndexFromGlobalIndex(e.image_index)].data = canvas2.toDataURL("image/jpeg", 0.7)
    // data.images[getDescriptionIndexFromGlobalIndex(description_active)].data = canvas2.toDataURL("image/jpeg", 0.7)
    np_render()
  }, false)
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
  // console.log(`getFamilleObject(${id_fam})`)
  let obj_fam = null
  // console.log(liste_familles)
  liste_familles.forEach(famille => {
    if (famille.id_famille == id_fam) obj_fam = famille
  })
  // console.log(obj_fam)
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
function np_getDescriptionIndexFromGlobalIndex(index_absolute) {
  let index = 0
  data.description.forEach((desc, desc_index)=> {
    if (desc.global_index == index_absolute) index = desc_index
  })
  return index
}
function ep_getDescriptionIndexFromGlobalIndex(index_absolute) {
  let index = 0
  data_edit.description.forEach((desc, desc_index)=> {
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
function convertQuillOutput(text) {
  return text.replace(/&nbsp;|\u00A0/g, ' ');
}

/* Upload file */
function DataURIToBlob(dataURI) {
  const splitDataURI = dataURI.split(',')
  const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

  const ia = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i)

  return new Blob([ia], { type: mimeString })
}