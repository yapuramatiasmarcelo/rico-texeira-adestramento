# Rico Teixeira Adestramento

Site institucional em HTML, CSS e JavaScript, sem backend. Esta pasta é uma versão de revisão: textos, fotos, serviços e o WhatsApp comercial ainda dependem do material confirmado por Rico.

O site anterior continua no ar em https://ricoteixeiraadestramento.com.br/. Nada dele foi republicado aqui como fato confirmado.

## Como visualizar

1. Abra esta pasta no Cursor.
2. Abra `index.html`.
3. Use **Live Server** (Open with Live Server).

Alternativa, na pasta do projeto:

```powershell
python -m http.server 5500
```

Depois acesse http://localhost:5500/

Os caminhos são relativos (`assets/...`, sem barra no início) para funcionar no Live Server e, no futuro, no GitHub Pages — inclusive se o site ficar em uma subpasta do repositório. Não publique nada ainda: o envio para o GitHub fica manual, pelo GitHub Desktop.

## Onde editar

| O que mudar | Onde |
| --- | --- |
| Títulos, hero, texto de contato e rótulos fixos | `index.html` |
| Cores, tipografia e espaçamento | Variáveis `:root` em `assets/css/styles.css` |
| WhatsApp, redes, região, fotos, biografia, serviços e depoimentos | `assets/js/config.js` |
| Montagem de serviços, depoimentos, fotos e redes | `assets/js/content.js` |
| Menu, WhatsApp, ano e medição de clique | `assets/js/main.js` |

Cores principais:

- `--color-bg` — fundo claro
- `--color-green` e `--color-green-deep` — verde
- `--color-accent` e `--color-accent-ink` — acento quente
- `--font-serif` e `--font-sans` — títulos e texto

Não há logo definitivo. A marca provisória é o nome “Rico Teixeira Adestramento”. O ícone da aba (`assets/images/favicon.svg`) é só a inicial, para a revisão.

### Fotos e vídeo

Coloque os arquivos em `assets/images/` e, se houver vídeo real no futuro, em `assets/videos/`. Não use barra no início do caminho.

Exemplo em `config.js`:

```js
media: {
  hero: {
    src: "assets/images/rico-hero.jpg",
    alt: "Rico Teixeira trabalhando com um cão durante um atendimento",
    width: 1200,
    height: 960
  }
}
```

A foto do hero não usa lazy loading. As demais usam. Informe `width` e `height` reais para reservar o espaço. Se o arquivo não abrir, o espaço provisório volta a aparecer.

Nomes sugeridos, quando o material existir:

- `assets/images/rico-hero.jpg`
- `assets/images/rico-sobre.jpg`
- `assets/images/servico-1.jpg`

### WhatsApp

Em `config.js`, `whatsapp.number` está vazio de propósito. Não foi colocado nenhum telefone.

Formato, só dígitos, com DDI 55:

```js
whatsapp: {
  number: "55DDDNUMERO",
  message: "Olá, Rico! Gostaria de conversar sobre as necessidades do meu cão e da minha família."
}
```

Também aceita DDD + número (10 ou 11 dígitos); o 55 é acrescentado. Fora desse formato, os botões continuam desativados e a página explica o motivo. Não existe `href="#"`.

Com um número válido, todos os botões apontam para `https://wa.me/` com a mensagem codificada, e o botão flutuante passa a existir. Ele some enquanto a seção de contato está na tela, para não cobrir o conteúdo.

### Redes e região

```js
region: "Curitiba e região",
social: [
  { name: "Instagram", url: "https://instagram.com/perfil-confirmado" }
]
```

`region` é só o lugar, sem endereço. Links vazios não são exibidos. Use `http://` ou `https://`.

### Biografia

Enquanto `about.biography` e `about.approach` estiverem vazios, a página mostra “Apresentação em preparação”. Um texto em branco duplo vira outro parágrafo. Não escreva anos de experiência, títulos, método ou resultado sem o texto aprovado por Rico.

### Serviços

A lista `services` alimenta os cartões. Enquanto `provisional` não for `false`, o cartão leva a marca “Conteúdo provisório de revisão”. Ao confirmar um serviço:

```js
{
  id: "residencial",
  provisional: false,
  name: "Nome confirmado",
  description: "Descrição confirmada, em poucas linhas.",
  image: "assets/images/servico-residencial.jpg",
  imageAlt: "Descrição objetiva da foto",
  imageLabel: "Não aparece se a imagem carregar",
  width: 960,
  height: 640
}
```

