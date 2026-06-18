import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ComboList() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await fetch("/apirutaurbana/combos"); // Ajusta el endpoint de la API según tu configuración de servidor
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCombos(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  if (loading) return <p>Cargando combos...</p>;
  if (error) return <p>Error al cargar combos: {error.message}</p>;

  return (
    <div>
      <h2>Todos los Combos Activos</h2>
      {combos.length === 0 ? (
        <p>No se encontraron combos.</p>
      ) : (
        <ul>
          {combos.map((combo) => (
            <li key={combo.IdCombo}>
              <h3>{combo.Nombre}</h3>
              <p>{combo.Descripcion}</p>
              <p>Precio: ${combo.PrecioEspecial}</p>
              <p>ID de Categoría: {combo.IdCategoria}</p>
              <Link to={`/combos/${combo.IdCombo}`}>
                Ver Detalles del Combo
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ComboList;
