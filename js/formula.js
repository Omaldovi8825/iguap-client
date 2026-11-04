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

    const idFolder = computed(() => {
      return id_folder || formulaDB.value?.id_folder;
    });

    const esFormulaHuerfana = computed(() => {
      return !idFolder.value;
    });

    // Methods
    const getMaterialesDb = async () => {
      const { error, data, mensaje } = await getMateriales();
      if (error) throw mensaje;
      materialesDB.value = data;
    };

    const getFormula = async () => {
      const { error, data, mensaje } = await Axiomi.get(
        `formulas/${id_formula}`,
      );
      if (error) throw mensaje;

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
    };

    const getFolder = async (id_folder) => {
      const { error, data, mensaje } = await Axiomi.get(
        `folders-formulas/${id_folder}`,
      );
      if (error) throw mensaje;
      folderDB.value = data;
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

    const redirectToFolder = () => {
      if (esFormulaHuerfana.value) {
        location.href = `/formulas.html`;
      } else {
        location.href = `/folder-formula.html?id_folder=${folderDB.value?._id}`;
      }
    };

    const onSubmitFormula = async () => {
      isLoading.value = true;
      const request = modoEdicion.value
        ? Axiomi.put(`formulas/${id_formula}`, formFormula)
        : Axiomi.post("formulas", {
            id_folder,
            ...formFormula,
          });
      const { error, mensaje } = await request;

      if (!error) {
        return redirectToFolder();
      }
      isLoading.value = false;
      alert(mensaje);
    };

    const eliminarFormula = async () => {
      if (!confirm("¿Estás seguro de querer eliminar esta fórmula?")) {
        return;
      }

      isLoading.value = true;
      const { error, mensaje } = await Axiomi.delete(`formulas/${id_formula}`);
      isLoading.value = false;
      if (error) {
        alert(mensaje);
        return;
      }
      redirectToFolder();
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
        if (idFolder.value) {
          await getFolder(idFolder.value);
        }
        firstLoad.value = false;
        await nextTick();
        initSortable();
      } catch (error) {
        alert(error);
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
