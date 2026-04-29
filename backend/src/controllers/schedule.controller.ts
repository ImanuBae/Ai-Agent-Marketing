import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import * as scheduleService from '../services/schedule.service';

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { contentId, scheduledAt, timezone, timezoneOffset } = req.body;

    if (!contentId) return sendError(res, 'contentId is required', 400);

    const schedule = await scheduleService.createSchedule(
      userId,
      contentId,
      scheduledAt ? new Date(scheduledAt) : undefined,
      timezone ?? 'UTC',
      timezoneOffset != null ? Number(timezoneOffset) : 0,
    );

    return sendSuccess(res, 'Schedule created', schedule, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return sendError(res, msg, msg.includes('not found') ? 404 : 400);
  }
};

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status, platform, month, year } = req.query;

    const schedules = await scheduleService.getSchedules(userId, {
      status: status as string | undefined,
      platform: platform as string | undefined,
      month: month ? parseInt(month as string, 10) : undefined,
      year: year ? parseInt(year as string, 10) : undefined,
    });

    return sendSuccess(res, 'Schedules fetched', schedules);
  } catch (err) {
    return sendError(res, 'Server error');
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const id = req.params.id as string;
    const { scheduledAt } = req.body;

    if (!scheduledAt) return sendError(res, 'scheduledAt is required', 400);

    const schedule = await scheduleService.updateSchedule(id, userId, new Date(scheduledAt));
    return sendSuccess(res, 'Schedule updated', schedule);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return sendError(res, msg, msg.includes('not found') ? 404 : 400);
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    await scheduleService.deleteSchedule(req.params.id as string, userId);
    return sendSuccess(res, 'Schedule deleted');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return sendError(res, msg, msg.includes('not found') ? 404 : 400);
  }
};

export const getOptimalTime = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { platform, count, timezoneOffset } = req.query;

    if (!platform) return sendError(res, 'platform is required', 400);

    const result = await scheduleService.getOptimalTimeSlots(
      userId,
      platform as string,
      count ? parseInt(count as string, 10) : 3,
      timezoneOffset ? parseInt(timezoneOffset as string, 10) : 0,
    );

    return sendSuccess(res, 'Optimal time slots', result);
  } catch (err) {
    return sendError(res, 'Server error');
  }
};

export const recordEngagement = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { contentId, likes = 0, comments = 0, clicks = 0, impressions = 0 } = req.body;

    if (!contentId) return sendError(res, 'contentId is required', 400);

    const result = await scheduleService.recordEngagement(userId, contentId, {
      likes: Number(likes),
      comments: Number(comments),
      clicks: Number(clicks),
      impressions: Number(impressions),
    });

    return sendSuccess(res, 'Engagement recorded — optimizer updated', result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return sendError(res, msg, msg.includes('not found') ? 404 : 400);
  }
};
