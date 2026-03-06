<script setup>
//Importaciones de sistemas y librerias
import { ref, toRefs, computed, watch, onMounted, defineEmits } from "vue";
import { closeModal, confirmModal } from "@kolirt/vue-modal";
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
import CoverSheetAPI from "@/api/Sections/GeneralInformationAPI.js";
import SpareTruckInfoAPI from "@/api/Sections/SupervisorNoteAPI";
import DowntimeAPI from "@/api/Sections/DuringTheIncidentAPI";
import LoadAPI from "@/api/Sections/IncidentDetailAPI";

// Import composables
import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

// Importamos Stores
import { useRoutesStore } from "@/stores/routes.js";
const storeRoute = useRoutesStore();

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



import { useDriversStore } from "@/stores/drivers.js";
import { is } from "@vee-validate/rules";
import DriverAPI from "@/api/Actors/EmployeeAPI";

const user = ref(null);

const formSubmitted = ref(false);

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





// Handle form for adding a new driver
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmitted.value = true;

};

// Una vez que se complete el mounted pintamos los campos con su informacion
onMounted(async () => {

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
const noteLoad = ref(""); // Se tiene que pasar como note en el formdata
const preloadedLoad = ref(false); // Lo Inicializamos en false
const preloadedNextDayLoad = ref(false); // Lo Inicializamos en false

// const selectedHomeBaseLoad = ref("");
const selectedOperatorLoad = ref("");
const selectedSourceLoad = ref("");
const selectedDestinationLoad = ref("");
const selectedMaterialLoad = ref("");

const isLoadingLoad = ref(false); // To show loading spinner when fetching load info
const formSubmittedLoad = ref(false); // To track if Load form has been submitted



// Agregar después de las declaraciones de preloadedLoad y preloadedNextDayLoad

// Watch para preloadedLoad
watch(preloadedLoad, (newValue) => {
  if (newValue && preloadedNextDayLoad.value) {
    preloadedNextDayLoad.value = false;
  }
});

// Watch para preloadedNextDayLoad
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
    leaveYardLoad.value = "";
    selectedSourceLoad.value = "";
    selectedDestinationLoad.value = "";
    selectedMaterialLoad.value = "";
    timeInLoad.value = "";
    timeOutLoad.value = "";
    ticketNumberLoad.value = "";
    grossWeightLoad.value = "";
    tareWeightLoad.value = "";
    tonsLoad.value = "";
    backYardLoad.value = "";

  }
});



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
  // selectedHomeBaseLoad_er: "",
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

  if (grossWeightLoad.value && tareWeightLoad.value && !isNaN(gross) && !isNaN(tare)) {
    if (gross < tare) {
      return "Gross Weight must be ≥ Tare Weight";
    }
  }
  return "";
});

// Computed property para filtrar materiales basado en el source seleccionado
const filteredMaterials = computed(() => {
  // Obtener el source seleccionado
  const selectedSource = storeSource.sources.find(
    source => source.id === selectedSourceLoad.value
  );
  
  // Si no hay source seleccionado, retornar todos los materiales menos CONTAMINATED
  if (!selectedSource) {
    return storeMaterial.materials.filter(
      material => material.materialName !== "CONTAMINATED"
    );
  }
  
  const sourceName = selectedSource.sourceName;
  
  // Si el source es RMR, RMR-S o RMR-N, mostrar todos los materiales incluyendo CONTAMINATED
  if (sourceName === "RMR" || sourceName === "RMR-S" || sourceName === "RMR-N") {
    return storeMaterial.materials;
  }
  
  // Para otros sources, filtrar CONTAMINATED
  return storeMaterial.materials.filter(
    material => material.materialName !== "CONTAMINATED"
  );
});

// Watch para limpiar Material cuando Source cambia
watch(selectedSourceLoad, (newSourceId, oldSourceId) => {
  // Solo limpiar si ya había un source seleccionado anteriormente
  if (!oldSourceId) return;
  
  // Obtener los nombres de los sources
  const newSource = storeSource.sources.find(source => source.id === newSourceId);
  const oldSource = storeSource.sources.find(source => source.id === oldSourceId);
  
  if (!newSource || !oldSource) return;
  
  const oldSourceName = oldSource.sourceName;
  const newSourceName = newSource.sourceName;
  
  // Si el source antiguo era RMR, RMR-S o RMR-N
  const wasRMR = oldSourceName === "RMR" || oldSourceName === "RMR-S" || oldSourceName === "RMR-N";
  // Y el nuevo source NO es RMR, RMR-S o RMR-N
  const isRMR = newSourceName === "RMR" || newSourceName === "RMR-S" || newSourceName === "RMR-N";
  
  // Si se cambia de RMR a no-RMR, verificar si el material seleccionado es CONTAMINATED
  if (wasRMR && !isRMR && selectedMaterialLoad.value) {
    const selectedMaterial = storeMaterial.materials.find(
      material => material.id === selectedMaterialLoad.value
    );
    
    if (selectedMaterial && selectedMaterial.materialName === "CONTAMINATED") {
      // Limpiar el material si era CONTAMINATED
      selectedMaterialLoad.value = "";
    }
  }
});



