<script setup>
import { ref, onMounted } from "vue";
import { defineAsyncComponent } from "vue";

import { useRouter } from "vue-router";
const router = useRouter();

// Importamos utilidades
import { DateTime } from "luxon";
import { openModal } from "@kolirt/vue-modal";
import { ModalTarget } from "@kolirt/vue-modal";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

// Importamos el api
import CoverSheetAPI from "@/api/CoverSheetAPI.js";
import SpareTruckInfoAPI from "@/api/SpareTruckInfoAPI";
import DowntimeAPI from "@/api/DowntimeAPI";
import LoadAPI from "@/api/LoadAPI";

// Import composables
import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

// Importamos componentes
import Spinner from "@/components/Spinner.vue";
import CoverSheetModal from "@/components/CoverSheetModal.vue";

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

import { useTrailersStore } from "@/stores/trailers.js";
const storeTrailer = useTrailersStore();

import { useTypeDownTimeStore } from "@/stores/typeDowntime.js";
const storeTypeDowntime = useTypeDownTimeStore();

import { useLandFillsStore } from "@/stores/landfills";
const storeLandFill = useLandFillsStore();

import { useTrucksStore } from "@/stores/trucks.js";
const storeTruck = useTrucksStore();

import { useDriversStore } from "@/stores/drivers.js";
const storeDriver = useDriversStore();

const user = ref(null);

// Recuperamos el usuario
const storedUser = localStorage.getItem("USER");

if (storedUser) {
  try {
    const parsed = JSON.parse(storedUser);

    if (parsed.data.user) {
      user.value = parsed.data.user;
    } else {
      user.value = parsed.data;
    }
  } catch (e) {
    console.error("Error al parsear USER desde localStorage:", e);
  }
}

// General Info
const selectedRoute = ref("");
const selectedTrailer = ref("");
const selectedTruck = ref("");
const selectedDriver = ref("");

const startDate = ref(new Date());
const endDate = ref(new Date());

const coverSheetList = ref([]);
const isLoading = ref(false);

const formSubmitted = ref(false);

const errors = ref({
  startDate_er: "",
  endDate_er: "",
});

// 🆕 VARIABLES DE PAGINACIÓN
const currentPage = ref(1);
const itemsPerPage = ref(50);
const totalRecords = ref(0);
const totalPages = ref(0);
const hasNextPage = ref(false);
const hasPrevPage = ref(false);

// 🆕 FUNCIÓN PRINCIPAL DE BÚSQUEDA CON PAGINACIÓN
const SearchCoverSheet = async (event = null, page = 1) => {
  if (event) {
    event.preventDefault();
  }

  // Limpiar errores anteriores
  errors.value.startDate_er = "";
  errors.value.endDate_er = "";
  let hasError = false;

  if (!startDate.value) {
    errors.value.startDate_er = "Required field";
    hasError = true;
  }

  if (!endDate.value) {
    errors.value.endDate_er = "Required field";
    hasError = true;
  }

  // Validar que la fecha final no sea menor que la fecha inicial
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value);
    const end = new Date(endDate.value);

    if (end < start) {
      errors.value.endDate_er = "End date cannot be before start date";
      hasError = true;
    }
  }

  if (hasError) {
    return;
  }

  try {
    isLoading.value = true;

    // Convertir las fechas al formato YYYY-MM-DD
    const startDateStr = formatToYYYYMMDD(startDate.value);
    const endDateStr = formatToYYYYMMDD(endDate.value);

    // 🆕 Construir parámetros para la API con paginación
    const params = {
      page: page,
      limit: itemsPerPage.value,
      start_date: startDateStr,
      end_date: endDateStr,
      truck_id: selectedTruck.value || null,
      trailer_id: selectedTrailer.value || null,
      driver_id: selectedDriver.value || null,
      sort_by: 'date',
      sort_order: -1 // Descendente (más reciente primero)
    };

    // 🆕 Llamar al nuevo endpoint paginado
    const response = await CoverSheetAPI.allPaginated(params);

    // 🆕 La estructura de respuesta ahora es: response.data.data
    const responseData = response.data.data;

    // Actualizar la lista de coversheets
    coverSheetList.value = responseData.data || [];

    // 🆕 Actualizar información de paginación
    const pagination = responseData.pagination;
    currentPage.value = pagination.page;
    totalRecords.value = pagination.total_count;
    totalPages.value = pagination.total_pages;
    hasNextPage.value = pagination.has_next;
    hasPrevPage.value = pagination.has_prev;

    console.log(`📄 Página ${currentPage.value} de ${totalPages.value} (${totalRecords.value} registros totales)`);

  } catch (error) {
    console.error("Error al obtener CoverSheet:", error);
    coverSheetList.value = [];
    totalRecords.value = 0;
    totalPages.value = 0;
  } finally {
    isLoading.value = false;
  }
};

