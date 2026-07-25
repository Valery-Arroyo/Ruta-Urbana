namespace RutaUrbana.TareaProgramada.Services
{
    public class EmailSettings
    {
        public string SmtpHost { get; set; } = "smtp.gmail.com";
        public int SmtpPort { get; set; } = 587;
        public string RemitenteCorreo { get; set; } = string.Empty;
        public string RemitenteContrasena { get; set; } = string.Empty;
        public string RemitenteNombre { get; set; } = "Ruta Urbana - Notificaciones";
        public string CorreoAdministrador { get; set; } = string.Empty;
    }
}