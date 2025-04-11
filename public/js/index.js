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

