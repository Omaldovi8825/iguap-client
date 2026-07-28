import {
  fetchMateriales,
  formatMoney,
  formatPrecios,
  formatMMateriales,
  cmAm,
  ajustesMedidas,
} from "./utils.js";
import { PERFILES, LARGO_PERFIL } from "./constants.js";
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
          jaladeras: {
            id: "",
            cantidad: 1,
          },
          vinil: {
            id: "",
            medida: 0,
          },
          silicon: 0,
          mosquitero: {
            hay: false,
            tipo: "fijo",
          },
          desglose: {
            show: false,
          },
          formulaMedidas: {
            show: false,
          },
        },
      ],
      manoObra: {
        porcentaje: 0,
      },
      extras: 0,
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
      const medidasPerfilDisponibles =
        materialesFormat.value.ventana.perfil?.map((item) => item.medida) || [];
      const medidasVidrioDisponibles =
        materialesFormat.value.ventana.vidrio?.map((item) => item.medida) || [];
      const medidasCarretillaDisponibles =
        materialesFormat.value.ventana.carretilla?.map((item) => item.medida) ||
        [];

      const opttions = {
        ventana: {
          perfil: {
            medidas: [...new Set(medidasPerfilDisponibles)],
          },
          vidrio: {
            medidas: [...new Set(medidasVidrioDisponibles)],
          },
          carretilla: {
            medidas: [...new Set(medidasCarretillaDisponibles)],
          },
        },
      };

      return opttions;
    });

    const desgloseCotizacion = computed(() => {
      const piezas = cotizacion.piezas.map((pieza) => {
        const anchoM = cmAm(pieza.medidas.ancho);
        const altoM = cmAm(pieza.medidas.alto);

        switch (pieza.pieza) {
          case "ventana":
            //perfiles
            const perfilesElegidos = materialesFormat.value.ventana.perfil
              ?.filter(
                (item) =>
                  item.medida == pieza.perfiles.medida &&
                  item.color == pieza.perfiles.color,
              )
              .reduce(
                (acc, item) => {
                  acc[item.material] = item.precio / LARGO_PERFIL;
                  return acc;
                },
                {
                  riel: 0,
                  chambrana: 0,
                  zoclo: 0,
                  traslape: 0,
                  cerco: 0,
                },
              );

            const pRiel = anchoM * (perfilesElegidos?.riel || 0);
            const pChambrana =
              (2 * altoM + anchoM) * (perfilesElegidos?.chambrana || 0);
            const pZoclo = 2 * anchoM * (perfilesElegidos?.zoclo || 0);
            const pTraslape = 2 * altoM * (perfilesElegidos?.traslape || 0);
            const pCerco = 2 * altoM * (perfilesElegidos?.cerco || 0);

            //vidrio
            const pVidrioElegido =
              materialesFormat.value.ventana.vidrio?.find(
                (item) => item.id == pieza.vidrio.id,
              )?.precio || 0;
            const pVidrio = anchoM * altoM * pVidrioElegido;

            //carretillas
            const pCarretillasElegidas =
              materialesFormat.value.ventana.carretilla?.find(
                (item) => item.id == pieza.carretillas.id,
              )?.precio || 0;
            const pCarretillas =
              pCarretillasElegidas * pieza.carretillas.cantidad;

            //jaladeras
            const pJaladerasElegidas =
              materialesFormat.value.ventana.jaladera?.find(
                (item) => item.id == pieza.jaladeras.id,
              )?.precio || 0;
            const pJaladeras = pJaladerasElegidas * pieza.jaladeras.cantidad;

            //vinil
            const pVinilElegido =
              materialesFormat.value.ventana.vinil?.find(
                (item) => item.id == pieza.vinil.id,
              )?.precio || 0;
            const pVinil = cmAm(pieza.vinil.medida) * pVinilElegido;

            //silicon
            const pSilicon = pieza.silicon;

            const totalVentana =
              pRiel +
              pChambrana +
              pZoclo +
              pTraslape +
              pCerco +
              pVidrio +
              pCarretillas +
              pJaladeras +
              pVinil +
              pSilicon;

            const totalMosquitero = 0;

            return {
              ventana: {
                riel: pRiel,
                chambrana: pChambrana,
                zoclo: pZoclo,
                traslape: pTraslape,
                cerco: pCerco,
                vidrio: pVidrio,
                carretillas: pCarretillas,
                jaladeras: pJaladeras,
                vinil: pVinil,
                silicon: pSilicon,
                total: totalVentana,
              },
              mosquitero: {
                total: totalMosquitero,
              },
              total: totalVentana + totalMosquitero,
            };
        }
      });

      const totalPiezas = piezas.reduce((acc, pieza) => acc + pieza.total, 0);
      const totalManoObra =
        totalPiezas * (cotizacion.manoObra.porcentaje / 100);
      const totalExtras = cotizacion.extras;

      return {
        piezas,
        totalPiezas,
        totalManoObra,
        totalExtras,
        total: totalPiezas + totalManoObra + totalExtras,
      };
    });

    const medidasConFormula = computed(() => {
      const medidas = cotizacion.piezas.map((pieza) => {
        switch (pieza.pieza) {
          case "ventana":
            const pulgadaSelec =
              ajustesMedidas.ventana.riel.pulgadas[pieza.perfiles.medida];
            const ancho = pieza.medidas.ancho;
            const alto = pieza.medidas.alto;

            return [
              {
                material: "riel",
                cantidad: 1,
                medida: { ancho },
              },
              {
                material: "chambrana",
                cantidad: 1,
                medida: { ancho },
              },
              {
                material: "chambrana",
                cantidad: 2,
                medida: { alto: alto - pulgadaSelec.chambrana.alto.resta },
              },
              {
                material: "zoclo",
                cantidad: 4,
                medida: {
                  ancho:
                    (ancho - pulgadaSelec.zoclo.ancho.resta) /
                    pulgadaSelec.zoclo.ancho.division,
                },
              },
              {
                material: "traslape",
                cantidad: 1,
                medida: { alto: alto - pulgadaSelec.traslape[0].alto.resta },
              },
              {
                material: "traslape",
                cantidad: 1,
                medida: { alto: alto - pulgadaSelec.traslape[1].alto.resta },
              },
              {
                material: "cerco",
                cantidad: 1,
                medida: { alto: alto - pulgadaSelec.cerco[0].alto.resta },
              },
              {
                material: "cerco",
                cantidad: 1,
                medida: { alto: alto - pulgadaSelec.cerco[1].alto.resta },
              },
              {
                material: "vidrio",
                cantidad: 1,
                medida: {
                  ancho:
                    (ancho - pulgadaSelec.vidrio[0].ancho.resta) /
                      pulgadaSelec.vidrio[0].ancho.division +
                    pulgadaSelec.vidrio[0].ancho.suma,
                  alto: pieza.medidas.alto - pulgadaSelec.vidrio[0].alto.resta,
                },
              },
              {
                material: "vidrio",
                cantidad: 1,
                medida: {
                  ancho:
                    (pieza.medidas.ancho - pulgadaSelec.vidrio[1].ancho.resta) /
                      pulgadaSelec.vidrio[1].ancho.division +
                    pulgadaSelec.vidrio[1].ancho.suma,
                  alto: pieza.medidas.alto - pulgadaSelec.vidrio[1].alto.resta,
                },
              },
            ];
        }
      });
      return medidas;
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

    const carretillaDisponibles = (iPieza) => {
      const medidaCarretilla = cotizacion.piezas[iPieza].carretillas.medida;
      const carretillasDisponibles =
        materialesFormat.value.ventana.carretilla?.filter(
          (item) => item.medida == medidaCarretilla,
        );
      return carretillasDisponibles;
    };

    const calcular = () => {
      alert("Calcular");
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
      desgloseCotizacion,
      medidasConFormula,
      coloresPerfilDisponibles,
      vidrioDisponibles,
      carretillaDisponibles,
      calcular,
      formatMoney,
    };
  },
}).mount("#app");
