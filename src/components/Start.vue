<template>
  <div class="app-container">
    <!-- Progress Bar -->
    <div v-if="currentStep === 'survey'" class="progress-bar">
      <div class="progress" :style="{ width: `${progress}%` }"></div>
    </div>

    <div class="content-container">
      <!-- Enqueteur Input Step -->
      <div v-if="currentStep === 'enqueteur'">
        <h2>Prénom enqueteur :</h2>
        <input class="form-control" type="text" v-model="enqueteur" />
        <button
          v-if="enqueteur && !isEnqueteurSaved"
          @click="setEnqueteur"
          class="btn-next"
        >
          Suivant
        </button>
      </div>

      <!-- Start Survey Step -->
      <div v-else-if="currentStep === 'start'" class="start-survey-container">
        <h2>Bonjour Madame/Monsieur</h2>
        <button @click="startSurvey" class="btn-next">
          COMMENCER QUESTIONNAIRE
        </button>
      </div>

      <!-- Survey Questions Step -->
      <div v-else-if="currentStep === 'survey' && !isSurveyComplete">
        <div class="question-container">
          <h2>{{ currentQuestionText }}</h2>
          


          <!-- PDF Button - not used in merchant survey -->
          <!-- Removed old survey PDF button -->

          <!-- Commune Selector for old survey Q2 -->
          <div
            v-if="
              currentQuestion.id === 'Q2_d' ||
              currentQuestion.id === 'Q2_nv'
            "
          >
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
            >
              <button @click="selectAnswer(option, index)" class="btn-option">
                {{ option.text }}
              </button>
            </div>
          </div>
          <div
            v-else-if="
              currentQuestion.id === 'Q2_precision' ||
              currentQuestion.id === 'Q2d_precision' ||
              currentQuestion.id === 'Q2_precis_nv'
            "
          >
            <CommuneSelector
              v-model="selectedCommune"
              v-model:postalCodePrefix="postalCodePrefix"
            />
            <p>Commune sélectionnée ou saisie: {{ selectedCommune }}</p>
            <button
              @click="handleCommuneSelection"
              class="btn-next"
              :disabled="!selectedCommune.trim()"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>
          <!-- Station dropdown - not used in merchant survey -->
          <!-- Removed old survey station selector -->
          <!-- Street Input - not used in merchant survey -->
          <!-- Removed old survey street selector -->
          <!-- Multiple Choice Questions (checkboxes) -->
          <div v-else-if="currentQuestion.multipleChoice">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="checkbox-option"
            >
              <label :for="`option_${index}`" class="checkbox-label">
                <input
                  type="checkbox"
                  :id="`option_${index}`"
                  :value="option.id"
                  v-model="multipleChoiceSelections"
                  class="checkbox-input"
                />
                {{ option.text }}
              </label>
            </div>
            <button
              v-if="multipleChoiceSelections.length > 0"
              @click="handleMultipleChoiceAnswer"
              class="btn-next"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>
          <!-- Single Choice Questions -->
          <div v-else-if="!currentQuestion.freeText">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
            >
              <button @click="selectAnswer(option, index)" class="btn-option">
                {{ option.text }}
              </button>
            </div>
          </div>
          <!-- Free Text Questions -->
          <div v-else>
            <div class="input-container">
              <input
                v-model="freeTextAnswer"
                class="form-control"
                :type="currentQuestion.validation === 'numeric' ? 'number' : 'text'"
                :placeholder="
                  currentQuestion.freeTextPlaceholder || 'Votre réponse'
                "
                :inputmode="currentQuestion.validation === 'numeric' ? 'numeric' : undefined"
              />
            </div>
            <button
              @click="handleFreeTextAnswer"
              class="btn-next"
              :disabled="!freeTextAnswer || freeTextAnswer.toString().trim() === ''"
            >
              {{ isLastQuestion ? "Terminer" : "Suivant" }}
            </button>
          </div>
          <!-- Back Button -->
          <button @click="previousQuestion" class="btn-return" v-if="canGoBack">
            Retour
          </button>
        </div>
      </div>

      <!-- Survey Complete Step -->
      <div v-else-if="isSurveyComplete" class="survey-complete">
        <h2>Merci pour votre réponse et bonne journée.</h2>
        <button @click="resetSurvey" class="btn-next">
          Nouveau questionnaire
        </button>
      </div>

      <!-- Logo -->
      <img class="logo" src="../assets/Alycelogo.webp" alt="Logo Alyce" />
    </div>

    <!-- Footer -->
    <div class="footer">
      <AdminDashboard />
    </div>

    <!-- PDF Modal -->
    <div v-if="showPdf" class="modal">
      <div class="modal-content pdf-content">
        <button
          class="close"
          @click="
            () => {
              showPdf = false;
              console.log('Closing PDF modal');
            }
          "
        >
          ×
        </button>
        <iframe
          :src="pdfUrl"
          width="100%"
          height="500px"
          type="application/pdf"
        >
          This browser does not support PDFs. Please download the PDF to view
          it.
        </iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { questions } from "./surveyQuestions.js";

