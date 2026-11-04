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

export const logout = () => {
  localStorage.removeItem("token");
  location.replace("./login.html");
};

export const login = (token) => {
  localStorage.setItem("token", token);
  location.replace("./");
};
