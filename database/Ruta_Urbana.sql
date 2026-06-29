DROP DATABASE IF EXISTS RutaUrbana;
CREATE DATABASE RutaUrbana;
USE RutaUrbana;

-- ROLES Y USUARIOS

CREATE TABLE Rol (
    IdRol      INT AUTO_INCREMENT PRIMARY KEY,
    NombreRol  VARCHAR(50) NOT NULL
);

CREATE TABLE Usuario (
    IdUsuario         INT AUTO_INCREMENT PRIMARY KEY,
    NombreCompleto    VARCHAR(100) NOT NULL,
    Correo            VARCHAR(100) NOT NULL UNIQUE,
    ContrasenaHash    VARCHAR(255) NOT NULL,
    TokenRecuperacion VARCHAR(100) NULL,
    TokenExpiracion   DATETIME     NULL,
    Direccion         VARCHAR(200) NULL,
    Activo            TINYINT(1)   NOT NULL DEFAULT 1,
    IdRol             INT NOT NULL,
    FOREIGN KEY (IdRol) REFERENCES Rol(IdRol)
);

-- PRODUCTOS

CREATE TABLE Categoria (
    IdCategoria INT AUTO_INCREMENT PRIMARY KEY,
    Nombre      VARCHAR(50) NOT NULL
);

CREATE TABLE Ingrediente (
    IdIngrediente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre        VARCHAR(50) NOT NULL
);

CREATE TABLE Producto (
    IdProducto  INT AUTO_INCREMENT PRIMARY KEY,
    Nombre      VARCHAR(100)  NOT NULL UNIQUE,
    Descripcion VARCHAR(200)  NULL,
    Precio      DECIMAL(10,2) NOT NULL,
    Activo      TINYINT(1)    NOT NULL DEFAULT 1,
    IdCategoria INT NOT NULL,
    FOREIGN KEY (IdCategoria) REFERENCES Categoria(IdCategoria)
);

CREATE TABLE ProductoImagen (
    IdImagen    INT AUTO_INCREMENT PRIMARY KEY,
    Imagen       VARCHAR(200) NOT NULL,
    EsPrincipal TINYINT(1)  NOT NULL DEFAULT 0,
    IdProducto  INT NOT NULL,
    FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto)
);

CREATE TABLE ProductoIngrediente (
    IdProducto    INT NOT NULL,
    IdIngrediente INT NOT NULL,
    PRIMARY KEY (IdProducto, IdIngrediente),
    FOREIGN KEY (IdProducto)    REFERENCES Producto(IdProducto),
    FOREIGN KEY (IdIngrediente) REFERENCES Ingrediente(IdIngrediente)
);

-- COMBOS

CREATE TABLE Combo (
    IdCombo        INT AUTO_INCREMENT PRIMARY KEY,
    RutaImagen     VARCHAR(255)  NULL,
    Nombre         VARCHAR(100)  NOT NULL,
    Descripcion    VARCHAR(200)  NULL,
    PrecioEspecial DECIMAL(10,2) NOT NULL,
    Activo         TINYINT(1)   NOT NULL DEFAULT 1,
    IdCategoria    INT NOT NULL,
    FOREIGN KEY (IdCategoria) REFERENCES Categoria(IdCategoria)
);

CREATE TABLE ComboProducto (
    IdCombo    INT NOT NULL,
    IdProducto INT NOT NULL,
    Cantidad   INT NOT NULL DEFAULT 1,
    PRIMARY KEY (IdCombo, IdProducto),
    FOREIGN KEY (IdCombo)    REFERENCES Combo(IdCombo),
    FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto)
);

-- MENÚ

CREATE TABLE Menu (
    IdMenu     INT AUTO_INCREMENT PRIMARY KEY,
    Nombre     VARCHAR(100) NOT NULL,
    HoraInicio TIME         NOT NULL,
    HoraFin    TIME         NOT NULL,
    EstaActivo TINYINT(1)   NOT NULL DEFAULT 1
);

CREATE TABLE MenuDisponibilidad (
    IdDisponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    IdMenu           INT         NOT NULL,
    FechaInicio      DATE        NULL,
    FechaFin         DATE        NULL,
    DiaSemana        VARCHAR(20) NULL,
    FOREIGN KEY (IdMenu) REFERENCES Menu(IdMenu)
);

CREATE TABLE MenuItem (
    IdMenuItem INT AUTO_INCREMENT PRIMARY KEY,
    IdMenu     INT NOT NULL,
    IdProducto INT NULL,
    IdCombo    INT NULL,
    FOREIGN KEY (IdMenu)     REFERENCES Menu(IdMenu),
    FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    FOREIGN KEY (IdCombo)    REFERENCES Combo(IdCombo)
);

