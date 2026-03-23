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
const locationSuggestions = ref([]); // Sugerencias de Nominatim
const locationLoading = ref(false); // Loading mientras busca
const showLocationDropdown = ref(false); // Controlar visibilidad del dropdown
let locationDebounceTimer = null; // Timer para debounce
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
const isEditingGeneralInformation = ref(false);
const isLoadingGeneralInformation = ref(false); // To show loading spinner when fetching general information
const formSubmittedGeneralInformation = ref(false);


// During the incident

const duringTheIncidentList = ref([]);
const selectedDuringTheIncidentId = ref(null); // To track the ID of the During The Incident info being edited

const usingElectronicDevice = ref(false);
const taskPerfomed = ref("");
const wasSafetyDeptNotified = ref(false);
const didYouTakePictures = ref(false);
const howFastWereYouGoing = ref("");

const SelectedSafetyPersonNotified = ref("");
const SelectedWhoDidYouSendThePicturesTo = ref("");
const SelectedDirectionYouWereTraveling = ref("");
const SelectedWeatherCondition = ref("");
const SelectedRoadCondition = ref("");

const wasThisIncidentInAnIntersection = ref(false);
const witness = ref(""); // Nombre del testigo, si aplica
const witnessPhone = ref(""); // Telefono del testigo, si aplica

// ✅ Formateador de teléfono: (XXX) XXX-XXXX
const formatPhone = (e) => {
  // Extraer solo dígitos
  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);

  let formatted = "";
  if (digits.length === 0) {
    formatted = "";
  } else if (digits.length <= 3) {
    formatted = `(${digits}`;
  } else if (digits.length <= 6) {
    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  witnessPhone.value = formatted;
};

const isEditingDuringTheIncident = ref(false);
const isLoadingDuringTheIncident = ref(false); // To show loading spinner when fetching during the incident info
const formSubmittedDuringTheIncident = ref(false); // To track if During the Incident form has been submitted

// ✅ Limpiar Safety Person Notified cuando el switch se desactiva
watch(wasSafetyDeptNotified, (newValue) => {
  if (!newValue) {
    SelectedSafetyPersonNotified.value = "";
  }
});

// ✅ Limpiar Who Did You Send The Pictures To cuando el switch se desactiva
watch(didYouTakePictures, (newValue) => {
  if (!newValue) {
    SelectedWhoDidYouSendThePicturesTo.value = "";
  }
});


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
const wereAnyVehiclesTowed = ref(false);
const wasAnyOneHurt = ref(false);
const describeAnyInjuries = ref("");

const damageToAceTruck = ref("");
const whatDamageWasDone = ref("");
const incidentInThePastYear = ref("");
const listDatesOfIncidents = ref("");


const isEditingIncidentDetail = ref(false);
const isLoadingIncidentDetail = ref(false);
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
  anyVehicleTowed_er: "",
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

  let ace_incident_report_employee_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.employee_id || null;

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
      isEditingGeneralInformation.value = true;
      const generalInformation = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"));

      // selectedEmployee.value = generalInformation.employee_id;
      selectedTruck.value = generalInformation.truck_id;
      selectedDept.value = generalInformation.dept_id;
      selectedSupervisor.value = generalInformation.supervisor_id;
      selectedTypeOfIncident.value = generalInformation.typeOfIncident_id;
      

      location.value = generalInformation.location;
      trainee.value = generalInformation.trainerName;
      time.value = setTimeFromDB(generalInformation.time);
      timeWorkedYears.value = generalInformation.timeWorkedYears;
      timeWorkedMonths.value = generalInformation.timeWorkedMonths;
      timeDayStarted.value = setTimeFromDB(generalInformation.timeDayStarted);


      handleVisibleAcordion();
       loadDuringTheIncident();
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
    isLoadingGeneralInformation.value = true; // ✅ Bloquea el botón durante el request
    if (!isEditingGeneralInformation.value) {
      const response = await GeneralInformationAPI.add(generalInformationData);

      if (response.data.ok) {
        localStorage.setItem("ACE-INCIDENT-REPORT", JSON.stringify(response.data.data));
        const generalInformation = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"));

        isEditingGeneralInformation.value = true;

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
  } finally {
    isLoadingGeneralInformation.value = false; // ✅ Libera el botón siempre, éxito o error
  }
};


