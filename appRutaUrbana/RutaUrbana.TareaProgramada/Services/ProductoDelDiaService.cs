using Microsoft.EntityFrameworkCore;
using RutaUrbana.TareaProgramada.Data;

namespace RutaUrbana.TareaProgramada.Services
{
    // TAREA PROGRAMADA: elige un "Producto del día" nuevo, una vez al día.
    public class ProductoDelDiaService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ProductoDelDiaService> _logger;
        private static readonly Random _random = new();

        // Cada cuánto REVISA si ya toca cambiar (no cambia cada minuto:
        // solo cambia una vez al día, aunque revise seguido).
        private static readonly TimeSpan IntervaloRevision = TimeSpan.FromMinutes(1);

        public ProductoDelDiaService(IServiceProvider serviceProvider, ILogger<ProductoDelDiaService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Tarea programada 'Producto del día' iniciada.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await EvaluarProductoDelDiaAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al evaluar el producto del día.");
                }

                await Task.Delay(IntervaloRevision, stoppingToken);
            }
        }

        private async Task EvaluarProductoDelDiaAsync(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<RutaUrbanaContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var hoy = DateTime.Today;

            // 1) CONSULTA LA BD: ¿ya hay un producto marcado como "del día" hoy?
            bool yaHayProductoDeHoy = await context.Productos
                .AnyAsync(p => p.EsProductoDelDia && p.FechaProductoDelDia == hoy, stoppingToken);

            if (yaHayProductoDeHoy)
            {
                _logger.LogInformation("Producto del día ya asignado para hoy. No se ejecuta la tarea.");
                return;
            }

            // 2) EJECUTA LA TAREA: elige un producto activo al azar.
            var productosActivos = await context.Productos
                .Where(p => p.Activo)
                .ToListAsync(stoppingToken);

            if (productosActivos.Count == 0)
            {
                _logger.LogWarning("No hay productos activos; no se puede asignar producto del día.");
                return;
            }

            foreach (var anterior in productosActivos.Where(p => p.EsProductoDelDia))
            {
                anterior.EsProductoDelDia = false;
            }

            var elegido = productosActivos[_random.Next(productosActivos.Count)];
            elegido.EsProductoDelDia = true;
            elegido.FechaProductoDelDia = hoy;

            await context.SaveChangesAsync(stoppingToken);
            _logger.LogInformation("Nuevo producto del día: {Producto}", elegido.Nombre);

            // 3) MUESTRA EL RESULTADO FUERA DE LA BD: correo al administrador.
            await emailService.EnviarResumenCambiosAsync(
                new List<string> { $"Producto del día: {elegido.Nombre}" },
                DateTime.Now);
        }
    }
}