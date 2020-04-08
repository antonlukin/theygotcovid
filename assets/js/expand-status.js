(function () {
  /**
   * Get all unit status
   */
  var status = document.querySelectorAll('.unit-status');

  if (status === null) {
      return false;
  }

  for (var i = 0; i < status.length; i++) {
    // Add class to first element
    if (i === 0) {
      status[i].classList.add('unit-expand');
    }

    status[i].addEventListener('click', function (e) {
      e.preventDefault();

      // Toggle class on click
      this.classList.toggle('unit-expand');
    });
  }
})();