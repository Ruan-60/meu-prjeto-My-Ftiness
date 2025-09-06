import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Modal,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Exercise = {
  name: string;
  sets: number;
  reps: string;
};

type WorkoutPlan = {
  [day: string]: Exercise[];
};

type HistoryEntry = {
  date: string;
  day: string;
  exercise: string;
  setsDetail: string;
  weight: number;
  suggestion: string;
};

const workoutPlan: WorkoutPlan = {
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

const App: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>("segunda");
  const [selectedExercise, setSelectedExercise] = useState<string>(
    workoutPlan["segunda"][0].name
  );
  const [reps, setReps] = useState<number[]>([]);
  const [weight, setWeight] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  useEffect(() => {
    const firstExercise = workoutPlan[selectedDay][0].name;
    setSelectedExercise(firstExercise);
    setReps(Array(workoutPlan[selectedDay][0].sets).fill(0));
    loadHistoryForExercise(firstExercise);
  }, [selectedDay]);

  useEffect(() => {
    loadHistoryForExercise(selectedExercise);
  }, [selectedExercise]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistoryForExercise = async (exercise: string) => {
    try {
      const storedHistory = await getHistory();
      const lastEntry = storedHistory.find((e) => e.exercise === exercise);
      if (lastEntry) {
        setWeight(lastEntry.weight.toString());
      } else {
        setWeight("");
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleRepChange = (index: number, value: string) => {
    const newReps = [...reps];
    newReps[index] = value === '' ? 0 : parseInt(value) || 0;
    setReps(newReps);
  };

  const handleCalculate = async () => {
    const exercise = workoutPlan[selectedDay].find(
      (ex) => ex.name === selectedExercise
    );
    if (!exercise) return;

    const weightValue = parseFloat(weight);
    if (!weight || isNaN(weightValue) || weightValue <= 0) {
      Alert.alert("Erro", "Por favor, insira um peso válido.");
      return;
    }

    if (reps.length !== exercise.sets || reps.some((r) => r <= 0)) {
      Alert.alert("Erro", `Preencha todas as ${exercise.sets} repetições.`);
      return;
    }

    const suggestionText = report !== ""
      ? `Relatório anotado: ${report}`
      : "Consistência! Continue evoluindo com qualidade.";

    setSuggestion(suggestionText);
    await saveToHistory(reps, weightValue, suggestionText);
  };

  const saveToHistory = async (repsArray: number[], weightValue: number, suggestionText: string) => {
    const newEntry: HistoryEntry = {
      date: new Date().toLocaleDateString("pt-BR"),
      day: selectedDay,
      exercise: selectedExercise,
      setsDetail: repsArray.join(", "),
      weight: weightValue,
      suggestion: suggestionText,
    };
    
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    try {
      await AsyncStorage.setItem("workoutHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const getHistory = async (): Promise<HistoryEntry[]> => {
    try {
      const historyData = await AsyncStorage.getItem("workoutHistory");
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  };

  const loadHistory = async () => {
    try {
      const storedHistory = await getHistory();
      setHistory(storedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      "Confirmar",
      "Tem certeza que deseja apagar TODO o histórico?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Apagar",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("workoutHistory");
              setHistory([]);
            } catch (error) {
              console.error('Error clearing history:', error);
            }
          }
        }
      ]
    );
  };

  const currentExercise = workoutPlan[selectedDay].find(
    (ex) => ex.name === selectedExercise
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>ABSOLUTE ♤ DOMINIUS</Text>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            <Text style={styles.label}>Selecione o Dia do Treino:</Text>
            <ScrollView horizontal style={styles.daySelector} showsHorizontalScrollIndicator={false}>
              {Object.keys(workoutPlan).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDay === day && styles.dayButtonSelected
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDay === day && styles.dayButtonTextSelected
                  ]}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.label}>Selecione o Exercício:</Text>
            <ScrollView style={styles.exerciseSelector} showsVerticalScrollIndicator={false}>
              {workoutPlan[selectedDay].map((ex) => (
                <TouchableOpacity
                  key={ex.name}
                  style={[
                    styles.exerciseButton,
                    selectedExercise === ex.name && styles.exerciseButtonSelected
                  ]}
                  onPress={() => setSelectedExercise(ex.name)}
                >
                  <Text style={[
                    styles.exerciseButtonText,
                    selectedExercise === ex.name && styles.exerciseButtonTextSelected
                  ]}>
                    {ex.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {currentExercise && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{currentExercise.name}</Text>
            <Text style={styles.metaText}>
              <Text style={styles.bold}>Meta:</Text> {currentExercise.sets} séries de{" "}
              {currentExercise.reps} repetições.
            </Text>

            <View style={styles.seriesInputs}>
              <Text style={styles.label}>Repetições por Série:</Text>
              {reps.map((r, idx) => (
                <View style={styles.repInputContainer} key={idx}>
                  <Text style={styles.repLabel}>Série {idx + 1}</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={r === 0 ? "" : r.toString()}
                    onChangeText={(value) => handleRepChange(idx, value)}
                    placeholder="0"
                  />
                </View>
              ))}
            </View>

            <View style={styles.controlGroup}>
              <Text style={styles.label}>Peso Utilizado (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="Ex: 35"
              />
            </View>
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
        </View>

        {suggestion ? (
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
          <Text style={styles.historyButtonText}>Ver Histórico</Text>
        </TouchableOpacity>

        <Modal
          visible={showHistory}
          animationType="slide"
          onRequestClose={() => setShowHistory(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Histórico de Treinos</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Text style={styles.closeButton}>Fechar</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.historyList}>
              {history.length === 0 ? (
                <Text style={styles.emptyHistory}>Nenhum treino registrado ainda.</Text>
              ) : (
                history.map((entry, idx) => (
                  <View key={idx} style={styles.historyItem}>
                    <Text style={styles.historyTitle}>
                      {entry.exercise} - {entry.date}
                    </Text>
                    <Text style={styles.historyText}>
                      <Text style={styles.bold}>Dia:</Text>{" "}
                      {entry.day.charAt(0).toUpperCase() + entry.day.slice(1)}
                    </Text>
                    <Text style={styles.historyText}>
                      <Text style={styles.bold}>Peso:</Text> {entry.weight} kg
                    </Text>
                    <Text style={styles.historyText}>
                      <Text style={styles.bold}>Reps por Série:</Text> {entry.setsDetail}
                    </Text>
                    <Text style={styles.historyText}>
                      <Text style={styles.bold}>Relatório:</Text> {entry.suggestion}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
            
            {history.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
                <Text style={styles.clearButtonText}>Apagar Histórico</Text>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  controls: {
    marginBottom: 20,
  },
  controlGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  daySelector: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayButton: {
    padding: 12,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: 'white',
  },
  exerciseSelector: {
    maxHeight: 200,
  },
  exerciseButton: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  exerciseButtonSelected: {
    backgroundColor: '#007AFF',
  },
  exerciseButtonText: {
    color: '#666',
  },
  exerciseButtonTextSelected: {
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  seriesInputs: {
    marginBottom: 16,
  },
  repInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  repLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    minWidth: 80,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionCard: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  suggestionText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  historyButton: {
    backgroundColor: '#666',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  historyList: {
    flex: 1,
    padding: 16,
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  historyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;