-- ESTACIONES Y PROCESO DE PREPARACIÓN

CREATE TABLE Estacion (
    IdEstacion  INT AUTO_INCREMENT PRIMARY KEY,
    Nombre      VARCHAR(50)  NOT NULL,
    Descripcion VARCHAR(100) NULL
);

CREATE TABLE ProcesoPreparacion (
    IdProceso             INT AUTO_INCREMENT PRIMARY KEY,
    OrdenPaso             INT NOT NULL,
    TiempoEstimadoMinutos INT NULL,
    IdProducto            INT NULL,
    IdCombo               INT NULL,
    IdEstacion            INT NOT NULL,
    FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    FOREIGN KEY (IdCombo)    REFERENCES Combo(IdCombo),
    FOREIGN KEY (IdEstacion) REFERENCES Estacion(IdEstacion)
);

-- PEDIDOS

CREATE TABLE EstadoPedido (
    IdEstado INT AUTO_INCREMENT PRIMARY KEY,
    Nombre   VARCHAR(50) NOT NULL,
    Orden    INT         NOT NULL
);

CREATE TABLE MetodoEntrega (
    IdMetodoEntrega INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion     VARCHAR(50) NOT NULL
);

CREATE TABLE MetodoPago (
    IdMetodoPago INT AUTO_INCREMENT PRIMARY KEY,
    Nombre       VARCHAR(50) NOT NULL
);

CREATE TABLE Pedido (
    IdPedido          INT AUTO_INCREMENT PRIMARY KEY,
    CodigoOrden       VARCHAR(20)   NOT NULL UNIQUE,
    FechaPedido       DATETIME      NOT NULL,
    OrigenPedido      VARCHAR(20)   NOT NULL COMMENT 'cliente_web, empleado',
    Subtotal          DECIMAL(10,2) NOT NULL,
    Impuesto          DECIMAL(10,2) NOT NULL,
    CostoEnvio        DECIMAL(10,2) NOT NULL DEFAULT 0,
    Total             DECIMAL(10,2) NOT NULL,
    DireccionEntrega  VARCHAR(200)  NULL,
    IdEstado          INT NOT NULL,
    IdCliente         INT NULL,
    IdEmpleado        INT NULL,
    IdMetodoEntrega   INT NOT NULL,
    FOREIGN KEY (IdEstado)        REFERENCES EstadoPedido(IdEstado),
    FOREIGN KEY (IdCliente)       REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdEmpleado)      REFERENCES Usuario(IdUsuario),
    FOREIGN KEY (IdMetodoEntrega) REFERENCES MetodoEntrega(IdMetodoEntrega)
);

CREATE TABLE HistorialEstadoPedido (
    IdHistorialEstado INT AUTO_INCREMENT PRIMARY KEY,
    IdPedido          INT          NOT NULL,
    IdEstado          INT          NOT NULL,
    FechaHora         DATETIME     NOT NULL,
    IdUsuario         INT          NULL,
    Observacion       VARCHAR(200) NULL,
    FOREIGN KEY (IdPedido)  REFERENCES Pedido(IdPedido),
    FOREIGN KEY (IdEstado)  REFERENCES EstadoPedido(IdEstado),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario)
);

CREATE TABLE DetallePedido (
    IdDetalle      INT AUTO_INCREMENT PRIMARY KEY,
    Cantidad       INT           NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Subtotal       DECIMAL(10,2) NOT NULL,
    Observaciones  VARCHAR(200)  NULL,
    IdPedido       INT NOT NULL,
    IdProducto     INT NULL,
    IdCombo        INT NULL,
    FOREIGN KEY (IdPedido)   REFERENCES Pedido(IdPedido),
    FOREIGN KEY (IdProducto) REFERENCES Producto(IdProducto),
    FOREIGN KEY (IdCombo)    REFERENCES Combo(IdCombo)
);

-- PAGOS

CREATE TABLE Pago (
    IdPago         INT AUTO_INCREMENT PRIMARY KEY,
    MontoPagado    DECIMAL(10,2) NOT NULL,
    Vuelto         DECIMAL(10,2) NULL,
    TipoPago       VARCHAR(20)   NOT NULL COMMENT 'efectivo, credito, debito',
    UltimosDigitos VARCHAR(4)    NULL,
    FechaPago      DATETIME      NOT NULL,
    IdPedido       INT NOT NULL,
    IdMetodoPago   INT NOT NULL,
    FOREIGN KEY (IdPedido)     REFERENCES Pedido(IdPedido),
    FOREIGN KEY (IdMetodoPago) REFERENCES MetodoPago(IdMetodoPago)
);

