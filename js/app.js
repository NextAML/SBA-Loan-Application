/*
  FILE: js/app.js
  FUNCTION: Handles navigation between the 8 sections of the app.
            Contains one function — showSection() — which hides all
            sections, shows only the one the user clicked, and updates
            the active highlight on the sidebar navigation button.
*/

function showSection(id, btn) {
  /*
    STEP 1 — Hide all sections.
    querySelectorAll('main section') finds every <section> inside <main>.
    forEach loops through each one and adds the "hidden" class.
    "hidden" in styles.css sets display:none — completely removes it from view.
    This clears whatever section was previously visible before showing the new one.
  */
  document.querySelectorAll('main section').forEach(section => section.classList.add('hidden'));

  /*
    STEP 2 — Show only the target section.
    getElementById(id) finds the one <section> whose id matches
    the argument passed in — e.g. 'dashboard', 'borrower', 'financials'.
    classList.remove('hidden') removes the display:none so it becomes visible.
  */
  document.getElementById(id).classList.remove('hidden');

  /*
    STEP 3 — Remove the blue highlight from all nav buttons.
    querySelectorAll('nav button') finds all 8 buttons in the sidebar.
    forEach removes the "active" class from every one of them.
    This resets all buttons to their default unselected appearance.
  */
  document.querySelectorAll('nav button').forEach(button => button.classList.remove('active'));

  /*
    STEP 4 — Highlight the button that was just clicked.
    btn is the button element passed in via "this" from index.html.
    Adding "active" applies the blue background and blue text
    defined in styles.css under "nav button.active".
    This tells the user which section they are currently viewing.
  */
  btn.classList.add('active');
}
