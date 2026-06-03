/*
  FILE: js/calculator.js
  FUNCTION: Contains all the business logic for the app.
            money()              — formats a number as a USD dollar amount
            calculateScore()     — reads the financial inputs, computes a
                                   risk score (0–100), and updates the
                                   Dashboard score number and progress bar
            generateCreditMemo() — reads all form fields across every section,
                                   builds a full bank-style credit memo as HTML,
                                   and injects it into the page
            downloadMemo()       — saves the generated credit memo as a .txt file
 
  HOW THESE FUNCTIONS CONNECT TO index.html:
    calculateScore()     is called by the "Calculate Risk Score" button in Financials section
    generateCreditMemo() is called by the "Generate Credit Memo" button in Underwriting section
    downloadMemo()       is called by the "Download Memo as Text" button in Underwriting section
 
  DEPENDENCY:
    generateCreditMemo() calls showSection() which is defined in app.js.
    That is why index.html loads app.js BEFORE this file.
*/




/*
  ─────────────────────────────────────────────
  FUNCTION 1: money(n)
  PURPOSE: Converts a plain number into a formatted US dollar string.
 
  EXAMPLES:
    money(250000)  → "$250,000"
    money(1500000) → "$1,500,000"
    money(0)       → "$0"
    money(null)    → "$0"   ← the || 0 handles empty or missing values safely
 
  HOW IT WORKS:
    Number(n || 0)    → converts the input to a number, defaulting to 0 if blank
    .toLocaleString() → built-in JS method that formats numbers by locale
    style: 'currency' → adds the $ symbol
    currency: 'USD'   → specifies US dollars
    maximumFractionDigits: 0 → no cents shown (whole dollars only)
 
  USED BY: generateCreditMemo() to display all dollar amounts in the memo
  ─────────────────────────────────────────────
*/

function money(n) {
  // Convert any blank or numeric input into a whole-dollar USD string.
  return Number(n || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });
}





/*
  ─────────────────────────────────────────────
  FUNCTION 2: calculateScore()
  PURPOSE: Reads 5 financial inputs from the form, runs them through
           a simple scoring model, and updates the Dashboard with the result.
 
  SCORING MODEL — starts at 50, adds points for each positive indicator:
    revenue > $500,000  → +10 points  (strong annual revenue)
    income  > $100,000  → +12 points  (healthy net profit)
    debt    < income    → +10 points  (debt is manageable vs earnings)
    bank    > $50,000   →  +8 points  (good cash reserves)
    years   >= 2        → +10 points  (established business)
    Maximum possible score: 50 + 10 + 12 + 10 + 8 + 10 = 100
    Clamped range: 20 minimum, 95 maximum (real loans never score 0 or 100)
 
  WHAT IT UPDATES ON THE PAGE:
    id="dashScore"  → text content, e.g. "90 / 100"
    id="scoreBar"   → inline style width, e.g. style="width: 90%"
 
  CALLED BY:
    "Calculate Risk Score" button in the Financials section (index.html)
    generateCreditMemo() — automatically re-scores before building the memo
 
  RETURNS: the numeric score so generateCreditMemo() can use it
  ─────────────────────────────────────────────
*/
function calculateScore() {
  /*
    Read all 5 input field values from the form.
    document.getElementById('revenue').value returns a string — e.g. "950000"
    Number(...) converts it to an actual number so math works correctly.
    || 0 means: if the field is empty or blank, treat it as zero.
  */
  const revenue = Number(document.getElementById('revenue').value || 0);
  const income = Number(document.getElementById('income').value || 0);
  const debt = Number(document.getElementById('debt').value || 0);
  const bank = Number(document.getElementById('bank').value || 0);
  const years = Number(document.getElementById('years').value || 0);

  /*
    Start at a neutral baseline score of 50.
    Then add points for each positive financial indicator.
    Each if() checks one condition — if true, score goes up.
  */
  let score = 50;
  if (revenue > 500000) score += 10;
  if (income > 100000) score += 12;
  if (debt < income) score += 10;
  if (bank > 50000) score += 8;
  if (years >= 2) score += 10;

  /*
    Clamp the score so it never goes below 20 or above 95.
    Math.max(20, score) → if score is less than 20, return 20
    Math.min(95, ...)   → if score is more than 95, return 95
    This keeps the demo score in a realistic lending range.
  */
  score = Math.min(95, Math.max(20, score));

  /*
    Update the Dashboard Risk Score metric card.
    dashScore is the <strong> element showing the score number text.
    scoreBar is the <div> inside the progress bar track.
    Setting its width as a percentage visually fills the bar.
  */
  document.getElementById('dashScore').innerText = score + ' / 100';
  document.getElementById('scoreBar').style.width = score + '%';

  /*
    Show a popup alert so the user gets instant feedback
    that the score was recalculated after they clicked the button.
  */
  alert('Risk score updated to ' + score + ' / 100');

    /*
    Return the numeric score so generateCreditMemo() can read it
    without having to recalculate or re-read the DOM separately.
  */
  return score;
}