// ✅ Nominatim Address Autocomplete
const searchLocation = () => {
  clearTimeout(locationDebounceTimer);
  locationSuggestions.value = [];

  if (!location.value || location.value.length < 3) {
    showLocationDropdown.value = false;
    return;
  }

  locationDebounceTimer = setTimeout(async () => {
    locationLoading.value = true;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location.value)}&format=json&limit=5&countrycodes=us`,
        { headers: { "Accept-Language": "en" } }
      );
      locationSuggestions.value = await res.json();
      showLocationDropdown.value = locationSuggestions.value.length > 0;
    } catch (e) {
      locationSuggestions.value = [];
      showLocationDropdown.value = false;
    } finally {
      locationLoading.value = false;
    }
  }, 400);
};

const selectLocation = (item) => {
  location.value = item.display_name;
  locationSuggestions.value = [];
  showLocationDropdown.value = false;
  // Limpiar error si existía
  errorsGeneralInformation.value.location_er = "";
};

const hideLocationDropdown = () => {
  setTimeout(() => {
    showLocationDropdown.value = false;
  }, 200); // pequeño delay para que el click en la opción se registre primero
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


  isEditingGeneralInformation.value = false;
  formSubmittedGeneralInformation.value = false;
};

// Reset During the Incident form
const resetDuringTheIncident = () => {

  selectedDuringTheIncidentId.value = null;
  usingElectronicDevice.value = false;
  taskPerfomed.value = "";
  wasSafetyDeptNotified.value = false;
  didYouTakePictures.value = false;
  howFastWereYouGoing.value = "";
  SelectedSafetyPersonNotified.value = "";
  SelectedWhoDidYouSendThePicturesTo.value = "";
  SelectedDirectionYouWereTraveling.value = "";
  SelectedWeatherCondition.value = "";
  SelectedRoadCondition.value = "";
  wasThisIncidentInAnIntersection.value = false;
  witness.value = "";
  witnessPhone.value = "";

  isEditingDuringTheIncident.value = false;
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

    if (!taskPerfomed.value) {
      errorsDuringTheIncident.value.taskPerfomed_er = "Required field";
      hasError = true;
    }

    if (wasSafetyDeptNotified.value && !SelectedSafetyPersonNotified.value) {
      errorsDuringTheIncident.value.SelectedSafetyPersonNotified_er = "Required field";
      hasError = true;
    }   

    
    if (didYouTakePictures.value && !SelectedWhoDidYouSendThePicturesTo.value) {
      errorsDuringTheIncident.value.SelectedWhoDidYouSendThePicturesTo_er = "Required field";
      hasError = true;
    } 



    if (!howFastWereYouGoing.value) {
      errorsDuringTheIncident.value.howFastWereYouGoing_er = "Required field";
      hasError = true;
    }     


      if (!SelectedDirectionYouWereTraveling.value) {
        errorsDuringTheIncident.value.SelectedDirectionYouWereTraveling_er = "Required field";
        hasError = true;
      } 
      if (!SelectedWeatherCondition.value) {
        errorsDuringTheIncident.value.SelectedWeatherCondition_er = "Required field";
        hasError = true;
      } 
      if (!SelectedRoadCondition.value) {
        errorsDuringTheIncident.value.SelectedRoadCondition_er = "Required field";
        hasError = true;
      } 


        if (witnessPhone.value && !/^\(\d{3}\) \d{3}-\d{4}$/.test(witnessPhone.value)) {
          errorsDuringTheIncident.value.witnessPhone_er = "Invalid phone format. Use (XXX) XXX-XXXX";
          hasError = true;
        }




  if (hasError) {
    return;
  }

  // Obtener el ID de General Information para asociarlo con During The Incident al momento de agregar
   let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

     const response = await GeneralInformationAPI.getDuringTheIncident(generalInformation_id);
    duringTheIncidentList.value = response.data.data || [];

    if(duringTheIncidentList.value.length) {

      // Si ya existe información de During The Incident obtenemos el ID para editar en lugar de agregar nueva información
      selectedDuringTheIncidentId.value = duringTheIncidentList.value[0]?.id || duringTheIncidentList.value[0]?._id || null; // Capture ID for editing  
      
    
    }

   const duringTheIncident = {
    usingElectronicDevice: usingElectronicDevice.value,
    taskPerfomed: taskPerfomed.value,
    wasSafetyDeptNotified: wasSafetyDeptNotified.value,
    didYouTakePictures: didYouTakePictures.value,
    howFastWereYouGoing: howFastWereYouGoing.value,
    safetyPersonNotified_id: SelectedSafetyPersonNotified.value || "",
    whoDidYouSendThePicturesTo_id: SelectedWhoDidYouSendThePicturesTo.value || "",
    directionYouWereTraveling_id: SelectedDirectionYouWereTraveling.value || "",
    weatherCondition_id: SelectedWeatherCondition.value || "",
    roadCondition_id: SelectedRoadCondition.value || "",
    wasThisIncidentInAnIntersection: wasThisIncidentInAnIntersection.value,
    witness: witness.value,
    witnessPhone: witnessPhone.value,
    selectedDuringTheIncidentId: selectedDuringTheIncidentId.value,

    generalInformation_ref_id: generalInformation_id,

  };



  try {

    if (isEditingDuringTheIncident.value) {

      
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
          //loadDuringTheIncident();
          //resetDuringTheIncident();
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
          //loadDuringTheIncident();
          //resetDuringTheIncident();
          isEditingDuringTheIncident.value = true; // Switch to edit mode after adding new info
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
  errorsIncidentDetail.value.anyVehicleTowed_er = "";



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
      isLoadingIncidentDetail.value = true;
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
    generalInformation_ref_id: generalInformation_id,

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
  usingElectronicDevice.value = item.usingElectronicDevice === true || item.usingElectronicDevice === "true" || false;
  taskPerfomed.value = item.taskPerfomed || "";
  wasSafetyDeptNotified.value = item.wasSafetyDeptNotified === true || item.wasSafetyDeptNotified === "true" || false;
  didYouTakePictures.value = item.didYouTakePictures === true || item.didYouTakePictures === "true" || false;
  howFastWereYouGoing.value = item.howFastWereYouGoing || "";
  SelectedSafetyPersonNotified.value = item.safetyPersonNotified_id || "";
  SelectedWhoDidYouSendThePicturesTo.value = item.whoDidYouSendThePicturesTo_id || "";
  SelectedDirectionYouWereTraveling.value = item.directionYouWereTraveling_id || "";
  SelectedWeatherCondition.value = item.weatherCondition_id || "";
  SelectedRoadCondition.value = item.roadCondition_id || "";
  wasThisIncidentInAnIntersection.value = item.wasThisIncidentInAnIntersection === true || item.wasThisIncidentInAnIntersection === "true" || false;
  witness.value = item.witness || "";
  witnessPhone.value = item.witnessPhone || "";


  // Set editing mode
  isEditingDuringTheIncident.value = true;
  selectedDuringTheIncidentId.value = item.id || item._id; // Ensure the ID is captured

};

const EditIncidentDetail = async (item) => {

  isLoadingIncidentDetail.value = true; // Set flag to prevent watches from clearing fields

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

  isLoadingIncidentDetail.value = false; // Reset loading flag after setting all fields
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
            //loadDuringTheIncident();
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
  const generalInformationId = generalInformation?.id || generalInformation?._id;

  if (!generalInformationId) return;

  try {
    const response = await GeneralInformationAPI.getDuringTheIncident(generalInformationId);
    duringTheIncidentList.value = response.data.data || [];

    if(!duringTheIncidentList.value.length) {
      resetDuringTheIncident(); // Clear form if no data
      isEditingDuringTheIncident.value = false; // Ensure we're in add mode
      return;
    
    } else {

    // Cargamos la seccion de During the Incident

    usingElectronicDevice.value = duringTheIncidentList.value[0]?.usingElectronicDevice || false;
    taskPerfomed.value = duringTheIncidentList.value[0]?.taskPerfomed || "";
    wasSafetyDeptNotified.value = duringTheIncidentList.value[0]?.wasSafetyDeptNotified || false;
    didYouTakePictures.value = duringTheIncidentList.value[0]?.didYouTakePictures || false;
    howFastWereYouGoing.value = duringTheIncidentList.value[0]?.howFastWereYouGoing || "";
    SelectedSafetyPersonNotified.value = duringTheIncidentList.value[0]?.safetyPersonNotified_id || "";
    SelectedWhoDidYouSendThePicturesTo.value = duringTheIncidentList.value[0]?.whoDidYouSendThePicturesTo_id || "";
    SelectedDirectionYouWereTraveling.value = duringTheIncidentList.value[0]?.directionYouWereTraveling_id || "";
    SelectedWeatherCondition.value = duringTheIncidentList.value[0]?.weatherCondition_id || ""; 
    SelectedRoadCondition.value = duringTheIncidentList.value[0]?.roadCondition_id || "";
    wasThisIncidentInAnIntersection.value = duringTheIncidentList.value[0]?.wasThisIncidentInAnIntersection || false;
    witness.value = duringTheIncidentList.value[0]?.witness || "";
    witnessPhone.value = duringTheIncidentList.value[0]?.witnessPhone || "";  

    selectedDuringTheIncidentId.value = duringTheIncidentList.value[0]?.id || duringTheIncidentList.value[0]?._id || null; // Capture ID for editing  

    isEditingDuringTheIncident.value = true; // Set edit mode if we have data
       
    }

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


                <div class="mb-3 col-md-3">
                  <label class="form-label">Dept</label>
                  <v-select :options="storeDept.depts" v-model="selectedDept" placeholder="Choose your Dept"
                    :reduce="(dept) => dept.id" label="deptName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedDept }" />
                  <small v-if="errorsGeneralInformation.dept_er" class="text-danger">{{
                    errorsGeneralInformation.dept_er
                  }}</small>
                </div>





                <div class="mb-3 col-md-3">
                  <label class="form-label">Type of Incident</label>
                  <v-select :options="storeTypeIncident.typeIncidents" v-model="selectedTypeOfIncident"
                    placeholder="Choose Incident Type" :reduce="(incidentType) => incidentType.id"
                    label="typeOfIncidentName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedTypeOfIncident }" />
                  <small v-if="errorsGeneralInformation.typeOfIncident_er" class="text-danger">{{
                    errorsGeneralInformation.typeOfIncident_er
                  }}</small>
                </div>


         





              </div>

              <div class="row">

                <div class="mb-3 col-md-2">
                  <label class="form-label">Supervisor</label>
                  <v-select :options="storeSupervisor.supervisors" v-model="selectedSupervisor"
                    placeholder="Choose your Supervisor" :reduce="(supervisor) => supervisor.id" label="supervisorName"
                    class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedSupervisor }" />
                  <small v-if="errorsGeneralInformation.supervisor_er" class="text-danger">{{
                    errorsGeneralInformation.supervisor_er
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
                  <div style="position: relative;">
                    <input
                      type="text"
                      v-model="location"
                      @input="searchLocation"
                      @blur="hideLocationDropdown"
                      class="form-control form-control-md border border-primary"
                      :class="{ 'border-danger': formSubmittedGeneralInformation && !location }"
                      style="color: black;"
                      placeholder="Start typing an address..."
                      autocomplete="off"
                    />
                    <!-- Loading indicator -->
                    <div v-if="locationLoading" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">
                      <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
                    </div>
                    <!-- Dropdown de sugerencias -->
                    <ul
                      v-if="showLocationDropdown && locationSuggestions.length"
                      style="
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        z-index: 1050;
                        background: white;
                        border: 1px solid #ced4da;
                        border-top: none;
                        border-radius: 0 0 0.375rem 0.375rem;
                        max-height: 220px;
                        overflow-y: auto;
                        list-style: none;
                        margin: 0;
                        padding: 0;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                      "
                    >
                      <li
                        v-for="item in locationSuggestions"
                        :key="item.place_id"
                        @mousedown.prevent="selectLocation(item)"
                        style="
                          padding: 8px 12px;
                          cursor: pointer;
                          font-size: 0.875rem;
                          color: #212529;
                          border-bottom: 1px solid #f0f0f0;
                        "
                        @mouseover="$event.target.style.backgroundColor='#e9f0ff'"
                        @mouseleave="$event.target.style.backgroundColor='white'"
                      >
                        📍 {{ item.display_name }}
                      </li>
                    </ul>
                  </div>
                  <small v-if="errorsGeneralInformation.location_er" class="text-danger">{{
                    errorsGeneralInformation.location_er
                  }}</small>
                </div>



              </div>




              <div class="row">
                <div class="mb-3 col-md-2">
                  <label class="form-label">Time Worked (Years)</label>
                  <input type="number" step="any" v-model="timeWorkedYears"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !timeWorkedYears }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.timeWorkedYears_er" class="text-danger">{{
                    errorsGeneralInformation.timeWorkedYears_er }}</small>
                </div>

                <div class="mb-3 col-md-2">
                  <label class="form-label">Time Worked (Months)</label>
                  <input type="number" step="any" v-model="timeWorkedMonths"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !timeWorkedMonths }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.timeWorkedMonths_er" class="text-danger">{{
                    errorsGeneralInformation.timeWorkedMonths_er }}</small>
                </div>





             <div class="mb-3 col-md-3 d-flex align-items-end">

               <!-- <button type="submit" class="btn btn-primary btn-md">
                {{ isEditingGeneralInformation ? "Update" : "Save"
                }}
              </button>  -->


                            <button type="submit" :disabled="isLoadingGeneralInformation" class="btn btn-primary btn-md">
                              <span v-if="isLoadingGeneralInformation" class="spinner-border spinner-border-sm me-1" role="status"></span>
                              {{ isLoadingGeneralInformation ? 'Saving...' : (isEditingGeneralInformation ? "Update" : "Save") }}
                              <span v-if="!isLoadingGeneralInformation" class="btn-icon-end">
                                <i :class="isEditingGeneralInformation ? 'fa fa-edit' : 'fa fa-save'"></i>
                              </span>
                            </button>
                        
    
                </div>


              </div>

              <!-- <div class="row">
                <div class="mb-3 col-md-12">
                  <label class="form-label">Notes</label>
                  <textarea style="color: black;" v-model="notes" class="form-control border border-primary"></textarea>
                </div>
              </div> -->

              <!-- <button type="submit" class="btn btn-primary">
                {{ isEditingGeneralInformation ? "Update General Information" : "Start ACE Driver Incident Report"
                }}
              </button> -->

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





               <div class="row">

                <div class="accordion accordion-primary-solid" id="accordion-two">

                  <Spinner v-if="isLoadingDuringTheIncident" />


                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseOne">
                        During The Incident
                      </button>
                    </h2>

                    <Spinner v-if="storeSafetyPerson.loading || storeWhoDidYouSendThePicturesTo.loading" />


                    <div id="bordered_collapseOne" class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two">
                      <div class="accordion-body">

                        <div class="row">

                          <div class="mb-3 col-md-4">
                            <label class="form-label">Were you using an electronic device when the incident occurred ?</label>

                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="checkNativeSwitch"
                                v-model="usingElectronicDevice"
                              />
                              <label class="form-check-label fw-semibold" for="checkNativeSwitch"
                                :style="{ color: usingElectronicDevice ? '#198754' : '#dc3545' }">
                                {{ usingElectronicDevice ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="
                              errorsDuringTheIncident.usingElectronicDevice_er
                            " class="text-danger">{{
                              errorsDuringTheIncident.usingElectronicDevice_er
                              }}</small>
                          </div>

                <div class="mb-3 col-md-8">
                  <label class="form-label">Task being performed when incident occurred </label>
                  <input type="text" v-model="taskPerfomed" class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedDuringTheIncident && !taskPerfomed }"
                    style="color: black;" />
                  <small v-if="errorsDuringTheIncident.taskPerfomed_er" class="text-danger">{{
                    errorsDuringTheIncident.taskPerfomed_er
                  }}</small>
                </div>


                <div class="row">
                

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Was Safety Dept Notified ?</label>

                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="switchSafetyDeptNotified"
                                v-model="wasSafetyDeptNotified"
                              />
                              <label class="form-check-label fw-semibold" for="switchSafetyDeptNotified"
                                :style="{ color: wasSafetyDeptNotified ? '#198754' : '#dc3545' }">
                                {{ wasSafetyDeptNotified ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="
                              errorsDuringTheIncident.wasSafetyDeptNotified_er
                            " class="text-danger">{{
                              errorsDuringTheIncident.wasSafetyDeptNotified_er
                              }}</small>
                          </div>


                <div class="mb-3 col-md-2">
                  <label class="form-label">Safety Person Notified</label>
                  <v-select
                    :options="storeSafetyPerson.safetyPersonsNotified"
                    v-model="SelectedSafetyPersonNotified"
                    placeholder="Choose Safety Person"
                    :reduce="(safetyPerson) => safetyPerson.id"
                    label="safetyPersonNotifiedName"
                    class="form-control p-0"
                    :disabled="!wasSafetyDeptNotified"
                    :class="{
                      'is-invalid': formSubmittedDuringTheIncident && wasSafetyDeptNotified && !SelectedSafetyPersonNotified
                    }" />
                  <small v-if="errorsDuringTheIncident.SelectedSafetyPersonNotified_er" class="text-danger">{{
                    errorsDuringTheIncident.SelectedSafetyPersonNotified_er
                  }}</small>
                </div>



                            <div class="mb-3 col-md-2">
                            <label class="form-label">Did you take pictures of the damages ?</label>

                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="switchDidYouTakePictures"
                                v-model="didYouTakePictures"
                              />
                              <label class="form-check-label fw-semibold" for="switchDidYouTakePictures"
                                :style="{ color: didYouTakePictures ? '#198754' : '#dc3545' }">
                                {{ didYouTakePictures ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="
                              errorsDuringTheIncident.didYouTakePictures_er
                            " class="text-danger">{{
                              errorsDuringTheIncident.didYouTakePictures_er
                              }}</small>
                          </div>


                <div class="mb-3 col-md-2">
                  <label class="form-label">Who did you send the pictures to ?</label>
                  <v-select
                    :options="storeWhoDidYouSendThePicturesTo.whoDidYouSendThePicturesTo"
                    v-model="SelectedWhoDidYouSendThePicturesTo"
                    placeholder="Choose a person"
                    :reduce="(person) => person.id"
                    label="whoDidYouSendThePictureToName"
                    class="form-control p-0"
                    :disabled="!didYouTakePictures"
                    :class="{
                      'is-invalid': formSubmittedDuringTheIncident && didYouTakePictures && !SelectedWhoDidYouSendThePicturesTo
                    }" />
                  <small v-if="errorsDuringTheIncident.SelectedWhoDidYouSendThePicturesTo_er" class="text-danger">{{
                    errorsDuringTheIncident.SelectedWhoDidYouSendThePicturesTo_er
                  }}</small>
                </div>


                <div class="mb-3 col-md-2">
                  <label class="form-label">How fast were you traveling ? (MPH)</label>
                  <input type="number" step="any" v-model="howFastWereYouGoing"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedDuringTheIncident && !howFastWereYouGoing }"
                    style="color: black;" />
                  <small v-if="errorsDuringTheIncident.howFastWereYouGoing_er" class="text-danger">{{
                    errorsDuringTheIncident.howFastWereYouGoing_er }}</small>
                </div>


                <div class="mb-3 col-md-2">
                  <label class="form-label">Direction you were traveling</label>
                  <v-select :options="storeDirection.directions" v-model="SelectedDirectionYouWereTraveling"
                    placeholder="Choose a direction" :reduce="(direction) => direction.id" label="directionName"
                    class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedDirectionYouWereTraveling }" />
                  <small v-if="errorsDuringTheIncident.SelectedDirectionYouWereTraveling_er" class="text-danger">{{
                    errorsDuringTheIncident.SelectedDirectionYouWereTraveling_er
                  }}</small>
                </div>


                        <div class="mb-3 col-md-2">
                            <label class="form-label">Was this incident in an intersection ?</label>

                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="switchWasThisIncidentInAnIntersection"
                                v-model="wasThisIncidentInAnIntersection"
                              />
                              <label class="form-check-label fw-semibold" for="switchWasThisIncidentInAnIntersection"
                                :style="{ color: wasThisIncidentInAnIntersection ? '#198754' : '#dc3545' }">
                                {{ wasThisIncidentInAnIntersection ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="
                              errorsDuringTheIncident.wasThisIncidentInAnIntersection_er
                            " class="text-danger">{{
                              errorsDuringTheIncident.wasThisIncidentInAnIntersection_er
                              }}</small>
                          </div>


                <div class="mb-3 col-md-2">
                  <label class="form-label">Weather</label>
                  <v-select :options="storeWeatherCondition.weatherConditions" v-model="SelectedWeatherCondition" placeholder="Choose weather condition"
                    :reduce="(weather) => weather.id" label="weatherName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedWeatherCondition }" />
                  <small v-if="errorsDuringTheIncident.SelectedWeatherCondition_er" class="text-danger">{{
                    errorsDuringTheIncident.SelectedWeatherCondition_er
                  }}</small>
                </div>

                <div class="mb-3 col-md-2">
                  <label class="form-label">Road Conditions</label>
                  <v-select :options="storeRoadCondition.roadConditions" v-model="SelectedRoadCondition" placeholder="Choose road condition"
                    :reduce="(roadCondition) => roadCondition.id" label="roadConditionName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedRoadCondition }" />
                  <small v-if="errorsDuringTheIncident.SelectedRoadCondition_er" class="text-danger">{{
                    errorsDuringTheIncident.SelectedRoadCondition_er
                  }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Witness</label>
                  <input type="text" v-model="witness" class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedDuringTheIncident && !witness }"
                    style="color: black;" />
                  <small v-if="errorsDuringTheIncident.witness_er" class="text-danger">{{
                    errorsDuringTheIncident.witness_er
                  }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Witness Phone #</label>
                  <input
                    type="text"
                    :value="witnessPhone"
                    @input="formatPhone"
                    placeholder="(XXX) XXX-XXXX"
                    maxlength="14"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedDuringTheIncident && !witnessPhone }"
                    style="color: black;" />
                  <small v-if="errorsDuringTheIncident.witnessPhone_er" class="text-danger">{{
                    errorsDuringTheIncident.witnessPhone_er
                  }}</small>
                </div>


                </div>


                        </div>


                                   <button type="button" @click="HandleDuringTheIncident" :disabled="isLoadingDuringTheIncident" class="btn btn-primary btn-md">
                              {{ isEditingDuringTheIncident ? "Update" : "Save" }}
                              <span class="btn-icon-end">
                                <i :class="isEditingDuringTheIncident ? 'fa fa-edit' : 'fa fa-save'"></i>
                              </span>
                            </button>


           
                      </div>
                    </div>
                  </div>

                  <Spinner v-if="isLoadingIncidentDetail" />
                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseTwo">
                        Incident Detail
                      </button>
                    </h2>
                    <div id="bordered_collapseTwo" class="accordion-collapse collapse" data-bs-parent="#accordion-two">
                      <div class="accordion-body">

<!-- 
                        <div class="row">


                      <div class="mb-3 col-md-12">
                            <label class="form-label">Incident Description: How did the incident occur? What happened? </label>
                            <input type="text" v-model="incidentDescription"
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsIncidentDetail.incidentDescription_er" class="text-danger">{{ errorsIncidentDetail.incidentDescription_er
                              }}</small>
                          </div>

                        </div> -->


                <div class="row">

                <div class="mb-3 col-md-12">
                  <label class="form-label">Incident Description: How did the incident occur? What happened ?</label>
                  <textarea v-model="incidentDescription" class="form-control border border-primary" style="color: black;" rows="3"></textarea>
                  <small v-if="errorsIncidentDetail.incidentDescription_er" class="text-danger">{{ errorsIncidentDetail.incidentDescription_er}}</small>
                </div>
                
              </div>


                <div class="row">

                <div class="mb-3 col-md-12">
                  <label class="form-label">What Action, Event or Condition contributed most to this incident ?</label>
                  <textarea v-model="actionEventConditions" class="form-control border border-primary" style="color: black;" rows="3"></textarea>
                  <small v-if="errorsIncidentDetail.actionEventConditions_er" class="text-danger">{{ errorsIncidentDetail.actionEventConditions_er}}</small>
                </div>
                
              </div>


                          <div class="row">

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Was any vehicles towed ?</label>

                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="checkNativeSwitch"
                                v-model="anyVehicleTowed"
                              />
                              <label class="form-check-label fw-semibold" for="checkNativeSwitch"
                                :style="{ color: anyVehicleTowed ? '#198754' : '#dc3545' }">
                                {{ anyVehicleTowed ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="
                              errorsIncidentDetail.anyVehicleTowed_er
                            " class="text-danger">{{
                              errorsIncidentDetail.anyVehicleTowed_er
                              }}</small>
                          </div>


                                          <div class="mb-3 col-md-9">
                  <label class="form-label">If YES please describe ?</label>
                  <textarea v-model="describeAnyInjuries" class="form-control border border-primary" style="color: black;" rows="3"></textarea>
                  <small v-if="errorsIncidentDetail.describeAnyInjuries_er" class="text-danger">{{ errorsIncidentDetail.describeAnyInjuries_er}}</small>
                </div>

                          
                        </div>





              <div class="row">
                <div class="mb-3 col-md-12">
                  <label class="form-label">Damage to Ace truck</label>
                  <textarea v-model="damageToAceTruck" class="form-control border border-primary" style="color: black;" rows="3"></textarea>
                  <small v-if="errorsIncidentDetail.damageToAceTruck_er" class="text-danger">{{ errorsIncidentDetail.damageToAceTruck_er}}</small>
                </div>
                
              </div>

            <div class="row">
                <div class="mb-3 col-md-12">
                  <label class="form-label">What damage was done</label>
                  <textarea v-model="whatDamageWasDone" class="form-control border border-primary" style="color: black;" rows="3"></textarea>
                  <small v-if="errorsIncidentDetail.whatDamageWasDone_er" class="text-danger">{{ errorsIncidentDetail.whatDamageWasDone_er}}</small>
                </div>
                
              </div>


                    <div class="row">

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Have you had any incidents in the past year ?</label>

                            <div class="form-check form-switch">
                              <input
                                class="form-check-input"
                                type="checkbox"
                                id="checkNativeSwitch"
                                v-model="incidentInThePastYear"
                              />
                              <label class="form-check-label fw-semibold" for="checkNativeSwitch"
                                :style="{ color: incidentInThePastYear ? '#198754' : '#dc3545' }">
                                {{ incidentInThePastYear ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="
                              errorsIncidentDetail.incidentInThePastYear_er
                            " class="text-danger">{{
                              errorsIncidentDetail.incidentInThePastYear_er
                              }}</small>
                          </div>



                                        <div class="mb-3 col-md-9">
                  <label class="form-label">If yes, please list dates of incidents</label>
                  <textarea v-model="incidentDetailList" class="form-control border border-primary" style="color: black;" rows="3"></textarea>
                  <small v-if="errorsIncidentDetail.incidentDetailList_er" class="text-danger">{{ errorsIncidentDetail.incidentDetailList_er}}</small>
                </div>

                          
                        </div>


     



                   


                    <button type="button" @click="HandleIncidentDetail" :disabled="isLoadingIncidentDetail" class="btn btn-primary btn-md">
                              {{ isEditingIncidentDetail ? "Update" : "Save" }}
                              <span class="btn-icon-end">
                                <i :class="isEditingIncidentDetail ? 'fa fa-edit' : 'fa fa-save'"></i>
                              </span>
                            </button>
          

                      </div>
                    </div>
                  </div>

                  <Spinner v-if="isLoadingSupervisorNote" />

                  <div class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseThree">
                        Employee Signature
                      </button>
                    </h2>
                    <div id="bordered_collapseThree" class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two">
                      <div class="accordion-body">

                


                        <div class="row">

                          <!-- <div class="mb-3 col-md-12">
                            <label class="form-label">Note</label>
                            <input type="text" v-model="note"
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsLoad.noteLoad_er" class="text-danger">{{ errorsLoad.noteLoad_er
                              }}</small>
                          </div> -->


                        </div>

                  
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <figure class="figure">
  <img src="@assets/images/placeholder.jpg" class="figure-img img-fluid rounded" alt="...">
  <figcaption class="figure-caption">A caption for the above image.</figcaption>
</figure>

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