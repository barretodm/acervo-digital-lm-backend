export function validarInteresse(dados) {
  const erros = [];

  if (!dados.obra_id) erros.push("Informe a obra de interesse.");
  if (!dados.nome?.trim()) erros.push("Informe o nome completo.");
  if (!dados.email?.trim()) erros.push("Informe o e-mail.");
  if (!dados.telefone?.trim()) erros.push("Informe o telefone.");
  if (dados.consentimento_lgpd !== true) {
    erros.push("É necessário aceitar o uso dos dados (LGPD) para enviar o interesse.");
  }

  return erros;
}