-- GESTIÓN DE COCINA

CREATE TABLE HistorialEstacion (
    IdHistorial INT AUTO_INCREMENT PRIMARY KEY,
    IdPedido    INT      NOT NULL,
    IdDetalle   INT      NULL,
    IdEstacion  INT      NOT NULL,
    HoraIngreso DATETIME NOT NULL,
    HoraSalida  DATETIME NULL,
    FOREIGN KEY (IdPedido)   REFERENCES Pedido(IdPedido),
    FOREIGN KEY (IdDetalle)  REFERENCES DetallePedido(IdDetalle),
    FOREIGN KEY (IdEstacion) REFERENCES Estacion(IdEstacion)
);

-- INSERTS

INSERT INTO Rol (NombreRol) VALUES
    ('Administrador'), ('Encargado'), ('Cocina'), ('Cliente');

INSERT INTO EstadoPedido (Nombre, Orden) VALUES
    ('Pendiente de pago', 1),
    ('Aceptada',          2),
    ('Preparación',       3),
    ('Procesando',        4),
    ('Entregada',         5);

INSERT INTO MetodoEntrega (Descripcion) VALUES
    ('Recogida en tienda'),
    ('Entrega a domicilio');

INSERT INTO MetodoPago (Nombre) VALUES
    ('Efectivo'),
    ('Tarjeta de crédito'),
    ('Tarjeta de débito');
    
USE RutaUrbana;

-- ==========================================
-- CATEGORÍAS
-- ==========================================
INSERT INTO Categoria (Nombre) VALUES
    ('Entradas'),      -- ID 1
    ('Hamburguesas'),  -- ID 2
    ('Postres'),       -- ID 3
    ('Bebidas'),       -- ID 4
    ('Combos'),         -- ID 5
    ('Combo Famliar'),  -- ID 6
    ('Combo Especial'), -- ID 7
    ('Combo Valientes'), -- ID 8
    ('Combo Dulce'); -- ID 9
-- ==========================================
-- INGREDIENTES
-- ==========================================
INSERT INTO Ingrediente (Nombre) VALUES
    ('Pan brioche'),          -- ID 1
    ('Pan de ajo'),           -- ID 2
    ('Carne de res 150g'),     -- ID 3
    ('Carne de res 200g'),     -- ID 4
    ('Pechuga de pollo'),     -- ID 5
    ('Tocino'),               -- ID 6
    ('Queso cheddar'),        -- ID 7
    ('Queso suizo'),          -- ID 8
    ('Lechuga'),              -- ID 9
    ('Tomate'),               -- ID 10
    ('Cebolla caramelizada'), -- ID 11
    ('Cebolla fresca'),       -- ID 12
    ('Pepinillo'),            -- ID 13
    ('Aguacate'),             -- ID 14
    ('Jalapeño'),             -- ID 15
    ('Salsa BBQ'),            -- ID 16
    ('Salsa especial Ruta'),   -- ID 17
    ('Salsa especial Urbana'), -- ID 18
    ('Mayonesa'),             -- ID 19
    ('Mostaza'),              -- ID 20
    ('Papas fritas'),         -- ID 21
    ('Aros de cebolla'),      -- ID 22
    ('Chocolate'),            -- ID 23
    ('Vainilla'),             -- ID 24
    ('Fresa'),                -- ID 25
    ('Leche'),                -- ID 26
    ('Azúcar'),               -- ID 27
    ('Oreo'),             -- ID 28
    ('Ron Blanco'),          -- ID 29
    ('Vodka'),               -- ID 30
    ('Ginebra'),             -- ID 31
    ('Tequila'),             -- ID 32
    ('Jugo de Limón'),       -- ID 33
    ('Jarabe de Goma'),      -- ID 34
    ('Agua Tónica'),         -- ID 35
    ('Hielo'),               -- ID 36
    ('Rodaja de Naranja'),   -- ID 37
    ('Menta fresca'),        -- ID 38
    ('Granadina'),           -- ID 39
    ('Café molido'),       -- ID 40
    ('Agua caliente'),     -- ID 41
    ('Limón natural'),     -- ID 42
    ('Hielo picado'),      -- ID 43
    ('Menta'),             -- ID 44
    ('Frutas de estación'), -- ID 45
    ('Fresa natural');     -- ID 46

