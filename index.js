import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import routes from "./routes/route.js";
import desenvolvedoraRoutes from "./routes/DesenvolvedoraRoutes.js";
import categoriaRoutes from "./routes/CategoriaRoutes.js";
import jogoRoutes from "./routes/JogoRoutes.js";
import multer from "multer";
import siteRoutes from "./routes/SiteRoutes.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const PORT = 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "/public")));
app.set("views", join(__dirname, "/views"));

app.use(desenvolvedoraRoutes);
app.use(categoriaRoutes);
app.use(jogoRoutes);
app.use(routes);
app.use(siteRoutes);
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

export default app;
