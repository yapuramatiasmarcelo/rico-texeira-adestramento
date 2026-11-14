#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.."
target="$HOME/rico-static-preview"
[[ -d "$target" && ! -L "$target" ]]
/usr/bin/rsync -rt --files-from=- ./ "$target/" <<'PUBLIC_FILES'
index.html
robots.txt
assets/css/styles.css
assets/js/config.js
assets/js/content.js
assets/js/main.js
assets/js/cookies.js
assets/images/favicon.svg
assets/images/logo-rico-texeira.webp
assets/images/rico-hero-celular.webp
assets/images/rico-hero-escritorio.webp
assets/images/rico 1.jpg
assets/images/rico 2.jpg
assets/images/rico 3.jpg
assets/images/rico 4.jpg
assets/images/banner-parque-barigui.webp
assets/images/rico-treino-ar-livre.webp
assets/images/depoimento-milena.webp
assets/images/vamelun.png
api/contact.php
api/phpmailer/Exception.php
api/phpmailer/PHPMailer.php
api/phpmailer/SMTP.php
api/phpmailer/.htaccess
PUBLIC_FILES
/usr/bin/install -m 0644 deploy/hostgator/preview.htaccess "$target/.htaccess"
