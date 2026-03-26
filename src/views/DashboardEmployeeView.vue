<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from "vue";

import { useRouter } from 'vue-router'
const router = useRouter()

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
import EmployeeSignatureAPI from "@/api/Sections/EmployeeSignatureAPI"; // ✅ NUEVO

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


// ── VUE3-SIGNATURE ──────────────────────────────────────────────────────────
const signature = ref(null);
const options = reactive({
  penColor: "rgb(0, 0, 0)",
  backgroundColor: "rgb(255, 255, 255)",
});

// ✅ Estado propio de la sección de firma
const signatureError = ref("");
const isSubmittingReport = ref(false);

const clear = () => {
  signature.value.clear();
  signatureError.value = "";
};

const undo = () => {
  signature.value.undo();
};
// ────────────────────────────────────────────────────────────────────────────


// General Information
const selectedTruck = ref("");
const selectedDept = ref("");
const selectedSupervisor = ref("");
const selectedTypeOfIncident = ref("");

const date = ref("");
const trainee = ref("");
const location = ref("");
const locationSuggestions = ref([]);
const locationLoading = ref(false);
const showLocationDropdown = ref(false);
let locationDebounceTimer = null;
const time = ref("");
const timeWorkedYears = ref("");
const timeWorkedMonths = ref("");
const timeDayStarted = ref("");

const isVisibleAcordion = ref(false);