// Handle form submission for Load
const HandleLoad = async (event) => {
  event.preventDefault();
  formSubmittedLoad.value = true;

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
  // errorsLoad.value.selectedHomeBaseLoad_er = "";
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

  if (hasError) {
    return;
  }

  let coversheet_id = reactiveProps.item.value.id;

  // Create a new FormData object
  const formData = new FormData();

  // Add form fields to FormData

  // if (selectedHomeBaseLoad.value) formData.append("homebase_id", selectedHomeBaseLoad.value);
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

  formData.append("coversheet_id", coversheet_id);

  // Append all selected files to FormData
  selectedFiles.value.forEach((file, index) => {
    formData.append("images", file, file.name); // Use "images" as the key
  });

  try {

      isLoadingLoad.value = true;
      const response = await LoadAPI.add(formData);

      if (response.data.ok) {
        showSweetAlert({
          title: "Load saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingLoad.value = false;
          props.onUpdateSuccess();
          closeModal(); 
        });
      } else {
        showSweetAlert({
          title: "Error saving Load!",
          text: response.data.msg,
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
      title: isEditingLoad.value ? "Error updating Load!" : "Error saving Load!",
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

const formatTime = (controlTimeValue) => {
  if (!controlTimeValue) {
    return "";
  }

  const hours = String(controlTimeValue.hours).padStart(2, "0");
  const minutes = String(controlTimeValue.minutes).padStart(2, "0");
  return `${hours}:${minutes}`;
};



// Handle file selection and preview
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
  <!-- <Spinner v-if="isLoadingDowntime" /> -->
  <div class="container-fluid">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header">
        Load
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

                          <!-- ✅ GROSS WEIGHT -->
                          <div class="mb-3 col-md-2">
                            <label class="form-label">Gross Weight</label>
                            <input type="number" step="any" v-model="grossWeightLoad" :disabled="preloadedNextDayLoad"
                              class="form-control form-control-sm border border-primary"
                              :class="{ 'border-danger': tonsError }" />
                            <small v-if="errorsLoad.grossWeightLoad_er" class="text-danger">
                              {{ errorsLoad.grossWeightLoad_er }}
                            </small>
                          </div>

                          <!-- ✅ TARE WEIGHT -->
                          <div class="mb-3 col-md-2">
                            <label class="form-label">Tare Weight</label>
                            <input type="number" step="any" v-model="tareWeightLoad" :disabled="preloadedNextDayLoad"
                              class="form-control form-control-sm border border-primary"
                              :class="{ 'border-danger': tonsError }" />
                            <small v-if="errorsLoad.tareWeightLoad_er" class="text-danger">
                              {{ errorsLoad.tareWeightLoad_er }}
                            </small>
                          </div>

                          <!-- ✅ TONS - CALCULADO Y BLOQUEADO -->
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
                            <!-- <button
            v-if="selectedImages.length > 0"
            @click.prevent="fileInput.click()"
            class="btn btn-secondary"
            style="height: 38px; margin-left: 10px;"
          >
            Capture Another
          </button> -->
                            <small v-if="errorsLoad.imagesLoad_er" class="text-danger">{{ errorsLoad.imagesLoad_er
                              }}</small>
                          </div>


                          <div style="margin-bottom: -10px !important;" class="mb-0 col-md-3 d-flex">
                            <button :disabled="isLoadingLoad" @click="HandleLoad" type="button" class="btn btn-info"
                              style="height: 38px; padding: 0.375rem 0.75rem;">
                              Add
                              <span class="btn-icon-end">
                                <i class="fa fa-plus"></i>
                              </span>
                            </button>

                                    <button
                @click.prevent="closeModal"
                style="margin-left: 20px"
                type="submit"
                class="btn btn-danger"
              >
                Close
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
</style>