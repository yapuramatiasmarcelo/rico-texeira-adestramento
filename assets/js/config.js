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

  social: [
    { name: "Instagram", url: "https://www.instagram.com/ricoteixeira75/" },
    { name: "Facebook", url: "https://www.facebook.com/ricoteixeiraadestramento" },
    { name: "YouTube", url: "" },
  ],

  media: {
    hero: {
      src: "",
      alt: "Rico Teixeira trabalhando com um cão",
      width: 1200,
      height: 960,
    },
    about: {
      src: "",
      alt: "Rico Teixeira",
      width: 900,
      height: 1125,
    },
  },

  about: {
    biography: "",
    approach: "",
  },

  services: [
    {
      id: "espaco-1",
      provisional: true,
      name: "Espaço de serviço 1",
      description:
        "Conteúdo provisório de revisão. Este cartão não representa um serviço confirmado. Substitua o nome, a descrição e a imagem quando o atendimento for definido.",
      image: "",
      imageAlt: "",
      imageLabel: "Imagem do serviço 1",
      width: 960,
      height: 640,
    },
    {
      id: "espaco-2",
      provisional: true,
      name: "Espaço de serviço 2",
      description:
        "Conteúdo provisório de revisão. Este cartão não representa um serviço confirmado. Substitua o nome, a descrição e a imagem quando o atendimento for definido.",
      image: "",
      imageAlt: "",
      imageLabel: "Imagem do serviço 2",
      width: 960,
      height: 640,
    },
    {
      id: "espaco-3",
      provisional: true,
      name: "Espaço de serviço 3",
      description:
        "Conteúdo provisório de revisão. Este cartão não representa um serviço confirmado. Substitua o nome, a descrição e a imagem quando o atendimento for definido.",
      image: "",
      imageAlt: "",
      imageLabel: "Imagem do serviço 3",
      width: 960,
      height: 640,
    },
  ],

  testimonials: {
    enabled: true,
    items: [
      {
        video: "assets/videos/depoimento-1.mp4",
        name: "Milena Sordi",
        width: 848,
        height: 480,
      },
    ],
  },
};
