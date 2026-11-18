import Desenvolvedora from '../models/desenvolvedora.js'

export default class DesenvolvedoraController{

    constructor(caminhoBase='desenvolvedora/'){
        this.caminhoBase = caminhoBase
    
        this.openAdd = async(req, res)=>{
            res.render(caminhoBase + "add")
        }
        this.add = async(req, res)=>{
            await Desenvolvedora.create({
                nome: req.body.nome,
                fotoDesenvolvedora: req.file ? req.file.buffer : null
            });
            res.redirect('/' + caminhoBase + 'add');
        }
        this.list = async(req, res)=>{
            const Desenvolvedoras = await Desenvolvedora.find({});
            res.render(caminhoBase + 'lst', { Desenvolvedoras });
        }
        this.find = async(req, res)=>{
            const filtro = req.body.filtro;
            const resultado = await Desenvolvedora.find({
                nome: { $regex: filtro, $options: "i" }
            }).lean();
            const Desenvolvedoras = resultado.map((desenvolvedora) => ({
                ...desenvolvedora,
                fotoDesenvolvedora: desenvolvedora.fotoDesenvolvedora
                    ? `data:image/png;base64,${Buffer.from(desenvolvedora.fotoDesenvolvedora).toString('base64')}`
                    : null
            }));
            res.render(caminhoBase + 'lst', { Desenvolvedoras });
        }

        this.openEdt = async(req, res)=>{
            const id = req.params.id;
            const desenvolvedora = await Desenvolvedora.findById(id).lean();
            if (desenvolvedora && desenvolvedora.fotoDesenvolvedora) {
                desenvolvedora.fotoDesenvolvedora = `data:image/png;base64,${Buffer.from(desenvolvedora.fotoDesenvolvedora).toString('base64')}`;
            }
            res.render(caminhoBase + "edt", { Desenvolvedora: desenvolvedora });
        }

        this.edt = async(req, res)=>{
            const dados = {
                nome: req.body.nome,
                ...(req.file ? { fotoDesenvolvedora: req.file.buffer } : {})
            };
            await Desenvolvedora.findByIdAndUpdate(req.params.id, dados);
            res.redirect('/' + caminhoBase + 'lst');
        }

        this.del = async(req, res)=>{
            await Desenvolvedora.findByIdAndDelete(req.params.id);
            res.redirect('/' + caminhoBase + 'lst');
        }

    }
}