-- ==========================================
-- PRODUCTOS
-- ==========================================
INSERT INTO Producto (Nombre, Descripcion, Precio, Activo, IdCategoria) VALUES
    -- Entradas
    ('Papas Ruta',            'Papas fritas crujientes con sal gruesa y salsa especial Ruta',                     2500.00, 1, 1), -- ID 1
    ('Papas a la Grandeza',   'Papas fritas jumbo crujientes con sal gruesa y salsa especial Urbana',                   3000.00, 1, 1), -- ID 2
    ('Aros de Cebolla',       'Aros de cebolla empanizados y fritos con salsa BBQ',                               2800.00, 1, 1), -- ID 3
    ('Bocaditos de Pollo',      'Trozos de pollo empanizados con salsa a elección',                                 3000.00, 1, 1), -- ID 4

    -- Hamburguesas
    ('La Bestia',             'Mega hamburguesa con 4 tortas de carne, huevo frito, jalapeños, cebolla crujiente, lechuga, tomate y abundante queso cheddar', 14500.00, 1, 2), -- ID 5
    ('Ruta Clásica',          'Carne de res 150g, lechuga, tomate, queso cheddar y salsa especial en pan brioche',  6500.00, 1, 2), -- ID 6
    ('La Doble Ruta',         'Doble carne de res 200g, doble queso cheddar, tocino y salsa BBQ',                 9500.00, 1, 2), -- ID 7
    ('Pollo Crujiente',       'Pechuga de pollo crujiente, lechuga, tomate, pepinillo y mayonesa',               7000.00, 1, 2), -- ID 8
    ('La Barbacoa Especial',       'Carne de res 200g, tocino, cebolla caramelizada, queso suizo y salsa BBQ',        8500.00, 1, 2), -- ID 9
    ('Ruta Picante',          'Carne de res 150g, jalapeño, queso cheddar, cebolla fresca y salsa especial',     7500.00, 1, 2), -- ID 10
    ('La Aguacate',           'Carne de res 200g, aguacate, tocino, queso suizo y mayonesa en pan brioche',      9000.00, 1, 2), -- ID 11

    -- Postres
    ('Bizcocho de Chocolate',  'Bizcocho caliente de chocolate con helado de vainilla',                          3500.00, 1, 3), -- ID 12
    ('Helado de Oreo',        'Copa de helado de vainilla con trozos de Oreo y salsa de chocolate',               3000.00, 1, 3), -- ID 13
    ('Batido de Fresa',       'Batido espeso de fresa con leche y azúcar',                                       3200.00, 1, 3), -- ID 14

    -- Bebidas
    ('Refresco Natural',      'Refresco del día preparado con frutas naturales',                                  1500.00, 1, 4), -- ID 15
    ('Limonada',       'Limonada frozen con hielo granizado y menta',                                     2000.00, 1, 4), -- ID 16
    ('Café Americano',        'Café negro preparado al momento',                                                 1200.00, 1, 4); -- ID 17

-- ==========================================
-- PRODUCTO - INGREDIENTES
-- ==========================================
INSERT INTO ProductoIngrediente (IdProducto, IdIngrediente) VALUES
    -- Papas Ruta (1)
    (1, 21), (1, 17),
    -- Papas a la Grandeza (2)
    (2, 21), (2, 18),
    -- Aros de Cebolla (3)
    (3, 22), (3, 16),
    -- Nuggets de Pollo (4)
    (4, 5), (4, 19),
    -- La Bestia (5)
    (5, 1), (5, 4), (5, 6), (5, 7), (5, 9), (5, 10), (5, 15),
    -- Ruta Clásica (6)
    (6, 1), (6, 3), (6, 9), (6, 10), (6, 7), (6, 17),
    -- La Doble Ruta (7)
    (7, 1), (7, 4), (7, 7), (7, 6), (7, 16),
    -- Pollo Crujiente (8)
    (8, 1), (8, 5), (8, 9), (8, 10), (8, 13), (8, 19),
    -- La BBQ Especial (9)
    (9, 1), (9, 4), (9, 6), (9, 11), (9, 8), (9, 16),
    -- Ruta Picante (10)
    (10, 1), (10, 3), (10, 15), (10, 7), (10, 12), (10, 17),
    -- La Aguacate (11)
    (11, 1), (11, 4), (11, 14), (11, 6), (11, 8), (11, 19),
    -- Brownie de Chocolate (12)
    (12, 23), (12, 24),
    -- Helado de Oreo (13)
    (13, 24), (13, 28), (13, 23),
    -- Batido de Fresa (14)
    (14, 46), (14, 26), (14, 27), -- Fresa, Leche, Azúcar
    
    -- Refresco Natural (15)
    (15, 45), (15, 43), (15, 27), -- Fruta, Hielo, Azúcar
    
    -- Limonada Frozen (16)
    (16, 42), (16, 43), (16, 44), (16, 27), -- Limón, Hielo, Menta, Azúcar
    
    -- Café Americano (17)
    (17, 40), (17, 41); -- Café molido, Agua caliente

