import { SCHOOL_BONUS, WFH_BONUS } from './data.js';
import { Utils } from './utils.js';

export const Profile = {

  // --- State ----------------------------------------------------------------
  data: {
    income:75000, partnerIncome:0, householdSize:2, incomeType:'salary',
    carPayment:0, studentLoans:0, creditCards:0, otherDebts:0,
    monthlySavings:0, maxRentBudget:null,
    unitPref:'any', budgetRule:'30',
    hasCar:false, hasPets:false, needsSchools:false, wfh:false,
  },

  // --- Derived: income ------------------------------------------------------
  totalIncome()   { return this.data.income + this.data.partnerIncome; },
  monthlyIncome() { return this.totalIncome() / 12; },

  // --- Derived: debt --------------------------------------------------------
  /** Sum of all recurring monthly obligations, including savings target. */
  totalMonthlyDebts() {
    const d = this.data;
    return d.carPayment + d.studentLoans + d.creditCards + d.otherDebts + d.monthlySavings;
  },

  // --- Derived: budget ------------------------------------------------------
  /**
   * Monthly rent the user can afford.
   * Priority: manual override → DTI method → percentage-of-income rule.
   */
  effectiveRentBudget() {
    if (this.data.maxRentBudget) return this.data.maxRentBudget;
    if (this.data.budgetRule === 'dti') {
      return Math.max(0, this.monthlyIncome() * 0.43 - this.totalMonthlyDebts());
    }
    return Math.round(this.monthlyIncome() * (parseInt(this.data.budgetRule) / 100));
  },

  // --- Derived: per-neighborhood --------------------------------------------
  /** Select the right unit price based on preference + household size. */
  rentForUnit(n) {
    const { unitPref, householdSize } = this.data;
    if (unitPref === 'studio') return n.studio;
    if (unitPref === '1bed')   return n.oneBed;
    if (unitPref === '2bed')   return n.twoBed;
    if (householdSize >= 3)    return n.twoBed;
    if (householdSize === 2)   return n.oneBed;
    return n.studio;
  },

  /** Base unit rent plus lifestyle cost add-ons (parking, pets). */
  adjustedRent(n) {
    let r = this.rentForUnit(n);
    if (this.data.hasCar)  r += 150;
    if (this.data.hasPets) r += 50;
    return r;
  },

  /**
   * Affordability score 0–100 for a neighborhood against the current profile.
   * Higher = more affordable. Lifestyle bonuses applied on top of base score.
   */
  score(n) {
    const budget = this.effectiveRentBudget();
    if (budget <= 0) return 0;
    let s = Math.round((1 - (this.adjustedRent(n) / budget - 0.5)) * 100);
    if (this.data.needsSchools) s += (SCHOOL_BONUS[n.id] || 0);
    if (this.data.wfh)          s += (WFH_BONUS[n.id]    || 0);
    return Math.max(0, Math.min(100, s));
  },

  /** Annual rent as a percentage of total household income, e.g. '32.4'. */
  burdenPct(n) {
    return ((this.adjustedRent(n) * 12) / this.totalIncome() * 100).toFixed(1);
  },

  /** Monthly cash remaining after rent and all debts. Negative = deficit. */
  monthlyLeftover(n) {
    return this.monthlyIncome() - this.adjustedRent(n) - this.totalMonthlyDebts();
  },

  // --- Form sync ------------------------------------------------------------
  /** Pull all form field values into Profile.data. Call before any refresh. */
  readFromForm() {
    const $   = id => document.getElementById(id);
    const num = (id, fb=0) => parseFloat($(id).value) || fb;
    const d   = this.data;
    d.income         = num('incomeInput', 75000);
    d.partnerIncome  = num('partnerIncome', 0);
    d.householdSize  = parseInt($('householdSize').value);
    d.incomeType     = $('incomeType').value;
    d.carPayment     = num('carPayment');
    d.studentLoans   = num('studentLoans');
    d.creditCards    = num('creditCards');
    d.otherDebts     = num('otherDebts');
    d.monthlySavings = num('monthlySavings');
    d.maxRentBudget  = num('maxRentBudget') || null;
    d.unitPref       = $('unitPref').value;
    d.budgetRule     = $('budgetRule').value;
  },

  /** Toggle a boolean lifestyle flag and update the matching toggle button. */
  togglePref(key) {
    const propMap   = { car:'hasCar', pets:'hasPets', schools:'needsSchools', wfh:'wfh' };
    const toggleMap = { car:'toggleCar', pets:'togglePets', schools:'toggleSchools', wfh:'toggleWfh' };
    this.data[propMap[key]] = !this.data[propMap[key]];
    document.getElementById(toggleMap[key]).classList.toggle('on', this.data[propMap[key]]);
  },
};