const errorsGeneralInformation = ref({
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

const isEditingGeneralInformation = ref(false);
const isLoadingGeneralInformation = ref(false);
const formSubmittedGeneralInformation = ref(false);


// During the incident
const duringTheIncidentList = ref([]);
const selectedDuringTheIncidentId = ref(null);

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
const witness = ref("");
const witnessPhone = ref("");

const formatPhone = (e) => {
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
const isLoadingDuringTheIncident = ref(false);
const formSubmittedDuringTheIncident = ref(false);

watch(wasSafetyDeptNotified, (newValue) => {
  if (!newValue) SelectedSafetyPersonNotified.value = "";
});

watch(didYouTakePictures, (newValue) => {
  if (!newValue) SelectedWhoDidYouSendThePicturesTo.value = "";
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
const selectedIncidentDetailId = ref(null);
const selectedFiles = ref([]);
const selectedImages = ref([]);
const existingIncidentDetailImages = ref([]);
const fileInput = ref(null);

const incidentDetailList = ref([]);

const incidentDescription = ref("");
const actionEventConditions = ref("");
const wereAnyVehiclesTowed = ref(false);
const wasAnyOneHurt = ref(false);
const describeAnyInjuries = ref("");

const damageToAceTruck = ref("");
const whatDamageWasDone = ref("");
const incidentInThePastYear = ref(false);
const listDatesOfIncidents = ref("");

const isEditingIncidentDetail = ref(false);
const isLoadingIncidentDetail = ref(false);
const formSubmittedIncidentDetail = ref(false);

watch(wasAnyOneHurt, (newValue) => {
  if (!newValue) describeAnyInjuries.value = "";
});

watch(incidentInThePastYear, (newValue) => {
  if (!newValue) listDatesOfIncidents.value = "";
});

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
  imagesIncidentDetail_er: "",
});

// Supervisor Note
const supervisorNoteList = ref([]);
const selectedSupervisorNoteId = ref(null);
const supervisorNote = ref("");

const isEditingSupervisorNote = ref(false);
const isLoadingSupervisorNote = ref(false);
const formSubmittedSupervisorNote = ref(false);

const errorsSupervisorNote = ref({
  supervisorNote_er: "",
});


onMounted(() => {
  initUser();
  user.value = authUser.value;

  if (user.value) {
    if (user.value.rol === "Admin") {
      router.push({ name: 'dashboard-admin' });
      return;
    }
  }

  let user_id = user.value?.id || null;
  console.log('User ID en dashboard:', user_id);

  let ace_incident_report_employee_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.employee_id || null;

  if (user_id !== ace_incident_report_employee_id) {
    localStorage.removeItem("ACE-INCIDENT-REPORT");
  } else {
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
      isEditingGeneralInformation.value = true;
      const generalInformation = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"));

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
      loadIncidentDetail();
    }
  }
});

// ── General Information submit ──────────────────────────────────────────────
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmittedGeneralInformation.value = true;

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

  if (!selectedTruck.value) { errorsGeneralInformation.value.truck_er = "Required field"; hasError = true; }
  if (!time.value) { errorsGeneralInformation.value.time_er = "Required field"; hasError = true; }
  if (!selectedDept.value) { errorsGeneralInformation.value.dept_er = "Required field"; hasError = true; }
  if (!selectedSupervisor.value) { errorsGeneralInformation.value.supervisor_er = "Required field"; hasError = true; }
  if (!selectedTypeOfIncident.value) { errorsGeneralInformation.value.typeOfIncident_er = "Required field"; hasError = true; }
  if (!trainee.value) { errorsGeneralInformation.value.trainee_er = "Required field"; hasError = true; }
  if (!location.value) { errorsGeneralInformation.value.location_er = "Required field"; hasError = true; }
  if (!timeWorkedYears.value) { errorsGeneralInformation.value.timeWorkedYears_er = "Required field"; hasError = true; }
  if (!timeWorkedMonths.value) { errorsGeneralInformation.value.timeWorkedMonths_er = "Required field"; hasError = true; }
  if (!timeDayStarted.value) { errorsGeneralInformation.value.timeDayStarted_er = "Required field"; hasError = true; }

  if (hasError) return;

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
    isLoadingGeneralInformation.value = true;
    if (!isEditingGeneralInformation.value) {
      const response = await GeneralInformationAPI.add(generalInformationData);

      if (response.data.ok) {
        localStorage.setItem("ACE-INCIDENT-REPORT", JSON.stringify(response.data.data));
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
        });
      } else {
        showSweetAlert({
          title: "Error saving General Information!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    } else {
      let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;
      const response = await GeneralInformationAPI.edit(generalInformation_id, generalInformationData);

      if (response.data.ok) {
        localStorage.setItem("ACE-INCIDENT-REPORT", JSON.stringify(response.data.data));

        showSweetAlert({
          title: "General information edited successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      } else {
        showSweetAlert({
          title: "Error editing General Information!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
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
    });
  } finally {
    isLoadingGeneralInformation.value = false;
  }
};

// ── Nominatim Address Autocomplete ──────────────────────────────────────────
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
  errorsGeneralInformation.value.location_er = "";
};

const hideLocationDropdown = () => {
  setTimeout(() => {
    showLocationDropdown.value = false;
  }, 200);
};

// ── Reset forms ─────────────────────────────────────────────────────────────
const resetGeneralInformation = () => {
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

const resetIncidentDetail = () => {
  selectedIncidentDetailId.value = null;
  incidentDescription.value = "";
  actionEventConditions.value = "";
  wereAnyVehiclesTowed.value = false;
  wasAnyOneHurt.value = false;
  describeAnyInjuries.value = "";
  damageToAceTruck.value = "";
  whatDamageWasDone.value = "";
  incidentInThePastYear.value = false;
  listDatesOfIncidents.value = "";
  selectedImages.value = [];
  selectedFiles.value = [];
  existingIncidentDetailImages.value = [];
  if (fileInput.value) fileInput.value.value = "";
  isEditingIncidentDetail.value = false;
  formSubmittedIncidentDetail.value = false;
};

const resetSupervisorNote = () => {
  supervisorNote.value = "";
  selectedSupervisorNoteId.value = null;
  isEditingSupervisorNote.value = false;
  formSubmittedSupervisorNote.value = false;
};

// ── During The Incident submit ───────────────────────────────────────────────
const HandleDuringTheIncident = async (event) => {
  event.preventDefault();
  formSubmittedDuringTheIncident.value = true;

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

  if (!taskPerfomed.value) { errorsDuringTheIncident.value.taskPerfomed_er = "Required field"; hasError = true; }
  if (wasSafetyDeptNotified.value && !SelectedSafetyPersonNotified.value) { errorsDuringTheIncident.value.SelectedSafetyPersonNotified_er = "Required field"; hasError = true; }
  if (didYouTakePictures.value && !SelectedWhoDidYouSendThePicturesTo.value) { errorsDuringTheIncident.value.SelectedWhoDidYouSendThePicturesTo_er = "Required field"; hasError = true; }
  if (!howFastWereYouGoing.value) { errorsDuringTheIncident.value.howFastWereYouGoing_er = "Required field"; hasError = true; }
  if (!SelectedDirectionYouWereTraveling.value) { errorsDuringTheIncident.value.SelectedDirectionYouWereTraveling_er = "Required field"; hasError = true; }
  if (!SelectedWeatherCondition.value) { errorsDuringTheIncident.value.SelectedWeatherCondition_er = "Required field"; hasError = true; }
  if (!SelectedRoadCondition.value) { errorsDuringTheIncident.value.SelectedRoadCondition_er = "Required field"; hasError = true; }
  if (witnessPhone.value && !/^\(\d{3}\) \d{3}-\d{4}$/.test(witnessPhone.value)) { errorsDuringTheIncident.value.witnessPhone_er = "Invalid phone format. Use (XXX) XXX-XXXX"; hasError = true; }

  if (hasError) return;

  let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

  const response = await GeneralInformationAPI.getDuringTheIncident(generalInformation_id);
  duringTheIncidentList.value = response.data.data || [];

  if (duringTheIncidentList.value.length) {
    selectedDuringTheIncidentId.value = duringTheIncidentList.value[0]?.id || duringTheIncidentList.value[0]?._id || null;
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
      isLoadingDuringTheIncident.value = true;
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
          isLoadingDuringTheIncident.value = false;
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
          isLoadingDuringTheIncident.value = false;
        });
      }
    } else {
      isLoadingDuringTheIncident.value = true;
      const response = await DuringTheIncidentAPI.add(duringTheIncident);

      if (response.data.ok) {
        selectedDuringTheIncidentId.value = response.data.data.id;
        isEditingDuringTheIncident.value = true;

        // ✅ Sincronizar la lista para que el checklist del submit se actualice
        duringTheIncidentList.value = [response.data.data];

        showSweetAlert({
          title: "During The Incident Info saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDuringTheIncident.value = false;
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
          isLoadingDuringTheIncident.value = false;
        });
      }
    }
  } catch (error) {
    showSweetAlert({
      title: isEditingDuringTheIncident.value ? "Error updating During The Incident Info!" : "Error saving During The Incident Info!",
      text: error.response?.data?.msg || "An error occurred",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      isLoadingDuringTheIncident.value = false;
    });
    console.error("Error al enviar During The Incident:", error);
  }
};

// ── Incident Detail submit ───────────────────────────────────────────────────
const HandleIncidentDetail = async (event) => {
  event.preventDefault();
  formSubmittedIncidentDetail.value = true;

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

  if (!incidentDescription.value) { errorsIncidentDetail.value.incidentDescription_er = "Required field"; hasError = true; }
  if (!actionEventConditions.value) { errorsIncidentDetail.value.actionEventConditions_er = "Required field"; hasError = true; }
  if (wasAnyOneHurt.value && !describeAnyInjuries.value) { errorsIncidentDetail.value.describeAnyInjuries_er = "Required field"; hasError = true; }
  if (incidentInThePastYear.value && !listDatesOfIncidents.value) { errorsIncidentDetail.value.listDatesOfIncidents_er = "Required field"; hasError = true; }

  if (hasError) return;

  let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

  const formData = new FormData();

  if (incidentDescription.value) formData.append("incidentDescription", incidentDescription.value);
  if (actionEventConditions.value) formData.append("actionEventCondition", actionEventConditions.value);
  if (wereAnyVehiclesTowed.value) formData.append("wereAnyVehiclesTowed", wereAnyVehiclesTowed.value);
  if (wasAnyOneHurt.value) formData.append("wasAnyOneHurt", wasAnyOneHurt.value);
  if (describeAnyInjuries.value) formData.append("describeAnyInjuries", describeAnyInjuries.value);
  if (damageToAceTruck.value) formData.append("damageToAceTruck", damageToAceTruck.value);
  if (whatDamageWasDone.value) formData.append("whatDamageWasDone", whatDamageWasDone.value);
  if (incidentInThePastYear.value) formData.append("incidentInThePastYear", incidentInThePastYear.value);
  if (listDatesOfIncidents.value) formData.append("listDatesOfIncidents", listDatesOfIncidents.value);

  formData.append("generalInformation_ref_id", generalInformation_id);

  selectedFiles.value.forEach((file) => {
    formData.append("images", file, file.name);
  });

  try {
    if (isEditingIncidentDetail.value) {
      isLoadingIncidentDetail.value = true;
      const response = await IncidentDetailAPI.edit(selectedIncidentDetailId.value, formData);

      if (response.data.ok) {
        selectedFiles.value = [];
        selectedImages.value = [];
        if (fileInput.value) fileInput.value.value = "";
        existingIncidentDetailImages.value = response.data.data.images || [];

        showSweetAlert({
          title: "Incident Detail updated successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => { isLoadingIncidentDetail.value = false; });
      } else {
        showSweetAlert({
          title: "Error updating Incident Detail!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => { isLoadingIncidentDetail.value = false; });
      }
    } else {
      isLoadingIncidentDetail.value = true;
      const response = await IncidentDetailAPI.add(formData);

      if (response.data.ok) {
        selectedIncidentDetailId.value = response.data.data.id;
        isEditingIncidentDetail.value = true;

        selectedFiles.value = [];
        selectedImages.value = [];
        if (fileInput.value) fileInput.value.value = "";
        existingIncidentDetailImages.value = response.data.data.images || [];

        // ✅ Sincronizar la lista para que el checklist del submit se actualice
        incidentDetailList.value = [response.data.data];

        showSweetAlert({
          title: "Incident Detail saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => { isLoadingIncidentDetail.value = false; });
      } else {
        showSweetAlert({
          title: "Error saving Incident Detail!",
          text: response.data.msg,
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => { isLoadingIncidentDetail.value = false; });
      }
    }
  } catch (error) {
    showSweetAlert({
      title: isEditingIncidentDetail.value ? "Error updating Incident Detail!" : "Error saving Incident Detail!",
      text: error.response?.data?.msg || "An error occurred",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => { isLoadingIncidentDetail.value = false; });
    console.error("Error al enviar Incident Detail:", error);
  }
};

// ── ✅ Submit Incident Report (con firma) ────────────────────────────────────
const SubmitIncidentReport = async () => {

  // 1. Validar secciones previas completadas
  const incompleteSections = [];

  if (!isEditingGeneralInformation.value) {
    incompleteSections.push("• General Information");
  }
  if (!duringTheIncidentList.value.length) {
    incompleteSections.push("• During The Incident");
  }
  if (!incidentDetailList.value.length) {
    incompleteSections.push("• Incident Detail");
  }

  if (incompleteSections.length > 0) {
    showSweetAlert({
      title: "Incomplete Report",
      html: `Please complete and save the following sections before submitting:<br><br>
             <div style="text-align:left; line-height: 2;">${incompleteSections.join("<br>")}</div>`,
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Got it",
      allowOutsideClick: false,
    });
    return;
  }

  // 2. Validar que el empleado haya firmado
  if (!signature.value || signature.value.isEmpty()) {
    signatureError.value = "Your signature is required before submitting the report.";
    return;
  }
  signatureError.value = "";

  // 3. Confirmar el envío — usando .then() como el resto del código
  showSweetAlert({
    title: "Submit Incident Report?",
    text: "Once submitted, you will not be able to edit this report.",
    icon: "warning",
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: "Yes, submit it!",
    denyButtonText: "No, keep editing",
    allowOutsideClick: false,
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    // 4. Obtener el ID del reporte
    const generalInformation_id =
      JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

    if (!generalInformation_id) {
      showSweetAlert({
        title: "Error",
        text: "Could not find the incident report ID. Please refresh and try again.",
        icon: "error",
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      });
      return;
    }

    // 5. Capturar la firma como base64 PNG
    const signatureBase64 = signature.value.save("image/png");

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Denver",
    });

    const employeeSignatureData = {
      employeeSignature: signatureBase64,
      date: today,
      generalInformation_ref_id: generalInformation_id,
      createdBy: user.value?.id || null,
    };

    try {
      isSubmittingReport.value = true;

      const response = await EmployeeSignatureAPI.add(employeeSignatureData);

      if (response.data.ok) {
        // ✅ Limpiar localStorage
        localStorage.removeItem("ACE-INCIDENT-REPORT");
        localStorage.removeItem("USER-SAFETY-ACE");

        showSweetAlert({
          title: "Report Submitted Successfully!",
          text: "Your incident report has been submitted. Thank you.",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          // ✅ Push directo a login — no depender del guard
          router.push({ name: "login" });
        });

      } else {
        showSweetAlert({
          title: "Error submitting report",
          text: response.data.msg || "An error occurred while saving your signature.",
          icon: "error",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      console.error("Error submitting incident report:", error);
      showSweetAlert({
        title: "Unexpected Error",
        text: error.response?.data?.msg || "An unexpected error occurred. Please try again.",
        icon: "error",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      });
    } finally {
      isSubmittingReport.value = false;
    }
  });
};
// ── Supervisor Note submit ───────────────────────────────────────────────────
const HandleSupervisorNote = async (event) => {
  event.preventDefault();
  formSubmittedSupervisorNote.value = true;

  errorsSupervisorNote.value.supervisorNote_er = "";

  let hasError = false;

  if (!supervisorNote.value) {
    errorsSupervisorNote.value.supervisorNote_er = "Required field";
    hasError = true;
  }

  if (hasError) return;

  let generalInformation_id = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"))?.id || null;

  const supervisorNoteData = {
    supervisorNote: supervisorNote.value,
    generalInformation_ref_id: generalInformation_id,
  };

  try {
    if (isEditingSupervisorNote.value) {
      isLoadingSupervisorNote.value = true;
      const response = await SupervisorNoteAPI.edit(selectedSupervisorNoteId.value, supervisorNoteData);

      if (response.data.ok) {
        showSweetAlert({
          title: "Supervisor Note updated successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingSupervisorNote.value = false;
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
        }).then(() => { isLoadingSupervisorNote.value = false; });
      }
    } else {
      isLoadingSupervisorNote.value = true;
      const response = await SupervisorNoteAPI.add(supervisorNoteData);

      if (response.data.ok) {
        showSweetAlert({
          title: "Supervisor Note saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingSupervisorNote.value = false;
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
        }).then(() => { isLoadingSupervisorNote.value = false; });
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
    }).then(() => { isLoadingSupervisorNote.value = false; });
  }
};

// ── Edit handlers ────────────────────────────────────────────────────────────
const EditDuringTheIncident = (item) => {
  selectedDuringTheIncidentId.value = item.id || item._id;
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
  isEditingDuringTheIncident.value = true;
  selectedDuringTheIncidentId.value = item.id || item._id;
};

const EditIncidentDetail = async (item) => {
  isLoadingIncidentDetail.value = true;
  selectedIncidentDetailId.value = item.id || item._id;
  incidentDescription.value = item.incidentDescription || "";
  actionEventConditions.value = item.actionEventCondition || "";
  wereAnyVehiclesTowed.value = item.wereAnyVehiclesTowed === true || item.wereAnyVehiclesTowed === "true" || false;
  wasAnyOneHurt.value = item.wasAnyOneHurt === true || item.wasAnyOneHurt === "true" || false;
  describeAnyInjuries.value = item.describeAnyInjuries || "";
  damageToAceTruck.value = item.damageToAceTruck || "";
  whatDamageWasDone.value = item.whatDamageWasDone || "";
  incidentInThePastYear.value = item.incidentInThePastYear === true || item.incidentInThePastYear === "true" || false;
  listDatesOfIncidents.value = item.listDatesOfIncidents || "";
  existingIncidentDetailImages.value = item.images || [];
  isEditingIncidentDetail.value = true;
  await nextTick();
  isEditingIncidentDetail.value = true;
  selectedIncidentDetailId.value = item.id || item._id;
  isLoadingIncidentDetail.value = false;
};

const EditSupervisorNote = async (item) => {
  isLoadingSupervisorNote.value = true;
  selectedSupervisorNoteId.value = item.id || item._id;
  supervisorNote.value = item.supervisorNote || "";
  isEditingSupervisorNote.value = true;
};

// ── Delete handlers ──────────────────────────────────────────────────────────
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
          });
        } else {
          showSweetAlert({ title: "Error deleting During The Incident!", icon: "error", confirmButtonText: "Ok", allowOutsideClick: false });
        }
      } catch (error) {
        console.error("Error deleting During The Incident:", error);
        showSweetAlert({ title: "Error deleting During The Incident!", icon: "error", confirmButtonText: "Ok", allowOutsideClick: false });
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
          }).then(() => { loadIncidentDetail(); });
        } else {
          showSweetAlert({ title: "Error deleting Incident Detail!", icon: "error", confirmButtonText: "Ok", allowOutsideClick: false });
        }
      } catch (error) {
        console.error("Error deleting Incident Detail:", error);
        showSweetAlert({ title: "Error deleting Incident Detail!", icon: "error", confirmButtonText: "Ok", allowOutsideClick: false });
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
        const response = await SupervisorNoteAPI.delete(item.id || item._id);
        if (response.data.ok) {
          showSweetAlert({
            title: "Supervisor Note deleted successfully!",
            icon: "success",
            showDenyButton: false,
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: false,
          }).then(() => { loadSupervisorNote(); });
        } else {
          showSweetAlert({ title: "Error deleting Supervisor Note!", icon: "error", confirmButtonText: "Ok", allowOutsideClick: false });
        }
      } catch (error) {
        console.error("Error deleting Supervisor Note:", error);
        showSweetAlert({ title: "Error deleting Supervisor Note!", icon: "error", confirmButtonText: "Ok", allowOutsideClick: false });
      }
    }
  });
};

