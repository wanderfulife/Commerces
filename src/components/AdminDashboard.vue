<template>
  <div>
    <button class="btn-signin" @click="showSignInModal = true">
      Connexion Admin
    </button>

    <!-- Sign In Modal -->
    <div v-if="showSignInModal" class="modal">
      <div class="modal-content signin-modal">
        <button class="close" @click="showSignInModal = false">&times;</button>
        <h2>Connexion Admin</h2>
        <input
          v-model="password"
          type="password"
          placeholder="Entrez le mot de passe"
          class="form-control"
        />
        <button @click="signIn" class="btn-signin">Se connecter</button>
      </div>
    </div>

    <!-- Admin Dashboard Modal -->
    <div v-if="showAdminDashboard" class="modal">
      <div class="modal-content admin-dashboard">
        <button class="close" @click="showAdminDashboard = false">
          &times;
        </button>
        <h2>Tableau de Bord Admin</h2>
        <div class="dashboard-content">
          <div class="dashboard-card total">
            <h3>Total des Enquêtes</h3>
            <p class="big-number">{{ totalSurveys }}</p>
          </div>
          <div class="dashboard-card">
            <h3>Enquêtes par Enquêteur</h3>
            <ul>
              <li v-for="(count, name) in surveysByEnqueteur" :key="name">
                <span>{{ name }}</span>
                <span class="count">{{ count }}</span>
              </li>
            </ul>
          </div>

        </div>
        <button @click="downloadData" class="btn-download">
          Télécharger les Données
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as XLSX from "xlsx";

const showSignInModal = ref(false);
const showAdminDashboard = ref(false);
const password = ref("");
const surveysByEnqueteur = ref({});
const surveysByType = ref({});
const totalSurveys = ref(0);

const surveyCollectionRef = collection(db, "commerces");

// Stations list
const stationsList = [
  "Amboise",
  "Ancenis",
  "Angers-Saint-Laud",
  "Batz-sur-Mer",
  "Baule",
  "Blois-Chambord",
  "Chaingy-Fourneaux-Plage",
  "Chouzy",
  "La Baule-Escoublac",
  "La Baule-les-Pins",
  "La Chapelle-Saint-Mesmin",
  "La Chaussée-Saint-Victor",
  "Le Croisic",
  "Le Pouliguen",
  "Les Aubrais",
  "Limeray",
  "Menars",
  "Mer",
  "Meung-sur-Loire",
  "Montlouis-sur-Loire",
  "Nantes",
  "Noizay",
  "Onzain-Chaumont-sur-Loire",
  "Orléans",
  "Pornichet",
  "Saint-Ay",
  "Saint-Nazaire",
  "Saint-Pierre-des-Corps",
  "Saumur",
  "Suèvres",
  "Tours",
  "Veuves-Monteaux",
];

const signIn = () => {
  if (password.value === "admin123") {
    showSignInModal.value = false;
    fetchAdminData();
    showAdminDashboard.value = true;
  } else {
    alert("Mot de passe incorrect");
  }
};

const fetchAdminData = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);
    const surveys = querySnapshot.docs.map((doc) => doc.data());

    totalSurveys.value = surveys.length;

    surveysByEnqueteur.value = surveys.reduce((acc, survey) => {
      acc[survey.ENQUETEUR] = (acc[survey.ENQUETEUR] || 0) + 1;
      return acc;
    }, {});

    surveysByType.value = surveys.reduce((acc, survey) => {
      let type;
      if (survey.Q0 === 1) {
        type = "Véhicule Léger (VL)";
      } else if (survey.Q0 === 2) {
        type = "Poids Lourd (PL)";
      } else if (survey.TYPE_VEHICULE) {
        // Fallback to TYPE_VEHICULE field if directly available
        type = survey.TYPE_VEHICULE;
      } else {
        type = "Non défini";
      }
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
  }
};

