/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')

/*===== MENU SHOW =====*/
/* Validate if constant exists */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu')
    })
}

/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
    })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll('.nav__link')

const linkAction = () => {
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== SWIPER PROJECTS ===============*/
let swiperProjects = new Swiper(".projects__container", {
    loop: true,
    spaceBetween: 24,

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
    },
    // mousewheel: true,
    // keyboard: true,
    breakpoints: {
        "@0.00": {
            slidesPerView: 1,
            spaceBetween: 20,
        },
        "@0.75": {
            slidesPerView: 1,
            spaceBetween: -56,
        },
        "@1.00": {
            slidesPerView: 2,
            spaceBetween: 150,
        },
        "@1.50": {
            slidesPerView: 2,
            spaceBetween: 200,
        },
    }
});

/*=============== SWIPER Certification ===============*/
let swiperCertification = new Swiper(".certifications__container", {
    grapCursor:true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

/*=============== EMAIL JS ===============*/
const contactForm=document.getElementById('contact-form'),
      contactName=document.getElementById('contact-name'),
      contactEmail=document.getElementById('contact-email'),
      contactProject=document.getElementById('contact-project'),
      contactMessage=document.getElementById('contact-message');

const sendEmail=(e)=>{
    e.preventDefault()

    if (contactName.value==='' || contactEmail.value==='' || contactProject.value ==='') {
        contactMessage.classList.remove('color-blue')
        contactMessage.classList.add('color-red')

        contactMessage.textContent = 'Write all the input fields.'
    }else{
        emailjs.sendForm('serviceID', 'publicApiKey', '#contact-form', '9mDeB9UhRTMZKe_88')
        .then(()=> {
            contactMessage.classList.add('color-blue')
            contactMessage.textContent = 'Message Sent'
            setTimeout(() => {
                contactMessage.textContent=''
            }, 5000)
        }, (error)=>{
            //alert('SOMETHING WENT WRONG...',error)
        })

        contactName.value='';
        contactEmail.value='';
        contactProject.value='';
    }

}

contactForm.addEventListener('submit',sendEmail)

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/


/*=============== SHOW SCROLL UP ===============*/


/*=============== DARK LIGHT THEME ===============*/


/*=============== CHANGE BACKGROUND HEADER ===============*/


/*=============== SCROLL REVEAL ANIMATION ===============*/

