import { Axiomi } from "./api.js";
// import { fetchMateriales, formatNombreTabla, formatFormula } from "./utils.js";
// import FormMaterial from "./components/form_material.js";
import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import ModalBase from "./components/modal_base.js";
import AutoComplete from "./components/autoComplete.js";
import { getMateriales, formatNombreLista } from "./utils.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const id_folder = new URLSearchParams(window.location.search).get("id_folder");
const id_formula = new URLSearchParams(window.location.search).get("id");

const formMaterialVacio = {
  index: null,
  id: "",
  nombre: "",
  autoComplete: "",
  cantidad: "",
  ancho: "",
  alto: "",
};

const app = createApp({
  setup() {
    const isLoading = ref(false);
    const firstLoad = ref(true);
    const materialesDB = ref([]);
    const formFormula = reactive({
      nombre: "",
      materiales: [],
    });
    const formMaterial = ref({ ...formMaterialVacio });
    const modalEl = ref(null);

    // Computed properties
    const materialesFormateados = computed(() => {
      return materialesDB.value.map((material) => {
        return {
          id: material._id,
          nombre: formatNombreLista(material),
        };
      });
    });

    const modoEdicion = computed(() => {
      return id_formula !== null;
    });

    const modoEdicionMaterial = computed(() => {
      return formMaterial.value.index !== null;
    });

    const materialesFiltrados = computed(() => {
      const q = formMaterial.value.autoComplete.trim().toLowerCase();
      if (!q) return [];
      return materialesFormateados.value.filter((material) =>
        material.nombre.toLowerCase().includes(q),
      );
    });

    const enableSubmitMaterial = computed(() => {
      return !!formMaterial.value.id && formMaterial.value.cantidad > 0;
    });

    const enableSubmitFormula = computed(() => {
      return (
        formFormula.nombre.trim().length > 0 &&
        formFormula.materiales.length > 0
      );
    });

    const esFormulaHuerfana = computed(() => {
      return !id_folder;
    });

    // Methods
    const getMaterialesDb = async () => {
      const { error, data } = await getMateriales();
      if (!error) {
        materialesDB.value = data;
      }
    };

    const agregarMaterial = () => {
      const { id, nombre, cantidad, ancho, alto } = formMaterial.value;
      formFormula.materiales.push({ id, nombre, cantidad, ancho, alto });
    };

    const editaMaterial = () => {
      const { id, nombre, cantidad, ancho, alto } = formMaterial.value;
      formFormula.materiales[formMaterial.value.index] = {
        id,
        nombre,
        cantidad,
        ancho,
        alto,
      };
    };

    const selectMaterial = (material) => {
      const { id, nombre } = material;
      formMaterial.value.id = id;
      formMaterial.value.nombre = nombre;
      formMaterial.value.autoComplete = "";
    };

    const eliminarMaterial = (index) => {
      formFormula.materiales.splice(index, 1);
    };

    const abrirModalEditarMaterial = (index) => {
      formMaterial.value = {
        index,
        autoComplete: "",
        ...formFormula.materiales[index],
      };
    };

    const limpiarFormMaterial = () => {
      formMaterial.value = { ...formMaterialVacio };
    };

    const onSubmitMaterial = () => {
      if (modoEdicionMaterial.value) {
        editaMaterial();
      } else {
        agregarMaterial();
      }
      bootstrap.Modal.getInstance(modalEl.value.$el)?.hide();
    };

    const guardarFormula = async () => {
      const { error } = await Axiomi.post("formulas", {
        id_folder,
        ...formFormula,
      });

      if (!error) {
        if (esFormulaHuerfana.value) {
          location.href = `/formulas.html`;
        } else {
          location.href = `/folder-formula.html?id_folder=${id_folder}`;
        }
      }
    };

    const onSubmitFormula = async () => {
      try {
        await guardarFormula();
      } catch (error) {
        alert(error.message);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      modalEl.value.$el.addEventListener(
        "hidden.bs.modal",
        limpiarFormMaterial,
      );
      try {
        await getMaterialesDb();
      } catch (error) {
        console.log(error);
        alert("Error al obtener los datos");
      } finally {
        firstLoad.value = false;
      }
    });

    return {
      modalEl,
      isLoading,
      firstLoad,
      formFormula,
      formMaterial,
      materialesFiltrados,
      modoEdicion,
      modoEdicionMaterial,
      enableSubmitMaterial,
      enableSubmitFormula,
      selectMaterial,
      onSubmitMaterial,
      onSubmitFormula,
      eliminarMaterial,
      abrirModalEditarMaterial,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);
app.component("modal-base", ModalBase);
app.component("auto-complete", AutoComplete);

app.mount("#app");
