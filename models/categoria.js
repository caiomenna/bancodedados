import conexao from '../config/conexao.js';

const Categoria = conexao.Schema({
    nome: {
        type: String,
        required: true
    },
    foto: {
        type: Buffer,
        get: (valor) => {
            if (!valor) return null;

            return `data:image/png;base64,${valor.toString('base64')}`;
        }
    }
});

export default conexao.models.Categoria || conexao.model('Categoria', Categoria);