console.log("Imported questions:", questions.length, "questions");
console.log("First question:", questions[0]);
import CommuneSelector from "./CommuneSelector.vue";
import AdminDashboard from "./AdminDashboard.vue";

// Refs for state management
const docCount = ref(0);
const currentStep = ref("enqueteur");
const startDate = ref("");
const enqueteur = ref("");
const currentQuestionIndex = ref(0);
const answers = ref({ question_answers: [] }); // Initialize with empty question_answers array
const freeTextAnswer = ref("");
const questionPath = ref(["Q1"]);
const isEnqueteurSaved = ref(false);
const isSurveyComplete = ref(false);
const selectedStation = ref("");
const selectedCommune = ref("");
const postalCodePrefix = ref("");
const showPdf = ref(false);
const pdfUrl = ref("/Plan.pdf");
const stationInput = ref("");
const streetInput = ref("");
const filteredStations = ref([]);
const filteredStreets = ref([]);
const selectedPoste = ref(null);
const multipleChoiceSelections = ref([]);
const isFinishing = ref(false);

// Expose refs for testing purposes
defineExpose({
  enqueteur: enqueteur,
  startDate: startDate,
  answers: answers,
  isFinishing: isFinishing,
  currentStep: currentStep,
});

// Firestore refs
const surveyCollectionRef = collection(db, "commerces");
const counterDocRef = doc(db, "commercescounters", "surveyCounter");

// Stations list
const stationsList = [];

// Streets list  
const streetsList = [];


// Computed properties
const currentQuestion = computed(() => {
  const question = currentQuestionIndex.value >= 0 &&
    currentQuestionIndex.value < questions.length
    ? questions[currentQuestionIndex.value]
    : null;
  
  console.log("Computing current question:", {
    index: currentQuestionIndex.value,
    totalQuestions: questions.length,
    question: question
  });
  
  return question;
});

// Add computed property for dynamic question text
const currentQuestionText = computed(() => {
  if (!currentQuestion.value) return "";
  
  // Check if question has conditionalText
  if (currentQuestion.value.conditionalText) {
    const conditionId = currentQuestion.value.conditionalText.condition;
    // Find the answer to the condition question
    const answerObj = answers.value.question_answers.find(
      (qa) => qa.questionId === conditionId
    );
    const answerIndex = answerObj ? answerObj.optionIndex : null;
    
    // Find the route that matches the answer index
    const route = currentQuestion.value.conditionalText.routes.find(
      (r) => r.value === answerIndex
    );
    
    if (route) {
      return route.text;
    }
  }
  
  // Return default text
  return currentQuestion.value.text;
});

const showFilteredStations = computed(
  () => stationInput.value.length > 0 && filteredStations.value.length > 0
);

const showFilteredStreets = computed(
  () => streetInput.value.length > 0 && filteredStreets.value.length > 0
);

const canGoBack = computed(() => questionPath.value.length > 1);

const isLastQuestion = computed(
  () => currentQuestionIndex.value === questions.length - 1
);

