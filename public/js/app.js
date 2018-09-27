'use strict';

function unHide(event) {
  event.preventDefault();
  const clickedOn = event.target;
  if (event.target.textContent === 'Select this Book') {
    $(clickedOn).parent().find('form').removeClass('hidden');
  }
}

$('.show-add-form').on('click', unHide);
