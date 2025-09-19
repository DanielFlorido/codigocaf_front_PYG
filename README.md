# Código CAF FRONT

## Descripción

Código CAF FRONT es una aplicación web diseñada para la interacción con la lógica financiera de código CAF. Este proyecto utiliza tecnologías modernas como React 18 para la interfaz de usuario y sigue las mejores prácticas de desarrollo frontend.

## Arquitectura del Proyecto
El proyecto CodigoCaf_front sigue una arquitectura modular y bien organizada, diseñada para facilitar el desarrollo, mantenimiento y escalabilidad. A continuación, se describe cada parte de la estructura del proyecto:

### 1. **public/**
Este directorio contiene los archivos estáticos que no se procesan por Webpack. Incluye recursos como:

index.html: Archivo principal HTML que sirve como punto de entrada para la aplicación.
Íconos (favicon.png, apple-icon.png): Recursos gráficos utilizados en la aplicación.
manifest.json: Archivo de configuración para aplicaciones web progresivas (PWA).
robots.txt: Archivo para controlar el acceso de los motores de búsqueda.

### 2. **src/**
El directorio src contiene el código fuente principal de la aplicación. Está organizado en subdirectorios para separar responsabilidades:

#### 2.1 **components/ ** 
Contiene componentes reutilizables de la interfaz de usuario, como botones, alertas, entradas de texto, etc. Ejemplos:

MDButton/: Botones personalizados.
MDInput/: Campos de entrada personalizados.
MDAvatar/: Avatares para mostrar imágenes de perfil.
#### 2.2 **context/ **
Maneja el estado global de la aplicación utilizando el contexto de React. Aquí se definen los proveedores y consumidores para compartir datos entre componentes sin necesidad de pasar props manualmente.

#### 2.3 **hooks/ **
Incluye hooks personalizados que encapsulan lógica reutilizable, como manejo de formularios, peticiones a APIs o gestión de eventos.

#### 2.4 **layouts/ **
Define los diseños principales de la aplicación, como la estructura de las páginas, barras de navegación y pies de página.

#### 2.5 **services/ **
Contiene servicios para interactuar con APIs externas. Aquí se centralizan las funciones para realizar peticiones HTTP, manejar respuestas y errores.

#### 2.6 **utils/ **
Incluye funciones auxiliares y utilidades que se utilizan en diferentes partes de la aplicación, como formateadores de datos, validaciones o cálculos.

#### 2.7 **assets/ **
Almacena recursos estáticos utilizados en la aplicación, como imágenes y temas de estilos:

images/: Imágenes utilizadas en la interfaz.
theme/ y theme-dark/: Archivos de configuración para los temas de la aplicación.
#### 2.8 **routes.js**
Define las rutas principales de la aplicación, mapeando las URL a los componentes correspondientes.

### 3. **Configuración del Proyecto**
El proyecto utiliza varias herramientas para mantener un código limpio y consistente:

Eslint y Prettier: Para formatear y validar el código.
.env.local: Archivo para configurar variables de entorno, como la URL base de la API.

--
Esta arquitectura modular permite que el proyecto sea fácil de entender, extender y mantener, asegurando una separación clara de responsabilidades.

## Instalación

Sigue estos pasos para configurar el proyecto localmente:

1. Clona el repositorio:
   ```bash
   git clone https://gitlab.com/caf6555111/codigocaf_front.git

2. Instala las dependencias
    ```bash
    npm install

3. Crea un archivo .env.local con la configuración variables de entorno necesarias.
    ```bash
    REACT_APP_API_BASE_URL=http://localhost:5143/api

### Scripts Disponibles
En el directorio del proyecto, puedes ejecutar:

npm start: Inicia la aplicación en modo de desarrollo.

npm run build: Genera una versión optimizada para producción.

npm test: Ejecuta las pruebas.

### Tecnologías Utilizadas

React: Biblioteca para construir interfaces de usuario.

JavaScript (ES6+): Lenguaje principal del proyecto.

CSS/SCSS: Estilos de la aplicación.

Eslint y Prettier: Herramientas para mantener un código limpio y consistente.


##  Flujo de Trabajo
Inicio: La aplicación comienza en index.js, donde se monta el componente raíz (App.js) en el DOM.

Rutas: routes.js define las rutas que renderizan diferentes componentes según la URL.

Estado Global: context/ proporciona el estado compartido entre componentes.

Interfaz de Usuario: Los componentes en components/ y los diseños en layouts/ construyen la interfaz visual.

Lógica y Datos: Los hooks en hooks/ y los servicios en services/ manejan la lógica y las interacciones con APIs.