const progress = computed(() => {
  if (currentStep.value !== "survey") return 0;
  if (isSurveyComplete.value) return 100;
  const totalQuestions = questions.length;
  const currentQuestionNumber = currentQuestionIndex.value + 1;
  const isLastOrEnding =
    isLastQuestion.value ||
    currentQuestion.value?.options?.some((option) => option.next === "end");
  return isLastOrEnding
    ? 100
    : Math.min(Math.round((currentQuestionNumber / totalQuestions) * 100), 99);
});

const isValidCommuneSelection = computed(() => {
  return (
    selectedCommune.value.includes(" - ") || selectedCommune.value.trim() !== ""
  );
});

// Add these new methods
const filterStations = () => {
  const input = stationInput.value.toLowerCase();
  filteredStations.value = stationsList.filter((station) =>
    station.toLowerCase().includes(input)
  );
};

const filterStreets = () => {
  const input = streetInput.value.toLowerCase();
  filteredStreets.value = streetsList.filter((street) =>
    street.toLowerCase().includes(input)
  );
};

const selectStation = (station) => {
  stationInput.value = station;
  filteredStations.value = [];
};

const selectStreet = (street) => {
  streetInput.value = street;
  filteredStreets.value = [];
};

// Methods
const setEnqueteur = () => {
  if (enqueteur.value.trim() !== "") {
    currentStep.value = "start";
    isEnqueteurSaved.value = true;
  }
};

const startSurvey = () => {
  // Set the start date using the current time
  const now = new Date();
  startDate.value = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log("==== NEW SURVEY STARTED ====");
  console.log("Survey started at:", startDate.value);

  // Create a completely new answers object to avoid referencing previous data
  answers.value = { question_answers: [] };

  // Clear any previous sessionStorage to start fresh
  sessionStorage.removeItem("vehicleType");

  
  // Reset all state
  currentStep.value = "survey";
  isSurveyComplete.value = false;

  // Start with Q1 question
  questionPath.value = ["Q1"];
  currentQuestionIndex.value = 0;

  // Reset all input fields
  freeTextAnswer.value = "";
  selectedCommune.value = "";
  postalCodePrefix.value = "";
  stationInput.value = "";
  streetInput.value = "";

  // Clear filtered lists
  filteredStations.value = [];
  filteredStreets.value = [];

  // Clear multiple choice selections
  multipleChoiceSelections.value = [];

  console.log("Survey state initialized, ready for responses");
  console.log("Current answers object:", answers.value);
  console.log("Current question index:", currentQuestionIndex.value);
  console.log("Current question:", currentQuestion.value);
  console.log("Question path:", questionPath.value);
};

const selectAnswer = (option, index) => {
  const questionId = currentQuestion.value.id;

  // Debug logging
  debugBeforeAnswer(questionId, option, index);

  // Track this answer in the question_answers array only
  if (!answers.value.question_answers) {
    answers.value.question_answers = [];
  }

  // First remove any existing entry for this question (in case of changing answer)
  const existingIndex = answers.value.question_answers.findIndex(
    (qa) => qa.questionId === questionId
  );
  if (existingIndex !== -1) {
    answers.value.question_answers.splice(existingIndex, 1);
  }

  // Add the current question-answer to the tracking array only
  answers.value.question_answers.push({
    questionId: questionId,
    questionText: currentQuestion.value.text,
    optionId: option.id || `option_${index + 1}`,
    optionText: option.text,
    optionIndex: index,
  });

  // Log the selection for debugging
  console.log(
    `Selected answer for ${questionId}: ${option.text} (value: ${index + 1}, id: ${option.id || `option_${index + 1}`})`
  );

  // Get the next question ID based on the selected option
  const nextQuestionId = option.next;

  // Determine what to do next
  if (nextQuestionId === "end") {
    finishSurvey();
  } else if (option.requiresPrecision) {
    nextQuestion(nextQuestionId);
  } else {
    nextQuestion(nextQuestionId);
  }
};

