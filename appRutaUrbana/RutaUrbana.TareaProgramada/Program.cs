using Microsoft.EntityFrameworkCore;
using RutaUrbana.TareaProgramada.Data;
using RutaUrbana.TareaProgramada.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

// --- Conexión a la base de datos MySQL RutaUrbana ---
var connectionString = builder.Configuration.GetConnectionString("RutaUrbanaDb");
builder.Services.AddDbContext<RutaUrbanaContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// --- Correo (Gmail SMTP) ---
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

// --- LA TAREA PROGRAMADA ---
builder.Services.AddHostedService<ProductoDelDiaService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Producto}/{action=Index}/{id?}");

app.Run();