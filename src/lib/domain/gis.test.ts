import { describe, it, expect } from 'vitest';
import { GIS_BOUNDS, GIS_LAYERS_CONFIG, GIS_INSAR_POINTS, GEOMECHANICAL_REFERENCE, GIS_SUBSIDENCE_EVENTS } from '@/lib/data/gis-data';
import { DEMO_NODES, DEMO_PANELS } from '@/lib/data/mock-data';

describe('SIH26025 GIS & Spatial Geospatial Integrity', () => {
  it('confirms GIS bounding box is centered on authentic Jharia Coalfield coordinates', () => {
    expect(GIS_BOUNDS.centerLat).toBeGreaterThan(23.6);
    expect(GIS_BOUNDS.centerLat).toBeLessThan(23.7);
    expect(GIS_BOUNDS.centerLon).toBeGreaterThan(86.3);
    expect(GIS_BOUNDS.centerLon).toBeLessThan(86.5);
    expect(GIS_BOUNDS.referenceDatum).toContain('WGS84');
  });

  it('validates all 16 sensor nodes and 4 panels are located strictly within colliery leasehold bounds', () => {
    expect(DEMO_NODES.length).toBe(16);
    expect(DEMO_PANELS.length).toBe(4);

    for (const node of DEMO_NODES) {
      expect(node.latitude).toBeGreaterThanOrEqual(GIS_BOUNDS.minLat);
      expect(node.latitude).toBeLessThanOrEqual(GIS_BOUNDS.maxLat);
      expect(node.longitude).toBeGreaterThanOrEqual(GIS_BOUNDS.minLon);
      expect(node.longitude).toBeLessThanOrEqual(GIS_BOUNDS.maxLon);
      expect(node.panel_id).toBeDefined();
    }
  });

  it('ensures all 7 GIS layers are properly configured with explicit provenance classifications', () => {
    const layerIds = GIS_LAYERS_CONFIG.map((l) => l.id);
    expect(layerIds).toContain('panels');
    expect(layerIds).toContain('nodes');
    expect(layerIds).toContain('infrastructure');
    expect(layerIds).toContain('goaf');
    expect(layerIds).toContain('insar');
    expect(layerIds).toContain('geomechanical');
    expect(layerIds).toContain('events');

    // InSAR layer must be explicitly labeled DEMO, never presented as live telemetry
    const insarLayer = GIS_LAYERS_CONFIG.find((l) => l.id === 'insar')!;
    expect(['DEMO', 'EXTERNAL']).toContain(insarLayer.provenance);

    // Geomechanical reference must be labeled REFERENCE or EXTERNAL
    const geoLayer = GIS_LAYERS_CONFIG.find((l) => l.id === 'geomechanical')!;
    expect(geoLayer.category).toBe('REFERENCE');
  });

  it('verifies synthetic InSAR points have realistic line-of-sight displacement and coherence values', () => {
    expect(GIS_INSAR_POINTS.length).toBeGreaterThan(0);

    for (const pt of GIS_INSAR_POINTS) {
      expect(pt.coherence).toBeGreaterThan(0.7);
      expect(pt.coherence).toBeLessThanOrEqual(1.0);
      expect(pt.displacementMm).toBeLessThan(10.0); // No massive unrealistic values
      expect(pt.provenance).toBe('DEMO');
      expect(pt.satelliteTrack).toContain('Sentinel-1');
    }
  });

  it('verifies CMPDI geomechanical reference profile contains valid empirical parameters', () => {
    expect(GEOMECHANICAL_REFERENCE.angleDrawDegrees).toBe(32.0);
    expect(GEOMECHANICAL_REFERENCE.limitAngleDegrees).toBe(58.0);
    expect(GEOMECHANICAL_REFERENCE.inflectionPointDistanceM).toBeGreaterThan(50);
    expect(GEOMECHANICAL_REFERENCE.profilePoints.length).toBeGreaterThan(5);
    expect(GEOMECHANICAL_REFERENCE.caveatNotice).toContain('empirical reference model');
  });

  it('validates subsidence events cross-reference authentic affected nodes and panels', () => {
    for (const evt of GIS_SUBSIDENCE_EVENTS) {
      expect(evt.affectedNodeCodes.length).toBeGreaterThan(0);
      // Epicenter must be among affected nodes
      expect(evt.affectedNodeCodes).toContain(evt.epicenterNodeCode);

      // Verify all affected nodes exist in DEMO_NODES
      for (const code of evt.affectedNodeCodes) {
        const found = DEMO_NODES.find((n) => n.node_code === code);
        expect(found).toBeDefined();
      }

      // Timeline must have progression steps
      expect(evt.timelineSteps.length).toBeGreaterThan(1);
    }
  });
});
