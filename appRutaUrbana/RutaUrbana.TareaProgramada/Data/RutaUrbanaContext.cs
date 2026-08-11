using Microsoft.EntityFrameworkCore;
using RutaUrbana.TareaProgramada.Models;

namespace RutaUrbana.TareaProgramada.Data
{
    public class RutaUrbanaContext : DbContext
    {
        public RutaUrbanaContext(DbContextOptions<RutaUrbanaContext> options)
            : base(options)
        {
        }

        public DbSet<Producto> Productos => Set<Producto>();
        public DbSet<Categoria> Categorias => Set<Categoria>();
        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Rol> Roles => Set<Rol>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Categoria>(e =>
            {
                e.ToTable("Categoria");
                e.HasKey(c => c.IdCategoria);
            });

            modelBuilder.Entity<Producto>(e =>
            {
                e.ToTable("Producto");
                e.HasKey(p => p.IdProducto);
                e.HasOne(p => p.Categoria)
                    .WithMany(c => c.Productos)
                    .HasForeignKey(p => p.IdCategoria);
            });

            modelBuilder.Entity<Rol>(e =>
            {
                e.ToTable("Rol");
                e.HasKey(r => r.IdRol);
            });

            modelBuilder.Entity<Usuario>(e =>
            {
                e.ToTable("Usuario");
                e.HasKey(u => u.IdUsuario);
                e.HasOne(u => u.Rol)
                    .WithMany(r => r.Usuarios)
                    .HasForeignKey(u => u.IdRol);
            });
        }
    }
}