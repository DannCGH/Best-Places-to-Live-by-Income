import { CITY_GIS_GEOJSON, COUNTY_GIS_GEOJSON, ALIAS_MAP, EMBEDDED_POLYGONS } from './geodata.js';
import { NEIGHBORHOODS } from './data.js';
import { Utils } from './utils.js';
import { Profile } from './profile.js';

export const MapLayer = {
  map:      null,
  layers:   {},   // neighborhood id → Leaflet layer
  polygons: {},   // neighborhood id → GeoJSON geometry (whichever source won)

  // ── BOUNDS ─────────────────────────────────────────────────────────────────
  BOUNDS: L.latLngBounds(L.latLng(25.55, -80.60), L.latLng(26.10, -80.00)),

  // ── GIS DATA PASTE ZONES ───────────────────────────────────────────────────

  // Maps each neighborhood id → the City GIS LABEL/NAME values that belong to it.
  // Multiple sub-districts are merged into one MultiPolygon per neighborhood.

  // ── EMBEDDED FALLBACK POLYGONS ─────────────────────────────────────────────
  // Used for any neighborhood not matched from the GIS downloads above.
  // Precise, non-overlapping boundaries derived from City of Miami GIS / OSM.

  // ── INIT ───────────────────────────────────────────────────────────────────
  init() {
    this.map = L.map('map', {
      center: [25.784, -80.197],
      zoom: 12,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: this.BOUNDS,
      maxBoundsViscosity: 1.0,
      preferCanvas: false,
    });
    this.map.on('zoomend', () => {
      if (!this.BOUNDS.contains(this.map.getBounds())) {
        this.map.fitBounds(this.BOUNDS);
      }
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB © OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);

      this._loadPolygons();
  },

  _loadPolygons() {
    this.polygons = { ...EMBEDDED_POLYGONS };

    // City GIS: merge sub-district polygons via ALIAS_MAP
    if (CITY_GIS_GEOJSON && CITY_GIS_GEOJSON.features) {
      const gisLookup = {};
      CITY_GIS_GEOJSON.features.forEach(f => {
        const geom = f.geometry;
        if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) return;
        const props = f.properties || {};
        const name = (props.LABEL || props.NAME || props.name || '').trim();
        if (name) gisLookup[name] = geom;
      });

      Object.entries(ALIAS_MAP).forEach(([id, aliases]) => {
        const rings = [];
        aliases.forEach(alias => {
          const geom = gisLookup[alias];
          if (!geom) return;
          if (geom.type === 'Polygon') rings.push(...geom.coordinates);
          else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(poly => rings.push(...poly));
        });
        if (rings.length > 0) {
          this.polygons[id] = { type: 'MultiPolygon', coordinates: rings.map(r => [r]) };
        }
      });
    }

    // County GIS: fuzzy name match
    if (COUNTY_GIS_GEOJSON && COUNTY_GIS_GEOJSON.features) {
      COUNTY_GIS_GEOJSON.features.forEach(f => {
        const geom = f.geometry;
        if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) return;
        const props = f.properties || {};
        const rawName = (props.NAME || props.LABEL || props.name || '').trim();
        if (!rawName) return;
        const matched = this._matchNeighborhood(rawName);
        if (matched && !ALIAS_MAP[matched.id]) {
          this.polygons[matched.id] = geom;
        }
      });
    }

    console.log(`[MapLayer] Polygons loaded: ${Object.keys(this.polygons).length}/${NEIGHBORHOODS.length} neighborhoods`);
  },

  _matchNeighborhood(gisName) {
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const target = norm(gisName);
    let match = NEIGHBORHOODS.find(n => norm(n.name) === target);
    if (match) return match;
    match = NEIGHBORHOODS.find(n => { const nn = norm(n.name); return target.includes(nn) || nn.includes(target); });
    return match || null;
  },


  // ── RENDERING ──────────────────────────────────────────────────────────────

  /** Remove all layers and redraw every neighborhood using the current Profile. */
  rebuild() {
    Object.values(this.layers).forEach(l => this.map.removeLayer(l));
    this.layers = {};

    NEIGHBORHOODS.forEach(n => {
      const score = Profile.score(n);
      const col   = Utils.scoreColor(score);
      const style = { color:col.fill, fillColor:col.fill, fillOpacity:0.28, weight:2, opacity:0.9 };
      const tip   = this._tooltipHTML(n, score, col);
      let layer;

      if (this.polygons[n.id]) {
        layer = L.geoJSON({ type:'Feature', geometry:this.polygons[n.id] }, {
          style: () => style,
          onEachFeature: (_, lyr) => {
            lyr.bindTooltip(tip, { sticky:true, direction:'top' });
            lyr.on('click', () => App.selectNeighborhood(n.id));
          },
        }).addTo(this.map);
      } else {
        // No polygon available — fall back to a proportional circle
        const radius = 500 + (n.population / 224669) * 1200;
        layer = L.circle([n.lat, n.lng], { radius, ...style }).addTo(this.map);
        layer.bindTooltip(tip, { sticky:true, direction:'top', offset:[0,-8] });
        layer.on('click', () => App.selectNeighborhood(n.id));
      }
      this.layers[n.id] = layer;
    });
  },

  /** Restyle colours + tooltips after a profile change without rebuilding layers. */
  restyle() {
    NEIGHBORHOODS.forEach(n => {
      const layer = this.layers[n.id];
      if (!layer) return;
      const score = Profile.score(n);
      const col   = Utils.scoreColor(score);
      const tip   = this._tooltipHTML(n, score, col);
      if (layer.setStyle) layer.setStyle({ color:col.fill, fillColor:col.fill });
      if (layer.eachLayer) layer.eachLayer(l => l.bindTooltip(tip, { sticky:true, direction:'top' }));
      else layer.bindTooltip(tip, { sticky:true, direction:'top', offset:[0,-8] });
    });
  },

  /** Emphasise the selected layer, dim all others. */
  highlight(id) {
    Object.entries(this.layers).forEach(([lid, layer]) => {
      const s = lid === id
        ? { weight:3, opacity:1,   fillOpacity:0.50 }
        : { weight:2, opacity:0.9, fillOpacity:0.28 };
      if (layer.setStyle) layer.setStyle(s);
    });
  },

  flyTo(n) {
    const layer = this.layers[n.id];
    if (layer && layer.getBounds) {
      this.map.flyToBounds(layer.getBounds(), { padding:[30,30], duration:0.8 });
    } else {
      this.map.flyTo([n.lat, n.lng], 14, { duration:0.8 });
    }
  },

  _tooltipHTML(n, score, col) {
    const unitLabel = Profile.data.unitPref === 'any' ? 'auto' : Profile.data.unitPref;
    return `
      <div class="tt-name">${n.name}</div>
      <div class="tt-row"><span>Adj. rent (${unitLabel})</span><span>${Utils.fmtCurrency(Profile.adjustedRent(n))}/mo</span></div>
      <div class="tt-row"><span>Rent burden</span><span>${Profile.burdenPct(n)}% of income</span></div>
      <div class="tt-row"><span>Your budget</span><span>${Utils.fmtCurrency(Profile.effectiveRentBudget())}/mo</span></div>
      <div class="tt-score" style="color:${col.fill}">${score}
        <small style="font-size:11px;font-family:'DM Sans',sans-serif;color:${col.fill}">${col.label}</small>
      </div>`;
  },
};