/*
  ─────────────────────────────────────────────
  FUNCTION 3: generateCreditMemo()
  PURPOSE: Reads all form inputs across all sections, calculates
           derived financial metrics, then builds and injects a
           full bank-style credit memo as HTML into the page.
 
  DATA IT READS (all from input fields in index.html):
    Borrower section  → name, email, ownership
    Business section  → bizName, industry, years
    Loan section      → program, amount, funds
    Financials section→ revenue, income, debt, bank
 
  WHAT IT CALCULATES:
    score        → calls calculateScore() for the risk score
    debtToIncome → debt ÷ income ratio (e.g. "0.55x")
    margin       → net income ÷ revenue as a percentage (e.g. "15.3%")
    recommendation → text based on score threshold (approve / review / decline)
 
  WHAT IT UPDATES ON THE PAGE:
    id="dashProgram" → loan program name on the Dashboard card
    id="dashAmount"  → formatted loan amount on the Dashboard card
    id="summary"     → replaced with the full credit memo HTML
 
  ALSO STORES:
    window.latestMemoText → plain text version of the memo
    used by downloadMemo() to create the .txt file download
 
  CALLED BY:
    "Generate Credit Memo" button in the Underwriting section (index.html)
  ─────────────────────────────────────────────
*/
function generateCreditMemo() {
  /*
    STEP 1 — Read all form values from index.html.
    .value returns the current text or selected option in each field.
    These variables are used to fill in every part of the memo below.
  */

  // Borrower information panel
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const ownership = document.getElementById('ownership').value;

  // Business information panel
  const biz = document.getElementById('bizName').value;
  const industry = document.getElementById('industry').value;
  const years = document.getElementById('years').value;

  // Loan request panel
  const program = document.getElementById('program').value;
  const amount = Number(document.getElementById('amount').value || 0);
  const funds = document.getElementById('funds').value;

  // Financial information panel
  const revenue = Number(document.getElementById('revenue').value || 0);
  const income = Number(document.getElementById('income').value || 0);
  const debt = Number(document.getElementById('debt').value || 0);
  const bank = Number(document.getElementById('bank').value || 0);


  
  /*
    STEP 2 — Calculate derived metrics from the raw inputs.
  */
 
  /*
    Re-run the risk score using the latest form values.
    This ensures the memo always reflects the most current inputs
    even if the user changed a field after last clicking Calculate.
    calculateScore() also updates the Dashboard score and progress bar.
  */
  const score = calculateScore();

  /*
    Debt-to-income ratio: how much debt relative to net income.
    Format: "0.55x" — e.g. debt of $80k / income of $145k = 0.55x
    If income is 0, show "N/A" to avoid a divide-by-zero error.
  */
  const debtToIncome = income > 0 ? (debt / income).toFixed(2) + 'x' : 'N/A';
  /*
    Net profit margin: what percentage of revenue becomes profit.
    Format: "15.3%" — e.g. income $145k / revenue $950k = 15.3%
    If revenue is 0, show "N/A" to avoid a divide-by-zero error.
  */
  const margin = revenue > 0 ? ((income / revenue) * 100).toFixed(1) + '%' : 'N/A';

  /*
    Preliminary recommendation based on score thresholds.
    score >= 75  → conditional approval
    score >= 60  → needs more review
    score < 60   → decline or require credit enhancement
    This appears as the final conclusion at the bottom of the memo.
  */
  const recommendation = score >= 75
    ? 'Recommend conditional approval subject to final document validation and compliance clearance.'
    : score >= 60
      ? 'Recommend additional underwriting review before approval.'
      : 'Recommend decline or significant credit enhancement due to elevated risk.';

  /*
    STEP 3 — Sync the Dashboard metric cards with the current loan request.
    This keeps the Dashboard updated even if the user changed
    the program or amount after the page first loaded.
  */
  document.getElementById('dashProgram').innerText = program;
  document.getElementById('dashAmount').innerText = money(amount);

  /*
    STEP 4 — Build the credit memo as an HTML string.
    Uses a template literal (backtick string) so variables can be
    embedded directly using ${variableName} syntax.
    new Date().toLocaleDateString() automatically inserts today's date.
    money(amount) formats the dollar amount with $ and commas.
    The entire string is one large block of HTML tables and paragraphs
    that make up the formal credit memo document.
  */
  const memoHTML = `
      <div class="memo-paper" id="memoPaper">
        <h1 class="memo-title">Credit Memo</h1>

        <table>
          <tr><th>Application Type</th><th>Date</th><th>Approval Authority</th></tr>
          <tr><td>New SBA Loan Request</td><td>${new Date().toLocaleDateString()}</td><td>Credit Committee / SBA Lending Officer</td></tr>
        </table>

        <h2>Overview</h2>
        <table>
          <tr><th>Borrower</th><td>${biz}</td><th>Primary Contact</th><td>${name}</td></tr>
          <tr><th>Email</th><td>${email}</td><th>Ownership</th><td>${ownership}%</td></tr>
          <tr><th>Loan Program</th><td>${program}</td><th>Requested Amount</th><td>${money(amount)}</td></tr>
          <tr><th>Purpose</th><td>${funds}</td><th>Industry</th><td>${industry}</td></tr>
          <tr><th>Years in Business</th><td>${years}</td><th>Demo Risk Score</th><td>${score}/100</td></tr>
          <tr><th>KYC Status</th><td>No issue - demo status</td><th>OFAC / Sanctions</th><td>Screening required before approval</td></tr>
        </table>

        <h2>Executive Summary</h2>
        <p>${biz}, hereafter “the Applicant” or “the Borrower,” has requested a ${program} facility in the amount of ${money(amount)}. The purpose of the subject credit facility is to support ${funds.toLowerCase()} needs. The application has been reviewed using borrower-provided business, ownership, financial, and compliance information entered into the demo SBA loan application platform.</p>
        <p>The borrower reports annual revenue of ${money(revenue)}, net income of ${money(income)}, existing business debt of ${money(debt)}, and average bank balance of ${money(bank)}. Based on the demo scoring model, the borrower receives a preliminary risk score of ${score}/100.</p>

        <h2>Summary Terms and Conditions</h2>
        <table>
          <tr><th>Facility Type</th><td>${program}</td></tr>
          <tr><th>Facility Amount</th><td>${money(amount)}</td></tr>
          <tr><th>Purpose</th><td>${funds}</td></tr>
          <tr><th>Repayment Source</th><td>Primary repayment source: operating cash flow of the business. Secondary source: owner support, collateral, or guarantor support if required.</td></tr>
          <tr><th>Collateral</th><td>To be determined based on SBA/lender requirements and final underwriting.</td></tr>
          <tr><th>Conditions</th><td>Final tax returns, bank statements, financial statements, KYC/CIP, OFAC screening, beneficial ownership verification, and SBA eligibility review.</td></tr>
        </table>

        <h2>Business & Financial Analysis</h2>
        <p>The borrower operates in the ${industry} sector and has been in business for approximately ${years} year(s). Revenue and income information entered into the platform indicate a net profit margin of ${margin}. Existing debt compared to net income is approximately ${debtToIncome}. These metrics should be validated against tax returns, bank statements, P&amp;L statements, balance sheet, and credit bureau data.</p>

        <h2>Strengths</h2>
        <ul>
          <li>Borrower has provided a complete business and ownership profile for initial SBA screening.</li>
          <li>Reported annual revenue of ${money(revenue)} supports further cash-flow analysis.</li>
          <li>Reported average bank balance of ${money(bank)} may support liquidity, subject to verification.</li>
          <li>Application includes compliance categories such as KYC, OFAC, beneficial ownership, and document validation.</li>
        </ul>

        <h2>Weaknesses / Risks and Mitigants</h2>
        <table>
          <tr><th>Risk</th><th>Mitigant / Required Action</th></tr>
          <tr><td>Financial data is borrower-entered and not yet verified.</td><td>Validate against tax returns, bank statements, P&amp;L, balance sheet, and debt schedule.</td></tr>
          <tr><td>Existing debt level may pressure repayment capacity.</td><td>Calculate DSCR using verified EBITDA/cash flow and confirm repayment source.</td></tr>
          <tr><td>Compliance review is not final.</td><td>Complete CIP/KYC, OFAC, beneficial ownership, fraud, and adverse media checks.</td></tr>
          <tr><td>SBA eligibility is not final.</td><td>Confirm use of proceeds, ownership, business size, industry eligibility, and SBA certifications.</td></tr>
        </table>

        <h2>Compliance Review</h2>
        <table>
          <tr><th>Control</th><th>Status</th></tr>
          <tr><td>CIP / KYC</td><td>Required before approval</td></tr>
          <tr><td>OFAC / Sanctions Screening</td><td>Required before approval</td></tr>
          <tr><td>Beneficial Ownership</td><td>Required for owners meeting applicable threshold</td></tr>
          <tr><td>Fraud / Adverse Media</td><td>Pending review</td></tr>
          <tr><td>SBA Eligibility</td><td>Pending final certification</td></tr>
        </table>

        <h2>Preliminary Recommendation</h2>
        <p><strong>${recommendation}</strong></p>
        <p>This memo is system-generated for demo purposes and should be reviewed by a credit analyst before any lending decision.</p>
      </div>`;

  /*
    STEP 5 — Inject the memo HTML into the page.
    getElementById('summary') finds the output container div.
    innerHTML replaces everything inside it with the memo HTML string.
    The dark placeholder text disappears and the white memo document appears.
  */
  document.getElementById('summary').innerHTML = memoHTML;

  /*
    STEP 6 — Save a plain text copy for the download function.
    innerText extracts all visible text from the memo (no HTML tags).
    Stored on window so downloadMemo() can access it from anywhere.
  */
  window.latestMemoText = document.getElementById('memoPaper').innerText;
}


