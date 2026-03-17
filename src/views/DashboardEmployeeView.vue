<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";

import { useRouter } from 'vue-router' // Importamos useRouter para manejar la redirección
const router = useRouter() // Instanciamos el router

// ✅ Importar el composable de autenticación
import { useAuth } from '@/composables/useAuth';
const { user: authUser, initUser } = useAuth();




// Importamos utilidades
import { DateTime } from "luxon";

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";


// Importamos los APIs de la diferentes secciones

import GeneralInformationAPI from "@/api/Sections/GeneralInformationAPI";
import DuringTheIncidentAPI from "@/api/Sections/DuringTheIncidentAPI";
import IncidentDetailAPI from "@/api/Sections/IncidentDetailAPI";
import SupervisorNoteAPI from "@/api/Sections/SupervisorNoteAPI";


// Import composables
import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

// Importamos componentes
import Spinner from "@/components/Spinner.vue";

// Importamos Stores

import { useDirectionsStore } from "@/stores/directions.js";
const storeDirection = useDirectionsStore();

import { useEmployeesStore } from "@/stores/employees.js";
const storeEmployee = useEmployeesStore();

import { useGeneralInformationsStore } from "@/stores/generalInformations";
const storeGeneralInformation = useGeneralInformationsStore();

import { useRoadConditionsStore } from "@/stores/roadConditions";
const storeRoadCondition = useRoadConditionsStore();


import { useSafetyPersonsNotifiedStore } from "@/stores/safetyPersonsNotified";
const storeSafetyPerson = useSafetyPersonsNotifiedStore();

import { useSupervisorsStore } from "@/stores/supervisors";
const storeSupervisor = useSupervisorsStore();


import { useTrucksStore } from "@/stores/trucks.js";
const storeTruck = useTrucksStore();

import { useTypeIncidentsStore } from "@/stores/typeIncidents";
const storeTypeIncident = useTypeIncidentsStore();

import { useWeatherConditionsStore } from "@/stores/weatherConditions";
const storeWeatherCondition = useWeatherConditionsStore();

import { useWhoDidYouSendThePictureToStore } from "@/stores/whoDidYouSendThePicturesTo";
const storeWhoDidYouSendThePicturesTo = useWhoDidYouSendThePictureToStore();

import { useDeptsStore } from "@/stores/depts.js";
const storeDept = useDeptsStore();

const user = ref(null);

watch(authUser, (newUser) => {
  user.value = newUser;
  console.log('Usuario actualizado en dashboard:', newUser);
}, { immediate: true });



// General Information


// const selectedEmployee = ref("");
const selectedTruck = ref("");
const selectedDept = ref("");
const selectedSupervisor = ref("");
const selectedTypeOfIncident = ref("");

const date = ref(""); // Este campo se va a usar para guardar la fecha actual del incidente
const trainee = ref(""); // Nombre del conductor en entrenamiento, si aplica
const location = ref(""); // Direccion del incidente
const time = ref(""); // Este campo se va a usar para guardar la hora del incidente
const timeWorkedYears = ref(""); // Este campo se va a usar para guardar los años de experiencia del conductor
const timeWorkedMonths = ref(""); // Este campo se va a usar para guardar los meses de experiencia del conductor
const timeDayStarted = ref(""); // Este campo se va a usar para guardar la hora que el conductor empezó su día de trabajo



const isVisibleAcordion = ref(false);

const errorsGeneralInformation = ref({

  // employee_er: "",
  truck_er: "",
  dept_er: "",
  supervisor_er: "",
  typeOfIncident_er: "",
  date_er: "",
  trainee_er: "",
  location_er: "",
  time_er: "",
  timeWorkedYears_er: "",
  timeWorkedMonths_er: "",
  timeDayStarted_er: "",

});

// Modo de edición de la informaciongeneral para el general information
const isEditGeneralInformation = ref(false);
const isLoadingGeneralInformation = ref(false); // To show loading spinner when fetching general information
const formSubmittedGeneralInformation = ref(false);


// During the incident

const duringTheIncidentList = ref([]);
const selectedDuringTheIncidentId = ref(null); // To track the ID of the During The Incident info being edited

const usingElectronicDevice = ref("");
const taskPerfomed = ref("");
const wasSafetyDeptNotified = ref("");
const didYouTakePictures = ref("");
const howFastWereYouGoing = ref(false);

const SelectedSafetyPersonNotified = ref("");
const SelectedWhoDidYouSendThePicturesTo = ref("");
const SelectedDirectionYouWereTraveling = ref("");
const SelectedWeatherCondition = ref("");
const SelectedRoadCondition = ref("");

const wasThisIncidentInAnIntersection = ref("");
const witness = ref(""); // Nombre del testigo, si aplica
const witnessPhone = ref(""); // Telefono del testigo, si aplica

const isEditDuringTheIncident = ref(false);
const isLoadingDuringTheIncident = ref(false); // To show loading spinner when fetching during the incident info
const formSubmittedDuringTheIncident = ref(false); // To track if During the Incident form has been submitted


const errorsDuringTheIncident = ref({

  usingElectronicDevice_er: "",
  taskPerfomed_er: "",
  wasSafetyDeptNotified_er: "",
  didYouTakePictures_er: "",
  howFastWereYouGoing_er: "",
  SelectedSafetyPersonNotified_er: "",
  SelectedWhoDidYouSendThePicturesTo_er: "",
  SelectedDirectionYouWereTraveling_er: "",
  SelectedWeatherCondition_er: "",
  SelectedRoadCondition_er: "",
  wasThisIncidentInAnIntersection_er: "",
  witness_er: "",
  witnessPhone_er: "",

});

// Incident Detail

const formData = new FormData();
const selectedIncidentDetailId = ref(null); // To track the ID of the Incident Detail being edited
const selectedFiles = ref([]); // Store File objects for FormData
const selectedImages = ref([]);
const existingIncidentDetailImages = ref([]); // Store existing images from edited Load
const fileInput = ref(null);


const incidentDetailList = ref([]);

const incidentDescription = ref("");
const actionEventConditions = ref("");
const wereAnyVehiclesTowed = ref("");
const wasAnyOneHurt = ref("");
const describeAnyInjuries = ref("");

const damageToAceTruck = ref("");
const whatDamageWasDone = ref("");
const incidentInThePastYear = ref("");
const listDatesOfIncidents = ref("");


const isEditingIncidentDetail = ref(false);
const isLoadingIncidentDeail = ref(false);
const formSubmittedIncidentDetail = ref(false); // To track if Incident Detail form has been submitted


const errorsIncidentDetail = ref({
  incidentDescription_er: "",
  actionEventConditions_er: "",
  wereAnyVehiclesTowed_er: "",
  wasAnyOneHurt_er: "",
  describeAnyInjuries_er: "",
  damageToAceTruck_er: "",
  whatDamageWasDone_er: "",
  incidentInThePastYear_er: "",
  listDatesOfIncidents_er: "",
});

// Supervisor Note
const supervisorNoteList = ref([]);
const selectedSupervisorNoteId = ref(null); // To track the ID of the Supervisor Note being edited
const supervisorNote = ref("");

const isEditingSupervisorNote = ref(false);
const isLoadingSupervisorNote = ref(false);
const formSubmittedSupervisorNote = ref(false); // To track if Supervisor Note form has been submitted

const errorsSupervisorNote = ref({
  supervisorNote_er: "",
});