Pode remover ou acrescentar itens. O grid acompanha a quantidade.

### Depoimentos

`testimonials.enabled` começa `false`. A seção e o item “Depoimentos” do menu ficam ocultos. Para publicar depoimentos reais:

```js
testimonials: {
  enabled: true,
  items: [
    {
      quote: "Texto autorizado pela pessoa.",
      name: "Nome que pode aparecer",
      context: "Cidade ou contexto curto, se houver"
    }
  ]
}
```

Não há campo de estrelas. Item sem frase e sem nome é ignorado. Com a lista vazia, a seção continua oculta mesmo se `enabled` for `true`.

## O que Rico precisa enviar

- Foto real dele trabalhando com um cão (hero) e um retrato para a seção Sobre, com autorização de uso.
- Biografia e descrição da abordagem, no texto que ele aceita publicar.
- Lista fechada de serviços: nome, descrição curta e uma imagem por item.
- WhatsApp comercial que deve aparecer no site.
- Perfis oficiais de redes, se quiser exibi-los.
- Frase da região de atendimento.
- Depoimentos somente com texto revisado e autorização de quem assina.
- Logotipo, se existir um arquivo final. Até lá, a marca segue tipográfica.

O site anterior citava atendimento em Curitiba, serviços (entre eles consultoria comportamental, adestramento residencial, obediência, educação sanitária, passeio, guarda e proteção, além de Uber Pet e Dog Walker), experiência longa e um título brasileiro por equipe em 2022. Também havia telefone, e-mail, endereço e depoimentos assinados. Nada disso foi copiado para esta versão. Rico confirma o que permanece, o que sai e o texto novo.

## O que falta antes de publicar

Não publique esta revisão no domínio definitivo como está. O Google ficaria orientado a não indexar o site.

1. Trocar os espaços provisórios pelo material confirmado.
2. Configurar o WhatsApp e rever redes e região.
3. Remover o noindex (seção abaixo).
4. Incluir o canonical, o `robots.txt` de produção e o `sitemap.xml`.
5. Acrescentar dados estruturados só quando nome público, URL, telefone e região estiverem fechados.
6. Ligar a medição quando existirem IDs reais.
7. Conferir de novo em 360, 768 e 1440 px.
8. Só então substituir o site que está no ar.

Não há formulário: ainda não existe destino de envio. Não há página de política com link vazio.

## Tirar o noindex

Em `index.html`, apague esta linha:

```html
<meta name="robots" content="noindex, nofollow">
```

Faça isso somente quando a versão publicada for a definitiva. Enquanto a linha existir, a página pede para não ser indexada e para os links não serem seguidos.

## Canonical, robots.txt e sitemap

Domínio definitivo: `https://ricoteixeiraadestramento.com.br/`

Quando esse domínio estiver servindo esta versão, descomente ou acrescente no `<head>`:

```html
<link rel="canonical" href="https://ricoteixeiraadestramento.com.br/">
```

Substitua o `robots.txt` atual (que bloqueia tudo, de propósito, nesta revisão) por:

```
User-agent: *
Allow: /

Sitemap: https://ricoteixeiraadestramento.com.br/sitemap.xml
```

Crie `sitemap.xml` na raiz:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ricoteixeiraadestramento.com.br/</loc>
  </url>
</urlset>
```

O Open Graph já tem título, descrição, tipo, idioma e URL. Não há `og:image` porque ainda não existe uma foto real para compartilhar. Quando a foto do hero estiver escolhida e publicada, aí sim acrescente a tag apontando para essa URL absoluta.

Dados estruturados (Schema.org, por exemplo `ProfessionalService`) ficam para depois. Não inventar telefone, endereço ou área de atendimento dentro do JSON-LD.

## Medição

Ainda não há GA4 nem Google Ads. Nenhum ID foi colocado no site.

`trackWhatsAppClick` em `assets/js/main.js` é o único lugar que registra o clique, e só quando o WhatsApp está configurado. Ela dispara o evento `rico:whatsapp-click` com `detail.source`:

- `header`
- `hero`
- `contato`
- `flutuante`

Quando os IDs existirem, a chamada do analytics entra dentro dessa função. Não espalhar tags pelo HTML.
