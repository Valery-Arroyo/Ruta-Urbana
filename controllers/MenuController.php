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

    // Ruta: /menu/disponible
    public function disponible()
    {
        try {
            $data = $this->menuModel->disponible();
            $menuAgrupado = [];

            if (is_array($data)) {
                foreach ($data as $item) {
                    $categoria = $item['Categoria'];

                    $menuAgrupado[$categoria][] = [
                        'nombre'      => $item['ProductoCombo'],
                        'descripcion' => $item['Descripcion'],
                        'precio'      => $item['Precio']
                    ];
                }
            }

            $this->response->toJSON([
                'menu' => $menuAgrupado
            ]);
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
        // Info básica del menú
        $sqlMenu = "SELECT IdMenu, Nombre AS NombreMenu, EstaActivo, HoraInicio, HoraFin 
                    FROM Menu WHERE IdMenu = " . (int)$id;
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