const handleMultipleChoiceAnswer = () => {
  const questionId = currentQuestion.value.id;
  
  if (multipleChoiceSelections.value.length > 0) {
    // Track this multiple choice answer in the question_answers array
    if (!answers.value.question_answers) {
      answers.value.question_answers = [];
    }

    // Remove any existing entry for this question
    const existingIndex = answers.value.question_answers.findIndex(
      (qa) => qa.questionId === questionId
    );
    if (existingIndex !== -1) {
      answers.value.question_answers.splice(existingIndex, 1);
    }

    // Create a string of selected option IDs separated by commas
    const selectedOptionsText = multipleChoiceSelections.value
      .map(optionId => {
        const option = currentQuestion.value.options.find(opt => opt.id === optionId);
        return option ? option.text : optionId;
      })
      .join(", ");

    // Add the multiple choice answer
    answers.value.question_answers.push({
      questionId: questionId,
      questionText: currentQuestion.value.text,
      optionId: multipleChoiceSelections.value.join(","), // Store as comma-separated IDs
      optionText: selectedOptionsText,
      optionIndex: -1, // Use -1 to indicate multiple choice
    });

    console.log(`Multiple choice answer for ${questionId}:`, multipleChoiceSelections.value);

    // Check if any selected option requires precision
    const requiresPrecisionOption = currentQuestion.value.options.find(
      option => multipleChoiceSelections.value.includes(option.id) && option.requiresPrecision
    );

    if (requiresPrecisionOption) {
      nextQuestion(requiresPrecisionOption.next);
    } else {
      // Use the next from the first selected option (they should all have the same next)
      const firstSelectedOption = currentQuestion.value.options.find(
        option => multipleChoiceSelections.value.includes(option.id)
      );
      nextQuestion(firstSelectedOption?.next);
    }

    // Clear selections for next question
    multipleChoiceSelections.value = [];
  }
};

const handleFreeTextAnswer = () => {
  console.log("=== handleFreeTextAnswer called ===");
  console.log("Current question:", currentQuestion.value);
  console.log("Free text answer:", freeTextAnswer.value);
  
  if (currentQuestion.value) {
    // No special handling needed for merchant survey questions

    answers.value[currentQuestion.value.id] = freeTextAnswer.value;

    // Track this free text answer in the question_answers array
    if (!answers.value.question_answers) {
      answers.value.question_answers = [];
    }

    answers.value.question_answers.push({
      questionId: currentQuestion.value.id,
      questionText: currentQuestion.value.text,
      optionId: "freetext",
      optionText: freeTextAnswer.value,
      optionIndex: 0,
    });

    console.log("Answer saved, calling nextQuestion()");
    console.log("Current question next property:", currentQuestion.value.next);

    if (currentQuestionIndex.value < questions.length - 1) {
      nextQuestion();
    } else {
      finishSurvey();
    }
  } else {
    console.log("No current question found!");
  }
};

// Removed handleStationSelection - not used in merchant survey

// Removed handleStreetSelection - not used in merchant survey

// Add these watches
watch(stationInput, () => {
  filterStations();
});

watch(streetInput, () => {
  filterStreets();
});

const updateSelectedCommune = (value) => {
  selectedCommune.value = value;
};

// Removed handleCommuneSelection - not used in merchant survey

