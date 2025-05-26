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

let liste_li = document.getElementsByTagName('li')
for (var li of liste_li) {
  li.addEventListener('click', (e) => {
    let accueil_main_container = document.getElementById('accueil-main-container')
    let options_main_container = document.getElementById('options-main-container')
    let optionslist_main_container = document.getElementById('optionslist-main-container')
    accueil_main_container.style.display = "none"
    options_main_container.style.display = "none"
    optionslist_main_container.style.display = "block"
  })
}

let optionslist_close_btn = document.getElementById('optionslist-close-btn')
optionslist_close_btn.addEventListener('click', (e) => {
  let accueil_main_container = document.getElementById('accueil-main-container')
  let options_main_container = document.getElementById('options-main-container')
  let optionslist_main_container = document.getElementById('optionslist-main-container')
  accueil_main_container.style.display = "none"
  options_main_container.style.display = "block"
  optionslist_main_container.style.display = "none"
})

let optionslist_elements = document.getElementsByClassName('optionslist-element')
for(element of optionslist_elements) {
  element.addEventListener('click', (e) => {
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


const swiper = new Swiper('.swiper', {
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







