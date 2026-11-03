import { Axiomi } from "./api.js";

export const formatMoney = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("es-MX", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
};

export const cmAm = (cm) => cm / 100;

export const aplicarFormula = (valor, formula) => {
  if (!formula) return "";
  return formula.split(/(?=[-+*\/])/).reduce((acc, op) => {
    const operador = op[0];
    const num = Number(op.slice(1));
    if (operador === "+") return acc + num;
    if (operador === "-") return acc - num;
    if (operador === "*") return acc * num;
    if (operador === "/") return acc / num;
    return acc;
  }, valor);
};

export const formatFormula = ({ ancho, alto }) => {
  return [ancho && `B${ancho}`, alto && `A${alto}`].filter(Boolean).join(" x ");
};

export const formatMedida = (ancho, alto) => {
  return [ancho && ancho, alto && alto].filter(Boolean).join(" x ");
};

export const formatNombreTabla = ({
  categoria,
  nombre,
  pieza,
  tipo,
  medida,
  unidad,
  color,
}) => {
  return [categoria, nombre, pieza, tipo, medida, unidad, color]
    .filter(Boolean)
    .join(" ");
};

export const formatNombreLista = ({
  categoria,
  nombre,
  pieza,
  tipo,
  medida,
  unidad,
  color,
}) => {
  return [categoria, nombre, pieza, tipo, medida, unidad, color]
    .filter(Boolean)
    .join(" ");
};

export const getMateriales = () => {
  return Axiomi.get("materiales");
};