-- ==========================================
-- IMÁGENES DE PRODUCTOS
-- ==========================================
INSERT INTO ProductoImagen (Imagen, EsPrincipal, IdProducto) VALUES
('uploads/ImagenesRutaUrbana/papas-ruta.jpg', 1, 1),
('uploads/ImagenesRutaUrbana/papas-grandeza.jpg', 1, 2),
('uploads/ImagenesRutaUrbana/aros-cebolla.png', 1, 3),
('uploads/ImagenesRutaUrbana/nuggets-pollo.png', 1, 4),
('uploads/ImagenesRutaUrbana/ham-la-bestia.png', 1, 5),
('uploads/ImagenesRutaUrbana/ham-clasica.png', 1, 6),
('uploads/ImagenesRutaUrbana/ham-doble-ruta.png', 1, 7),
('uploads/ImagenesRutaUrbana/pollo-crujiente.png', 1, 8),
('uploads/ImagenesRutaUrbana/ham-bbq-especial.png', 1, 9),
('uploads/ImagenesRutaUrbana/ham-picante.png', 1, 10),
('uploads/ImagenesRutaUrbana/ham-la-aguacate.png', 1, 11),
('uploads/ImagenesRutaUrbana/brownie-chocolate.png', 1, 12),
('uploads/ImagenesRutaUrbana/helado-oreo.png', 1, 13),
('uploads/ImagenesRutaUrbana/batido-fresa.png', 1, 14),
('uploads/ImagenesRutaUrbana/refresco-natural.png', 1, 15),
('uploads/ImagenesRutaUrbana/limonada-frozen.png', 1, 16),
('uploads/ImagenesRutaUrbana/cafe-americano.jpg', 1, 17);

-- ==========================================
-- 6. COMBOS
-- ==========================================
INSERT INTO Combo (Nombre, Descripcion, PrecioEspecial, Activo, IdCategoria, RutaImagen) VALUES
('Combo Clásico', 'El sabor tradicional con papas crujientes y refresco natural.', 9500.00, 1, 7, 'uploads/ImagenesRutaUrbana/combo-clasico.png'),
('Combo Doble', 'Doble hamburguesa para los más hambrientos, con papas y limonada frozen.', 12500.00, 1, 7, 'uploads/ImagenesRutaUrbana/combo-doble.png'),
('Combo Pollo', 'Pollo crujiente acompañado de aros de cebolla y refresco natural.', 10000.00, 1, 7, 'uploads/ImagenesRutaUrbana/combo-pollo.png'),
('Combo Postre', 'Un dulce final: brownie de chocolate con café americano.', 4200.00, 1, 9, 'uploads/ImagenesRutaUrbana/combo-postre.png'),
('Combo Barbacoa', 'Perfecto para compartir: hamburguesas BBQ, aguacate fresco, papas y limonadas.', 28000.00, 1, 6, 'uploads/ImagenesRutaUrbana/combo-bbq-familiar.png'),
('Combo Goloso', 'Para los amantes del dulce: hamburguesa clásica, papas y brownie de chocolate.', 11500.00, 1, 9, 'uploads/ImagenesRutaUrbana/combo-goloso.png');

-- ==========================================
-- COMBO - PRODUCTOS
-- ==========================================
INSERT INTO ComboProducto (IdCombo, IdProducto, Cantidad) VALUES
    -- Combo Clásico (1)
    (1, 6, 1), (1, 1, 1), (1, 15, 1),
    
    -- Combo Doble (2)
    (2, 7, 1), (2, 1, 1), (2, 16, 1),
    
    -- Combo Pollo (3)
    (3, 8, 1), (3, 3, 1), (3, 15, 1),
    
    -- Combo Postre (4)
    (4, 12, 1), (4, 17, 1),
    
    -- Combo BBQ Familiar (5)
    (5, 9, 1), (5, 11, 1), (5, 1, 2), (5, 16, 2),
    
    -- Combo Goloso (6)
    (6, 6, 1), -- Ruta Clásica
    (6, 1, 1), -- Papas Ruta
    (6, 12, 1); -- Brownie de Chocolate

-- ==========================================
-- MENÚS
-- ==========================================
INSERT INTO Menu (Nombre, HoraInicio, HoraFin, EstaActivo) VALUES
    ('Menú Mediodía',        '11:00:00', '15:00:00', 1), -- ID 1
    ('Menú Cena',            '18:00:00', '22:00:00', 1), -- ID 2
    ('Menú Todo el Día',     '10:00:00', '22:00:00', 1), -- ID 3
    ('Menú Navidad',         '17:00:00', '23:00:00', 0), -- ID 4
    ('Menú Fin de Semana',   '10:00:00', '23:00:00', 1), -- ID 5
    ('Menú Desayuno', '07:00:00', '11:00:00', 1);
    

