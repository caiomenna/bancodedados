import { useEffect, useMemo, useState } from "react";

type SessionUser = {
  name: string;
  email: string;
};

type StoredUser = SessionUser & {
  passwordHash: string;
};

type Game = {
  id: string;
  title: string;
  description: string;
  year: number;
  category: string;
  studio: string;
  image: string;
  alt: string;
  accent: string;
};

type Category = {
  name: string;
  count: number;
  icon: IconName;
  color: string;
};

type Developer = {
  name: string;
  count: number;
  image: string | null;
  initials: string;
  color: string;
};

type CatalogData = {
  games: Game[];
  categories: Category[];
  developers: Developer[];
};

const USERS_KEY = "ludoteca-users";
const SESSION_KEY = "ludoteca-session";
const RATINGS_KEY = "ludoteca-ratings";
const SITE_BASE = "/site";
const catalogElement = document.getElementById("catalog-data");
const catalogData: CatalogData = catalogElement?.textContent
  ? JSON.parse(catalogElement.textContent)
  : { games: [], categories: [], developers: [] };
const games = catalogData.games;
const categories = catalogData.categories;
const developers = catalogData.developers;

function routePath(route: string) {
  return route === "inicio" ? `${SITE_BASE}/` : `${SITE_BASE}/${route}`;
}