onMounted(() => {
  // ✅ Inicializar el usuario desde el composable
  initUser();

  // ✅ Asignar el usuario al ref local
  user.value = authUser.value;

  // Verificar rol y redirigir si es necesario
  if (user.value) {
    if (user.value.rol === "Admin") {
      router.push({ name: 'dashboard-admin' });
      return; // Salir si es admin
    }
  }

  // ✅ Acceso seguro al ID del usuario
  let user_id = user.value?.id || null;
  console.log('User ID en dashboard:', user_id);

  let ace_incident_report_employee_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.driver_id || null;

  if (user_id !== ace_incident_report_employee_id) {
    localStorage.removeItem("ACE-INCIDENT-REPORT");
  } else {
    // Parse the date from localStorage (assumed to be in UTC)
    const dbDate = DateTime.fromISO(JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT")).date, { zone: 'utc' });
    const today = DateTime.now();

    const dbDateDenver = dbDate.setZone('America/Denver');
    const todayDenver = today.setZone('America/Denver');

    if (
      dbDateDenver.year !== todayDenver.year ||
      dbDateDenver.month !== todayDenver.month ||
      dbDateDenver.day !== todayDenver.day
    ) {
      localStorage.removeItem("ACE-INCIDENT-REPORT");
    } else {
      // Cargar ace-incident-report existente
      isEditGeneralInformation.value = true;
      const generalInformation = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"));

      // selectedEmployee.value = generalInformation.employee_id;
      selectedTruck.value = generalInformation.truck_id;
      selectedDept.value = generalInformation.dept_id;
      selectedSupervisor.value = generalInformation.supervisor_id;
      selectedTypeOfIncident.value = generalInformation.typeOfIncident_id;

      location.value = generalInformation.location;
      time.value = setTimeFromDB(generalInformation.time);
      timeWorkedYears.value = generalInformation.timeWorkedYears;
      timeWorkedMonths.value = generalInformation.timeWorkedMonths;
      timeDayStarted.value = setTimeFromDB(generalInformation.timeDayStarted);


      handleVisibleAcordion();
      // loadSpareTruckInfo();
      // loadDowntime();
      // loadLoad();
    }
  }
});

// Metodos

// Handle form submission General Info
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmittedGeneralInformation.value = true;

  // Limpiar errores anteriores General Information

  // errorsGeneralInformation.value.employee_er = "";
  errorsGeneralInformation.value.truck_er = "";
  errorsGeneralInformation.value.dept_er = "";
  errorsGeneralInformation.value.supervisor_er = "";
  errorsGeneralInformation.value.typeOfIncident_er = "";
  errorsGeneralInformation.value.date_er = "";
  errorsGeneralInformation.value.trainee_er = "";
  errorsGeneralInformation.value.location_er = "";
  errorsGeneralInformation.value.time_er = "";
  errorsGeneralInformation.value.timeWorkedYears_er = "";
  errorsGeneralInformation.value.timeWorkedMonths_er = "";
  errorsGeneralInformation.value.timeDayStarted_er = "";



  let hasError = false;

  // if (!selectedEmployee.value) {
  //   errorsGeneralInformation.value.employee_er = "Required field";
  //   hasError = true;
  // }

  if (!selectedTruck.value) {
    errorsGeneralInformation.value.truck_er = "Required field";
    hasError = true;
  }

  if (!time.value) {
    errorsGeneralInformation.value.time_er = "Required field";
    hasError = true;
  }

  if (!selectedDept.value) {
    errorsGeneralInformation.value.dept_er = "Required field";
    hasError = true;
  }

  if (!selectedSupervisor.value) {
    errorsGeneralInformation.value.supervisor_er = "Required field";
    hasError = true;
  }

  if (!selectedTypeOfIncident.value) {
    errorsGeneralInformation.value.typeOfIncident_er = "Required field";
    hasError = true;
  }

  if (!trainee.value) {
    errorsGeneralInformation.value.trainee_er = "Required field";
    hasError = true;
  }

  if (!location.value) {
    errorsGeneralInformation.value.location_er = "Required field";
    hasError = true;
  }

  if (!timeWorkedYears.value) {
    errorsGeneralInformation.value.timeWorkedYears_er = "Required field";
    hasError = true;
  }

  if (!timeWorkedMonths.value) {
    errorsGeneralInformation.value.timeWorkedMonths_er = "Required field";
    hasError = true;
  }

  if (!timeDayStarted.value) {
    errorsGeneralInformation.value.timeDayStarted_er = "Required field";
    hasError = true;
  }


  if (hasError) {
    return;
  }

  const generalInformationData = {

    date: getDenverTimeAsUTCISOString(),
    trainerName: trainee.value,
    employee_id: user.value.id,
    truck_id: selectedTruck.value,
    dept_id: selectedDept.value,
    supervisor_id: selectedSupervisor.value,
    typeOfIncident_id: selectedTypeOfIncident.value,
    location: location.value,
    time: formatTime(time.value),
    timeWorkedYears: timeWorkedYears.value.toString(),
    timeWorkedMonths: timeWorkedMonths.value.toString(),
    timeDayStarted: formatTime(timeDayStarted.value),

  };

  try {
    if (!isEditGeneralInformation.value) {
      const response = await GeneralInformationAPI.add(generalInformationData);

      if (response.data.ok) {
        localStorage.setItem("ACE-INCIDENT-REPORT", JSON.stringify(response.data.data));
        const generalInformation = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"));

        isEditGeneralInformation.value = true;

        showSweetAlert({
          title: "General information saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isVisibleAcordion.value = true;
          return;
        });
      } else {
        showSweetAlert({
          title: "Error saving General Information!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          return;
        });
      }
    } else {
      let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;
      const response = await GeneralInformationAPI.edit(generalInformation_id, generalInformationData);

      if (response.data.ok) {
        localStorage.setItem("ACE-INCIDENT-REPORT", JSON.stringify(response.data.data));
        const generalInformation = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"));

        showSweetAlert({
          title: "General information edited successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          return;
        });
      } else {
        showSweetAlert({
          title: "Error editing General Information!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          return;
        });
      }
    }
  } catch (error) {
    showSweetAlert({
      title: "Error editing General Information!",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      return;
    });
  }
};


// Reset General Information form
const resetGeneralInformation = () => {

  // selectedEmployee.value = "";
  selectedTruck.value = "";
  selectedDept.value = "";
  selectedSupervisor.value = "";
  selectedTypeOfIncident.value = "";
  location.value = "";
  time.value = "";
  timeWorkedYears.value = "";
  timeWorkedMonths.value = "";
  timeDayStarted.value = "";


  isEditGeneralInformation.value = false;
  formSubmittedGeneralInformation.value = false;
};

// Reset During the Incident form
const resetDuringTheIncidentForm = () => {

  selectedDuringTheIncidentId.value = null;
  usingElectronicDevice.value = "";
  taskPerfomed.value = "";
  wasSafetyDeptNotified.value = "";
  didYouTakePictures.value = "";
  howFastWereYouGoing.value = false;
  SelectedSafetyPersonNotified.value = "";
  SelectedWhoDidYouSendThePicturesTo.value = "";
  SelectedDirectionYouWereTraveling.value = "";
  SelectedWeatherCondition.value = "";
  SelectedRoadCondition.value = "";
  wasThisIncidentInAnIntersection.value = "";
  witness.value = "";
  witnessPhone.value = "";

  isEditDuringTheIncident.value = false;
  formSubmittedDuringTheIncident.value = false;

};

// Reset Incident Detail form
const resetIncidentDetail = () => {
  selectedIncidentDetailId.value = null;
  incidentDescription.value = "";
  actionEventConditions.value = "";
  wereAnyVehiclesTowed.value = "";
  wasAnyOneHurt.value = "";
  describeAnyInjuries.value = "";
  damageToAceTruck.value = "";
  whatDamageWasDone.value = "";
  incidentInThePastYear.value = "";
  listDatesOfIncidents.value = "";

  selectedImages.value = [];
  selectedFiles.value = []; // Clear files as well
  existingIncidentDetailImages.value = []; // Clear existing images
  if (fileInput.value) {
    fileInput.value.value = "";
  }

  isEditingIncidentDetail.value = false;
  formSubmittedIncidentDetail.value = false;

};

// Reset Supervisor Note form
const resetSupervisorNote = () => {

  supervisorNote.value = "";
  selectedSupervisorNoteId.value = null;

  isEditingSupervisorNote.value = false;
  formSubmittedSupervisorNote.value = false;
};


