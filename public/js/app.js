'use strict';

// Reveals the form when the user wants to add a book to the database
function revealForm(event) {
  const clickedOn = event.target;
  if (event.target.textContent === 'Select this Book') {
    $(clickedOn).parent().find('form').removeClass('hidden');
  }
}

// Hides the form when the user decides not to add a book to the database
function hideForm(event) {
  event.preventDefault();
  const clickedOn = event.target;
  if (event.target.textContent === 'Hide Form') {
    $(clickedOn).parent().addClass('hidden');
  }
}

$('.show-add-form').on('click', (event) => {
  revealForm(event);
  hideForm(event);
});