const nextQuestion = (forcedNextId = null) => {
  console.log("=== nextQuestion called ===");
  console.log("Forced next ID:", forcedNextId);
  console.log("Current question:", currentQuestion.value);
  
  let nextQuestionId = forcedNextId;

  if (!nextQuestionId && currentQuestion.value) {
    if (currentQuestion.value.next) {
      nextQuestionId = currentQuestion.value.next;
      console.log("Using next property:", nextQuestionId);
    } else if (!currentQuestion.value.freeText) {
      const selectedAnswer = answers.value[currentQuestion.value.id];
      const selectedOption = currentQuestion.value.options[selectedAnswer - 1];
      nextQuestionId = selectedOption?.next || null;
      console.log("Using option next:", nextQuestionId);
    }
  }

  // Handle conditionalNext routing nodes
  if (nextQuestionId) {
    const nextQuestionObj = questions.find((q) => q.id === nextQuestionId);
    if (nextQuestionObj && nextQuestionObj.conditionalNext) {
      // Get the answer to the condition question
      const conditionId = nextQuestionObj.conditionalNext.condition;
      // Find the answer index from question_answers array
      const answerObj = answers.value.question_answers.find(
        (qa) => qa.questionId === conditionId
      );
      const answerIndex = answerObj ? answerObj.optionIndex : null;
      
      // Find the route that matches the answer index
      const route = nextQuestionObj.conditionalNext.routes.find(
        (r) => r.value === answerIndex
      );
      if (route) {
        nextQuestionId = route.next;
      } else {
        // If no route matches, skip to the next question after this node
        const idx = questions.findIndex((q) => q.id === nextQuestionId);
        nextQuestionId = questions[idx + 1]?.id || null;
      }
    }
  }

  console.log("Final next question ID:", nextQuestionId);
  
  if (nextQuestionId === "end") {
    console.log("Survey ending");
    finishSurvey();
  } else if (nextQuestionId) {
    const nextIndex = questions.findIndex((q) => q.id === nextQuestionId);
    console.log("Next question index:", nextIndex);
    if (nextIndex !== -1) {
      console.log("Moving to question:", nextQuestionId, "at index:", nextIndex);
      currentQuestionIndex.value = nextIndex;
      questionPath.value.push(nextQuestionId);
      freeTextAnswer.value = "";
      selectedCommune.value = "";
      postalCodePrefix.value = "";
      multipleChoiceSelections.value = [];
    } else {
      console.log("ERROR: Could not find question with ID:", nextQuestionId);
    }
  } else {
    console.log("ERROR: No next question ID determined");
  }
};

const previousQuestion = () => {
  if (canGoBack.value) {
    // Remove current question from path
    const currentQuestionId = questionPath.value.pop();
    const previousQuestionId =
      questionPath.value[questionPath.value.length - 1];

    // Find indices
    const previousIndex = questions.findIndex(
      (q) => q.id === previousQuestionId
    );

    if (previousIndex !== -1) {
      // Update current question index
      currentQuestionIndex.value = previousIndex;

      // Clear current question's answers
      if (currentQuestionId) {
        // Clear main answer
        delete answers.value[currentQuestionId];

        // Clear any custom/additional fields
        delete answers.value[`${currentQuestionId}_CUSTOM`];

        // Also remove from question_answers array if it exists
        if (
          answers.value.question_answers &&
          answers.value.question_answers.length > 0
        ) {
          // Find the index of the current question in question_answers array
          const qaIndex = answers.value.question_answers.findIndex(
            (qa) => qa.questionId === currentQuestionId
          );

          // If found, remove it
          if (qaIndex !== -1) {
            answers.value.question_answers.splice(qaIndex, 1);
          }
        }

        // No special cleanup needed for merchant survey
      }

      // Reset all input fields
      freeTextAnswer.value = "";
      stationInput.value = "";
      streetInput.value = "";
      selectedCommune.value = "";
      postalCodePrefix.value = "";

      // Clear filtered lists
      filteredStations.value = [];
      filteredStreets.value = [];

      // Clear multiple choice selections
      multipleChoiceSelections.value = [];
    }
  }
};

