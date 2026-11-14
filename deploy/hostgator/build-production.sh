#!/usr/bin/env bash
set -euo pipefail

destination="${1:?Usage: bash deploy/hostgator/build-production.sh NEW_PACKAGE_DIRECTORY}"
mkdir -- "$destination"
destination="$(cd -- "$destination" && pwd -P)"
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.."

while IFS= read -r file; do
  install -D -m 0644 -- "$file" "$destination/$file"
done <<'PUBLIC_FILES'
index.html
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
PUBLIC_FILES

python3 - "$destination/index.html" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
page = path.read_text(encoding="utf-8")
page, count = re.subn(r'(?m)^ *<!-- Antes de publicar no domínio definitivo, remova o noindex e inclua:\n( *<link rel="canonical" [^\n]+>)\n *-->\n', r'\1\n', page)
if count != 1:
    raise SystemExit("Review the canonical markup before packaging.")
page, count = re.subn(r'(?m)^ *<meta name="robots" content="noindex, nofollow">\n', "", page)
if count != 1:
    raise SystemExit("Review the preview indexing directive before packaging.")
page = re.sub(r'(?m)^ *<!-- Remover noindex antes da publicação\. Instruções no README\. -->\n', "", page)
if re.search(r'endpoint:\s*""', Path("assets/js/config.js").read_text(encoding="utf-8")):
    page, count = re.subn(r'(?s)<form id="consulta-form".*?</form>\s*', "", page)
    if count != 1:
        raise SystemExit("Review the contact form markup before packaging.")
    page = page.replace('class="contact-fallback" hidden', 'class="contact-fallback"', 1)
path.write_text(page, encoding="utf-8")
PY
install -m 0644 deploy/hostgator/production.robots.txt "$destination/robots.txt"
install -m 0644 deploy/hostgator/sitemap.xml "$destination/sitemap.xml"
install -m 0644 deploy/hostgator/production.htaccess "$destination/.htaccess"
