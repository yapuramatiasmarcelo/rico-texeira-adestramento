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
      src: "",
      alt: "",
      width: 800,
      height: 1000,
    },
  },

  about: {
    biography:
      "Rico Teixeira trabalha com adestramento de cães há mais de 16 anos. Em 2022, conquistou o título de campeão brasileiro por equipe no adestramento esportivo com a equipe Voraus CBPA. Hoje, atende famílias em Curitiba que buscam uma convivência mais tranquila com seus cães.",
    approach:
      "Tudo começa com uma consultoria comportamental. Rico observa o cão e conversa com os responsáveis pelo cão para entender a rotina da casa. A partir dessa avaliação, orienta a família sobre o que pode mudar no dia a dia e como todos podem participar do treinamento. O acompanhamento acontece na residência, onde os responsáveis pelo cão podem praticar as orientações nas situações do cotidiano.",
  },

  services: [
    {
      id: "preparacao-bh",
      provisional: false,
      name: "Preparação para BH (Begleithund)",
      description: "Treinamento especializado para a certificação internacional BH, que avalia a obediência, o equilíbrio comportamental e a sociabilidade do cão.",
      image: "",
    },
    {
      id: "treinamento-protecao",
      provisional: false,
      name: "Treinamento de Proteção Pessoal e Territorial",
      description: "Cães preparados para proteger sua família e seu patrimônio, com equilíbrio, obediência e controle.",
      image: "",
    },
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
      },
      {
        name: "Claudio Fraga",
        quote: "Destaca a pontualidade do Rico e o que ele ensinou à família sobre os cães.",
        rating: 5,
        url: "https://share.google/qJtLcplqK72LEWSlR",
      },
      {
        name: "Ingrid Celeste Ferreira",
        quote: "Destaca a atenção desde o primeiro contato e o carinho e a técnica no treinamento da Mimosa.",
        rating: 5,
        url: "https://share.google/WRYwgISdV08vCc6P9",
      },
      {
        name: "Cidico",
        quote: "Conta que, depois de cerca de sete meses de treinamento com seus quatro cães, a convivência em casa ficou mais tranquila.",
        rating: 5,
        url: "https://share.google/ay9okl2kZD3pDrMhp",
      },
    ],
  },
};
