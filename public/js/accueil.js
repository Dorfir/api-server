console.log('-- DOM loaded')

var json_data = null
var liste_familles = null



// const image_path = "http://localhost/green_catalogue_rest/uploads/"
const image_path = `${path_prefix}green_catalogue_rest/uploads/`

getData()
async function getData() {
  const url = `${path_prefix}green_catalogue_rest/getProduits.php`
  // const url = "http://localhost/green_catalogue_rest/getProduits.php";
  // const url = "http://192.168.2.236/visiolab/greencity_miniconfig/green_catalogue_rest/getProduits.php";
  // const url = "../green_catalogue_rest/getProduits.php";
  // const url = "http://localhost:80/green_catalogue_rest/test.json";
  // const url = "https://www.visiolab.fr/test.json";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    json_data = await response.json();
    console.log(json_data);
  } catch (error) {
    console.error(error.message);
  }
}

const eventListeFamilleReceived = new Event("event-liste-famille-received")
getListeFamilles()
async function getListeFamilles() {
  let json = null
  const url = `${path_prefix}green_catalogue_rest/getFamillesAndCategories.php`
  // const url = "http://192.168.2.236/visiolab/greencity_miniconfig/green_catalogue_rest/getFamillesAndCategories.php";
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
      // console.log(liste_familles)
      window.dispatchEvent(eventListeFamilleReceived)
    }
  } catch (error) {
    console.error(error.message);
  }
}
window.addEventListener('event-liste-famille-received', (e) => {
    // firstLoad = false
    // initCreateProduct()
    // window.setTimeout(() => {
    //   hideLoader()
    // }, 400)
    initOptionsSummery()
}, false)


var liste_prestas = [
  {
    id_presta: 1,
    id_rubrique: 1,
    nom_rubrique: "Cuisines",
    images: ['./img/presta/cuisine/cuisine_01.jpg', './img/presta/cuisine/cuisine_02.jpg'],
    images_legende: ['Cuisine type T3', 'Cuisine type T2'],
    descriptif: `
      LES PRESTATIONS INCLUSES *<br><br>
      Meubles bas avec étagères<br>
      Plan de travail hydrofuge de couleur bois<br>
      Plaque de cuisson vitrocéramique encastrée : 2 feux pour les T1-T2, 3 feux pour les T3<br>
      Hotte aspirante intégrée<br>
      Évier avec égouttoir (inox) encastré<br>
      Robinet mitigeur avec double butée économique<br>
      Meubles hauts avec étagères<br>
      Emplacement pour four et micro-ondes<br>
      Emplacement pour réfrigérateur<br>
      Réfrigérateur fourni : Tabel Top pour les T1-T2, Réfrigérateur-Congélateur pour les T3<br>
      Arrivées et évacuations pour lave-vaisselle<br><br>
    `,
    contractuel: `* Photos non contractuelles - Équipements de série ou équivalent`
  },
  {
    id_presta: 2,
    id_rubrique: 2,
    nom_rubrique: "Salles de bain",
    images: ['./img/presta/sdb/sdb_01.jpg', './img/presta/sdb/sdb_02.jpg'],
    images_legende: ['Salle de bains type T4', 'Salle de bains type T2'],
    descriptif: `
      LES PRESTATIONS INCLUSES *<br><br>
      Meubles avec tiroirs recouvert d'une vasque en résine intégrée<br>
      Robinetterie mitigeuse équipée de double butée<br>
      Grand miroir rétroclairé par LED<br>
      Emplacement machine à laver le linge (jusqu'au T3 inclus)<br>
      Lave-linge fourni (jusqu'au T3 inclus)<br>
      Baignoire en acier émaillé avec douchette, flexible, barre de douche et robinet mitigeur<br>
      Radiateur sèche serviette<br>
      WC avec cuvette céramique et abattant double avec frein de chute, réservoir avec chasse 3/6 l'économiseur d'eau (inclus dans les SDB pour les T2)<br>
      WC séparé à partir des T3<br>
    `,
    contractuel: `* Photos non contractuelles - Équipements de série ou équivalent`
  },
  {
    id_presta: 3,
    id_rubrique: 3,
    nom_rubrique: "Prestations intérieures",
    images: ['./img/presta/presta_interieures_01/presta1_interieures_01.jpg', './img/presta/presta_interieures_01/presta1_interieures_02.jpg'],
    images_legende: ['Placards de rangement aménagés', 'Portes rainurées et laquées'],
    descriptif: `
      Tous nos logements sont équipés de la solution GreenCity Connect et profitent d'une box connectées intégrée au tableau éléectrique<br>
      Depuis votre smartphone, votre tablette ou votre ordinateur, grâce à une application simple et intuitive, vous commandez à distance et
      programmez les équipements connectés inclus de votre logement : le chauffage, l'alarme anti-intrusion et les volets roulants
      électriques dans les T4 et T5.<br>
      <br>
      (sous réserve d'abonnement internet à la charge du client)
      <br>
    `,
    contractuel: `* Photos non contractuelles - Équipements de série ou équivalent`
  },
  {
    id_presta: 4,
    id_rubrique: 3,
    nom_rubrique: "Prestations intérieures",
    images: ['./img/presta/presta_interieures_02/presta2_interieures_01.jpg'],
    images_legende: [],
    descriptif: `
      Porte palière à âme pleine avec affaiblissement acoustique, serrure 3 points, poignée de sécurité à protecteur de cylindre<br>
      Clés avec badge de proximité intégré "Tout en un"<br>      
    `,
    contractuel: ``
  }
]