// ── Load functions ───────────────────────────────────────────────────────────
const loadDuringTheIncident = async () => {
  const rawGeneralInformation = localStorage.getItem("ACE-INCIDENT-REPORT");
  if (!rawGeneralInformation) return;

  const generalInformation = JSON.parse(rawGeneralInformation);
  const generalInformationId = generalInformation?.id || generalInformation?._id;
  if (!generalInformationId) return;

  try {
    const response = await GeneralInformationAPI.getDuringTheIncident(generalInformationId);
    duringTheIncidentList.value = response.data.data || [];

    if (!duringTheIncidentList.value.length) {
      resetDuringTheIncident();
      isEditingDuringTheIncident.value = false;
      return;
    }

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
    selectedDuringTheIncidentId.value = duringTheIncidentList.value[0]?.id || duringTheIncidentList.value[0]?._id || null;
    isEditingDuringTheIncident.value = true;
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

    if (!incidentDetailList.value.length) {
      resetIncidentDetail();
      isEditingIncidentDetail.value = false;
      return;
    }

    incidentDescription.value = incidentDetailList.value[0]?.incidentDescription || "";
    actionEventConditions.value = incidentDetailList.value[0]?.actionEventCondition || "";
    wereAnyVehiclesTowed.value = incidentDetailList.value[0]?.wereAnyVehiclesTowed || false;
    wasAnyOneHurt.value = incidentDetailList.value[0]?.wasAnyOneHurt || false;
    describeAnyInjuries.value = incidentDetailList.value[0]?.describeAnyInjuries || "";
    damageToAceTruck.value = incidentDetailList.value[0]?.damageToAceTruck || "";
    whatDamageWasDone.value = incidentDetailList.value[0]?.whatDamageWasDone || "";
    incidentInThePastYear.value = incidentDetailList.value[0]?.incidentInThePastYear || false;
    listDatesOfIncidents.value = incidentDetailList.value[0]?.listDatesOfIncidents || "";
    existingIncidentDetailImages.value = incidentDetailList.value[0]?.images || [];
    selectedIncidentDetailId.value = incidentDetailList.value[0]?.id || incidentDetailList.value[0]?._id || null;
    isEditingIncidentDetail.value = true;
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
  isVisibleAcordion.value = true;
};

// ── File handlers ────────────────────────────────────────────────────────────
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

  const files = Array.from(event.target.files);
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
        selectedFiles.value = [];
      });
      return;
    }
    newImages.push({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    });
  }

  if (newImages.length + selectedImages.value.length > 15) {
    showSweetAlert({
      title: "Upload not completed!",
      text: "At most you can add up to 15 images.",
      icon: "warning",
      allowOutsideClick: false,
    }).then(() => { fileInput.value.value = ""; });
    return;
  }

  selectedFiles.value = [...selectedFiles.value, ...files];
  selectedImages.value = [...selectedImages.value, ...newImages];
  fileInput.value.value = "";
};

