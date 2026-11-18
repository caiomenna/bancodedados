import Jogo from '../models/jogo.js';

import Categoria from '../models/categoria.js';

import Desenvolvedora from '../models/desenvolvedora.js';

export default class JogoController {

  constructor(caminhoBase = 'jogo/') {

    this.caminhoBase = caminhoBase;

    this.openAdd = async (req, res) => {

      const resultado = await Categoria.find({});

      const resultado2 = await Desenvolvedora.find({});

      res.render(this.caminhoBase + 'add', {

        Categorias: resultado,

        Desenvolvedoras: resultado2,

      });

    };

    this.add = async (req, res) => {

      let jcategoria = null;

      let jdesenvolvedora = null;

      if (req.body.categoria) {

        jcategoria = await Categoria.findById(req.body.categoria);

      }

      if (req.body.desenvolvedora) {

        jdesenvolvedora = await Desenvolvedora.findById(req.body.desenvolvedora);

      }

      let fotoEnviada = null;

      if (req.file) {

        fotoEnviada = req.file.buffer;

      }

      await Jogo.create({

        titulo: req.body.titulo,

        sinopse: req.body.sinopse,

        anolancamento: req.body.anolancamento,

        fotoJogo: fotoEnviada,

        categoria: jcategoria,

        desenvolvedora: jdesenvolvedora,

      });

      res.redirect('/' + this.caminhoBase + 'add');

    };

    this.list = async (req, res) => {

      const resultado = await Jogo.find({})

        .populate('categoria')

        .populate('desenvolvedora')

      res.render(this.caminhoBase + 'lst', { Jogos: resultado });

    };

    this.find = async (req, res) => {

      const filtro = req.body.filtro;

      const resultado = await Jogo.find({

        titulo: { $regex: filtro,$options: 'i' },

      })

        .populate('categoria')

        .populate('desenvolvedora')

        .lean();

      const Jogos = resultado.map((jogo) => ({

        ...jogo,

        fotoJogo: jogo.fotoJogo

          ? `data:image/png;base64,${Buffer.from(jogo.fotoJogo).toString('base64')}`

          : null,

      }));

      res.render(this.caminhoBase + 'lst', { Jogos });

    };

    this.openEdt = async (req, res) => {

  const id = req.params.id;

  const jogo = await Jogo.findById(id);

  const categorias = await Categoria.find({});

  const desenvolvedoras = await Desenvolvedora.find({});

  res.render(this.caminhoBase + 'edt', {

    Jogo: jogo,

    Categorias: categorias,

    Desenvolvedoras: desenvolvedoras,

  });

};

    this.edt = async (req, res) => {

      await Jogo.findByIdAndUpdate(req.params.id, req.body);

      res.redirect('/' + this.caminhoBase + 'lst');

    };

    this.del = async (req, res) => {

      await Jogo.findByIdAndDelete(req.params.id);

      res.redirect('/' + this.caminhoBase + 'lst');

    };

  }

}