import fastify from 'fastify';
import zod from 'zod';
import { createGoal } from '../functions/create-goal';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.post(
    '/goals',
    {
        schema: {
            body: zod.object({
                title: zod.string(),
                desiredWeeklyFrequency: zod.number().int().min(1).max(7),
            }),
        },
    },
    async (req, res) => {
        const { desiredWeeklyFrequency, title } = req.body;

        const { goal } = await createGoal({
            desiredWeeklyFrequency,
            title,
        });
    },
);

app.listen({
    port: 3333,
}).then(() => {
    console.log('HTTP Server is running!');
});
