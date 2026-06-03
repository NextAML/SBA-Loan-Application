/*
  FILE: js/calculator.js
  FUNCTION: Contains all the business logic for the app.
            money()             — formats a number as a USD dollar amount
            calculateScore()    — reads the financial inputs, computes a
                                  risk score (0–100), and updates the
                                  Dashboard score number and progress bar
            generateCreditMemo()— reads all form fields across every section,
                                  builds a full bank-style credit memo as HTML,
                                  and injects it into the page
            downloadMemo()      — saves the generated credit memo as a .txt file
*/

function money(n) {
  // Convert any blank or numeric input into a whole-dollar USD string.
  return Number(n || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });
}

function calculateScore() {
  // Read the financial inputs that drive the demo scoring model.
  const revenue = Number(document.getElementById('revenue').value || 0);
  const income = Number(document.getElementById('income').value || 0);
  const debt = Number(document.getElementById('debt').value || 0);
  const bank = Number(document.getElementById('bank').value || 0);
  const years = Number(document.getElementById('years').value || 0);

  // Start from a neutral score, then add points for stronger indicators.
  let score = 50;
  if (revenue > 500000) score += 10;
  if (income > 100000) score += 12;
  if (debt < income) score += 10;
  if (bank > 50000) score += 8;
  if (years >= 2) score += 10;

  // Keep the score inside the demo range shown by the dashboard.
  score = Math.min(95, Math.max(20, score));

  // Push the updated score into the dashboard number and progress bar.
  document.getElementById('dashScore').innerText = score + ' / 100';
  document.getElementById('scoreBar').style.width = score + '%';

  // Give the user immediate feedback after clicking the scoring button.
  alert('Risk score updated to ' + score + ' / 100');
  return score;
}

function generateCreditMemo() {
  // Gather borrower profile values from the borrower information panel.
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const ownership = document.getElementById('ownership').value;

  // Gather business profile values from the business information panel.
  const biz = document.getElementById('bizName').value;
  const industry = document.getElementById('industry').value;
  const years = document.getElementById('years').value;

  // Gather loan request details.
  const program = document.getElementById('program').value;
  const amount = Number(document.getElementById('amount').value || 0);
  const funds = document.getElementById('funds').value;

  // Gather financial values used in both scoring and memo analysis.
  const revenue = Number(document.getElementById('revenue').value || 0);
  const income = Number(document.getElementById('income').value || 0);
  const debt = Number(document.getElementById('debt').value || 0);
  const bank = Number(document.getElementById('bank').value || 0);

  // Recalculate the risk score so the memo always uses the latest inputs.
  const score = calculateScore();

  // Calculate simple underwriting ratios for the memo narrative.
  const debtToIncome = income > 0 ? (debt / income).toFixed(2) + 'x' : 'N/A';
  const margin = revenue > 0 ? ((income / revenue) * 100).toFixed(1) + '%' : 'N/A';

  // Choose a preliminary recommendation based on the demo score band.
  const recommendation = score >= 75
    ? 'Recommend conditional approval subject to final document validation and compliance clearance.'
    : score >= 60
      ? 'Recommend additional underwriting review before approval.'
      : 'Recommend decline or significant credit enhancement due to elevated risk.';

  // Keep dashboard summary fields synchronized with the current loan request.
  document.getElementById('dashProgram').innerText = program;
  document.getElementById('dashAmount').innerText = money(amount);

  // Build the generated credit memo as an HTML string using the entered data.
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

  // Replace the placeholder summary text with the generated memo.
  document.getElementById('summary').innerHTML = memoHTML;

  // Store plain text for the download workflow.
  window.latestMemoText = document.getElementById('memoPaper').innerText;
}

function downloadMemo() {
  // Generate a memo first if the user has not already clicked Generate.
  if (!window.latestMemoText) {
    generateCreditMemo();
  }

  // Create a temporary text file in memory from the latest memo text.
  const blob = new Blob([window.latestMemoText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'generated-credit-memo.txt';

  // Trigger the browser download, then release the temporary object URL.
  link.click();
  URL.revokeObjectURL(link.href);
}
