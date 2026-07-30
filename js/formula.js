import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

createApp({
  setup() {
    const formulaDb = ref([]);

    //Methods
    const getFormula = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const formulaId = urlParams.get("id");
        if (!formulaId) {
          console.error("No se proporcionó un ID de fórmula en la URL.");
          return;
        }
        const response = await Axiomi.get(`formulas/${formulaId}`);
        const { error, data } = await response.json();
        if (!error) {
          formulaDb.value = data;
        }
      } catch (error) {
        console.error("Error al obtener las fórmulas:", error);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await getFormula();
    });

    return {
      formulaDb,
    };
  },
}).mount("#app");
