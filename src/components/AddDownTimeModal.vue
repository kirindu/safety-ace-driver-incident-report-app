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

// Handle form for adding a new driver
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmitted.value = true;

};

// Una vez que se complete el mounted pintamos los campos con su informacion
onMounted(async () => {

});


// Handle form submission Downtime
const HandleDowntime = async (event) => {
  event.preventDefault();
  formSubmittedDowntime.value = true;

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


  if (hasError) {
    return;
  }

  let coversheet_id = JSON.parse(localStorage.getItem("COVERSHEET"))?.id || null;

  const downtime = {
    truck_id: selectedTruckDownTime.value,
    trailer_id: selectedTrailerDownTime.value,
    typeTruckDownTime_id: selectedTypeTruckDownTime.value || "",
    typeTrailerDownTime_id: selectedTypeTrailerDownTime.value || "",

    truckDownTimeStartDownTime: formatTime(truckDownTimeStartDownTime.value) || "",
    truckDownTimeEndDownTime: formatTime(truckDownTimeEndDownTime.value) || "",
    trailerDownTimeStartDownTime: formatTime(trailerDownTimeStartDownTime.value) || "",
    trailerDownTimeEndDownTime: formatTime(trailerDownTimeEndDownTime.value) || "",
    downTimeReasonDownTime: downTimeReasonDownTime.value || "",

    coversheet_id: reactiveProps.item.value.id,
  };

  try {
      // Add new Downtime
      isLoadingDowntime.value = true; // Show loading spinner
      const response = await DowntimeAPI.add(downtime);

      if (response.data.ok) {
        showSweetAlert({
          title: "Downtime saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingDowntime.value = false; // Hide loading spinner
          props.onUpdateSuccess();
          closeModal(); 
        });
      } else {
        showSweetAlert({
          title: "Error saving Downtime!",
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
      title: isEditingDowntime.value ? "Error updating Downtime!" : "Error saving Downtime!",
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


const formatTime = (controlTimeValue) => {
  if (!controlTimeValue) {
    return "";
  }

  const hours = String(controlTimeValue.hours).padStart(2, "0");
  const minutes = String(controlTimeValue.minutes).padStart(2, "0");
  return `${hours}:${minutes}`;
};


</script>

<template>
  <!-- <Spinner v-if="isLoadingDowntime" /> -->
  <div class="container-fluid">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header">
        DownTime
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
                              label="typeDownTimeName" class="form-control p-0"
                               />
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
                            <button
                              :disabled="isLoadingDowntime"
                              @click="HandleDowntime"
                              type="button"
                              class="btn btn-info"
                            >
                              Add
                              <span class="btn-icon-end">
                                <i class="fa fa-add"></i>
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