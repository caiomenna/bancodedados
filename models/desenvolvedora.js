import conexao from '../config/conexao.js'

const DesenvolvedoraSchema = new conexao.Schema({
    nome: { type: String, required: true },
    fotoDesenvolvedora: {
        type: Buffer,
        get: (valor) => {
            if (!valor) return null;
            return `data:image/png;base64,${valor.toString('base64')}`;
            return true;
        }
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

export default conexao.model('Desenvolvedora', DesenvolvedoraSchema);