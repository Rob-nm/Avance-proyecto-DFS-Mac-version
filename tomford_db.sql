CREATE DATABASE tomford_db;
USE tomford_db;

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    precio_50 DECIMAL(10,2) NOT NULL,
    precio_100 DECIMAL(10,2) NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stock_50 INT NOT NULL,
    stock_100 INT NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE productos 
ADD CONSTRAINT unique_nombre 
UNIQUE (nombre);

INSERT IGNORE INTO productos 
(nombre, descripcion, precio_50, precio_100, imagen_url, categoria, stock_50, stock_100)
VALUES
(
    'ORCHID NOIR',
    'Una fragancia lujosa y sensual con notas oscuras.',
    3850.00,
    5400.00,
    '/img/orchidNoir.webp',
    'Signature',
    0,
    10
),
(
    'OUDH WOOD',
    'Madera de oud, una de las materias primas más valiosas.',
    6200.00,
    8900.00,
    '/img/oudhWood.webp',
    'Signature',
    10,
    10
),
(
    'NEROLI PORTOFINO',
    'Vibrante. Espumoso. Transportador.',
    6200.00,
    8900.00,
    '/img/neroliPortofino.webp',
    'Signature',
    10,
    10
),
(
    'TOBACCO VANILLE',
    'Opulento. Cálido. Icónico.',
    6200.00,
    8900.00,
    '/img/tobaccoVanille.webp',
    'Private Blend',
    10,
    10
),
(
    'LOST CHERRY',
    'Exuberante. Tentador. Insaciable.',
    7500.00,
    10500.00,
    '/img/lostCherry.webp',
    'Private Blend',
    10,
    10
),
(
    'SOLEIL BLANC',
    'Inesperado. Tórrido. Adictivo.',
    6200.00,
    8900.00,
    '/img/soleilBlanc.webp',
    'Private Blend',
    10,
    10
),
(
    'OMBRÉ LEATHER',
    'Libertad. Desierto. Cuero.',
    3850.00,
    5400.00,
    '/img/ombreLeather.webp',
    'Signature',
    10,
    10
),
(
    'ROSE PRICK',
    'Un bouquet salvaje de rosas raras.',
    7500.00,
    10500.00,
    '/img/rosePrick.webp',
    'Private Blend',
    10,
    10
);