const downloadData = async () => {
  try {
    const querySnapshot = await getDocs(surveyCollectionRef);

    // Store both document data and ID
    const rawData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      firestore_id: doc.id, // Add the Firestore document ID
    }));

    // Log raw data for debugging
    console.log("Raw survey data from Firestore:", rawData);

    // Define only essential headers for the new survey structure
    const headerOrder = [
      "firestore_id", // Add Firestore ID as first column
      "ID_questionnaire",
      "ENQUETEUR",
      "DATE",
      "JOUR",
      "HEURE_DEBUT",
      "HEURE_FIN",
      // Merchant Survey questions
      "Q1", // Adresse de l'établissement
      "Q2", // Raison sociale de l'établissement
      "Q3", // Activité de l'établissement
      "Q4", // Nombre d'employés
      "Q5", // Terrasse ou contre terrasse
      "Q6", // Surface de vente
      "Q7", // Surface de stockage
      "Q8", // Surface d'accueil véhicules
      "Q9", // Jours d'approvisionnements
      "Q10", // Heure d'approvisionnements
      "Q11", // Aller chercher marchandises soi-même
      "Q12", // Fréquence auto-approvisionnement
      "Q13", // Véhicule utilisé
      "Q14", // Lieu de stationnement véhicule
      "Q15", // Temps de déchargement
      "Q16", // Fournisseurs livrent
      "Q17", // Fréquence livraisons fournisseurs
      "Q18", // Type véhicule fournisseurs
      "Q19", // Stationnement fournisseurs
      "Q20", // Raison sociale principal fournisseur
      "Q21", // Transporteurs livrent
      "Q22", // Fréquence livraisons transporteurs
      "Q23", // Type véhicule transporteurs
      "Q24", // Stationnement transporteurs
      "Q25", // Raison sociale principal transporteur
      "Q26", // Livraisons aux clients
      "Q27", // Nombre d'expéditions par semaine
      "Q28", // Qui prend en charge transport
      "Q29", // Aires de livraison à proximité
      "Q30", // Évaluation disponibilité aires
      "Q31", // Évaluation contrôle aires
      "Q32", // Souhaits et propositions
    ];

    const data = rawData.map((docData) => {
      // Create a new object with necessary metadata fields
      const processedData = {
        firestore_id: docData.firestore_id || docData.id,
        ID_questionnaire: docData.ID_questionnaire,
        firebase_timestamp: docData.firebase_timestamp,
        ENQUETEUR: docData.ENQUETEUR,
        DATE: docData.DATE,
        JOUR: docData.JOUR,
        HEURE_DEBUT: docData.HEURE_DEBUT,
        HEURE_FIN: docData.HEURE_FIN,
      };

      // Copy all question fields directly from the original data
      for (const key in docData) {
        if (
          key.startsWith("Q") || 
          key.includes("precision")
        ) {
          processedData[key] = docData[key];
        }
      }

      // Return an object with all fields in headerOrder (if they exist)
      return headerOrder.reduce((acc, key) => {
        acc[key] = processedData[key] !== undefined ? processedData[key] : "";
        return acc;
      }, {});
    });

    // Log processed data for debugging
    console.log("Processed data for Excel:", data);

    // Create workbook and add main worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headerOrder });

    // Set column widths
    const colWidths = headerOrder.map(() => ({ wch: 20 }));
    worksheet["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Data");

    // Use a timestamp in the filename to avoid overwriting
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    XLSX.writeFile(workbook, `commerces_Survey_Data_${timestamp}.xlsx`);

    console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading data:", error);
  }
};

onMounted(() => {
  // Initialization logic if needed
});
</script>

<style scoped>
.btn-signin {
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 30px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.btn-signin:hover {
  background-color: #45a049;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

/* Keep the rest of the styles unchanged */
.btn-download {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 20px;
}

.btn-download:hover {
  background-color: #2980b9;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #2d3748;
  color: white;
  padding: 25px;
  border-radius: 15px;
  width: 90%;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  max-height: fit-content;
  max-width: 500px;
  margin: 0 auto;
}

.signin-modal {
  max-width: 320px;
  padding: 20px;
}

.signin-modal h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  text-align: center;
  font-weight: normal;
}

.signin-modal .form-control {
  width: 100%;
  margin-bottom: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 12px;
  font-size: 14px;
  border-radius: 8px;
  box-sizing: border-box;
}

.signin-modal .form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.signin-modal .btn-signin {
  width: 100%;
  margin: 0;
  padding: 12px;
  background-color: #68d391;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.3s;
}

.signin-modal .btn-signin:hover {
  background-color: #5cb67e;
}

.close {
  position: absolute;
  right: 15px;
  top: 15px;
  width: 24px;
  height: 24px;
  opacity: 0.7;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;
}

.close:hover {
  opacity: 1;
}

.admin-dashboard {
  max-width: 800px;
  max-height: 90vh;
  padding: 20px 30px;
  overflow-y: auto;
}

.admin-dashboard h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  text-align: center;
  font-weight: normal;
  color: white;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}

.dashboard-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
}

.dashboard-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #3b82f6;
  font-weight: normal;
}

.dashboard-card.total {
  text-align: center;
  padding: 12px;
}

.big-number {
  font-size: 42px;
  font-weight: bold;
  color: #68d391;
  margin: 5px 0;
}

.dashboard-card ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dashboard-card li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-card li:last-child {
  border-bottom: none;
}

.count {
  font-weight: normal;
  color: #68d391;
}

.btn-download {
  position: sticky;
  bottom: 0;
  width: 100%;
  padding: 15px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 20px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.2);
}

.btn-download:hover {
  background-color: #2563eb;
}

@media (max-width: 600px) {
  .modal-content {
    margin: 10px;
    width: calc(100% - 20px);
    max-height: 90vh;
  }

  .admin-dashboard {
    padding: 15px;
  }

  .admin-dashboard h2 {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .dashboard-card {
    padding: 12px;
  }

  .big-number {
    font-size: 36px;
  }

  .btn-download {
    padding: 12px;
    font-size: 14px;
  }
}
</style>