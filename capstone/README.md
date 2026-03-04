# PROYECTO CAPSTONE UNO

### ARQUITECTURA

### Arquitectura Onion

#### 1. Capa de Domain

La capa de dominio o domain es la capa que se encarga puramente de la lógica y reglas de dominio, y negocio, basicamente aquí es donde vive el núcleo de nuestra aplicación. Esta capa manda sobre las otras, y las demás deben adaptarse a ella. No al reve+s
En esta capa tenemos las siguientes subdivisiones

- helpers: funciones puras que mapean datos, son funciones como su nombre lo dice que ayudan
- interfaces: definen contratos para que algunas clases como repositorios tengan que adaptarse a las reglas de dominio
- models: son modelos de dominio que definen la estrucutra de nuestros datos, actuan como clases, pero con metadata
- validators: tienen una función similar a los helpers, pero en este caso son funciones que devuelven un estado de exito o error. manejamos los errores y exitos con el mónada Either que está presente en toda las capas ya que es un manejador de errores compartido

#### 2. Capa de Application

esta capa es la que se encarga de coordinar y orquestar toda la lógica de negocio, es como el mediador entre el dominio y la infraestrcutura. En arquitectura onion esta capa depende de la de dominio ya que usa los validadores, helpers, y modelos que le provee, además esta capa NO depende de la infraestructura, se puede adaptar a cualquier tipo de servicios externos. hoy puede usar un repositorio de mongo y mañana uno de postgreSQL si así lo requiere. Esto se logra gracias a la inyeccion de dependencias

Algunos componentes son

- services: son los servicios que saben como usar la lógica de dominio y se rigen a ella. Además pueden usar cualquier infraestructura para extraer datos almacenados

#### 3. Capa de Infrastructure

En est capa tenemos a toda la infraestructura de la aplicación. Es una capa donde se mantienen todos los servicios externos a la lógica de dominio. Por ejemplo BD, Servicio de hash, generación de tokens, servicios HTTP, etc. Esta capa depende totalmente de la de servicios y debe adaptarse a las reglas que le rigen.

Algunos componentes son:

- HTTP: como bien dijimos, los servicios HTTP viven aqui, en este caso usando Express y nos provee funcionalidades para implementar controladores, los cuales dependen toalmente de los servicios, también tenemos las rutas que son definidas aquí mismo
- middlewares: capturan datos y ejecutan lógica antes de que llegue al dominio, tenemos un manejador de errores y uno de autenticación que se puede inyectar en alguna ruta
- Base de datos y repositorio: Modelos de datos y esquemas de bases de datos, en este caso Mongoose
- seguridad: JWT para generación, comparaación y desencriptado de tokens, Bcrypt para el hash de contraseñas

#### 4. Compartido (Mónadas)

Se implementaron mónadas para un manejo más limpio y ordenado de datos, está presente en todas las capas

- Either: para funcionalidades sincronas. ayuda a controlar el flujo correcto de datos y tomar decisiones
- AsyncEither: es un either pero puede manejar funcionalidades asíncronas, es muy versátil y es justamente el puente que uno a lo sincrono con lo asincrono

#### 5. Tests

Esta no es una capa pero son los test que añadimos recientemente para probar las funcionalidades, basicamente se repite la estructura del src al mismo nivel, también se añadieron .babelrc y jest.config.js para la ocnfiguración de pruebas unitarias con jest

#### Estructura de Carpetas Actual

```
capstone
├── .babelrc
├── .env
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
├── pnpm-lock.yaml
├── README.md
│
├── src
│   ├── application
│   │   └── services
│   ├── config
│   │   └── composition
│   ├── domain
│   │   ├── helpers
│   │   ├── interfaces
│   │   ├── models
│   │   └── validators
│   ├── infrastructure
│   │   ├── http
│   │   │   ├── controllers
│   │   │   └── routes
│   │   ├── middlewares
│   │   ├── mongo_schemas
│   │   ├── repository
│   │   └── security
│   └── shared
│       └── monads
│
├── tests
│   ├── application
│   │   └── services
│   ├── domain
│   │   ├── helpers
│   │   └── validators
│   └── infrastructure
│       ├── http
│       │   └── controllers
│       └── repository
│
└── node_modules

```

### INSTALACIÓN

#### Instalación de dependencias

Para poder iniciar este proyecto se necesitan aplicar las dependencias indicadas en el archivo package.json

Primero instalamos el gestor de dependencias pnpm (si no fue instalado anteriormente) que se usó en este proyecto, para ello ejecutamos el siguiente comando

```
npm install -g pnpm
```

El parámetro -g lo instala globalmente y no solo para el proyecto

Luego, nos aseguramos de estar en la carpeta del proyecto, que en este caso sería `/capstone` justo la carpeta que está al mismo nivel del `package.json`

Y instalamos las dependencias ejecutando

```
pnpm install
```

las dependencias más importantes del proyecto son:

- dotenv v17.2.3 para procesar el archivo de variables .env
- express v5.2.1 para levantar el servidor, definir rutas, endpoints, parámtros de consultas, middlewares, etc
- mongoose v9.1.4 para definir esquemas de documentos para MongoDB, valida datos y usa objetos de JS para trabajar, además que nos da funcionalidades implementadas automáticamente para esquemas definidos
- bcrypt v6.0.0 maneja la encriptacion de contraseñas seguras
- jsonwebtoken v9.0.3 sirve para manejar tokens de autenticacion y autorizacion. Se pueden definir para distintos niveles de la API
- @babel/preset-env v7.29.0 sirve para traducir código JavaScript moderno a una versión compatible con distintos entornos de ejecución
- babel-jest v30.2.0 integra Babel con Jest para que los tests puedan ejecutarse usando sintaxis nueva de JS
- babel-polyfill v6.26.0 dependencia de babel que nos da polyfills para funcionalidades modernas
- jest v30.2.0 Framework de testing para ejecutar pruebas unitarias, mocks y generar reportes de cobertura de código.
- uuid v8.3.2 Para la generación de ids aleatorios, muy útil para la capa de dominio, que con nuestra arquitectura es quien decide las reglas de dominio y modelos de dominio

También debemos instalar Postman, si no lo tenemos para probar rutas y endpoints, este podemos instalarlo desde la pagina oficial

https://www.postman.com/downloads/

#### Configuraciones

Una vez instaladas las dependencias, procedemos a la configuración del .env
En el proyecto tenemos un `capstone/.env.example`, en el que se deben de definir las variables de configuración para la BD

```
# Puerto en el que corre la aplicación
PORT={PORT}

# Configuración de Mongo, host, puerto y nombre de la BD Ejemplo

PORT=3000
MONGO_PORT=27017
MONGO_HOST=127.0.0.1
MONGO_DB=capstone
MONGO_USER=root
MONGO_PASSWORD=Password123
JWT_SECRET=ff3e6dc40dcfabe7b70456eb40a93eec284154718838afc0d7eac14be5167b978d170b312a8011f1fe733183af084467235e1087b0c1d9b46c85bd9eb48c5bd5
JWT_EXPIRE_TIME=7d
```

Por supuesto se debe cambiar la extensión de este .env.example a .env para que el archivo pueda ser procesado

#### Ejecución

Ahora para la ejecución debemos de dirigirnos a `capstone/src` y cuando estemos en esta carpeta, debemos ejecutar

```
node server.js
```

Esto ejecuta la aplicación de servidor, y nos permite usar la app