// Handle form submission During the Incident
const HandleDuringTheIncident = async (event) => {
  event.preventDefault();
  formSubmittedDuringTheIncident.value = true;

  // Limpiar errores anteriores
  errorsDuringTheIncident.value.usingElectronicDevice_er = "";
  errorsDuringTheIncident.value.taskPerfomed_er = "";
  errorsDuringTheIncident.value.wasSafetyDeptNotified_er = "";
  errorsDuringTheIncident.value.didYouTakePictures_er = "";
  errorsDuringTheIncident.value.howFastWereYouGoing_er = "";
  errorsDuringTheIncident.value.SelectedSafetyPersonNotified_er = "";
  errorsDuringTheIncident.value.SelectedWhoDidYouSendThePicturesTo_er = "";
  errorsDuringTheIncident.value.SelectedDirectionYouWereTraveling_er = "";
  errorsDuringTheIncident.value.SelectedWeatherCondition_er = "";
  errorsDuringTheIncident.value.SelectedRoadCondition_er = "";
  errorsDuringTheIncident.value.wasThisIncidentInAnIntersection_er = "";
  errorsDuringTheIncident.value.witness_er = "";
  errorsDuringTheIncident.value.witnessPhone_er = "";

  let hasError = false;
  if (!usingElectronicDevice.value) {
    errorsDuringTheIncident.value.usingElectronicDevice_er = "Required field";
    hasError = true;
  }
  if (hasError) {
    return;
  }

  let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

  const duringTheIncident = {
    usingElectronicDevice: usingElectronicDevice.value,
    taskPerfomed: taskPerfomed.value,
    wasSafetyDeptNotified: wasSafetyDeptNotified.value,
    didYouTakePictures: didYouTakePictures.value,
    howFastWereYouGoing: howFastWereYouGoing.value ? "Yes" : "No",
    safetyPersonNotified_id: SelectedSafetyPersonNotified.value || "",
    whoDidYouSendThePicturesTo_id: SelectedWhoDidYouSendThePicturesTo.value || "",
    directionYouWereTraveling_id: SelectedDirectionYouWereTraveling.value || "",
    weatherCondition_id: SelectedWeatherCondition.value || "",
    roadCondition_id: SelectedRoadCondition.value || "",
    wasThisIncidentInAnIntersection: wasThisIncidentInAnIntersection.value,
    witness: witness.value,
    witnessPhone: witnessPhone.value,

    generalInformation_id: generalInformation_id,

  };

  try {
    if (isEditDuringTheIncident.value) {
      // Edit existi
      isLoadingDuringTheIncident.value = true; // Show loading spinner
      const response = await DuringTheIncidentAPI.edit(selectedDuringTheIncidentId.value, duringTheIncident);

      if (response.data.ok) {
        showSweetAlert({
          title: "During The Incident Info updated successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDuringTheIncident.value = false; // Hide loading spinner
          loadDuringTheIncident();
          resetDuringTheIncident();
        });
      } else {
        showSweetAlert({
          title: "Error updating During The Incident Info!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDuringTheIncident.value = false; // Hide loading spinner
        });
      }
    } else {
      // Add new During The Incident Info
      isLoadingDuringTheIncident.value = true; // Show loading spinner
      const response = await DuringTheIncidentAPI.add(duringTheIncident);

      if (response.data.ok) {
        showSweetAlert({
          title: "During The Incident Info saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDuringTheIncident.value = false; // Hide loading spinner
          loadDuringTheIncident();
          resetDuringTheIncident();
        });
      } else {
        showSweetAlert({
          title: "Error saving During The Incident Info!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDuringTheIncident.value = false; // Hide loading spinner
        });
      }
    }
  } catch (error) {
    showSweetAlert({
      title: isEditingDuringTheIncident.value
        ? "Error updating During The Incident Info!"
        : "Error saving During The Incident Info!",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      isLoadingDuringTheIncident.value = false; // Hide loading spinner
    });
  }
};

// Handle form submission Incident Detail
const HandleIncidentDetail = async (event) => {
  event.preventDefault();
  formSubmittedIncidentDetail.value = true;

  // Clear previous errorsIncidentDetail
  errorsIncidentDetail.value.incidentDescription_er = "";
  errorsIncidentDetail.value.actionEventConditions_er = "";
  errorsIncidentDetail.value.wereAnyVehiclesTowed_er = "";
  errorsIncidentDetail.value.wasAnyOneHurt_er = "";
  errorsIncidentDetail.value.describeAnyInjuries_er = "";
  errorsIncidentDetail.value.damageToAceTruck_er = "";
  errorsIncidentDetail.value.whatDamageWasDone_er = "";
  errorsIncidentDetail.value.incidentInThePastYear_er = "";
  errorsIncidentDetail.value.listDatesOfIncidents_er = "";



  let hasError = false;

  if (!incidentDescription.value) {
    errorsIncidentDetail.value.incidentDescription_er = "Required field";
    hasError = true;
  }

  if (!actionEventConditions.value) {
    errorsIncidentDetail.value.actionEventConditions_er = "Required field";
    hasError = true;
  }

  if (!wereAnyVehiclesTowed.value) {
    errorsIncidentDetail.value.wereAnyVehiclesTowed_er = "Required field";
    hasError = true;
  }

  if (!wasAnyOneHurt.value) {
    errorsIncidentDetail.value.wasAnyOneHurt_er = "Required field";
    hasError = true;
  }

  if (!describeAnyInjuries.value) {
    errorsIncidentDetail.value.describeAnyInjuries_er = "Required field";
    hasError = true;
  }

  if (!damageToAceTruck.value) {
    errorsIncidentDetail.value.damageToAceTruck_er = "Required field";
    hasError = true;
  }

  if (!whatDamageWasDone.value) {
    errorsIncidentDetail.value.whatDamageWasDone_er = "Required field";
    hasError = true;
  }

  if (!incidentInThePastYear.value) {
    errorsIncidentDetail.value.incidentInThePastYear_er = "Required field";
    hasError = true;
  }

  if (!listDatesOfIncidents.value) {
    errorsIncidentDetail.value.listDatesOfIncidents_er = "Required field";
    hasError = true;
  }

  if (hasError) {
    return;
  }

  let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

  // Create a new FormData object
  const formData = new FormData();

  // Add form fields to FormData
  if (incidentDescription.value) formData.append("incidentDescription", incidentDescription.value);
  if (actionEventConditions.value) formData.append("actionEventConditions", actionEventConditions.value);
  if (wereAnyVehiclesTowed.value) formData.append("wereAnyVehiclesTowed", wereAnyVehiclesTowed.value);
  if (wasAnyOneHurt.value) formData.append("wasAnyOneHurt", wasAnyOneHurt.value);
  if (describeAnyInjuries.value) formData.append("describeAnyInjuries", describeAnyInjuries.value);
  if (damageToAceTruck.value) formData.append("damageToAceTruck", damageToAceTruck.value);
  if (whatDamageWasDone.value) formData.append("whatDamageWasDone", whatDamageWasDone.value);
  if (incidentInThePastYear.value) formData.append("incidentInThePastYear ", incidentInThePastYear.value);
  if (listDatesOfIncidents.value) formData.append("listDatesOfIncidents", listDatesOfIncidents.value);


  formData.append("generalInformation_ref_id", generalInformation_id);

  // Append all selected files to FormData
  selectedFiles.value.forEach((file, index) => {
    formData.append("images", file, file.name); // Use "images" as the key
  });

  try {
    if (isEditingLoad.value) {
      isLoadingLoad.value = true;
      const response = await IncidentDetailAPI.edit(selectedIncidentDetail.value, formData);

      if (response.data.ok) {
        showSweetAlert({
          title: "Incident Detail updated successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingLoad.value = false;
          loadIncidentDetail();
          resetIncidentDetail();
        });
      } else {
        showSweetAlert({
          title: "Error updating Incident Detail!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingIncidentDetail.value = false;
        });
      }
    } else {
      isLoadingIncidentDeail.value = true;
      const response = await IncidentDetailAPI.add(formData);

      if (response.data.ok) {
        showSweetAlert({
          title: "Incident Detail saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingIncidentDetail.value = false;
          loadIncidentDetail();
          resetIncidentDetail();
        });
      } else {
        showSweetAlert({
          title: "Error saving Incident Detail!",
          text: response.data.msg,
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingIncidentDetail.value = false;
        });
      }
    }
  } catch (error) {
    showSweetAlert({
      title: isEditingLoad.value ? "Error updating Incident Detail!" : "Error saving Incident Detail!",
      text: error.response?.data?.msg || "An error occurred",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      isLoadingIncidentDetail.value = false;
    });
    console.error("Error al enviar Incident Detail:", error);
  }
};
// Handle form submission Supervisor Note
const HandleSupervisorNote = async (event) => {
  event.preventDefault();
  formSubmittedSupervisorNote.value = true;

  // Limpiar errores anteriores
  errorsSupervisorNote.value.supervisorNote_er = "";


  let hasError = false;

  if (!supervisorNote.value) {
    errorsSupervisorNote.value.supervisorNote_er = "Required field";
    hasError = true;
  }

  if (hasError) {
    return;
  }

  let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

  const supervisorNote = {
    supervisorNote: supervisorNote.value,
    generalInformation_id: generalInformation_id,

  };

  try {
    if (isEditingSupervisorNote.value) {
      isLoadingSupervisorNote.value = true; // Show loading spinner
      const response = await SupervisorNoteAPI.edit(selectedSupervisorNoteId.value, supervisorNote);

      if (response.data.ok) {
        showSweetAlert({
          title: "Supervisor Note updated successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingSupervisorNote.value = false; // Hide loading spinner
          loadSupervisorNote();
          resetSupervisorNote();
        });
      } else {
        showSweetAlert({
          title: "Error updating Supervisor Note!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingSupervisorNote.value = false; // Hide loading spinner
        });
      }
    } else {
      // Add new Supervisor Note
      isLoadingSupervisorNote.value = true; // Show loading spinner
      const response = await SupervisorNoteAPI.add(supervisorNote);

      if (response.data.ok) {
        showSweetAlert({
          title: "Supervisor Note saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingSupervisorNote.value = false; // Hide loading spinner
          loadSupervisorNote();
          resetSupervisorNote();
        });
      } else {
        showSweetAlert({
          title: "Error saving Supervisor Note!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingSupervisorNote.value = false; // Hide loading spinner
        });
      }
    }
  } catch (error) {
    showSweetAlert({
      title: isEditingSupervisorNote.value ? "Error updating Supervisor Note!" : "Error saving Supervisor Note!",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      isLoadingSupervisorNote.value = false; // Hide loading spinner
    });
  }
};





