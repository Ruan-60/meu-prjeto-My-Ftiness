import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDatabase } from "../hooks/useDatabase";
import { WorkoutHistory } from "../database/database";

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const { 
    isInitialized, 
    isLoading, 
    getWorkoutHistory, 
    clearWorkoutHistory 
  } = useDatabase();

  // Atualiza o histórico sempre que a tela fica visível
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        loadHistory();
      }
    }, [isInitialized])
  );

  const loadHistory = async () => {
    try {
      const workoutHistory = await getWorkoutHistory();
      setHistory(workoutHistory);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const clearHistory = async () => {
    Alert.alert("Apagar histórico?", "Essa ação não pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar",
        onPress: async () => {
          const success = await clearWorkoutHistory();
          if (success) {
            setHistory([]);
            Alert.alert("Sucesso", "Histórico apagado com sucesso!");
          } else {
            Alert.alert("Erro", "Falha ao apagar histórico.");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Inicializando banco de dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Histórico de Treinos</Text>
      <ScrollView>
        {history.length === 0 ? (
          <Text style={styles.empty}>Nenhum treino registrado.</Text>
        ) : (
          history.map((h) => (
            <View key={h.id} style={styles.card}>
              <Text style={styles.exercise}>{h.exercise_name}</Text>
              <Text>Dia: {h.day}</Text>
              <Text>Peso: {h.weight} kg</Text>
              <Text>Séries: {h.sets_detail}</Text>
              <Text>Relatório: {h.suggestion}</Text>
              <Text style={styles.date}>{h.date}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {history.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
          <Text style={styles.clearText}>Apagar Histórico</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  empty: { textAlign: "center", color: "#666", marginTop: 50 },
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  exercise: { fontWeight: "bold", fontSize: 16 },
  date: { color: "#666", fontSize: 12, marginTop: 4 },
  clearBtn: {
    backgroundColor: "#ff3b30",
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  clearText: { color: "white", textAlign: "center", fontWeight: "600" },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#f5f5f5" 
  },
  loadingText: { 
    fontSize: 18, 
    color: "#666", 
    fontWeight: "600" 
  },
});

export default HistoryScreen;
