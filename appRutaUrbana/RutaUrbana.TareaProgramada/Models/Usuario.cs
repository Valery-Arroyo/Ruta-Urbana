namespace RutaUrbana.TareaProgramada.Models
{
    // Solo se mapean las columnas que esta tarea programada necesita leer
    // (no se usa para crear/editar usuarios, eso lo sigue haciendo el backend PHP).
    public class Usuario
    {
        public int IdUsuario { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public bool Activo { get; set; }

        public int IdRol { get; set; }
        public Rol? Rol { get; set; }
    }
}
