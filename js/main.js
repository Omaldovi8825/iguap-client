import { fetchMateriales, formatMoney, formatPrecios } from "./utils.js";
import { PERFILES } from "./constants.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

createApp({
  setup() {
    const isLoading = ref(false);
    const materialesDB = ref([]);
    const formNuevaPieza = ref("");
    const cotizacion = reactive({
      piezas: [],
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
    const optionsDisponibles = computed(() => {
      const items = materialesDB.value.reduce(
        (acc, item) => {
          if (!acc.piezas.includes(item.pieza)) {
            acc.piezas.push(item.pieza);
          }
          if (PERFILES.includes(item.material)) {
            if (!acc.medidasPerfil.includes(item.medida)) {
              acc.medidasPerfil.push(item.medida);
            }
            if (!acc.coloresPerfil.includes(item.color)) {
              acc.coloresPerfil.push(item.color);
            }
          }
          return acc;
        },
        {
          piezas: [],
          medidasPerfil: [],
          coloresPerfil: [],
        },
      );

      return items;
    });

    // const isVentanaSelected = computed(() => {
    //   return formNuevaPieza.value.pieza === "ventana";
    // });

    // Methods
    const cambiarMedidaPerfiles = (event, iPieza) => {
      const value = Number(event.target.value);
      cotizacion.piezas[iPieza].perfiles.forEach((perfil) => {
        perfil.medida = value;
      });
    };

    const cambiarColorPerfiles = (event, iPieza) => {
      const value = event.target.value;
      cotizacion.piezas[iPieza].perfiles.forEach((perfil) => {
        perfil.color = value;
      });
    };

    const agregarPieza = (pieza) => {
      switch (pieza) {
        case "ventana":
          cotizacion.piezas.push({
            pieza: "ventana",
            perfiles: PERFILES.map((perfil) => ({
              material: perfil,
              medida: optionsDisponibles.value.medidasPerfil[0] || 2,
              color: optionsDisponibles.value.coloresPerfil[0] || "blanco",
            })),
          });
          break;
      }

      //limpiar form
      resetFormaNuevaPieza();
    };

    // Lifecycle hooks
    onMounted(async () => {
      await cargarMaterialesDB();
      agregarPieza("ventana");
      // await reiniciarSelects();
    });

    return {
      isLoading,
      materialesDB,
      formNuevaPieza,
      // isVentanaSelected,
      cotizacion,
      optionsDisponibles,
      agregarPieza,
      cambiarMedidaPerfiles,
    };
  },
}).mount("#app");