/* -------------------------------------------------------------------- */
/* Routing Site */
/* -------------------------------------------------------------------- */
let accueil_options = document.getElementById('accueil_produit')
accueil_options.addEventListener('click', (e) => {
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  accueil_main_container.style.display = "none"
  options_main_container.style.display = "block"
  optionslist_main_container.style.display = "none"
})
let accueil_presta = document.getElementById('accueil_presta')
accueil_presta.addEventListener('click', (e) => {
  console.log('-- accueil presta')
  let options_main_container = document.getElementById('options-main-container')
  let presta_main_container = document.getElementById('presta-main-container')
  options_main_container.style.display = "none"
  presta_main_container.style.display = "block"
})

/* Routes Prestas */
let presta_retour_btn = document.getElementById('presta-retour-btn')
presta_retour_btn.addEventListener('click', (e) => {
  let presta_main_container = document.getElementById('presta-main-container')
  // let optionslist_main_container = document.getElementById('optionslist-main-container')
  presta_main_container.style.display = "none"
  // optionslist_main_container.style.display = "none"
})
let liste_presta = document.querySelectorAll('.presta-element-liste li')
for(var presta_li of liste_presta) {
  presta_li.addEventListener('click', (e) => {
    console.log('click presta li element')
    if (e.currentTarget.classList.contains('presta_cuisine')) {
      let prestas = getPrestasFromIdRubrique(1)
      updateFichePresta(prestas)
      let header_title = document.getElementById('presta-fiche-header-titre-text')
      header_title.innerText = prestas[0].nom_rubrique.toUpperCase()
      let presta_fiche_main_container = document.getElementById('presta-fiche-main-container')
      presta_fiche_main_container.style.display = 'block'
    } else if (e.currentTarget.classList.contains('presta_sdb')) {
      let prestas = getPrestasFromIdRubrique(2)
      updateFichePresta(prestas)
      let header_title = document.getElementById('presta-fiche-header-titre-text')
      header_title.innerText = prestas[0].nom_rubrique.toUpperCase()
      let presta_fiche_main_container = document.getElementById('presta-fiche-main-container')
      presta_fiche_main_container.style.display = 'block'
    } else if (e.currentTarget.classList.contains('presta_menuiserie')) {
      let prestas = getPrestasFromIdRubrique(3)
      updateFichePresta(prestas)
      let header_title = document.getElementById('presta-fiche-header-titre-text')
      header_title.innerText = prestas[0].nom_rubrique.toUpperCase()
      let presta_fiche_main_container = document.getElementById('presta-fiche-main-container')
      presta_fiche_main_container.style.display = 'block'
    }
  })
}
let presta_fiche_header_close_btn = document.getElementById('presta-fiche-header-close-btn')
presta_fiche_header_close_btn.addEventListener('click', (e) => {
  let presta_fiche_main_container = document.getElementById('presta-fiche-main-container')
  presta_fiche_main_container.style.display = "none"
})

/* Routes Options */
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





