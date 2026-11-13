/**
 * Configuração central — Rico Teixeira Adestramento.
 * Preencha apenas dados já confirmados. String vazia significa "ainda não definido".
 * Caminhos de imagem: relativos, sem barra no início.
 * Exemplo: assets/images/rico-hero.jpg
 */
window.RICO_CONFIG = {
  whatsapp: {
    number: "+55 41 99901-7892",
    message:
      "Olá, Rico! Gostaria de conversar sobre as necessidades do meu cão e da minha família.",
  },

  region: "Curitiba - PR",
  address: "R. Júlio Eduardo Gineste, 338 - Santa Quitéria, Curitiba - PR, 80310-410",

  contact: {
    email: "contato@ricoteixeiraadestramento.com.br",
    endpoint: "",
  },

  social: [
    { name: "Instagram", url: "https://www.instagram.com/ricoteixeira75/" },
    { name: "Facebook", url: "https://www.facebook.com/ricoteixeiraadestramento" },
    { name: "YouTube", url: "" },
  ],

  media: {
    hero: {
      src: "assets/images/rico-hero-escritorio.webp",
      srcMobile: "assets/images/rico-hero-celular.webp",
      alt: "Rico Teixeira ao lado de um cão, em uma área gramada.",
      width: 600,
      height: 480,
    },
    about: {
      src: "assets/images/rico-hero-escritorio.webp",
      alt: "Rico Teixeira ao lado de um cão, em uma área gramada.",
      width: 600,
      height: 480,
    },
  },

  about: {
    biography:
      "Rico Teixeira acompanha famílias em Curitiba que querem uma convivência mais tranquila com o cão. Ele começa conhecendo o animal e escutando como é o dia a dia em casa.",
    approach:
      "O trabalho começa com uma consultoria comportamental. Nela, Rico observa o estilo de comportamento do cão e entende a rotina da família. O atendimento segue na residência, com a participação de quem cuida do cão.",
  },

  services: [
    {
      id: "consultoria-comportamental",
      provisional: false,
      name: "Consultoria Comportamental",
      description: "Análise do comportamento do seu cão.",
      image: "",
    },
    {
      id: "adestramento-residencial",
      provisional: false,
      name: "Adestramento Residencial",
      description: "Seu cão adestrado no conforto da sua casa.",
      image: "",
    },
    {
      id: "uber-pet",
      provisional: false,
      name: "Uber Pet",
      description: "Transporte seguro e confortável para Curitiba e Região.",
      image: "",
    },
    {
      id: "dog-walker",
      provisional: false,
      name: "Dog Walker",
      description: "Passeios e caminhadas para manter seu cão saudável e feliz.",
      image: "",
    },
  ],

  testimonials: {
    enabled: true,
    items: [
      {
        youtube: "Rx9Nye8tpA4",
        name: "Milena Sordi",
        poster: "assets/images/depoimento-milena.webp",
        posterWidth: 480,
        posterHeight: 853,
      },
    ],
  },
};
