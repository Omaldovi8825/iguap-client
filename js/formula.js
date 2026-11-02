import { Axiomi } from "./api.js";
import HeaderBack from "./components/headerBack.js";
import LoaderIguana from "./components/loader_iguana.js";
import Spinner from "./components/spinner.js";
import ModalMaterial from "./components/modalMaterial.js";
import { getMateriales, formatNombreLista } from "./utils.js";
const { createApp, ref, onMounted, reactive, computed, nextTick } = Vue;

const id_folder = new URLSearchParams(window.location.search).get("id_folder");
const id_formula = new URLSearchParams(window.location.search).get("id");

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
    const modalMaterial = ref(null);
    const tbodyMateriales = ref(null);

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

    const modoEdicion = computed(() => {
      return !!id_formula;
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

    const agregarMaterial = (material) => {
      const { id, nombre, cantidad, ancho, alto } = material;
      formFormula.materiales.push({
        id,
        nombre,
        cantidad,
        ancho,
        alto,
      });
    };

    const editarMaterial = (material) => {
      const { id, nombre, cantidad, ancho, alto } = material;
      formFormula.materiales[material.index] = {
        id,
        nombre,
        cantidad,
        ancho,
        alto,
      };
    };

    const eliminarMaterial = (index) => {
      formFormula.materiales.splice(index, 1);
    };

    const abrirModalEditarMaterial = (index) => {
      const material = formFormula.materiales[index];
      modalMaterial.value.abrirModal({ index, ...material });
    };

    const onSubmitMaterial = (material) => {
      if (material.index === null) {
        agregarMaterial(material);
      } else {
        editarMaterial(material);
      }
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

    const initSortable = () => {
      if (!tbodyMateriales.value) return;
      Sortable.create(tbodyMateriales.value, {
        handle: ".drag-handle",
        animation: 150,
        delay: 120,
        delayOnTouchOnly: true,
        touchStartThreshold: 4,
        onEnd(evt) {
          const { oldIndex, newIndex, item, from } = evt;
          if (oldIndex === newIndex) return;
          const refChild =
            from.children[oldIndex + (oldIndex > newIndex ? 1 : 0)];
          from.insertBefore(item, refChild ?? null);
          const [moved] = formFormula.materiales.splice(oldIndex, 1);
          formFormula.materiales.splice(newIndex, 0, moved);
        },
      });
    };

    // Lifecycle hooks
    onMounted(async () => {
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
        await nextTick();
        initSortable();
      }
    });

    return {
      modalMaterial,
      tbodyMateriales,
      folderDB,
      formulaDB,
      heading,
      isLoading,
      firstLoad,
      formFormula,
      materialesDB,
      modoEdicion,
      enableSubmitFormula,
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
app.component("spinner", Spinner);
app.component("modal-material", ModalMaterial);

app.mount("#app");
