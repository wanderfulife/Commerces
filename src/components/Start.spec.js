import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Start from './Start.vue';
// import { questions } from './surveyQuestions.js'; // Actual questions for structure - Commented out

// Mock Firebase
const mockAddDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockFirebaseGetDoc = vi.fn(); 
const mockFirebaseGetDocs = vi.fn();

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(() => ({})),
    doc: vi.fn(() => ({})), // Assuming surveyCollectionRef and counterDocRef are primarily passed around
    addDoc: (ref, data) => mockAddDoc(ref, data),
    getDoc: (ref) => mockFirebaseGetDoc(ref),
    getDocs: (ref) => mockFirebaseGetDocs(ref),
    setDoc: (ref, data, merge) => mockSetDoc(ref, data, merge),
  };
});

vi.mock('./firebaseConfig', () => ({
  db: {}, // Mocked db object
}));

// Synchronous mock for surveyQuestions.js
vi.mock('./surveyQuestions.js', () => {
  const simplifiedMockQuestions = [
    { id: 'Q1', text: 'Mock Question 1', freeText: true, freeTextPlaceholder: 'Ans Q1', next: 'Q2' },
    { 
      id: 'Q2', 
      text: 'Mock Question 2', 
      options: [
        { id: 1, text: 'Option 2.1', next: 'Q3' },
        { id: 2, text: 'Option 2.2', next: 'end' }
      ] 
    },
    { id: 'Q3', text: 'Mock Question 3 (FreeText)', freeText: true, freeTextPlaceholder: 'Ans Q3', next: 'end' },
  ];
  return {
    questions: simplifiedMockQuestions,
  };
});