/* Produits */
const swiperOption = new Swiper('.swiperOption', {
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

function initOptionsSummery() {
  let options_body = document.getElementById('options-body')

  options_body.innerHTML = ""

  liste_familles.forEach(famille => {
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
    if (prod.id_produit >= 21) {
      list_element_image.setAttribute('src', image_path + prod.thumb)
    } else {
      list_element_image.setAttribute('src', prod.thumb)
    }    
    list_element_image_div.appendChild(list_element_image)
    list_element.appendChild(list_element_image_div)

    let list_element_titre = document.createElement('div')
    list_element_titre.classList.add('optionslist-element-titre')
    // let titre = splitColorNameProduit(prod.marque, "&nbsp;")
    let titre_blanc = document.createElement('span')
    titre_blanc.classList.add('white')
    // titre_blanc.innerHTML = titre[0]
    titre_blanc.innerHTML = prod.nom+"&nbsp;"
    let titre_gold = document.createElement('span')
    titre_gold.classList.add('gold')
    // titre_gold.innerHTML = titre[1]
    titre_gold.innerHTML = prod.marque
    list_element_titre.appendChild(titre_blanc)
    list_element_titre.appendChild(titre_gold)
    list_element.appendChild(list_element_titre)

    optionslist_body.appendChild(list_element)

  })

  // initFichesProduits
  initProduitPage(id_cat)

  // display options list
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  accueil_main_container.style.display = "none"
  options_main_container.style.display = "none"
  optionslist_main_container.style.display = "block"

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
      // TODO change image path
      if (prod.id_produit >= 21) {
        produitPicture.setAttribute('src', image_path + prod.images[i].image_url)
      } else {
        produitPicture.setAttribute('src', prod.images[i].image_url)
      }
      
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


/* Prestations */
const swiperPresta = new Swiper('.swiperPresta', {
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

function updateFichePresta(prestas) {
  let swiperPresta_wrapper = document.getElementById('swiperPresta-wrapper')
  swiperPresta_wrapper.innerHTML = ''
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

  let group_image_count = Math.max(presta.images.length, presta.images_legende.length)
  for (let i=0; i<group_image_count; i++) {
    let presta_image_group = document.createElement('div')
    presta_image_group.classList.add('presta-image-group')
    let presta_image = document.createElement('img')
    presta_image.classList.add('presta-image')
    presta_image.setAttribute('src', presta.images[i])
    let presta_image_legende = document.createElement('div')
    presta_image_legende.classList.add('presta-image-legende')
    if (presta.images_legende.length >= i+1) {
      presta_image_legende.innerHTML = presta.images_legende[i]
    } else {
      presta_image_legende.innerHTML = ""
    }
    
    
    if (i%2 == 0) {
      presta_image_group.appendChild(presta_image)
      presta_image_group.appendChild(presta_image_legende)
    } else {
      presta_image_group.appendChild(presta_image_legende)
      presta_image_group.appendChild(presta_image)
    }

    modalMain.appendChild(presta_image_group)
  }
  // <div class="presta-image-group">
  //   <img class="presta-image" src="./img/presta/cuisine/cuisine_01.jpg" />
  //   <div class="presta-image-legende">Cuisine type T3</div>
  // </div>

  let modalMainSeparator2 = document.createElement('div')
  modalMainSeparator2.setAttribute('id', 'modal-main-separator')
  modalMainSeparator2.innerHTML = "&nbsp;"
  modalMain.appendChild(modalMainSeparator2)

  let prestaDescriptif = document.createElement('div')
  prestaDescriptif.classList.add('presta-descriptif')
  prestaDescriptif.innerHTML = presta.descriptif
  modalMain.appendChild(prestaDescriptif)

  let modalMainSeparator3 = document.createElement('div')
  modalMainSeparator3.setAttribute('id', 'modal-main-separator')
  modalMainSeparator3.innerHTML = "&nbsp;"
  modalMain.appendChild(modalMainSeparator3)

  let prestaContractuel = document.createElement('div')
  prestaContractuel.classList.add('presta-contractuel')
  prestaContractuel.innerText = presta.contractuel  
  modalMain.appendChild(prestaContractuel)

  fichePresta.appendChild(modalMain)
  swiperSlideSubcontainer.appendChild(fichePresta)
  swiperSlide.appendChild(swiperSlideSubcontainer)

  return swiperSlide
}



/* Divers */
function isCatExistInProductList(id_cat) {
  let retour = false
  json_data.produits.forEach(prod => {
    if (prod.id_categorie == id_cat) retour = true
  })
  return retour
}
function getProduitsFromCategorie(id_cat) {
  liste_produits = [...json_data.produits.reduce((map, value) => (value.id_categorie == id_cat) ? map.set(value.id_produit, value) : map, new Map()).values()]
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

function getPrestasFromIdRubrique(id_presta_rubrique) {
  return_value = []
  liste_prestas.forEach((presta) => {
    if (presta.id_rubrique == id_presta_rubrique) return_value.push(presta)
  })
  return return_value
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


