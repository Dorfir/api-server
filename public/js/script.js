console.log('-- DOM loaded')

let produits = null
var liste_familles_produits = null
let swiperOption = null
let current_produit_id_cat_active = -1

var prestas = null
var liste_familles_prestas = null
var current_presta_id_famille_active = -1
const contractuel = `* Photos non contractuelles - Équipements de série ou équivalent`
let swiperPresta = null

let image_load_total = -1
let image_load_count = -1

const image_path = `${path_prefix}green_catalogue_rest/uploads/`


/* -------------------------------------------------------------------- */
/* Init application */
initApplication()
function initApplication() {

  /* Init prestas */
  window.addEventListener('event-prestas-received', (e) => {
    if ((prestas !== null) && (liste_familles_prestas !== null)) {
      // console.log("----- all prestas received")
      // console.log(prestas)
      // console.log(liste_familles_prestas)
      
      initPrestaMenu()
      initPrestaRouting()
    }
  }, false)
  getDataPrestas()
  getListeFamillesPrestas()
  swiperPresta = new Swiper('.swiperPresta', {
    direction: 'horizontal',
    loop: false,
    pagination: {
      el: '.swiper-pagination',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });

  /* Init options/ produits */
  getDataProduits()
  getListeFamillesProduits()
  swiperOption = new Swiper('.swiperOption', {
    direction: 'horizontal',
    loop: false,
    pagination: {
      el: '.swiper-pagination',
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });
  window.addEventListener('event-produits-received', (e) => {
    if ( (produits !== null) && (liste_familles_produits !== null) ) {
      initOptionsSummery()
    }      
  }, false)
  
}



/* -------------------------------------------------------------------- */
/* PRESTAS */
/* -------------------------------------------------------------------- */
/* Data gathering : PRESTAS */
async function getDataPrestas() {
  let json = null
  const url = `${path_prefix}green_catalogue_rest/getPrestas.php`
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    json = await response.json()
    if (json['status'] == 200) {
      prestas = json['prestas']
      // console.log(prestas)
      let eventListePrestasReceived = new Event("event-prestas-received")
      window.dispatchEvent(eventListePrestasReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}
async function getListeFamillesPrestas() {
  let json = null
  const url = `${path_prefix}green_catalogue_rest/getPrestaFamilles2.php`
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
      liste_familles_prestas = json['familles']
      // console.log(liste_familles_prestas)
      let eventListePrestasReceived = new Event("event-prestas-received")
      window.dispatchEvent(eventListePrestasReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}

/* Fonction utilitaires pour traiter les données des prestas */
function getPrestaById(id_presta) {
  let presta = null
  prestas.forEach(current => {
    if (parseInt(current.id_presta) == id_presta) presta = current 
  })
  return presta
}
function getFamillePrestaById(id_famille) {
  let famille = null
  liste_familles_prestas.forEach(current => {
    if (parseInt(current.id_famille) == id_famille) famille = current 
  })
  return famille
}
function getPrestaIndexInFamille(id_famille, id_presta) {
  let index = 0
  let famille = getFamillePrestaById(id_famille)
  famille.prestas.forEach((presta, index_presta) => {
    if (parseInt(presta.id_presta) == id_presta) index = index_presta
  } )
  return index
}

/* Initialisation prestas */
function initPrestaMenu() {

  let presta_body = document.getElementById('presta-body')
  presta_body.innerHTML = ''

  liste_familles_prestas.forEach((famille, index_famille) => {
    let presta_element_container = xCreateElement('div', 'presta-element-container')
    let presta_element = xCreateElement('div', 'presta-element', `presta_rubrique_id_${famille.id_famille}`)
    let presta_element_titre = xCreateElement('div', 'presta-element-titre')
    presta_element_titre.innerHTML = famille.nom_famille
    let presta_element_liste = xCreateElement('div', 'presta-element-liste')
    let ul_element = document.createElement('ul')
    famille.prestas.forEach((presta) => {
      let li_element = xCreateElement('li', '', `presta_${presta.id_presta}`)
      li_element.innerHTML = presta.nom_presta
      ul_element.appendChild(li_element)
    })
    presta_element_liste.appendChild(ul_element)
    presta_element.appendChild(presta_element_titre)
    presta_element.appendChild(presta_element_liste)
    presta_element_container.appendChild(presta_element)
    presta_body.appendChild(presta_element_container)
  })

}
function initPrestaRouting() {

  // Accueil - accès liste prestas
  let accueil_presta = document.getElementById('accueil_presta')
  accueil_presta.addEventListener('click', (e) => {
    console.log('-- accueil presta')
    let options_main_container = document.getElementById('options-main-container')
    let presta_main_container = document.getElementById('presta-main-container')
    options_main_container.style.display = "none"
    presta_main_container.style.display = "block"
  })

  // Presta liste - bouton retour
  let presta_retour_btn = document.getElementById('presta-retour-btn')
  presta_retour_btn.addEventListener('click', (e) => {
    let presta_main_container = document.getElementById('presta-main-container')
    presta_main_container.style.display = "none"
  })

  
  // Presta liste - liens vers les fiches
  liste_familles_prestas.forEach((famille, index_famille) => {

    famille.prestas.forEach((presta, index_presta) => {

      let li_element = document.getElementById(`presta_${presta.id_presta}`)

      li_element.addEventListener('click', (e) => {

        let id_presta =  parseInt(e.currentTarget.id.split('_').splice(-1))
        let presta = getPrestaById(id_presta)

        if (presta.id_famille !== current_presta_id_famille_active) {
          let famille = getFamillePrestaById(presta.id_famille)
          let liste_prestas = []
          famille.prestas.forEach((current) => {
            liste_prestas.push(getPrestaById(current.id_presta))
          })
          updateFichePresta(liste_prestas)
          current_presta_id_famille_active = presta.id_famille
        }
        

        let header_title = document.getElementById('presta-fiche-header-titre-text')
        header_title.innerText = presta.nom_famille.toUpperCase()

        swiperPresta.slideTo(getPrestaIndexInFamille(presta.id_famille, presta.id_presta))

        let presta_fiche_main_container = document.getElementById('presta-fiche-main-container')
        presta_fiche_main_container.style.display = 'block' 
      })

    })


  })

  // Presta fiche - bouton retour
  let presta_fiche_header_close_btn = document.getElementById('presta-fiche-header-close-btn')
  presta_fiche_header_close_btn.addEventListener('click', (e) => {
    let presta_fiche_main_container = document.getElementById('presta-fiche-main-container')
    presta_fiche_main_container.style.display = "none"
  })

}

/* Fiches swiper des prestas */
function updateFichePresta(prestas) {
  
  displayLoader()
  let swiperPresta_wrapper = document.getElementById('swiperPresta-wrapper')
  swiperPresta_wrapper.innerHTML = ''

  image_load_total = 0
  image_load_count = 0
  prestas.forEach(presta => {
    presta.descriptifs.forEach(desc => {
      if (desc.image_url !== "") image_load_total++
    })
  })

  prestas.forEach(presta => {
    swiperPresta_wrapper.appendChild(createFichePrestaSwiperSlide(presta))
  })
  swiperPresta.update()
  
}
function createFichePrestaSwiperSlide(presta) {

  let swiperSlide = document.createElement('div')
  swiperSlide.classList.add('swiper-slide')
  let swiperSlideSubcontainer = document.createElement('div')
  swiperSlideSubcontainer.classList.add('swiperPresta-slide-subcontainer')
  let fichePresta = document.createElement('div')
  fichePresta.classList.add('fiche-presta')
  let modalMain = document.createElement('div')
  modalMain.classList.add('modal-main')

  let modalMainSeparator1 = document.createElement('div')
  modalMainSeparator1.setAttribute('id', 'modal-main-separator')
  modalMainSeparator1.innerHTML = "&nbsp;"
  modalMain.appendChild(modalMainSeparator1)

  let modalMainSubtitle = document.createElement('div')
  modalMainSubtitle.classList.add('presta-subtitle')
  modalMainSubtitle.innerHTML = presta.nom_presta
  modalMain.appendChild(modalMainSubtitle)
  
  presta.descriptifs.forEach((desc, index_desc) => {

    let presta_image_group = document.createElement('div')
    presta_image_group.classList.add('presta-image-group')
    let presta_image = document.createElement('img')
    presta_image.classList.add('presta-image')
    if (desc.image_url !== '') {
      presta_image.setAttribute('src', image_path+desc.image_url)
      presta_image.addEventListener('load', image_loaded_callback)
    } else {
      presta_image.setAttribute('src', '')
    }
    let presta_image_legende = document.createElement('div')
    presta_image_legende.classList.add('presta-image-legende')
    presta_image_legende.innerHTML = desc.html
    
    if (index_desc % 2 == 0) {
      presta_image_group.appendChild(presta_image)
      presta_image_group.appendChild(presta_image_legende)
    } else {
      presta_image_group.appendChild(presta_image_legende)
      presta_image_group.appendChild(presta_image)
    }

    modalMain.appendChild(presta_image_group)
  })
  
  let modalMainSeparator2 = document.createElement('div')
  modalMainSeparator2.setAttribute('id', 'modal-main-separator')
  modalMainSeparator2.innerHTML = "&nbsp;"
  modalMain.appendChild(modalMainSeparator2)

  let prestaDescriptif = document.createElement('div')
  prestaDescriptif.classList.add('presta-descriptif')
  prestaDescriptif.innerHTML = presta.article
  modalMain.appendChild(prestaDescriptif)

  let modalMainSeparator3 = document.createElement('div')
  modalMainSeparator3.setAttribute('id', 'modal-main-separator')
  modalMainSeparator3.innerHTML = "&nbsp;"
  modalMain.appendChild(modalMainSeparator3)

  let prestaContractuel = document.createElement('div')
  prestaContractuel.classList.add('presta-contractuel')
  prestaContractuel.innerText = contractuel  
  modalMain.appendChild(prestaContractuel)

  fichePresta.appendChild(modalMain)
  swiperSlideSubcontainer.appendChild(fichePresta)
  swiperSlide.appendChild(swiperSlideSubcontainer)

  return swiperSlide
}

/* et si une autre fournée est lancée avant que celle ci soit terminée ? */
function image_loaded_callback(e) {
  image_load_count++
  if (image_load_count == image_load_total) {
    window.setTimeout(() => {
      hideLoader()
    }, 200)
    
  }
}







/* -------------------------------------------------------------------- */
/* OPTIONS */
/* -------------------------------------------------------------------- */
/* -------------------------------------------------------------------- */
/* Data gathering : PRODUITS */
async function getDataProduits() {
  const url = `${path_prefix}green_catalogue_rest/getProduits.php`
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", },
    })
    if (!response.ok) { throw new Error(`Response status: ${response.status}`) }
    let json = await response.json();
    if (json['status'] == 200) {
      produits = json['produits']
      console.log('-- produits')
      console.log(produits)
      let eventListeProduitsReceived = new Event("event-produits-received")
      window.dispatchEvent(eventListeProduitsReceived)
    }
    
  } catch (error) {
    console.error(error.message);
  }
}
async function getListeFamillesProduits() {
  const url = `${path_prefix}green_catalogue_rest/getFamillesAndCategories.php`
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
    if (!response.ok) { throw new Error(`Response status: ${response.status}`) }
    let json = await response.json()
    if (json['status'] == 200) {
      liste_familles_produits = json['familles']
      console.log('-- liste_familles_produits')
      console.log(liste_familles_produits)
      window.dispatchEvent(new Event("event-produits-received"))
    }
  } catch (error) {
    console.error(error.message);
  }
}


  
/* Routes Options */
let accueil_options = document.getElementById('accueil_produit')
accueil_options.addEventListener('click', (e) => {
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  accueil_main_container.style.display = "none"
  options_main_container.style.display = "block"
  optionslist_main_container.style.display = "none"
})

let options_retour_btn = document.getElementById('options-retour-btn')
options_retour_btn.addEventListener('click', (e) => {
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  accueil_main_container.style.display = "block"
  options_main_container.style.display = "none"
  optionslist_main_container.style.display = "none"
})

let optionslist_close_btn = document.getElementById('optionslist-close-btn')
optionslist_close_btn.addEventListener('click', (e) => {
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  accueil_main_container.style.display = "none"
  options_main_container.style.display = "block"
  optionslist_main_container.style.display = "none"
})
let produit_header_close_btn = document.getElementById('produit-header-close-btn')
produit_header_close_btn.addEventListener('click', (e) => {
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  let produit_main_container = document.getElementById('produit-main-container')
  accueil_main_container.style.display = "none"
  options_main_container.style.display = "none"
  optionslist_main_container.style.display = "block"
  produit_main_container.style.display = "none"
})




function initOptionsSummery() {
  let options_body = document.getElementById('options-body')

  options_body.innerHTML = ""

  liste_familles_produits.forEach(famille => {
    let options_element_container = xCreateElement('div', 'options-element-container', '')
    let options_element = xCreateElement('div', 'options-element', '')
    let options_element_titre = xCreateElement('div', 'options-element-titre', '')
    options_element_titre.innerHTML = famille.nom_famille.toUpperCase()
    let options_element_liste = xCreateElement('div', 'options-element-liste', '')
    let options_element_ul = xCreateElement('ul', '', '')
    famille.liste_categories.forEach(cat=> {
      let options_element_li = xCreateElement('li', '', `famille_${cat.id_categorie}`)
      options_element_li.innerHTML = cat.nom_categorie
      options_element_ul.appendChild(options_element_li)
    })
    options_element_liste.appendChild(options_element_ul)
    options_element.appendChild(options_element_titre)
    options_element.appendChild(options_element_liste)
    options_element_container.appendChild(options_element)

    options_body.appendChild(options_element_container)

  })


  let liste_li = document.querySelectorAll('.options-element-liste li')
  for (var li of liste_li) {
    li.addEventListener('click', (e) => {
      console.log('click options li element')
      let id_categorie = parseInt(e.target.getAttribute('id').split('famille_')[1])
      // console.log(id_categorie)
      if (isCatExistInProductList(id_categorie)) initOptionsListPage(id_categorie)
    })
  }


}

function initOptionsListPage(id_cat) {

  console.log('-- initOptionsListPage')
  // create options list page
  let liste_produits = getProduitsFromCategorie(id_cat)
  if (liste_produits.length == 0) return false

  // init produit famille only if not already setup
  if (current_produit_id_cat_active != id_cat) {

    // displayLoader()
    console.log("here")
  
    current_produit_id_cat_active = id_cat
    
    let nom_cat = liste_produits[0].nom_categorie
    let title_cat = document.getElementById('optionslist-title')
    title_cat.innerHTML = nom_cat.toUpperCase()

    let optionslist_body = document.getElementById('optionslist-body')
    optionslist_body.innerHTML = ""

    liste_produits.forEach(prod => {

      let list_element = document.createElement('div')
      list_element.classList.add('optionslist-element')
      list_element.setAttribute('id', 'list_element_'+prod.id_produit)

      let list_element_image_div = document.createElement('div')
      list_element_image_div.classList.add('optionslist-element-image')
      let list_element_image = document.createElement('img')
      list_element_image.setAttribute('src', image_path + prod.thumb)
      // if (prod.id_produit >= 21) {
      //   list_element_image.setAttribute('src', image_path + prod.thumb)
      // } else {
      //   list_element_image.setAttribute('src', prod.thumb)
      // }    
      list_element_image_div.appendChild(list_element_image)
      list_element.appendChild(list_element_image_div)

      let list_element_titre = document.createElement('div')
      list_element_titre.classList.add('optionslist-element-titre')
      let titre_blanc = document.createElement('span')
      titre_blanc.classList.add('white')
      titre_blanc.innerHTML = prod.nom+"&nbsp;"
      let titre_gold = document.createElement('span')
      titre_gold.classList.add('gold')
      titre_gold.innerHTML = prod.marque
      list_element_titre.appendChild(titre_blanc)
      list_element_titre.appendChild(titre_gold)
      list_element.appendChild(list_element_titre)

      optionslist_body.appendChild(list_element)

    })

    // initFichesProduits
    initProduitPage(id_cat)

    // eventListener
    let optionslist_elements = document.getElementsByClassName('optionslist-element')
    for(element of optionslist_elements) {
      element.addEventListener('click', (e) => {

        // navigate to swiper index
        console.log(e.currentTarget)
        let element_id = parseInt(e.currentTarget.getAttribute('id').split('list_element_')[1])
        let element_index = getProduitIndexFromListeProduits(element_id, liste_produits)
        swiperOption.slideTo(element_index, 0, null)

        // display fiche produit
        let accueil_main_container = document.getElementById('accueil-main-container')
        let options_main_container = document.getElementById('options-main-container')
        let optionslist_main_container = document.getElementById('optionslist-main-container')
        let produit_main_container = document.getElementById('produit-main-container')
        accueil_main_container.style.display = "none"
        options_main_container.style.display = "none"
        optionslist_main_container.style.display = "none"
        produit_main_container.style.display = "block"

      })
    }
  } 

  // display options list
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  accueil_main_container.style.display = "none"
  options_main_container.style.display = "none"
  optionslist_main_container.style.display = "block"

}

function initProduitPage(id_cat) {

  let liste_produits = getProduitsFromCategorie(id_cat)

  let produit_header_titre_text = document.getElementById('produit-header-titre-text')
  produit_header_titre_text.innerText = liste_produits[0].nom_categorie.toUpperCase()

  changeFicheProduitSwiper(liste_produits)

}

function changeFicheProduitSwiper(produits) {
  let swiperWrapper = document.getElementById('swiperOption-wrapper')
  swiperWrapper.innerHTML = ""
  produits.forEach(produit => {
    swiperWrapper.appendChild(createFicheProduit(produit))
  })
  swiperOption.update()
}

function createFicheProduit(prod) {

  // console.log(prod)

  let swiperSlide = document.createElement('div')
  swiperSlide.classList.add('swiper-slide')
  let swiperSlideSubcontainer = document.createElement('div')
  swiperSlideSubcontainer.classList.add('swiperOption-slide-subcontainer')
  let ficheProduit = document.createElement('div')
  ficheProduit.classList.add('fiche-produit')
  let modalMain = document.createElement('div')
  modalMain.classList.add('modal-main')

  let modalMainSeparator = document.createElement('div')
  modalMainSeparator.setAttribute('id', 'modal-main-separator')
  modalMainSeparator.innerHTML = "&nbsp;"

  let produitMarque = document.createElement('div')
  produitMarque.classList.add('produit-marque')
  // TODO change
  let produitMarqueBlanc = document.createElement('div')
  produitMarqueBlanc.classList.add('produit-marque-1')
  produitMarqueBlanc.innerText = prod.nom
  let produitMarqueGold = document.createElement('div')
  produitMarqueGold.classList.add('produit-marque-2')
  produitMarqueGold.innerText = prod.marque
  let svg = `<svg viewBox="0 0 100 5" class="produit-separator">
            <line x1="0" y1="3" x2="100" y2="3" class="line-svg-thin" />
            </svg>`
  produitMarque.appendChild(produitMarqueBlanc)
  produitMarque.appendChild(produitMarqueGold)
  produitMarque.innerHTML += svg
  
  modalMain.appendChild(modalMainSeparator)
  modalMain.appendChild(produitMarque)

  if (parseInt(prod.prix) > 0) {
    let produitPrixContainer = xCreateElement('div', 'produit-prix-container', '')
    let produitPrix = xCreateElement('div', 'produit-prix', '')
    produitPrix.innerHTML = `<b>Prix : </b>${prod.prix}&nbsp;&euro;`
    produitPrixContainer.appendChild(produitPrix)
    modalMain.appendChild(produitPrixContainer)
  }

  // todo a voir ce max desc/images ...
  let group_count = Math.max(prod.descriptifs.length, prod.images.length)
  for (let i = 0; i < group_count; i++) {

    let isDescExist = (i < prod.descriptifs.length)

    // console.log(`isDescExist ${isDescExist}`)

    if (isDescExist) {
      let produitTitreGroupe = document.createElement('div')
      produitTitreGroupe.classList.add('produit-titre-groupe')
      if (i % 2 !== 0) produitTitreGroupe.classList.add('right')
      produitTitreGroupe.innerText = prod.descriptifs[i].titre
      modalMain.appendChild(produitTitreGroupe)
    }
    

    let produitGroup = document.createElement('div')
    produitGroup.classList.add('produit-group')

    let produitDescriptif = null
    if (prod.descriptifs.length > i) {
      produitDescriptif = document.createElement('div')
      produitDescriptif.classList.add('produit-descriptif')
      produitDescriptif.innerHTML = prod.descriptifs[i].html
    }

    let produitPicture = null
    if (prod.images.length > i) {
      produitPicture = document.createElement('img')
      produitPicture.classList.add('produit-picture')
      
      produitPicture.setAttribute('src', image_path + prod.images[i].image_url)
      // if (prod.id_produit >= 21) {
      //   produitPicture.setAttribute('src', image_path + prod.images[i].image_url)
      // } else {
      //   produitPicture.setAttribute('src', prod.images[i].image_url)
      // }
      
    }

    if (i % 2 == 0) {
      if (produitDescriptif !== null) produitGroup.appendChild(produitDescriptif)
      if (produitPicture !== null) produitGroup.appendChild(produitPicture)
    } else {
      if (produitPicture !== null) produitGroup.appendChild(produitPicture)
      if (produitDescriptif !== null) produitGroup.appendChild(produitDescriptif)
    }

    // <div class="produit-group">

    //       <div class="produit-descriptif">
    //           Dimensions disponibles:
    //           <ul>
    //               <li>70x120/140 cm</li>
    //               <li>80x80/100/120/140 cm</li>
    //               <li>90x90/120/140 cm</li>
    //           </ul>
    //       </div>

    //       <img class="produit-picture" src="./img/produits/receveurs_stepinSanindusa.jpg" />
    //   </div>

    modalMain.appendChild(produitGroup)
  }


  ficheProduit.appendChild(modalMain)
  swiperSlideSubcontainer.appendChild(ficheProduit)
  swiperSlide.appendChild(swiperSlideSubcontainer)

  return swiperSlide
}



/* Divers */
function isCatExistInProductList(id_cat) {
  let retour = false
  produits.forEach(prod => {
    if (prod.id_categorie == id_cat) retour = true
  })
  return retour
}
function getProduitsFromCategorie(id_cat) {
  liste_produits = [...produits.reduce((map, value) => (value.id_categorie == id_cat) ? map.set(value.id_produit, value) : map, new Map()).values()]
  liste_produits = liste_produits.sort((a, b) => { return a.marque.localeCompare(b.marque) })
  return liste_produits
}
function getProduitIndexFromListeProduits(id, listeProduits) {
  let retour_index = -1
  listeProduits.forEach((prod, index) => {
    if (prod.id_produit == id) retour_index = index
  })
  return retour_index
}
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


/* ------------------- Loader ------------------- */
function displayLoader() {
  let loaderContainer = document.getElementById('loader-container')
  loaderContainer.style.display = "block"
}
function hideLoader() {
  let loaderContainer = document.getElementById('loader-container')
  loaderContainer.style.display = "none"
}