-- ==========================================
-- DISPONIBILIDAD DE MENÚS
-- ==========================================
INSERT INTO MenuDisponibilidad (IdMenu, FechaInicio, FechaFin, DiaSemana) VALUES
    (1, NULL, NULL, 'Lunes'), (1, NULL, NULL, 'Martes'), (1, NULL, NULL, 'Miércoles'), (1, NULL, NULL, 'Jueves'), (1, NULL, NULL, 'Viernes'),
    (2, NULL, NULL, 'Lunes'), (2, NULL, NULL, 'Martes'), (2, NULL, NULL, 'Miércoles'), (2, NULL, NULL, 'Jueves'), (2, NULL, NULL, 'Viernes'),
    (3, NULL, NULL, 'Jueves'),
    (4, '2026-12-24', '2026-12-26', NULL),
    (5, NULL, NULL, 'Sábado'), (5, NULL, NULL, 'Domingo');
    

-- ==========================================
-- ÍTEMS DEL MENÚ
-- ==========================================
INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) VALUES
    -- Menú Todo el Día (3)
    (3, 1,  NULL), -- Papas Ruta
    (3, 6,  NULL), -- Ruta Clásica
    (3, 7,  NULL), -- La Doble Ruta
    (3, 8,  NULL), -- Pollo Crujiente
    (3, 13, NULL), -- Helado de Oreo
    (3, 15, NULL), -- Refresco Natural
    (3, 16, NULL), -- Limonada Frozen
    (3, NULL, 1),  -- Combo Clásico
    (3, NULL, 2),  -- Combo Doble
    (3, NULL, 6),  -- Combo Goloso (Nuevo)

    -- Menú Navidad (4)
    (4, 7,  NULL), -- La Doble Ruta
    (4, 11, NULL), -- La Aguacate
    (4, 12, NULL), -- Brownie de Chocolate
    (4, 14, NULL), -- Batido de Fresa
    (4, NULL, 5),  -- Combo Barbacoa Familiar

    -- Menú Fin de Semana (5)
    (5, 1,  NULL), -- Papas Ruta
    (5, 3,  NULL), -- Aros de Cebolla
    (5, 4,  NULL), -- Nuggets de Pollo
    (5, 5,  NULL), -- La Bestia
    (5, 6,  NULL), -- Ruta Clásica
    (5, 7,  NULL), -- La Doble Ruta
    (5, 9,  NULL), -- La BBQ Especial
    (5, 10, NULL), -- Ruta Picante
    (5, 11, NULL), -- La Aguacate
    (5, 13, NULL), -- Helado de Oreo
    (5, 14, NULL), -- Batido de Fresa
    (5, 16, NULL), -- Limonada Frozen
    (5, NULL, 1),  -- Combo Clásico
    (5, NULL, 5),  -- Combo Barbacoa Familiar
    (5, NULL, 6),  -- Combo Goloso (Nuevo)
    
   -- Menú Cena (2)
   (2, 5, NULL),  -- La Bestia
   (2, 7, NULL),  -- La Doble Ruta
   (2, 9, NULL),  -- La Barbacoa Especial
   (2, 11, NULL), -- La Aguacate
   -- Entradas
   (2, 1, NULL),  -- Papas Ruta
   (2, 3, NULL),  -- Aros de Cebolla
   -- Bebidas
   (2, 16, NULL), -- Limonada 
   -- Combos
   (2, NULL, 2),  -- Combo Doble
   (2, NULL, 5),  -- Combo Barbacoa Familiar
   
   -- Menú Desayuno (6)
   (6, 17, NULL), -- Café Americano
   (6, 12, NULL); -- Brownie de Chocolate
-- ==========================================
-- ESTACIONES DE COCINA
-- ==========================================
INSERT INTO Estacion (Nombre, Descripcion) VALUES
    ('Parrilla',     'Cocción de carnes y proteínas a la parrilla'), -- ID 1
    ('Freidora',     'Fritura de papas, aros, nuggets y otros empanizados'), -- ID 2
    ('Ensamble',     'Armado y presentación final de la hamburguesa'), -- ID 3
    ('Postres',      'Preparación de postres y helados'), -- ID 4
    ('Bebidas',      'Preparación de bebidas frías y calientes'); -- ID 5

