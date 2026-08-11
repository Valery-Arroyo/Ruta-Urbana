namespace RutaUrbana.TareaProgramada.Services
{
    public interface IEmailService
    {
        Task EnviarResumenCambiosAsync(List<string> destinatarios, List<string> cambios, DateTime fechaHora);
    }
}