using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RutaUrbana.TareaProgramada.Data;

namespace RutaUrbana.TareaProgramada.Controllers
{
    public class ProductoController : Controller
    {
        private readonly RutaUrbanaContext _context;

        public ProductoController(RutaUrbanaContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var productos = await _context.Productos
                .Where(p => p.Activo)
                .Include(p => p.Categoria)
                .OrderByDescending(p => p.EsProductoDelDia)
                .ThenBy(p => p.Nombre)
                .ToListAsync();

            return View(productos);
        }
    }
}