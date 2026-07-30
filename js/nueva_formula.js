import { Axiomi } from "./api.js";
import { fetchMateriales } from "./utils.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

createApp({
  setup() {
    const isLoading = ref(false);
    const materialesDB = ref([]);
    const formMaterial = ref({
      id: "",
      cantidad: 1,
      formulas: {
        show: false,
        ancho: "",
        alto: "",
      },
    });
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
          ...material,
          ...materialDB,
        };
      });
    });

    // Methods
    const agregarMaterial = () => {
      nuevaFormula.materiales.push({
        ...formMaterial.value,
        id: Number(formMaterial.value.id),
        formulas: {
          ancho: formMaterial.value.formulas.ancho,
          alto: formMaterial.value.formulas.alto,
        },
      });

      resetFormMaterial();
    };

    const eliminarMaterial = (id) => {
      nuevaFormula.materiales = nuevaFormula.materiales.filter(
        (material) => material.id !== id,
      );
    };

    const guardarFormula = async () => {
      try {
        const req = await Axiomi.post("formula", nuevaFormula);
        const res = await req.json();
        console.log("Formula guardada:", res);
      } catch (error) {
        console.error(error);
      }
    };

    const resetFormMaterial = () => {
      formMaterial.value = {
        id: "",
        cantidad: 1,
        formulas: {
          show: false,
          ancho: "",
          alto: "",
        },
      };
    };

    // Lifecycle hooks
    onMounted(async () => {
      await cargarMaterialesDB();
      // nuevaFormula.materiales.push({
      //   id: 1,
      //   cantidad: 1,
      //   formula: {
      //     tipo: "ancho",
      //     formula: "-2",
      //   },
      // });
      // const res = await Axiomi.get("formula");
      // const data = await res.json();
      // console.log("Formulas obtenidas:", data);
    });

    return {
      isLoading,
      materialesDB,
      formMaterial,
      agregarMaterial,
      eliminarMaterial,
      nuevaFormula,
      materialesFormula,
      guardarFormula,
    };
  },
}).mount("#app");
