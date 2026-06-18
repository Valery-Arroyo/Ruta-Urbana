import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function CombosByCategory() {
  const { idCategoria } = useParams();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await fetch(
          `/apirutaurbana/combos/category/${idCategoria}`,
        ); // Ajusta el endpoint de la API
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
  }, [idCategoria]);

  if (loading) return <p>Cargando combos para la categoría {idCategoria}...</p>;
  if (error) return <p>Error al cargar combos: {error.message}</p>;

  return (
    <div>
      <h2>Combos en la Categoría {idCategoria}</h2>
      {combos.length === 0 ? (
        <p>No se encontraron combos para esta categoría.</p>
      ) : (
        <ul>
          {combos.map((combo) => (
            <li key={combo.IdCombo}>
              <h3>{combo.Nombre}</h3>
              <p>{combo.Descripcion}</p>
              <p>Precio: ${combo.PrecioEspecial}</p>
              <Link to={`/combos/${combo.IdCombo}`}>Ver Detalles</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CombosByCategory;
