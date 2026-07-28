import { PERFILES, LARGO_PERFIL, CACHE_KEY, MODE_DEV } from "./constants.js";

export async function fetchMateriales() {
  const cache = localStorage.getItem(CACHE_KEY);

  if (MODE_DEV && cache) {
    console.log("materiales desde cache");
    return JSON.parse(cache);
  }

  const sheet_url =
    "https://docs.google.com/spreadsheets/d/1C16P7bP0PJlt-YoZgees26u1_LZBA0QXeWtVt8jRDdw/gviz/tq?tqx=out:json";
  // const sheet_url =
  //   "https://docs.google.com/spreadsheets/d/1wmXROoVzFNSH2bQYDdBEgbjcfyHvpKE0S8qklIiTq_8/gviz/tq?tqx=out:json&gid=0";

  const req = await fetch(sheet_url);
  const text = await req.text();
  const json = JSON.parse(
    text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1),
  );
  const data = json.table.rows.map((row) => {
    const columns = json.table.cols.map((col) => col.label);
    const obj = {};

    row.c.forEach((cell, index) => {
      obj[columns[index]] = cell ? cell.v : null;
    });

    return obj;
  });

  localStorage.setItem(CACHE_KEY, JSON.stringify(data));

  return data;
}

export const formatMoney = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPrecios = (materiales) => {
  return materiales.map((item) => {
    if (PERFILES.includes(item.nombre)) {
      return {
        ...item,
        precio: item.precio / LARGO_PERFIL,
      };
    }
    return item;
  });
};

export const formatMMateriales = (materialesDB) => {
  const mat = {
    ventana: {},
  };

  for (const item of materialesDB) {
    if (item.pieza === "ventana") {
      if (!mat.ventana[item.categoria]) {
        mat.ventana[item.categoria] = [];
      }
      mat.ventana[item.categoria].push(item);
    }
  }

  return mat;
};

export const ajustesMedidas = {
  ventana: {
    riel: {
      pulgadas: {
        2: {
          chambrana: {
            alto: {
              resta: 2.7,
            },
          },
          zoclo: {
            ancho: {
              resta: 16.2,
              division: 2,
            },
          },
          traslape: [
            {
              alto: {
                resta: 3.2,
              },
            },
            {
              alto: {
                resta: 4.1,
              },
            },
          ],
          cerco: [
            {
              alto: {
                resta: 3.2,
              },
            },
            {
              alto: {
                resta: 4.1,
              },
            },
          ],
          vidrio: [
            {
              ancho: {
                resta: 16.2,
                division: 2,
                suma: 1.6,
              },
              alto: {
                resta: 8.7,
              },
            },
            {
              ancho: {
                resta: 16.2,
                division: 2,
                suma: 1.6,
              },
              alto: {
                resta: 9.6,
              },
            },
          ],
        },
        3: {
          chambrana: {
            alto: {
              resta: 2.7,
            },
          },
          zoclo: {
            ancho: {
              resta: 18,
              division: 2,
            },
          },
          traslape: [
            {
              alto: {
                resta: 3.2,
              },
            },
            {
              alto: {
                resta: 4.1,
              },
            },
          ],
          cerco: [
            {
              alto: {
                resta: 3.2,
              },
            },
            {
              alto: {
                resta: 4.1,
              },
            },
          ],
          vidrio: [
            {
              ancho: {
                resta: 18,
                division: 2,
                suma: 2,
              },
              alto: {
                resta: 13.2,
              },
            },
            {
              ancho: {
                resta: 18,
                division: 2,
                suma: 2,
              },
              alto: {
                resta: 14.1,
              },
            },
          ],
        },
      },
    },
  },
};

export const cmAm = (cm) => cm / 100;