-- ==========================================
-- PROCESOS DE PREPARACIÓN
-- ==========================================
INSERT INTO ProcesoPreparacion (OrdenPaso, TiempoEstimadoMinutos, IdProducto, IdEstacion) VALUES
    -- Papas Ruta (1)
    (1, 6,  1, 2),
    -- Aros de Cebolla (2)
    (1, 6,  3, 2),
    -- Nuggets de Pollo (4)
    (1, 7,  4, 2),
    (2, 2,  4, 3),
    -- La Bestia (5)
    (1, 12, 5, 1), -- Parrilla
    (2, 6,  5, 3), -- Ensamble
    -- Ruta Clásica (6)
    (1, 8,  6, 1),
    (2, 4,  6, 3),
    -- La Doble Ruta (7)
    (1, 10, 7, 1),
    (2, 5,  7, 3),
    -- Pollo Crujiente (8)
    (1, 8,  8, 2),
    (2, 3,  8, 1),
    (3, 4,  8, 3),
    -- La BBQ Especial (9)
    (1, 10, 9, 1),
    (2, 6,  9, 2),
    (3, 5,  9, 3),
    -- Ruta Picante (10)
    (1, 8,  10, 1),
    (2, 4,  10, 3),
    -- La Aguacate (11)
    (1, 10, 11, 1),
    (2, 6,  11, 2),
    (3, 5,  11, 3),
    -- Brownie de Chocolate (12)
    (1, 5,  12, 4),
    (2, 2,  12, 3),
    -- Helado de Oreo (13)
    (1, 3,  13, 4),
    -- Batido de Fresa (14)
    (1, 4,  14, 5),
    -- Refresco Natural (15)
    (1, 2,  15, 5),
    -- Limonada Frozen (16)
    (1, 3,  16, 5),
    -- Café Americano (17)
    (1, 2,  17, 5);
    USE RutaUrbana;
    SELECT * FROM	rol;
    SELECT * FROM Producto;
    
    USE RutaUrbana;
SELECT 
    m.IdMenu,
    m.Nombre AS NombreMenu,
    m.EstaActivo,
    m.HoraInicio,
    m.HoraFin,
    CASE 
        WHEN (CURTIME() BETWEEN m.HoraInicio AND m.HoraFin) THEN 1
        ELSE 0
    END AS DisponibleAhora
FROM Menu m
ORDER BY m.Nombre;


SELECT 
                        c.Nombre AS Categoria,
                        IFNULL(p.Nombre, cb.Nombre) AS ProductoCombo,
                        IFNULL(p.Descripcion, cb.Descripcion) AS Descripcion,
                        IFNULL(p.Precio, cb.PrecioEspecial) AS Precio
                    FROM Menu m
                    INNER JOIN MenuDisponibilidad md ON m.IdMenu = md.IdMenu
                    INNER JOIN MenuItem mi ON m.IdMenu = mi.IdMenu
                    LEFT JOIN Producto p ON mi.IdProducto = p.IdProducto
                    LEFT JOIN Combo cb ON mi.IdCombo = cb.IdCombo
                    LEFT JOIN Categoria c ON (p.IdCategoria = c.IdCategoria OR cb.IdCategoria = c.IdCategoria)
                    WHERE m.EstaActivo = 1
                    AND (
                        md.DiaSemana = DAYNAME(NOW())
                        OR (md.FechaInicio <= CURDATE() AND md.FechaFin >= CURDATE())
                    ) AND (CURTIME() BETWEEN m.HoraInicio AND m.HoraFin)
                    ORDER BY c.Nombre;
                    
                    ALTER TABLE Menu
ADD FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP;
                    SELECT 
                    IFNULL(p.Nombre, cb.Nombre) AS NombreItem,
                    IFNULL(p.Descripcion, cb.Descripcion) AS Descripcion,
                    IFNULL(p.Precio, cb.PrecioEspecial) AS Precio,
                    c.Nombre AS Categoria,
                    -- Imagen principal del producto
                    pi.Imagen AS ImagenProducto,
                    -- Imagen del combo
                    cb.RutaImagen AS ImagenCombo
                FROM MenuItem mi
                LEFT JOIN Producto p ON mi.IdProducto = p.IdProducto
                LEFT JOIN ProductoImagen pi ON p.IdProducto = pi.IdProducto AND pi.EsPrincipal = 1
                LEFT JOIN Combo cb ON mi.IdCombo = cb.IdCombo
                LEFT JOIN Categoria c ON (p.IdCategoria = c.IdCategoria OR cb.IdCategoria = c.IdCategoria)
                WHERE mi.IdMenu = 2;

                
