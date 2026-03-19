export const Utils = {
  /** Format a number as a USD string: 1500 → '$1,500' */
  fmtCurrency(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  },

  /** Map a 0–100 score to a { fill, label, badge, textColor } colour set. */
  scoreColor(score) {
    if (score >= 65) return { fill:'#22c55e', label:'Affordable', badge:'#052e16', textColor:'#22c55e' };
    if (score >= 45) return { fill:'#eab308', label:'Moderate',   badge:'#1c1400', textColor:'#eab308' };
    if (score >= 25) return { fill:'#f97316', label:'Stretched',  badge:'#1a0d00', textColor:'#f97316' };
    return             { fill:'#ef4444', label:'Burdened',   badge:'#1a0000', textColor:'#ef4444' };
  },

  /** Shared Chart.js scale defaults — avoids repetition across chart builders. */
  chartScaleDefaults() {
    return {
      x: { ticks:{ color:'#6b7a99', font:{ size:10 } }, grid:{ color:'#1f2d45' } },
      y: { ticks:{ color:'#6b7a99', font:{ size:10 }, callback: v => '$'+v.toLocaleString() }, grid:{ color:'#1f2d45' } },
    };
  },
};