const finishSurvey = async () => {
  if (isFinishing.value) {
    console.warn("finishSurvey called while already in progress.");
    return;
  }
  isFinishing.value = true; // Set flag immediately

  try { // Wrap the entire operation in try/catch/finally
    // First, capture all necessary data with deep copy for answers BEFORE any async or state changes
    const capturedStartDate = startDate.value;
    const capturedAnswers = JSON.parse(JSON.stringify(answers.value)); // Deep copy
    const capturedEnqueteur = enqueteur.value;
    const capturedQuestionPath = [...questionPath.value];

    // Now set survey to complete, this might change UI
    isSurveyComplete.value = true;
    const now = new Date(); // Capture end time after all answers are finalized conceptually
    
    console.log("===== FINISHING SURVEY (Captured State) =====");
    console.log("Captured Start Date:", capturedStartDate);
    console.log("Captured Answers:", capturedAnswers);
    console.log("Captured Enqueteur:", capturedEnqueteur);
    console.log("Captured Question Path:", capturedQuestionPath);
    console.log("Captured question_answers length:", capturedAnswers.question_answers?.length || 0);

    const uniqueId = await getNextId(); // getNextId can be awaited here

    // Create answers object with basic info using CAPTURED values
    const orderedAnswers = {
      ID_questionnaire: uniqueId,
      firebase_timestamp: new Date().toISOString(), // Timestamp of saving
      HEURE_DEBUT: capturedStartDate || "",
      DATE: now.toLocaleDateString("fr-FR").replace(/\//g, "-"), // Corrected Regex
      JOUR: [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ][now.getDay()],
      HEURE_FIN: now.toLocaleTimeString("fr-FR").slice(0, 5),
      ENQUETEUR: capturedEnqueteur,
    };

    // Add individual question answers as separate fields from CAPTURED answers
    if (capturedAnswers.question_answers && capturedAnswers.question_answers.length > 0) {
      capturedAnswers.question_answers.forEach(qa => {
        if (qa.optionId === "freetext") {
          orderedAnswers[qa.questionId] = qa.optionText;
        } else {
          orderedAnswers[qa.questionId] = qa.optionId;
        }
      });
    }

    for (const [key, value] of Object.entries(capturedAnswers)) {
      if (
        key !== "question_answers" &&
        !key.includes("_text") 
      ) {
        if (!orderedAnswers.hasOwnProperty(key)) {
          orderedAnswers[key] = value;
        }
      }
    }
    
    console.log("Saving survey data to Firebase:", orderedAnswers);
    const docRef = await addDoc(surveyCollectionRef, orderedAnswers);
    console.log("Survey saved with ID:", uniqueId, "Firestore ID:", docRef.id);
    
    const updatedData = { firestore_id: docRef.id };
    await setDoc(docRef, updatedData, { merge: true });
    console.log("DOCUMENT ID FOR REFERENCE:", docRef.id);

    // Clear persisted survey state from sessionStorage after successful save
    sessionStorage.removeItem("surveyStartDate");
    sessionStorage.removeItem("surveyAnswers");
    sessionStorage.removeItem("surveyCurrentQuestionIndex");
    sessionStorage.removeItem("surveyQuestionPath");
    sessionStorage.removeItem("surveyCurrentStep");
    sessionStorage.removeItem("surveyEnqueteur");
    sessionStorage.removeItem("surveyIsEnqueteurSaved");

  } catch (error) {
    console.error("Error saving survey:", error);
    // Consider how to handle errors, e.g., should isSurveyComplete be reset?
    // For now, isSurveyComplete remains true, and the user sees the "Merci" message.
  } finally {
    isFinishing.value = false; // Ensure flag is always reset
  }
};

const resetSurvey = () => {
  if (isFinishing.value) {
    console.warn("Reset survey called while finishing is in progress. Reset deferred/ignored.");
    return; 
  }

  // Clear any vehicle type in session storage
  sessionStorage.removeItem("vehicleType");

  // Reset step to start
  currentStep.value = "start";

  // Clear all times and answers - create a completely new object
  startDate.value = "";
  answers.value = { question_answers: [] };

  // Reset indices and paths to start with Q1 question
  currentQuestionIndex.value = 0;
  questionPath.value = ["Q1"];

  // Reset all input fields
  freeTextAnswer.value = "";
  selectedCommune.value = "";
  postalCodePrefix.value = "";
  stationInput.value = "";
  streetInput.value = "";
  selectedPoste.value = null;

  // Clear completion state
  isSurveyComplete.value = false;

  // Clear filtered lists
  filteredStations.value = [];
  filteredStreets.value = [];

  // Clear multiple choice selections
  multipleChoiceSelections.value = [];

  console.log("Survey reset - ready for new questionnaire");
};

const getDocCount = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);
    docCount.value = querySnapshot.size;
  } catch (error) {
    console.error("Error getting document count:", error);
  }
};

const getNextId = async () => {
  const counterDoc = await getDoc(counterDocRef);
  let counter = 1;

  if (counterDoc.exists()) {
    counter = counterDoc.data().value + 1;
  }

  await setDoc(counterDocRef, { value: counter });

  return `-${counter.toString().padStart(6, "0")}`;
};

