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

// Nuevo Composable para manejar la ordenación
const sortKey = ref(null);
const sortOrder = ref("asc");

const sortCoverSheetList = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }

  coverSheetList.value.sort((a, b) => {
    let valueA = a[key] || "";
    let valueB = b[key] || "";

    if (key === "truckNumber" || key === "trailerNumber") {
      valueA = parseInt(valueA, 10) || 0;
      valueB = parseInt(valueB, 10) || 0;
    } else if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (sortOrder.value === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

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

const isEditModeCoverShet = ref(false);

const SearchCoverSheet = async (event) => {
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
    
    // Traer TODOS los coversheets de una sola vez
    const response = await CoverSheetAPI.all();
    const allCoversheets = response.data.data || [];
    
    // Convertir las fechas de búsqueda a formato comparable
    const startDateStr = formatToYYYYMMDD(startDate.value);
    const endDateStr = formatToYYYYMMDD(endDate.value);
    
    // Aplicar todos los filtros (fecha, truck, trailer, driver)
    const filters = {
      startDate: startDateStr,
      endDate: endDateStr,
      truck_id: selectedTruck.value || null,
      trailer_id: selectedTrailer.value || null,
      driver_id: selectedDriver.value || null,
    };

    coverSheetList.value = filterCoversheets(allCoversheets, filters);
  } catch (error) {
    console.error("Error al obtener CoverSheet:", error);
  } finally {
    isLoading.value = false;
  }
};

const openCoverSheetModal = async (item) => {
  await openModal(
    defineAsyncComponent(() => import("@/components/CoverSheetModal.vue")),
    {
      item: item,
      onUpdateSuccess: SearchCoverSheet,
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
      console.log("success", data);
    })
    .catch(() => {
      console.log("catch");
    });
};

const EditCoverSheet = (item) => {};

const currentDate = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
);

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

const filterCoversheets = (coversheets, filters) => {
  return coversheets.filter((c) => {
    // Filtro por rango de fechas
    let matchDate = true;
    if (filters.startDate && filters.endDate && c.date) {
      // Asumiendo que c.date está en formato YYYY-MM-DD
      const coverSheetDate = c.date;
      matchDate = coverSheetDate >= filters.startDate && coverSheetDate <= filters.endDate;
    }
    
    // Filtros por truck, trailer y driver
    const matchTrailer = !filters.trailer_id || c.trailer_id === filters.trailer_id;
    const matchTruck = !filters.truck_id || c.truck_id === filters.truck_id;
    const matchDriver = !filters.driver_id || c.driver_id === filters.driver_id;
    
    return matchDate && matchTrailer && matchTruck && matchDriver;
  });
};

onMounted(() => {
  if (!sessionStorage.getItem("page_reloaded")) {
    sessionStorage.setItem("page_reloaded", "true");
    window.location.reload();
  } else {
    sessionStorage.removeItem("page_reloaded");
  }

  SearchCoverSheet();
});
</script>

<template>
  <div class="container-fluid">
    <div class="page-titles">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active">
          <a href="javascript:void(0)">Search Coversheet</a>
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
                  <VueDatePicker
                    v-model="startDate"
                    week-start="0"
                    :enable-time-picker="false"
                    :max-date="new Date()"
                    placeholder="Select Start Date"
                  >
                    <template #input-icon>
                      <img
                        class="input-slot-image"
                        src="../assets/icons/calendar.png"
                      />
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
                  <VueDatePicker
                    v-model="endDate"
                    week-start="0"
                    :enable-time-picker="false"
                    :max-date="new Date()"
                    :min-date="startDate"
                    placeholder="Select End Date"
                  >
                    <template #input-icon>
                      <img
                        class="input-slot-image"
                        src="../assets/icons/calendar.png"
                      />
                    </template>
                  </VueDatePicker>
                </div>
                <small v-if="errors.endDate_er" class="text-danger">{{
                  errors.endDate_er
                }}</small>
              </div>

              <div class="mb-3 col-md-2">
                <label class="form-label">Truck #</label>
                <v-select
                  :options="storeTruck.trucks"
                  v-model="selectedTruck"
                  placeholder="Choose Truck"
                  :reduce="(truck) => truck.id"
                  label="truckNumber"
                  class="form-control p-0"
                  :class="{ 'is-invalid': formSubmitted && !selectedTruck }"
                />
                <small v-if="errors.truck_er" class="text-danger">{{
                  errors.truck_er
                }}</small>
              </div>

              <div class="mb-3 col-md-2">
                <label class="form-label">Trailer #</label>
                <v-select
                  :options="storeTrailer.trailers"
                  v-model="selectedTrailer"
                  placeholder="Choose Trailer"
                  :reduce="(trailer) => trailer.id"
                  label="trailerNumber"
                  class="form-control p-0"
                  :class="{ 'is-invalid': formSubmitted && !selectedTrailer }"
                />
                <small v-if="errors.trailer_er" class="text-danger">{{
                  errors.trailer_er
                }}</small>
              </div>

              <div class="mb-3 col-md-2">
                <label class="form-label">Driver</label>
                <v-select
                  :options="storeDriver.drivers"
                  v-model="selectedDriver"
                  placeholder="Choose Driver"
                  :reduce="(driver) => driver.id"
                  label="name"
                  class="form-control p-0"
                  :class="{ 'is-invalid': formSubmitted && !selectedDriver }"
                />
              </div>
            </div>

            <button
              style="margin-bottom: -5px !important"
              @click="SearchCoverSheet"
              type="button"
              class="btn btn-info"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Searching...' : 'Search CoverSheet' }}
              <span class="btn-icon-end">
                <i class="fa fa-search"></i>
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
              <div style="text-align: end; color:blueviolet">{{ coverSheetList.length}} rows</div>
              <hr style="color: black" />
              <div class="table-responsive">
                <table class="table table-bordered header-border table-striped table-hover table-responsive-md">
                  <thead class="thead-primary">
                    <tr>
                      <th>HomeBase</th>
                      <th>
                        <a
                          @click="sortCoverSheetList('driverName')"
                          style="cursor: pointer; text-decoration: none; color: inherit;"
                        >
                          Driver
                          <span v-if="sortKey === 'driverName'">
                            <i v-if="sortOrder === 'asc'" class="fa fa-sort-asc"></i>
                            <i v-else class="fa fa-sort-desc"></i>
                          </span>
                        </a>
                      </th>
                      <th>
                        <a
                          @click="sortCoverSheetList('truckNumber')"
                          style="cursor: pointer; text-decoration: none; color: inherit;"
                        >
                          Truck #
                          <span v-if="sortKey === 'truck'">
                            <i v-if="sortOrder === 'asc'" class="fa fa-sort-asc"></i>
                            <i v-else class="fa fa-sort-desc"></i>
                          </span>
                        </a>
                      </th>
                      <th>
                        <a
                          @click="sortCoverSheetList('trailerNumber')"
                          style="cursor: pointer; text-decoration: none; color: inherit;"
                        >
                          Trailer #
                          <span v-if="sortKey === 'trailerNumber'">
                            <i v-if="sortOrder === 'asc'" class="fa fa-sort-asc"></i>
                            <i v-else class="fa fa-sort-desc"></i>
                          </span>
                        </a>
                      </th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Trainee / Trainer</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in coverSheetList" :key="index">
                      <td class="td">{{ item.homeBaseName }}</td>
                      <td class="td">{{ item.driverName }}</td>
                      <td class="td">{{ item.truckNumber }}</td>
                      <td class="td">{{ item.trailerNumber }}</td>
                      <td class="td">{{ item.clockIn }}</td>
                      <td class="td">{{ item.clockIn }}</td>
                      <td class="td">{{ item.trainee }}</td>
                      <td class="td">{{ item.notes }}</td>
                      <td>
                        <div>
                          <a
                            @click="openCoverSheetModal(item)"
                            class="btn btn-primary shadow btn-xs sharp me-1"
                          >
                            <i class="fa fa-eye"></i>
                          </a>
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
  display: block;
}

.table-responsive thead th {
  position: sticky;
  top: 0;
  background-color: #6f42c1;
  color: white;
  z-index: 1;
}
</style>