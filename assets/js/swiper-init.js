(function() {
  if (typeof Swiper === 'undefined') {
    return false;
  }

  new Swiper('.swiper-container', {
    navigation: {
      nextEl: '.swiper-next',
      prevEl: '.swiper-prev',
      disabledClass: 'swiper-disabled',
    },

    slidesPerView: 'auto',
    spaceBetween: 12,
    slidesOffsetAfter: 12,
    slidesOffsetBefore: 12,

    breakpoints: {
      768: {
        slidesOffsetAfter: 24,
        slidesOffsetBefore: 24,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
        slidesOffsetAfter: 0,
        slidesOffsetBefore: 0
      }
    }
  });
})();