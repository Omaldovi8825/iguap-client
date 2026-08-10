import { Axiomi } from "./api.js";
import { fetchMateriales, formatNombreTabla, formatFormula } from "./utils.js";
import FormMaterial from "./components/form_material.js";
import HeaderBack from "./components/headerBack.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const id_formula = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const isLoading = ref(false);
    const materialesDB = ref([]);

    const nuevaFormula = ref({
      _id: "",
      nombre: "",
      materiales: [],
    });

    // Computed properties
    const heading = computed(() => {
      return nuevaFormula.value._id
        ? nuevaFormula.value.nombre
        : "Nueva formula";
    });

    const modoEdicion = computed(() => !!nuevaFormula.value._id);

    const materialesFormula = computed(() => {
      return nuevaFormula.value.materiales.map((material) => {
        const materialDB = materialesDB.value.find(
          (m) => m.id === Number(material.id),
        );
        return {
          id: material.id,
          nombre: formatNombreTabla(materialDB),
          cantidad: material.cantidad,
          formula: formatFormula(material.formulas),
          formulas: { ...material.formulas },
        };
      });
    });

    // Methods
    const cargarMaterialesDB = async () => {
      materialesDB.value = await fetchMateriales();
    };

    const cargarFormulaDB = async () => {
      const { error, data } = await Axiomi.get(`formulas/${id_formula}`);
      if (!error) {
        nuevaFormula.value = data;
      }
    };

    const agregarMaterial = (material) => {
      nuevaFormula.value.materiales.push(material);
    };

    const eliminarMaterial = (index) => {
      nuevaFormula.value.materiales.splice(index, 1);
    };

    const guardarFormula = async () => {
      if (!nuevaFormula.value.nombre.trim()) {
        alert("asigna el nombre de la fórmula");
        return;
      }

      if (nuevaFormula.value.materiales.length === 0) {
        alert("agrega al menos un material");
        return;
      }

      isLoading.value = true;
      try {
        let err;
        if (modoEdicion.value) {
          const { error } = await Axiomi.put(
            `formulas/${nuevaFormula.value._id}`,
            nuevaFormula.value,
          );
          err = error;
        } else {
          const { error } = await Axiomi.post("formulas", nuevaFormula.value);
          err = error;
        }
        if (!err) {
          location.href = "./";
        }
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      isLoading.value = true;
      try {
        await cargarMaterialesDB();
        if (id_formula) {
          await cargarFormulaDB();
        }
      } catch (error) {
        console.log(error);
        alert("Error al cargar la data");
      } finally {
        isLoading.value = false;
      }
    });

    return {
      heading,
      modoEdicion,
      isLoading,
      nuevaFormula,
      materialesFormula,
      materialesDB,
      agregarMaterial,
      eliminarMaterial,
      guardarFormula,
    };
  },
});

app.component("form-material", FormMaterial);
app.component("header-back", HeaderBack);

app.mount("#app");
