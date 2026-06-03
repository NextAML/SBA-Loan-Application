/*
  FILE: js/app.js
  FUNCTION: Handles navigation between the 8 sections of the app.
            Contains one function — showSection() — which hides all
            sections, shows only the one the user clicked, and updates
            the active highlight on the sidebar navigation button.
*/

function showSection(id, btn) {
  // Hide every section before revealing the selected one.
  document.querySelectorAll('main section').forEach(section => section.classList.add('hidden'));

  // Show the section whose id was passed from the clicked navigation button.
  document.getElementById(id).classList.remove('hidden');

  // Remove the active highlight from all navigation buttons.
  document.querySelectorAll('nav button').forEach(button => button.classList.remove('active'));

  // Highlight the button that opened the current section.
  btn.classList.add('active');
}
