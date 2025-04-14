console.log('-- DOM loaded')

/* Menu */
let menuItems = document.querySelectorAll('.menu-item')
for (let menuItem of menuItems) {
    menuItem.addEventListener('click', (e) => {
        let target = e.currentTarget
        if (!target.classList.contains('active')) {
            for (let item of menuItems) {
                (item.isEqualNode(target)) ? item.classList.add('active') : item.classList.remove('active')
            }
            let current_id = target.getAttribute('id')
            if ((current_id === "btn1")||(current_id === "btn3")) {
                generateFiche(fiches[0])
            }
            if ((current_id === "btn2")||(current_id === "btn4")) {
                generateFiche(fiches[1])
            }
        }
    })
}


generateFiche(fiches[0])
function generateFiche(data) {

    let fiche = document.createElement('div')
    fiche.classList.add('fiche')

    let titre = document.createElement('h3')
    titre.classList.add('fiche-title')
    titre.innerText = data.titre
    fiche.appendChild(titre)

    let ficheBody = document.createElement('div')
    ficheBody.classList.add('fiche-body')

    let image = document.createElement('img')
    image.setAttribute('src', data.imageURI)
    ficheBody.appendChild(image)

    let sousTitre = document.createElement('h5')
    sousTitre.innerText = data.sousTitre
    ficheBody.appendChild(sousTitre)

    ficheBody.innerHTML += data.bodyHTML

    fiche.appendChild(ficheBody)

    let ficheContainer = document.getElementById('fiche-subcontainer')
    ficheContainer.innerHTML = ""
    ficheContainer.appendChild(fiche)

}

/* #region Produits */


const swiper = new Swiper('.swiper', {
    // Optional parameters
    direction: 'horizontal',
    loop: false,

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
    },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    // And if we need scrollbar
    scrollbar: {
        el: '.swiper-scrollbar',
    },
});


let lienProduitPareBain = document.getElementById('pareBain')
let lienProduitReceveurs = document.getElementById('receveurs')
let lienProduitParoisDouche = document.getElementById('paroisDouche')
let lienProduitPortesDouche = document.getElementById('portesDouche')

lienProduitPareBain.addEventListener('click', (e) => {
    changeFicheProduitPopup(produits_pareBains)
    let lightBoxContainer = document.getElementById('lightbox-container')
    lightBoxContainer.style.display = "block"
    lightBoxContainer.style.display.zIndex = 20
})
lienProduitReceveurs.addEventListener('click', (e) => {
    changeFicheProduitPopup(produits_receveurs)
    let lightBoxContainer = document.getElementById('lightbox-container')
    lightBoxContainer.style.display = "block"
    lightBoxContainer.style.display.zIndex = 20
})
lienProduitParoisDouche.addEventListener('click', (e) => {
    changeFicheProduitPopup(produits_paroisDouche)
    let lightBoxContainer = document.getElementById('lightbox-container')
    lightBoxContainer.style.display = "block"
    lightBoxContainer.style.display.zIndex = 20
})
lienProduitPortesDouche.addEventListener('click', (e) => {
    changeFicheProduitPopup(produits_portesDouche)
    
})



function changeFicheProduitPopup(produits) {
    initFicheProduitsHeader(produits[0].categorie)
    initFicheProduitsListe(produits)
    initListeProduitsListeners()
    changeFicheProduitSwiper(produits)

    let lightBoxContainer = document.getElementById('lightbox-container')
    lightBoxContainer.style.display = "block"
    lightBoxContainer.style.display.zIndex = 20

    let popupProduitListe = document.getElementById('popup-produits-liste')
    let popupProduitsFicheContainer = document.getElementById('popup-produits-fiche-container')
    let popupProduitsBtnRetour = document.getElementById('popup-produits-btn-back')
    popupProduitListe.style.zIndex = 1
    popupProduitListe.style.display = "flex"
    popupProduitsFicheContainer.style.zIndex = 0
    popupProduitsFicheContainer.style.display = "none"
    popupProduitsBtnRetour.style.visibility = "hidden"
}

function initFicheProduitsHeader(name) {
    let produitCategorie = document.getElementById('produit-categorie')
    produitCategorie.innerText = name
}

function initFicheProduitsListe(produits) {
    let popupProduitsListe = document.getElementById('popup-produits-liste')
    popupProduitsListe.innerHTML = ""
    produits.forEach(produit => {
        let popupProduitsListeElement = document.createElement('div')
        popupProduitsListeElement.classList.add('popup-produits-liste-element')
        let imageContainer = document.createElement('div')
        imageContainer.classList.add('image-container')
        let image = document.createElement('img')
        image.setAttribute('src', produit.thumb)
        let titre = document.createElement('div')
        titre.classList.add('titre')
        titre.innerText = produit.marque

        imageContainer.appendChild(image)
        popupProduitsListeElement.appendChild(imageContainer)
        popupProduitsListeElement.appendChild(titre)

        popupProduitsListe.appendChild(popupProduitsListeElement)
    })
}

