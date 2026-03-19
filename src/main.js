import './style.css';
import { NEIGHBORHOODS } from './data.js';
import { MapLayer } from './map.js';
import { Drawer } from './drawer.js';
import { Sidebar } from './sidebar.js';

export const App = {
  init() {
    MapLayer.init();
    Drawer.bindLivePreviews();
    Drawer.refreshSummary();
    Sidebar.updateStatCards();
    MapLayer.rebuild();
    Sidebar.render();
  },


  refresh() {
    Sidebar.updateStatCards();
    MapLayer.restyle();
    MapLayer.rebuild();
    Sidebar.render();
  },

  selectNeighborhood(id) {
    Sidebar.selectedId = id;
    MapLayer.flyTo(NEIGHBORHOODS.find(x => x.id === id));
    MapLayer.highlight(id);
    Sidebar.setTab('detail');
  },

  setTab(tab)    { Sidebar.setTab(tab); },
  setFilter(f)   { Sidebar.setFilter(f); },
  toggleDrawer() { Drawer.toggle(); },

  togglePref(key) {
    Profile.togglePref(key);
    Drawer.refreshSummary();
  },

  applyProfile() {
    Profile.readFromForm();
    this.refresh();
    Drawer.toggle();
  },
};

window.App = App;
document.addEventListener('DOMContentLoaded', () => App.init());
