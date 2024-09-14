import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { createGoalCompletion } from '../../functions/create-goal-completion';

export const createCompletionRoute: FastifyPluginAsyncZod = async (app) => {
    app.post(
        '/completion',
        {
            schema: {
                body: z.object({
                    goalId: z.string(),
                }),
            },
        },
        async (req) => {
            const { goalId } = req.body;

            const { goalCompletion } = await createGoalCompletion({ goalId });

            return {
                goalCompletion,
            };
        },
    );
};
