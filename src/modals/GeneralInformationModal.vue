<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from "vue";
import { closeModal, confirmModal, openModal  } from "@kolirt/vue-modal";

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
const storeDept = useDeptsStore();

const user = ref(null);

watch(authUser, (newUser) => {
  user.value = newUser;
  console.log('Usuario actualizado en dashboard:', newUser);
}, { immediate: true });


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
</script>