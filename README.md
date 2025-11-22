# Sistema de Gestión de RR.HH. — Dos Robles

**Proyecto:** Sistema integral para la gestión de recursos humanos de la empresa *Dos Robles*.  
**Autor:** Pink Code.

**Materia:** Seminario de actualización: DevOps - Técnicatura Superior en Desarrollo de Software.

---

## Descripción 

Desarrollo de un sistema de gestión de recursos humanos para la empresa Dos Robles, 
que permita administrar la información de empleados, 
controlar la asistencia tanto en planta como en obras externas, 
y generar reportes automáticos relacionados con ausencias, horas extra y licencias.

---

## Objetivo

Aplicar prácticas y herramientas clave de DevOps para desarrollar, contenerizar,
automatizar, testear y desplegar una aplicación real en un entorno CI/CD.

---

## Tecnologías

- **Frontend:** React (Vite), React Router, Material-UI (MUI), Context API  
- **Backend:** Node.js, Express.js, Mongoose (MongoDB), Multer 
- **BD:** MongoDB (Atlas)  
- **Autenticación:** JWT (JSON Web Tokens)  
- **Cifrado:** bcrypt  
- **Testing:** Jest, Supertest, MongoDB Memory Server
- **Control de versiones:** Git / GitHub 

---

## Estructura del proyecto
```
PPIV_DosRobles_RRHH/
├── .github/
│ ├── workflows/
│ │ ├── ci-cd.yml
├── backend/ → API REST (Node.js + Express + MongoDB Atlas)
│ ├── _test_
│ │ ├── controllers
│ │ ├── integration
│ │ ├── models
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── models/
│ │ ├── routes/
│ │ └── server.js
│ ├── uploads/
│ │ ├── documentos/
│ ├── .env
│ ├── dockerfile
│ ├── jest.config.js
│ ├── metrics.js
│ ├── package-lock.json
│ └── package.json
├── frontend/ → Aplicación web (React + Vite + MUI)
│ ├──dosrobles-app
│ │ ├── public
│ │ ├── src
│ │ │  ├── api
│ │ │  ├── assets
│ │ │  ├── components
│ │ │  ├── context
│ │ │  ├── layouts
│ │ │  ├── pages
│ │ │  ├── services
│ │ │  ├── styles
│ │ │  ├── theme
│ │ │  ├── App.css
│ │ │  ├── App.jsx
│ │ │  ├── index.css
│ │ │  ├── main.jsx
│ │ ├── .env
│ │ ├── .gitignore
│ │ ├── dockerfile
│ │ ├── eslint.config.js
│ │ ├── index.html
│ │ ├── nginx.conf
│ │ ├── package-lock.json
│ │ ├── package.json
│ │ ├── README.md
│ │ ├── vite.config.js
│ ├── package-lock.json
├── .gitignore
├── docker-compose.yml
├── package-lock.json
├── package.json
├── prometheus.yml
└── README.md

```

---

## Requisitos previos

- **Node.js:** v16 o superior
- **npm:** v8 o superior (incluido con Node.js)
- **MongoDB:** v6 o superior (local o Atlas)
- **Git:** Para control de versiones
- **Docker Desktop** Para ejecutar localmente con docker
- **Navegador moderno**

---

## Instalación y ejecución

Seguir los pasos en la documentación por favor.


---
