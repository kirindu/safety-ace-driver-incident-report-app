<script setup>
//Importaciones de sistemas y librerias
import { ref, toRefs, computed, watch, onMounted, defineEmits, defineAsyncComponent } from "vue";
import { closeModal, confirmModal, openModal  } from "@kolirt/vue-modal";
import { useRouter } from "vue-router";
const router = useRouter();

// Importamos componentes
import Spinner from "@/components/Spinner.vue";

// Importamos utilidades
import { DateTime } from "luxon";

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// Escuchamos eventos
// const emit = defineEmits(['update-success'])

// Importamos el api
import CoverSheetAPI from "@/api/CoverSheetAPI.js";
import SpareTruckInfoAPI from "@/api/SpareTruckInfoAPI";
import DowntimeAPI from "@/api/DowntimeAPI";
import LoadAPI from "@/api/LoadAPI";

// Import composables
import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

// Importamos Stores
import { useRoutesStore } from "@/stores/routes.js";
const storeRoute = useRoutesStore();

import { useHomeBasesStore } from "@/stores/homebase.js";
const storeHomeBase = useHomeBasesStore();

import { useOperatorsStore } from "@/stores/operator.js";
const storeOperator = useOperatorsStore();

import { useSourcesStore } from "@/stores/source.js";
const storeSource = useSourcesStore();

import { useDestinationsStore } from "@/stores/destination.js";
const storeDestination = useDestinationsStore();

import { useMaterialsStore } from "@/stores/material.js";
const storeMaterial = useMaterialsStore();

import { useLandFillsStore } from "@/stores/landfills";
const storeLandFill = useLandFillsStore();

import { useTrucksStore } from "@/stores/trucks.js";
const storeTruck = useTrucksStore();

import { useTrailersStore } from "@/stores/trailers.js";
const storeTrailer = useTrailersStore();

import { useTypeDownTimeStore } from "@/stores/typeDowntime.js";
const storeTypeDowntime = useTypeDownTimeStore();

const user = ref(null);

// Props
const props = defineProps({
  item: {
    type: Object,
  },
  onUpdateSuccess: {
    type: Function,
    default: () => {},
  },
});

// Con esto hacemos los props reactivos
const reactiveProps = toRefs(props);

const isLoading = ref(false);

// General Info
const selectedHomeBase = ref("");
const selectedTruck = ref("");
const selectedTrailer = ref("");

const date = ref(new Date());

const timeClockIn = ref("");
const timeClockOut = ref("");
const timeClockInTrainee = ref("");
const timeClockOutTrainee = ref("");
const trainee = ref("");

const timePreTripStart = ref("");
const timePreTripEnd = ref("");
const timePostTripStart = ref("");
const timePostTripEnd = ref("");

const truckStartMiles = ref("");
const truckEndMiles = ref("");
const truckStartHours = ref("");
const truckEndHours = ref("");

const trailerStartMiles = ref("");
const trailerEndMiles = ref("");
const fuel = ref("");
const dieselExhaustFluid = ref("");

const notes = ref("");

const formSubmitted = ref(false);

const errors = ref({

  homebase_er: "",
  truck_er: "",
  trailer_er: "",
  clockIn_er: "",
  clockOut_er: "",
  clockInTrainee_er: "",
  clockOutTrainee_er: "",
  trainee_er: "",
  preTripStart_er: "",
  preTripEnd_er: "",
  postTripStart_er: "",
  postTripEnd_er: "",
  truckStartMiles_er: "",
  truckEndMiles_er: "",
  truckStartHours_er: "",
  truckEndHours_er: "",
  trailerStartMiles_er: "",
  trailerEndMiles_er: "",
  fuel_er: "",
  dieselExhaustFluid_er: "",

});

// Spare Truck Info

const spareTruckList = ref([]);
const selectedSpareTruckId = ref(null); // To store the ID of the spare truck being edited
const selectedTruckSpareTruckInfo = ref("");
const selectedTrailerSpareTruckInfo = ref("");
const timeLeaveYardSpareTruckInfo = ref("");
const timeBackInYardSpareTruckInfo = ref("");
const fuelSpareTruckInfo = ref("");
const dieselExhaustFluidSpareTruckInfo = ref("");
const truckStartMilesSpareTruckInfo = ref("");
const truckEndMilesSpareTruckInfo = ref("");
const truckStartHoursSpareTruckInfo = ref("");
const truckEndHoursSpareTruckInfo = ref("");
const trailerStartMilesSpareTruckInfo = ref("");
const trailerEndMilesSpareTruckInfo = ref("");
const isLoadingSpareTruckInfo = ref(false); // To show loading spinner when fetching spare truck info
const formSubmittedSpareTruckInfo = ref(false); // Para Spare Truck Info


const isVisibleSpareTruckInfo = ref(false);
const visibleDetailSpareTruckInfo = ref(false); // To control visibility of the Spare Truck Info section


const errorsSpareTruckInfo = ref({
  homebaseSpareTruckInfo_er: "",
  leaveYardSpareTruckInfo_er: "",
  backInYardSpareTruckInfo_er: "",
  fuelSpareTruckInfo_er: "",
  dieselExhaustFluidSpareTruckInfo_er: "",

  spareTruckSpareTruckInfo_er: "",
  truckStartMilesSpareTruckInfo_er: "",
  truckEndMilesSpareTruckInfo_er: "",
  truckStartHoursSpareTruckInfo_er: "",
  truckEndHoursSpareTruckInfo_er: "",

  spareTrailerSpareTruckInfo_er: "",
  trailerStartMilesSpareTruckInfo_er: "",
  trailerEndMilesSpareTruckInfo_er: "",

});

// Downtime

const downtimeList = ref([]);
const selectedDowntimeId = ref(null); // To store the ID of the downtime being edited
const selectedTruckDownTime = ref("");
const selectedTrailerDownTime = ref("");
const selectedTypeTruckDownTime = ref("");
const selectedTypeTrailerDownTime = ref("");
const truckDownTimeStartDownTime = ref("");
const truckDownTimeEndDownTime = ref("");
const trailerDownTimeStartDownTime = ref("");
const trailerDownTimeEndDownTime = ref("");
const downTimeReasonDownTime = ref("");
const isLoadingDowntime = ref(false); // To show loading spinner when fetching downtime info
const formSubmittedDowntime = ref(false); // To track if Downtime form has been submitted

const isVisibleDowntime = ref(false);
const visibleDetailDowntime = ref(false); // To control visibility of the Downtime section



const errorsDowntime = ref({
  selectedTruckDownTime_er: "",
  selectedTrailerDownTime_er: "",
  selectedTypeTruckDownTime_er: "",
  selectedTypeTrailerDownTime_er: "",
  truckDownTimeStartDownTime_er: "",
  truckDownTimeEndDownTime_er: "",
  trailerDownTimeStartDownTime_er: "",
  trailerDownTimeEndDownTime_er: "",
  downTimeReasonDownTime_er: "",
});

// Load

const formData = new FormData();
const selectedFiles = ref([]); // Store File objects for FormData
const selectedImages = ref([]);
const fileInput = ref(null);
const loadList = ref([]);
const isEditingLoad = ref(false); // To track if we are editing a load record
const selectedLoadId = ref(null); // To store the ID of the load being edited
const tunnelTimeInLoad = ref("");
const tunnelTimeOutLoad = ref("");
const leaveYardLoad = ref("");
const timeInLoad = ref("");
const timeOutLoad = ref("");
const ticketNumberLoad = ref("");
const grossWeightLoad = ref("");
const tareWeightLoad = ref("");
const tonsLoad = ref("");
const backYardLoad = ref("");
const imagesLoad = ref([]); // Se tiene que pasar como images en el formdata
const preloadedLoad = ref(false); // Lo Inicializamos en false
const preloadedNextDayLoad = ref(false); // Lo Inicializamos en false
const selectedOperatorLoad = ref("");
const selectedSourceLoad = ref("");
const selectedDestinationLoad = ref("");
const selectedMaterialLoad = ref("");
const noteLoad = ref("");
const formSubmittedLoad = ref(false); // To track if Load form has been submitted


