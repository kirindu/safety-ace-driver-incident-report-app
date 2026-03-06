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

// Spare Truck Info

const spareTruckList = ref([]);
const isEditingSpareTruckInfo = ref(false); // To track if we are editing a spare truck record
const selectedSpareTruckId = ref(null); // To store the ID of the spare truck being edited

// const selectedHomeBaseSpareTruckInfo = ref("");
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

// Handle form for adding a new driver
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmitted.value = true;

};

// Una vez que se complete el mounted pintamos los campos con su informacion
onMounted(async () => {

});


// Handle form submission Spare Truck Info (Add or Edit)
const HandleSpareTruckInfo = async (event) => {
  event.preventDefault();
  formSubmittedSpareTruckInfo.value = true;

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



  if (hasError) {
    return;
  }

  let coversheet_id = reactiveProps.item.value.id

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

    coversheet_id: coversheet_id,

  };

  try {

      // Add new Spare Truck Info
      isLoadingSpareTruckInfo.value = true; // Show loading spinner
      const response = await SpareTruckInfoAPI.add(spareTruckInfo);

      if (response.data.ok) {
        showSweetAlert({
          title: "Spare Truck Info saved successfully!",
          icon: "success",
          showDenyButton: false,
          showCancelButton: false,
          confirmButtonText: "Ok",
          allowOutsideClick: false,
        }).then(() => {
          isLoadingSpareTruckInfo.value = false; // Hide loading spinner    
          props.onUpdateSuccess();
          closeModal(); 
        });
      } else {
        showSweetAlert({
          title: "Error saving Spare Truck Info!",
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
      title: isEditingSpareTruckInfo.value
        ? "Error updating Spare Truck Info!"
        : "Error saving Spare Truck Info!",
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
     <!-- <Spinner v-if="isLoadingSpareTruckInfo" /> -->
  <div class="container-fluid">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header">
        Spare
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

                            <!-- <small v-if="errorsSpareTruckInfo.spareTruckSpareTruckInfo_er" class="text-danger">{{
                            errorsSpareTruckInfo.spareTruckSpareTruckInfo_er
                            }}</small> -->

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
                     <button :disabled="isLoadingSpareTruckInfo" 
                              @click="HandleSpareTruckInfo" type="button" class="btn btn-info">
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