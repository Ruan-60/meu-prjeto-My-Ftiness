
// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDatabase } from "../hooks/useDatabase";
import { Exercise } from "../database/database";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { 
    isInitialized, 
    isLoading, 
    getExercisesByDay, 
    getExerciseByName, 
    saveWorkout, 
    getLastWorkoutForExercise 
  } = useDatabase();
  
  const [selectedDay, setSelectedDay] = useState<string>("segunda");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [reps, setReps] = useState<number[]>([]);
  const [weight, setWeight] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");

  useEffect(() => {
    if (isInitialized) {
      loadExercisesForDay();
    }
  }, [selectedDay, isInitialized]);

  useEffect(() => {
    if (selectedExercise && exercises.length > 0) {
      const exercise = exercises.find(ex => ex.name === selectedExercise);
      if (exercise) {
        setCurrentExercise(exercise);
        setReps(Array(exercise.sets).fill(0));
        loadHistoryForExercise(exercise.name);
      }
    }
  }, [selectedExercise, exercises]);

  const loadExercisesForDay = async () => {
    try {
      const dayExercises = await getExercisesByDay(selectedDay);
      setExercises(dayExercises);
      
      if (dayExercises.length > 0) {
        setSelectedExercise(dayExercises[0].name);
      }
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    }
  };

  const loadHistoryForExercise = async (exerciseName: string) => {
    try {
      const lastWorkout = await getLastWorkoutForExercise(exerciseName);
      if (lastWorkout) {
        setWeight(lastWorkout.weight.toString());
      } else {
        setWeight("");
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const handleRepChange = (index: number, value: string) => {
    const newReps = [...reps];
    newReps[index] = value === "" ? 0 : parseInt(value) || 0;
    setReps(newReps);
  };

  const saveToHistory = async (repsArray: number[], weightValue: number, suggestionText: string) => {
    if (!currentExercise) return;

    try {
      const sets = repsArray.map((reps, index) => ({
        setNumber: index + 1,
        reps: reps,
        weight: weightValue
      }));

      await saveWorkout({
        date: new Date().toLocaleDateString("pt-BR"),
        day: selectedDay,
        exerciseId: currentExercise.id,
        exerciseName: selectedExercise,
        weight: weightValue,
        setsDetail: repsArray.join(", "),
        suggestion: suggestionText,
        sets: sets
      });
      
      setSuggestion(suggestionText);
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const handleCalculate = async () => {
    if (!currentExercise) return;

    const weightValue = parseFloat(weight);
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      Alert.alert("Erro", "Por favor, insira um peso válido.");
      return;
    }

    if (reps.length !== currentExercise.sets || reps.some((r) => r <= 0)) {
      Alert.alert("Erro", `Preencha todas as ${currentExercise.sets} repetições.`);
      return;
    }

    const suggestionText = report !== "" ? `Relatório anotado: ${report}` : "Consistência! Continue evoluindo com qualidade.";
    await saveToHistory(reps, weightValue, suggestionText);
    Alert.alert("Salvo", "Relatório salvo com sucesso!");
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
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.title}>ABSOLUTE ♤ DOMINIUS</Text>
        </View>

        <View style={styles.controls}>
          <Text style={styles.label}>Selecione o Dia do Treino:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
            {["segunda", "quarta", "sexta", "sabado"].map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, selectedDay === day && styles.dayButtonSelected]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayButtonText, selectedDay === day && styles.dayButtonTextSelected]}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { marginTop: 12 }]}>Selecione o Exercício:</Text>
          <View style={styles.exerciseList}>
            {exercises.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                style={[styles.exerciseButton, selectedExercise === ex.name && styles.exerciseButtonSelected]}
                onPress={() => setSelectedExercise(ex.name)}
              >
                <Text style={[styles.exerciseText, selectedExercise === ex.name && styles.exerciseTextSelected]}>
                  {ex.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {currentExercise && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{currentExercise.name}</Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Meta:</Text> {currentExercise.sets} séries de {currentExercise.reps}.
            </Text>

            <Text style={styles.label}>Repetições por Série:</Text>
            {reps.map((r, idx) => (
              <View key={idx} style={styles.repRow}>
                <Text style={styles.repLabel}>Série {idx + 1}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0"
                  value={r === 0 ? "" : r.toString()}
                  onChangeText={(v) => handleRepChange(idx, v)}
                />
              </View>
            ))}

            <Text style={[styles.label, { marginTop: 8 }]}>Peso Utilizado (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="Ex: 35"
            />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Relatório: O que preciso melhorar?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            value={report}
            onChangeText={setReport}
            placeholder="Ex: Aumentar carga, Repetições, Testar variações..."
          />
          <TouchableOpacity style={styles.button} onPress={handleCalculate}>
            <Text style={styles.buttonText}>Salvar Relatório</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("History")}>
            <Text style={styles.linkButtonText}>Ver Histórico</Text>
          </TouchableOpacity>
        </View>

        {suggestion ? (
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1, padding: 16 },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#222" },
  controls: { marginBottom: 12 },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 8 },
  daySelector: { marginBottom: 8 },
  dayButton: { padding: 10, marginRight: 8, backgroundColor: "#e7e7e7", borderRadius: 8, minWidth: 90, alignItems: "center" },
  dayButtonSelected: { backgroundColor: "#007AFF" },
  dayButtonText: { color: "#555", fontWeight: "600" },
  dayButtonTextSelected: { color: "#fff" },
  exerciseList: { marginBottom: 12 },
  exerciseButton: { padding: 10, marginBottom: 8, backgroundColor: "#e7e7e7", borderRadius: 8 },
  exerciseButtonSelected: { backgroundColor: "#007AFF" },
  exerciseText: { color: "#444" },
  exerciseTextSelected: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  metaText: { color: "#666", marginBottom: 8 },
  bold: { fontWeight: "700" },
  repRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  repLabel: { flex: 1, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, minWidth: 80, textAlign: "center", backgroundColor: "#fff" },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },
  button: { backgroundColor: "#007AFF", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "700" },
  linkButton: { marginTop: 10, padding: 10, alignItems: "center" },
  linkButtonText: { color: "#007AFF", fontWeight: "600" },
  suggestionCard: { backgroundColor: "#e8f5e8", padding: 12, borderRadius: 10, marginTop: 6, borderLeftWidth: 4, borderLeftColor: "#4CAF50" },
  suggestionText: { color: "#2e7d32" },
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

export default HomeScreen;
