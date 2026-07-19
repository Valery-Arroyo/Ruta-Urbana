<?php
class ComboModel
{
    public $enlace;

    public function __construct()
    {
        // En el constructor de la clase ComboModel, se establece una conexión a la base de datos
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        try {
            $sql = "SELECT 
                    c.IdCombo,
                    c.Nombre AS NombreCombo,
                    c.Descripcion,
                    c.PrecioEspecial,
                    c.Activo,
                    c.IdCategoria,
                    cat.Nombre AS NombreCategoria,
                    c.RutaImagen,

                    p.IdProducto,
                    p.Nombre AS NombreProducto,
                    p.Descripcion AS DescripcionProducto,
                    cp.Cantidad

                FROM Combo c
                INNER JOIN Categoria cat 
                    ON c.IdCategoria = cat.IdCategoria

                INNER JOIN ComboProducto cp 
                    ON c.IdCombo = cp.IdCombo

                INNER JOIN Producto p 
                    ON cp.IdProducto = p.IdProducto

                WHERE c.Activo = 1";

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }


    /* Obtener un combo específico con el detalle de sus productos asociados */
    public function get($id)
    {
        try {
            $sql = "SELECT 
                    c.IdCombo,
                    c.Nombre AS NombreCombo,
                    c.Descripcion AS DescripcionCombo,
                    c.PrecioEspecial,
                    c.Activo,
                    c.IdCategoria,
                    cat.Nombre AS NombreCategoria,   
                    c.RutaImagen,
                    cp.Cantidad,
                    p.IdProducto,
                    p.Nombre AS NombreProducto,
                    p.Precio AS PrecioIndividual
                FROM Combo c
                INNER JOIN Categoria cat ON c.IdCategoria = cat.IdCategoria
                INNER JOIN ComboProducto cp ON c.IdCombo = cp.IdCombo
                INNER JOIN Producto p ON cp.IdProducto = p.IdProducto";

            if ($id !== null) {
                $sql .= " WHERE c.IdCombo = $id";
            }

            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Obtener los combos que pertenecen a una categoría específica (ej: Categoría 5 - Combos) */
    public function getComboCategoria($IdCategoria)
    {
        try {
            $sql = "SELECT * FROM Combo WHERE IdCategoria = $IdCategoria";

            // Ejecuta la consulta SQL y devuelve el resultado
            $resultado = $this->enlace->ExecuteSQL($sql);
            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Crear Combo (Mantenimiento Completo) */
    public function create($data)
    {
        try {
            $rutaImagen = isset($data['RutaImagen']) ? addslashes($data['RutaImagen']) : null;
            $nombre = addslashes($data['Nombre']);
            $descripcion = isset($data['Descripcion']) ? addslashes($data['Descripcion']) : null;
            $precioEspecial = floatval($data['PrecioEspecial']);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;
            $idCategoria = intval($data['IdCategoria']);

            // 1. Insertar en la tabla Combo
            $sqlCombo = "INSERT INTO Combo (RutaImagen, Nombre, Descripcion, PrecioEspecial, Activo, IdCategoria) 
                         VALUES (" . ($rutaImagen ? "'$rutaImagen'" : "NULL") . ", '$nombre', " . ($descripcion ? "'$descripcion'" : "NULL") . ", $precioEspecial, $activo, $idCategoria)";

            $idNuevoCombo = $this->enlace->executeSQL_DML_last($sqlCombo);

            if ($idNuevoCombo) {
                // 2. Insertar productos asociados en ComboProducto
                if (!empty($data['Productos']) && is_array($data['Productos'])) {
                    foreach ($data['Productos'] as $prod) {
                        $idProducto = intval($prod['IdProducto']);
                        $cantidad = isset($prod['Cantidad']) ? intval($prod['Cantidad']) : 1;

                        $sqlProducto = "INSERT INTO ComboProducto (IdCombo, IdProducto, Cantidad) 
                                        VALUES ($idNuevoCombo, $idProducto, $cantidad)";
                        $this->enlace->executeSQL_DML($sqlProducto);
                    }
                }
            }

            return $idNuevoCombo;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Actualizar Combo (Mantenimiento Completo) */
    public function update($id, $data)
    {
        try {
            $idCombo = intval($id);
            $rutaImagen = isset($data['RutaImagen']) ? addslashes($data['RutaImagen']) : null;
            $nombre = addslashes($data['Nombre']);
            $descripcion = isset($data['Descripcion']) ? addslashes($data['Descripcion']) : null;
            $precioEspecial = floatval($data['PrecioEspecial']);
            $activo = isset($data['Activo']) ? intval($data['Activo']) : 1;
            $idCategoria = intval($data['IdCategoria']);

            // 1. Actualizar la tabla Combo
            $sqlCombo = "UPDATE Combo SET 
                            RutaImagen = " . ($rutaImagen ? "'$rutaImagen'" : "NULL") . ", 
                            Nombre = '$nombre', 
                            Descripcion = " . ($descripcion ? "'$descripcion'" : "NULL") . ", 
                            PrecioEspecial = $precioEspecial, 
                            Activo = $activo, 
                            IdCategoria = $idCategoria 
                        WHERE IdCombo = $idCombo";

            $resultado = $this->enlace->executeSQL_DML($sqlCombo);

            // 2. Sincronizar productos en la tabla intermedia ComboProducto (Eliminar y volver a insertar)
            if (isset($data['Productos']) && is_array($data['Productos'])) {
                $sqlDelete = "DELETE FROM ComboProducto WHERE IdCombo = $idCombo";
                $this->enlace->executeSQL_DML($sqlDelete);

                foreach ($data['Productos'] as $prod) {
                    $idProducto = intval($prod['IdProducto']);
                    $cantidad = isset($prod['Cantidad']) ? intval($prod['Cantidad']) : 1;

                    $sqlProducto = "INSERT INTO ComboProducto (IdCombo, IdProducto, Cantidad) 
                                    VALUES ($idCombo, $idProducto, $cantidad)";
                    $this->enlace->executeSQL_DML($sqlProducto);
                }
            }

            return $resultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* Borrado Lógico (Inhabilitar Combo) */
    public function delete($id)
    {
        try {

            $idCombo = intval($id);


            // 1. Eliminar productos asociados al combo
            $sqlProductos = "DELETE FROM ComboProducto 
                         WHERE IdCombo = $idCombo";

            $this->enlace->executeSQL_DML($sqlProductos);



            // 2. Eliminar el combo definitivamente
            $sqlCombo = "DELETE FROM Combo 
                     WHERE IdCombo = $idCombo";


            return $this->enlace->executeSQL_DML($sqlCombo);
        } catch (Exception $e) {

            handleException($e);
        }
    }
}
