using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace RutaUrbana.TareaProgramada.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task EnviarResumenCambiosAsync(List<string> destinatarios, List<string> cambios, DateTime fechaHora)
        {
            if (destinatarios == null || destinatarios.Count == 0)
            {
                _logger.LogWarning("No se encontró ningún Administrador activo en la base de datos; se omite el envío de correo.");
                return;
            }

            var mensaje = new MimeMessage();
            mensaje.From.Add(new MailboxAddress(_settings.RemitenteNombre, _settings.RemitenteCorreo));

            foreach (var correo in destinatarios)
            {
                mensaje.To.Add(MailboxAddress.Parse(correo));
            }

            mensaje.Subject = $"[Ruta Urbana] Producto del día - {fechaHora:dd/MM/yyyy}";

            var cuerpo = "Ruta Urbana Notifica 🌆🍔:\n\n"
                + string.Join("\n", cambios.Select(c => $"- {c}"))
                + $"\n\nEjecutado el {fechaHora:dd/MM/yyyy} a las {fechaHora:HH:mm}.";

            mensaje.Body = new TextPart("plain") { Text = cuerpo };

            using var cliente = new SmtpClient();
            try
            {
                await cliente.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
                await cliente.AuthenticateAsync(_settings.RemitenteCorreo, _settings.RemitenteContrasena);
                await cliente.SendAsync(mensaje);
                _logger.LogInformation("Correo enviado a {Correos}", string.Join(", ", destinatarios));
            }
            finally
            {
                await cliente.DisconnectAsync(true);
            }
        }
    }
}