const EditDuringTheIncident = (item) => {
  selectedDuringTheIncidentId.value = item.id || item._id; // Ensure the ID is captured
  usingElectronicDevice.value = item.usingElectronicDevice || "";
  taskPerfomed.value = item.taskPerfomed || "";
  wasSafetyDeptNotified.value = item.wasSafetyDeptNotified || "";
  didYouTakePictures.value = item.didYouTakePictures || "";
  howFastWereYouGoing.value = item.howFastWereYouGoing || "";
  SelectedSafetyPersonNotified.value = item.safetyPersonNotified_id || "";
  SelectedWhoDidYouSendThePicturesTo.value = item.whoDidYouSendThePicturesTo_id || "";
  SelectedDirectionYouWereTraveling.value = item.directionYouWereTraveling_id || "";
  SelectedWeatherCondition.value = item.weatherCondition_id || "";
  SelectedRoadCondition.value = item.roadCondition_id || "";
  wasThisIncidentInAnIntersection.value = item.wasThisIncidentInAnIntersection || "";
  witness.value = item.witness || "";
  witnessPhone.value = item.witnessPhone || "";


  // Set editing mode
  isEditDuringTheIncident.value = true;
  selectedDuringTheIncidentId.value = item.id || item._id; // Ensure the ID is captured

};

const EditIncidentDetail = async (item) => {

  isLoadingIncidentDeail.value = true; // Set flag to prevent watches from clearing fields

  selectedIncidentDetail.value = item.id || item._id; // Ensure the ID is captured
  incidentDescription.value = item.incidentDescription || "";
  actionEventConditions.value = item.actionEventConditions || "";
  wereAnyVehiclesTowed.value = item.wereAnyVehiclesTowed || "";
  wasAnyOneHurt.value = item.wasAnyOneHurt || "";
  describeAnyInjuries.value = item.describeAnyInjuries || "";
  damageToAceTruck.value = item.damageToAceTruck || "";
  whatDamageWasDone.value = item.whatDamageWasDone || "";
  incidentInThePastYear.value = item.incidentInThePastYear || "";
  listDatesOfIncidents.value = item.listDatesOfIncidents || "";

  existingIncidentDetailImages.value = item.images || []; // Store existing images for the Load being edited

  isEditingIncidentDetail.value = true;
  await nextTick();


  // Set editing mode
  isEditingIncidentDetail.value = true;
  selectedIncidentDetailId.value = item.id || item._id; // Ensure the ID is captured

  isLoadingIncidentDeail.value = false; // Reset loading flag after setting all fields
};

const EditSupervisorNote = async (item) => {
  isLoadingSupervisorNote.value = true; // Set flag to prevent watches from clearing fields
  selectedSupervisorNoteId.value = item.id || item._id; // Ensure the ID is captured
  supervisorNote.value = item.supervisorNote || "";
  isEditingSupervisorNote.value = true;

};

