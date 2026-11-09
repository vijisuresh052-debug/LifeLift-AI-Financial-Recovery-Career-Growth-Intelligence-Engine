import { useMemo, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import './App.css';

const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));

const calcDebtStress = ({ loan, emi, income, expenses }) => {
  if (income <= 0) return 100;
  const dti = (emi / income) * 100;
  const loanIncome = (loan / (income * 12)) * 100;
  return clamp(Math.round(dti * 0.4 + loanIncome * 0.35 + (expenses / income) * 100 * 0.25));
};

const calcCareerScore = ({ marks, skill, comm, intern }) => {
  const base = (marks * 0.4 + skill * 10 * 0.3 + comm * 10 * 0.2 + Math.min(intern, 12) * 1.5) / 1.2;
  return clamp(Math.round(base));
};

const translations = {
  en: {
    heroTitle: 'LifeLift AI – Financial Recovery & Career Growth',
    heroSubtitle: 'Build skills. Clear debt. Secure future.',
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    finance: 'Finance',
    career: 'Career',
    ai: 'AI',
    financialScore: 'Financial Score',
    careerScore: 'Career Score',
    lifeStability: 'Life Stability',
    multiLoan: 'Multi-Loan Management',
    addLoan: 'Add Loan',
    amount: 'Amount',
    rate: 'Rate (%)',
    emi: 'EMI',
    resources: 'Education + Financial Resources',
    addResource: 'Add Resource',
    language: 'Language'
  },
  ta: {
    heroTitle: 'லைப்லிப்ட் AI – நிதி மீட்பு & தொழில் வளர்ச்சி',
    heroSubtitle: 'திறன்களை வளர்த்துக் கொள். கடனை தீர்த்து. எதிர்காலத்தைக் காக்க.',
    login: 'உள்நுழைக',
    logout: 'வெளியேறு',
    dashboard: 'டாஷ்போர்டு',
    finance: 'நிதி',
    career: 'தொழில்',
    ai: 'AI',
    financialScore: 'நிதி மதிப்பெண்',
    careerScore: 'தொழில் மதிப்பெண்',
    lifeStability: 'வாழ்க்கை நிலைத்தன்மை',
    multiLoan: 'பல கடன் நிர்வாகம்',
    addLoan: 'கடன் சேர்க்க',
    amount: 'தொகை',
    rate: 'வட்டி (%)',
    emi: 'EMI',
    resources: 'கல்வி + நிதி வளங்கள்',
    addResource: 'வளம் சேர்க்க',
    language: 'மொழி'
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const t = (key) => translations[lang][key] || key;

  const [user, setUser] = useState({ name: '', email: '', role: 'student' });
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [fin, setFin] = useState({ loan: 0, emi: 0, income: 0, expenses: 0, savings: 0 });
  const [loans, setLoans] = useState([{ id: 1, amount: 0, rate: 8.5, emi: 0 }]);
  const [career, setCareer] = useState({ marks: 0, skill: 1, comm: 1, intern: 0 });
  const [remoteAdvice, setRemoteAdvice] = useState(null);
  const [resourceList, setResourceList] = useState([
    { title: 'RBI Financial Literacy', url: 'https://rbi.org.in', type: 'Official' }
  ]);
  const [newResource, setNewResource] = useState({ title: '', url: '', type: '' });

  const totals = useMemo(() => {
    const totalLoan = loans.reduce((acc, row) => acc + Number(row.amount || 0), 0);
    const totalEmi = loans.reduce((acc, row) => acc + Number(row.emi || 0), 0);
    return { totalLoan, totalEmi };
  }, [loans]);

  const finOutbound = useMemo(() => ({ ...fin, loan: totals.totalLoan, emi: totals.totalEmi }), [fin, totals]);

  const debtStress = useMemo(() => calcDebtStress(finOutbound), [finOutbound]);
  const finScore = 100 - debtStress;
  const careerScore = useMemo(() => calcCareerScore(career), [career]);
  const lifeScore = clamp(Math.round((finScore * 0.6 + careerScore * 0.4) / 1.1));

  const simulate = useMemo(() => {
    const baseLoan = Math.max(1, finOutbound.loan / 100000);
    const s1 = Math.max(2, Math.ceil(baseLoan / 1.2));
    const s2 = Math.max(1, Math.ceil(baseLoan / (1.8 + careerScore / 100)));
    const out = [];
    for (let y = 0; y <= Math.max(s1, s2); y++) {
      out.push({
        year: y,
        noGrowth: Math.max(0, Math.round(Math.max(finOutbound.loan - (y * 100000) / 2, 0))),
        growth: Math.max(0, Math.round(Math.max(finOutbound.loan - (y * 100000) * 0.95, 0)))
      });
    }
    return { noGrowth: s1, growth: s2, graphData: out };
  }, [finOutbound, careerScore]);

  const addLoanRow = () => {
    setLoans((prev) => [...prev, { id: Date.now(), amount: 0, rate: 8.5, emi: 0 }]);
  };

  const updateLoanRow = (id, key, value) => {
    setLoans((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const removeLoanRow = (id) => {
    setLoans((prev) => prev.filter((row) => row.id !== id));
  };

  const performLogin = async () => {
    try {
      const response = await axios.post('/api/auth/login', { email: user.email, name: user.name, role: user.role });
      setToken(response.data.token);
      setLoggedIn(true);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const addResource = () => {
    if (!newResource.title || !newResource.url) return;
    setResourceList((prev) => [...prev, { ...newResource }]);
    setNewResource({ title: '', url: '', type: '' });
  };

  const requestOpenAI = async () => {
    if (!token) {
      alert('Please login to call AI API');
      return;
    }

    try {
      const response = await axios.post('/api/recommendations', {
        financial: finOutbound,
        career,
        context: `User name: ${user.name}, role: ${user.role}`
      }, { headers: { Authorization: `Bearer ${token}` }});
      setRemoteAdvice(response.data);
    } catch (error) {
      console.error(error);
      setRemoteAdvice({ error: 'Unable to fetch AI guidance. Start server and set OPENAI_API_KEY.' });
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>LifeLift AI</h1>
        <nav>
          <a href="#dashboard">{t('dashboard')}</a>
          <a href="#finance">{t('finance')}</a>
          <a href="#career">{t('career')}</a>
          <a href="#ai">{t('ai')}</a>
          <a href="#resources">{t('resources')}</a>
        </nav>
        <div className="lang-toggle">
          <label>{t('language')}:</label>
          <button onClick={() => setLang((p) => (p === 'en' ? 'ta' : 'en'))}>{lang.toUpperCase()}</button>
        </div>
      </header>

      <section id="hero" className="panel hero">
        <h2>{t('heroTitle')}</h2>
        <p>{t('heroSubtitle')}</p>
        {!loggedIn ? (
          <div className="login-box">
            <input placeholder="Name" value={user.name} onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))} />
            <input placeholder="Email" value={user.email} onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))} />
            <select value={user.role} onChange={(e) => setUser((u) => ({ ...u, role: e.target.value }))}>
              <option value="student">Student</option>
              <option value="professional">Working Professional</option>
            </select>
            <button onClick={performLogin}>{t('login')}</button>
          </div>
        ) : (
          <div className="logged-in-user">
            <p>
              {user.name} ({user.role})
            </p>
            <button onClick={() => { setLoggedIn(false); setToken(''); }}>{t('logout')}</button>
          </div>
        )}
      </section>

      <section id="dashboard" className="panel">
        <h3>{t('dashboard')}</h3>
        <div className="grid3">
          <div className="card">{t('financialScore')}: {finScore}/100</div>
          <div className="card">{t('careerScore')}: {careerScore}/100</div>
          <div className="card">{t('lifeStability')}: {lifeScore}/100</div>
        </div>
      </section>

      <section id="finance" className="panel">
        <h3>{t('financialScore')} & {t('multiLoan')}</h3>
        <div className="operations">
          <button onClick={addLoanRow}>{t('addLoan')}</button>
        </div>
        <div className="loan-grid">
          <div className="grid-row header">
            <span>{t('amount')}</span>
            <span>{t('rate')}</span>
            <span>{t('emi')}</span>
            <span>Actions</span>
          </div>
          {loans.map((row) => (
            <div key={row.id} className="grid-row">
              <input type="number" value={row.amount} onChange={(e) => updateLoanRow(row.id, 'amount', Number(e.target.value))} />
              <input type="number" value={row.rate} onChange={(e) => updateLoanRow(row.id, 'rate', Number(e.target.value))} />
              <input type="number" value={row.emi} onChange={(e) => updateLoanRow(row.id, 'emi', Number(e.target.value))} />
              <button onClick={() => removeLoanRow(row.id)}>Remove</button>
            </div>
          ))}
        </div>

        <h4>Total Loan: ₹{totals.totalLoan}</h4>
        <h4>Total EMI: ₹{totals.totalEmi}</h4>
        <div className="list">
          <div className="item">Debt-to-Income Ratio: {finOutbound.income ? ((finOutbound.emi / finOutbound.income) * 100).toFixed(1) : 0}%</div>
          <div className="item">Debt Stress Score: {debtStress}%</div>
          <div className="item">Debt-Free Timeline Without Growth: {simulate.noGrowth} years</div>
          <div className="item">Debt-Free Timeline With Growth: {simulate.growth} years</div>
        </div>

        <div className="chart-box">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={simulate.graphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4f5f93" />
              <XAxis dataKey="year" stroke="#c6d2ff" />
              <YAxis stroke="#c6d2ff" />
              <Tooltip />
              <Line type="monotone" dataKey="noGrowth" stroke="#f88f4f" strokeWidth={2} name="Current Path" />
              <Line type="monotone" dataKey="growth" stroke="#7be4a2" strokeWidth={2} name="Skill Growth" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section id="career" className="panel">
        <h3>{t('career')}</h3>
        <div className="grid2">
          <input type="number" min="0" max="100" placeholder="Marks" value={career.marks} onChange={(e) => setCareer((s) => ({ ...s, marks: Number(e.target.value) }))} />
          <input type="number" min="1" max="10" placeholder="Skill (1-10)" value={career.skill} onChange={(e) => setCareer((s) => ({ ...s, skill: Number(e.target.value) }))} />
          <input type="number" min="1" max="10" placeholder="Communication (1-10)" value={career.comm} onChange={(e) => setCareer((s) => ({ ...s, comm: Number(e.target.value) }))} />
          <input type="number" min="0" placeholder="Internships (months)" value={career.intern} onChange={(e) => setCareer((s) => ({ ...s, intern: Number(e.target.value) }))} />
        </div>
        <div className="list">
          <div className="item">Career Fit Score: {careerScore}/100</div>
          <div className="item">Skill Gap %: {100 - careerScore}%</div>
          <div className="item">Internship readiness: {careerScore > 70 ? 'High' : careerScore > 45 ? 'Medium' : 'Low'}</div>
        </div>
      </section>

      <section id="ai" className="panel">
        <h3>{t('ai')}</h3>
        <p>Trigger API to get custom advice with GPT friendly mentor persona.</p>
        <button onClick={requestOpenAI}>Get AI Advice</button>
        {remoteAdvice && <pre className="ai-output">{remoteAdvice.error || remoteAdvice.advice || JSON.stringify(remoteAdvice, null, 2)}</pre>}
      </section>

      <section id="resources" className="panel">
        <h3>{t('resources')}</h3>
        <div className="cms-add">
          <input placeholder="Title" value={newResource.title} onChange={(e) => setNewResource((r) => ({ ...r, title: e.target.value }))} />
          <input placeholder="Link" value={newResource.url} onChange={(e) => setNewResource((r) => ({ ...r, url: e.target.value }))} />
          <input placeholder="Type" value={newResource.type} onChange={(e) => setNewResource((r) => ({ ...r, type: e.target.value }))} />
          <button onClick={addResource}>{t('addResource')}</button>
        </div>
        <ul className="resource-list">
          {resourceList.map((item, idx) => (
            <li key={idx}>
              <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a> - {item.type}
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <p>LifeLift AI with React + Vite + Express + Mongo. i18n (EN/TA) and smart charts included.</p>
      </footer>
    </div>
  );
}