function routeFromPath(pathname: string) {
  return pathname.replace(/^\/site\/?/, "") || "inicio";
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

type IconName =
  | "book"
  | "search"
  | "heart"
  | "user"
  | "star"
  | "arrow"
  | "grid"
  | "monitor"
  | "gamepad"
  | "plus"
  | "minus"
  | "menu"
  | "close"
  | "spark"
  | "check";

const paths: Record<IconName, React.ReactNode> = {
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/><path d="M8 7h8M8 11h6"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  star: <path d="m12 2 3.1 6.3L22 9.3l-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1Z"/>,
  arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  gamepad: <><path d="M6 9h12a4 4 0 0 1 3.8 5.3l-1.4 4a2.5 2.5 0 0 1-4.2.9L14.5 17h-5l-1.7 2.2a2.5 2.5 0 0 1-4.2-.9l-1.4-4A4 4 0 0 1 6 9Z"/><path d="M7 12v4M5 14h4M16 13h.01M19 15h.01"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  minus: <path d="M5 12h14"/>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7Z"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
};

function Icon({ name, size = 20, filled = false }: { name: IconName; size?: number; filled?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const photos = {
  hero: "https://images.unsplash.com/photo-1760999896198-b7e780e42500?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1400",
};

function App() {
  const [route, setRoute] = useState(() =>
    document.getElementById("root")?.getAttribute("data-page") || routeFromPath(location.pathname)
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [fontScale, setFontScale] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => readStorage(SESSION_KEY, null));
  const [ratings, setRatings] = useState<Record<string, number>>(() => readStorage(RATINGS_KEY, {}));

  const navigate = (nextRoute: string) => {
    const nextPath = routePath(nextRoute);
    if (location.pathname !== nextPath) history.pushState({}, "", nextPath);
    setRoute(nextRoute);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigation = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest("a");
    if (!link || link.target || link.hash) return;

    const url = new URL(link.href);
    if (url.origin !== location.origin || (url.pathname !== SITE_BASE && !url.pathname.startsWith(`${SITE_BASE}/`))) return;

    event.preventDefault();
    navigate(routeFromPath(url.pathname));
  };

  useEffect(() => {
    const onPopState = () => {
      setRoute(routeFromPath(location.pathname));
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", String(fontScale));
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  }, [ratings]);

  const filtered = useMemo(() => games.filter(game =>
    (category === "Todos" || game.category === category) &&
    `${game.title} ${game.studio}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  const toggleFavorite = (id: string) => {
    setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const notify = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const authenticate = (user: SessionUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setSessionUser(user);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSessionUser(null);
    notify("Você saiu da sua conta");
    navigate("inicio");
  };

  const rateGame = (id: string, rating: number) => {
    setRatings(current => ({ ...current, [id]: rating }));
    notify(`${games.find(game => game.id === id)?.title} recebeu ${rating} ${rating === 1 ? "estrela" : "estrelas"}`);
  };

  const removeRating = (id: string) => {
    setRatings(current => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    notify("Avaliação removida");
  };

  return (
    <div className="app-shell" onClick={handleNavigation}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <header className="site-header">
        <div className="container header-inner">
          <a href={routePath("inicio")} className="brand" aria-label="Ludoteca, página inicial">
            <span className="brand-mark"><Icon name="book" size={22}/></span>
            <span>Ludo<span>teca</span></span>
          </a>

          <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navegação principal">
            {[
              ["inicio", "Início"],
              ["jogos", "Jogos"],
              ["categorias", "Categorias"],
              ["desenvolvedoras", "Desenvolvedoras"],
            ].map(([id, label]) => <a key={id} href={routePath(id)} className={route === id ? "active" : ""}>{label}</a>)}
          </nav>

          <div className="header-actions">
            <div className="font-controls" aria-label="Controles de tamanho do texto">
              <button onClick={() => setFontScale(v => Math.max(.9, v - .1))} aria-label="Diminuir texto"><Icon name="minus" size={15}/><span>A</span></button>
              <button onClick={() => setFontScale(v => Math.min(1.2, v + .1))} aria-label="Aumentar texto"><span>A</span><Icon name="plus" size={15}/></button>
            </div>
            <a href={routePath("desejos")} className="icon-button" aria-label={`Lista de desejos com ${favorites.length} jogos`}>
              <Icon name="heart" size={20}/><span className="count-badge">{favorites.length}</span>
            </a>
            {sessionUser ? (
              <button className="login-button account-button" onClick={logout} title="Sair da conta">
                <Icon name="user" size={18}/><span className="login-label">{sessionUser.name.split(" ")[0]} · Sair</span>
              </button>
            ) : (
              <a className="login-button" href={routePath("login")}><Icon name="user" size={18}/><span className="login-label">Entrar</span></a>
            )}
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" aria-expanded={menuOpen}>
              <Icon name={menuOpen ? "close" : "menu"}/>
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo">
        {route === "inicio" && <Home
          query={query} setQuery={setQuery} category={category} setCategory={setCategory}
          filtered={filtered} categories={categories} favorites={favorites} toggleFavorite={toggleFavorite} notify={notify} navigate={navigate}
        />}
        {route === "jogos" && <Catalog filtered={filtered} query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories} favorites={favorites} toggleFavorite={toggleFavorite} notify={notify} navigate={navigate}/>}
        {route === "categorias" && <SimplePage eyebrow="Explore por estilo" title="Categorias" description="Encontre sua próxima experiência por gênero, ritmo e universo."><CategoryGrid categories={categories}/></SimplePage>}
        {route === "desenvolvedoras" && <Developers developers={developers}/>}
        {route === "desejos" && <Wishlist favorites={favorites} toggleFavorite={toggleFavorite} notify={notify}/>}
        {route === "avaliacoes" && <RatingsPage ratings={ratings} rateGame={rateGame} removeRating={removeRating}/>}
        {route === "login" && <AuthPage mode="login" onAuthenticated={authenticate} notify={notify} navigate={navigate}/>}
        {route === "cadastro" && <AuthPage mode="register" onAuthenticated={authenticate} notify={notify} navigate={navigate}/>}
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <a href={routePath("inicio")} className="brand footer-brand"><span className="brand-mark"><Icon name="book" size={20}/></span><span>Ludo<span>teca</span></span></a>
            <p>Seu universo de jogos, organizado em um só lugar.</p>
          </div>
          <div><strong>Explore</strong><a href={routePath("jogos")}>Todos os jogos</a><a href={routePath("categorias")}>Categorias</a><a href={routePath("desenvolvedoras")}>Desenvolvedoras</a></div>
          <div><strong>Sua conta</strong>{sessionUser ? <button onClick={logout}>Sair da conta</button> : <><a href={routePath("login")}>Entrar</a><a href={routePath("cadastro")}>Criar conta</a></>}<a href={routePath("desejos")}>Lista de desejos</a><a href={routePath("avaliacoes")}>Minhas avaliações</a></div>
          <div><strong>Acessibilidade</strong><p>Interface compatível com teclado e leitores de tela.</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2025 Ludoteca</span><span>Feito para quem ama jogar.</span></div>
      </footer>
      {notice && <div className="toast" role="status"><Icon name="check" size={18}/>{notice}</div>}
    </div>
  );
}

function Home(props: CatalogProps) {
  return <>
    <section className="hero">
      <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><Icon name="spark" size={15}/> Descubra. Jogue. Compartilhe.</span>
          <h1>Seu próximo jogo favorito está <em>aqui.</em></h1>
          <p>Explore universos, descubra novos títulos e organize sua jornada gamer em uma biblioteca feita para você.</p>
          <SearchBar query={props.query} setQuery={props.setQuery} navigate={props.navigate} />
          <div className="hero-stats">
            <div><strong>{games.length}</strong><span>Jogos</span></div>
            <div><strong>{props.categories.length}</strong><span>Categorias</span></div>
            <div><strong>{developers.length}</strong><span>Estúdios</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="image-frame">
            <img src={photos.hero} alt="Setup gamer com notebook, teclado e iluminação RGB azul e violeta"/>
            <div className="image-shade"/>
            <span className="floating-chip chip-rating"><Icon name="star" filled size={15}/> 4.9 <small>mais bem avaliados</small></span>
            <span className="floating-chip chip-new"><span className="pulse"/> 12 novos esta semana</span>
          </div>
        </div>
      </div>
    </section>

    <section className="section container">
      <SectionHeader eyebrow="Em alta agora" title="Destaques da semana" text="Os jogos que a comunidade não para de jogar." link={routePath("jogos")}/>
      <div className="game-grid">
        {props.filtered.map(game => <GameCard key={game.id} game={game} favorite={props.favorites.includes(game.id)} toggleFavorite={props.toggleFavorite} notify={props.notify}/>)}
      </div>
    </section>

    <section className="section categories-section">
      <div className="container">
        <SectionHeader eyebrow="Encontre seu estilo" title="Explore por categoria" text="Do desafio estratégico à aventura inesquecível." link={routePath("categorias")}/>
        <CategoryGrid categories={props.categories}/>
      </div>
    </section>

    <section className="section container">
      <div className="cta-card">
        <div>
          <span className="eyebrow light"><Icon name="heart" size={15}/> Sua coleção, suas regras</span>
          <h2>Não perca nenhum lançamento.</h2>
          <p>Crie sua lista de desejos, favorite jogos e compartilhe avaliações com outros jogadores.</p>
          <a className="cta-button" href={routePath("cadastro")}>Criar conta grátis <Icon name="arrow" size={18}/></a>
        </div>
        <div className="cta-decoration" aria-hidden="true"><Icon name="gamepad" size={120}/></div>
      </div>
    </section>
  </>;
}

type CatalogProps = {
  query: string; setQuery: (v: string) => void; category: string; setCategory: (v: string) => void;
  filtered: Game[]; categories: Category[]; favorites: string[]; toggleFavorite: (id: string) => void; notify: (text: string) => void; navigate: (route: string) => void;
};

function Catalog(props: CatalogProps) {
  return <SimplePage eyebrow="Catálogo completo" title="Explore todos os jogos" description="Pesquise títulos, estúdios e filtre por categoria.">
    <div className="catalog-toolbar">
      <SearchBar query={props.query} setQuery={props.setQuery} navigate={props.navigate}/>
      <label>Categoria
        <select value={props.category} onChange={e => props.setCategory(e.target.value)}>
          {["Todos", ...props.categories.map(item => item.name)].map(item => <option key={item}>{item}</option>)}
        </select>
      </label>
    </div>
    <p className="results-count">{props.filtered.length} jogos encontrados</p>
    <div className="game-grid">
      {props.filtered.map(game => <GameCard key={game.id} game={game} favorite={props.favorites.includes(game.id)} toggleFavorite={props.toggleFavorite} notify={props.notify}/>)}
    </div>
    {!props.filtered.length && <div className="empty-state"><Icon name="search" size={36}/><h3>Nenhum jogo encontrado</h3><p>Tente outro termo ou categoria.</p></div>}
  </SimplePage>;
}

function SimplePage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <><section className="page-hero"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section><section className="section container">{children}</section></>;
}

function Developers({ developers }: { developers: Developer[] }) {
  return <SimplePage eyebrow="Quem cria os mundos" title="Desenvolvedoras" description="Conheça os estúdios e as pessoas por trás dos seus jogos favoritos.">
    <div className="studio-grid">
      {developers.map(developer => <article className="studio-card" key={developer.name}>
        {developer.image
          ? <img className="studio-logo" src={developer.image} alt={`Logo de ${developer.name}`}/>
          : <span className={`studio-logo ${developer.color}`}>{developer.initials}</span>}
        <div><h3>{developer.name}</h3><p>Desenvolvedora cadastrada</p><span>{developer.count} {developer.count === 1 ? "jogo" : "jogos"}</span></div><a href={routePath("jogos")} aria-label={`Ver jogos de ${developer.name}`}><Icon name="arrow"/></a>
      </article>)}
    </div>
  </SimplePage>;
}

function Wishlist({ favorites, toggleFavorite, notify }: Pick<CatalogProps, "favorites" | "toggleFavorite" | "notify">) {
  const items = games.filter(game => favorites.includes(game.id));
  return <SimplePage eyebrow="Salvos para depois" title="Sua lista de desejos" description="Todos os mundos que você ainda quer explorar.">
    {items.length ? <div className="game-grid">{items.map(game => <GameCard key={game.id} game={game} favorite toggleFavorite={toggleFavorite} notify={notify}/>)}</div> :
      <div className="empty-state"><Icon name="heart" size={36}/><h3>Sua lista está vazia</h3><p>Favorite jogos no catálogo para encontrá-los aqui.</p><a href={routePath("jogos")}>Explorar jogos</a></div>}
  </SimplePage>;
}

function RatingsPage({ ratings, rateGame, removeRating }: {
  ratings: Record<string, number>;
  rateGame: (id: string, rating: number) => void;
  removeRating: (id: string) => void;
}) {
  const ratedGames = games.filter(game => ratings[game.id]);
  const unratedGames = games.filter(game => !ratings[game.id]);

  return <>
    <section className="page-hero ratings-hero">
      <div className="container">
        <span className="eyebrow"><Icon name="star" size={15}/> Sua opinião importa</span>
        <h1>Minhas avaliações</h1>
        <p>Relembre suas experiências e ajude outros jogadores a encontrar o próximo universo favorito.</p>
        <div className="rating-summary" aria-label={`${ratedGames.length} jogos avaliados`}>
          <strong>{ratedGames.length}</strong>
          <span>{ratedGames.length === 1 ? "jogo avaliado" : "jogos avaliados"}</span>
        </div>
      </div>
    </section>

    <section className="section container ratings-content">
      <div className="section-header">
        <div>
          <span className="section-eyebrow">Sua coleção de opiniões</span>
          <h2>Avaliações publicadas</h2>
          <p>Você pode alterar uma nota a qualquer momento.</p>
        </div>
      </div>

      {ratedGames.length ? <div className="review-list">
        {ratedGames.map(game => <ReviewItem
          key={game.id}
          game={game}
          rating={ratings[game.id]}
          onRate={rateGame}
          onRemove={removeRating}
        />)}
      </div> : <div className="empty-state review-empty">
        <Icon name="star" size={36}/>
        <h3>Você ainda não avaliou nenhum jogo</h3>
        <p>Escolha uma nota abaixo para começar sua coleção de avaliações.</p>
      </div>}

      {unratedGames.length > 0 && <div className="rate-more">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Continue explorando</span>
            <h2>Qual será sua próxima nota?</h2>
            <p>Avalie um jogo com apenas um toque.</p>
          </div>
        </div>
        <div className="quick-rating-grid">
          {unratedGames.map(game => <article className="quick-rating-card" key={game.id}>
            <img src={game.image} alt={game.alt}/>
            <div>
              <span>{game.category}</span>
              <h3>{game.title}</h3>
              <p>{game.studio}</p>
              <StarRating gameTitle={game.title} value={0} onChange={value => rateGame(game.id, value)}/>
            </div>
          </article>)}
        </div>
      </div>}
    </section>
  </>;
}

function ReviewItem({ game, rating, onRate, onRemove }: {
  game: Game;
  rating: number;
  onRate: (id: string, rating: number) => void;
  onRemove: (id: string) => void;
}) {
  return <article className="review-item">
    <img src={game.image} alt={game.alt}/>
    <div className="review-copy">
      <span className={`tag ${game.accent}`}>{game.category}</span>
      <h3>{game.title}</h3>
      <p>{game.studio}</p>
    </div>
    <div className="review-score">
      <span>Sua nota</span>
      <StarRating gameTitle={game.title} value={rating} onChange={value => onRate(game.id, value)}/>
      <small>{rating} de 5 estrelas</small>
    </div>
    <button className="remove-review" onClick={() => onRemove(game.id)}>Remover avaliação</button>
  </article>;
}

function StarRating({ gameTitle, value, onChange }: {
  gameTitle: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return <div className="star-rating" role="group" aria-label={`Avaliação de ${gameTitle}`}>
    {[1, 2, 3, 4, 5].map(star => <button
      key={star}
      type="button"
      className={star <= value ? "selected" : ""}
      onClick={() => onChange(star)}
      aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
      aria-pressed={star === value}
    ><Icon name="star" size={22} filled={star <= value}/></button>)}
  </div>;
}

function SearchBar({ query, setQuery, navigate }: { query: string; setQuery: (v: string) => void; navigate: (route: string) => void }) {
  return <form className="search-box" onSubmit={e => { e.preventDefault(); navigate("jogos"); }} role="search">
    <Icon name="search" size={21}/><label className="sr-only" htmlFor="game-search">Buscar jogos</label>
    <input id="game-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Busque por jogos ou estúdios..."/>
    <button aria-label="Buscar"><Icon name="arrow" size={20}/></button>
  </form>;
}

function SectionHeader({ eyebrow, title, text, link }: { eyebrow: string; title: string; text: string; link: string }) {
  return <div className="section-header"><div><span className="section-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div><a href={link}>Ver todos <Icon name="arrow" size={18}/></a></div>;
}

function GameCard({ game, favorite, toggleFavorite, notify }: { game: Game; favorite: boolean; toggleFavorite: (id: string) => void; notify: (text: string) => void }) {
  return <article className="game-card">
    <div className="game-image"><img src={game.image} alt={game.alt}/><span className={`tag ${game.accent}`}>{game.category}</span>
      <button className={favorite ? "favorite active" : "favorite"} onClick={() => toggleFavorite(game.id)} aria-label={favorite ? `Remover ${game.title} dos favoritos` : `Favoritar ${game.title}`}><Icon name="heart" size={18} filled={favorite}/></button>
    </div>
    <div className="game-content">
      <div className="game-rating"><strong>{game.year}</strong><span>ano de lançamento</span></div>
      <h3>{game.title}</h3><p>{game.studio}</p>
      <p>{game.description}</p>
      <button className="details-link" onClick={() => notify(`${game.title}: detalhes prontos para integração`)}>Ver detalhes <Icon name="arrow" size={17}/></button>
    </div>
  </article>;
}

function CategoryGrid({ categories }: { categories: Category[] }) {
  return <div className="category-grid">{categories.map(item => <a href={routePath("jogos")} className={`category-card ${item.color}`} key={item.name}>
    <span className="category-icon"><Icon name={item.icon} size={27}/></span><div><h3>{item.name}</h3><p>{item.count} jogos</p></div><Icon name="arrow" size={19}/>
  </a>)}</div>;
}

function AuthPage({ mode, onAuthenticated, notify, navigate }: {
  mode: "login" | "register";
  onAuthenticated: (user: SessionUser) => void;
  notify: (text: string) => void;
  navigate: (route: string) => void;
}) {
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || (isRegister && !name.trim())) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (isRegister && password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    if (isRegister && !acceptedTerms) {
      setError("Aceite os termos de uso para criar sua conta.");
      return;
    }

    setSubmitting(true);
    try {
      const users = readStorage<StoredUser[]>(USERS_KEY, []);
      const existingUser = users.find(user => user.email === normalizedEmail);
      const passwordHash = await hashPassword(password);

      if (isRegister) {
        if (existingUser) {
          setError("Já existe uma conta com este e-mail.");
          return;
        }
        const newUser = { name: name.trim(), email: normalizedEmail, passwordHash };
        localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
        onAuthenticated({ name: newUser.name, email: newUser.email });
        notify("Conta criada com sucesso. Boas-vindas à Ludoteca!");
      } else {
        if (!existingUser || existingUser.passwordHash !== passwordHash) {
          setError("E-mail ou senha incorretos.");
          return;
        }
        onAuthenticated({ name: existingUser.name, email: existingUser.email });
        notify(`Boas-vindas de volta, ${existingUser.name.split(" ")[0]}!`);
      }
      navigate("inicio");
    } catch {
      setError("Não foi possível concluir. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return <section className="auth-page">
    <div className="auth-decoration" aria-hidden="true"><Icon name="gamepad" size={170}/></div>
    <div className="auth-card">
      <a href={routePath("inicio")} className="brand auth-brand" aria-label="Ludoteca, página inicial">
        <span className="brand-mark"><Icon name="book" size={22}/></span>
        <span>Ludo<span>teca</span></span>
      </a>
      <span className="section-eyebrow">{isRegister ? "Comece sua coleção" : "Que bom ter você de volta"}</span>
      <h1>{isRegister ? "Crie sua conta" : "Entre na sua conta"}</h1>
      <p className="auth-intro">{isRegister ? "Favorite, avalie e organize todos os jogos que você quer conhecer." : "Acesse seus favoritos, avaliações e sua lista de desejos."}</p>

      <form className="auth-form" onSubmit={submit} noValidate>
        {isRegister && <label>Nome completo
          <input autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Como podemos chamar você?" required/>
        </label>}
        <label>E-mail
          <input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="voce@exemplo.com" required/>
        </label>
        <label>Senha
          <input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" minLength={8} required/>
        </label>
        {isRegister && <label>Confirme sua senha
          <input type="password" autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Digite a senha novamente" minLength={8} required/>
        </label>}
        {isRegister && <label className="check-field">
          <input type="checkbox" checked={acceptedTerms} onChange={event => setAcceptedTerms(event.target.checked)}/>
          <span>Li e aceito os termos de uso e a política de privacidade.</span>
        </label>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="auth-submit" disabled={submitting}>
          {submitting ? "Aguarde..." : isRegister ? "Criar minha conta" : "Entrar"} {!submitting && <Icon name="arrow" size={18}/>}
        </button>
      </form>

      <p className="auth-switch">
        {isRegister ? "Já possui uma conta?" : "Ainda não possui uma conta?"}{" "}
        <a href={routePath(isRegister ? "login" : "cadastro")}>{isRegister ? "Entrar" : "Criar conta grátis"}</a>
      </p>
      <p className="auth-note">Seus dados desta demonstração ficam somente neste navegador.</p>
    </div>
  </section>;
}

export default App;
