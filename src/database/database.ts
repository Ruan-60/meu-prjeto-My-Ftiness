// src/database/database.ts
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'myfitness.db';

// Tipos para o banco de dados
export interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  day: string;
  created_at: string;
}

export interface WorkoutHistory {
  id: number;
  date: string;
  day: string;
  exercise_id: number;
  exercise_name: string;
  weight: number;
  sets_detail: string;
  suggestion: string;
  created_at: string;
}

export interface WorkoutSet {
  id: number;
  workout_history_id: number;
  set_number: number;
  reps: number;
  weight: number;
}

// Instância do banco de dados
let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Criar tabela de exercícios
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps TEXT NOT NULL,
        day TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar tabela de histórico de treinos
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        day TEXT NOT NULL,
        exercise_id INTEGER,
        exercise_name TEXT NOT NULL,
        weight REAL NOT NULL,
        sets_detail TEXT NOT NULL,
        suggestion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      );
    `);

    // Criar tabela de séries individuais (para mais detalhamento)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_history_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workout_history_id) REFERENCES workout_history (id)
      );
    `);

    // Inserir exercícios padrão se não existirem
    await insertDefaultExercises();
    
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Inserir exercícios padrão
const insertDefaultExercises = async (): Promise<void> => {
  if (!db) return;

  try {
    // Verificar se já existem exercícios
    const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM exercises');
    if (result && (result as any).count > 0) {
      return; // Já existem exercícios
    }

    const defaultExercises = [
      // Segunda-feira
      { name: "Puxador frontal", sets: 4, reps: "8-12", day: "segunda" },
      { name: "Remada cavalinho", sets: 3, reps: "8-10", day: "segunda" },
      { name: "Remada baixa no cabo", sets: 3, reps: "8-12", day: "segunda" },
      { name: "Pullover", sets: 3, reps: "8-15", day: "segunda" },
      { name: "Rosca na maquina", sets: 3, reps: "8-10", day: "segunda" },
      { name: "Rosca martelo", sets: 3, reps: "10-12", day: "segunda" },
      
      // Quarta-feira
      { name: "Crucifixo no crossover", sets: 3, reps: "8-12", day: "quarta" },
      { name: "Crucifixo banco 30 graus", sets: 3, reps: "8-12", day: "quarta" },
      { name: "Supino inclinado com barra", sets: 3, reps: "8-12", day: "quarta" },
      { name: "Supino declinado", sets: 3, reps: "8-12", day: "quarta" },
      { name: "Tríceps testa na corda", sets: 3, reps: "8-12", day: "quarta" },
      { name: "Tríceps barra", sets: 3, reps: "8-15", day: "quarta" },
      
      // Sexta-feira
      { name: "Agachamento sumô", sets: 4, reps: "8-12", day: "sexta" },
      { name: "Leg press", sets: 3, reps: "8-12", day: "sexta" },
      { name: "Cadeira extensora", sets: 3, reps: "8-12", day: "sexta" },
      { name: "Cadeira flexora unilateral", sets: 4, reps: "8-15", day: "sexta" },
      { name: "Mesa flexora", sets: 4, reps: "8-15", day: "sexta" },
      { name: "Elevação pélvica", sets: 4, reps: "8-15", day: "sexta" },
      { name: "Panturrilha em pé", sets: 4, reps: "8-12", day: "sexta" },
      
      // Sábado
      { name: "Desenvolvimento na máquina", sets: 3, reps: "8-10", day: "sabado" },
      { name: "Elevação lateral com halteres", sets: 3, reps: "8-15", day: "sabado" },
      { name: "Remada lateral no cabo", sets: 4, reps: "8-15", day: "sabado" },
      { name: "Crucifixo inverso", sets: 3, reps: "8-15", day: "sabado" },
      { name: "Posterior no cabo unilateral", sets: 3, reps: "8-15", day: "sabado" },
      { name: "Elevação frontal", sets: 3, reps: "8-12", day: "sabado" },
    ];

    for (const exercise of defaultExercises) {
      await db.runAsync(
        'INSERT INTO exercises (name, sets, reps, day) VALUES (?, ?, ?, ?)',
        [exercise.name, exercise.sets, exercise.reps, exercise.day]
      );
    }

    console.log('Exercícios padrão inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir exercícios padrão:', error);
  }
};

