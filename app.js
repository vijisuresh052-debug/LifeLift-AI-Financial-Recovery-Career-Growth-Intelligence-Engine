const loginBtn = document.getElementById('loginBtn');
const goDashboardBtn = document.getElementById('goDashboard');
const dashboard = document.getElementById('dashboard');
const finResults = document.getElementById('finResults');
const careerResults = document.getElementById('careerResults');
const simResult = document.getElementById('simResult');
const themeToggle = document.getElementById('themeToggle');
const lifeStabilityEl = document.getElementById('lifeStability');
const financialScoreEl = document.getElementById('financialScore');
const careerScoreEl = document.getElementById('careerScore');
const statusText = document.getElementById('statusText');

const resetAll = () => {
  document.getElementById('totalLoans').value='';
  document.getElementById('totalEmi').value='';
  document.getElementById('monthlyIncome').value='';
  document.getElementById('monthlyExpenses').value='';
  document.getElementById('savings').value='';
  document.getElementById('marks').value='';
  document.getElementById('skillLevel').value='';
  document.getElementById('commLevel').value='';
  document.getElementById('internExp').value='';
  finResults.classList.add('hidden');
  careerResults.classList.add('hidden');
  simResult.classList.add('hidden');
};

goth = (v) => Number(v || 0);

const getDebtStressScore = (loan, emi, income, expenses) => {
  if (income <= 0) return 100;
  const dti = (emi / income) * 100;
  const loanIncomeRatio = (loan / (income*12))*100;
  const score = Math.min(100, Math.max(0, (dti*0.4 + loanIncomeRatio*0.35 + (expenses/income)*100*0.25)));
  return Math.round(score);
};

const getCareerFitScore = (marks, skill, comm, intern) => {
  let base = (marks*0.4 + skill*10*0.3 + comm*10*0.2 + Math.min(intern,12)*1.5)/1.2;
  base = Math.min(100, Math.max(0, base));
  return Math.round(base);
};

const computeFinancialPlan = (loan, emi, income, expenses, savings) => {
  const plan = [];
  const dti = income>0 ? (emi/income)*100 : 100;
  const stress = getDebtStressScore(loan, emi, income, expenses);
  if (stress > 75) plan.push('Critical: Immediate expense reduction + loan consolidation.');
  if (dti > 50) plan.push('EMI >50% income, prioritize high interest debts first (Avalanche).');
  else plan.push('Maintain current EMI and increase surplus with side income.');
  const extraEmi = Math.max(0, (income-expenses-emi-savings)*0.25); 
  if (extraEmi > 0) plan.push(`Use ₹${extraEmi.toFixed(0)} monthly for extra EMI to accelerate repayment.`);
  else plan.push('No extra EMI possible; reduce non-essential spending by 10%.');
  plan.push('Apply Snowball rule by clearing smallest loan first during mental boost.');
  return plan;
};

const computeCareerPlan = (score, skill, comm, marks) => {
  const plan = [];
  if (score < 40) plan.push('Start with foundational courses: Bootcamp, online accreditation.');
  else if (score < 70) plan.push('Join specialized certifications and 2 internships.');
  else plan.push('Target senior roles by building niche projects and leadership experience.');

  if (skill < 6) plan.push('Improve technical skills via 3-month project-based learning.');
  if (comm < 6) plan.push('Communication training: mock interviews & presentation practice.');
  if (marks < 60) plan.push('Focus on core academics and applied problem-solving sessions.');
  return plan;
};

const reportSimulation = (loan, income, careerScore) => {
  const scenario1Yrs = Math.max(3, Math.ceil((loan/100000)/1.2));
  const scenario2Yrs = Math.max(1, Math.ceil((loan/100000)/(1.8 + careerScore/100)));
  const text1 = `Scenario 1 (no skill growth): debt clearance ~${scenario1Yrs} years at current income.`;
  const text2 = `Scenario 2 (skill growth): debt clearance ~${scenario2Yrs} years if income improves 20-35%.`;
  return [text1, text2];
};

const showDashboard = () => {
  document.getElementById('login').classList.add('hidden');
  dashboard.classList.remove('hidden');
  statusText.textContent = 'Fill financial and career fields to get your plan.';
};

goDashboardBtn.addEventListener('click', showDashboard);
loginBtn.addEventListener('click', () => {
  const uname = document.getElementById('userName').value.trim();
  const uemail = document.getElementById('userEmail').value.trim();
  if (!uname || !uemail) {
    alert('Please fill name and email.');
    return;
  }
  showDashboard();
});

document.getElementById('calcFinBtn').addEventListener('click', () => {
  const loan = goth(document.getElementById('totalLoans').value);
  const emi = goth(document.getElementById('totalEmi').value);
  const income = goth(document.getElementById('monthlyIncome').value);
  const expenses = goth(document.getElementById('monthlyExpenses').value);
  const savings = goth(document.getElementById('savings').value);

  const finScore = 100 - getDebtStressScore(loan, emi, income, expenses);
  financialScoreEl.textContent = `${Math.max(0, Math.round(finScore))}/100`;

  const lifeScore = Math.round((finScore*0.6 + 50)/1.1);
  lifeStabilityEl.textContent = `${lifeScore}/100`;

  const plan = computeFinancialPlan(loan, emi, income, expenses, savings);
  const finPlanEl = document.getElementById('finPlan');
  finPlanEl.innerHTML = plan.map(i=>`<li>${i}</li>`).join('');

  finResults.classList.remove('hidden');
  updateSimulation();
});

const updateSimulation = () => {
  const loan = goth(document.getElementById('totalLoans').value);
  const income = goth(document.getElementById('monthlyIncome').value);
  const careerScore = goth(careerScoreEl.textContent) || 40;
  if (!loan || !income) return;
  const [s1,s2] = reportSimulation(loan, income, careerScore);
  document.getElementById('scenario1').textContent = s1;
  document.getElementById('scenario2').textContent = s2;
  simResult.classList.remove('hidden');
};

document.getElementById('calcCareerBtn').addEventListener('click', () => {
  const marks = goth(document.getElementById('marks').value);
  const skill = goth(document.getElementById('skillLevel').value);
  const comm = goth(document.getElementById('commLevel').value);
  const intern = goth(document.getElementById('internExp').value);

  const cScore = getCareerFitScore(marks, skill, comm, intern);
  careerScoreEl.textContent = `${cScore}/100`;

  const plans = computeCareerPlan(cScore, skill, comm, marks);
  document.getElementById('careerPlan').innerHTML = plans.map(i=>`<li>${i}</li>`).join('');
  careerResults.classList.remove('hidden');

  updateSimulation();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  resetAll();
  financialScoreEl.textContent='-'; careerScoreEl.textContent='-'; lifeStabilityEl.textContent='-';
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  if (document.body.classList.contains('light')) {
    document.body.style.background='linear-gradient(120deg,#e6eeff 0%,#e2ccff 100%)';
    document.body.style.color='#10225a';
    themeToggle.textContent='🌞';
  } else {
    document.body.style.background='linear-gradient(120deg,#0d142e 0%,#11194e 100%)';
    document.body.style.color='#edf2ff';
    themeToggle.textContent='🌙';
  }
});