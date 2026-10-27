import { Axiomi } from "./api.js";
const { createApp, ref, onMounted } = Vue;

const app = createApp({
  setup() {
    const isLoading = ref(false);

    const startLoading = async () => {
      isLoading.value = true;
      try {
        await Axiomi.load();
      } catch (error) {
        alert("Error al iniciar la capp");
      } finally {
        isLoading.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await startLoading();
    });

    return {
      isLoading,
    };
  },
});

app.mount("#app");