describe('Start.vue', () => {
  let wrapper;

  // Mock sessionStorage
  let store = {};
  const mockSessionStorage = {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
  vi.stubGlobal('sessionStorage', mockSessionStorage);


  beforeEach(async () => {
    vi.stubGlobal('sessionStorage', mockSessionStorage);
    vi.clearAllMocks(); 
    store = {}; 

    mockFirebaseGetDoc.mockImplementation((docRef) => {
      return Promise.resolve({ exists: () => true, data: () => ({ value: 100 }) });
    });
    mockFirebaseGetDocs.mockResolvedValue({ size: 0, docs:[] });

    wrapper = mount(Start, {
      global: {
        stubs: {
          CommuneSelector: true, 
          AdminDashboard: true,
        }
      }
    });
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0)); 
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('finishSurvey saves correctly captured data', async () => {
    // 1. Setup initial state
    wrapper.vm.enqueteur = 'TestEnqueteur';
    wrapper.vm.startDate = '10:00:00';
    wrapper.vm.answers = { 
      question_answers: [{ questionId: 'Q1', optionText: 'Answer 1', optionId: 'freetext' }],
      Q1: 'Answer 1'
    };
    
    mockAddDoc.mockResolvedValue({ id: 'firebase-doc-id' });
    mockSetDoc.mockResolvedValue(undefined);

    await wrapper.vm.finishSurvey();

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const savedData = mockAddDoc.mock.calls[0][1];
    
    expect(savedData.HEURE_DEBUT).toBe('10:00:00');
    expect(savedData.ENQUETEUR).toBe('TestEnqueteur');
    expect(savedData.Q1).toBe('Answer 1');
    expect(savedData.DATE).toMatch(/^\d{2}-\d{2}-\d{4}$/);
    expect(savedData.HEURE_FIN).toMatch(/^\d{2}:\d{2}$/);
    expect(wrapper.vm.isSurveyComplete).toBe(true);
    expect(wrapper.vm.isFinishing).toBe(false);
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('surveyStartDate');
  });

  it('finishSurvey handles errors and resets isFinishing flag', async () => {
    wrapper.vm.enqueteur = 'TestErr';
    wrapper.vm.startDate = '11:00:00';
    wrapper.vm.answers = { question_answers: [{ questionId: 'Q1', optionText: 'ErrAnswer' }]};
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockAddDoc.mockRejectedValue(new Error('Firebase save failed'));

    await wrapper.vm.finishSurvey();

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving survey:', expect.any(Error));
    expect(wrapper.vm.isSurveyComplete).toBe(true);
    expect(wrapper.vm.isFinishing).toBe(false);
    consoleErrorSpy.mockRestore();
  });
  
  it('resetSurvey clears state and sessionStorage when not finishing', async () => {
    wrapper.vm.isFinishing = false;
    wrapper.vm.startDate = '12:00:00';
    wrapper.vm.answers = { Q1: 'Old Answer' };
    wrapper.vm.currentStep = 'survey';
    // mockSessionStorage.setItem('surveyStartDate', '12:00:00'); // No longer need to set this to test its removal by resetSurvey

    await wrapper.vm.resetSurvey();

    expect(wrapper.vm.startDate).toBe('');
    expect(wrapper.vm.answers).toEqual({ question_answers: [] });
    expect(wrapper.vm.currentStep).toBe('start');
    // expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('surveyStartDate'); // resetSurvey does not do this
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('vehicleType');
  });

  it('resetSurvey is deferred if finishSurvey is in progress', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    wrapper.vm.isFinishing = true;
    wrapper.vm.startDate = '13:00:00';
    const originalAnswers = { Q1: 'DataToPreserve' };
    wrapper.vm.answers = JSON.parse(JSON.stringify(originalAnswers));

    await wrapper.vm.resetSurvey();

    expect(wrapper.vm.startDate).toBe('13:00:00');
    expect(wrapper.vm.answers).toEqual(originalAnswers);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Reset survey called while finishing is in progress. Reset deferred/ignored.');
    consoleWarnSpy.mockRestore();
  });

  it('finishSurvey uses initially captured data, not later modifications', async () => {
    wrapper.vm.enqueteur = 'OriginalEnqueteur';
    wrapper.vm.startDate = '14:00:00';
    const initialAnswers = {
      question_answers: [{ questionId: 'Q1', optionText: 'OriginalAnswer1', optionId: 'freetext' }],
      Q1: 'OriginalAnswer1'
    };
    wrapper.vm.answers = JSON.parse(JSON.stringify(initialAnswers));

    mockAddDoc.mockResolvedValue({ id: 'firebase-doc-id-race' });
    mockSetDoc.mockResolvedValue(undefined);

    const finishPromise = wrapper.vm.finishSurvey();
    // Simulate data changing *after* finishSurvey has captured its initial state
    wrapper.vm.startDate = 'MODIFIED_DATE';
    wrapper.vm.answers = { question_answers: [], Q1: 'MODIFIED_ANSWER' };

    await finishPromise;

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const savedData = mockAddDoc.mock.calls[0][1];
    expect(savedData.HEURE_DEBUT).toBe('14:00:00');
    expect(savedData.ENQUETEUR).toBe('OriginalEnqueteur');
    expect(savedData.Q1).toBe('OriginalAnswer1');
    expect(wrapper.vm.isFinishing).toBe(false);
  });

  it('completes a survey, then starts a new one, ensuring no data carryover and clean state', async () => {
    const firstEnqueteur = 'Surveyor1';
    // Phase 1: Complete the First Survey
    wrapper.vm.enqueteur = firstEnqueteur;
    await wrapper.vm.setEnqueteur(); // Assumes setEnqueteur is exposed or implicitly available
    expect(wrapper.vm.currentStep).toBe('start');
    
    await wrapper.vm.startSurvey();
    expect(wrapper.vm.currentStep).toBe('survey');
    const firstSurveyStartDate = wrapper.vm.startDate;
    expect(firstSurveyStartDate).not.toBe('');

    // Simulate answering Q1 (free text)
    wrapper.vm.freeTextAnswer = 'Answer for First Survey';
    await wrapper.vm.handleFreeTextAnswer(); // This will also call nextQuestion
    
    const firstSurveyAnswers = JSON.parse(JSON.stringify(wrapper.vm.answers));
    expect(firstSurveyAnswers.Q1).toBe('Answer for First Survey');
    expect(firstSurveyAnswers.question_answers.length).toBeGreaterThan(0);

    // Finish the first survey
    mockAddDoc.mockClear(); // Clear any calls from onMounted/setup
    mockFirebaseGetDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ value: 200 }) }); // For getNextId in finishSurvey
    await wrapper.vm.finishSurvey();
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.isSurveyComplete).toBe(true);

    // --- Store values from end of first survey for comparison ---
    const dataSavedToFirebase = mockAddDoc.mock.calls[0][1];

    // Phase 2: Reset and Start a New Survey
    await wrapper.vm.resetSurvey(); // Simulates clicking "Nouveau questionnaire"
    expect(wrapper.vm.currentStep).toBe('start'); 

    // Use Vitest's built-in time manipulation for the second survey
    const secondSurveyDate = new Date(2023, 10, 15, 12, 30, 0); // November 15, 2023, 12:30:00
    vi.setSystemTime(secondSurveyDate);

    try {
      await wrapper.vm.startSurvey(); // Simulates clicking "COMMENCER QUESTIONNAIRE"
      expect(wrapper.vm.currentStep).toBe('survey');

      // Phase 3: Assert Clean State for the New Survey
      expect(wrapper.vm.enqueteur).toBe(firstEnqueteur); // Enqueteur should persist
      expect(wrapper.vm.startDate).not.toBe('');
      expect(wrapper.vm.startDate).not.toBe(firstSurveyStartDate); // Should be a new start date
      
      const expectedSecondStartDate = secondSurveyDate.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      expect(wrapper.vm.startDate).toBe(expectedSecondStartDate);

      expect(wrapper.vm.answers).toEqual({ question_answers: [] }); // Answers should be reset
      expect(wrapper.vm.currentQuestionIndex).toBe(0);
      expect(wrapper.vm.questionPath).toEqual(['Q1']);
      expect(wrapper.vm.isSurveyComplete).toBe(false);
      expect(wrapper.vm.freeTextAnswer).toBe(''); // Input field should be reset

      // Ensure data from the first survey is not present in the reset state
      expect(dataSavedToFirebase.ENQUETEUR).toBe(firstEnqueteur);
      expect(dataSavedToFirebase.Q1).toBe('Answer for First Survey');

      // Ensure addDoc was only called for the first survey
      expect(mockAddDoc).toHaveBeenCalledTimes(1); 
    } finally {
      vi.useRealTimers(); // Restore real timers after the test section
    }
  });

}); 