const selectedLoadData = ref(null);
const isLoadingLoad = ref(false); // To show loading spinner when fetching load info
const isVisibleLoad = ref(false);
const visibleDetailLoad = ref(false); // To control visibility of the Load section



const errorsLoad = ref({
  tunnelTimeInLoad_er: "",
  tunnelTimeOutLoad_er: "",
  leaveYardLoad_er: "",
  timeInLoad_er: "",
  timeOutLoad_er: "",
  ticketNumberLoad_er: "",
  grossWeightLoad_er: "",
  tareWeightLoad_er: "",
  tonsLoad_er: "",
  backYardLoad_er: "",
  imagesLoad_er: "",
  noteLoad_er: "",
  preloadedLoad_er: "",
  preloadedNextDayLoad_er: "",
  selectedOperatorLoad_er: "",
  selectedSourceLoad_er: "",
  selectedDestinationLoad_er: "",
  selectedMaterialLoad_er: "",
});

// ✅ Computed para calcular Tons automáticamente
const calculatedTons = computed(() => {
  const gross = parseFloat(grossWeightLoad.value);
  const tare = parseFloat(tareWeightLoad.value);

  // Si alguno de los valores está vacío o no es válido, retornar vacío
  if (!grossWeightLoad.value || !tareWeightLoad.value || isNaN(gross) || isNaN(tare)) {
    tonsLoad.value = "";
    return "";
  }

  // Validar que Gross Weight >= Tare Weight
  if (gross < tare) {
    tonsLoad.value = "";
    return "";
  }

  // Calcular tons (Gross - Tare) / 2000
  const tons = (gross - tare) / 2000;

  // Actualizar tonsLoad para que se envíe al backend (redondeado a 2 decimales)
  tonsLoad.value = tons.toFixed(2);

  return tons.toFixed(2);
});

// ✅ Validación para mostrar error
const tonsError = computed(() => {
  const gross = parseFloat(grossWeightLoad.value);
  const tare = parseFloat(tareWeightLoad.value);

  if (!grossWeightLoad.value || !tareWeightLoad.value) {
    return "";
  }

  if (gross < tare) {
    return "Gross Weight must be greater than Tare Weight";
  }

  return "";
});

// ✅ WATCHERS para Preloaded y Preload for next day
// Watch para preloadedLoad - asegurar que solo uno esté seleccionado
watch(preloadedLoad, (newValue) => {
  if (newValue && preloadedNextDayLoad.value) {
    preloadedNextDayLoad.value = false;
  }
});

// Watch para preloadedNextDayLoad - asegurar que solo uno esté seleccionado
watch(preloadedNextDayLoad, (newValue) => {
  if (newValue && preloadedLoad.value) {
    preloadedLoad.value = false;
  }
});

// Watch para deshabilitar campos cuando Preloaded está seleccionado
watch(preloadedLoad, (newValue) => {
  if (newValue) {
    // Si se selecciona Preloaded, reseteamos los siguientes campos
    tunnelTimeInLoad.value = "";
    tunnelTimeOutLoad.value = "";
    selectedOperatorLoad.value = "";
  }
});

// Watch para deshabilitar campos cuando preloadedNextDayLoad está seleccionado
watch(preloadedNextDayLoad, (newValue) => {
  if (newValue) {
    // Si se selecciona preloadedNextDayLoad, reseteamos los siguientes campos
    // NOTA: Source y Material NO se resetean porque permanecen activos
    leaveYardLoad.value = "";
    selectedDestinationLoad.value = "";
    timeInLoad.value = "";
    timeOutLoad.value = "";
    ticketNumberLoad.value = "";
    grossWeightLoad.value = "";
    tareWeightLoad.value = "";
    tonsLoad.value = "";
    backYardLoad.value = "";
  }
});


