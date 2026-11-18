import Categoria from "../models/categoria.js";
import Desenvolvedora from "../models/desenvolvedora.js";
import Jogo from "../models/jogo.js";

async function carregarDados() {
  const [jogos, categorias, desenvolvedoras] = await Promise.all([
    Jogo.find({}).populate("categoria").populate("desenvolvedora"),
    Categoria.find({}),
    Desenvolvedora.find({}),
  ]);

  return { jogos, categorias, desenvolvedoras };
}

export default class SiteController {
  constructor() {
    this.home = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/index", dados);
    };

    this.login = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/login", dados);
    };

    this.jogos = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/jogos", dados);
    };

    this.categorias = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/categorias", dados);
    };

    this.desenvolvedoras = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/desenvolvedoras", dados);
    };

    this.desejos = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/desejos", dados);
    };

    this.avaliacoes = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/avaliacoes", dados);
    };

    this.cadastro = async (req, res) => {
      const dados = await carregarDados();
      res.render("site/cadastro", dados);
    };
  }
}
