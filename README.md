# API REST de libros

Proyecto de aprendizaje con JavaScript, Node.js, Express, Mongoose y MongoDB. Incluye un catálogo público que consulta JSON y rutas CRUD para practicar con Postman.

## Ejecutar

Necesitas Node.js 22 o superior y una conexión MongoDB (local o Atlas).

1. `npm ci`
2. Copia `.env.template` a `.env` y configura `MONGO_URL`, `MONGO_DB_NAME` y, para permitir modificaciones, `API_KEY`.
3. `npm run seed` carga tres libros de muestra sin reemplazar registros existentes.
4. `npm start`

Portada: `http://localhost:3000/`. Estado: `/health`.

## Endpoints

| Método | Ruta | Resultado |
|---|---|---|
| GET | /books | Lista JSON, hasta 100 libros; vacía devuelve 200 y [] |
| GET | /books/:id | Libro o 404 |
| POST | /books | Crea; devuelve 201 |
| PUT | /books/:id | Requiere todos los campos |
| PATCH | /books/:id | Modifica campos concretos |
| DELETE | /books/:id | Elimina; devuelve 204 sin cuerpo |

Campos: `title`, `author`, `genre`, `publication_date` (YYYY-MM-DD). Los campos son texto no vacío. Máximos: título 200, autor 120, género 80. Solo estos cuatro campos se aceptan.

Las escrituras requieren `X-API-Key`; sin una clave configurada se deshabilitan. La clave no se incluye en la portada ni se guarda en el repositorio. Es una protección sencilla para una demo, no un sistema de usuarios completo.

## Postman y pruebas

Importa `postman/books.postman_collection.json`. Configura `base_url` y `api_key` en un entorno privado. La creación guarda `book_id` para las solicitudes siguientes. Usa un libro de prueba para eliminarlo.

`npm test` ejecuta pruebas HTTP con MongoDB temporal. La primera ejecución descarga el servidor de MongoDB de su proveedor oficial. No usa la base de producción.

## Render

Plan gratuito, build `npm ci`, inicio `npm start`, health `/health`. Configura `MONGO_URL`, `MONGO_DB_NAME` y opcionalmente `API_KEY` en Environment. Para cargar datos iniciales utiliza temporalmente `npm ci && npm run seed` como build y después vuelve a `npm ci`. El servicio gratuito puede dormirse.

## Para explicar en una entrevista

Express recibe la petición y ejecuta los middleware; las rutas validan los datos; Mongoose consulta o guarda documentos en MongoDB; el servidor devuelve JSON. La portada usa fetch para mostrar el catálogo. PUT requiere todos los campos, mientras PATCH admite cambios parciales. No utiliza React ni TypeScript.
