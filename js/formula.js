import { Axiomi } from "./api.js";
// import { fetchMateriales, formatNombreTabla, formatFormula } from "./utils.js";
// import FormMaterial from "./components/form_material.js";
import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import ModalBase from "./components/modal_base.js";
import { getMateriales, formatNombreLista } from "./utils.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const id_folder = new URLSearchParams(window.location.search).get("id_folder");
const id_formula = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const isLoading = ref(true);
    const materialesDB = ref([]);
    const materialModalOpen = ref(false);
    const formFormula = reactive({
      nombre: "",
    });

    // Computed properties
    const materialesFormateados = computed(() => {
      return materialesDB.value.map((material) => {
        return {
          id: material._id,
          nombre: formatNombreLista(material),
        };
      });
    });

    // Methods
    const getMaterialesDb = async () => {
      const { error, data } = await getMateriales();
      if (!error) {
        materialesDB.value = data;
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      try {
        await getMaterialesDb();
      } catch (error) {
        console.log(error);
        alert("Error al obtener los datos");
      } finally {
        isLoading.value = false;
      }
    });

    return {
      isLoading,
      materialesFormateados,
      formFormula,
      materialModalOpen,
    };
  },
});

// app.component("form-material", FormMaterial);
app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);
app.component("modal-base", ModalBase);

app.mount("#app");
