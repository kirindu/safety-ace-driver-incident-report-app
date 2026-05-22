<script setup>
import { ref, toRefs, reactive, onMounted, computed, watch, nextTick, defineAsyncComponent } from "vue";
import { closeModal, confirmModal, openModal } from "@kolirt/vue-modal";

import { useRouter } from 'vue-router'
const router = useRouter()

import { useAuth } from '@/composables/useAuth';
const { user: authUser, initUser } = useAuth();

import { DateTime } from "luxon";

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

import GeneralInformationAPI from "@/api/Sections/GeneralInformationAPI";
import DuringTheIncidentAPI from "@/api/Sections/DuringTheIncidentAPI";
import IncidentDetailAPI from "@/api/Sections/IncidentDetailAPI";
import SupervisorNoteAPI from "@/api/Sections/SupervisorNoteAPI";
import EmployeeSignatureAPI from "@/api/Sections/EmployeeSignatureAPI";

import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

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
import { is } from "@vee-validate/rules";
const storeDept = useDeptsStore();

const user = ref(null);

// watch(authUser, (newUser) => {
//   user.value = newUser;
//   console.log('Usuario actualizado en dashboard:', newUser);
// }, { immediate: true });


// ── VUE3-SIGNATURE ──────────────────────────────────────────────────────────
const signature = ref(null);
const options = reactive({
  penColor: "rgb(0, 0, 0)",
  backgroundColor: "rgb(255, 255, 255)",
});

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

// Props
const props = defineProps({
  item: {
    type: Object,
  },
  onUpdateSuccess: {
    type: Function,
    default: () => { },
  },
});

// Con esto hacemos los props reactivos
const reactiveProps = toRefs(props);

const isLoading = ref(false);

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
  truck_er: "", dept_er: "", supervisor_er: "", typeOfIncident_er: "",
  date_er: "", trainee_er: "", location_er: "", time_er: "",
  timeWorkedYears_er: "", timeWorkedMonths_er: "", timeDayStarted_er: "",
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

const isDuringTheIncidentVisible = ref(false);

const formatPhone = (e) => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
  let formatted = "";
  if (digits.length === 0) { formatted = ""; }
  else if (digits.length <= 3) { formatted = `(${digits}`; }
  else if (digits.length <= 6) { formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`; }
  else { formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`; }
  witnessPhone.value = formatted;
};

const isEditingDuringTheIncident = ref(false);
const isLoadingDuringTheIncident = ref(false);
const formSubmittedDuringTheIncident = ref(false);

watch(wasSafetyDeptNotified, (newValue) => { if (!newValue) SelectedSafetyPersonNotified.value = ""; });
watch(didYouTakePictures, (newValue) => { if (!newValue) SelectedWhoDidYouSendThePicturesTo.value = ""; });

