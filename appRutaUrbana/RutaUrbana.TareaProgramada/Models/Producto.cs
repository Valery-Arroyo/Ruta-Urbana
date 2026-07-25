namespace RutaUrbana.TareaProgramada.Models
{
    public class Producto
    {
        public int IdProducto { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public bool Activo { get; set; }

        // Nuevo: para la tarea programada "Producto del día"
        public bool EsProductoDelDia { get; set; }
        public DateTime? FechaProductoDelDia { get; set; }

        public int IdCategoria { get; set; }
        public Categoria? Categoria { get; set; }
    }
}