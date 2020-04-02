(function () {
  var form = document.querySelector('.form');

  if (form === null) {
    return false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var request = new XMLHttpRequest();
    request.open('POST', '/suggest/');
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.setRequestHeader('Content-type', 'application/json');

    // Set button status
    var button = form.querySelector('.form-button');
    button.setAttribute('disabled', 'disabled');
    button.textContent = 'Sending…';

    var fields = {};

    request.onload = function () {
      if (request.status === 200) {
        var response = JSON.parse(request.responseText);

        if (response.success) {
          button.textContent = 'Successfully sent';

          return form.reset();
        }
      }

      button.textContent = 'Error. Try later';
    }

    var formData = new FormData(form);

    formData.forEach(function (value, key) {
      fields[key] = value;
    });

    request.send(JSON.stringify(fields));
  });
})();