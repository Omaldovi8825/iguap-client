import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    const formulasDb = ref([]);
    const isLoading = ref(false);

    //Methods
    const getFormulas = async () => {
      isLoading.value = true;
      try {
        const { error, data } = await Axiomi.get("formulas");
        if (!error) {
          formulasDb.value = data;
        }
      } catch (error) {
        console.error("Error al obtener las fórmulas:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const eliminarFormula = async (id) => {
      isLoading.value = true;
      try {
        const response = await Axiomi.delete(`formulas/${id}`);
        const { error, message } = await response.json();
        if (!error) {
          await getFormulas();
        }
      } catch (error) {
        console.error("Error al eliminar la fórmula:", error);
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await getFormulas();
    });

    return {
      formulasDb,
      isLoading,
      eliminarFormula,
    };
  },
});

app.component("new-formula", {
  template: `
    <div class="mb-3">
      <a
        href="./formula.html"
        class="btn btn-outline-primary btn-sm w-100"
      >
        Nueva fórmula
        <i class="bi bi-calculator"></i>
      </a>
    </div>
  `,
});

app.component("new-cotizacion", {
  template: `
    <div class="mb-3">
      <a
        href="./cotizacion.html"
        class="btn btn-outline-primary btn-sm w-100"
      >
        Nueva cotización
        <i class="bi bi-coin"></i>
      </a>
    </div>
  `,
});

app.mount("#app");
