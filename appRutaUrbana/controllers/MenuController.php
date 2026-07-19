<?php

class Menu
{
    private $menuModel;
    private $response;

    public function __construct()
    {
        $this->menuModel = new MenuModel();
        $this->response = new Response();
    }

    /**
     * GET /menu
     */
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
     * GET /menu/get/{id}
     */
    public function get($id)
    {
        try {
            $result = $this->menuModel->get($id);

            if (!$result) {
                http_response_code(404);

                $this->response->toJSON([
                    "success" => false,
                    "message" => "Menú no encontrado",
                ]);

                return;
            }

            $this->response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * POST /menu/create
     */
    public function create()
    {
        try {
            $data = json_decode(
                file_get_contents("php://input"),
                true
            );

            $id = $this->menuModel->create($data);

            $this->response->toJSON([
                "success" => true,
                "id" => $id,
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * PUT /menu/update/{id}
     */
    public function update($id)
    {
        try {
            $data = json_decode(
                file_get_contents("php://input"),
                true
            );

            $result = $this->menuModel->update($id, $data);

            $this->response->toJSON([
                "success" => true,
                "result" => $result,
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * DELETE /menu/delete/{id}
     */
    public function delete($id)
    {
        try {
            $result = $this->menuModel->delete($id);

            $this->response->toJSON([
                "success" => true,
                "result" => $result,
            ]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * GET /menu/disponible
     */
    public function disponible()
    {
        try {
            $menus = $this->menuModel->all();

            $menus = array_filter(
                $menus,
                function ($menu) {
                    return $menu->EstaActivo == 1;
                }
            );

            $this->response->toJSON(array_values($menus));
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
