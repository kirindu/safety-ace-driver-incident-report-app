<script setup>
//Importaciones de sistemas y librerias
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Importamos el api
import UserAPI from "@/api/UserAPI";

// Importamos utilidades
import { DateTime } from "luxon";

// Importamos componentes
import Spinner from "@/components/Spinner.vue";

// Import composables
import useToastNotification from "@/composables/useToast";
const { showToast } = useToastNotification();

import useSweetAlert2Notification from "@/composables/useSweetAlert2";
const { showSweetAlert, alertResult } = useSweetAlert2Notification();

// Reactividad
const loading = ref(false);
const rol = ref('Driver')  // valor por defecto

// Variables Reactivas
const selectedRoute = ref("");

// Validaciones
import { useForm } from "vee-validate";
import * as yup from "yup";

// Schema de validación dinámica según el rol
const validationSchema = computed(() => {
  if (rol.value === 'Driver') {
    return yup.object({
      email: yup
        .string()
        .required("Username is required"),
      password: yup.string().required("Password is required"),
    });
  } else {
    return yup.object({
      email: yup
        .string()
        .email("Invalid email")
        .required("Email is required"),
      password: yup.string().required("Password is required"),
    });
  }
});

const {
  defineField,
  errors,
  handleSubmit,
  resetForm,
  setFieldValue,
  setValues,
  meta,
} = useForm({
  validationSchema,
});

const [email, emailAttrs] = defineField("email", {
  validateOnModelUpdate: false,
}); 
const [password, passwordAttrs] = defineField("password", {
  validateOnModelUpdate: false,
});

// Computed para labels e iconos dinámicos
const emailLabel = computed(() => {
  return rol.value === 'Driver' ? 'Username' : 'Email';
});

const emailIcon = computed(() => {
  return rol.value === 'Driver' ? 'fa fa-user' : 'fa fa-envelope';
});

const emailInputType = computed(() => {
  return rol.value === 'Driver' ? 'text' : 'email';
});

// Metodos
const onSubmit = handleSubmit(async (values, { resetForm }) => {
  loading.value = true;
  try {

    if (rol.value === 'Driver') {
      const { data } = await UserAPI.loginDriver({
        username: values.email,
        password: values.password,
      });

      if (data.ok) {
        // ✅ PASO 1: Guardar en localStorage
        localStorage.setItem("USER", JSON.stringify(data));

        // ✅ PASO 2: Obtener el user_id de forma correcta
        let user_id = null;
        
        if (data.data?.user?.id) {
          user_id = data.data.user.id;
        } else if (data.data?.id) {
          user_id = data.data.id;
        }

        console.log('User ID obtenido:', user_id);

        // ✅ PASO 3: Verificar coversheet
        let coversheet_driver_id = JSON.parse(localStorage.getItem("COVERSHEET"))?.driver_id || null;

        if (coversheet_driver_id) {

          if (user_id !== coversheet_driver_id) {
            console.log('Coversheet de otro usuario, eliminando...');
            localStorage.removeItem("COVERSHEET");
            // ✅ SOLUCIÓN: Usar window.location en lugar de router.push
            window.location.href = '/';
            
          } else {
            // El coversheet es del mismo usuario, verificar fecha
            const coversheetData = JSON.parse(localStorage.getItem("COVERSHEET"));
            const dbDate = DateTime.fromISO(coversheetData.date, { zone: 'utc' });
            const today = DateTime.now();

            const dbDateDenver = dbDate.setZone('America/Denver');
            const todayDenver = today.setZone('America/Denver');

            if (
              dbDateDenver.year !== todayDenver.year ||
              dbDateDenver.month !== todayDenver.month ||
              dbDateDenver.day !== todayDenver.day
            ) {
              console.log('Coversheet de otro día, eliminando...');
              localStorage.removeItem("COVERSHEET");
              // ✅ SOLUCIÓN: Usar window.location en lugar de router.push
              window.location.href = '/';
              
            } else {
              console.log('Coversheet válido encontrado');
              
              // ✅ Esperar la respuesta del SweetAlert ANTES de navegar
              const result = await showSweetAlert({
                title: "A current cover sheet has been detected",
                text: "Do you want to continue working with it or create a new cover sheet?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#ff4949",
                confirmButtonText: "Yes, continue working with it",
                cancelButtonText: "Create a new cover sheet",
                allowOutsideClick: false,
              });

              if (result.isConfirmed) {
                console.log('Usuario quiere continuar con el coversheet existente');
                // ✅ SOLUCIÓN: Usar window.location en lugar de router.push
                window.location.href = '/';
              } else {
                console.log('Usuario quiere crear un nuevo coversheet');
                localStorage.removeItem("COVERSHEET");
                // ✅ SOLUCIÓN: Usar window.location en lugar de router.push
                window.location.href = '/';
              }
            }
          }

        } else {
          console.log('No hay coversheet previo');
          // ✅ SOLUCIÓN: Usar window.location en lugar de router.push
          window.location.href = '/';
        }

      }

    } else {

      if (rol.value === 'Admin') {
        const { data } = await UserAPI.loginAdmin({
          email: values.email,
          password: values.password,
        });

        if (data.ok) {
          localStorage.setItem("USER", JSON.stringify(data));
          // ✅ SOLUCIÓN: Usar window.location en lugar de router.push
          window.location.href = '/admin/dashboard';
        }
      }

    }

  } catch (error) {
    console.error('Error en login:', error);
    showToast({
      message: "Invalid credentials, please try again.",
      type: "error",
      position: "top",
      duration: 3000,
    });
    resetForm();
  } finally {
    loading.value = false;
  }
});

