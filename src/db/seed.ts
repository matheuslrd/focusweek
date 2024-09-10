import { client, db } from '.';
import { goalCompletions, goals } from './schema';

async function seed() {
    // Reiniciamos o banco e precisa estar nessa ordem, primeiro a dependente depois a tabela
    // que não depende de ninguém
    await db.delete(goalCompletions);
    await db.delete(goals);

    const [goalOne, goalTwo, goalThree] = await db
        .insert(goals)
        .values([
            { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
            { title: 'Ir para o Muai Thai', desiredWeeklyFrequency: 2 },
            { title: 'Jogar xbox', desiredWeeklyFrequency: 4 },
        ])
        .returning();

    await db.insert(goalCompletions).values([
        { goalId: goalOne.id, createdAt: new Date() },
        { goalId: goalTwo.id, createdAt: new Date() },
        { goalId: goalThree.id, createdAt: new Date() },
    ]);
}

seed().finally(() => {
    client.end();
});
