import { Utils } from './utils.js';
import { Profile } from './profile.js';

export const Drawer = {
  isOpen: false,

  toggle() {
    this.isOpen = !this.isOpen;
    document.getElementById('profileDrawer').classList.toggle('open', this.isOpen);
    document.getElementById('profileToggle').classList.toggle('open', this.isOpen);
    if (this.isOpen) this.refreshSummary();
  },

  /** Re-render the live summary box and sync the header income display. */
  refreshSummary() {
    Profile.readFromForm();
    const budget   = Profile.effectiveRentBudget();
    const monthly  = Profile.monthlyIncome();
    const debts    = Profile.totalMonthlyDebts();
    const leftover = monthly - budget - debts;
    const unitLabels = { any:'Auto', studio:'Studio', '1bed':'1-Bed', '2bed':'2-Bed' };
    const addons = [
      Profile.data.hasCar  ? '+$150 parking' : '',
      Profile.data.hasPets ? '+$50 pets'      : '',
    ].filter(Boolean);

    document.getElementById('profileSummary').innerHTML = `
      <div class="summary-row"><span class="summary-key">Total Household Income</span>  <span class="summary-val accent">${Utils.fmtCurrency(Profile.totalIncome())}/yr</span></div>
      <div class="summary-row"><span class="summary-key">Monthly Take-Home</span>        <span class="summary-val">${Utils.fmtCurrency(monthly)}/mo</span></div>
      <div class="summary-row"><span class="summary-key">Monthly Debts + Savings</span>  <span class="summary-val">${debts > 0 ? '-'+Utils.fmtCurrency(debts) : '—'}</span></div>
      <div class="summary-row"><span class="summary-key">Effective Rent Budget</span>    <span class="summary-val accent">${Utils.fmtCurrency(budget)}/mo</span></div>
      <div class="summary-row"><span class="summary-key">Remaining After Rent+Debts</span>
        <span class="summary-val" style="color:${leftover<0?'var(--red)':leftover<300?'var(--orange)':'var(--green)'}">
          ${Utils.fmtCurrency(Math.abs(leftover))}${leftover<0?' deficit':''}
        </span>
      </div>
      <div class="summary-row"><span class="summary-key">Unit Preference</span>          <span class="summary-val">${unitLabels[Profile.data.unitPref]}</span></div>
      ${addons.length ? `<div class="summary-row"><span class="summary-key">Add-ons</span><span class="summary-val">${addons.join(', ')}</span></div>` : ''}
    `;

    document.getElementById('headerIncome').textContent = Utils.fmtCurrency(Profile.totalIncome()) + '/yr';
  },

  /** Attach input listeners so the summary updates live as the user types. */
  bindLivePreviews() {
    ['incomeInput','partnerIncome','householdSize','incomeType',
     'carPayment','studentLoans','creditCards','otherDebts',
     'monthlySavings','maxRentBudget','unitPref','budgetRule'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => this.refreshSummary());
    });
  },
};