-- 1. Primero, selecciona la base de datos obligatoriamente
USE RutaUrbana;
USE RutaUrbana;
SELECT IdMenu, Nombre FROM Menu WHERE Nombre = 'Menú Desayuno';

-- 2. Insertar el Menú de Desayuno
INSERT INTO Menu (Nombre, HoraInicio, HoraFin, EstaActivo) 
VALUES ('Menú Desayuno', '07:00:00', '11:00:00', 1);

-- 3. Insertar la disponibilidad (Usamos LAST_INSERT_ID() para capturar el ID recién creado)
INSERT INTO MenuDisponibilidad (IdMenu, DiaSemana) VALUES 
(LAST_INSERT_ID(), 'Lunes'), (LAST_INSERT_ID(), 'Martes'), 
(LAST_INSERT_ID(), 'Miércoles'), (LAST_INSERT_ID(), 'Jueves'), 
(LAST_INSERT_ID(), 'Viernes'), (LAST_INSERT_ID(), 'Sábado'), 
(LAST_INSERT_ID(), 'Domingo');

-- 4. Agregar Café (17) y Brownie (12) al Menú Desayuno (usamos el ID recién creado)
INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) VALUES
(LAST_INSERT_ID(), 17, NULL), 
(LAST_INSERT_ID(), 12, NULL);

-- 5. Agregar productos al Menú Cena (ID 2)
INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) VALUES
(2, 5, NULL),  -- La Bestia
(2, 7, NULL),  -- La Doble Ruta
(2, 9, NULL),  -- La BBQ Especial
(2, 11, NULL), -- La Aguacate
(2, 1, NULL),  -- Papas Ruta
(2, 3, NULL),  -- Aros de Cebolla
(2, 16, NULL), -- Limonada Frozen
(2, NULL, 2),  -- Combo Doble
(2, NULL, 5);  -- Combo BBQ Familiar

USE RutaUrbana;

-- Borramos primero las dependencias para no romper la integridad referencial
DELETE FROM MenuDisponibilidad WHERE IdMenu = 7;
DELETE FROM MenuItem WHERE IdMenu = 7;

-- Ahora borramos el menú duplicado
DELETE FROM Menu WHERE IdMenu = 7;

SELECT IdMenu, Nombre FROM Menu WHERE Nombre = 'Menú Desayuno';

USE RutaUrbana;

INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) VALUES
(6, 17, NULL), -- Café Americano
(6, 12, NULL); -- Brownie de Chocolate

USE RutaUrbana;

SELECT * 
FROM MenuDisponibilidad
WHERE IdMenu IN (4, 6);

INSERT INTO MenuDisponibilidad (IdMenu, DiaSemana) VALUES
(1,'Lunes'),(1,'Martes'),(1,'Miércoles'),(1,'Jueves'),(1,'Viernes');
INSERT INTO MenuDisponibilidad (IdMenu, DiaSemana) VALUES
(2,'Lunes'),(2,'Martes'),(2,'Miércoles'),(2,'Jueves'),(2,'Viernes');
INSERT INTO MenuDisponibilidad (IdMenu, DiaSemana) VALUES
(3,'Lunes'),(3,'Martes'),(3,'Miércoles'),(3,'Jueves'),(3,'Viernes'),(3,'Sábado'),(3,'Domingo');
INSERT INTO MenuDisponibilidad (IdMenu, DiaSemana, FechaInicio, FechaFin) VALUES
(4,'Lunes',NULL,NULL),
(4,'Martes',NULL,NULL),
(4,'Miércoles',NULL,NULL),
(4,'Jueves',NULL,NULL),
(4,'Viernes',NULL,NULL),
(4,'Sábado',NULL,NULL),
(4,'Domingo',NULL,NULL);

INSERT INTO MenuDisponibilidad (IdMenu, DiaSemana) VALUES
(5,'Sábado'),(5,'Domingo');

INSERT INTO MenuDisponibilidad (IdMenu, DiaSemana) VALUES
(6,'Lunes'),(6,'Martes'),(6,'Miércoles'),(6,'Jueves'),
(6,'Viernes'),(6,'Sábado'),(6,'Domingo');

SELECT * FROM MenuDisponibilidad ORDER BY IdMenu;

SELECT m.IdMenu, m.Nombre, md.DiaSemana 
FROM Menu m 
LEFT JOIN MenuDisponibilidad md ON m.IdMenu = md.IdMenu;

USE RutaUrbana;

INSERT INTO MenuItem (IdMenu, IdProducto, IdCombo) VALUES
(1, 17, 6),
(1, 12, 5);

USE RutaUrbana;

UPDATE Menu
SET HoraFin = '23:00:00'
WHERE IdMenu = 2;