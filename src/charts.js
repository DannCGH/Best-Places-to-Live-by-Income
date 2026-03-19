import { NEIGHBORHOODS } from './data.js';
import { Utils } from './utils.js';
import { Profile } from './profile.js';

export const Charts = {
  instances: {},

  destroyAll() {
    Object.values(this.instances).forEach(c => c.destroy());
    this.instances = {};
  },

  buildDetailCharts(n) {
    const col    = Utils.scoreColor(Profile.score(n));
    const budget = Profile.effectiveRentBudget();
    const scales = Utils.chartScaleDefaults();

    // Unit type comparison with budget reference line
    const uctx = document.getElementById('unitChart');
    if (uctx) {
      this.instances.unit = new Chart(uctx, {
        type: 'bar',
        data: {
          labels: ['Studio','1-Bed','2-Bed'],
          datasets: [
            { label:'Median Rent', data:[n.studio,n.oneBed,n.twoBed], backgroundColor:col.fill+'cc', borderRadius:4 },
            { label:'Your Budget', data:[budget,budget,budget], type:'line', borderColor:'#00e5c3', borderDash:[4,3], borderWidth:2, pointRadius:0, fill:false },
          ],
        },
        options: {
          responsive:true, maintainAspectRatio:true,
          plugins:{ legend:{ labels:{ color:'#6b7a99', font:{ family:'DM Sans', size:10 }, boxWidth:12 } } },
          scales,
        },
      });
    }

    // 6-month rent trend line
    const tctx = document.getElementById('trendChart');
    if (tctx) {
      this.instances.trend = new Chart(tctx, {
        type: 'line',
        data: {
          labels: ['Oct','Nov','Dec','Jan','Feb','Mar'],
          datasets: [{ label:'Median Rent', data:n.trend, borderColor:col.fill, backgroundColor:col.fill+'18', borderWidth:2, pointBackgroundColor:col.fill, pointRadius:3, tension:0.4, fill:true }],
        },
        options: {
          responsive:true, maintainAspectRatio:true,
          plugins:{ legend:{ display:false } },
          scales,
        },
      });
    }
  },

  buildRankChart() {
    const rctx = document.getElementById('rankChart');
    if (!rctx) return;
    const sorted = [...NEIGHBORHOODS].sort((a,b) => Profile.adjustedRent(b) - Profile.adjustedRent(a));
    const colors = sorted.map(n => Utils.scoreColor(Profile.score(n)).fill);
    this.instances.rank = new Chart(rctx, {
      type: 'bar',
      data: {
        labels: sorted.map(n => n.name.replace(' Miami','').replace('Little ','L.')),
        datasets: [{ data:sorted.map(n => Profile.adjustedRent(n)), backgroundColor:colors.map(c=>c+'bb'), borderRadius:4 }],
      },
      options: {
        indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales: {
          x:{ ticks:{ color:'#6b7a99', font:{ size:9 }, callback: v=>'$'+v.toLocaleString() }, grid:{ color:'#1f2d45' } },
          y:{ ticks:{ color:'#9aaccc', font:{ size:10 } }, grid:{ display:false } },
        },
      },
    });
    rctx.style.height = '320px';
    rctx.parentElement.style.height = '350px';
  },
};