const errorsDuringTheIncident = ref({
  usingElectronicDevice_er: "", taskPerfomed_er: "", wasSafetyDeptNotified_er: "",
  didYouTakePictures_er: "", howFastWereYouGoing_er: "", SelectedSafetyPersonNotified_er: "",
  SelectedWhoDidYouSendThePicturesTo_er: "", SelectedDirectionYouWereTraveling_er: "",
  SelectedWeatherCondition_er: "", SelectedRoadCondition_er: "",
  wasThisIncidentInAnIntersection_er: "", witness_er: "", witnessPhone_er: "",
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
const actionEventCondition = ref("");
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

const isIncidentDetailVisible = ref(false);

watch(wasAnyOneHurt, (newValue) => { if (!newValue) describeAnyInjuries.value = ""; });
watch(incidentInThePastYear, (newValue) => { if (!newValue) listDatesOfIncidents.value = ""; });

const errorsIncidentDetail = ref({
  incidentDescription_er: "", actionEventCondition_er: "", wereAnyVehiclesTowed_er: "",
  wasAnyOneHurt_er: "", describeAnyInjuries_er: "", damageToAceTruck_er: "",
  whatDamageWasDone_er: "", incidentInThePastYear_er: "", listDatesOfIncidents_er: "",
  anyVehicleTowed_er: "", imagesIncidentDetail_er: "",
});

// ── SUPERVISOR NOTE ──────────────────────────────────────────────────────────
const supervisorNote = ref("");
const supervisorNoteError = ref("");
const supervisorSignatureError = ref("");
const selectedSupervisorNoteId = ref(null);
const isEditingSupervisorNote = ref(false);
const isLoadingSupervisorNote = ref(false);
const isSupervisorNoteVisible = ref(false);


// Supervisor Note
const supervisorNoteList = ref([]);
// const selectedSupervisorNoteId = ref(null);
// const supervisorNote = ref("");
// const isEditingSupervisorNote = ref(false);
// const isLoadingSupervisorNote = ref(false);
const formSubmittedSupervisorNote = ref(false);
const errorsSupervisorNote = ref({ supervisorNote_er: "" });

// const isSupervisorNoteVisible = ref(false);


// Una vez que se complete el mounted pintamos los campos con su informacion
onMounted(async () => {
  // Cargamos el General Information con la info del item que se esta editando


  await CargamosGeneralInformation(); // Invoke the function  
  await CargamosDuringTheIncident();
  await CargamosIncidentDetail();
  await CargamosSupervisorNote();


});

const CargamosGeneralInformation = async () => {

  try {
    isLoadingGeneralInformation.value = true;

    selectedTruck.value = reactiveProps.item.value.truck_id || "";
    selectedDept.value = reactiveProps.item.value.dept_id || "";
    selectedSupervisor.value = reactiveProps.item.value.supervisor_id || "";
    selectedTypeOfIncident.value = reactiveProps.item.value.typeOfIncident_id || "";
    date.value = DateTime.fromISO(reactiveProps.item.value.date).toJSDate();
    trainee.value = reactiveProps.item.value.trainerName || "";
    location.value = reactiveProps.item.value.location || "";
    time.value = setTimeFromDB(reactiveProps.item.value.time);
    timeWorkedYears.value = reactiveProps.item.value.timeWorkedYears || "";
    timeWorkedMonths.value = reactiveProps.item.value.timeWorkedMonths || "";
    timeDayStarted.value = setTimeFromDB(reactiveProps.item.value.timeDayStarted);
  } catch (error) {
    console.error("Error loading General Information:", error);
    showSweetAlert("Error", "Failed to load General Information.", "error");
  } finally {
    isLoadingGeneralInformation.value = false;
  }




};

const CargamosDuringTheIncident = async () => {

  isLoadingDuringTheIncident.value = true;

  const response = await GeneralInformationAPI.getDuringTheIncident(reactiveProps.item.value.id);
  duringTheIncidentList.value = response.data.data || [];

  try {
    if (response.data.data && response.data.data.length > 0) {
      isDuringTheIncidentVisible.value = true;
      isEditingDuringTheIncident.value = true;

      selectedDuringTheIncidentId.value = response.data.data[0].id;

      usingElectronicDevice.value = response.data.data[0].usingElectronicDevice || false;
      taskPerfomed.value = response.data.data[0].taskPerfomed || "";
      wasSafetyDeptNotified.value = response.data.data[0].wasSafetyDeptNotified || false;
      didYouTakePictures.value = response.data.data[0].didYouTakePictures || false;
      howFastWereYouGoing.value = response.data.data[0].howFastWereYouGoing || "";
      SelectedSafetyPersonNotified.value = response.data.data[0].safetyPersonNotified_id || "";
      SelectedWhoDidYouSendThePicturesTo.value = response.data.data[0].whoDidYouSendThePicturesTo_id || "";
      SelectedDirectionYouWereTraveling.value = response.data.data[0].directionYouWereTraveling_id || "";
      SelectedWeatherCondition.value = response.data.data[0].weatherCondition_id || "";
      SelectedRoadCondition.value = response.data.data[0].roadCondition_id || "";
      wasThisIncidentInAnIntersection.value = response.data.data[0].wasThisIncidentInAnIntersection || false;
      witness.value = response.data.data[0].witness || "";
      witnessPhone.value = response.data.data[0].witnessPhone || "";

      isLoadingDuringTheIncident.value = false;
    }
    else {
      isDuringTheIncidentVisible.value = false;
    }
  } catch (error) {
    console.error("Error al obtener During The Incident:", error);
    isLoadingDuringTheIncident.value = false;
    isDuringTheIncidentVisible.value = false;

  }

};

const CargamosIncidentDetail = async () => {

  isLoadingIncidentDetail.value = true;
  const response = await GeneralInformationAPI.getIncidentDetail(reactiveProps.item.value.id);
  incidentDetailList.value = response.data.data || [];

  try {
    if (response.data.data && response.data.data.length > 0) {
      isIncidentDetailVisible.value = true;
      isEditingIncidentDetail.value = true;


      const incidentDetail = response.data.data[0];
      selectedIncidentDetailId.value = incidentDetail.id;

      incidentDescription.value = incidentDetail.incidentDescription || "";
      actionEventCondition.value = incidentDetail.actionEventCondition || "";
      wereAnyVehiclesTowed.value = incidentDetail.wereAnyVehiclesTowed || false;
      wasAnyOneHurt.value = incidentDetail.wasAnyOneHurt || false;
      describeAnyInjuries.value = incidentDetail.describeAnyInjuries || "";
      damageToAceTruck.value = incidentDetail.damageToAceTruck || "";
      whatDamageWasDone.value = incidentDetail.whatDamageWasDone || "";
      incidentInThePastYear.value = incidentDetail.incidentInThePastYear || false;
      listDatesOfIncidents.value = incidentDetail.listDatesOfIncidents || "";

      existingIncidentDetailImages.value = incidentDetail.images || [];

      isLoadingIncidentDetail.value = false;
    }
    else {
      isIncidentDetailVisible.value = false;
    }
  } catch (error) {
    console.error("Error loading Incident Detail:", error);
    isLoadingIncidentDetail.value = false;
    isIncidentDetailVisible.value = false;

  }

};

const CargamosSupervisorNote = async () => {
  isLoadingSupervisorNote.value = true;
  try {
    const response = await GeneralInformationAPI.getSupervisorNote(reactiveProps.item.value.id);
    const data = response.data.data || [];

    if (data.length > 0) {
      isSupervisorNoteVisible.value = true;
      isEditingSupervisorNote.value = true;
      selectedSupervisorNoteId.value = data[0].id;
      supervisorNote.value = data[0].supervisorNote || "";
      // Restaurar firma si existe
      if (data[0].supervisorSignature && signature.value) {
        await nextTick();
        signature.value.fromDataURL(data[0].supervisorSignature);
      }
    } else {
      isSupervisorNoteVisible.value = true;
      isEditingSupervisorNote.value = false;
    }
  } catch (error) {
    console.error("Error loading Supervisor Note:", error);
  } finally {
    isLoadingSupervisorNote.value = false;
  }
};

// ── General Information submit ──────────────────────────────────────────────
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmittedGeneralInformation.value = true;

  Object.keys(errorsGeneralInformation.value).forEach(k => errorsGeneralInformation.value[k] = "");

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
    truck_id: selectedTruck.value,
    dept_id: selectedDept.value,
    supervisor_id: selectedSupervisor.value,
    typeOfIncident_id: selectedTypeOfIncident.value,
    location: location.value,
    time: formatTime(time.value),
    timeWorkedYears: timeWorkedYears.value.toString(),
    timeWorkedMonths: timeWorkedMonths.value.toString(),
    timeDayStarted: formatTime(timeDayStarted.value),

    employee_id: reactiveProps.item.value.employee_id,
  };

  try {

    let generalInformationId = reactiveProps.item.value.id;
    const response = await GeneralInformationAPI.edit(generalInformationId, generalInformationData);

    if (response.data.ok) {
      localStorage.setItem("ACE-INCIDENT-REPORT", JSON.stringify(response.data.data));
      const coversheet = JSON.parse(localStorage.getItem("ACE-INCIDENT-REPORT"));

      showSweetAlert({
        title: "General information edited successfully!",
        icon: "success",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        props.onUpdateSuccess();
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

// ── Nominatim Address Autocomplete ──────────────────────────────────────────
const searchLocation = () => {
  clearTimeout(locationDebounceTimer);
  locationSuggestions.value = [];
  if (!location.value || location.value.length < 3) { showLocationDropdown.value = false; return; }
  locationDebounceTimer = setTimeout(async () => {
    locationLoading.value = true;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location.value)}&format=json&limit=5&countrycodes=us`, { headers: { "Accept-Language": "en" } });
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
  setTimeout(() => { showLocationDropdown.value = false; }, 200);
};


const HandleDuringTheIncident = async (event) => {
  event.preventDefault();

  // Limpiar errores
  Object.keys(errorsDuringTheIncident.value).forEach(k => errorsDuringTheIncident.value[k] = "");
  let hasError = false;
  if (hasError) return;


  const duringTheIncidentData = {
    usingElectronicDevice: usingElectronicDevice.value,
    taskPerfomed: taskPerfomed.value,
    wasSafetyDeptNotified: wasSafetyDeptNotified.value,
    didYouTakePictures: didYouTakePictures.value,
    howFastWereYouGoing: howFastWereYouGoing.value,
    safetyPersonNotified_id: SelectedSafetyPersonNotified.value || null,
    whoDidYouSendThePicturesTo_id: SelectedWhoDidYouSendThePicturesTo.value || null,
    directionYouWereTraveling_id: SelectedDirectionYouWereTraveling.value || null,
    weatherCondition_id: SelectedWeatherCondition.value || null,
    roadCondition_id: SelectedRoadCondition.value || null,
    wasThisIncidentInAnIntersection: wasThisIncidentInAnIntersection.value,
    witness: witness.value,
    witnessPhone: witnessPhone.value,

    generalInformation_id: reactiveProps.item.value.id,


  };

  try {
    // Editar o crear During The Incident según corresponda
    if (isEditingDuringTheIncident.value) {

      const response = await DuringTheIncidentAPI.edit(selectedDuringTheIncidentId.value, duringTheIncidentData);
      if (response.data.ok) {
        showSweetAlert({
          title: "During The Incident updated successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDuringTheIncident.value = false; // Hide loading spinner
          CargamosDuringTheIncident(); // Refresh the data to reflect changes

        });
      } else {
        showSweetAlert({
          title: "Error updating During The Incident!",
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

      const response = await DuringTheIncidentAPI.add(duringTheIncidentData);
      if (response.data.ok) {
        showSweetAlert({
          title: "During The Incident added successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDuringTheIncident.value = false; // Hide loading spinner
          CargamosDuringTheIncident(); // Refresh the data to reflect changes

        });
      } else {
        showSweetAlert({
          title: "Error adding During The Incident!",
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
  }

  catch (error) {
    console.error("Error submitting During The Incident:", error);
    showSweetAlert("Error", "Failed to submit During The Incident.", "error");
  }

}

const HandleIncidentDetail = async (event) => {
  event.preventDefault();

  // Limpiar errores
  Object.keys(errorsIncidentDetail.value).forEach(k => errorsIncidentDetail.value[k] = "");
  let hasError = false;
  if (hasError) return;

  const incidentDetailData = {
  incidentDescription: incidentDescription.value,
  actionEventCondition: actionEventCondition.value,
  wereAnyVehiclesTowed: String(wereAnyVehiclesTowed.value),   // ✅ "true"/"false"
  wasAnyOneHurt: String(wasAnyOneHurt.value),                  // ✅ "true"/"false"
  describeAnyInjuries: describeAnyInjuries.value,
  damageToAceTruck: damageToAceTruck.value,
  whatDamageWasDone: whatDamageWasDone.value,
  incidentInThePastYear: String(incidentInThePastYear.value),  // ✅ "true"/"false"
  listDatesOfIncidents: listDatesOfIncidents.value,
  images: selectedFiles.value,   // ✅ array de File objects
  generalInformation_ref_id: reactiveProps.item.value.id,
  };

  try {
    // Editar o crear Incident Detail según corresponda
    if (isEditingIncidentDetail.value) {

      const response = await IncidentDetailAPI.edit(selectedIncidentDetailId.value, incidentDetailData, selectedFiles.value);
      if (response.data.ok) {
        showSweetAlert({
          title: "Incident Detail updated successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingIncidentDetail.value = false; // Hide loading spinner
          CargamosIncidentDetail(); // Refresh the data to reflect changes

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
          isLoadingIncidentDetail.value = false; // Hide loading spinner
        });
      }

    } else {

      const response = await IncidentDetailAPI.add(incidentDetailData, selectedFiles.value);
      if (response.data.ok) {
        showSweetAlert({
          title: "Incident Detail added successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingIncidentDetail.value = false; // Hide loading spinner
          CargamosIncidentDetail(); // Refresh the data to reflect changes

        });
      } else {
        showSweetAlert({
          title: "Error adding Incident Detail!",
          icon: "warning",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingIncidentDetail.value = false; // Hide loading spinner
        });

      }

    }
}

catch (error) {
    console.error("Error submitting Incident Detail:", error);
    showSweetAlert("Error", "Failed to submit Incident Detail.", "error");
  }

}

const HandleSupervisorNote = async (event) => {
  event.preventDefault();

  // Reset errores
  supervisorNoteError.value = "";
  supervisorSignatureError.value = "";

  // Validaciones
  let hasError = false;
  if (!supervisorNote.value || supervisorNote.value.trim() === "") {
    supervisorNoteError.value = "Supervisor note is required.";
    hasError = true;
  }
  if (signature.value.isEmpty()) {
    supervisorSignatureError.value = "Supervisor signature is required.";
    hasError = true;
  }
  if (hasError) return;

  const signatureData = signature.value.save("image/png"); // base64

  const payload = {
    supervisorNote: supervisorNote.value.trim(),
    supervisorSignature: signatureData,
    generalInformation_ref_id: reactiveProps.item.value.id,
  };

  isLoadingSupervisorNote.value = true;
  try {
    let response;
    if (isEditingSupervisorNote.value) {
      response = await SupervisorNoteAPI.edit(selectedSupervisorNoteId.value, payload);
    } else {
      response = await SupervisorNoteAPI.add(payload);
    }

    if (response.data.ok) {
      showSweetAlert({
        title: "Supervisor Note saved successfully!",
        icon: "success",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        CargamosSupervisorNote();
      });
    } else {
      showSweetAlert({
        title: "Error saving Supervisor Note!",
        icon: "warning",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      });
    }
  } catch (error) {
    console.error("Error saving Supervisor Note:", error);
    showSweetAlert({
      title: "Error saving Supervisor Note!",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    });
  } finally {
    isLoadingSupervisorNote.value = false;
  }
};

  // ── File handlers ────────────────────────────────────────────────────────────
  const handleFileChange = (event) => {
    if (!event.target.files.length || event.target.files[0]?.type.indexOf("image/") !== 0) {
      showSweetAlert({ title: "Camera Error", text: "Unable to access the camera. Please ensure permissions are granted or select an image from the gallery.", icon: "warning", allowOutsideClick: false });
      return;
    }
    const files = Array.from(event.target.files);
    const newImages = [];
    for (let file of files) {
      if (file.size > 5242880) {
        showSweetAlert({ title: "Image with excess size!", text: `You cannot upload the image ${file.name}, the maximum allowed is 5Mb`, icon: "warning", allowOutsideClick: false })
          .then(() => { fileInput.value.value = ""; selectedImages.value = []; selectedFiles.value = []; });
        return;
      }
      newImages.push({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
    }
    if (newImages.length + selectedImages.value.length > 15) {
      showSweetAlert({ title: "Upload not completed!", text: "At most you can add up to 15 images.", icon: "warning", allowOutsideClick: false }).then(() => { fileInput.value.value = ""; });
      return;
    }
    selectedFiles.value = [...selectedFiles.value, ...files];
    selectedImages.value = [...selectedImages.value, ...newImages];
    fileInput.value.value = "";
  };

  const removeImage = (index) => { selectedImages.value.splice(index, 1); selectedFiles.value.splice(index, 1); };

  const getProxyImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    return `https://safetybackendstaging.kizunadata.cloud/api/media/image-proxy?url=${encodeURIComponent(imageUrl)}`;
  };

  const downloadImage = (imageUrl) => { window.open(getProxyImageUrl(imageUrl), '_blank'); };

  // ── Utility methods ──────────────────────────────────────────────────────────
  const currentDate = ref(new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" }));

  const formatTime = (controlTimeValue) => {
    if (!controlTimeValue) return "";
    const hours = String(controlTimeValue.hours).padStart(2, "0");
    const minutes = String(controlTimeValue.minutes).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const setTimeFromDB = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) return { hours, minutes };
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
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <span style="font-weight: 600; font-size: 1.1rem;">General Information</span>
            <span style="margin-left: 15px; color: #6c757d;">|</span>
            <span style="margin-left: 15px; font-weight: 700; color: #893db6; font-size: 1.15rem;">
              {{ reactiveProps.item.value.employeeName }}
            </span>
          </div>
          <button @click.prevent="closeModal" type="submit" class="btn-close" aria-label="Close"></button>
        </div>

        <div class="card-body">
          <div class="basic-form">
            <form @submit="onSubmit" autocomplete="off">

              <div class="row">
                <div class="mb-3 col-md-3">
                  <label class="form-label">Truck #</label>
                  <v-select :options="storeTruck.trucks" v-model="selectedTruck" placeholder="Choose your Truck"
                    :reduce="(truck) => truck.id" label="truckNumber" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedTruck }" />
                  <small v-if="errorsGeneralInformation.truck_er" class="text-danger">{{
                    errorsGeneralInformation.truck_er }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Time</label>
                  <div class="mt-0" :class="{ 'dp-error': formSubmittedGeneralInformation && !time }">
                    <VueDatePicker light="true" v-model="time" time-picker placeholder="Select Time">
                      <template #input-icon><img class="input-slot-image" src="../assets/icons/clock2.png" /></template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errorsGeneralInformation.time_er" class="text-danger">{{ errorsGeneralInformation.time_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Time Day Started</label>
                  <div class="mt-0" :class="{ 'dp-error': formSubmittedGeneralInformation && !timeDayStarted }">
                    <VueDatePicker v-model="timeDayStarted" time-picker placeholder="Select Time">
                      <template #input-icon><img class="input-slot-image" src="../assets/icons/clock2.png" /></template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errorsGeneralInformation.timeDayStarted_er" class="text-danger">{{
                    errorsGeneralInformation.timeDayStarted_er }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Dept</label>
                  <v-select :options="storeDept.depts" v-model="selectedDept" placeholder="Choose your Dept"
                    :reduce="(dept) => dept.id" label="deptName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedDept }" />
                  <small v-if="errorsGeneralInformation.dept_er" class="text-danger">{{ errorsGeneralInformation.dept_er
                    }}</small>
                </div>
              </div>

              <div class="row">
                <div class="mb-3 col-md-4">
                  <label class="form-label">Type of Incident</label>
                  <v-select :options="storeTypeIncident.typeIncidents" v-model="selectedTypeOfIncident"
                    placeholder="Choose Incident Type" :reduce="(incidentType) => incidentType.id"
                    label="typeOfIncidentName" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedTypeOfIncident }" />
                  <small v-if="errorsGeneralInformation.typeOfIncident_er" class="text-danger">{{
                    errorsGeneralInformation.typeOfIncident_er }}</small>
                </div>

                <div class="mb-3 col-md-4">
                  <label class="form-label">Supervisor</label>
                  <v-select :options="storeSupervisor.supervisors" v-model="selectedSupervisor"
                    placeholder="Choose your Supervisor" :reduce="(supervisor) => supervisor.id" label="supervisorName"
                    class="form-control p-0"
                    :class="{ 'is-invalid': formSubmittedGeneralInformation && !selectedSupervisor }" />
                  <small v-if="errorsGeneralInformation.supervisor_er" class="text-danger">{{
                    errorsGeneralInformation.supervisor_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-4">
                  <label class="form-label">Trainer</label>
                  <input type="text" v-model="trainee" class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !trainee }" style="color: black;" />
                  <small v-if="errorsGeneralInformation.trainee_er" class="text-danger">{{
                    errorsGeneralInformation.trainee_er
                    }}</small>
                </div>
              </div>

              <div class="row">
                <div class="mb-3 col-md-12">
                  <label class="form-label">Location</label>
                  <div style="position: relative;">
                    <input type="text" v-model="location" @input="searchLocation" @blur="hideLocationDropdown"
                      class="form-control form-control-md border border-primary"
                      :class="{ 'border-danger': formSubmittedGeneralInformation && !location }" style="color: black;"
                      placeholder="Start typing an address..." autocomplete="off" />
                    <div v-if="locationLoading"
                      style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);">
                      <span class="spinner-border spinner-border-sm text-primary" role="status"></span>
                    </div>
                    <ul v-if="showLocationDropdown && locationSuggestions.length"
                      style="position: absolute; top: 100%; left: 0; right: 0; z-index: 1050; background: white; border: 1px solid #ced4da; border-top: none; border-radius: 0 0 0.375rem 0.375rem; max-height: 220px; overflow-y: auto; list-style: none; margin: 0; padding: 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                      <li v-for="item in locationSuggestions" :key="item.place_id"
                        @mousedown.prevent="selectLocation(item)"
                        style="padding: 8px 12px; cursor: pointer; font-size: 0.875rem; color: #212529; border-bottom: 1px solid #f0f0f0;"
                        @mouseover="$event.target.style.backgroundColor = '#e9f0ff'"
                        @mouseleave="$event.target.style.backgroundColor = 'white'">
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
                <div class="mb-3 col-md-3">
                  <label class="form-label">Time Worked (Years)</label>
                  <input type="number" step="any" v-model="timeWorkedYears"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !timeWorkedYears }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.timeWorkedYears_er" class="text-danger">{{
                    errorsGeneralInformation.timeWorkedYears_er }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Time Worked (Months)</label>
                  <input type="number" step="any" v-model="timeWorkedMonths"
                    class="form-control form-control-md border border-primary"
                    :class="{ 'border-danger': formSubmittedGeneralInformation && !timeWorkedMonths }"
                    style="color: black;" />
                  <small v-if="errorsGeneralInformation.timeWorkedMonths_er" class="text-danger">{{
                    errorsGeneralInformation.timeWorkedMonths_er }}</small>
                </div>

                <!-- <div class="mb-3 col-md-3 d-flex align-items-end">
                  <button type="submit" :disabled="isLoadingGeneralInformation" class="btn btn-primary btn-md">
                    <span v-if="isLoadingGeneralInformation" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    {{ isLoadingGeneralInformation ? 'Saving...' : (isEditingGeneralInformation ? "Update" : "Save") }}
                    <span v-if="!isLoadingGeneralInformation" class="btn-icon-end">
                      <i :class="isEditingGeneralInformation ? 'fa fa-edit' : 'fa fa-save'"></i>
                    </span>
                  </button>
                </div> -->

                <!-- ✅ Contact Us button -->
                <!-- <div class="mb-3 col-md-3 d-flex align-items-end">
                  <button type="button" class="btn btn-contact-us" @click="showContactModal = true">
                    <i class="fa fa-phone me-2"></i> Contact Us
                  </button>
                </div> -->

              </div>



              <button type="submit" class="btn btn-primary">
                Update General Information
              </button>

              <button @click.prevent="closeModal" style="margin-left: 20px" type="submit" class="btn btn-danger">
                Close
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>






    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">

            <form autocomplete="off">
              <div class="row">
                <div class="accordion accordion-primary-solid" id="accordion-two">


                  <hr>

                  <Spinner v-if="isLoadingDuringTheIncident" />

                  <!-- ══════════════════════════════════════════════════════════ -->
                  <!--  DURING THE INCIDENT                                      -->
                  <!-- ══════════════════════════════════════════════════════════ -->
                  <div v-if="isDuringTheIncidentVisible" class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseOne">
                        During The Incident
                      </button>
                    </h2>
                    <Spinner v-if="storeSafetyPerson.loading || storeWhoDidYouSendThePicturesTo.loading" />
                    <div id="bordered_collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordion-two">
                      <div class="accordion-body">

                        <div class="row">
                          <div class="mb-3 col-md-5">
                            <label class="form-label">Were you using an electronic device when the incident
                              occurred?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="checkNativeSwitch"
                                v-model="usingElectronicDevice" />
                              <label class="form-check-label fw-semibold" for="checkNativeSwitch"
                                :style="{ color: usingElectronicDevice ? '#198754' : '#dc3545' }">
                                {{ usingElectronicDevice ? 'YES' : 'NO' }}
                              </label>
                            </div>
                          </div>
                          <div class="mb-3 col-md-7">
                            <label class="form-label">Task being performed when incident occurred</label>
                            <input type="text" v-model="taskPerfomed"
                              class="form-control form-control-md border border-primary"
                              :class="{ 'border-danger': formSubmittedDuringTheIncident && !taskPerfomed }"
                              style="color: black;" />
                            <small v-if="errorsDuringTheIncident.taskPerfomed_er" class="text-danger">{{
                              errorsDuringTheIncident.taskPerfomed_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-5">
                            <label class="form-label">Was Safety Dept Notified?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchSafetyDeptNotified"
                                v-model="wasSafetyDeptNotified" />
                              <label class="form-check-label fw-semibold" for="switchSafetyDeptNotified"
                                :style="{ color: wasSafetyDeptNotified ? '#198754' : '#dc3545' }">
                                {{ wasSafetyDeptNotified ? 'YES' : 'NO' }}
                              </label>
                            </div>
                          </div>
                          <div class="mb-3 col-md-7">
                            <label class="form-label">Safety Person Notified</label>
                            <v-select :options="storeSafetyPerson.safetyPersonsNotified"
                              v-model="SelectedSafetyPersonNotified" placeholder="Choose Safety Person"
                              :reduce="(safetyPerson) => safetyPerson.id" label="safetyPersonNotifiedName"
                              class="form-control p-0" :disabled="!wasSafetyDeptNotified"
                              :class="{ 'is-invalid': formSubmittedDuringTheIncident && wasSafetyDeptNotified && !SelectedSafetyPersonNotified }" />
                            <small v-if="errorsDuringTheIncident.SelectedSafetyPersonNotified_er" class="text-danger">{{
                              errorsDuringTheIncident.SelectedSafetyPersonNotified_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-5">
                            <label class="form-label">Did you take pictures of the damages?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchDidYouTakePictures"
                                v-model="didYouTakePictures" />
                              <label class="form-check-label fw-semibold" for="switchDidYouTakePictures"
                                :style="{ color: didYouTakePictures ? '#198754' : '#dc3545' }">
                                {{ didYouTakePictures ? 'YES' : 'NO' }}
                              </label>
                            </div>
                          </div>
                          <div class="mb-3 col-md-7">
                            <label class="form-label">Who did you send the pictures to?</label>
                            <v-select :options="storeWhoDidYouSendThePicturesTo.whoDidYouSendThePicturesTo"
                              v-model="SelectedWhoDidYouSendThePicturesTo" placeholder="Choose a person"
                              :reduce="(person) => person.id" label="whoDidYouSendThePictureToName"
                              class="form-control p-0" :disabled="!didYouTakePictures"
                              :class="{ 'is-invalid': formSubmittedDuringTheIncident && didYouTakePictures && !SelectedWhoDidYouSendThePicturesTo }" />
                            <small v-if="errorsDuringTheIncident.SelectedWhoDidYouSendThePicturesTo_er"
                              class="text-danger">{{ errorsDuringTheIncident.SelectedWhoDidYouSendThePicturesTo_er
                              }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-5">
                            <label class="form-label">Was this incident in an intersection?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchWasThisIncidentInAnIntersection"
                                v-model="wasThisIncidentInAnIntersection" />
                              <label class="form-check-label fw-semibold" for="switchWasThisIncidentInAnIntersection"
                                :style="{ color: wasThisIncidentInAnIntersection ? '#198754' : '#dc3545' }">
                                {{ wasThisIncidentInAnIntersection ? 'YES' : 'NO' }}
                              </label>
                            </div>
                          </div>
                          <div class="mb-3 col-md-7">
                            <label class="form-label">How fast were you traveling? (MPH)</label>
                            <input type="number" step="any" v-model="howFastWereYouGoing"
                              class="form-control form-control-md border border-primary"
                              :class="{ 'border-danger': formSubmittedDuringTheIncident && !howFastWereYouGoing }"
                              style="color: black;" />
                            <small v-if="errorsDuringTheIncident.howFastWereYouGoing_er" class="text-danger">{{
                              errorsDuringTheIncident.howFastWereYouGoing_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-4">
                            <label class="form-label">Weather</label>
                            <v-select :options="storeWeatherCondition.weatherConditions"
                              v-model="SelectedWeatherCondition" placeholder="Choose weather"
                              :reduce="(weather) => weather.id" label="weatherName" class="form-control p-0"
                              :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedWeatherCondition }" />
                            <small v-if="errorsDuringTheIncident.SelectedWeatherCondition_er" class="text-danger">{{
                              errorsDuringTheIncident.SelectedWeatherCondition_er }}</small>
                          </div>
                          <div class="mb-3 col-md-4">
                            <label class="form-label">Road Conditions</label>
                            <v-select :options="storeRoadCondition.roadConditions" v-model="SelectedRoadCondition"
                              placeholder="Choose road" :reduce="(roadCondition) => roadCondition.id"
                              label="roadConditionName" class="form-control p-0"
                              :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedRoadCondition }" />
                            <small v-if="errorsDuringTheIncident.SelectedRoadCondition_er" class="text-danger">{{
                              errorsDuringTheIncident.SelectedRoadCondition_er }}</small>
                          </div>
                          <div class="mb-3 col-md-4">
                            <label class="form-label">Direction you were traveling</label>
                            <v-select :options="storeDirection.directions" v-model="SelectedDirectionYouWereTraveling"
                              placeholder="Choose a direction" :reduce="(direction) => direction.id"
                              label="directionName" class="form-control p-0"
                              :class="{ 'is-invalid': formSubmittedDuringTheIncident && !SelectedDirectionYouWereTraveling }" />
                            <small v-if="errorsDuringTheIncident.SelectedDirectionYouWereTraveling_er"
                              class="text-danger">{{ errorsDuringTheIncident.SelectedDirectionYouWereTraveling_er
                              }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-8">
                            <label class="form-label">Witness</label>
                            <input type="text" v-model="witness"
                              class="form-control form-control-md border border-primary"
                              :class="{ 'border-danger': formSubmittedDuringTheIncident && !witness }"
                              style="color: black;" />
                            <small v-if="errorsDuringTheIncident.witness_er" class="text-danger">{{
                              errorsDuringTheIncident.witness_er }}</small>
                          </div>
                          <div class="mb-3 col-md-4">
                            <label class="form-label">Witness Phone #</label>
                            <input type="text" :value="witnessPhone" @input="formatPhone" placeholder="(XXX) XXX-XXXX"
                              maxlength="14" class="form-control form-control-md border border-primary"
                              :class="{ 'border-danger': formSubmittedDuringTheIncident && !witnessPhone }"
                              style="color: black;" />
                            <small v-if="errorsDuringTheIncident.witnessPhone_er" class="text-danger">{{
                              errorsDuringTheIncident.witnessPhone_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="d-flex justify-content-center">
                            <button type="button" @click="HandleDuringTheIncident"
                              :disabled="isLoadingDuringTheIncident" class="btn btn-primary btn-md">
                              {{ isEditingDuringTheIncident ? "Update" : "Save" }}
                              <span class="btn-icon-end"><i
                                  :class="isEditingDuringTheIncident ? 'fa fa-edit' : 'fa fa-save'"></i></span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <!-- ══════════════════════════════════════════════════════════ -->
                  <!--  INCIDENT DETAIL                                          -->
                  <!-- ══════════════════════════════════════════════════════════ -->
                  <Spinner v-if="isLoadingIncidentDetail" />
                  <div v-if="isIncidentDetailVisible" class="accordion-item">
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
                            <label class="form-label">Incident Description: How did the incident occur? What
                              happened?</label>
                            <textarea v-model="incidentDescription" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.incidentDescription_er" class="text-danger">{{
                              errorsIncidentDetail.incidentDescription_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-12">
                            <label class="form-label">What Action, Event or Condition contributed most to this
                              incident?</label>
                            <textarea v-model="actionEventCondition" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                            <small v-if="errorsIncidentDetail.actionEventCondition_er" class="text-danger">{{
                              errorsIncidentDetail.actionEventCondition_er }}</small>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-4">
                            <label class="form-label">Was anyone hurt?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchWasAnyoneHurt"
                                v-model="wasAnyOneHurt" />
                              <label class="form-check-label fw-semibold" for="switchWasAnyoneHurt"
                                :style="{ color: wasAnyOneHurt ? '#198754' : '#dc3545' }">
                                {{ wasAnyOneHurt ? 'YES' : 'NO' }}
                              </label>
                            </div>
                          </div>
                          <div class="mb-3 col-md-8">
                            <label class="form-label">If YES please describe</label>
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
                            <label class="form-label">Damage to Ace Truck</label>
                            <textarea v-model="damageToAceTruck" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-4">
                            <label class="form-label">Was any vehicles towed?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchWereAnyVehiclesTowed"
                                v-model="wereAnyVehiclesTowed" />
                              <label class="form-check-label fw-semibold" for="switchWereAnyVehiclesTowed"
                                :style="{ color: wereAnyVehiclesTowed ? '#198754' : '#dc3545' }">
                                {{ wereAnyVehiclesTowed ? 'YES' : 'NO' }}
                              </label>
                            </div>
                          </div>
                          <div class="mb-3 col-md-8">
                            <label class="form-label">What damage was done</label>
                            <textarea v-model="whatDamageWasDone" class="form-control border border-primary"
                              style="color: black;" rows="3"></textarea>
                          </div>
                        </div>

                        <div class="row">
                          <div class="mb-3 col-md-4">
                            <label class="form-label">Have you had any incidents in the past year?</label>
                            <div class="form-check form-switch">
                              <input class="form-check-input" type="checkbox" id="switchIncidentInThePastYear"
                                v-model="incidentInThePastYear" />
                              <label class="form-check-label fw-semibold" for="switchIncidentInThePastYear"
                                :style="{ color: incidentInThePastYear ? '#198754' : '#dc3545' }">
                                {{ incidentInThePastYear ? 'YES' : 'NO' }}
                              </label>
                            </div>
                          </div>
                          <div class="mb-3 col-md-8">
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
                                  <button @click.prevent="removeImage(index)"
                                    class="btn btn-danger btn-xs">Remove</button>
                                </div>
                              </div>

                              <div v-if="existingIncidentDetailImages.length > 0" class="row mt-3">
                                <h6 style="color: #000;">Existing Images:</h6>
                                <div class="col-md-12">
                                  <div class="d-flex flex-wrap">
                                    <img v-for="(image, index) in existingIncidentDetailImages"
                                      :key="'existing-' + index" :src="getProxyImageUrl(image)"
                                      style="max-width: 100px; margin: 10px; cursor: pointer; border: 2px solid #007bff;"
                                      @click="downloadImage(image)" alt="Existing Incident Detail Image" />
                                  </div>
                                </div>
                              </div>
                              <small v-if="errorsIncidentDetail.imagesIncidentDetail_er" class="text-danger">{{
                                errorsIncidentDetail.imagesIncidentDetail_er }}</small>
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <div class="d-flex justify-content-center">
                            <button type="button" @click="HandleIncidentDetail" :disabled="isLoadingIncidentDetail"
                              class="btn btn-primary btn-md">
                              {{ isEditingIncidentDetail ? "Update" : "Save" }}
                              <span class="btn-icon-end"><i
                                  :class="isEditingIncidentDetail ? 'fa fa-edit' : 'fa fa-save'"></i></span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <!-- ══════════════════════════════════════════════════════════ -->
                  <!--  SUPERVISOR SIGNATURE  ✅                                   -->
                  <!-- ══════════════════════════════════════════════════════════ -->
                  <Spinner v-if="isLoadingSupervisorNote" />

                  <div v-if="isSupervisorNoteVisible" class="accordion-item">
                    <h2 class="accordion-header">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseThree">
                        Supervisor Signature
                      </button>
                    </h2>
                    <div id="bordered_collapseThree" class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two">
                      <div class="accordion-body">


<!-- ── SUPERVISOR NOTE ──────────────────────────────────────────────── -->
<div class="card mt-3" v-if="isSupervisorNoteVisible">


  <div class="card-body">
    <Spinner v-if="isLoadingSupervisorNote" />

    <form v-else @submit="HandleSupervisorNote" autocomplete="off">

      <!-- Nota del supervisor -->
      <div class="mb-3">
        <label class="form-label fw-semibold">
          Supervisor Note <span class="text-danger">*</span>
        </label>
        <textarea
          v-model="supervisorNote"
          class="form-control"
          :class="{ 'is-invalid': supervisorNoteError }"
          rows="4"
          placeholder="Write the supervisor note here..."
        ></textarea>
        <small v-if="supervisorNoteError" class="text-danger">
          {{ supervisorNoteError }}
        </small>
      </div>

      <!-- Firma del supervisor -->
      <div class="mb-3">
        <label class="form-label fw-semibold">
          Supervisor Signature <span class="text-danger">*</span>
        </label>
        <div :class="{ 'border border-danger rounded': supervisorSignatureError }">
          <Vue3Signature
            ref="signature"
            :sigOption="options"
            :w="'100%'"
            :h="'200px'"
            :disabled="false"
          />
        </div>
        <small v-if="supervisorSignatureError" class="text-danger">
          {{ supervisorSignatureError }}
        </small>
        <div class="mt-2 d-flex gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="undo">
            Undo
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger" @click="clear">
            Clear
          </button>
        </div>
      </div>

      <!-- Submit -->
      <div class="d-flex justify-content-end">
        <button type="submit" class="btn btn-primary" :disabled="isLoadingSupervisorNote">
          <span v-if="isLoadingSupervisorNote"
                class="spinner-border spinner-border-sm me-1" role="status"></span>
          {{ isEditingSupervisorNote ? 'Update Supervisor Note' : 'Submit Supervisor Note' }}
        </button>
      </div>

    </form>
  </div>
</div>




                        <!-- <div class="mb-4">
                          <p class="fw-semibold mb-2">
                            <i class="fa fa-clipboard-list me-1"></i>
                            Before signing, please confirm all sections are saved:
                          </p>
                          <ul class="list-unstyled ms-2">
                            <li class="mb-1">
                              <i :class="isEditingGeneralInformation ? 'fa fa-check-circle text-success' : 'fa fa-times-circle text-danger'"
                                class="me-2"></i>
                              <span :class="isEditingGeneralInformation ? 'text-success' : 'text-danger'">General
                                Information</span>
                            </li>
                            <li class="mb-1">
                              <i :class="duringTheIncidentList.length ? 'fa fa-check-circle text-success' : 'fa fa-times-circle text-danger'"
                                class="me-2"></i>
                              <span :class="duringTheIncidentList.length ? 'text-success' : 'text-danger'">During The
                                Incident</span>
                            </li>
                            <li class="mb-1">
                              <i :class="incidentDetailList.length ? 'fa fa-check-circle text-success' : 'fa fa-times-circle text-danger'"
                                class="me-2"></i>
                              <span :class="incidentDetailList.length ? 'text-success' : 'text-danger'">Incident
                                Detail</span>
                            </li>
                          </ul>
                        </div>

                        <hr />

                        <label class="form-label fw-semibold">
                          Supervisor Signature <span class="text-danger">*</span>
                        </label>

                        <div class="row justify-content-center">
                          <div class="mb-2 col-md-auto text-center">
                            <div :class="['border rounded', signatureError ? 'border-danger' : 'border-secondary']"
                              style="display: inline-block; line-height: 0;">
                              <Vue3Signature ref="signature" :sigOption="options" :w="'650px'" :h="'200px'" />
                            </div>
                            <div v-if="signatureError" class="mt-1">
                              <small class="text-danger"><i class="fa fa-exclamation-circle me-1"></i>{{ signatureError
                                }}</small>
                            </div>
                          </div>
                        </div>

                        <div class="row align-items-end mt-2">
                          <div class="col-md-auto">
                            <button type="button" class="btn btn-outline-secondary btn-sm me-2" @click="clear">
                              <i class="fa fa-eraser me-1"></i> Clear
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="undo">
                              <i class="fa fa-undo me-1"></i> Undo
                            </button>
                          </div>
                        </div>

                        <div class="row">
                          <div class="d-flex justify-content-center mt-3">
                            <button type="button" class="btn btn-danger btn-md" :disabled="isSubmittingReport"
                              @click="SubmitIncidentReport">
                              <span v-if="isSubmittingReport">
                                <span class="spinner-border spinner-border-sm me-1" role="status"></span> Submitting...
                              </span>
                              <span v-else>
                                Submit Incident Report <span class="btn-icon-end"><i
                                    class="fa fa-paper-plane"></i></span>
                              </span>
                            </button>
                          </div>
                        </div> -->

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
</style>