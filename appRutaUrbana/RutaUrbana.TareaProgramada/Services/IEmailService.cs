namespace RutaUrbana.TareaProgramada.Services
{
    public interface IEmailService
    {
        Task EnviarResumenCambiosAsync(List<string> cambios, DateTime fechaHora);
    }
}