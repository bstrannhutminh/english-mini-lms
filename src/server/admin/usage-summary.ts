/**
 * Monthly AI usage aggregation for the admin dashboard.
 * Reads usage_events from the 1st of the current month and rolls up
 * requests/tokens/cost plus a per-action breakdown.
 */
import { gte } from "drizzle-orm";
import { db } from "@/db";
import { usageEvents } from "@/db/schema";

export interface MonthlyUsageSummary {
  month: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCostUsd: number;
  actionBreakdown: Array<{
    action: string;
    count: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  }>;
}

export async function getMonthlyUsageSummary(): Promise<MonthlyUsageSummary> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usageRecords = await db
    .select()
    .from(usageEvents)
    .where(gte(usageEvents.createdAt, startOfMonth));

  const totalRequests = usageRecords.length;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalEstimatedCostUsd = 0;

  const actionMap = new Map<
    string,
    { count: number; inputTokens: number; outputTokens: number; cost: number }
  >();

  for (const record of usageRecords) {
    const input = record.tokenInput || 0;
    const output = record.tokenOutput || 0;
    const cost = record.costEstimate || 0;

    totalInputTokens += input;
    totalOutputTokens += output;
    totalEstimatedCostUsd += cost;

    const action = record.action || "other";
    const existing = actionMap.get(action) || {
      count: 0,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
    };
    existing.count += 1;
    existing.inputTokens += input;
    existing.outputTokens += output;
    existing.cost += cost;
    actionMap.set(action, existing);
  }

  const actionBreakdown = Array.from(actionMap.entries()).map(
    ([action, data]) => ({
      action,
      count: data.count,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      estimatedCostUsd: Number(data.cost.toFixed(4)),
    })
  );

  const currentMonthStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, "0")}`;

  return {
    month: currentMonthStr,
    totalRequests,
    totalInputTokens,
    totalOutputTokens,
    totalEstimatedCostUsd: Number(totalEstimatedCostUsd.toFixed(4)),
    actionBreakdown,
  };
}
