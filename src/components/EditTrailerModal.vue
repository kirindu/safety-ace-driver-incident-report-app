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
import TrailerAPI from "@/api/TrailerAPI";

// Import composables
import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

// Importamos Stores
import { useRoutesStore } from "@/stores/typeIncidents.js";
const storeRoute = useRoutesStore();

import { useLandFillsStore } from "@/stores/directions";
const storeLandFill = useLandFillsStore();

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

// Trailer
const trailerNumber = ref("");


const errorsTrailer = ref({
  trailerNumber_er: "",
});



// Handle form for adding a new route
const onSubmit = async (event) => {
  event.preventDefault();
  formSubmitted.value = true;

  // Limpiar errores anteriores
  errorsTrailer.value.trailerNumber_er = "";

  let hasError = false;

  if (!trailerNumber.value) {
    errorsTrailer.value.trailerNumber_er = "Required field";
    hasError = true;
  }



  if (hasError) {
    return;
  }

  const trailerData = {
    trailerNumber: trailerNumber.value,
    active: true, // Assuming you want to set the route as active by default
  };


  try {
      
    let trailer_id =  props.item.id ?? null;
    const response = await TrailerAPI.edit(trailer_id, trailerData);

    if (response.data.ok) {
      showSweetAlert({
        title: "Trailer edited successfully!",
        icon: "success",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      }).then(() => {
        props.onUpdateSuccess();
        closeModal(); // Close the modal after successful addition
        router.go(); // Recarga la página para reflejar los cambios
       
        return; 
      });
    } else {
      showSweetAlert({
        title: "Error editing Trailer!",
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
      title: "Error editing Trck!",
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

  if (props.item) {
    trailerNumber.value = props.item.trailerNumber;
  } else {
    trailerNumber.value = "";
  }
  

  const storedUser = localStorage.getItem("USER-SAFETY-ACE");

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      user.value = parsed.data.user || parsed.data; // ADMIN or DRIVER
    } catch (e) {
      console.error("Error al parsear USER desde localStorage:", e);
    }
  }


});



// Utility functions

</script>

<template>
  <div class="container-fluid">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-header">
        Edit Route
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
                  <label class="form-label">Trailer Number</label>
                  <input
                    type="text"
                    v-model="trailerNumber"
                    class="form-control form-control-sm border border-primary"
                  />
                  <small v-if="errorsTrailer.trailerNumber_er" class="text-danger">{{errorsTrailer.trailerNumber_er}}</small>
                </div>

                <!-- <div class="mb-3 col-md-3">
                  <label class="form-label">Lob</label>
                  <input
                    type="text"
                    v-model="lob"
                    class="form-control form-control-sm border border-primary"
                  />
                  <small v-if="errorsRoute.lob_er" class="text-danger">{{errorsRoute.lob_er}}</small>
                </div> -->

              </div>


              <button type="submit" class="btn btn-primary">
                Update Trailer
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
