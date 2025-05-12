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
let index_famille = null
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
}, false)


function initCreateProduct() {
  setSelectFamille()
  let create_categorie = document.getElementById('create_categorie')
  create_categorie.appendChild(setSelectCategorie(1))
  

}


function setSelectFamille() {

  let create_famille = document.getElementById('create_famille')
  let create_famille_container = document.createElement('div')
  create_famille_container.classList.add('select_container')
  let select_famille = document.createElement('select')
  select_famille.setAttribute('name', 'add_famille')
  liste_familles.forEach((famille, index_famille) => {
    let option_famille = document.createElement('option')
    option_famille.setAttribute('value', parseInt(famille['id_famille']))
    if (index_famille == 0) {
      option_famille.setAttribute('selected', 'selected')
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

  add_famille_btn.addEventListener('click', openCreateFamillePopup)

  create_famille.appendChild(create_famille_container)
}

function setSelectCategorie(id_famille) {
  let select_cat = document.createElement('select')
  select_cat.setAttribute('name', 'add_categorie')
  let famille_index = null
  liste_familles.forEach((famille, index_famille) => {
    if (famille['id_famille'] == id_famille) famille_index = index_famille
  });
  let liste_cat = liste_familles[famille_index].liste_categories
  liste_cat.forEach(categorie => {
    let option_cat = document.createElement('option')
    option_cat.setAttribute('value', parseInt(categorie['id_categorie']))
    option_cat.innerText = categorie['nom_categorie']
    select_cat.appendChild(option_cat)
  })
  return select_cat;
}

function openCreateFamillePopup() {

  let popup_container = document.getElementById('popup-container')

  popup_container.style.display = 'block'
  popup_container.style.zIndex = 20

  let popup_add_famille = document.getElementById('popup-add-famille')  
  let popup_add_famille_close = document.getElementById('popup-add-famille-close')

  popup_add_famille_close.addEventListener('click', closeCreateFamillePopup)

}
function closeCreateFamillePopup() {
  let popup_container = document.getElementById('popup-container')

  popup_container.style.display = 'none'
  popup_container.style.zIndex = -1
}