// Handle form submission General Info
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmitted.value = true;

  // Limpiar errores anteriores
  errors.value.homebase_er = "";
  errors.value.truck_er = "";
  errors.value.trailer_er = "";
  errors.value.clockIn_er = "";
  errors.value.clockOut_er = "";
  errors.value.clockInTrainee_er = "";
  errors.value.clockOutTrainee_er = "";
  errors.value.trainee_er = "";
  errors.value.preTripStart_er = "";
  errors.value.preTripEnd_er = "";
  errors.value.postTripStart_er = "";
  errors.value.postTripEnd_er = "";
  errors.value.truckStartMiles_er = "";
  errors.value.truckEndMiles_er = "";
  errors.value.truckStartHours_er = "";
  errors.value.truckEndHours_er = "";
  errors.value.trailerStartMiles_er = "";
  errors.value.trailerEndMiles_er = "";
  errors.value.fuel_er = "";
  errors.value.dieselExhaustFluid_er = "";

  let hasError = false;

  if (!selectedHomeBase.value) {
    errors.value.homebase_er = "Required field";
    hasError = true;
  }

  if (!selectedTruck.value) {
    errors.value.truck_er = "Required field";
    hasError = true;
  }

  if (!selectedTrailer.value) {
    errors.value.trailer_er = "Required field";
    hasError = true;
  }

  if (!timeClockIn.value) {
    errors.value.clockIn_er = "Required field";
    hasError = true;
  }


  if (hasError) {
    return;
  }

  const coverSheetData = {
    homebase_id: selectedHomeBase.value,
    truck_id: selectedTruck.value,
    trailer_id: selectedTrailer.value,
    clockIn: formatTime(timeClockIn.value),
    clockOut: formatTime(timeClockOut.value) || "",
    clockInTrainee: formatTime(timeClockInTrainee.value) || "",
    clockOutTrainee: formatTime(timeClockOutTrainee.value) || "",
    trainee: trainee.value.toString() || "",
    timePreTripStart: formatTime(timePreTripStart.value) || "",
    timePreTripEnd: formatTime(timePreTripEnd.value) || "",
    timePostTripStart: formatTime(timePostTripStart.value) || "",
    timePostTripEnd: formatTime(timePostTripEnd.value) || "",
    truckStartMiles: truckStartMiles.value.toString() || "",
    truckEndMiles: truckEndMiles.value.toString() || "",
    truckStartHours: truckStartHours.value.toString() || "",
    truckEndHours: truckEndHours.value.toString() || "",
    trailerStartMiles: trailerStartMiles.value.toString() || "",
    trailerEndMiles: trailerEndMiles.value.toString() || "",
    fuel: fuel.value.toString() || "",
    dieselExhaustFluid: dieselExhaustFluid.value.toString() || "",

    driver_id: reactiveProps.item.value.driver_id,
    notes: notes.value,
  };

  try {
    let coversheet_id = reactiveProps.item.value.id;
    const response = await CoverSheetAPI.edit(coversheet_id, coverSheetData);

    if (response.data.ok) {
      localStorage.setItem("COVERSHEET", JSON.stringify(response.data.data));
      const coversheet = JSON.parse(localStorage.getItem("COVERSHEET"));

      selectedTruckDownTime.value = coversheet.truck_id;
      selectedTrailerDownTime.value = coversheet.trailer_id;

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

// Una vez que se complete el mounted pintamos los campos con su informacion
onMounted(async () => {
  // Cargamos el CoverSheet

  selectedHomeBase.value = reactiveProps.item.value.homebase_id;
  selectedTruck.value = reactiveProps.item.value.truck_id;
  selectedTrailer.value = reactiveProps.item.value.trailer_id;
  timeClockIn.value = setTimeFromDB(reactiveProps.item.value.clockIn);
  timeClockOut.value = setTimeFromDB(reactiveProps.item.value.clockOut);
  timeClockInTrainee.value = setTimeFromDB(reactiveProps.item.value.clockInTrainee);  
  timeClockOutTrainee.value = setTimeFromDB(reactiveProps.item.value.clockOutTrainee);
  trainee.value = reactiveProps.item.value.trainee;
  timePreTripStart.value = setTimeFromDB(reactiveProps.item.value.timePreTripStart);
  timePreTripEnd.value = setTimeFromDB(reactiveProps.item.value.timePreTripEnd);
  timePostTripStart.value = setTimeFromDB(reactiveProps.item.value.timePostTripStart);
  timePostTripEnd.value = setTimeFromDB(reactiveProps.item.value.timePostTripEnd);
  truckStartMiles.value = reactiveProps.item.value.truckStartMiles;
  truckEndMiles.value = reactiveProps.item.value.truckEndMiles;
  truckStartHours.value = reactiveProps.item.value.truckStartHours;
  truckEndHours.value = reactiveProps.item.value.truckEndHours;
  trailerStartMiles.value = reactiveProps.item.value.trailerStartMiles;
  trailerEndMiles.value = reactiveProps.item.value.trailerEndMiles;
  fuel.value = reactiveProps.item.value.fuel;
  dieselExhaustFluid.value = reactiveProps.item.value.dieselExhaustFluid;
  notes.value = reactiveProps.item.value.notes;

  
  date.value = DateTime.fromISO(reactiveProps.item.value.date).toJSDate();


  // Cargando Spare Truck Info si existe

  await CargamosSpareTruckInfo(); // Invoke the function
  // Cargando Downtime si existe
  await CargamosDowntime(); // Invoke the function
  // Cargando Load si existe
  await CargamosLoad(); // Invoke the function
});

const CargamosSpareTruckInfo = async (event = null) => {
  // Default event to null
  if (event) {
    event.preventDefault(); // Only call preventDefault if event exists
  }

  try {
    isLoadingSpareTruckInfo.value = true;
    
    // ✅ CORREGIDO: Llamar al API sin verificar spareTruckInfo_id (que no existe)
    const response = await CoverSheetAPI.getSpareTruckInfo(reactiveProps.item.value.id);
    spareTruckList.value = response.data.data || [];

    // ✅ Mostrar la sección solo si hay datos
    if (response.data.data && response.data.data.length > 0) {
      isVisibleSpareTruckInfo.value = true;
    } else {
      isVisibleSpareTruckInfo.value = false;
    }

    isLoadingSpareTruckInfo.value = false;
  } catch (error) {
    console.error("Error al obtener Spare Truck Info:", error);
    isLoadingSpareTruckInfo.value = false;
    isVisibleSpareTruckInfo.value = false;
  }
};

const CargamosDowntime = async (event = null) => {
  // Default event to null
  if (event) {
    event.preventDefault(); // Only call preventDefault if event exists
  }

  try {
    isLoadingDowntime.value = true;

    // ✅ CORREGIDO: Llamar al API sin verificar downtime_id (que no existe)
    const response = await CoverSheetAPI.getDowntime(reactiveProps.item.value.id);
    downtimeList.value = response.data.data || [];

    // ✅ Mostrar la sección solo si hay datos
    if (response.data.data && response.data.data.length > 0) {
      isVisibleDowntime.value = true;
    } else {
      isVisibleDowntime.value = false;
    }

    isLoadingDowntime.value = false;
  } catch (error) {
    console.error("Error al obtener Downtime:", error);
    isLoadingDowntime.value = false;
    isVisibleDowntime.value = false;
  }
};

const CargamosLoad = async () => {
  try {
    // Llamamos al API para obtener la lista de Downtime
    const response = await CoverSheetAPI.getLoad(reactiveProps.item.value.id);
    loadList.value = response.data.data || [];

    if (response.data.data.length > 0) {
      isVisibleLoad.value = true; // Show the Load section
    } else {
      isVisibleLoad.value = false; // Hide the Load section if no data
    }
  } catch (error) {
    console.error("Error al obtener Load:", error);
  }
};

const EditSpareTruckInfo = (item) => {
  // Populate the form with the selected Spare Truck Info

  timeLeaveYardSpareTruckInfo.value = setTimeFromDB(item.timeLeaveYardSpareTruckInfo);
  timeBackInYardSpareTruckInfo.value = setTimeFromDB(item.timeBackInYardSpareTruckInfo);
  fuelSpareTruckInfo.value = item.fuelSpareTruckInfo;
  dieselExhaustFluidSpareTruckInfo.value = item.dieselExhaustFluidSpareTruckInfo;

  selectedTruckSpareTruckInfo.value = item.truck_id;
  truckStartMilesSpareTruckInfo.value = item.truckStartMilesSpareTruckInfo;
  truckEndMilesSpareTruckInfo.value = item.truckEndMilesSpareTruckInfo;
  truckStartHoursSpareTruckInfo.value = item.truckStartHoursSpareTruckInfo;
  truckEndHoursSpareTruckInfo.value = item.truckEndHoursSpareTruckInfo;

  selectedTrailerSpareTruckInfo.value = item.trailer_id;
  trailerStartMilesSpareTruckInfo.value = item.trailerStartMilesSpareTruckInfo;
  trailerEndMilesSpareTruckInfo.value = item.trailerEndMilesSpareTruckInfo;


  selectedSpareTruckId.value = item.id || item._id; // Ensure the ID is captured
  visibleDetailSpareTruckInfo.value = true; // Show the Spare Truck Info details section
};

const EditDowntime = (item) => {

selectedTruckDownTime.value = item.truck_id;
selectedTrailerDownTime.value = item.trailer_id;
selectedTypeTruckDownTime.value = item.typeTruckDownTime_id;
selectedTypeTrailerDownTime.value = item.typeTrailerDownTime_id;
truckDownTimeStartDownTime.value = item.truckDownTimeStartDownTime? setTimeFromDB(item.truckDownTimeStartDownTime): "";
truckDownTimeEndDownTime.value = item.truckDownTimeEndDownTime? setTimeFromDB(item.truckDownTimeEndDownTime): "";
trailerDownTimeStartDownTime.value = item.trailerDownTimeStartDownTime? setTimeFromDB(item.trailerDownTimeStartDownTime): "";
trailerDownTimeEndDownTime.value = item.trailerDownTimeEndDownTime? setTimeFromDB(item.trailerDownTimeEndDownTime): "";
downTimeReasonDownTime.value = item.downTimeReasonDownTime || "";

selectedDowntimeId.value = item.id || item._id; // Ensure the ID is captured
visibleDetailDowntime.value = true; // Show the Downtime details section
};

const EditLoad = (item) => {

  // Clear previous image arrays when editing a Load
  selectedFiles.value = [];
  selectedImages.value = [];
  
  // Clear file input if it exists
  if (fileInput.value) {
    fileInput.value.value = "";
  }

  tunnelTimeInLoad.value = item.tunnelTimeInLoad? setTimeFromDB(item.tunnelTimeInLoad): "";
  tunnelTimeOutLoad.value = item.tunnelTimeOutLoad? setTimeFromDB(item.tunnelTimeOutLoad): "";
  leaveYardLoad.value = item.leaveYardLoad? setTimeFromDB(item.leaveYardLoad): "";
  timeInLoad.value = item.timeInLoad? setTimeFromDB(item.timeInLoad): "";
  timeOutLoad.value = item.timeOutLoad? setTimeFromDB(item.timeOutLoad): "";
  ticketNumberLoad.value = item.ticketNumberLoad || "";
  grossWeightLoad.value = item.grossWeightLoad ? item.grossWeightLoad.toString() : "";
  tareWeightLoad.value = item.tareWeightLoad ? item.tareWeightLoad.toString() : "";
  tonsLoad.value = item.tonsLoad ? item.tonsLoad.toString() : "";
  backYardLoad.value = item.backYardLoad? setTimeFromDB(item.backYardLoad): "";
  noteLoad.value = item.noteLoad || "";
  preloadedLoad.value = item.preloadedLoad || false;
  preloadedNextDayLoad.value = item.preloadedNextDayLoad || false;
  selectedOperatorLoad.value = item.operator_id || "";
  selectedSourceLoad.value = item.source_id || "";
  selectedDestinationLoad.value = item.destination_id || "";
  selectedMaterialLoad.value = item.material_id || "";


  selectedLoadData.value = item; // Store the entire item, including images

  selectedLoadId.value = item.id || item._id; // Ensure the ID is captured
  visibleDetailLoad.value = true; // Show the Load details section
};

const OcultamosSpareTruckInfo = () => {
  visibleDetailSpareTruckInfo.value = false; // Hide the Spare Truck Info details section
};

const OcultamosDowntime = () => {
  visibleDetailDowntime.value = false; // Hide the Downtime details section
};

const OcultamosLoad = () => {
  visibleDetailLoad.value = false; // Hide the Load details section
  
  // Clear image arrays when hiding Load section
  selectedFiles.value = [];
  selectedImages.value = [];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};



const DeleteSpareTruckInfo = async (item) => {
  const result = await showSweetAlert({
    title: "Are you sure you want to delete this Spare Truck Info?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
  });

  if (result?.isConfirmed) {
    try {
      isLoading.value = true;
      const response = await SpareTruckInfoAPI.delete(item.id);

      if (response.data.ok) {
        await showSweetAlert({
          title: "Deleted!",
          text: "Spare Truck has been deleted successfully.",
          icon: "success",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
           }).then(() => {
             CargamosSpareTruckInfo();
           });

      } else {
        await showSweetAlert({
          title: "Error!",
          text: "Error deleting Spare Truck Info!",
          icon: "error",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      console.error("Error deleting Spare Truck Info:", error);
      await showSweetAlert({
        title: "Error!",
        text: error.response?.data?.message || "Error deleting CoverSheet!",
        icon: "error",
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      });
    } finally {
      isLoading.value = false;
    }
  }
};


const DeleteDowntime = async (item) => {
  const result = await showSweetAlert({
    title: "Are you sure you want to delete this Downtime?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
  });

  if (result?.isConfirmed) {
    try {
      isLoading.value = true;
      const response = await DowntimeAPI.delete(item.id);

      if (response.data.ok) {
        await showSweetAlert({
          title: "Deleted!",
          text: "Downtime has been deleted successfully.",
          icon: "success",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
           }).then(() => {
             CargamosDowntime();
           });

      } else {
        await showSweetAlert({
          title: "Error!",
          text: "Error deleting Downtime!",
          icon: "error",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      console.error("Error deleting Downtime:", error);
      await showSweetAlert({
        title: "Error!",
        text: error.response?.data?.message || "Error deleting Downtime!",
        icon: "error",
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      });
    } finally {
      isLoading.value = false;
    }
  }
};

const DeleteLoad = async (item) => {
  const result = await showSweetAlert({
    title: "Are you sure you want to delete this Load?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    allowOutsideClick: false,
  });

  if (result?.isConfirmed) {
    try {
      isLoading.value = true;
      const response = await LoadAPI.delete(item.id);

      if (response.data.ok) {
        await showSweetAlert({
          title: "Deleted!",
          text: "Load has been deleted successfully.",
          icon: "success",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
           }).then(() => {
             CargamosLoad();
           });

      } else {
        await showSweetAlert({
          title: "Error!",
          text: "Error deleting Load!",
          icon: "error",
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        });
      }
    } catch (error) {
      console.error("Error deleting Load:", error);
      await showSweetAlert({
        title: "Error!",
        text: error.response?.data?.message || "Error deleting Load!",
        icon: "error",
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      });
    } finally {
      isLoading.value = false;
    }
  }
};

const HandleSpareTruckInfo = async (event) => {
  event.preventDefault();

  // Limpiar errores anteriores
  errorsSpareTruckInfo.value.homebaseSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.leaveYardSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.backInYardSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.fuelSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.dieselExhaustFluidSpareTruckInfo_er = "";

  errorsSpareTruckInfo.value.spareTruckSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.truckStartMilesSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.truckEndMilesSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.truckStartHoursSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.truckEndHoursSpareTruckInfo_er = "";

  errorsSpareTruckInfo.value.spareTrailerSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.trailerStartMilesSpareTruckInfo_er = "";
  errorsSpareTruckInfo.value.trailerEndMilesSpareTruckInfo_er = "";

  let hasError = false;



  // if (hasError) {
  //   return;
  // }

    if (hasError) {
      return;
  }

  const spareTruckInfo = {

    timeLeaveYardSpareTruckInfo: formatTime(timeLeaveYardSpareTruckInfo.value) || "",
    timeBackInYardSpareTruckInfo: formatTime(timeBackInYardSpareTruckInfo.value) || "",
    fuelSpareTruckInfo: fuelSpareTruckInfo.value.toString() || "",
    dieselExhaustFluidSpareTruckInfo: dieselExhaustFluidSpareTruckInfo.value.toString() || "",
    truck_id: selectedTruckSpareTruckInfo.value,
    truckStartMilesSpareTruckInfo: truckStartMilesSpareTruckInfo.value.toString() || "",
    truckEndMilesSpareTruckInfo: truckEndMilesSpareTruckInfo.value.toString() || "",
    truckStartHoursSpareTruckInfo: truckStartHoursSpareTruckInfo.value.toString() || "",
    truckEndHoursSpareTruckInfo: truckEndHoursSpareTruckInfo.value.toString() || "",
    trailer_id: selectedTrailerSpareTruckInfo.value,
    trailerStartMilesSpareTruckInfo: trailerStartMilesSpareTruckInfo.value.toString() || "",
    trailerEndMilesSpareTruckInfo: trailerEndMilesSpareTruckInfo.value.toString() || "",
    
  };

  try {
    // Edit existing Spare Truck Info
    isLoadingSpareTruckInfo.value = true; // Show loading spinner
    const response = await SpareTruckInfoAPI.edit(
      selectedSpareTruckId.value,
      spareTruckInfo
    );

    if (response.data.ok) {
      showSweetAlert({
        title: "Spare Truck Info updated successfully!",
        icon: "success",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        isLoadingSpareTruckInfo.value = false; // Hide loading spinner
        CargamosSpareTruckInfo();
      });
    } else {
      showSweetAlert({
        title: "Error updating Spare Truck Info!",
        icon: "warning",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        isLoadingSpareTruckInfo.value = false; // Hide loading spinner
      });
    }
  } catch (error) {
    showSweetAlert({
      title: "Error updating Spare Truck Info!",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      isLoadingSpareTruckInfo.value = false; // Hide loading spinner
    });
  }
};

const HandleDowntime = async (event) => {
  event.preventDefault();

  // Limpiar errores anteriores

  errorsDowntime.value.selectedTruckDownTime_er = "";
  errorsDowntime.value.selectedTrailerDownTime_er = "";
  errorsDowntime.value.selectedTypeTruckDownTime_er = "";
  errorsDowntime.value.selectedTypeTrailerDownTime_er = "";
  errorsDowntime.value.truckDownTimeStartDownTime_er = "";
  errorsDowntime.value.truckDownTimeEndDownTime_er = "";
  errorsDowntime.value.trailerDownTimeStartDownTime_er = "";
  errorsDowntime.value.trailerDownTimeEndDownTime_er = "";
  errorsDowntime.value.downTimeReasonDownTime_er = "";

  let hasError = false;

  if (!downTimeReasonDownTime.value) {
    errorsDowntime.value.downTimeReasonDownTime_er = "Required field";
    hasError = true;
  }

  // if (hasError) {
  //   return;
  // }

      if (hasError) {
      return;
  }

  const downtime = {
    truck_id: selectedTruckDownTime.value,
    trailer_id: selectedTrailerDownTime.value,
    typeTruckDownTime_id: selectedTypeTruckDownTime.value,
    typeTrailerDownTime_id: selectedTypeTrailerDownTime.value,
    truckDownTimeStartDownTime: formatTime(truckDownTimeStartDownTime.value) || "",
    truckDownTimeEndDownTime: formatTime(truckDownTimeEndDownTime.value) || "",
    trailerDownTimeStartDownTime: formatTime(trailerDownTimeStartDownTime.value) || "",
    trailerDownTimeEndDownTime: formatTime(trailerDownTimeEndDownTime.value) || "",
    downTimeReasonDownTime: downTimeReasonDownTime.value || "",
  };

  try {
    isLoadingDowntime.value = true; // Show loading spinner
    const response = await DowntimeAPI.edit(selectedDowntimeId.value, downtime);

    if (response.data.ok) {
      showSweetAlert({
        title: "Downtime updated successfully!",
        icon: "success",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        isLoadingDowntime.value = false; // Hide loading spinner
        CargamosDowntime();
      });
    } else {
      showSweetAlert({
        title: "Error updating Downtime!",
        icon: "warning",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        isLoadingDowntime.value = false; // Hide loading spinner
      });
    }
  } catch (error) {
    showSweetAlert({
      title: "Error updating Downtime!",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      isLoadingDowntime.value = false; // Hide loading spinner
    });
  }
};

// Handle form submission for Load
const HandleLoad = async (event) => {
  event.preventDefault();

  // Clear previous errors
  errorsLoad.value.tunnelTimeInLoad_er = "";
  errorsLoad.value.tunnelTimeOutLoad_er = "";
  errorsLoad.value.leaveYardLoad_er = "";
  errorsLoad.value.timeInLoad_er = "";
  errorsLoad.value.timeOutLoad_er = "";
  errorsLoad.value.ticketNumberLoad_er = "";
  errorsLoad.value.grossWeightLoad_er = "";
  errorsLoad.value.tareWeightLoad_er = "";
  errorsLoad.value.tonsLoad_er = "";
  errorsLoad.value.backYardLoad_er = "";
  errorsLoad.value.imagesLoad_er = "";
  errorsLoad.value.noteLoad_er = "";
  errorsLoad.value.preloadedLoad_er = "";
  errorsLoad.value.preloadedNextDayLoad_er = "";
  errorsLoad.value.selectedOperatorLoad_er = "";
  errorsLoad.value.selectedSourceLoad_er = "";
  errorsLoad.value.selectedDestinationLoad_er = "";
  errorsLoad.value.selectedMaterialLoad_er = "";

  let hasError = false;

  if (!selectedSourceLoad.value) {
    errorsLoad.value.selectedSourceLoad_er = "Required field";
    hasError = true;
  }

    if (!selectedMaterialLoad.value) {
    errorsLoad.value.selectedMaterialLoad_er = "Required field";
    hasError = true;
  }
  // if (hasError) {
  //   return;
  // }

      if (hasError) {
      return;
  }

  // Create a new FormData object
  const formData = new FormData();

  // Add form fields to FormData
  if (selectedOperatorLoad.value) formData.append("operator_id", selectedOperatorLoad.value);
  if (selectedSourceLoad.value) formData.append("source_id", selectedSourceLoad.value);
  if (selectedDestinationLoad.value) formData.append("destination_id", selectedDestinationLoad.value);
  if (selectedMaterialLoad.value) formData.append("material_id", selectedMaterialLoad.value);
  if (tunnelTimeInLoad.value) formData.append("tunnelTimeInLoad", formatTime(tunnelTimeInLoad.value));
  if (tunnelTimeOutLoad.value) formData.append("tunnelTimeOutLoad", formatTime(tunnelTimeOutLoad.value));
  if (leaveYardLoad.value) formData.append("leaveYardLoad", formatTime(leaveYardLoad.value));
  if (timeInLoad.value) formData.append("timeInLoad", formatTime(timeInLoad.value));
  if (timeOutLoad.value) formData.append("timeOutLoad", formatTime(timeOutLoad.value));
  if (ticketNumberLoad.value) formData.append("ticketNumberLoad", ticketNumberLoad.value);
  if (grossWeightLoad.value) formData.append("grossWeightLoad", grossWeightLoad.value.toString());
  if (tareWeightLoad.value) formData.append("tareWeightLoad", tareWeightLoad.value.toString());
  if (tonsLoad.value) formData.append("tonsLoad", tonsLoad.value.toString());
  if (backYardLoad.value) formData.append("backYardLoad", formatTime(backYardLoad.value));
  if (noteLoad.value) formData.append("noteLoad", noteLoad.value);
  if (preloadedLoad.value) formData.append("preloadedLoad", preloadedLoad.value);
  if (preloadedNextDayLoad.value) formData.append("preloadedNextDayLoad", preloadedNextDayLoad.value);

  // Append all selected files to FormData
  selectedFiles.value.forEach((file, index) => {
    formData.append("images", file, file.name); // Use "images" as the key
  });

  try {
    isLoadingLoad.value = true;
    const response = await LoadAPI.edit(selectedLoadId.value, formData);

    if (response.data.ok) {
      showSweetAlert({
        title: "Load updated successfully!",
        icon: "success",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(async () => {
        isLoadingLoad.value = false;
        
        // Refresh the Load list
        await CargamosLoad();
        
        // Update selectedLoadData with the refreshed Load to show all images
        const updatedLoad = loadList.value.find(load => load.id === selectedLoadId.value || load._id === selectedLoadId.value);
        if (updatedLoad) {
          selectedLoadData.value = updatedLoad;
        }
        
        // Clear image arrays after successful save
        selectedFiles.value = [];
        selectedImages.value = [];
        if (fileInput.value) {
          fileInput.value.value = "";
        }
      });
    } else {
      showSweetAlert({
        title: "Error updating Load!",
        icon: "warning",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        isLoadingLoad.value = false;
      });
    }
  } catch (error) {
    showSweetAlert({
      title: isEditingLoad.value
        ? "Error updating Load!"
        : "Error saving Load!",
      text: error.response?.data?.msg || "An error occurred",
      icon: "warning",
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: "Ok",
      allowOutsideClick: false,
    }).then(() => {
      isLoadingLoad.value = false;
    });
    console.error("Error al enviar Load:", error);
  }
};

// Utility functions

// Function to set time from a database string (e.g., "14:36")
const setTimeFromDB = (timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  if (!isNaN(hours) && !isNaN(minutes)) {
    return { hours, minutes };
  }
};

const formatTime = (controlTimeValue) => {
  if (!controlTimeValue) {
    return "";
  }

  const hours = String(controlTimeValue.hours).padStart(2, "0");
  const minutes = String(controlTimeValue.minutes).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// const getDenverTimeAsUTCISOString = () => {
//   const now = DateTime.now().setZone("America/Denver"); // Get current time in Denver
//   return now.toUTC().toISO(); // Convert to UTC and return ISO string
// };

const getDenverTimeAsUTCISOString = () => {
  const denverTime = DateTime.now().setZone('America/Denver');
  // Mantener la fecha de Denver pero en formato ISO
  return denverTime.toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
};

const logout = () => {
  localStorage.removeItem("USER"); // Eliminamos la variable USER del localStorage
  localStorage.removeItem('COVERSHEET2') // Eliminamos la variable COVERSHEET2 del localStorage
  router.push({ name: "login" }); // Redirigimos al usuario a la página de login
};

const downloadImage = (imageUrl) => {
  const link = document.createElement("a");
  link.href = "https://backend-fastapi-airc-coversheet-staging.onrender.com/" + imageUrl;
  link.target = "_blank"; // Open in new tab
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openAddSpareModal = async (item) => {
  await openModal(
    defineAsyncComponent(() => import("@/components/AddSpareModal.vue")),
        {
      item: item,
      onUpdateSuccess: CargamosSpareTruckInfo, // Pass the function reference (without parentheses)
    }

  )
    .then((data) => {
      console.log("success", data);
    })
    .catch(() => {
      console.log("catch");
    });
};

const openAddDownTimeModal = async (item) => {
  await openModal(
    defineAsyncComponent(() => import("@/components/AddDownTimeModal.vue")),
        {
      item: item,
      onUpdateSuccess: CargamosDowntime, // Pass the function reference (without parentheses)
    }

  )
    .then((data) => {
      console.log("success", data);
    })
    .catch(() => {
      console.log("catch");
    });
};

const openAddLoadModal = async (item) => {
  await openModal(
    defineAsyncComponent(() => import("@/components/AddLoadModal.vue")),
        {
      item: item,
      onUpdateSuccess: CargamosLoad, // Pass the function reference (without parentheses)
    }

  )
    .then((data) => {
      console.log("success", data);
    })
    .catch(() => {
      console.log("catch");
    });
};

// Handle file selection and preview for Load images
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

// Remove image from preview
const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
};







</script>

<template>
  <div class="container-fluid">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <span style="font-weight: 600; font-size: 1.1rem;">Coversheet</span>
            <span style="margin-left: 15px; color: #6c757d;">|</span>
            <span style="margin-left: 15px; font-weight: 700; color: #893db6; font-size: 1.15rem;">
              {{ reactiveProps.item.value.driverName }}
            </span>
          </div>
          <button
            @click.prevent="closeModal"
            type="submit"
            class="btn-close"
            aria-label="Close"
          ></button>
        </div>
        <div class="card-body">
          <div class="basic-form">
            <form @submit="onSubmit" autocomplete="off">

                    <div class="row">


                <div class="mb-3 col-md-3">
                  <label class="form-label">HomeBase</label>
                  <v-select :options="storeHomeBase.homebases" v-model="selectedHomeBase"
                    placeholder="Choose your HomeBase" :reduce="(homebase) => homebase.id" label="homeBaseName"
                    class="form-control p-0" :class="{ 'is-invalid': formSubmitted && !selectedHomeBase }" />
                  <small v-if="errors.homebase_er" class="text-danger">{{
                    errors.homebase_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-2">
                  <label class="form-label">Truck #</label>
                  <v-select :options="storeTruck.trucks" v-model="selectedTruck" placeholder="Choose your Truck"
                    :reduce="(truck) => truck.id" label="truckNumber" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmitted && !selectedTruck }" />
                  <small v-if="errors.truck_er" class="text-danger">{{
                    errors.truck_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-2">
                  <label class="form-label">Trailer #</label>
                  <v-select :options="storeTrailer.trailers" v-model="selectedTrailer" placeholder="Choose your Trailer"
                    :reduce="(trailer) => trailer.id" label="trailerNumber" class="form-control p-0"
                    :class="{ 'is-invalid': formSubmitted && !selectedTrailer }" />
                  <small v-if="errors.trailer_er" class="text-danger">{{
                    errors.trailer_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-5">
                  <label class="form-label">Trainee (or Trainer)</label>
                  <input type="text" v-model="trainee" class="form-control form-control-lg border border-primary"
                    style="color: black;" />
                  <small v-if="errors.trainee_er" class="text-danger">{{ errors.trainee_er }}</small>
                </div>



              </div>

              <div class="row">

                <div class="mb-3 col-md-3">
                  <label class="form-label">Clock In</label>
                  <div class="mt-0">
                    <VueDatePicker light="true" v-model="timeClockIn" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.clockIn_er" class="text-danger">{{
                    errors.clockIn_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Clock Out</label>
                  <div class="mt-0">
                    <VueDatePicker v-model="timeClockOut" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.clockOut_er" class="text-danger">{{
                    errors.clockOut_er
                    }}</small>
                </div>


                <div class="mb-3 col-md-3">
                  <label class="form-label">Clock In (Trainee or Trainer)</label>
                  <div class="mt-0">
                    <VueDatePicker v-model="timeClockInTrainee" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.clockInTrainee_er" class="text-danger">{{
                    errors.clockInTrainee_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Clock Out (Trainee or Trainer)</label>
                  <div class="mt-0">
                    <VueDatePicker v-model="timeClockOutTrainee" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.clockOutTrainee_er" class="text-danger">{{
                    errors.clockOutTrainee_er
                    }}</small>
                </div>






              </div>

              <div class="row">
                <div class="mb-3 col-md-3">
                  <label class="form-label">Pre Trip Start</label>
                  <div class="mt-0">
                    <VueDatePicker v-model="timePreTripStart" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.preTripStart_er" class="text-danger">{{
                    errors.preTripStart_er
                    }}</small>
                </div>



                <div class="mb-3 col-md-3">
                  <label class="form-label">Pre Trip End</label>
                  <div class="mt-0">
                    <VueDatePicker v-model="timePreTripEnd" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.preTripEnd_er" class="text-danger">{{
                    errors.preTripEnd_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Post Trip Start</label>
                  <div class="mt-0">
                    <VueDatePicker v-model="timePostTripStart" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.postTripStart_er" class="text-danger">{{
                    errors.postTripStart_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Post Trip End</label>
                  <div class="mt-0">
                    <VueDatePicker v-model="timePostTripEnd" time-picker placeholder="Select Time">
                      <template #input-icon>
                        <img class="input-slot-image" src="../assets/icons/clock2.png" />
                      </template>
                    </VueDatePicker>
                  </div>
                  <small v-if="errors.postTripEnd_er" class="text-danger">{{
                    errors.postTripEnd_er
                    }}</small>
                </div>



              </div>

              <div class="row">
                <div class="mb-3 col-md-3">
                  <label class="form-label">Truck Start Miles</label>
                  <input type="number" step="any" v-model="truckStartMiles"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.truckStartMiles_er" class="text-danger">{{ errors.truckStartMiles_er }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Truck End Miles</label>
                  <input type="number" step="any" v-model="truckEndMiles"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.truckEndMiles_er" class="text-danger">{{ errors.truckEndMiles_er }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Truck Start Hours</label>
                  <input type="number" step="any" v-model="truckStartHours"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.truckStartHours_er" class="text-danger">{{ errors.truckStartHours_er }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Truck End Hours</label>
                  <input type="number" step="any" v-model="truckEndHours"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.truckEndHours_er" class="text-danger">{{ errors.truckEndHours_er }}</small>
                </div>



              </div>

              <div class="row">
                <div class="mb-3 col-md-3">
                  <label class="form-label">Trailer Start Miles</label>
                  <input type="number" step="any" v-model="trailerStartMiles"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.trailerStartMiles_er" class="text-danger">{{ errors.trailerStartMiles_er
                    }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Trailer End Miles</label>
                  <input type="number" step="any" v-model="trailerEndMiles"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.trailerEndMiles_er" class="text-danger">{{ errors.trailerEndMiles_er }}</small>
                </div>


                <div class="mb-3 col-md-3">
                  <label class="form-label">Fuel</label>
                  <input type="number" step="any" v-model="fuel"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.fuel_er" class="text-danger">{{ errors.fuel_er }}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">DEF</label>
                  <input type="number" step="any" v-model="dieselExhaustFluid"
                    class="form-control form-control-lg border border-primary" style="color: black;" />
                  <small v-if="errors.dieselExhaustFluid_er" class="text-danger">{{ errors.dieselExhaustFluid_er
                    }}</small>
                </div>


              </div>

              <div class="row">
                <div class="mb-3 col-md-12">
                  <label class="form-label">Notes</label>
                  <textarea style="color: black;" v-model="notes" class="form-control border border-primary"></textarea>
                </div>
              </div>

              <button type="submit" class="btn btn-primary">
                Update CoverSheet
              </button>

              <button
                @click.prevent="closeModal"
                style="margin-left: 20px"
                type="submit"
                class="btn btn-danger"
              >
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
                <div
                  class="accordion accordion-primary-solid"
                  id="accordion-two"
                >     
                  <a @click="openAddSpareModal(reactiveProps.item.value)" style="width: auto;" class="btn btn-success shadow btn-sm sharp me-1">
                   Add New Spare +
                   </a>

                   <a @click="openAddDownTimeModal(reactiveProps.item.value)" style="width: auto; margin-left: 10px;" class="btn btn-success shadow btn-sm sharp me-1">
                   Add New DownTime +
                   </a>

                  <a @click="openAddLoadModal(reactiveProps.item.value)" style="width: auto; margin-left: 10px;" class="btn btn-success shadow btn-sm sharp me-1">
                   Add New Load +
                   </a>

                   <hr>
                  <Spinner v-if="isLoadingSpareTruckInfo" />

                  <div v-if="isVisibleSpareTruckInfo" class="accordion-item">
                    <h2 class="accordion-header">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseOne"
                        v-on:click="OcultamosSpareTruckInfo"
                      >
                        Spare Truck Info
                      </button>
                    </h2>

                    <Spinner v-if="storeRoute.loading || storeTruck.loading" />

                    <div
                      id="bordered_collapseOne"
                      class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two"
                    >
                      <div class="accordion-body">

                        <div class="row">
                          <hr style="color: black" />
                          <div class="table-responsive">
                            <table
                              class="table table-bordered header-border table-striped table-hover table-responsive-md"
                            >
                              <thead class="thead-primary text-center">
                                <tr>
                                  <!-- <th style="width:50px;"></th> -->
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
                                <tr
                                  v-for="(item, index) in spareTruckList"
                                  :key="index"
                                >
                                  <!-- <td></td> -->
                                  <td class="td">{{ item.truckNumber }}</td>
                                  <td class="td">{{ item.trailerNumber }}</td>
                                  <td class="td">{{ item.timeLeaveYardSpareTruckInfo }}</td>
                                  <td class="td">{{ item.timeBackInYardSpareTruckInfo }}</td>
                                  <td class="td">{{ item.fuelSpareTruckInfo }}</td>
                                  <td class="td">{{ item.dieselExhaustFluidSpareTruckInfo }}</td>
                                  <td>
                                    <div style="text-align: center;">
                                      <a
                                        @click="EditSpareTruckInfo(item)"
                                        class="btn btn-primary shadow btn-xs sharp me-1"
                                        ><i class="fa fa-sign-in"></i
                                      ></a>
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

                        <hr style="color: blue" />

                        <div v-if="visibleDetailSpareTruckInfo">


                        <div style="background-color: #cdc2f5" class="row">



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

                        <div style="background-color: #cdc2f5" class="row">

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

                        <div style="background-color: #cdc2f5" class="row">

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
                            <button
                              :disabled="isLoadingSpareTruckInfo"
                              style="margin-bottom: -5px !important"
                              @click="HandleSpareTruckInfo"
                              type="button"
                              class="btn btn-info"
                            >
                              Update
                              <span class="btn-icon-end">
                                <i class="fa fa-save"></i>
                              </span>
                            </button>
                          </div>


                        </div>

      
                        </div>

                      </div>
                    </div>
                  </div>



                  <Spinner v-if="isLoadingDowntime" />
                  <div v-if="isVisibleDowntime" class="accordion-item">
                    <h2 class="accordion-header">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseTwo"
                        v-on:click="OcultamosDowntime"
                      >
                        Downtime
                      </button>
                    </h2>
                    <div
                      id="bordered_collapseTwo"
                      class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two"
                    >
                      <div class="accordion-body">

                        <div class="row">
                          <hr style="color: black" />
                          <div class="table-responsive">
                            <table
                              class="table table-bordered header-border table-striped table-hover table-responsive-md"
                            >
                              <thead class="thead-primary text-center">
                                <tr>
                                  <th>Truck #</th>
                                  <th>Truck Downtime Start</th>
                                  <th>Truck Downtime End</th>
                                  <th>Trailer #</th>
                                  <th>Trailer Downtime Start</th>
                                  <th>Trailer Downtime End</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(item, index) in downtimeList"
                                  :key="index"
                                >
                                  <td class="td">{{ item.truckNumber }}</td>
                                  <td class="td">{{ item.truckDownTimeStartDownTime }}</td>
                                  <td class="td">{{ item.truckDownTimeEndDownTime }}</td>
                                  <td class="td">{{ item.trailerNumber }}</td>
                                  <td class="td">{{ item.trailerDownTimeStartDownTime }}</td>
                                  <td class="td">{{ item.trailerDownTimeEndDownTime }}</td>
                                  <td>
                                    <div style="text-align: center;">
                                      <a
                                        @click="EditDowntime(item)"
                                        class="btn btn-primary shadow btn-xs sharp me-1"
                                        ><i class="fa fa-sign-in"></i
                                      ></a>
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

                        <hr style="color: blue" />

                        <div v-if="visibleDetailDowntime">

                  <div style="background-color: #cdc2f5" class="row">

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
                              label="typeDownTimeName" class="form-control p-0"
                               />
                            <small v-if="errorsDowntime.selectedTypeTruckDownTime_er" class="text-danger">{{
                              errorsDowntime.selectedTypeTruckDownTime_er }}</small>
                          </div>


                        </div>

                        <div style="background-color: #cdc2f5" class="row">
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
                              label="typeDownTimeName" class="form-control p-0"
                               />
                            <small v-if="errorsDowntime.selectedTypeTrailerDownTime_er" class="text-danger">{{
                              errorsDowntime.selectedTypeTrailerDownTime_er }}</small>
                          </div>


                        </div>

                        <div style="background-color: #cdc2f5" class="row">

                          <div class="mb-3 col-md-9">
                            <label class="form-label">Downtime Reason</label>
                            <input type="text" v-model="downTimeReasonDownTime"
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsDowntime.downTimeReasonDownTime_er" class="text-danger">{{
                              errorsDowntime.downTimeReasonDownTime_er }}</small>
                          </div>

                           <div class="mb-4 col-md-3 align-self-end">
                            <button
                              :disabled="isLoadingDowntime"
                              style="margin-bottom: -7px !important"
                              @click="HandleDowntime"
                              type="button"
                              class="btn btn-info"
                            >
                              Update
                              <span class="btn-icon-end">
                                <i class="fa fa-save"></i>
                              </span>
                            </button>
                          </div>





                        </div>

                        </div>

                      </div>
                    </div>
                  </div>

                  <Spinner v-if="isLoadingLoad" />
              


                  

                  <div v-if="isVisibleLoad" class="accordion-item">
                    <h2 class="accordion-header">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#bordered_collapseThree"
                        v-on:click="OcultamosLoad"
                      >
                        Load
                      </button>
                    </h2>
                    <div
                      id="bordered_collapseThree"
                      class="accordion-collapse collapse"
                      data-bs-parent="#accordion-two"
                    >
                      <div class="accordion-body">
                        <div class="row">
                          <hr style="color: black" />
                          <div class="table-responsive">
                            <table
                              class="table table-bordered header-border table-striped table-hover table-responsive-md"
                            >
                              <thead class="thead-primary text-center">
                                <tr>
                                  <th>Source</th>
                                  <th>Destination</th>
                                  <th>Material</th>
                                  <th>Tunnel Time In</th>
                                  <th>Tunnel Time Out</th>
                                  <th>Operator</th>
                                  <th>Ticket #</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr
                                  v-for="(item, index) in loadList"
                                  :key="index"
                                >
                                  <td class="td">{{ item.sourceName }}</td>
                                  <td class="td">{{ item.destinationName }}</td>
                                  <td class="td">{{ item.materialName }}</td>
                                  <td class="td">{{ item.tunnelTimeInLoad }}</td>
                                  <td class="td">{{ item.tunnelTimeOutLoad }}</td>
                                  <td class="td">{{ item.operatorName }}</td>
                                  <td class="td">{{ item.ticketNumberLoad }}</td>
                                  <td>
                                    <div style="text-align: center;">
                                      <a
                                        @click="EditLoad(item)"
                                        class="btn btn-primary shadow btn-xs sharp me-1"
                                        ><i class="fa fa-sign-in"></i
                                      ></a>
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

                        <hr style="color: blue" />

                        <div v-if="visibleDetailLoad">

                    <!-- ✅ CONTENEDOR CON BACKGROUND UNIFICADO -->
                    <div style="background-color: #cdc2f5; padding: 15px; border-radius: 5px;">

                    <!-- ✅ CHECKBOXES: Preloaded y Preload for next day -->
                    <div class="row mb-3">
                      <div class="col-md-12">
                        <div class="form-check form-check-inline">
                          <label class="form-check-label" style="color: black; font-weight: 500;">
                            <input 
                              type="checkbox" 
                              class="form-check-input" 
                              v-model="preloadedLoad"
                            > 
                            Preloaded
                          </label>
                        </div>
                        <div class="form-check form-check-inline">
                          <label class="form-check-label" style="color: black; font-weight: 500;">
                            <input 
                              type="checkbox" 
                              class="form-check-input" 
                              v-model="preloadedNextDayLoad"
                            > 
                            Preload for next day
                          </label>
                        </div>
                      </div>
                    </div>

                    <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tunnel Time In</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="tunnelTimeInLoad" :disabled="preloadedLoad" time-picker placeholder="Select Time">
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
                              <VueDatePicker v-model="tunnelTimeOutLoad" :disabled="preloadedLoad" time-picker placeholder="Select Time">
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
                              <VueDatePicker v-model="leaveYardLoad" :disabled="preloadedNextDayLoad" time-picker placeholder="Select Time">
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
                            <v-select :options="storeOperator.operators" v-model="selectedOperatorLoad" :disabled="preloadedLoad"
                              placeholder="Choose your Operator" :reduce="(operator) => operator.id"
                              label="operatorName" class="form-control p-0"
                               />
                            <small v-if="errorsLoad.selectedOperatorLoad_er" class="text-danger">{{
                              errorsLoad.selectedOperatorLoad_er }}</small>
                          </div>

                        </div>
                        <div class="row">

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Source</label>
                            <v-select :options="storeSource.sources" v-model="selectedSourceLoad"
                              placeholder="Choose your Source" :reduce="(source) => source.id" label="sourceName"
                              class="form-control p-0"
                               />
                            <small v-if="errorsLoad.selectedSourceLoad_er" class="text-danger">{{
                              errorsLoad.selectedSourceLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Destination</label>
                            <v-select :options="storeDestination.destinations" :disabled="preloadedNextDayLoad" v-model="selectedDestinationLoad"
                              placeholder="Choose your Destination" :reduce="(destination) => destination.id"
                              label="destinationName" class="form-control p-0"
                               />
                            <small v-if="errorsLoad.selectedDestinationLoad_er" class="text-danger">{{
                              errorsLoad.selectedDestinationLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Material</label>
                            <v-select :options="storeMaterial.materials" v-model="selectedMaterialLoad"
                              placeholder="Choose your Material" :reduce="(material) => material.id"
                              label="materialName" class="form-control p-0"
                               />
                            <small v-if="errorsLoad.selectedMaterialLoad_er" class="text-danger">{{
                              errorsLoad.selectedMaterialLoad_er }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Destination Time In</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="timeInLoad" :disabled="preloadedNextDayLoad" time-picker placeholder="Select Time">
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
                              <VueDatePicker v-model="timeOutLoad" :disabled="preloadedNextDayLoad" time-picker placeholder="Select Time">
                                <template #input-icon>
                                  <img class="input-slot-image" src="../assets/icons/clock2.png" />
                                </template>
                              </VueDatePicker>
                            </div>
                            <small v-if="errorsLoad.timeOutLoad_er" class="text-danger">{{ errorsLoad.timeOutLoad_er
                              }}</small>
                          </div>


                        </div>

                        <div style="background-color: #cdc2f5" class="row">

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
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsLoad.grossWeightLoad_er" class="text-danger">{{
                              errorsLoad.grossWeightLoad_er
                              }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tare Weight</label>
                            <input type="number" step="any" v-model="tareWeightLoad" :disabled="preloadedNextDayLoad"
                              class="form-control form-control-sm border border-primary" />
                            <small v-if="errorsLoad.tareWeightLoad_er" class="text-danger">{{
                              errorsLoad.tareWeightLoad_er
                              }}</small>
                          </div>


                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tons</label>
                            <input type="number" step="any" v-model="calculatedTons" disabled readonly
                              class="form-control form-control-sm border border-primary calculated-field" 
                              :class="{ 'border-danger': tonsError }" />
                            <small v-if="tonsError" class="text-danger">{{ tonsError }}</small>
                          </div>

                          <div class="mb-3 col-md-2">
                            <label class="form-label">Return To Yard</label>
                            <div class="mt-0">
                              <VueDatePicker v-model="backYardLoad" :disabled="preloadedNextDayLoad" time-picker placeholder="Select Time">
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
                            <!-- <label class="form-label">Images</label> -->

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

                            <small v-if="errorsLoad.imagesLoad_er" class="text-danger">{{ errorsLoad.imagesLoad_er
                              }}</small>
                          </div>


                          <!-- <div style="margin-bottom: -10px !important;" class="mb-0 col-md-3 d-flex">
                            <button :disabled="isLoadingLoad" @click="HandleLoad" type="button" class="btn btn-info"
                              style="height: 38px; padding: 0.375rem 0.75rem;">
                              {{ isEditingLoad ? "Save" : "Add" }}
                              <span class="btn-icon-end">
                                <i :class="isEditingLoad ? 'fa fa-save' : 'fa fa-plus'"></i>
                              </span>
                            </button>
                          </div> -->



                        </div>


                        <div style="background-color: #cdc2f5" class="row">
                          <div class="mb-3 col-md-9">
                            <label class="form-label">Note</label>
                            <input
                              type="text"
                              v-model="noteLoad"
                              class="form-control form-control-sm border border-primary"
                            />
                            <small
                              v-if="errorsLoad.noteLoad_er"
                              class="text-danger"
                              >{{ errorsLoad.noteLoad_er }}</small
                            >
                          </div>

                          <div class="mb-3 col-md-3">
                            <button
                              :disabled="isLoadingLoad"
                              @click="HandleLoad"
                              type="button"
                              class="btn btn-info"
                              style="
                                height: 38px;
                                margin-top: 28px;
                                padding: 0.375rem 0.75rem;
                              "
                            >
                              Update
                              <span class="btn-icon-end">
                                <i class="fa fa-save"></i>
                              </span>
                            </button>
                          </div>

                          <div
                            v-if="
                              selectedLoadData &&
                              selectedLoadData.images &&
                              selectedLoadData.images.length > 0
                            "
                            class="row mt-3"
                          >
                            <h6>Image Previews:</h6>
                            <div class="col-md-12">
                              <div class="d-flex flex-wrap">
                                <img
                                  v-for="(
                                    image, index
                                  ) in selectedLoadData.images"
                                  :key="index"
                                  :src="
                                    'https://backend-fastapi-airc-coversheet-staging.onrender.com/' +
                                    image
                                  "
                                  style="
                                    max-width: 100px;
                                    margin: 10px;
                                    cursor: pointer;
                                  "
                                  @click="downloadImage(image)"
                                />
                              </div>
                            </div>
                          </div>
                          <!-- <div v-else class="row mt-3">
                  <p>No images available</p>
                </div> -->
                        </div>


                        








                    </div>
                    <!-- ✅ FIN DEL CONTENEDOR CON BACKGROUND -->

                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>




          <!-- <button
            @click.prevent="closeModal"
            style="margin-left: 20px"
            type="submit"
            class="btn btn-danger"
          >
            Cancel
          </button> -->


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