// Delete functions
const DeleteDuringTheIncident = async (item) => {
  showSweetAlert({
    title: "Are you sure you want to delete this During The Incident?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await DuringTheIncidentAPI.delete(item.id || item._id);

        if (response.data.ok) {
          showSweetAlert({
            title: "During The Incident deleted successfully!",
            icon: "success",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: false,
          }).then(() => {
            loadDuringTheIncident();
          });
        } else {
          showSweetAlert({
            title: "Error deleting During The Incident!",
            icon: "error",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        console.error("Error deleting During The Incident:", error);
        showSweetAlert({
          title: "Error deleting During The Incident!",
          icon: "error",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    }
  });
};

const DeleteIncidentDetail = async (item) => {
  showSweetAlert({
    title: "Are you sure you want to delete this Incident Detail?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await IncidentDetailAPI.delete(item.id || item._id);

        if (response.data.ok) {
          showSweetAlert({
            title: "Incident Detail deleted successfully!",
            icon: "success",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: false,
          }).then(() => {
            loadIncidentDetail();
          });
        } else {
          showSweetAlert({
            title: "Error deleting Incident Detail!",
            icon: "error",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        console.error("Error deleting Incident Detail:", error);
        showSweetAlert({
          title: "Error deleting Incident Detail!",
          icon: "error",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    }
  });
};

const DeleteSupervisorNote = async (item) => {
  showSweetAlert({
    title: "Are you sure you want to delete this Supervisor Note?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await LoadAPI.delete(item.id || item._id);

        if (response.data.ok) {
          showSweetAlert({
            title: "Supervisor Note deleted successfully!",
            icon: "success",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: false,
          }).then(() => {
            loadSupervisorNote();
          });
        } else {
          showSweetAlert({
            title: "Error deleting Supervisor Note!",
            icon: "error",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: false,
          });
        }
      } catch (error) {
        console.error("Error deleting Supervisor Note:", error);
        showSweetAlert({
          title: "Error deleting Supervisor Note!",
          icon: "error",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    }
  });
};

const loadDuringTheIncident = async () => {
  const rawGeneralInformation = localStorage.getItem("ACE-INCIDENT-REPORT");
  if (!rawGeneralInformation) return;

  const generalInformation = JSON.parse(rawGeneralInformation);
  const generalInformationId = generalInfromation?.id || generalInformation?._id;

  if (!generalInformationId) return;

  try {
    const response = await GeneralInformationAPI.getDuringTheIncident(generalInformationId);
    duringTheIncidentList.value = response.data.data || [];
  } catch (error) {
    console.error("Error al obtener During The Incident:", error);
  }
};

const loadIncidentDetail = async () => {
  const rawGeneralInformation = localStorage.getItem("ACE-INCIDENT-REPORT");
  if (!rawGeneralInformation) return;

  const generalInformation = JSON.parse(rawGeneralInformation);
  const generalInformationId = generalInformation?.id || generalInformation?._id;

  if (!generalInformationId) return;

  try {
    const response = await GeneralInformationAPI.getIncidentDetail(generalInformationId);
    incidentDetailList.value = response.data.data || [];
  } catch (error) {
    console.error("Error al obtener Incident Detail:", error);
  }

};

const loadSupervisorNote = async () => {
  const rawGeneralInformation = localStorage.getItem("ACE-INCIDENT-REPORT");
  if (!rawGeneralInformation) return;

  const generalInformation = JSON.parse(rawGeneralInformation);
  const generalInformationId = generalInformation?.id || generalInformation?._id;
  if (!generalInformationId) return;
  try {
    const response = await GeneralInformationAPI.getSupervisorNote(generalInformationId);
    supervisorNoteList.value = response.data.data || [];
  } catch (error) {
    console.error("Error al obtener Supervisor Note:", error);
  }

};

const handleVisibleAcordion = async () => {
  const rawGeneralInformation = localStorage.getItem("ACE-INCIDENT-REPORT");
  if (!rawGeneralInformation) return;

  isVisibleAcordion.value = true
};

// Function to handle file change
const handleFileChange = (event) => {
  if (!event.target.files.length || event.target.files[0]?.type.indexOf("image/") !== 0) {
    showSweetAlert({
      title: "Camera Error",
      text: "Unable to access the camera. Please ensure permissions are granted or select an image from the gallery.",
      icon: "warning",
      allowOutsideClick: false,
    });
    return;
  }

  const files = Array.from(event.target.files); // Convert FileList to Array
  const newImages = [];

  for (let file of files) {
    if (file.size > 5242880) {
      showSweetAlert({
        title: "Image with excess size!",
        text: `You cannot upload the image ${file.name}, the maximum allowed is 5Mb`,
        icon: "warning",
        allowOutsideClick: false,
      }).then(() => {
        fileInput.value.value = "";
        selectedImages.value = [];
        selectedFiles.value = []; // Clear files as well
      });
      return;
    }
    newImages.push({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file), // Create URL for preview
    });
  }

  if (newImages.length + selectedImages.value.length > 15) {
    showSweetAlert({
      title: "Upload not completed!",
      text: "At most you can add up to 15 images.",
      icon: "warning",
      allowOutsideClick: false,
    }).then(() => {
      fileInput.value.value = "";
    });
    return;
  }

  // Append new files and images
  selectedFiles.value = [...selectedFiles.value, ...files];
  selectedImages.value = [...selectedImages.value, ...newImages];

  // Clear the file input to allow new selections
  fileInput.value.value = "";
};

const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
};

// Function to download/view image
const downloadImage = (imageUrl) => {
  const fullUrl = `https://backend-fastapi-airc-coversheet-staging.onrender.com/${imageUrl}`;
  window.open(fullUrl, '_blank');
};

// Metodos Utilitarios

const currentDate = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
);

// Edit Spare Truck Info
const formatTime = (controlTimeValue) => {
  if (!controlTimeValue) {
    return "";
  }

  const hours = String(controlTimeValue.hours).padStart(2, "0");
  const minutes = String(controlTimeValue.minutes).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Function to set time from a database string (e.g., "14:36")
const setTimeFromDB = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  if (!isNaN(hours) && !isNaN(minutes)) {
    return { hours, minutes };
  }
};

// Método para manejar el logout
const logout = () => {
  localStorage.removeItem("USER-SAFETY-ACE") // Eliminamos la variable USER del localStorage
  localStorage.removeItem("ACE-INCIDENT-REPORT2") // Eliminamos la variable COVERSHEET2 del localStorage
  router.push({ name: 'login' }) // Redirigimos al usuario a la página de login
}


// const getDenverTimeAsUTCISOString = () => {
//   const now = DateTime.now().setZone('America/Denver'); // Get current time in Denver
//   return now.toUTC().toISO(); // Convert to UTC and return ISO string
// };

const getDenverTimeAsUTCISOString = () => {
  const now = DateTime.now().setZone('America/Denver');
  return now.toFormat('yyyy-MM-dd'); // ✅ Solo fecha, sin hora
};


</script>

<template>
  <div class="container-fluid">
    <div class="page-titles">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <a href="javascript:void(0)">Bootstrap</a>
        </li>
        <li class="breadcrumb-item active">
          <a href="javascript:void(0)">Accordion</a>
        </li>
      </ol>
    </div>

    <Spinner v-if="storeDept.loading || storeTruck.loading" />

    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">

            <form @submit="onSubmit" autocomplete="off">


              <div class="row">


                <!-- <div class="mb-3 col-md-3">
                  <label class="form-label">Employee Name</label>
                  <v-select :options="storeEmployee.employees" v-model="selectedEmployee"
                    placeholder="Choose your Employee" :reduce="(employee) => employee.id" label="employeeName"
                    class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedEmployee }" />
                  <small v-if="errorsGeneralInformation.employee_er" class="text-danger">{{
                    errorsGeneralInformation.employee_er
                  }}</small>
                </div> -->

                <div class="mb-3 col-md-2">
                  <label class="form-label">Truck #</label>
                  <v-select :options="storeTruck.trucks" v-model="selectedTruck" placeholder="Choose your Truck"
                    :reduce="(truck) => truck.id" label="truckNumber" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedTruck }" />
                  <small v-if="errorsGeneralInformation.truck_er" class="text-danger">{{
                    errorsGeneralInformation.truck_er
                  }}</small>
                </div>

                <div class="mb-3 col-md-2">
                  <label class="form-label">Time</label>
                  <div class="mt-0" :class="{ 'dp-error': formSubmittedGeneralInformation && !time }">
                    <VueDatePicker light="true" v-model="time" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errorsGeneralInformation.time_er" class="text-danger">{{
                    errorsGeneralInformation.time_er
                  }}</small>
                </div>


                <div class="mb-3 col-md-2">
                  <label class="form-label">Dept</label>
                  <v-select :options="storeDept.depts" v-model="selectedDept" placeholder="Choose your Dept"
                    :reduce="(dept) => dept.id" label="deptName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedDept }" />
                  <small v-if="errorsGeneralInformation.dept_er" class="text-danger">{{
                    errorsGeneralInformation.dept_er
                  }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Supervisor</label>
                  <v-select :options="storeSupervisor.supervisors" v-model="selectedSupervisor"
                    placeholder="Choose your Supervisor" :reduce="(supervisor) => supervisor.id" label="supervisorName"
                    class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedSupervisor }" />
                  <small v-if="errorsGeneralInformation.supervisor_er" class="text-danger">{{
                    errorsGeneralInformation.supervisor_er
                  }}</small>
                </div>


         





              </div>

              <div class="row">

                <div class="mb-3 col-md-2">
                  <label class="form-label">Type of Incident</label>
                  <v-select :options="storeTypeIncident.typeIncidents" v-model="selectedTypeOfIncident"
                    placeholder="Choose your Incident Type" :reduce="(incidentType) => incidentType.id"
                    label="typeOfIncidentName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedTypeOfIncident }" />
                  <small v-if="errorsGeneralInformation.typeOfIncident_er" class="text-danger">{{
                    errorsGeneralInformation.typeOfIncident_er
                  }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Trainee</label>
                  <input type="text" v-model="trainee" class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !trainee }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.trainee_er" class="text-danger">{{
                    errorsGeneralInformation.trainee_er
                  }}</small>
                </div>


                <div class="mb-3 col-md-7">
                  <label class="form-label">Location</label>
                  <input type="text" v-model="location" class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !location }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.location_er" class="text-danger">{{
                    errorsGeneralInformation.location_er
                  }}</small>
                </div>



              </div>




              <div class="row">
                <div class="mb-3 col-md-2">
                  <label class="form-label">Time worked for company Years</label>
                  <input type="number" step="any" v-model="timeWorkedYears"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !timeWorkedYears }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.timeWorkedYears_er" class="text-danger">{{
                    errorsGeneralInformation.timeWorkedYears_er }}</small>
                </div>

                <div class="mb-3 col-md-2">
                  <label class="form-label">Months</label>
                  <input type="number" step="any" v-model="timeWorkedMonths"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !timeWorkedMonths }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.timeWorkedMonths_er" class="text-danger">{{
                    errorsGeneralInformation.timeWorkedMonths_er }}</small>
                </div>



                
                <div class="mb-3 col-md-2">
                  <label class="form-label">Time Day Started</label>
                  <div class="mt-0" :class="{ 'dp-error': formSubmittedGeneralInformation && !timeDayStarted }">
                    <VueDatePicker v-model="timeDayStarted" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errorsGeneralInformation.timeDayStarted_er" class="text-danger">{{
                    errorsGeneralInformation.timeDayStarted_er
                  }}</small>
                </div>


              </div>

              <!-- <div class="row">
                <div class="mb-3 col-md-12">
                  <label class="form-label">Notes</label>
                  <textarea style="color: black;" v-model="notes" class="form-control border border-primary"></textarea>
                </div>
              </div> -->

              <button type="submit" class="btn btn-primary">
                {{ isEditGeneralInformation ? "Update General Information" : "Start ACE Driver Incident Report"
                }}
              </button>

              <!-- <button style="margin-left: 20px;" class="btn btn-secondary" @click.prevent="logout">
                Finalize CoverSheet
              </button> -->
            </form>
          </div>
        </div>
      </div>-
    </div>

    <div v-if="isVisibleAcordion" class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">
            <form autocomplete="off">





              <!-- <div class="row">

                <div class="accordion accordion-primary-solid" id="accordion-two">

                  <Spinner v-if="isLoadingSpareTruckInfo" />


                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseOne">
                        Spare
                      </button>
                    </h2>

                    <Spinner v-if="storeHomeBase.loading || storeTruck.loading" />


                    <div id="bordered_collapseOne" class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two">
                      <div class="accordion-body">

                        <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Leave Yard</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="timeLeaveYardSpareTruckInfo" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="
                              errorsSpareTruckInfo.leaveYardSpareTruckInfo_er
                            " class="text-danger">{{
                              errorsSpareTruckInfo.leaveYardSpareTruckInfo_er
                              }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Back In Yard</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="timeBackInYardSpareTruckInfo" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="
                              errorsSpareTruckInfo.backInYardSpareTruckInfo_er
                            " class="text-danger">{{
                              errorsSpareTruckInfo.backInYardSpareTruckInfo_er
                              }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Fuel</label>
                            <input type="number" step="any" v-model="fuelSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.fuelSpareTruckInfo_er" class="text-danger">{{
                              errorsSpareTruckInfo.fuelSpareTruckInfo_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">DEF</label>
                            <input type="number" step="any" v-model="dieselExhaustFluidSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.dieselExhaustFluidSpareTruckInfo_er"
                              class="text-danger">{{
                                errorsSpareTruckInfo.dieselExhaustFluidSpareTruckInfo_er }}</small>
                          </div>


                        </div>

                        <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Spare Truck #</label>
                            <v-select :options="storeTruck.trucks" v-model="selectedTruckSpareTruckInfo"
                              placeholder="Choose your Truck" :reduce="(truck) => truck.id" label="truckNumber"
                              class="form-control p-0" />

                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Truck Start Miles</label>
                            <input type="number" step="any" v-model="truckStartMilesSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.truckStartMilesSpareTruckInfo_er" class="text-danger">{{
                              errorsSpareTruckInfo.truckStartMilesSpareTruckInfo_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Truck End Miles</label>
                            <input type="number" step="any" v-model="truckEndMilesSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.truckEndMilesSpareTruckInfo_er" class="text-danger">{{
                              errorsSpareTruckInfo.truckEndMilesSpareTruckInfo_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Truck Start Hours</label>
                            <input type="number" step="any" v-model="truckStartHoursSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.truckStartHoursSpareTruckInfo_er" class="text-danger">{{
                              errorsSpareTruckInfo.truckStartHoursSpareTruckInfo_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Truck End Hours</label>
                            <input type="number" step="any" v-model="truckEndHoursSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.truckEndHoursSpareTruckInfo_er" class="text-danger">{{
                              errorsSpareTruckInfo.truckEndHoursSpareTruckInfo_er }}</small>
                          </div>



                        </div>

                        <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Spare Trailer #</label>
                            <v-select :options="storeTrailer.trailers" v-model="selectedTrailerSpareTruckInfo"
                              placeholder="Choose your Truck" :reduce="(trailer) => trailer.id" label="trailerNumber"
                              class="form-control p-0" />



                          </div>



                          <div class="mb-3 col-md-2">
                            <label class="form-label">Trailer Start Miles</label>
                            <input type="number" step="any" v-model="trailerStartMilesSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.trailerStartMilesSpareTruckInfo_er" class="text-danger">{{
                              errorsSpareTruckInfo.trailerStartMilesSpareTruckInfo_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Trailer End Miles</label>
                            <input type="number" step="any" v-model="trailerEndMilesSpareTruckInfo"
                              class="form-control form-control-lg border border-primary" style="color: black;" />
                            <small v-if="errorsSpareTruckInfo.trailerEndMilesSpareTruckInfo_er" class="text-danger">{{
                              errorsSpareTruckInfo.trailerEndMilesSpareTruckInfo_er }}</small>
                          </div>

                          <div class="mb-4 col-md-3 align-self-end">
                            <button :disabled="isLoadingSpareTruckInfo" style="margin-bottom: -5px !important;"
                              @click="HandleSpareTruckInfo" type="button" class="btn btn-info">
                              {{ isEditingSpareTruckInfo ? "Save" : "Add" }}
                              <span class="btn-icon-end">
                                <i :class="isEditingSpareTruckInfo ? 'fa fa-save' : 'fa fa-plus'"></i>
                              </span>
                            </button>
                          </div>


                        </div>

                        <div class="row">
                          <hr style="color: black" />
                          <div class="table-responsive">
                            <table
                              class="table table-bordered header-border table-striped table-hover table-responsive-md">
                              <thead class="thead-primary">
                                <tr>
                       
                                  <th>Spare Truck</th>
                                  <th>Spare Trailer</th>
                                  <th>Leave Yard</th>
                                  <th>Back In Yard</th>
                                  <th>Fuel</th>
                                  <th>DEF</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(item, index) in spareTruckList" :key="index">
    
                                  <td class="td">{{ item.truckNumber }}</td>
                                  <td class="td">{{ item.trailerNumber }}</td>
                                  <td class="td">{{ item.timeLeaveYardSpareTruckInfo }}</td>
                                  <td class="td">{{ item.timeBackInYardSpareTruckInfo }}</td>
                                  <td class="td">{{ item.fuelSpareTruckInfo }}</td>
                                  <td class="td">{{ item.dieselExhaustFluidSpareTruckInfo }}</td>
                                  <td>
                                    <div>
                                      <a @click="EditSpareTruckInfo(item)"
                                        class="btn btn-primary shadow btn-xs sharp me-1"><i
                                          class="fa fa-pencil"></i></a>
                                      <a
                                        @click="DeleteSpareTruckInfo(item)"
                                        class="btn btn-danger shadow btn-xs sharp"
                                        ><i class="fa fa-trash"></i
                                      ></a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <Spinner v-if="isLoadingDowntime" />
                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseTwo">
                        Downtime
                      </button>
                    </h2>
                    <div id="bordered_collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordion-two">
                      <div class="accordion-body">

                        <div class="row">

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Truck #</label>
                            <v-select :options="storeTruck.trucks" v-model="selectedTruckDownTime"
                              placeholder="Choose your Truck" :reduce="(truck) => truck.id" label="truckNumber"
                              class="form-control p-0"
                               />
                            <small v-if="errorsDowntime.selectedTruckDownTime_er" class="text-danger">{{
                              errorsDowntime.selectedTruckDownTime_er }}</small>
                          </div>

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Truck Downtime Start</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="truckDownTimeStartDownTime" time-picker placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsDowntime.truckDownTimeStartDownTime_er" class="text-danger">{{
                              errorsDowntime.truckDownTimeStartDownTime_er }}</small>
                          </div>


                          <div class="mb-3 col-md-3">
                            <label class="form-label">Truck Downtime End</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="truckDownTimeEndDownTime" time-picker placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsDowntime.truckDownTimeEndDownTime_er" class="text-danger">{{
                              errorsDowntime.truckDownTimeEndDownTime_er }}</small>
                          </div>

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Type</label>
                            <v-select :options="storeTypeDowntime.typeDownTimes" v-model="selectedTypeTruckDownTime"
                              placeholder="Choose your Type" :reduce="(typedowntimes) => typedowntimes.id"
                              label="typeDownTimeName" class="form-control p-0" />
                            <small v-if="errorsDowntime.selectedTypeTruckDownTime_er" class="text-danger">{{
                              errorsDowntime.selectedTypeTruckDownTime_er }}</small>
                          </div>


                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-3">
                            <label class="form-label">Trailer #</label>
                            <v-select :options="storeTrailer.trailers" v-model="selectedTrailerDownTime"
                              placeholder="Choose your Trailer" :reduce="(trailer) => trailer.id" label="trailerNumber"
                              class="form-control p-0"
                               />
                            <small v-if="errorsDowntime.selectedTrailerDownTime_er" class="text-danger">{{
                              errorsDowntime.selectedTrailerDownTime_er }}</small>
                          </div>

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Trailer Downtime Start</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="trailerDownTimeStartDownTime" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsDowntime.trailerDownTimeStartDownTime_er" class="text-danger">{{
                              errorsDowntime.trailerDownTimeStartDownTime_er }}</small>
                          </div>


                          <div class="mb-3 col-md-3">
                            <label class="form-label">Trailer Downtime End</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="trailerDownTimeEndDownTime" time-picker placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsDowntime.trailerDownTimeEndDownTime_er" class="text-danger">{{
                              errorsDowntime.trailerDownTimeEndDownTime_er }}</small>
                          </div>


                          <div class="mb-3 col-md-3">
                            <label class="form-label">Type</label>
                            <v-select :options="storeTypeDowntime.typeDownTimes" v-model="selectedTypeTrailerDownTime"
                              placeholder="Choose your Type" :reduce="(typedowntimes) => typedowntimes.id"
                              label="typeDownTimeName" class="form-control p-0" />
                            <small v-if="errorsDowntime.selectedTypeTrailerDownTime_er" class="text-danger">{{
                              errorsDowntime.selectedTypeTrailerDownTime_er }}</small>
                          </div>


                        </div>

                        <div class="row">

                          <div class="mb-3 col-md-9">
                            <label class="form-label">Downtime Reason</label>
                            <input type="text" v-model="downTimeReasonDownTime"
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsDowntime.downTimeReasonDownTime_er" class="text-danger">{{
                              errorsDowntime.downTimeReasonDownTime_er }}</small>
                          </div>

                          <div class="mb-4 col-md-3 align-self-end">



                            <button :disabled="isLoadingDowntime" style="margin-bottom: -7px !important;"
                              @click="HandleDowntime" type="button" class="btn btn-info">
                              {{ isEditingDowntime ? "Save" : "Add" }}
                              <span class="btn-icon-end">
                                <i :class="isEditingDowntime ? 'fa fa-save' : 'fa fa-plus'"></i>
                              </span>
                            </button>


                          </div>





                        </div>

                        <div class="row">
                          <hr style="color: black" />
                          <div class="table-responsive">
                            <table
                              class="table table-bordered header-border table-striped table-hover table-responsive-md">
                              <thead class="thead-primary">
                                <tr>
                                  <th>Truck #</th>
                                  <th>Truck Downtime Start</th>
                                  <th>Truck Downtime End</th>
                                  <th>Trailer #</th>
                                  <th>Trailer Downtime Start</th>
                                  <th>Trailer Downtime End</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(item, index) in downtimeList" :key="index">
                                  <td class="td">{{ item.truckNumber }}</td>
                                  <td class="td">{{ item.truckDownTimeStartDownTime }}</td>
                                  <td class="td">{{ item.truckDownTimeEndDownTime }}</td>
                                  <td class="td">{{ item.trailerNumber }}</td>
                                  <td class="td">{{ item.trailerDownTimeStartDownTime }}</td>
                                  <td class="td">{{ item.trailerDownTimeEndDownTime }}</td>
                                  <td>
                                    <div>
                                      <a @click="EditDowntime(item)" class="btn btn-primary shadow btn-xs sharp me-1"><i
                                          class="fa fa-pencil"></i></a>
                                      <a
                                        @click="DeleteDowntime(item)"
                                        class="btn btn-danger shadow btn-xs sharp"
                                        ><i class="fa fa-trash"></i
                                      ></a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>







                      </div>
                    </div>
                  </div>

                  <Spinner v-if="isLoadingLoad" />

                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseThree">
                        Load
                      </button>
                    </h2>
                    <div id="bordered_collapseThree" class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two">
                      <div class="accordion-body">

                        <div class="row">

                          <div class="mb-3">
                            <div class="form-check form-check-inline">
                              <label class="form-check-label">
                                <input type="checkbox" class="form-check-input" v-model="preloadedLoad"> Preloaded
                              </label>
                            </div>
                            <div class="form-check form-check-inline">
                              <label class="form-check-label">
                                <input type="checkbox" class="form-check-input" v-model="preloadedNextDayLoad"> Preload
                                for
                                next day
                              </label>
                            </div>
                          </div>



                        </div>

                        <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tunnel Time In</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="tunnelTimeInLoad" :disabled="preloadedLoad" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsLoad.tunnelTimeInLoad_er" class="text-danger">{{
                              errorsLoad.tunnelTimeInLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tunnel Time Out</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="tunnelTimeOutLoad" :disabled="preloadedLoad" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsLoad.tunnelTimeOutLoad_er" class="text-danger">{{
                              errorsLoad.tunnelTimeOutLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Leave Yard</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="leaveYardLoad" :disabled="preloadedNextDayLoad" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsLoad.leaveYardLoad_er" class="text-danger">{{ errorsLoad.leaveYardLoad_er
                              }}</small>
                          </div>

                          <div class="mb-3 col-md-4">
                            <label class="form-label">Operator</label>
                            <v-select :options="storeOperator.operators" v-model="selectedOperatorLoad"
                              :disabled="preloadedLoad" placeholder="Choose your Operator"
                              :reduce="(operator) => operator.id" label="operatorName" class="form-control p-0" />
                            <small v-if="errorsLoad.selectedOperatorLoad_er" class="text-danger">{{
                              errorsLoad.selectedOperatorLoad_er }}</small>
                          </div>

                        </div>
                        
                        <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Source</label>
                            <v-select :options="storeSource.sources" v-model="selectedSourceLoad"
                              placeholder="Choose your Source" :reduce="(source) => source.id" label="sourceName"
                              class="form-control p-0" />
                            <small v-if="errorsLoad.selectedSourceLoad_er" class="text-danger">{{
                              errorsLoad.selectedSourceLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Destination</label>
                            <v-select :options="storeDestination.destinations" :disabled="preloadedNextDayLoad"
                              v-model="selectedDestinationLoad" placeholder="Choose your Destination"
                              :reduce="(destination) => destination.id" label="destinationName"
                              class="form-control p-0" />
                            <small v-if="errorsLoad.selectedDestinationLoad_er" class="text-danger">{{
                              errorsLoad.selectedDestinationLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Material</label>
                            <v-select :options="filteredMaterials" v-model="selectedMaterialLoad"
                              placeholder="Choose your Material" :reduce="(material) => material.id"
                              label="materialName" class="form-control p-0" />
                            <small v-if="errorsLoad.selectedMaterialLoad_er" class="text-danger">{{
                              errorsLoad.selectedMaterialLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Destination Time In</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="timeInLoad" :disabled="preloadedNextDayLoad" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsLoad.timeInLoad_er" class="text-danger">{{ errorsLoad.timeInLoad_er
                              }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Destination Time Out</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="timeOutLoad" :disabled="preloadedNextDayLoad" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsLoad.timeOutLoad_er" class="text-danger">{{ errorsLoad.timeOutLoad_er
                              }}</small>
                          </div>


                        </div>
                        <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Ticket #</label>
                            <input type="text" v-model="ticketNumberLoad" :disabled="preloadedNextDayLoad"
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsLoad.ticketNumberLoad_er" class="text-danger">{{
                              errorsLoad.ticketNumberLoad_er }}</small>
                          </div>


                          <div class="mb-3 col-md-2">
                            <label class="form-label">Gross Weight</label>
                            <input type="number" step="any" v-model="grossWeightLoad" :disabled="preloadedNextDayLoad"
                              class="form-control form-control-sm border border-primary"
                              :class="{ 'border-danger': tonsError }" />
                            <small v-if="errorsLoad.grossWeightLoad_er" class="text-danger">
                              {{ errorsLoad.grossWeightLoad_er }}
                            </small>
                          </div>

    
                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tare Weight</label>
                            <input type="number" step="any" v-model="tareWeightLoad" :disabled="preloadedNextDayLoad"
                              class="form-control form-control-sm border border-primary"
                              :class="{ 'border-danger': tonsError }" />
                            <small v-if="errorsLoad.tareWeightLoad_er" class="text-danger">
                              {{ errorsLoad.tareWeightLoad_er }}
                            </small>
                          </div>


                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tons</label>
                            <input type="number" step="any" v-model="calculatedTons" disabled readonly
                              class="form-control form-control-sm border border-primary calculated-field"
                              :class="{ 'border-danger': tonsError }" placeholder="Auto-calculated" />
                            <small v-if="tonsError" class="text-danger">{{ tonsError }}</small>
                            <small v-else-if="errorsLoad.tonsLoad_er" class="text-danger">
                              {{ errorsLoad.tonsLoad_er }}
                            </small>
                          </div>
                          <div class="mb-3 col-md-2">
                            <label class="form-label">Return To Yard</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="backYardLoad" :disabled="preloadedNextDayLoad" time-picker
                                placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsLoad.backYardLoad_er" class="text-danger">{{ errorsLoad.backYardLoad_er
                              }}</small>
                          </div>





                        </div>

                        <div class="row d-flex align-items-center">


                          <div class="mb-3 col-md-9">
           
                            <input v-show="false" type="file" ref="fileInput"
                              class="form-control form-control-sm border border-primary" multiple accept="image/*"
                              capture="environment" @change="handleFileChange"
                              style="height: 38px; padding: 0.375rem 0.75rem;" />

                            <button @click.prevent="fileInput.click()" style="height: 50px;" type="button"
                              class="btn btn-primary btn-rounded btn-sm">Add Photos<span class="btn-icon-end"><i
                                  class="fa fa-camera"></i></span>
                            </button>


                            <div v-if="selectedImages.length > 0" class="row mt-2">
                              <div v-for="(image, index) in selectedImages" :key="index" class="col-md-3">
                                <img :src="image.url" alt="Preview" style="max-width: 100px; margin-bottom: 10px;" />
                                <p>{{ image.name }} ({{ (image.size / 1024).toFixed(2) }} KB)</p>
                                <button @click.prevent="removeImage(index)"
                                  class="btn btn-danger btn-xs">Remove</button>
                              </div>
                            </div>


                            <div v-if="existingLoadImages.length > 0" class="row mt-3">
                              <h6 style="color: #000;">Existing Images:</h6>
                              <div class="col-md-12">
                                <div class="d-flex flex-wrap">
                                  <img
                                    v-for="(image, index) in existingLoadImages"
                                    :key="'existing-' + index"
                                    :src="'https://backend-fastapi-airc-coversheet-staging.onrender.com/' + image"
                                    style="max-width: 100px; margin: 10px; cursor: pointer; border: 2px solid #007bff;"
                                    @click="downloadImage(image)"
                                    alt="Existing Load Image"
                                  />
                                </div>
                              </div>
                            </div>
 
                            <small v-if="errorsLoad.imagesLoad_er" class="text-danger">{{ errorsLoad.imagesLoad_er
                              }}</small>
                          </div>


                          <div style="margin-bottom: -10px !important;" class="mb-0 col-md-3 d-flex">
                            <button :disabled="isLoadingLoad" @click="HandleLoad" type="button" class="btn btn-info"
                              style="height: 38px; padding: 0.375rem 0.75rem;">
                              {{ isEditingLoad ? "Save" : "Add" }}
                              <span class="btn-icon-end">
                                <i :class="isEditingLoad ? 'fa fa-save' : 'fa fa-plus'"></i>
                              </span>
                            </button>
                          </div>
                        </div>




                        <div class="row">

                          <div class="mb-3 col-md-12">
                            <label class="form-label">Note</label>
                            <input type="text" v-model="noteLoad"
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsLoad.noteLoad_er" class="text-danger">{{ errorsLoad.noteLoad_er
                              }}</small>
                          </div>


                        </div>

                        <div class="row">
                          <hr style="color: black" />
                          <div class="table-responsive">
                            <table
                              class="table table-bordered header-border table-striped table-hover table-responsive-md">
                              <thead class="thead-primary">
                                <tr>
                 
                                  <th>Source</th>
                                  <th>Destination</th>
                                  <th>Material</th>
                                  <th>Tunnel Time In</th>
                                  <th>Tunnel Time Out</th>
                                  <th>Operator</th>
                                  <th>Ticket #</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(item, index) in loadList" :key="index">
                                  <td class="td">{{ item.sourceName }}</td>
                                  <td class="td">{{ item.destinationName }}</td>
                                  <td class="td">{{ item.materialName }}</td>
                                  <td class="td">{{ item.tunnelTimeInLoad }}</td>
                                  <td class="td">{{ item.tunnelTimeOutLoad }}</td>
                                  <td class="td">{{ item.operatorName }}</td>
                                  <td class="td">{{ item.ticketNumberLoad }}</td>
                                  <td>
                                    <div>
                                      <a @click="EditLoad(item)" class="btn btn-primary shadow btn-xs sharp me-1"><i
                                          class="fa fa-pencil"></i></a>
                                      <a
                                        @click="DeleteLoad(item)"
                                        class="btn btn-danger shadow btn-xs sharp"
                                        ><i class="fa fa-trash"></i
                                      ></a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> -->

            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-slot-image {
  height: 20px;
  width: auto;
  margin-left: 5px;
}

