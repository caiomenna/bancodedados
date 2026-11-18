import conexao from '../config/conexao.js'

const Jogo = conexao.Schema({
 titulo: {
 type: String,
 required: true
 },
 sinopse: {
 type: String,
 required: true
 },
 anolancamento: {
 type: Number,
 required: true
 },
 fotoJogo: {
        type: Buffer,
        get: (valor) => {
            if (!valor) return null;
            return `data:image/png;base64,${valor.toString('base64')}`;
            return true;
        }
    },
 categoria: {
 type: conexao.Types.ObjectId, 
 ref: "Categoria",
 required: false,
 },
 desenvolvedora: {
 type: conexao.Types.ObjectId, 
 ref: "Desenvolvedora",
 required: false,
 },
});

export default conexao.model('Jogo',Jogo)