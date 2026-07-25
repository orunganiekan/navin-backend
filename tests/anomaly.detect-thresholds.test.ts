import { jest, describe, beforeEach, it, expect } from '@jest/globals';

const ORG_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const thresholdStore: Array<{
  organizationId: string;
  shipmentType: string;
  maxTemp?: number | null;
  maxHumidity?: number | null;
  minBatteryLevel?: number | null;
}> = [];

const shipmentStore: Array<{
  _id: string;
  enterpriseId: string;
  offChainMetadata?: Record<string, unknown>;
}> = [];

await jest.unstable_mockModule('../src/modules/telemetry/telemetryThreshold.model.js', () => ({
  TelemetryThreshold: {
    findOne: (query: { organizationId: string; shipmentType: string }) => ({
      lean: () =>
        Promise.resolve(
          thresholdStore.find(
            t =>
              t.organizationId === String(query.organizationId) &&
              t.shipmentType === query.shipmentType
          ) ?? null
        ),
    }),
  },
}));

await jest.unstable_mockModule('../src/modules/shipments/shipments.model.js', () => ({
  Shipment: {
    findById: (id: string) => ({
      select: () => ({
        lean: () => Promise.resolve(shipmentStore.find(s => s._id === id) ?? null),
      }),
    }),
  },
}));

await jest.unstable_mockModule('../src/modules/anomaly/anomaly.model.js', () => ({
  Anomaly: {
    create: jest.fn((docs: unknown[]) =>
      Promise.resolve(
        (Array.isArray(docs) ? docs : [docs]).map((doc, i) => ({
          toObject: () => ({ ...(doc as object), _id: `a${i}` }),
        }))
      )
    ),
  },
}));

const { detectAnomaly } = await import('../src/modules/anomaly/anomaly.service.js');
const { resolveTelemetryThresholdsForShipment } = await import(
  '../src/modules/telemetry/telemetryThreshold.service.js'
);
const { DEFAULT_TELEMETRY_THRESHOLDS } = await import(
  '../src/modules/telemetry/telemetryThreshold.constants.js'
);

describe('Configurable anomaly thresholds', () => {
  beforeEach(() => {
    thresholdStore.length = 0;
    shipmentStore.length = 0;
  });

  it('falls back to global defaults when org has no config', async () => {
    shipmentStore.push({ _id: 'ship-1', enterpriseId: ORG_ID });
    const thresholds = await resolveTelemetryThresholdsForShipment('ship-1');
    expect(thresholds.maxTemp).toBe(DEFAULT_TELEMETRY_THRESHOLDS.maxTemp);
  });

  it('detectAnomaly uses custom refrigerated thresholds', async () => {
    shipmentStore.push({
      _id: 'ship-1',
      enterpriseId: ORG_ID,
      offChainMetadata: { shipmentType: 'REFRIGERATED' },
    });
    thresholdStore.push({
      organizationId: ORG_ID,
      shipmentType: 'REFRIGERATED',
      maxTemp: 5,
      maxHumidity: 80,
      minBatteryLevel: 20,
    });

    const result = await detectAnomaly({
      _id: 't1',
      shipmentId: 'ship-1',
      temperature: 10,
      humidity: 50,
      batteryLevel: 90,
    });

    expect(result.detected).toBe(true);
    expect(result.anomalies[0]?.type).toBe('TEMPERATURE_EXCEEDED');
  });
});
