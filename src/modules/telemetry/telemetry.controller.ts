import type { Request, Response } from 'express';
import { getTelemetryService, bulkIngestTelemetry } from './telemetry.service.js';
import {
  getOrgTelemetryThresholdsService,
  updateOrgTelemetryThresholdsService,
} from './telemetryThreshold.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';
import type { BulkTelemetryBody } from './telemetry.validation.js';
import { AppError, ErrorCodes } from '../../shared/http/errors.js';

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

export const getTelemetryThresholds = async (req: Request, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new AppError(403, 'Organization context required', ErrorCodes.FORBIDDEN);
  }

  const shipmentType = req.query.shipmentType as string | undefined;
  const result = await getOrgTelemetryThresholdsService(organizationId, shipmentType);
  sendResponse(res, 200, true, 'Telemetry thresholds retrieved', result);
};

export const putTelemetryThresholds = async (req: Request, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new AppError(403, 'Organization context required', ErrorCodes.FORBIDDEN);
  }

  const result = await updateOrgTelemetryThresholdsService(organizationId, req.body);
  sendResponse(res, 200, true, 'Telemetry thresholds updated', result);
};
