import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { goalCompletions, goals } from '../db/schema';

dayjs.extend(weekOfYear);

export async function getWeekPendingGoals() {
    const firstDayOfWeek = dayjs().startOf('week').toDate();
    const lastDayOfWeek = dayjs().endOf('week').toDate();

    const goalsCreatedUpWeek = db
        .$with('goals_created_up_week')
        .as(db.select().from(goals).where(lte(goals.createdAt, lastDayOfWeek)));

    const goalCompletionCounts = db.$with('goal_completion_count').as(
        db
            .select({
                goalId: goalCompletions.goalId,
                completionCount: count(goalCompletions.id).as('completionCount'),
            })
            .from(goalCompletions)
            .where(
                and(
                    gte(goalCompletions.createdAt, firstDayOfWeek),
                    lte(goalCompletions.createdAt, lastDayOfWeek),
                ),
            )
            .groupBy(goalCompletions.goalId),
    );

    const pendingGoals = await db
        .with(goalCompletionCounts, goalsCreatedUpWeek)
        .select({
            id: goalsCreatedUpWeek.id,
            title: goalsCreatedUpWeek.title,
            desiredWeeklyFrequency: goalsCreatedUpWeek.desiredWeeklyFrequency,
            completionCount: sql`
                COALESCE(${goalCompletionCounts.completionCount}, 0)
            `.mapWith(Number),
        })
        .from(goalsCreatedUpWeek)
        .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goalsCreatedUpWeek.id));

    return {
        pendingGoals,
    };
}
