import {
  fetchMateriales,
  formatMoney,
  formatPrecios,
  formatMMateriales,
} from "./utils.js";
import { PERFILES } from "./constants.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

createApp({
  setup() {
    const isLoading = ref(false);
    const materialesDB = ref([]);
    const formNuevaPieza = ref("");
    const cotizacion = reactive({
      piezas: [
        {
          pieza: "ventana",
          medidas: {
            ancho: "",
            alto: "",
          },
          perfiles: {
            color: "",
            medida: 2,
          },
          vidrio: {
            medida: 2,
            id: "",
          },
          carretillas: {
            medida: 2,
            cantidad: 2,
            id: "",
          },
        },
      ],
    });

    const resetFormaNuevaPieza = () => {
      formNuevaPieza.value = "";
    };

    const cargarMaterialesDB = async () => {
      try {
        isLoading.value = true;
        const rMateriales = await fetchMateriales();
        const mappedPrecios = formatPrecios(rMateriales);
        materialesDB.value = mappedPrecios;
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    // Computed properties

    const materialesFormat = computed(() =>
      formatMMateriales(materialesDB.value),
    );

    const optionsDisponibles = computed(() => {
      const medidasPerfilDisponibles = [
        ...new Set(
          materialesFormat.value.ventana.perfil?.map((item) => item.medida) ||
            [],
        ),
      ];
      const medidasVidrioDisponibles = [
        ...new Set(
          materialesFormat.value.ventana.vidrio?.map((item) => item.medida) ||
            [],
        ),
      ];

      const opttions = {
        ventana: {
          perfil: {
            medidas: medidasPerfilDisponibles,
          },
          vidrio: {
            medidas: medidasVidrioDisponibles,
          },
          carretilla: {
            medidas: [],
          },
        },
      };

      return opttions;
    });

    // Methods
    const coloresPerfilDisponibles = (iPieza) => {
      const medidaPerfil = cotizacion.piezas[iPieza].perfiles.medida;
      const coloresDisponibles =
        materialesFormat.value.ventana.perfil
          ?.filter((item) => item.medida == medidaPerfil)
          .map((item) => item.color) || [];

      return [...new Set(coloresDisponibles)];
    };

    const vidrioDisponibles = (iPieza) => {
      const medidaVidrio = cotizacion.piezas[iPieza].vidrio.medida;
      const vidriosDisponibles = materialesFormat.value.ventana.vidrio?.filter(
        (item) => item.medida == medidaVidrio,
      );
      return vidriosDisponibles;
    };

    // Lifecycle hooks
    onMounted(async () => {
      await cargarMaterialesDB();
      // agregarPieza("ventana");
      // await reiniciarSelects();
    });

    return {
      isLoading,
      materialesDB,
      formNuevaPieza,
      // isVentanaSelected,
      cotizacion,
      optionsDisponibles,
      materialesFormat,
      coloresPerfilDisponibles,
      vidrioDisponibles,
    };
  },
}).mount("#app");