const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
};

const getProxyImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  return `https://safetybackendstaging.kizunadata.cloud/api/media/image-proxy?url=${encodeURIComponent(imageUrl)}`;
};

const downloadImage = (imageUrl) => {
  const proxyUrl = getProxyImageUrl(imageUrl);
  window.open(proxyUrl, '_blank');
};

// ── Utility methods ──────────────────────────────────────────────────────────
const currentDate = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
);

const formatTime = (controlTimeValue) => {
  if (!controlTimeValue) return "";
  const hours = String(controlTimeValue.hours).padStart(2, "0");
  const minutes = String(controlTimeValue.minutes).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const setTimeFromDB = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  if (!isNaN(hours) && !isNaN(minutes)) {
    return { hours, minutes };
  }
};

const logout = () => {
  localStorage.removeItem("USER-SAFETY-ACE");
  localStorage.removeItem("ACE-INCIDENT-REPORT2");
  router.push({ name: 'login' });
};

const getDenverTimeAsUTCISOString = () => {
  const now = DateTime.now().setZone('America/Denver');
  return now.toFormat('yyyy-MM-dd');
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
                    <div v-if="locationLoading" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">
                      <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
                    </div>
                    <ul
                      v-if="showLocationDropdown && locationSuggestions.length"
                      style="
                        position: absolute; top: 100%; left: 0; right: 0; z-index: 1050;
                        background: white; border: 1px solid #ced4da; border-top: none;
                        border-radius: 0 0 0.375rem 0.375rem; max-height: 220px;
                        overflow-y: auto; list-style: none; margin: 0; padding: 0;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                      "
                    >
                      <li
                        v-for="item in locationSuggestions"
                        :key="item.place_id"
                        @mousedown.prevent="selectLocation(item)"
                        style="
                          padding: 8px 12px; cursor: pointer; font-size: 0.875rem;
                          color: #212529; border-bottom: 1px solid #f0f0f0;
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
                  <button type="submit" :disabled="isLoadingGeneralInformation" class="btn btn-primary btn-md">
                    <span v-if="isLoadingGeneralInformation" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    {{ isLoadingGeneralInformation ? 'Saving...' : (isEditingGeneralInformation ? "Update" : "Save") }}
                    <span v-if="!isLoadingGeneralInformation" class="btn-icon-end">
                      <i :class="isEditingGeneralInformation ? 'fa fa-edit' : 'fa fa-save'"></i>
                    </span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isVisibleAcordion" class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">
            <form autocomplete="off">

              <div class="row">
                <div class="accordion accordion-primary-solid" id="accordion-two">

                  <Spinner v-if="isLoadingDuringTheIncident" />

                  <!-- ══════════════════════════════════════════════════════════ -->
                  <!--  DURING THE INCIDENT                                      -->
                  <!-- ══════════════════════════════════════════════════════════ -->
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
                            <label class="form-label">Were you using an electronic device when the incident occurred?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="checkNativeSwitch"
                                v-model="usingElectronicDevice" />
                              <label class="form-check-label fw-semibold" for="checkNativeSwitch"
                                :style="{ color: usingElectronicDevice ? '#198754' : '#dc3545' }">
                                {{ usingElectronicDevice ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="errorsDuringTheIncident.usingElectronicDevice_er" class="text-danger">{{
                              errorsDuringTheIncident.usingElectronicDevice_er }}</small>
                          </div>

                          <div class="mb-3 col-md-8">
                            <label class="form-label">Task being performed when incident occurred</label>
                            <input type="text" v-model="taskPerfomed" class="form-control form-control-md border border-primary"
                              :class="{ 'border-danger': formSubmittedDuringTheIncident && !taskPerfomed }"
                              style="color: black;" />
                            <small v-if="errorsDuringTheIncident.taskPerfomed_er" class="text-danger">{{
                              errorsDuringTheIncident.taskPerfomed_er }}</small>
                          </div>

                          <div class="row">

                            <div class="mb-3 col-md-2">
                              <label class="form-label">Was Safety Dept Notified?</label>
                              <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="switchSafetyDeptNotified"
                                  v-model="wasSafetyDeptNotified" />
                                <label class="form-check-label fw-semibold" for="switchSafetyDeptNotified"
                                  :style="{ color: wasSafetyDeptNotified ? '#198754' : '#dc3545' }">
                                  {{ wasSafetyDeptNotified ? 'YES' : 'NO' }}
                                </label>
                              </div>
                              <small v-if="errorsDuringTheIncident.wasSafetyDeptNotified_er" class="text-danger">{{
                                errorsDuringTheIncident.wasSafetyDeptNotified_er }}</small>
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
                                errorsDuringTheIncident.SelectedSafetyPersonNotified_er }}</small>
                            </div>

                            <div class="mb-3 col-md-2">
                              <label class="form-label">Did you take pictures of the damages?</label>
                              <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="switchDidYouTakePictures"
                                  v-model="didYouTakePictures" />
                                <label class="form-check-label fw-semibold" for="switchDidYouTakePictures"
                                  :style="{ color: didYouTakePictures ? '#198754' : '#dc3545' }">
                                  {{ didYouTakePictures ? 'YES' : 'NO' }}
                                </label>
                              </div>
                              <small v-if="errorsDuringTheIncident.didYouTakePictures_er" class="text-danger">{{
                                errorsDuringTheIncident.didYouTakePictures_er }}</small>
                            </div>

                            <div class="mb-3 col-md-2">
                              <label class="form-label">Who did you send the pictures to?</label>
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
                                errorsDuringTheIncident.SelectedWhoDidYouSendThePicturesTo_er }}</small>
                            </div>

                            <div class="mb-3 col-md-2">
                              <label class="form-label">How fast were you traveling? (MPH)</label>
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
                                errorsDuringTheIncident.SelectedDirectionYouWereTraveling_er }}</small>
                            </div>

                            <div class="mb-3 col-md-2">
                              <label class="form-label">Was this incident in an intersection?</label>
                              <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="switchWasThisIncidentInAnIntersection"
                                  v-model="wasThisIncidentInAnIntersection" />
                                <label class="form-check-label fw-semibold" for="switchWasThisIncidentInAnIntersection"
                                  :style="{ color: wasThisIncidentInAnIntersection ? '#198754' : '#dc3545' }">
                                  {{ wasThisIncidentInAnIntersection ? 'YES' : 'NO' }}
                                </label>
                              </div>
                              <small v-if="errorsDuringTheIncident.wasThisIncidentInAnIntersection_er" class="text-danger">{{
                                errorsDuringTheIncident.wasThisIncidentInAnIntersection_er }}</small>
                            </div>

                            <div class="mb-3 col-md-2">
                              <label class="form-label">Weather</label>
                              <v-select :options="storeWeatherCondition.weatherConditions" v-model="SelectedWeatherCondition"
                                placeholder="Choose weather condition"
                                :reduce="(weather) => weather.id" label="weatherName" class="form-control p-0"
                                :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedWeatherCondition }" />
                              <small v-if="errorsDuringTheIncident.SelectedWeatherCondition_er" class="text-danger">{{
                                errorsDuringTheIncident.SelectedWeatherCondition_er }}</small>
                            </div>

                            <div class="mb-3 col-md-2">
                              <label class="form-label">Road Conditions</label>
                              <v-select :options="storeRoadCondition.roadConditions" v-model="SelectedRoadCondition"
                                placeholder="Choose road condition"
                                :reduce="(roadCondition) => roadCondition.id" label="roadConditionName" class="form-control p-0"
                                :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedRoadCondition }" />
                              <small v-if="errorsDuringTheIncident.SelectedRoadCondition_er" class="text-danger">{{
                                errorsDuringTheIncident.SelectedRoadCondition_er }}</small>
                            </div>

                            <div class="mb-3 col-md-3">
                              <label class="form-label">Witness</label>
                              <input type="text" v-model="witness" class="form-control form-control-md border border-primary"
                                :class="{ 'border-danger': formSubmittedDuringTheIncident && !witness }"
                                style="color: black;" />
                              <small v-if="errorsDuringTheIncident.witness_er" class="text-danger">{{
                                errorsDuringTheIncident.witness_er }}</small>
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
                                errorsDuringTheIncident.witnessPhone_er }}</small>
                            </div>

                          </div>

                        </div>

                        <button type="button" @click="HandleDuringTheIncident" :disabled="isLoadingDuringTheIncident"
                          class="btn btn-primary btn-md">
                          {{ isEditingDuringTheIncident ? "Update" : "Save" }}
                          <span class="btn-icon-end">
                            <i :class="isEditingDuringTheIncident ? 'fa fa-edit' : 'fa fa-save'"></i>
                          </span>
                        </button>

                      </div>
                    </div>
                  </div>

                  <!-- ══════════════════════════════════════════════════════════ -->
                  <!--  INCIDENT DETAIL                                          -->
                  <!-- ══════════════════════════════════════════════════════════ -->
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

                        <div class="row">
                          <div class="mb-3 col-md-12">
                            <label class="form-label">Incident Description: How did the incident occur? What happened?</label>
                            <textarea v-model="incidentDescription" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.incidentDescription_er" class="text-danger">{{
                              errorsIncidentDetail.incidentDescription_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-12">
                            <label class="form-label">What Action, Event or Condition contributed most to this incident?</label>
                            <textarea v-model="actionEventConditions" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.actionEventConditions_er" class="text-danger">{{
                              errorsIncidentDetail.actionEventConditions_er }}</small>
                          </div>
                        </div>

                        <div class="row">

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Was any vehicles towed?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchWereAnyVehiclesTowed"
                                v-model="wereAnyVehiclesTowed" />
                              <label class="form-check-label fw-semibold" for="switchWereAnyVehiclesTowed"
                                :style="{ color: wereAnyVehiclesTowed ? '#198754' : '#dc3545' }">
                                {{ wereAnyVehiclesTowed ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="errorsIncidentDetail.wereAnyVehiclesTowed_er" class="text-danger">{{
                              errorsIncidentDetail.wereAnyVehiclesTowed_er }}</small>
                          </div>

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Was anyone hurt?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchWasAnyoneHurt"
                                v-model="wasAnyOneHurt" />
                              <label class="form-check-label fw-semibold" for="switchWasAnyoneHurt"
                                :style="{ color: wasAnyOneHurt ? '#198754' : '#dc3545' }">
                                {{ wasAnyOneHurt ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="errorsIncidentDetail.wasAnyOneHurt_er" class="text-danger">{{
                              errorsIncidentDetail.wasAnyOneHurt_er }}</small>
                          </div>

                          <div class="mb-3 col-md-6">
                            <label class="form-label">If YES please describe?</label>
                            <textarea v-model="describeAnyInjuries" :disabled="!wasAnyOneHurt"
                              class="form-control border border-primary"
                              :class="{ 'border-danger': errorsIncidentDetail.describeAnyInjuries_er }"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.describeAnyInjuries_er" class="text-danger">{{
                              errorsIncidentDetail.describeAnyInjuries_er }}</small>
                          </div>

                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-12">
                            <label class="form-label">Damage to Ace truck</label>
                            <textarea v-model="damageToAceTruck" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.damageToAceTruck_er" class="text-danger">{{
                              errorsIncidentDetail.damageToAceTruck_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-12">
                            <label class="form-label">What damage was done</label>
                            <textarea v-model="whatDamageWasDone" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.whatDamageWasDone_er" class="text-danger">{{
                              errorsIncidentDetail.whatDamageWasDone_er }}</small>
                          </div>
                        </div>

                        <div class="row">

                          <div class="mb-3 col-md-3">
                            <label class="form-label">Have you had any incidents in the past year?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchIncidentInThePastYear"
                                v-model="incidentInThePastYear" />
                              <label class="form-check-label fw-semibold" for="switchIncidentInThePastYear"
                                :style="{ color: incidentInThePastYear ? '#198754' : '#dc3545' }">
                                {{ incidentInThePastYear ? 'YES' : 'NO' }}
                              </label>
                            </div>
                            <small v-if="errorsIncidentDetail.incidentInThePastYear_er" class="text-danger">{{
                              errorsIncidentDetail.incidentInThePastYear_er }}</small>
                          </div>

                          <div class="mb-3 col-md-9">
                            <label class="form-label">If YES, please list dates of incidents</label>
                            <textarea v-model="listDatesOfIncidents" :disabled="!incidentInThePastYear"
                              class="form-control border border-primary"
                              :class="{ 'border-danger': errorsIncidentDetail.listDatesOfIncidents_er }"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.listDatesOfIncidents_er" class="text-danger">{{
                              errorsIncidentDetail.listDatesOfIncidents_er }}</small>
                          </div>

                        </div>

                        <div class="row">
                          <div class="row d-flex align-items-center">
                            <div class="mb-3 col-md-9">

                              <input v-show="false" type="file" ref="fileInput"
                                class="form-control form-control-sm border border-primary" multiple accept="image/*"
                                capture="environment" @change="handleFileChange"
                                style="height: 38px; padding: 0.375rem 0.75rem;" />

                              <button @click.prevent="fileInput.click()" style="height: 30px;" type="button"
                                class="btn btn-info btn-rounded btn-sm">
                                Add Photos<span class="btn-icon-end"><i class="fa fa-camera"></i></span>
                              </button>

                              <div v-if="selectedImages.length > 0" class="row mt-2">
                                <div v-for="(image, index) in selectedImages" :key="index" class="col-md-3">
                                  <img :src="image.url" alt="Preview" style="max-width: 100px; margin-bottom: 10px;" />
                                  <p>{{ image.name }} ({{ (image.size / 1024).toFixed(2) }} KB)</p>
                                  <button @click.prevent="removeImage(index)" class="btn btn-danger btn-xs">Remove</button>
                                </div>
                              </div>

                              <div v-if="existingIncidentDetailImages.length > 0" class="row mt-3">
                                <h6 style="color: #000;">Existing Images:</h6>
                                <div class="col-md-12">
                                  <div class="d-flex flex-wrap">
                                    <img
                                      v-for="(image, index) in existingIncidentDetailImages"
                                      :key="'existing-' + index"
                                      :src="getProxyImageUrl(image)"
                                      style="max-width: 100px; margin: 10px; cursor: pointer; border: 2px solid #007bff;"
                                      @click="downloadImage(image)"
                                      alt="Existing Incident Detail Image"
                                    />
                                  </div>
                                </div>
                              </div>

                              <small v-if="errorsIncidentDetail.imagesIncidentDetail_er" class="text-danger">{{
                                errorsIncidentDetail.imagesIncidentDetail_er }}</small>
                            </div>
                          </div>
                        </div>

                        <button type="button" @click="HandleIncidentDetail" :disabled="isLoadingIncidentDetail"
                          class="btn btn-primary btn-md">
                          {{ isEditingIncidentDetail ? "Update" : "Save" }}
                          <span class="btn-icon-end">
                            <i :class="isEditingIncidentDetail ? 'fa fa-edit' : 'fa fa-save'"></i>
                          </span>
                        </button>

                      </div>
                    </div>
                  </div>

                  <!-- ══════════════════════════════════════════════════════════ -->
                  <!--  EMPLOYEE SIGNATURE  ✅                                   -->
                  <!-- ══════════════════════════════════════════════════════════ -->
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

                        <!-- ── Checklist de secciones completadas ── -->
                        <div class="mb-4">
                          <p class="fw-semibold mb-2">
                            <i class="fa fa-clipboard-list me-1"></i>
                            Before signing, please confirm all sections are saved:
                          </p>
                          <ul class="list-unstyled ms-2">
                            <li class="mb-1">
                              <i
                                :class="isEditingGeneralInformation
                                  ? 'fa fa-check-circle text-success'
                                  : 'fa fa-times-circle text-danger'"
                                class="me-2"
                              ></i>
                              <span :class="isEditingGeneralInformation ? 'text-success' : 'text-danger'">
                                General Information
                              </span>
                            </li>
                            <li class="mb-1">
                              <i
                                :class="duringTheIncidentList.length
                                  ? 'fa fa-check-circle text-success'
                                  : 'fa fa-times-circle text-danger'"
                                class="me-2"
                              ></i>
                              <span :class="duringTheIncidentList.length ? 'text-success' : 'text-danger'">
                                During The Incident
                              </span>
                            </li>
                            <li class="mb-1">
                              <i
                                :class="incidentDetailList.length
                                  ? 'fa fa-check-circle text-success'
                                  : 'fa fa-times-circle text-danger'"
                                class="me-2"
                              ></i>
                              <span :class="incidentDetailList.length ? 'text-success' : 'text-danger'">
                                Incident Detail
                              </span>
                            </li>
                          </ul>
                        </div>

                        <hr />

                              <label class="form-label fw-semibold">
                              Employee Signature <span class="text-danger">*</span>
                            </label>

                        <!-- ── Pad de firma ── -->
                        <div class="row">
                          <div class="mb-2 col-md-12">
                            <!-- <label class="form-label fw-semibold">
                              Employee Signature <span class="text-danger">*</span>
                            </label> -->

                            <div
                              :class="['border rounded', signatureError ? 'border-danger' : 'border-secondary']"
                              style="display: inline-block; line-height: 0;"
                            >
                              <Vue3Signature
                                ref="signature"
                                :sigOption="options"
                                :w="'800px'"
                                :h="'200px'"
                              />
                            </div>
                            <div v-if="signatureError" class="mt-1">
                              <small class="text-danger">
                                <i class="fa fa-exclamation-circle me-1"></i>{{ signatureError }}
                              </small>
                            </div>
                          </div>
                        </div>

                        <!-- ── Botones de la firma + Submit ── -->
                        <div class="row align-items-end mt-2">
                          <div class="col-md-auto">
                            <button
                              type="button"
                              class="btn btn-outline-secondary btn-sm me-2"
                              @click="clear"
                            >
                              <i class="fa fa-eraser me-1"></i> Clear
                            </button>
                            <button
                              type="button"
                              class="btn btn-outline-secondary btn-sm"
                              @click="undo"
                            >
                              <i class="fa fa-undo me-1"></i> Undo
                            </button>
                          </div>

                          <div class="col-md-auto ms-auto">
                            <button
                              type="button"
                              class="btn btn-primary btn-md"
                              :disabled="isSubmittingReport"
                              @click="SubmitIncidentReport"
                            >
                              <span v-if="isSubmittingReport">
                                <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                                Submitting...
                              </span>
                              <span v-else>
                                Submit Incident Report
                                <span class="btn-icon-end">
                                  <i class="fa fa-paper-plane"></i>
                                </span>
                              </span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center my-3">
      <img decoding="async" width="650" height="300" src="/assets/smith.png" alt="Five Keys of Smith System Driving" />
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

.form-control-sm {
  min-height: 38px !important;
  padding: 0.375rem 0.75rem !important;
}

.btn-info {
  min-height: 38px !important;
  padding: 0.375rem 0.75rem !important;
}

.v-select.is-invalid .vs__dropdown-toggle {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

input[type="text"]:disabled,
input[type="number"]:disabled {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
  opacity: 0.65 !important;
  border-color: #ced4da !important;
}

.dp__input:disabled {
  background-color: #e9ecef !important;
  color: #6c757d !important;
  cursor: not-allowed !important;
  opacity: 0.65 !important;
  border-color: #ced4da !important;
}

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

.calculated-field {
  background-color: #f8f9fa !important;
  font-weight: 600;
  color: #495057 !important;
  cursor: not-allowed !important;
}

.calculated-field:disabled {
  opacity: 1 !important;
}

.border-danger {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.dp-error .dp__input {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}
</style>