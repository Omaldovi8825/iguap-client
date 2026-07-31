import { Axiomi } from "./api.js";
import { fetchMateriales, formatNombreTabla, formatFormula } from "./utils.js";
import FormMaterial from "./components/form_material.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    const isLoading = ref(false);
    const materialesDB = ref([]);

    const nuevaFormula = reactive({
      nombre: "",
      materiales: [],
    });

    const cargarMaterialesDB = async () => {
      try {
        isLoading.value = true;
        const rMateriales = await fetchMateriales();
        // const mappedPrecios = formatPrecios(rMateriales);
        materialesDB.value = rMateriales;
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    // Computed properties
    const materialesFormula = computed(() => {
      return nuevaFormula.materiales.map((material) => {
        const materialDB = materialesDB.value.find(
          (m) => m.id === Number(material.id),
        );
        return {
          id: material.id,
          nombre: formatNombreTabla(materialDB),
          cantidad: material.cantidad,
          formula: formatFormula(material.formulas),
        };
      });
    });

    // Methods
    const agregarMaterial = (material) => {
      nuevaFormula.materiales.push(material);
    };

    const eliminarMaterial = (idex) => {
      nuevaFormula.materiales.splice(idex, 1);
    };

    const guardarFormula = async () => {
      if (!nuevaFormula.nombre.trim()) {
        alert("asigna el nombre de la fórmula");
        return;
      }

      if (nuevaFormula.materiales.length === 0) {
        alert("agrega al menos un material");
        return;
      }

      isLoading.value = true;
      try {
        const req = await Axiomi.post("formulas", nuevaFormula);
        const res = await req.json();
        console.log("Formula guardada:", res);
        location.href = "./";
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await cargarMaterialesDB();
    });

    return {
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

app.mount("#app");
