import { Axiomi } from "./api.js";
import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import ModalBase from "./components/modal_base.js";
import AutoComplete from "./components/autoComplete.js";
import Spinner from "./components/spinner.js";
import { getMateriales, formatNombreLista } from "./utils.js";
const { createApp, ref, onMounted, reactive, computed } = Vue;

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
    const folderDB = ref(null);
    const formulaDB = ref(null);
    const formFormula = reactive({
      nombre: "",
      materiales: [],
    });
    const formMaterial = ref({ ...formMaterialVacio });
    const modalEl = ref(null);

    // Computed properties
    const heading = computed(() => {
      let header = "";
      if (folderDB.value?.nombre) {
        header = `${folderDB.value.nombre} - `;
      }
      if (formulaDB.value?.nombre) {
        header += formulaDB.value.nombre;
      } else {
        header += "Nueva fórmula";
      }
      return header;
    });

    const materialesFormateados = computed(() => {
      return materialesDB.value.map((material) => {
        return {
          id: material._id,
          nombre: formatNombreLista(material),
        };
      });
    });

    const modoEdicion = computed(() => {
      return !!id_formula;
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
      return !folderDB.value?._id;
    });

    // Methods
    const getMaterialesDb = async () => {
      const { error, data } = await getMateriales();
      if (!error) {
        materialesDB.value = data;
      }
    };

    const getFormula = async () => {
      const { error, data } = await Axiomi.get(`formulas/${id_formula}`);
      if (!error) {
        formulaDB.value = data;

        const { nombre, materiales } = data;

        const materialesFormateados = materiales.map((material) => {
          const { id, formulas, cantidad } = material;

          const materialDB = materialesDB.value.find(({ _id }) => _id === id);

          return {
            id,
            nombre: formatNombreLista(materialDB),
            cantidad: cantidad,
            ancho: formulas.ancho,
            alto: formulas.alto,
          };
        });

        Object.assign(formFormula, {
          nombre,
          materiales: materialesFormateados,
        });
      }
    };

    const getFolder = async (id_folder) => {
      const { error, data } = await Axiomi.get(
        `folders-formulas/${id_folder}/basic`,
      );
      if (!error) {
        folderDB.value = data;
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
      const request = modoEdicion.value
        ? Axiomi.put(`formulas/${id_formula}`, formFormula)
        : Axiomi.post("formulas", {
            id_folder,
            ...formFormula,
          });
      const { error } = await request;

      if (!error) {
        redirectToFolder();
      }
    };

    const redirectToFolder = () => {
      if (esFormulaHuerfana.value) {
        location.href = `/formulas.html`;
      } else {
        location.href = `/folder-formula.html?id_folder=${folderDB.value?._id}`;
      }
    };

    const onSubmitFormula = async () => {
      try {
        isLoading.value = true;
        await guardarFormula();
      } catch (error) {
        alert(error.message);
      } finally {
        isLoading.value = false;
      }
    };

    const eliminarFormula = async () => {
      if (!confirm("¿Estás seguro de querer eliminar esta fórmula?")) {
        return;
      }
      try {
        isLoading.value = true;
        const { error } = await Axiomi.delete(`formulas/${id_formula}`);
        if (!error) {
          redirectToFolder();
        }
      } catch (error) {
        console.log(error);
        alert("Error al eliminar la fórmula");
      } finally {
        isLoading.value = false;
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
        if (id_formula) {
          await getFormula();
        }
        if (id_folder || formulaDB.value?.id_folder) {
          await getFolder(id_folder || formulaDB.value?.id_folder);
        }
      } catch (error) {
        console.log(error);
        alert("Error al obtener los datos");
      } finally {
        firstLoad.value = false;
      }
    });

    return {
      folderDB,
      formulaDB,
      modalEl,
      heading,
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
      eliminarFormula,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("loader-iguana", LoaderIguana);
app.component("modal-base", ModalBase);
app.component("auto-complete", AutoComplete);
app.component("spinner", Spinner);

app.mount("#app");
