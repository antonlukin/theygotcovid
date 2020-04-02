(function() {
  return new Swiper('.swiper-container', {
    navigation: {
      nextEl: '.swiper-next',
      prevEl: '.swiper-prev',
      disabledClass: 'swiper-disabled',
    },

    slidesPerView: 'auto',
    spaceBetween: 15,

    breakpoints: {
      1024: {
        slidesPerView: 3,
        spaceBetween: 25,
      },
    }
  });
})();