// 🆕 FUNCIONES DE NAVEGACIÓN DE PÁGINAS
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    SearchCoverSheet(null, page);
  }
};

const goToFirstPage = () => {
  goToPage(1);
};

const goToLastPage = () => {
  goToPage(totalPages.value);
};

const goToPrevPage = () => {
  if (hasPrevPage.value) {
    goToPage(currentPage.value - 1);
  }
};

const goToNextPage = () => {
  if (hasNextPage.value) {
    goToPage(currentPage.value + 1);
  }
};

// 🆕 Cambiar cantidad de registros por página
const changeItemsPerPage = () => {
  currentPage.value = 1; // Reset a página 1 al cambiar el límite
  SearchCoverSheet(null, 1);
};

const deleteCoverSheet = async (item) => {
  const result = await showSweetAlert({
    title: "Are you sure you want to delete this CoverSheet?",
    //text: "This action will deactivate the coversheet (soft delete)",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel"
  });

  // ✅ Ahora result sí tiene valor porque el composable lo retorna
  if (result?.isConfirmed) {
    try {
      isLoading.value = true;
      const response = await CoverSheetAPI.delete(item.id);

      if (response.data.ok) {
        await showSweetAlert({
          title: "Deleted!",
          text: "CoverSheet has been deleted successfully.",
          icon: "success",
          confirmButtonText: "Ok",
        });

        // ✅ CORRECCIÓN: Llamar a SearchCoverSheet, no SearchDriver
        SearchCoverSheet(null, currentPage.value);
      } else {
        await showSweetAlert({
          title: "Error!",
          text: "Error deleting CoverSheet.",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      console.error("Error deleting CoverSheet:", error);
      await showSweetAlert({
        title: "Error!",
        text: error.response?.data?.message || "Error deleting CoverSheet!",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      isLoading.value = false;
    }
  }
};
const openCoverSheetModal = async (item) => {
  await openModal(
    defineAsyncComponent(() => import("@/components/CoverSheetModal.vue")),
    {
      item: item,
      onUpdateSuccess: () => SearchCoverSheet(null, currentPage.value),
    }
  )
    .then((data) => {
      console.log("success", data);
    })
    .catch(() => {
      console.log("catch");
    });
};

const openNewCoverSheetModal = async () => {
  await openModal(
    defineAsyncComponent(() => import("@/components/NewCoverSheetModal.vue")),
    {}
  )
    .then((data) => {
      // ✅ Solo recargar si el modal se cerró con confirmModal (finalizó exitosamente)
      if (data?.finalized) {
        console.log("CoverSheet finalized successfully");
        SearchCoverSheet(null, currentPage.value);
      } else {
        console.log("Modal closed without finalizing");
      }
    })
    .catch(() => {
      console.log("Modal cancelled");
    });
};

const downloadPDF = () => {
  const pdfUrl = '/documents/AIRC-Coversheet-2026.pdf';
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = 'CoverSheet-Guide.pdf';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const currentDate = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return DateTime.fromISO(dateString).toFormat('MM/dd/yyyy');
};

const formatToYYYYMMDD = (inputDate) => {
  const date = new Date(inputDate);
  if (isNaN(date.getTime())) {
    console.warn("Fecha inválida:", inputDate);
    return null;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

onMounted(() => {
  SearchCoverSheet();
});
</script>

<template>
  <div class="container-fluid">
    <div class="page-titles">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">
          <a href="javascript:void(0)"></a>
        </li>
      </ol>
    </div>

    <Spinner v-if="storeRoute.loading || storeTruck.loading || isLoading" />

    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">
            <div class="row">
              <div class="mb-3 col-md-3">
                <label class="form-label">Start Date</label>
                <div class="mt-0">
                  <VueDatePicker v-model="startDate" week-start="0" :enable-time-picker="false" :max-date="new Date()"
                    placeholder="Select Start Date">
                    <template #input-icon>
                      <img class="input-slot-image" src="../assets/icons/calendar.png" />
                    </template>
                  </VueDatePicker>
                </div>
                <small v-if="errors.startDate_er" class="text-danger">{{
                  errors.startDate_er
                }}</small>
              </div>

              <div class="mb-3 col-md-3">
                <label class="form-label">End Date</label>
                <div class="mt-0">
                  <VueDatePicker v-model="endDate" week-start="0" :enable-time-picker="false" :max-date="new Date()"
                    :min-date="startDate" placeholder="Select End Date">
                    <template #input-icon>
                      <img class="input-slot-image" src="../assets/icons/calendar.png" />
                    </template>
                  </VueDatePicker>
                </div>
                <small v-if="errors.endDate_er" class="text-danger">{{
                  errors.endDate_er
                }}</small>
              </div>

              <div class="mb-3 col-md-2">
                <label class="form-label">Truck #</label>
                <v-select :options="storeTruck.trucks" v-model="selectedTruck" placeholder="Choose Truck"
                  :reduce="(truck) => truck.id" label="truckNumber" class="form-control p-0"
                  :class="{ 'is-invalid': formSubmitted && !selectedTruck }" />
                <small v-if="errors.truck_er" class="text-danger">{{
                  errors.truck_er
                }}</small>
              </div>

              <div class="mb-3 col-md-2">
                <label class="form-label">Trailer #</label>
                <v-select :options="storeTrailer.trailers" v-model="selectedTrailer" placeholder="Choose Trailer"
                  :reduce="(trailer) => trailer.id" label="trailerNumber" class="form-control p-0"
                  :class="{ 'is-invalid': formSubmitted && !selectedTrailer }" />
                <small v-if="errors.trailer_er" class="text-danger">{{
                  errors.trailer_er
                }}</small>
              </div>

              <div class="mb-3 col-md-2">
                <label class="form-label">Driver</label>
                <v-select :options="storeDriver.drivers" v-model="selectedDriver" placeholder="Choose Driver"
                  :reduce="(driver) => driver.id" label="name" class="form-control p-0"
                  :class="{ 'is-invalid': formSubmitted && !selectedDriver }" />
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">


            <div>

                        <button style="margin-bottom: -5px !important" @click="SearchCoverSheet" type="button" class="btn btn-info"
              :disabled="isLoading">
              {{ isLoading ? 'Searching...' : 'Search CoverSheet' }}
              <span class="btn-icon-end">
                <i class="fa fa-search"></i>
              </span>
            </button>

            <button style="margin-bottom: -5px !important; margin-left: 15px" @click="openNewCoverSheetModal"
              type="button" class="btn btn-primary">
              New CoverSheet
              <span class="btn-icon-end">
                <i class="fa fa-table"></i>
              </span>
            </button>
            
            
            </div>

            <div>

                        <button style="margin-bottom: -5px !important; margin-left: 15px" @click="downloadPDF" type="button"
              class="btn btn-success">
              Download AIRC Blank CoverSheet
              <span class="btn-icon-end">
                <i class="fa fa-download"></i>
              </span>
            </button>
            
            </div>


            </div>



          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="basic-form">
            <div class="row">
              <!-- 🆕 Información de registros y paginación -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="color: blueviolet; font-weight: 600;">
                  Showing {{ coverSheetList.length }} of {{ totalRecords }} total records
                  <span v-if="totalPages > 1"> (Page {{ currentPage }} of {{ totalPages }})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <label style="margin: 0;">Records per page:</label>
                  <select v-model.number="itemsPerPage" @change="changeItemsPerPage" class="form-control"
                    style="width: auto; padding: 5px 10px;">
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                  </select>
                </div>
              </div>

              <hr style="color: black" />

              <div class="table-responsive">
                <table class="table table-bordered header-border table-striped table-hover table-responsive-md">
                  <thead class="thead-primary">
                    <tr>
                      <th>Date</th>
                      <th>HomeBase</th>
                      <th>Driver</th>
                      <th>Truck #</th>
                      <th>Trailer #</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Trainee / Trainer</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="coverSheetList.length === 0 && !isLoading">
                      <td colspan="10" style="text-align: center; padding: 40px; color: #999;">
                        No records found for the selected filters
                      </td>
                    </tr>
                    <tr v-for="(item, index) in coverSheetList" :key="index">
                      <td class="td">{{ formatDate(item.date) }}</td>
                      <td class="td">{{ item.homeBaseName || 'N/A' }}</td>
                      <td class="td">{{ item.driverName }}</td>
                      <td class="td">{{ item.truckNumber }}</td>
                      <td class="td">{{ item.trailerNumber }}</td>
                      <td class="td">{{ item.clockIn }}</td>
                      <td class="td">{{ item.clockOut }}</td>
                      <td class="td">{{ item.trainee || '-' }}</td>
                      <td class="td">{{ item.notes || '-' }}</td>
                      <td>
                        <div>
                          <a @click="openCoverSheetModal(item)" class="btn btn-primary shadow btn-xs sharp me-1">
                            <i class="fa fa-eye"></i>
                          </a>

                          <a @click="deleteCoverSheet(item)" class="btn btn-danger shadow btn-xs sharp me-1">
                            <i class="fa fa-trash"></i>
                          </a>
                        </div>

                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 🆕 CONTROLES DE PAGINACIÓN -->
              <div v-if="totalPages > 1" class="pagination-controls">
                <div class="pagination-info">
                  Page {{ currentPage }} of {{ totalPages }}
                </div>

                <div class="pagination-buttons">
                  <!-- Primera página -->
                  <button @click="goToFirstPage" :disabled="!hasPrevPage || isLoading"
                    class="btn btn-sm btn-outline-primary" title="First Page">
                    <i class="fa fa-angle-double-left"></i>
                  </button>

                  <!-- Página anterior -->
                  <button @click="goToPrevPage" :disabled="!hasPrevPage || isLoading"
                    class="btn btn-sm btn-outline-primary" title="Previous Page">
                    <i class="fa fa-angle-left"></i> Previous
                  </button>

                  <!-- Input directo de página -->
                  <!-- <div style="display: inline-flex; align-items: center; gap: 5px; margin: 0 10px;">
                    <span>Go to page:</span>
                    <input 
                      type="number" 
                      v-model.number="currentPage"
                      @keyup.enter="goToPage(currentPage)"
                      :min="1"
                      :max="totalPages"
                      class="form-control"
                      style="width: 70px; display: inline-block; padding: 5px; text-align: center;"
                    />
                    <button 
                      @click="goToPage(currentPage)"
                      class="btn btn-sm btn-primary"
                      :disabled="isLoading"
                    >
                      Go
                    </button>
                  </div> -->

                  <!-- Página siguiente -->
                  <button @click="goToNextPage" :disabled="!hasNextPage || isLoading"
                    class="btn btn-sm btn-outline-primary" title="Next Page">
                    Next <i class="fa fa-angle-right"></i>
                  </button>

                  <!-- Última página -->
                  <button @click="goToLastPage" :disabled="!hasNextPage || isLoading"
                    class="btn btn-sm btn-outline-primary" title="Last Page">
                    <i class="fa fa-angle-double-right"></i>
                  </button>
                </div>
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
  display: block;
}

.table-responsive thead th {
  position: sticky;
  top: 0;
  background-color: #6f42c1;
  color: white;
  z-index: 1;
}

/* 🆕 Estilos para paginación */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.pagination-info {
  font-weight: 600;
  color: #6f42c1;
  font-size: 14px;
}

.pagination-buttons {
  display: flex;
  gap: 5px;
  align-items: center;
}

.pagination-buttons button {
  min-width: 40px;
  height: 35px;
}

.pagination-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-buttons button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>