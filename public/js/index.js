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

let lightBoxContainer = document.getElementById('lightbox-container')
let popupProduitListe = document.getElementById('popup-produits-liste')
let popupProduitsFicheContainer = document.getElementById('popup-produits-fiche-container')
let listeProduitsElements = document.querySelectorAll('.popup-produits-liste-element')
let popupProduitsBtnRetour = document.getElementById('popup-produits-btn-back')
let popupProduitsBtnClose = document.getElementById('popup-produits-btn-close')

for (let element of listeProduitsElements) {

    element.addEventListener('click', (e)=> {
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