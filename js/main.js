import { fetchMateriales, formatMoney } from "./utils.js";
const { createApp, ref, onMounted, reactive, watch, computed, nextTick } = Vue;

const PERFILES = ["riel", "chambrana", "traslape", "zoclo", "cerco"];
const LARGO_PERFIL = 6.1; // Largo de perfil en m

createApp({
  setup() {
    const cotizacion = reactive({
      secciones: [
        {
          form: {
            pieza: "",
            pulgadas: "",
            color: "",
            ancho: 0,
            alto: 0,
            carretillas: 2,
            jaladeras: 1,
            empaque: 0,
            silicon: 0,
          },
          pulgadasDisponibles: [],
          coloresDisponibles: [],
        },
      ],
    });
    const isLoading = ref(false);
    const materialesDB = ref([]);

    const cargarMaterialesDB = async () => {
      try {
        isLoading.value = true;
        const precios = await fetchMateriales();
        const mappedPrecios = precios.map((item) => {
          if (PERFILES.includes(item.nombre)) {
            return {
              ...item,
              precio: item.precio / LARGO_PERFIL,
            };
          }
          return item;
        });
        materialesDB.value = mappedPrecios;
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
    };

    const reiniciarSelects = async () => {
      await nextTick();
      const elems = document.querySelectorAll("select");
      // Destruir instancias existentes primero
      elems.forEach((el) => {
        const instance = M.FormSelect.getInstance(el);
        if (instance) instance.destroy();
      });
      M.FormSelect.init(elems);
      M.updateTextFields();

      // para móvil
      // elems.forEach((el) => {
      //   el.addEventListener("change", () => {
      //     el.dispatchEvent(new Event("change", { bubbles: true }));
      //   });
      // });
    };

    // const calcular = () => {
    //   alert("Calcular");
    // };

    // Computed properties
    const piezasDisponibles = computed(() => {
      return [...new Set(materialesDB.value.map((item) => item.pieza))];
    });

    const desglose = computed(() => {
      const d = cotizacion.secciones.map((item, index) => {
        const {
          pieza,
          pulgadas,
          color,
          ancho,
          alto,
          carretillas,
          jaladeras,
          empaque,
          silicon,
        } = item.form;

        const precios = materialesDB.value.reduce(
          (acc, item) => {
            if (item.pieza === pieza) {
              if (item.pulgadas === Number(pulgadas)) {
                //precio perfiles
                if (PERFILES.includes(item.nombre) && item.color === color) {
                  acc[item.nombre] = item.precio;
                }
                //precio carretillas
                if (["carretillas"].includes(item.nombre)) {
                  acc[item.nombre] = item.precio;
                }
              }
              //precio extras
              if (["vidrio", "jaladeras"].includes(item.nombre)) {
                acc[item.nombre] = item.precio;
              }
            }

            //precio empaque
            if (["vinyl"].includes(item.nombre)) {
              acc[item.nombre] = item.precio;
            }

            return acc;
          },
          {
            riel: 0,
            chambrana: 0,
            zoclo: 0,
            traslape: 0,
            cerco: 0,
            vidrio: 0,
            jaladeras: 0,
            carretillas: 0,
            vinyl: 0,
          },
        );

        const totalCmChambrana = ancho + 2 * (alto - 2.7);
        const totalCmZoclo = 4 * ((ancho - 16.2) / 2);
        const totalCmTraslape = alto - 3.2 + (alto - 4.1);
        const totalCmCerco = alto - 3.2 + (alto - 4.1);
        const totalCm2Vidrio1 = ((ancho - 16.2) / 2 + 1.6) * (alto - 8.7);
        const totalCm2Vidrio2 = ((ancho - 16.2) / 2 + 1.6) * (alto - 9.6);

        const pRiel = precios.riel * (ancho / 100);
        const pChambrana = precios.chambrana * (totalCmChambrana / 100);
        const pZoclo = precios.zoclo * (totalCmZoclo / 100);
        const pTraslape = precios.traslape * (totalCmTraslape / 100);
        const pCerco = precios.cerco * (totalCmCerco / 100);
        const pVidrio =
          precios.vidrio * ((totalCm2Vidrio1 + totalCm2Vidrio2) / 10000);
        const pJaladeras = precios.jaladeras * jaladeras;
        const pCarretillas = precios.carretillas * carretillas;
        const pVinyl = precios.vinyl * (empaque / 100);

        return {
          pieza: pieza,
          precios: {
            riel: pRiel,
            chambrana: pChambrana,
            zoclo: pZoclo,
            traslape: pTraslape,
            cerco: pCerco,
            vidrio: pVidrio,
            jaladeras: pJaladeras,
            carretillas: pCarretillas,
            vinyl: pVinyl,
            silicon,
          },
          total:
            pRiel +
            pChambrana +
            pZoclo +
            pTraslape +
            pCerco +
            pVidrio +
            pJaladeras +
            pCarretillas +
            pVinyl +
            silicon,
        };
      });

      return d;
    });

    // const perfilesCotizacion = computed(() => {
    //   return materialesDB.value.filter((item) => {
    //     return (
    //       item.pieza === formCotizacion[0].pieza &&
    //       item.color === formCotizacion[0].color &&
    //       item.pulgadas === Number(formCotizacion[0].pulgadas) &&
    //       PERFILES.includes(item.nombre)
    //     );
    //   });
    // });

    // Lifecycle hooks
    onMounted(async () => {
      await cargarMaterialesDB();
      await reiniciarSelects();
    });

    //Watchers

    // actualizar pulgadasDisponibles
    watch(
      () => cotizacion.secciones.map((item) => item.form.pieza),
      (newPiezas, oldPiezas) => {
        newPiezas.forEach(async (pieza, index) => {
          if (pieza !== oldPiezas[index]) {
            // console.log(`Cambió pieza en índice ${index}:`, pieza);
            const pulgadasDisponibles = [
              ...new Set(
                materialesDB.value
                  .filter(
                    (item) =>
                      item.pieza === pieza && PERFILES.includes(item.nombre),
                  )
                  .map((item) => item.pulgadas),
              ),
            ];

            cotizacion.secciones[index].pulgadasDisponibles =
              pulgadasDisponibles;
            cotizacion.secciones[index].form.pulgadas = pulgadasDisponibles[0];
            await reiniciarSelects();
          }
        });
      },
    );

    //actualizar colores PERFILES
    watch(
      () => cotizacion.secciones.map((item) => item.form.pulgadas),
      (newPiezas, oldPiezas) => {
        newPiezas.forEach(async (pulgadas, index) => {
          if (pulgadas !== oldPiezas[index]) {
            // console.log(`Cambió pieza en índice ${index}:`, pulgadas);
            const coloresDisponibles = [
              ...new Set(
                materialesDB.value
                  .filter(
                    (item) =>
                      item.pieza === cotizacion.secciones[index].form.pieza &&
                      item.pulgadas === Number(pulgadas) &&
                      PERFILES.includes(item.nombre),
                  )
                  .map((item) => item.color),
              ),
            ];

            cotizacion.secciones[index].coloresDisponibles = coloresDisponibles;
            cotizacion.secciones[index].form.color = coloresDisponibles[0];
            await reiniciarSelects();
          }
        });
      },
    );

    return {
      cotizacion,
      isLoading,
      materialesDB,
      piezasDisponibles,
      desglose,
      formatMoney,
      // calcular,
    };
  },
}).mount("#app");
