// src/data/workoutPlan.ts
export type Exercise = {
  name: string;
  sets: number;
  reps: string;
};

export type WorkoutPlan = {
  [day: string]: Exercise[];
};

export type HistoryEntry = {
  date: string;
  day: string;
  exercise: string;
  setsDetail: string;
  weight: number;
  suggestion: string;
};

export const workoutPlan: WorkoutPlan = {
  segunda: [
    { name: "Puxador frontal", sets: 4, reps: "8-12" },
    { name: "Remada cavalinho", sets: 3, reps: "8-10" },
    { name: "Remada baixa no cabo", sets: 3, reps: "8-12" },
    { name: "Pullover", sets: 3, reps: "8-15" },
    { name: "Rosca na maquina", sets: 3, reps: "8-10" },
    { name: "Rosca martelo", sets: 3, reps: "10-12" },
  ],
  quarta: [
    { name: "Crucifixo no crossover", sets: 3, reps: "8-12" },
    { name: "Crucifixo banco 30 graus", sets: 3, reps: "8-12" },
    { name: "Supino inclinado com barra", sets: 3, reps: "8-12" },
    { name: "Supino declinado", sets: 3, reps: "8-12" },
    { name: "Tríceps testa na corda", sets: 3, reps: "8-12" },
    { name: "Tríceps barra", sets: 3, reps: "8-15" },
  ],
  sexta: [
    { name: "Agachamento sumô", sets: 4, reps: "8-12" },
    { name: "Leg press", sets: 3, reps: "8-12" },
    { name: "Cadeira extensora", sets: 3, reps: "8-12" },
    { name: "Cadeira flexora unilateral", sets: 4, reps: "8-15" },
    { name: "Mesa flexora", sets: 4, reps: "8-15" },
    { name: "Elevação pélvica", sets: 4, reps: "8-15" },
    { name: "Panturrilha em pé", sets: 4, reps: "8-12" },
  ],
  sabado: [
    { name: "Desenvolvimento na máquina", sets: 3, reps: "8-10" },
    { name: "Elevação lateral com halteres", sets: 3, reps: "8-15" },
    { name: "Remada lateral no cabo", sets: 4, reps: "8-15" },
    { name: "Crucifixo inverso", sets: 3, reps: "8-15" },
    { name: "Posterior no cabo unilateral", sets: 3, reps: "8-15" },
    { name: "Elevação frontal", sets: 3, reps: "8-12" },
  ],
};
