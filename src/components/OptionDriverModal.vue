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
import { useRoutesStore } from "@/stores/typeIncidents.js";
const storeRoute = useRoutesStore();

import { useLandFillsStore } from "@/stores/directions";
const storeLandFill = useLandFillsStore();

import { useTrucksStore } from "@/stores/trucks.js";
const storeTruck = useTrucksStore();

import { useDriversStore } from "@/stores/employees.js";
import { is } from "@vee-validate/rules";
import DriverAPI from "@/api/Actors/EmployeeAPI";

const user = ref(null);

const formSubmitted = ref(false);





// Driver
const driverName = ref("");
const driverEmail = ref("");
const driverPassword = ref("");

const errorsDriver = ref({
  name_er: "",
  email_er: "",
  password_er: "",
});


// Handle form for adding a new driver
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmitted.value = true;

  // Limpiar errores anteriores

  errorsDriver.value.name_er = "";
  errorsDriver.value.email_er = ""; 
  errorsDriver.value.password_er = "";

  let hasError = false;

  if (!driverName.value) {
    errorsDriver.value.name_er = "Required field";
    hasError = true;
  } 
  
  // else {
  //   errorsDriver.value.name_er = "";
  // }

  if (!driverEmail.value) {
    errorsDriver.value.email_er = "Required field";
    hasError = true;
  } 
  

  if (!driverPassword.value) {
    errorsDriver.value.password_er = "Required field";
    hasError = true;
  } else if (driverPassword.value.length < 6) {
    errorsDriver.value.password_er = "Password must be at least 6 characters";
    hasError = true;
  } 
  

  if (hasError) {
    return;
  }

  const driverData = {
    name: driverName.value,
    email: driverEmail.value,
    password: driverPassword.value,
  };


  try {

    const response = await DriverAPI.add(driverData);

    if (response.data.ok) {
      showSweetAlert({
        title: "Driver added successfully!",
        icon: "success",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        closeModal(); // Close the modal after successful addition
        router.go(); // Recarga la página para reflejar los cambios
      });
    } else {
      showSweetAlert({
        title: "Error adding Driver!",
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
      title: "Error adding Driver!",
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

  // Recuperamos el usuario
const storedUser = localStorage.getItem("USER-SAFETY-ACE");

if (storedUser) {
  try {
    const parsed = JSON.parse(storedUser);

    if (parsed.data.user) {
      user.value = parsed.data.user; // ADMIN
    } else {
      user.value = parsed.data; // DRIVER
    }
  } catch (e) {
    console.error("Error al parsear USER desde localStorage:", e);
  }
}

if(user.value){

  if(user.value.rol === "Admin"){
    router.push({ name: 'dashboard-admin' }); // Redirigir al dashboard de Admin
  }

}



});





</script>

<template>
  <div class="container-fluid">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header">
        Add Driver
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
                  <label class="form-label">Name</label>
                  <input
                    type="text"
                    v-model="driverName"
                    class="form-control form-control-sm border border-primary"
                  />
                  <small v-if="errorsDriver.name_er" class="text-danger">{{errorsDriver.name_er}}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    v-model="driverEmail"
                    class="form-control form-control-sm border border-primary"
                  />
                  <small v-if="errorsDriver.email_er" class="text-danger">{{errorsDriver.email_er}}</small>
                </div>

                <div class="mb-3 col-md-3">
                  <label class="form-label">Password</label>
                  <input
                    type="password"
                    v-model="driverPassword"
                    class="form-control form-control-sm border border-primary"
                  />
                  <small v-if="errorsDriver.password_er" class="text-danger">{{errorsDriver.password_er}}</small>
                </div>
              </div>


              <button type="submit" class="btn btn-primary">
                Add Driver
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
</style>
