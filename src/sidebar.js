import { NEIGHBORHOODS } from './data.js';
import { Utils } from './utils.js';
import { Profile } from './profile.js';
import { Charts } from './charts.js';

export const Sidebar = {
  activeTab:    'overview',
  activeFilter: 'all',
  selectedId:   null,

  /** Destroy any live Chart instances, then re-render the active panel. */
  render() {
    Charts.destroyAll();
    const el = document.getElementById('sidebarContent');
    if      (this.activeTab === 'overview') el.innerHTML = this._overviewHTML();
    else if (this.activeTab === 'detail')   this._renderDetail(el);
    else if (this.activeTab === 'ranking')  {
      el.innerHTML = this._rankingHTML();
      requestAnimationFrame(() => Charts.buildRankChart());
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
      b.classList.toggle('active', ['overview','detail','ranking'][i] === tab);
    });
    this.render();
  },

  setFilter(f) { this.activeFilter = f; this.render(); },

  /** Refresh the four stat cards above the tabs. */
  updateStatCards() {
    const budget     = Profile.effectiveRentBudget();
    const avgRent    = NEIGHBORHOODS.reduce((s,n) => s + Profile.adjustedRent(n), 0) / NEIGHBORHOODS.length;
    const affordable = NEIGHBORHOODS.filter(n => Profile.score(n) >= 65).length;
    const avgBurden  = (NEIGHBORHOODS.reduce((s,n) => s + Profile.adjustedRent(n)*12/Profile.totalIncome(), 0) / NEIGHBORHOODS.length * 100).toFixed(0);

    document.getElementById('avgRent').textContent     = Utils.fmtCurrency(avgRent);
    document.getElementById('budgetVal').textContent   = Utils.fmtCurrency(budget);
    document.getElementById('affordCount').textContent = affordable;
    const el = document.getElementById('avgBurden');
    el.textContent = avgBurden + '%';
    el.className   = 'stat-value ' + (avgBurden < 30 ? 'good' : avgBurden < 45 ? 'warn' : 'bad');
  },

  // ---- Private panel renderers --------------------------------------------

  _overviewHTML() {
    const sorted   = [...NEIGHBORHOODS].sort((a,b) => Profile.score(b) - Profile.score(a));
    const filtered = this.activeFilter === 'all' ? sorted : sorted.filter(n => {
      const s = Profile.score(n);
      if (this.activeFilter === 'affordable') return s >= 65;
      if (this.activeFilter === 'moderate')   return s >= 45 && s < 65;
      if (this.activeFilter === 'burdened')   return s < 45;
      return true;
    });

    const cards = filtered.map(n => {
      const score = Profile.score(n);
      const col   = Utils.scoreColor(score);
      return `
        <div class="hood-card ${this.selectedId===n.id?'selected':''}" style="--color-bar:${col.fill}" onclick="App.selectNeighborhood('${n.id}')">
          <div class="hood-row1">
            <span class="hood-name">${n.name}</span>
            <span class="hood-score" style="color:${col.fill}">${score}</span>
          </div>
          <div class="hood-row2">
            <span class="hood-meta">${Utils.fmtCurrency(Profile.adjustedRent(n))}/mo · ${Profile.burdenPct(n)}% burden</span>
            <div class="afford-bar-wrap"><div class="afford-bar" style="width:${score}%;background:${col.fill}"></div></div>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="legend-box">
        <div class="section-title">Affordability Legend</div>
        <div class="legend-row"><div class="legend-dot" style="background:#22c55e"></div><div class="legend-label">Affordable</div><div class="legend-range">Score ≥ 65 · &lt;25% income</div></div>
        <div class="legend-row"><div class="legend-dot" style="background:#eab308"></div><div class="legend-label">Moderate</div><div class="legend-range">Score 45–65 · 25–35%</div></div>
        <div class="legend-row"><div class="legend-dot" style="background:#f97316"></div><div class="legend-label">Stretched</div><div class="legend-range">Score 25–45 · 35–50%</div></div>
        <div class="legend-row"><div class="legend-dot" style="background:#ef4444"></div><div class="legend-label">Burdened</div><div class="legend-range">Score &lt;25 · &gt;50%</div></div>
      </div>
      <div class="filter-bar">
        <button class="filter-btn ${this.activeFilter==='all'?'active':''}"        onclick="App.setFilter('all')">All</button>
        <button class="filter-btn ${this.activeFilter==='affordable'?'active':''}" onclick="App.setFilter('affordable')">Affordable</button>
        <button class="filter-btn ${this.activeFilter==='moderate'?'active':''}"   onclick="App.setFilter('moderate')">Moderate</button>
        <button class="filter-btn ${this.activeFilter==='burdened'?'active':''}"   onclick="App.setFilter('burdened')">Burdened</button>
      </div>
      <div class="section-title">Neighborhoods (${filtered.length})</div>
      <div class="hood-list">${cards}</div>`;
  },

  _renderDetail(el) {
    const n = this.selectedId ? NEIGHBORHOODS.find(x => x.id === this.selectedId) : null;
    if (!n) {
      el.innerHTML = `<div style="color:var(--text-dim);font-size:13px;margin-top:20px;text-align:center">Click a neighborhood on the map<br>to see detailed stats.</div>`;
      return;
    }

    const score    = Profile.score(n);
    const col      = Utils.scoreColor(score);
    const adjRent  = Profile.adjustedRent(n);
    const budget   = Profile.effectiveRentBudget();
    const leftover = Profile.monthlyLeftover(n);
    const addons   = [Profile.data.hasCar?'+$150 parking':'', Profile.data.hasPets?'+$50 pets':''].filter(Boolean);
    const unitLabels = { any:'Recommended', studio:'Studio', '1bed':'1-Bedroom', '2bed':'2-Bedroom' };
    const ruleLabel  = Profile.data.budgetRule === 'dti' ? 'DTI-based' : Profile.data.budgetRule + '% rule';

    el.innerHTML = `
      <div class="detail-panel">
        <div class="detail-header">
          <div class="detail-name">${n.name}</div>
          <span class="detail-badge" style="background:${col.badge};color:${col.textColor}">${col.label} · Score ${score}</span>
        </div>
        <div class="detail-metrics">
          <div class="metric-box">
            <div class="lbl">Adj. Rent (${unitLabels[Profile.data.unitPref]})</div>
            <div class="val" style="color:${col.textColor}">${Utils.fmtCurrency(adjRent)}</div>
            <div class="sub">${addons.length ? addons.join(', ') : 'per month'}</div>
          </div>
          <div class="metric-box">
            <div class="lbl">Rent Burden</div>
            <div class="val" style="color:${col.textColor}">${Profile.burdenPct(n)}%</div>
            <div class="sub">of household income</div>
          </div>
          <div class="metric-box">
            <div class="lbl">Your Rent Budget</div>
            <div class="val">${Utils.fmtCurrency(budget)}</div>
            <div class="sub">${ruleLabel}</div>
          </div>
          <div class="metric-box">
            <div class="lbl">After Rent+Debts</div>
            <div class="val" style="color:${leftover<0?'var(--red)':leftover<300?'var(--orange)':'var(--green)'}">
              ${leftover<0?'-':''}${Utils.fmtCurrency(Math.abs(leftover))}
            </div>
            <div class="sub">${leftover<0?'monthly deficit':'remaining / mo'}</div>
          </div>
        </div>
        <div class="chart-wrap">
          <div class="chart-title">Unit Type vs Your Budget</div>
          <canvas id="unitChart"></canvas>
        </div>
        <div class="chart-wrap">
          <div class="chart-title">Rent Trend (6 months)</div>
          <canvas id="trendChart"></canvas>
        </div>
        <div class="metric-box" style="margin-bottom:8px">
          <div class="lbl">Livability Scores</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px">
            ${[['Walk',n.walkScore],['Transit',n.transitScore],['Bike',n.bikeScore]].map(([l,v]) => `
              <div style="text-align:center">
                <div style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:${v>=70?'var(--green)':v>=50?'var(--yellow)':'var(--orange)'}">${v}</div>
                <div style="font-size:10px;color:var(--text-dim);font-family:'DM Mono',monospace;letter-spacing:1px">${l}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    Charts.buildDetailCharts(n);
  },

  _rankingHTML() {
    const sorted = [...NEIGHBORHOODS].sort((a,b) => Profile.score(b) - Profile.score(a));
    const rows = sorted.map((n,i) => {
      const score = Profile.score(n);
      const col   = Utils.scoreColor(score);
      return `
        <div class="rank-bar-row" onclick="App.selectNeighborhood('${n.id}')">
          <div class="rank-name" title="${n.name}">${i+1}. ${n.name}</div>
          <div class="rank-bar-outer"><div class="rank-bar-inner" style="width:${score}%;background:${col.fill}"></div></div>
          <div class="rank-pct">${score}</div>
        </div>`;
    }).join('');
    return `
      <div class="section-title">Affordability Score Ranking</div>
      <div style="margin-bottom:16px">${rows}</div>
      <div class="chart-wrap">
        <div class="chart-title">Adjusted Rent by Neighborhood</div>
        <canvas id="rankChart"></canvas>
      </div>`;
  },
};
