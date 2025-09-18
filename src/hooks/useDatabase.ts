// src/hooks/useDatabase.ts
import { useEffect, useState } from 'react';
import { 
  initDatabase, 
  getExercisesByDay, 
  getAllExercises,
  getExerciseByName,
  saveWorkoutHistory,
  getWorkoutHistory,
  getWorkoutHistoryByExercise,
  getLastWorkoutForExercise,
  clearWorkoutHistory,
  getWorkoutSets,
  getWorkoutStats,
  Exercise,
  WorkoutHistory,
  WorkoutSet
} from '../database/database';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDB();
  }, []);

  const initializeDB = async () => {
    try {
      setIsLoading(true);
      await initDatabase();
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExercisesByDayFromDB = async (day: string): Promise<Exercise[]> => {
    if (!isInitialized) return [];
    try {
      return await getExercisesByDay(day);
    } catch (error) {
      console.error('Erro ao buscar exercícios por dia:', error);
      return [];
    }
  };

  const getAllExercisesFromDB = async (): Promise<Exercise[]> => {
    if (!isInitialized) return [];
    try {
      return await getAllExercises();
    } catch (error) {
      console.error('Erro ao buscar todos os exercícios:', error);
      return [];
    }
  };

  const getExerciseByNameFromDB = async (name: string, day: string): Promise<Exercise | null> => {
    if (!isInitialized) return null;
    try {
      return await getExerciseByName(name, day);
    } catch (error) {
      console.error('Erro ao buscar exercício por nome:', error);
      return null;
    }
  };

  const saveWorkoutToHistory = async (workoutData: {
    date: string;
    day: string;
    exerciseId: number;
    exerciseName: string;
    weight: number;
    setsDetail: string;
    suggestion: string;
    sets: { setNumber: number; reps: number; weight: number }[];
  }): Promise<number | null> => {
    if (!isInitialized) return null;
    try {
      return await saveWorkoutHistory(workoutData);
    } catch (error) {
      console.error('Erro ao salvar treino no histórico:', error);
      return null;
    }
  };

  const getWorkoutHistoryFromDB = async (): Promise<WorkoutHistory[]> => {
    if (!isInitialized) return [];
    try {
      return await getWorkoutHistory();
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  };

  const getWorkoutHistoryByExerciseFromDB = async (exerciseName: string): Promise<WorkoutHistory[]> => {
    if (!isInitialized) return [];
    try {
      return await getWorkoutHistoryByExercise(exerciseName);
    } catch (error) {
      console.error('Erro ao buscar histórico por exercício:', error);
      return [];
    }
  };

  const getLastWorkoutForExerciseFromDB = async (exerciseName: string): Promise<WorkoutHistory | null> => {
    if (!isInitialized) return null;
    try {
      return await getLastWorkoutForExercise(exerciseName);
    } catch (error) {
      console.error('Erro ao buscar último treino:', error);
      return null;
    }
  };

  const clearWorkoutHistoryFromDB = async (): Promise<boolean> => {
    if (!isInitialized) return false;
    try {
      await clearWorkoutHistory();
      return true;
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      return false;
    }
  };

  const getWorkoutSetsFromDB = async (workoutHistoryId: number): Promise<WorkoutSet[]> => {
    if (!isInitialized) return [];
    try {
      return await getWorkoutSets(workoutHistoryId);
    } catch (error) {
      console.error('Erro ao buscar séries:', error);
      return [];
    }
  };

  const getWorkoutStatsFromDB = async () => {
    if (!isInitialized) return {
      totalWorkouts: 0,
      totalExercises: 0,
      lastWorkout: null,
    };
    try {
      return await getWorkoutStats();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalWorkouts: 0,
        totalExercises: 0,
        lastWorkout: null,
      };
    }
  };

  return {
    isInitialized,
    isLoading,
    getExercisesByDay: getExercisesByDayFromDB,
    getAllExercises: getAllExercisesFromDB,
    getExerciseByName: getExerciseByNameFromDB,
    saveWorkout: saveWorkoutToHistory,
    getWorkoutHistory: getWorkoutHistoryFromDB,
    getWorkoutHistoryByExercise: getWorkoutHistoryByExerciseFromDB,
    getLastWorkoutForExercise: getLastWorkoutForExerciseFromDB,
    clearWorkoutHistory: clearWorkoutHistoryFromDB,
    getWorkoutSets: getWorkoutSetsFromDB,
    getWorkoutStats: getWorkoutStatsFromDB,
  };
};