// Funções para exercícios
export const getExercisesByDay = async (day: string): Promise<Exercise[]> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const exercises = await db.getAllAsync(
      'SELECT * FROM exercises WHERE day = ? ORDER BY id',
      [day]
    );
    return exercises as Exercise[];
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error);
    return [];
  }
};

export const getAllExercises = async (): Promise<Exercise[]> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const exercises = await db.getAllAsync('SELECT * FROM exercises ORDER BY day, id');
    return exercises as Exercise[];
  } catch (error) {
    console.error('Erro ao buscar todos os exercícios:', error);
    return [];
  }
};

export const getExerciseByName = async (name: string, day: string): Promise<Exercise | null> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const exercise = await db.getFirstAsync(
      'SELECT * FROM exercises WHERE name = ? AND day = ?',
      [name, day]
    );
    return exercise as Exercise | null;
  } catch (error) {
    console.error('Erro ao buscar exercício:', error);
    return null;
  }
};

// Funções para histórico de treinos
export const saveWorkoutHistory = async (workoutData: {
  date: string;
  day: string;
  exerciseId: number;
  exerciseName: string;
  weight: number;
  setsDetail: string;
  suggestion: string;
  sets: { setNumber: number; reps: number; weight: number }[];
}): Promise<number> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const result = await db.runAsync(
      `INSERT INTO workout_history 
       (date, day, exercise_id, exercise_name, weight, sets_detail, suggestion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        workoutData.date,
        workoutData.day,
        workoutData.exerciseId,
        workoutData.exerciseName,
        workoutData.weight,
        workoutData.setsDetail,
        workoutData.suggestion
      ]
    );

    const workoutHistoryId = result.lastInsertRowId as number;

    // Salvar séries individuais
    for (const set of workoutData.sets) {
      await db.runAsync(
        'INSERT INTO workout_sets (workout_history_id, set_number, reps, weight) VALUES (?, ?, ?, ?)',
        [workoutHistoryId, set.setNumber, set.reps, set.weight]
      );
    }

    return workoutHistoryId;
  } catch (error) {
    console.error('Erro ao salvar histórico de treino:', error);
    throw error;
  }
};

export const getWorkoutHistory = async (): Promise<WorkoutHistory[]> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const history = await db.getAllAsync(
      'SELECT * FROM workout_history ORDER BY created_at DESC'
    );
    return history as WorkoutHistory[];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
};

export const getWorkoutHistoryByExercise = async (exerciseName: string): Promise<WorkoutHistory[]> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const history = await db.getAllAsync(
      'SELECT * FROM workout_history WHERE exercise_name = ? ORDER BY created_at DESC',
      [exerciseName]
    );
    return history as WorkoutHistory[];
  } catch (error) {
    console.error('Erro ao buscar histórico do exercício:', error);
    return [];
  }
};

export const getLastWorkoutForExercise = async (exerciseName: string): Promise<WorkoutHistory | null> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const workout = await db.getFirstAsync(
      'SELECT * FROM workout_history WHERE exercise_name = ? ORDER BY created_at DESC LIMIT 1',
      [exerciseName]
    );
    return workout as WorkoutHistory | null;
  } catch (error) {
    console.error('Erro ao buscar último treino:', error);
    return null;
  }
};

export const clearWorkoutHistory = async (): Promise<void> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    await db.runAsync('DELETE FROM workout_sets');
    await db.runAsync('DELETE FROM workout_history');
    console.log('Histórico de treinos limpo com sucesso!');
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    throw error;
  }
};

export const getWorkoutSets = async (workoutHistoryId: number): Promise<WorkoutSet[]> => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const sets = await db.getAllAsync(
      'SELECT * FROM workout_sets WHERE workout_history_id = ? ORDER BY set_number',
      [workoutHistoryId]
    );
    return sets as WorkoutSet[];
  } catch (error) {
    console.error('Erro ao buscar séries:', error);
    return [];
  }
};

// Função para obter estatísticas
export const getWorkoutStats = async () => {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const totalWorkouts = await db.getFirstAsync('SELECT COUNT(*) as count FROM workout_history');
    const totalExercises = await db.getFirstAsync('SELECT COUNT(*) as count FROM exercises');
    const lastWorkout = await db.getFirstAsync(
      'SELECT date FROM workout_history ORDER BY created_at DESC LIMIT 1'
    );

    return {
      totalWorkouts: (totalWorkouts as any)?.count || 0,
      totalExercises: (totalExercises as any)?.count || 0,
      lastWorkout: (lastWorkout as any)?.date || null,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      lastWorkout: null,
    };
  }
};

export { db };
