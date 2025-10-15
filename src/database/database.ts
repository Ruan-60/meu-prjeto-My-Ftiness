import * as SQLite from 'expo-sqlite';

const DB_NAME = 'myfitness.db';

// Tipos para o banco de dados (Mantidos)
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
let initPromise: Promise<void> | null = null; // 📌 Novo: Promessa para rastrear o estado de inicialização

// 🚀 NOVO: Função para obter a instância do DB, garantindo que ele esteja inicializado
// Todas as funções que acessam o banco devem usar isso.
const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (db) {
        return db;
    }
    // Se a inicialização ainda não começou, inicie-a
    if (!initPromise) {
        initPromise = initDatabase();
    }
    // Aguarda a inicialização terminar
    await initPromise;
    
    if (!db) {
        // Isso só deve acontecer se initDatabase() falhar sem lançar um erro
        throw new Error('Falha crítica: o banco de dados não foi inicializado.');
    }
    return db;
};


export const initDatabase = async (): Promise<void> => {
  try {
    // 📌 Verificação: Se já está aberto/pronto, retorne.
    if (db) return; 

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

    // Criar tabela de séries individuais
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
    // Limpa a instância global para que a próxima tentativa possa começar do zero
    db = null; 
    initPromise = null; 
    throw error;
  }
};

// Inserir exercícios padrão
const insertDefaultExercises = async (): Promise<void> => {
  // 🎯 Correção: Não precisa verificar 'db', pois getDatabase() fará isso se necessário.
  const db = await getDatabase(); 
  
  try {
    // Verificar se já existem exercícios
    const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM exercises');
    if (result && (result as any).count > 0) {
      return; // Já existem exercícios
    }
    
    // Seu código de inserção de exercícios padrão (se houver) viria aqui...

    console.log('Exercícios padrão verificados.');
  } catch (error) {
    console.error('Erro ao inserir exercícios padrão:', error);
  }
};

// =========================================================================
// Funções de Acesso ao DB - TODAS FORAM ATUALIZADAS PARA USAR getDatabase()
// =========================================================================

export const getExercisesByDay = async (day: string): Promise<Exercise[]> => {
  const db = await getDatabase(); 
  
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
  const db = await getDatabase(); 
  
  try {
    const exercises = await db.getAllAsync('SELECT * FROM exercises ORDER BY day, id');
    return exercises as Exercise[];
  } catch (error) {
    console.error('Erro ao buscar todos os exercícios:', error);
    return [];
  }
};

export const getExerciseByName = async (name: string, day: string): Promise<Exercise | null> => {
  const db = await getDatabase(); 
  
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
  const db = await getDatabase(); 
  
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
  const db = await getDatabase(); // 🎯 CORREÇÃO APLICADA AQUI!
  
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
  const db = await getDatabase(); 
  
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
  const db = await getDatabase(); 
  
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
  const db = await getDatabase(); 
  
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
  const db = await getDatabase(); 
  
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
  const db = await getDatabase(); 
  
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


export const clearAllDays = async (): Promise<void> => {
  const db = await getDatabase(); 
  try {
    await db.runAsync('DELETE FROM exercises');
    console.log('Dias de treino apagados com sucesso!');
  } catch (error) {
    console.error('Erro ao apagar dias:', error);
    throw error;
  }
};

// 📌 MANTIDO: Você ainda pode exportar 'db', mas o ideal é usar getDatabase()
export { db };