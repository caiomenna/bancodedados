import express from "express";
const router = express.Router();
//Busca o AlunoController
import SiteController from "../controllers/SiteController.js";
const controle = new SiteController();

const caminhobase = "/site";

router.get(caminhobase, controle.home);
router.get(caminhobase + "/", controle.home);
router.get(caminhobase + "/jogos", controle.jogos);
router.get(caminhobase + "/categorias", controle.categorias);
router.get(caminhobase + "/desenvolvedoras", controle.desenvolvedoras);
router.get(caminhobase + "/desejos", controle.desejos);
router.get(caminhobase + "/avaliacoes", controle.avaliacoes);
router.get(caminhobase + "/login", controle.login);
router.get(caminhobase + "/cadastro", controle.cadastro);

export default router;
