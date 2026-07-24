import type { Request, Response } from 'express';
import {
  getTelemetryService,
  bulkIngestTelemetry,
  getTelemetryThresholds,
} from './telemetry.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';
import type { BulkTelemetryBody } from './telemetry.validation.js';

export const getTelemetry = async (req: Request, res: Response) => {
  const { cursor, page, limit = 20, shipmentId, from, to } = req.query;
  const user = req.user;
  const organizationId = user?.organizationId;
  // Cursor takes precedence; Zod rejects cursor + page together.
  const pageNum = page ? Number(page) : undefined;
  const { data, nextCursor, hasMore } = await getTelemetryService({
    cursor: cursor as string | undefined,
    page: cursor ? undefined : pageNum,
    limit: Number(limit),
    shipmentId: shipmentId as string | undefined,
    organizationId: organizationId as string | undefined,
    from: from as Date | undefined,
    to: to as Date | undefined,
  });

  const meta: Record<string, unknown> = { nextCursor, hasMore };
  if (!cursor && pageNum) {
    meta.page = pageNum;
  }

  sendResponse(res, 200, true, 'Telemetry retrieved', data, meta);
};

export const bulkIngest = async (req: Request, res: Response) => {
  const body = req.body as BulkTelemetryBody;

  const result = await bulkIngestTelemetry(body.items);

  sendResponse(res, 201, true, 'Bulk telemetry ingested', result);
};

export const getThresholds = async (req: Request, res: Response) => {
  const data = getTelemetryThresholds();
  sendResponse(res, 200, true, 'Thresholds retrieved', data);
};