const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};


</script>

<template>
  <div class="authincation d-flex flex-column flex-lg-row flex-column-fluid">
    <div class="login-aside text-center d-none d-sm-flex flex-column flex-row-auto">
      <div class="d-flex flex-column-auto flex-column pt-lg-40 pt-15">
        <div class="text-center mb-4 pt-5">
          <a href="/" class="brand-logo">
            <img fetchpriority="high" decoding="async" width="188" height="110" src="@/assets/logo/acedisposal-logo.png" />

            <div>
              <div class="brand-title">
                <span style="
                    font-size: 20px;
                    font-weight: bold;
                    margin-left: 10px;
                    color: black;
                  ">ACE Driver Incident Report</span>
              </div>
            </div>
          </a>
        </div>
        <h3 class="mb-2">Welcome back!</h3>
        <p>IT Department</p>
      </div>
      <div class="aside-image" style="background-image: url(images/pic1.svg)"></div>
    </div>



    <div
      class="container flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto">
      <div class="d-flex justify-content-center h-100 align-items-center">
        <div class="authincation-content style-2">
          <div class="row no-gutters">
            <div class="col-xl-12">
              <div class="auth-form">
                <div class="text-center d-block d-lg-none mb-4 pt-5">

                  <a href="/" class="brand-logo">
                    <img fetchpriority="high" decoding="async" width="188" height="110"
                      src="@/assets/logo/acedisposal-logo.png" />

                    <div>
                      <div class="brand-title">
                        <span style="
                            font-size: 20px;
                            font-weight: bold;
                            margin-left: 10px;
                            color: black;
                          ">ACE Driver Incident Report</span>
                      </div>
                    </div>
                  </a>
                </div>

                <h4 class="text-center mb-4">Sign into your account</h4>

                <!-- Empieza el formulario de login -->

                <form @submit="onSubmit" autocomplete="off">

                  <div class="mb-3">
                    <label class="mb-1 form-label" for="validationCustomEmail">{{ emailLabel }}<span
                        class="text-danger">*</span></label>

                    <div class="input-group">
                      <span class="input-group-text"> <i :class="emailIcon"></i> </span>
                      <input v-model="email" v-bind="emailAttrs" :type="emailInputType" class="form-control"
                        id="validationCustomEmail" required autocomplete="off" />
                    </div>

                    <div style="width: 100%; margin-top: 0.25rem; font-size: 0.875em; color: #e41a01;">
                      {{ errors.email }}
                    </div>

                  </div>

                  <div class="mb-3">
                    <label class="mb-1 form-label">Password<span class="text-danger">*</span></label>
                    <div class="position-relative">
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="fa fa-lock"></i>
                        </span>
                        <input :type="showPassword ? 'text' : 'password'" v-model="password" v-bind="passwordAttrs"
                          class="form-control" id="validationCustomPassword" required autocomplete="off" />
                        <button class="btn btn-outline-secondary password-toggle-btn" type="button"
                          @click="togglePasswordVisibility" tabindex="-1">
                          <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'" class="password-icon"></i>
                        </button>
                      </div>

                      <div style="width: 100%; margin-top: 0.25rem; font-size: 0.875em; color: #e41a01;">
                        {{ errors.password }}
                      </div>
                    </div>
                  </div>

                  <fieldset class="mb-3">
                    <div class="row">
                      <label class="col-form-label col-sm-3 pt-0">User Role</label>
                      <div class="col-sm-9">
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="rol" name="gridRadios" value="Driver"
                            checked />
                          <label class="form-check-label"> Driver </label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" v-model="rol" name="gridRadios" value="Admin" />
                          <label class="form-check-label"> Admin </label>
                        </div>
                      </div>
                    </div>
                  </fieldset>


                  <div class="text-center">
                    <button :disabled="loading" type="submit" class="btn btn-primary btn-block">Sign In</button>
                    <Spinner v-if="loading" />
                  </div>

                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-toggle-btn {
  border: 1px solid #ced4da;
  background-color: #fff;
  transition: all 0.3s ease;
  padding: 0.375rem 0.75rem;
}

.password-toggle-btn:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.password-toggle-btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  outline: none;
}

.password-icon {
  transition: all 0.3s ease;
  color: #6c757d;
}

.password-toggle-btn:hover .password-icon {
  color: #495057;
  transform: scale(1.1);
}

/* Animación suave al cambiar de ícono */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.password-icon {
  animation: fadeIn 0.2s ease;
}
</style>