.v-select {
  font-size: 1rem;
}

.v-select .vs__dropdown-toggle {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  min-height: 38px;
}

.v-select .vs__selected,
.v-select .vs__search {
  margin: 0;
  padding: 0;
}

.v-select .vs__search {
  line-height: 1.5;
  padding-left: 0.25rem;
}

.v-select .vs__dropdown-menu {
  border: 1px solid #ced4da;
  border-top: none;
  border-radius: 0 0 0.375rem 0.375rem;
}

.v-select .vs__dropdown-option--highlight {
  background-color: #0d6efd;
  color: white;
}

.text-danger {
  color: red;
  font-size: 0.75rem;
}

.td {
  color: black;
}

/* Ajustes para alinear verticalmente */
.form-control-sm {
  min-height: 38px !important;
  padding: 0.375rem 0.75rem !important;
}

.btn-info {
  min-height: 38px !important;
  padding: 0.375rem 0.75rem !important;
}

/* Borde rojo cuando el campo es inválido */
.v-select.is-invalid .vs__dropdown-toggle {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* Estilos para campos de texto deshabilitados */
input[type="text"]:disabled,
input[type="number"]:disabled {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
  opacity: 0.65 !important;
  border-color: #ced4da !important;
}

/* Estilos para VueDatePicker deshabilitado */
.dp__input:disabled {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
  opacity: 0.65 !important;
  border-color: #ced4da !important;
}

/* Estilos para v-select deshabilitado */
.v-select.vs--disabled .vs__dropdown-toggle {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
  opacity: 0.65 !important;
  border-color: #ced4da !important;
}

.v-select.vs--disabled .vs__selected {
  color: #6c757d !important;
}

.v-select.vs--disabled .vs__search,
.v-select.vs--disabled .vs__search:focus {
  background-color: transparent !important;
  cursor: not-allowed !important;
}

.v-select.vs--disabled .vs__actions {
  cursor: not-allowed !important;
}

.v-select.vs--disabled .vs__clear,
.v-select.vs--disabled .vs__open-indicator {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
}

.dp__theme_light {
  --dp-background-color: #ffffff;
  --dp-text-color: #212121;
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #1976d2;
  --dp-primary-disabled-color: #6bacea;
  --dp-primary-text-color: #f8f5f5;
  --dp-secondary-color: #c0c4cc;
  --dp-border-color: #ddd;
  --dp-menu-border-color: #ddd;
  --dp-border-color-hover: #aaaeb7;
  --dp-border-color-focus: #aaaeb7;
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #959595;
  --dp-danger-color: #ff6f60;
  --dp-marker-color: #ff6f60;
  --dp-tooltip-color: #fafafa;
  --dp-disabled-color-text: #8e8e8e;
  --dp-highlight-color: rgb(25 118 210 / 10%);
  --dp-range-between-dates-background-color: var(--dp-hover-color, #f3f3f3);
  --dp-range-between-dates-text-color: var(--dp-hover-text-color, #212121);
  --dp-range-between-border-color: var(--dp-hover-color, #f3f3f3);
}

/* ✅ Estilos para el campo calculado */
.calculated-field {
  background-color: #f8f9fa !important;
  font-weight: 600;
  color: #495057 !important;
  cursor: not-allowed !important;
}

.calculated-field:disabled {
  opacity: 1 !important;
}

/* Borde rojo cuando hay error de validación */
.border-danger {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

/* Borde rojo para VueDatePicker cuando hay error de validación */
.dp-error .dp__input {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}
</style>