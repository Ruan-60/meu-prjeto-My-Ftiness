import React, { useEffect, useState } from "react";

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
  const [weight, setWeight] = useState<number | "">("");
  const [report, setReport] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Atualiza exercícios quando o dia muda
  useEffect(() => {
    const firstExercise = workoutPlan[selectedDay][0].name;
    setSelectedExercise(firstExercise);
    setReps(Array(workoutPlan[selectedDay][0].sets).fill(0));
    const lastEntry = getHistory().find((e) => e.exercise === firstExercise);
    setWeight(lastEntry?.weight || "");
  }, [selectedDay]);

  // Atualiza reps quando exercício muda
  useEffect(() => {
    const exercise = workoutPlan[selectedDay].find(
      (ex) => ex.name === selectedExercise
    );
    if (exercise) {
      setReps(Array(exercise.sets).fill(0));
      const lastEntry = getHistory().find(
        (e) => e.exercise === selectedExercise
      );
      setWeight(lastEntry?.weight || "");
    }
  }, [selectedExercise, selectedDay]);

  useEffect(() => {
    loadHistory();
  }, []);

  function handleRepChange(index: number, value: number) {
    const newReps = [...reps];
    newReps[index] = value;
    setReps(newReps);
  }

  function handleCalculate() {
    const exercise = workoutPlan[selectedDay].find(
      (ex) => ex.name === selectedExercise
    );
    if (!exercise) return;

    if (!weight || weight <= 0) {
      alert("Por favor, insira um peso válido.");
      return;
    }

    if (reps.length !== exercise.sets || reps.some((r) => r <= 0)) {
      alert(`Preencha todas as ${exercise.sets} repetições.`);
      return;
    }

    const suggestionText =
      report !== ""
        ? `Relatório anotado: ${report}`
        : "Consistência! Continue evoluindo com qualidade.";

    setSuggestion(suggestionText);
    saveToHistory(reps, weight, suggestionText);
  }

  function saveToHistory(repsArray: number[], weightValue: number, suggestionText: string) {
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
    localStorage.setItem("workoutHistory", JSON.stringify(updatedHistory));
  }

  function getHistory(): HistoryEntry[] {
    return JSON.parse(localStorage.getItem("workoutHistory") || "[]");
  }

  function loadHistory() {
    const storedHistory = getHistory();
    setHistory(storedHistory);
  }

  function toggleHistory() {
    setShowHistory(!showHistory);
  }

  function clearHistory() {
    if (confirm("Tem certeza que deseja apagar TODO o histórico?")) {
      localStorage.removeItem("workoutHistory");
      setHistory([]);
    }
  }

  const currentExercise = workoutPlan[selectedDay].find(
    (ex) => ex.name === selectedExercise
  );

  return (
    <div className="container">
      <header>
        <h1>{"ABSOLUTE ♤ DOMINIUS"}</h1>
      </header>

      <main>
        <div className="controls">
          <div className="control-group">
            <label>Selecione o Dia do Treino:</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {Object.keys(workoutPlan).map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Selecione o Exercício:</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              {workoutPlan[selectedDay].map((ex) => (
                <option key={ex.name} value={ex.name}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentExercise && (
          <div className="card">
            <h3>{currentExercise.name}</h3>
            <p>
              <strong>Meta:</strong> {currentExercise.sets} séries de{" "}
              {currentExercise.reps} repetições.
            </p>

            <div className="series-inputs">
              {reps.map((r, idx) => (
                <div className="control-group" key={idx}>
                  <label>Série {idx + 1} (Reps)</label>
                  <input
                    type="number"
                    value={r === 0 ? "" : r}
                    onChange={(e) =>
                      handleRepChange(idx, parseInt(e.target.value))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="control-group" style={{ marginTop: "1rem" }}>
              <label>Peso Utilizado (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                placeholder="Ex: 35"
              />
            </div>
          </div>
        )}

        <div className="card">
          <div className="control-group">
            <label>Relatório: O que preciso melhorar?</label>
            <textarea
              rows={4}
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Ex: Aumentar carga, Repetições, Testar variações..."
            ></textarea>
          </div>
          <button onClick={handleCalculate}>Salvar Relatório</button>
        </div>

        {suggestion && <div className="card-suggestion">{suggestion}</div>}

        <div className="history-controls">
          <button onClick={toggleHistory}>Mostrar/Ocultar Histórico</button>
        </div>

        {showHistory && (
          <div id="history-log">
            <h2>Histórico de Treinos</h2>
            <div>
              {history.length === 0 && <p>Nenhum treino registrado ainda.</p>}
              {history.map((entry, idx) => (
                <div className="history-item" key={idx}>
                  <h4>
                    {entry.exercise} - {entry.date}
                  </h4>
                  <p>
                    <strong>Dia:</strong>{" "}
                    {entry.day.charAt(0).toUpperCase() + entry.day.slice(1)}
                  </p>
                  <p>
                    <strong>Peso:</strong> {entry.weight} kg
                  </p>
                  <p>
                    <strong>Reps por Série:</strong> {entry.setsDetail}
                  </p>
                  <p>
                    <strong>Relatório:</strong> {entry.suggestion}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={clearHistory}>Apagar Histórico</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
