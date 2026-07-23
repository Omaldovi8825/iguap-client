export async function fetchMateriales() {
  const sheet_url =
    "https://docs.google.com/spreadsheets/d/1C16P7bP0PJlt-YoZgees26u1_LZBA0QXeWtVt8jRDdw/gviz/tq?tqx=out:json";
  // const sheet_url =
  //   "https://docs.google.com/spreadsheets/d/1wmXROoVzFNSH2bQYDdBEgbjcfyHvpKE0S8qklIiTq_8/gviz/tq?tqx=out:json&gid=0";

  try {
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
    return data;
  } catch (error) {
    throw error;
  }
}

export const formatMoney = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
