import HeaderBack from "./components/headerBack.js";
import Spinner from "./components/spinner.js";
import LoaderIguana from "./components/loader_iguana.js";
import { Axiomi } from "./api.js";
import { formatDate, aplicarFormula, cmAm, formatMoney } from "./utils.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const idExpediente = new URLSearchParams(window.location.search).get("id");

const app = createApp({
  setup() {
    const initialLoad = ref(true);
    const isLoading = ref(false);
    const expediente = ref({
      _id: null,
      nombre: "",
      createdAt: "",
    });
    const cotizaciones = ref([]);

    // Methods
    const getExpediente = async () => {
      const { error, data } = await Axiomi.get(`expedientes/${idExpediente}`);
      if (!error) {
        expediente.value = data;
      } else {
        throw new Error(data);
      }
    };

    const getCotizacionesExpediente = async () => {
      const { error, data } = await Axiomi.get(
        `cotizaciones?id_expediente=${idExpediente}`,
      );
      if (!error) {
        cotizaciones.value = data;
      } else {
        throw new Error(data);
      }
    };

    const eliminarCotizacion = async (idCotizacion) => {
      if (!confirm("¿Estás seguro de eliminar esta cotización?")) {
        return;
      }
      try {
        isLoading.value = true;
        const { error } = await Axiomi.delete(`cotizaciones/${idCotizacion}`);
        if (!error) {
          await getCotizacionesExpediente();
        }
      } catch (error) {
        console.error(error);
        alert("Error al eliminar la cotización");
      } finally {
        isLoading.value = false;
      }
    };

    // const cotizacion = computed(() => {
    //   const materiales = formCotizacion.materiales.map((material) => {
    //     const materialEncontrado = materialesDB.value.find(
    //       (m) => m._id === material.id,
    //     );

    //     const ancho = aplicarFormula(
    //       formCotizacion.ancho,
    //       material.formulas.ancho,
    //     );
    //     const alto = aplicarFormula(
    //       formCotizacion.alto,
    //       material.formulas.alto,
    //     );

    //     const factorAncho = ancho ? cmAm(ancho) : 1;
    //     const factorAlto = alto ? cmAm(alto) : 1;
    //     const precioMaterial = material.precio || materialEncontrado.precio;

    //     const precio =
    //       factorAncho * factorAlto * precioMaterial * material.cantidad;

    //     return {
    //       id: material.id,
    //       nombre: formatNombreLista(materialEncontrado),
    //       cantidad: material.cantidad,
    //       formulas: {
    //         ancho: material.formulas.ancho,
    //         alto: material.formulas.alto,
    //       },
    //       medidas: {
    //         ancho,
    //         alto,
    //       },
    //       precio,
    //     };
    //   });

    //   const totalMateriales = materiales.reduce(
    //     (acc, material) => acc + material.precio,
    //     0,
    //   );
    //   const manoObra = formCotizacion.manoObra
    //     ? (totalMateriales * formCotizacion.manoObra) / 100
    //     : 0;
    //   const extras = formCotizacion.extras || 0;

    //   return {
    //     materiales,
    //     desglose: {
    //       materiales: totalMateriales,
    //       manoObra,
    //       extras,
    //       total: totalMateriales + manoObra + extras,
    //     },
    //   };
    // });

    //Computed properties
    const contizacionesTabla = computed(() => {
      return cotizaciones.value.map((cotizacion) => {
        const { _id, nombre, createdAt, manoObra, extras } = cotizacion;
        const precioMateriales = cotizacion.materiales
          .map((material) => {
            const ancho = aplicarFormula(
              cotizacion.ancho,
              material.formulas.ancho,
            );
            const alto = aplicarFormula(
              cotizacion.alto,
              material.formulas.alto,
            );

            const factorAncho = ancho ? cmAm(ancho) : 1;
            const factorAlto = alto ? cmAm(alto) : 1;
            const precioMaterial = material.precio;

            const precio =
              factorAncho * factorAlto * precioMaterial * material.cantidad;

            return precio;
          })
          .reduce((acc, precio) => acc + precio, 0);

        const totalManoObra = manoObra
          ? (precioMateriales * manoObra) / 100
          : 0;
        const totalExtras = extras || 0;

        const total = precioMateriales + totalManoObra + totalExtras;

        return {
          id: _id,
          nombre,
          fecha: formatDate(createdAt),
          precio: formatMoney(total),
        };
      });
    });

    //life cycle
    onMounted(async () => {
      try {
        await getExpediente();
        await getCotizacionesExpediente();
      } catch (error) {
        console.error(error);
        alert("Error al obtener el expediente");
      } finally {
        initialLoad.value = false;
      }
    });
    return {
      initialLoad,
      isLoading,
      expediente,
      cotizaciones,
      contizacionesTabla,
      eliminarCotizacion,
    };
  },
});

app.component("header-back", HeaderBack);
app.component("spinner", Spinner);
app.component("loader-iguana", LoaderIguana);

app.mount("#app");
