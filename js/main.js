import { Axiomi } from "./api.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const app = createApp({
  setup() {
    const formulasDb = ref([]);

    //Methods
    const getFormulas = async () => {
      try {
        const response = await Axiomi.get("formulas");
        const { error, data } = await response.json();
        if (!error) {
          formulasDb.value = data;
        }
      } catch (error) {
        console.error("Error al obtener las fórmulas:", error);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await getFormulas();
    });

    return {
      formulasDb,
    };
  },
});

app.component("new-formula", {
  template: `
    <div class="mb-3">
      <a
        href="./nueva-formula.html"
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
