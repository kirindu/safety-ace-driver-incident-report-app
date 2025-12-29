<script setup>
import { ref, onMounted } from "vue";
import { defineAsyncComponent } from "vue";

import { useRouter } from "vue-router"; // Importamos useRouter para manejar la redirección
const router = useRouter(); // Instanciamos el router

// Importamos utilidades
import { DateTime } from "luxon";
import { openModal } from "@kolirt/vue-modal";
import { ModalTarget } from "@kolirt/vue-modal";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// Importamos el api
import TrailerAPI from "@/api/TrailerAPI";

// Import composables
import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

// Importamos componentes
import Spinner from "@/components/Spinner.vue";
import CoverSheetModal from "@/components/CoverSheetModal.vue";

// Importamos Stores

import { useTrailersStore } from "@/stores/trailers.js";
const storeTrailer = useTrailersStore();

import { useDriversStore } from "@/stores/drivers.js";

const storeDriver = useDriversStore();

const user = ref(null);

// Recuperamos el usuario
const storedUser = localStorage.getItem("USER");

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

const selectedTrailer = ref("");
const trailerList = ref([]);

const formSubmitted = ref(false);

const SearchTrailer = async (event) => {
  if (event) {
    event.preventDefault();
  }

  try {
    if (selectedTrailer.value) {
      trailerList.value = storeTrailer.trailers.filter(
        (c) => c.id === selectedTrailer.value
      );
    } else {
      trailerList.value = storeTrailer.trailers;
    }
  } catch (error) {
    console.error("Error al obtener los trailers:", error);
  }
};

const openNewTrailerModal = async () => {
  await openModal(
    defineAsyncComponent(() => import("@/components/AddTrailerModal.vue")),
    {
      // item: item,
    }
  )
    // runs when modal is closed via confirmModal
    .then((data) => {
      console.log("success", data);
    })
    // runs when modal is closed via closeModal or esc
    .catch(() => {
      console.log("catch");
    });
};

const editTrailer = async (item) => {
  await openModal(
    defineAsyncComponent(() => import("@/components/EditTrailerModal.vue")),
    {
      item: item,
      onUpdateSuccess: SearchTrailer, // Pass the function
    }
  )
    // runs when modal is closed via confirmModal
    .then((data) => {
      console.log("success", data);
    })
    // runs when modal is closed via closeModal or esc
    .catch(() => {
      console.log("catch");
    });
};

const deleteTrailer = async (item) => {
  showSweetAlert({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    allowOutsideClick: false,
  }).then(async () => {
    if (alertResult.value.isConfirmed) {
      try {
        const { data } = await TrailerAPI.delete(item.id);
        if (data.ok) {
          showSweetAlert({
            title: "Deleted!",
            text: "Trailer has been deleted.",
            icon: "success",
            showCloseButton: true,
            allowOutsideClick: false,
          }).then(() => {
            router.go(); // recarga la página para reflejar los cambios
          });
        } else {
          await showSweetAlert({
            title: "Trailer hasn't been deleted!",
            text: data.msg,
            icon: "warning",
            showCloseButton: true,
            allowOutsideClick: false,
          }).then(() => {
            router.go(); // recarga la página para reflejar los cambios
          });
        }
      } catch (error) {
        console.error("Error deleting trailer:", error);
        showSweetAlert({
          title: "Error deleting trailer!",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    }
  });
};
onMounted(() => {
  if (!sessionStorage.getItem("page_reloaded")) {
    sessionStorage.setItem("page_reloaded", "true");
    window.location.reload();
  } else {
    sessionStorage.removeItem("page_reloaded"); // limpia para futuras visitas
  }

  setTimeout(() => {
    SearchTrailer();
  }, 1000);
});
</script>

<template>
  <!-- row -->
  <div class="container-fluid">
    <div class="page-titles">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">
          <a href="javascript:void(0)"></a>
        </li>
      </ol>
    </div>

    <Spinner v-if="storeDriver.loading" />

    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">
            <div class="row">
              <div class="mb-3 col-md-3">
                <label class="form-label">Trucks</label>
                <v-select
                  :options="storeTrailer.trailers"
                  v-model="selectedTrailer"
                  placeholder="Choose Trailer"
                  :reduce="(trailer) => trailer.id"
                  label="trailerNumber"
                  class="form-control p-0"
                  :class="{ 'is-invalid': formSubmitted && !selectedTruck }"
                />
              </div>
            </div>

            <button
              style="margin-bottom: -5px !important"
              @click="SearchTrailer"
              type="button"
              class="btn btn-info"
            >
              Search Trailer
              <span class="btn-icon-end">
                <i class="fa fa-search"></i>
              </span>
            </button>

            <button
              style="margin-bottom: -5px !important; margin-left: 15px"
              @click="openNewTrailerModal"
              type="button"
              class="btn btn-primary"
            >
              Add Trailer
              <span class="btn-icon-end">
                <i class="fa fa-add"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">
            <div class="row">
             <div style="text-align: end; color:blueviolet">{{trailerList.length}} rows</div>
              <hr style="color: black" />
              <div class="table-responsive">
                <table
                  class="table table-bordered header-border table-striped table-hover table-responsive-md"
                >
                  <thead class="thead-primary">
                    <tr>
                      <th style="text-align: center">Trailer Number</th>
                      <th style="text-align: center !important">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in trailerList" :key="index">
                      <td class="td">{{ item.trailerNumber }}</td>
                      <td>
                        <div class="d-flex gap-1">
                          <a
                            @click="editTrailer(item)"
                            class="btn btn-warning shadow btn-xs sharp"
                            ><i class="fa fa-edit"></i
                          ></a>
                          <a
                            @click="deleteTrailer(item)"
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
  </div>
  <ModalTarget />
</template>

<style scoped>
.table-responsive {
  max-height: 600px;
  overflow-y: auto;
  display: block; /* Ensures the container behaves as a block */
}

.table-responsive thead th {
  position: sticky;
  top: 0;
  background-color: #6f42c1; /* Matches your purple header */
  color: white;
  z-index: 1; /* Ensures header stays above content */
}
</style>
