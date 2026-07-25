namespace RutaUrbana.TareaProgramada.Models
{
    public class Categoria
    {
        public int IdCategoria { get; set; }
        public string Nombre { get; set; } = string.Empty;

        public ICollection<Producto>? Productos { get; set; }
    }
}