// Add this new debug method to check survey status at any time
const checkSurveyStatus = () => {
  console.log("===== SURVEY STATUS =====");
  console.log("Current step:", currentStep.value);
  console.log("Current question index:", currentQuestionIndex.value);
  console.log("Current question ID:", currentQuestion.value?.id);
  console.log("Question path:", questionPath.value);
  // Removed old survey Q0 reference
  console.log(
    "Vehicle type from sessionStorage:",
    sessionStorage.getItem("vehicleType")
  );
  console.log("Total answers count:", Object.keys(answers.value).length - 1); // -1 for question_answers array
  console.log(
    "Tracked responses in question_answers:",
    answers.value.question_answers?.length || 0
  );
  console.log("Is survey complete:", isSurveyComplete.value);
  console.log("========================");
};

// Call this at the beginning of selectAnswer to help with debugging
const debugBeforeAnswer = (questionId, option, index) => {
  console.log(`----- Before answering ${questionId} -----`);
  console.log(`Current question: ${questionId}`);
  console.log(
    `Selected option: ${option.text} (index: ${index}, value: ${index + 1})`
  );
  console.log(
    `Current answers: `,
    Object.keys(answers.value).filter((k) => k !== "question_answers")
  );
  console.log(`Question path: ${questionPath.value.join(" -> ")}`);
};

// Lifecycle hooks
onMounted(() => {
  getDocCount();
});
</script>


<style>
/* Base styles */
body {
  background-color: #2a3b63;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #2a3b63;
  color: white;
}

.content-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5% 0;
  width: 90%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-y: auto;
}

.question-container {
  width: 100%;
  margin-bottom: 30px;
}

.input-container,
.station-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
}

.form-control {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid white;
  background-color: #333;
  color: white;
  font-size: 16px;
  margin-bottom: 15px;
}

.btn-next,
.btn-return,
.btn-option,
.btn-pdf {
  width: 100%;
  max-width: 400px;
  color: white;
  padding: 15px;
  margin-top: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.btn-next {
  background-color: green;
}

.btn-return {
  background-color: grey;
  margin-top: 30px;
}

.btn-option {
  background-color: #4a5a83;
  text-align: left;
}

.checkbox-option {
  width: 100%;
  max-width: 400px;
  margin: 10px auto;
  text-align: left;
}

.checkbox-label {
  display: flex;
  align-items: center;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 15px;
  background-color: #4a5a83;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: #5a6a93;
}

.checkbox-input {
  margin-right: 15px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.btn-pdf {
  background-color: #3498db;
  margin: 15px auto;
  display: block;
}

.commune-dropdown {
  position: relative;
  width: 100%;
  max-width: 400px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #333;
  border: 1px solid #666;
  border-radius: 5px;
  z-index: 1000;
  margin: -10px auto 15px;
  padding: 0;
  list-style: none;
}

.commune-option {
  padding: 10px;
  cursor: pointer;
  color: white;
  border-bottom: 1px solid #444;
}

.commune-option:hover {
  background-color: #444;
}

.station-input-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.logo {
  max-width: 25%;
  height: auto;
  margin-top: 40px;
  margin-bottom: 20px;
}

.footer {
  background: linear-gradient(to right, #4c4faf, #3f51b5);
  padding: 20px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease-in-out;
}

@media screen and (max-width: 480px) {
  .commune-dropdown {
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
  }

  .form-control {
    max-width: 90%;
  }
}

.modal {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #1a1a1a;
}

.pdf-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.pdf-content iframe {
  border: none;
  width: 100%;
  height: 100%;
  background: white;
}

.close {
  position: fixed;
  right: 20px;
  top: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 10000;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close::before,
.close::after {
  content: "";
  position: absolute;
  width: 24px;
  height: 2px;
  background-color: white;
  transform-origin: center;
}

.close::before {
  transform: rotate(45deg);
}

.close::after {
  transform: rotate(-45deg);
}

.close:hover {
  opacity: 1;
}

@media screen and (min-width: 768px) {
  .modal {
    padding: 40px;
  }

  .modal-content {
    max-width: 1200px;
    margin: 0 auto;
  }
}
</style>
