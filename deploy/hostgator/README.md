# Despliegue de Rico Teixeira Adestramento

## Vista previa

- URL de prueba: https://preview.ricoteixeiraadestramento.com.br/
- En cPanel, abre Git Version Control → Rico Static → Pull or Deploy. Con la rama `deploy/hostgator-preview` activa, usa **Update from Remote** y después **Deploy HEAD Commit**. La tarea escribe únicamente en `$HOME/rico-static-preview`.
- GitHub Pages se sirve desde `main`. Conserva ahí la etiqueta `noindex` de la vista previa. En HostGator, comprueba también la cabecera HTTP `X-Robots-Tag: noindex, nofollow`.

## Cambio de producción

1. Tras aprobar la vista previa, toma una copia actualizada de archivos y MySQL en cPanel → Backup. Guárdala en el directorio inicial privado de la cuenta. Asegúrate de poder recuperar los archivos y disponer del volcado de MySQL. cPanel lista ambos respaldos parciales por separado y HostGator restaura el respaldo completo a través de soporte.
2. Desde la revisión aprobada, ejecuta `bash deploy/hostgator/build-production.sh /ruta/nueva/rico-release`. El paquete se prepara fuera de la raíz pública. Comprueba que la canónica apunte a https://ricoteixeiraadestramento.com.br/, que `robots.txt` permita rastreo, que `sitemap.xml` exista y que el HTML y la configuración carezcan de `noindex`. Con el endpoint vacío, el paquete muestra WhatsApp sin el formulario.
3. La raíz de producción es `$HOME/public_html`. En la ventana de cambio, guarda los archivos y reglas actuales de WordPress en un directorio privado fuera de cualquier raíz pública. Preserva `.well-known/` y cualquier archivo ajeno al WordPress que el hosting necesite. Instala únicamente el contenido del paquete en `public_html`, incluidos los archivos ocultos del paquete. Mantén intacta la base MySQL de WordPress. El cambio en el mismo hosting permite conservar el DNS y el correo Titan.
4. Comprueba HTTPS, la portada, WhatsApp, el video, las reseñas, el sitemap, la cabecera de robots y los códigos de redirección. `/?page_id=651` corresponde a Sobre y debe redirigir a `/#sobre`. `/?page_id=12` corresponde a Contato y debe redirigir a `/#contato`. Si Search Console muestra otras URL con tráfico, contrástalas con el sitio anterior antes del cambio.

## Volver a WordPress

Retira solo los archivos del paquete estático, vuelve a colocar los archivos originales de WordPress en `public_html`, incluidos `.htaccess` y `wp-config.php`, y limpia la caché del hosting si está activa. Usa la base MySQL original. Si hubiera cambiado o sufrido daños, restaura su volcado antes de reabrir WordPress. Prueba la portada, Sobre, Contato y los recursos del sitio anterior por HTTPS. Si se requiere la restauración completa de la cuenta, usa el respaldo privado con soporte de HostGator.
