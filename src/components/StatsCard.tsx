// src/components/StatsCard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';

interface StatsData {
  totalWorkouts: number;
  totalExercises: number;
  lastWorkout: string | null;
}

const StatsCard: React.FC = () => {
  const { isInitialized, getWorkoutStats } = useDatabase();
  const [stats, setStats] = useState<StatsData>({
    totalWorkouts: 0,
    totalExercises: 0,
    lastWorkout: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      loadStats();
    }
  }, [isInitialized]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await getWorkoutStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando estatísticas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Estatísticas</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
          <Text style={styles.statLabel}>Treinos Realizados</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalExercises}</Text>
          <Text style={styles.statLabel}>Exercícios</Text>
        </View>
      </View>

      {stats.lastWorkout && (
        <View style={styles.lastWorkoutCard}>
          <Text style={styles.lastWorkoutLabel}>Último Treino:</Text>
          <Text style={styles.lastWorkoutDate}>{stats.lastWorkout}</Text>
        </View>
      )}

      {stats.totalWorkouts === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>🎯</Text>
          <Text style={styles.emptyLabel}>Comece seu primeiro treino!</Text>
          <Text style={styles.emptyDescription}>
            Registre seus exercícios para acompanhar seu progresso
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  lastWorkoutCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  lastWorkoutLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastWorkoutDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default StatsCard;