function changeFicheProduitSwiper(produits) {
    let swiperWrapper = document.getElementById('swiper-wrapper')
    swiperWrapper.innerHTML = ""
    produits.forEach(produit => {
        swiperWrapper.appendChild(createFicheProduit(produit))  
    })
    swiper.update()
}

function createFicheProduit(fiche) {

    let swiperSlide = document.createElement('div')
    swiperSlide.classList.add('swiper-slide')
    let swiperSlideSubcontainer = document.createElement('div')
    swiperSlideSubcontainer.classList.add('swiper-slide-subcontainer')
    let ficheProduit = document.createElement('div')
    ficheProduit.classList.add('fiche-produit')
    let modalMain = document.createElement('div')
    modalMain.classList.add('modal-main')

    let produitMarque = document.createElement('div')
    produitMarque.classList.add('produit-marque')
    produitMarque.innerText = fiche.marque
    let produitNom = document.createElement('div')
    produitNom.classList.add('produit-nom')
    produitNom.innerText = fiche.nom

    modalMain.appendChild(produitMarque)
    modalMain.appendChild(produitNom)
    
    let group_count = Math.max(fiche.descriptifs.length, fiche.images.length)
    for (let i=0; i < group_count; i++) {
        
        let produitGroup = document.createElement('div')
        produitGroup.classList.add('produit-group')

        let produitDescriptif = null
        if (fiche.descriptifs.length > i) {
            produitDescriptif = document.createElement('div')
            produitDescriptif.classList.add('produit-descriptif')
            produitDescriptif.innerHTML = fiche.descriptifs[i]
        }
        
        let produitPicture = null
        if (fiche.images.length > i) {
            produitPicture = document.createElement('img')
            produitPicture.classList.add('produit-picture')
            produitPicture.setAttribute('src', fiche.images[i])
        }

        if (i%2 == 0) {
            if (produitDescriptif !== null) produitGroup.appendChild(produitDescriptif)
            if (produitPicture !== null) produitGroup.appendChild(produitPicture)
        } else {
            if (produitPicture !== null) produitGroup.appendChild(produitPicture)
            if (produitDescriptif !== null) produitGroup.appendChild(produitDescriptif)
        }
        
        modalMain.appendChild(produitGroup)
    }
    
    
    ficheProduit.appendChild(modalMain)
    swiperSlideSubcontainer.appendChild(ficheProduit)
    swiperSlide.appendChild(swiperSlideSubcontainer)
    
    return swiperSlide
}

function initListeProduitsListeners() {
    let lightBoxContainer = document.getElementById('lightbox-container')
    let popupProduitListe = document.getElementById('popup-produits-liste')
    let popupProduitsFicheContainer = document.getElementById('popup-produits-fiche-container')
    let popupProduitsBtnRetour = document.getElementById('popup-produits-btn-back')
    let popupProduitsBtnClose = document.getElementById('popup-produits-btn-close')
    let listeProduitsElements = document.querySelectorAll('.popup-produits-liste-element')

    for (let element of listeProduitsElements) {
        element.addEventListener('click', (e)=> {
            console.log('-- listener produit liste element')
            let element_index = getElementClassIndex(e.currentTarget, 'popup-produits-liste-element')
            swiper.slideTo(element_index, 0, null)
            popupProduitListe.style.zIndex = 0
            popupProduitListe.style.display = "none"
            popupProduitsFicheContainer.style.zIndex = 1
            popupProduitsFicheContainer.style.display = "block"
            popupProduitsBtnRetour.style.visibility = "visible"
        })
    }

    popupProduitsBtnRetour.addEventListener('click', (e) => {
        popupProduitListe.style.zIndex = 1
        popupProduitListe.style.display = "flex"
        popupProduitsFicheContainer.style.zIndex = 0
        popupProduitsFicheContainer.style.display = "none"
        popupProduitsBtnRetour.style.visibility = "hidden"
    })
    
    popupProduitsBtnClose.addEventListener('click', (e) => {
        lightBoxContainer.style.display = "none"
        lightBoxContainer.style.display.zIndex = 0
    })
}

/* #endregion */


/* #region Divers */
function getElementClassIndex(elem, className) {
    let liste = document.getElementsByClassName(className)
    let count = 0
    let result = -1
    for (let listeElem of liste) {
        if (listeElem.isEqualNode(elem)) result = count
        count++
    }
    return result
}
/* #endregion */