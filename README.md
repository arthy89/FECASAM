# FECASAM 2026

Landing page oficial para la XXXI Feria Exposición de Camélidos Sudamericanos, Agropecuarios y Artesanales.

**📅 Evento:** 22-30 de Agosto de 2026  
**📍 Lugar:** Macusani, Carabaya, Puno - Perú

## 🚀 Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Backend:** PHP 8.0+, MySQL 5.7+
- **Hosting:** Optimizado para servidores Apache

## 📦 Instalación

1. **Configurar Base de Datos:**
   ```bash
   # Importar schema en phpMyAdmin
   mysql -u usuario -p fecasam2026 < database/schema.sql
   ```

2. **Configurar API:**
   ```bash
   cp api/config.example.php api/config.php
   # Editar config.php con tus credenciales
   ```

   También puedes usar un archivo de entorno:
   - Copia `.env.example` a `.env`
   - Coloca tus credenciales reales en `.env`
   - El archivo `.env` es leído automáticamente por `api/submit-registration.php` y `api/submit-complaint.php`

3. **Subir Archivos:**
   - Sube todos los archivos a `public_html/`
   - Permisos: Directorios `755`, Archivos `644`

4. **Verificar:**
   - Visita tu dominio
   - Prueba el formulario de inscripción
   - Verifica el Libro de Reclamaciones

## 📁 Estructura

```
├── index.html              # Página principal
├── libro-reclamaciones.html
├── assets/
│   ├── css/               # Estilos
│   ├── js/                # Scripts
│   ├── images/            # Imágenes del sitio
│   └── downloads/         # PDFs descargables
├── api/                   # Backend PHP
└── database/              # Schema SQL
```

## 🔒 Seguridad

- `.htaccess` configurado con headers de seguridad
- Validación de formularios en backend
- Protección contra SQL injection
- Sanitización de entradas

## 📞 Soporte

Para consultas técnicas o dudas sobre el evento, contactar:
- **Email:** contacto@fecasam2026.com
- **WhatsApp:** [Número de contacto]

---

**Desarrollado para FECASAM 2026** | Macusani, Puno - Perú
