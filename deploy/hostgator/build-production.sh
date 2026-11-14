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

python3 - "$destination/assets/js/config.js" <<'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
source = path.read_text(encoding="utf-8")
updated = source.replace(
    'endpoint: "https://preview.ricoteixeiraadestramento.com.br/api/contact.php"',
    'endpoint: ""',
    1,
)
if updated == source or "contact.php" in updated or "preview.ricoteixeiraadestramento.com.br" in updated:
    raise SystemExit("Production config must not keep the preview contact endpoint.")
path.write_text(updated, encoding="utf-8")
PY

python3 - "$destination/index.html" <<'PY'
import re
import sys
from pathlib import Path

page_path = Path(sys.argv[1])
page = page_path.read_text(encoding="utf-8")
page = re.sub(r'(?m)^[ \t]*<!-- A prévia conserva noindex\. O pacote de produção remove esta meta\. -->\n', "", page)
page, count = re.subn(r'(?m)^[ \t]*<meta name="robots" content="noindex, nofollow">\n', "", page)
if count != 1:
    raise SystemExit("Review the preview indexing directive before packaging.")
if 'rel="canonical" href="https://ricoteixeiraadestramento.com.br/"' not in page:
    raise SystemExit("Canonical must point at the definitive domain.")
if re.search(r"noindex|nofollow", page, re.I):
    raise SystemExit("Production HTML still contains a preview indexing directive.")
if 'id="consulta-form"' not in page:
    raise SystemExit("Production package must keep the contact form.")
page_path.write_text(page, encoding="utf-8")
PY
install -m 0644 deploy/hostgator/production.robots.txt "$destination/robots.txt"
install -m 0644 deploy/hostgator/sitemap.xml "$destination/sitemap.xml"
install -m 0644 deploy/hostgator/production.htaccess "$destination/.htaccess"
python3 - "$destination" <<'PY'
import re
import sys
from pathlib import Path

package = Path(sys.argv[1])
page = (package / "index.html").read_text(encoding="utf-8")
robots = (package / "robots.txt").read_text(encoding="utf-8")
htaccess = (package / ".htaccess").read_text(encoding="utf-8")
sitemap = (package / "sitemap.xml").read_text(encoding="utf-8")
if re.search(r"noindex|nofollow", page, re.I):
    raise SystemExit("Packaged HTML still blocks indexing.")
if "Disallow: /" in robots or "Sitemap: https://ricoteixeiraadestramento.com.br/sitemap.xml" not in robots:
    raise SystemExit("Packaged robots.txt still belongs to preview.")
if re.search(r"X-Robots-Tag|noindex|nofollow", htaccess, re.I):
    raise SystemExit("Packaged htaccess must not set a preview indexing header.")
locations = re.findall(r"<loc>\s*(.*?)\s*</loc>", sitemap)
if locations != ["https://ricoteixeiraadestramento.com.br/"] or "preview.ricoteixeiraadestramento.com.br" in sitemap:
    raise SystemExit("Packaged sitemap is not limited to the canonical homepage.")
config = (package / "assets/js/config.js").read_text(encoding="utf-8")
if 'endpoint: ""' not in config or "contact.php" in config or (package / "api").exists():
    raise SystemExit("Production package must not include the preview contact endpoint.")
PY
