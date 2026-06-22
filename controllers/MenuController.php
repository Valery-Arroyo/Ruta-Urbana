<?php
class Menu
{
    private $response;
    private $menuModel;

    public function __construct()
    {
        $this->response = new Response();
        $this->menuModel = new MenuModel();
    }

    // Ruta: /menu/index 
    public function index()
    {
        try {
            $result = $this->menuModel->all();
            $this->response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Ruta: /menu/detalle/{id}
     * Devuelve el detalle de un menú específico, incluyendo sus productos y combos.
     */
    public function detalle($id)
    {
        try {
            // Nueva consulta con JOIN y GROUP_CONCAT para traer los días
            $sqlMenu = "SELECT 
                        m.IdMenu, 
                        m.Nombre AS NombreMenu, 
                        m.EstaActivo, 
                        m.HoraInicio, 
                        m.HoraFin,
                        GROUP_CONCAT(DISTINCT md.DiaSemana SEPARATOR ', ') AS DiasDisponibles
                    FROM Menu m
                    LEFT JOIN MenuDisponibilidad md ON m.IdMenu = md.IdMenu
                    WHERE m.IdMenu = " . (int)$id . "
                    GROUP BY m.IdMenu";

            $menu = $this->menuModel->enlace->ExecuteSQL($sqlMenu);

            if (!$menu) {
                http_response_code(404);
                echo json_encode(["error" => "Menú no encontrado"]);
                return;
            }

            // Ítems con imágenes
            $items = $this->menuModel->getMenuItemsConImagen($id);

            $detalle = [
                "menu" => $menu[0],
                "items" => $items
            ];

            $this->response->toJSON($detalle);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
