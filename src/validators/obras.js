import { STATUS_OBRA } from "../constants/status.js";

const TIPOS_OBRA = ["quadro", "escultura"];

export function validarObra(dados) {
  const erros = [];

  if (!TIPOS_OBRA.includes(dados.tipo)) {
    erros.push("Informe um tipo de obra válido (quadro ou escultura).");
  }
  if (!dados.artista?.trim()) {
    erros.push("Informe o nome do artista.");
  }
  if (!dados.tecnica?.trim()) {
    erros.push("Informe a técnica/descrição dos materiais.");
  }

  const ano = Number(dados.ano);
  if (!Number.isInteger(ano) || ano < 1900 || ano > new Date().getFullYear()) {
    erros.push("Informe um ano válido.");
  }

  if (separarTecnicas(dados.tecnicas).length === 0) {
    erros.push("Informe pelo menos uma técnica ou material para os filtros.");
  }

  if (!(Number(dados.largura_cm) > 0)) {
    erros.push("Informe uma largura maior que zero, em centímetros.");
  }
  if (!(Number(dados.altura_cm) > 0)) {
    erros.push("Informe uma altura maior que zero, em centímetros.");
  }
  if (dados.tipo === "escultura" && !(Number(dados.profundidade_cm) > 0)) {
    erros.push("Informe uma profundidade maior que zero, em centímetros, para esculturas.");
  }

  return erros;
}

export function validarStatus(status) {
  if (!STATUS_OBRA.includes(status)) {
    return [`Status inválido. Use um dos seguintes: ${STATUS_OBRA.join(", ")}.`];
  }
  return [];
}

export function separarTecnicas(valor) {
  const itens = Array.isArray(valor) ? valor : typeof valor === "string" ? valor.split(",") : [];
  const tecnicas = new Map();
  for (const item of itens) {
    if (typeof item !== "string") continue;
    const nome = item.trim();
    if (nome && !tecnicas.has(nome.toLocaleLowerCase())) {
      tecnicas.set(nome.toLocaleLowerCase(), nome);
    }
  }
  return [...tecnicas.values()];
}
