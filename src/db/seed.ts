import dayjs from 'dayjs';
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

    //  Criando uma data de semana e iniciando pelo domingo
    const startOfWeek = dayjs().startOf('week');

    await db.insert(goalCompletions).values([
        // Setando que a data é o proprio domingo
        { goalId: goalOne.id, createdAt: startOfWeek.toDate() },
        // Setando que a data é dois dias pós inicio, ou seja, terça-feira
        { goalId: goalTwo.id, createdAt: startOfWeek.add(2, 'day').toDate() },
        // Quarta-feira
        { goalId: goalThree.id, createdAt: startOfWeek.add(3, 'day').toDate() },
    ]);
}

seed().finally(() => {
    client.end();
});
