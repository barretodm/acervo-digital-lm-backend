import nodemailer from "nodemailer";

function criarTransportador() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function notificarNovoInteresse(interesse, obra) {
  const transportador = criarTransportador();
  if (!transportador || !process.env.GALERISTA_EMAIL) {
    console.log("[e-mail desativado] notificaria sobre o interesse:", interesse.id);
    return;
  }

  const assunto = `Novo interesse: ${obra.artista}${obra.titulo ? ` — ${obra.titulo}` : ""}`;
  const texto = [
    "Novo interesse recebido no Acervo Digital LM.",
    "",
    `Obra: ${obra.artista} (${obra.ano}) — ${obra.tecnica}`,
    "",
    `Nome: ${interesse.nome}`,
    `E-mail: ${interesse.email}`,
    `Telefone: ${interesse.telefone}`,
    interesse.mensagem ? `Mensagem: ${interesse.mensagem}` : null,
  ]
    .filter((linha) => linha !== null)
    .join("\n");

  try {
    await transportador.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.GALERISTA_EMAIL,
      subject: assunto,
      text: texto,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de notificação:", error);
  }
}