/*
  ─────────────────────────────────────────────
  FUNCTION 4: downloadMemo()
  PURPOSE: Saves the generated credit memo as a plain .txt file
           that the user can download to their computer.
 
  HOW IT WORKS:
    1. If no memo has been generated yet, auto-generate one first.
    2. Create a Blob — a temporary file object held in browser memory.
    3. Create a temporary invisible <a> link pointing to that Blob.
    4. Programmatically click the link to trigger the browser download dialog.
    5. Release the temporary Blob URL from memory to avoid memory leaks.
 
  OUTPUT FILE NAME: generated-credit-memo.txt
 
  CALLED BY:
    "Download Memo as Text" button in the Underwriting section (index.html)
  ─────────────────────────────────────────────
*/
function downloadMemo() {
  /*
    If the user clicks Download before clicking Generate,
    auto-generate the memo first so there is content to download.
    window.latestMemoText is set by generateCreditMemo() — if it
    does not exist yet, the memo has not been generated.
  */
  if (!window.latestMemoText) {
    generateCreditMemo();
  }

  /*
    Create a Blob — a temporary in-memory file object.
    The first argument is an array containing the text content.
    type: 'text/plain' tells the browser this is a plain text file.
  */
  const blob = new Blob([window.latestMemoText], { type: 'text/plain' });
  /*
    Create an invisible <a> anchor element.
    URL.createObjectURL(blob) generates a temporary URL pointing
    to the Blob in memory — something like blob:https://...
    link.download sets the filename the browser will save it as.
  */
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'generated-credit-memo.txt';

  /*
    Programmatically click the link to trigger the browser's
    file download — same as if the user clicked a download link.
    Then immediately release the temporary Blob URL from memory
    using revokeObjectURL to prevent memory leaks.
  */
  link.click();
  URL.revokeObjectURL(link.href);
}
