import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  FolderOpen,
  Image,
  Library,
  ListMusic,
  MessageSquareText,
  Monitor,
  MonitorUp,
  Music2,
  Palette,
  Play,
  Plus,
  Radio,
  Search,
  Settings2,
  SkipBack,
  SkipForward,
  Square,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import "./styles.css";

const desktop = window.wrDesktop;
const emptyState = {
  library: [],
  playlists: [{ id: "initial", name: "Nova programação", entries: [] }],
  activePlaylistId: "initial",
  settings: {
    louvorJaPath: "",
    audienceDisplayId: null,
    stageDisplayId: null,
  },
};

const themes = [
  {
    id: "midnight",
    name: "Midnight",
    background:
      "radial-gradient(circle at 50% 15%, #263855 0%, #111a29 38%, #05070c 100%)",
    color: "#fff",
    accent: "#6ed7ff",
  },
  {
    id: "aurora",
    name: "Aurora",
    background:
      "radial-gradient(circle at 18% 15%, #6437b8, transparent 38%), radial-gradient(circle at 82% 78%, #0b7895, transparent 40%), #070912",
    color: "#fff",
    accent: "#a6ebff",
  },
  {
    id: "warm",
    name: "Âmbar",
    background:
      "radial-gradient(circle at 70% 15%, #7b4928, transparent 40%), #100b08",
    color: "#fffaf2",
    accent: "#ffcd8d",
  },
  {
    id: "paper",
    name: "Claro",
    background: "linear-gradient(145deg, #f8f4ec, #ded8ca)",
    color: "#17191d",
    accent: "#176f8c",
  },
];

const books = [
  ["Gênesis", "Genesis", 50], ["Êxodo", "Exodus", 40],
  ["Levítico", "Leviticus", 27], ["Números", "Numbers", 36],
  ["Deuteronômio", "Deuteronomy", 34], ["Josué", "Joshua", 24],
  ["Juízes", "Judges", 21], ["Rute", "Ruth", 4],
  ["1 Samuel", "1 Samuel", 31], ["2 Samuel", "2 Samuel", 24],
  ["1 Reis", "1 Kings", 22], ["2 Reis", "2 Kings", 25],
  ["1 Crônicas", "1 Chronicles", 29], ["2 Crônicas", "2 Chronicles", 36],
  ["Esdras", "Ezra", 10], ["Neemias", "Nehemiah", 13],
  ["Ester", "Esther", 10], ["Jó", "Job", 42],
  ["Salmos", "Psalms", 150], ["Provérbios", "Proverbs", 31],
  ["Eclesiastes", "Ecclesiastes", 12], ["Cantares", "Song of Solomon", 8],
  ["Isaías", "Isaiah", 66], ["Jeremias", "Jeremiah", 52],
  ["Lamentações", "Lamentations", 5], ["Ezequiel", "Ezekiel", 48],
  ["Daniel", "Daniel", 12], ["Oseias", "Hosea", 14],
  ["Joel", "Joel", 3], ["Amós", "Amos", 9], ["Obadias", "Obadiah", 1],
  ["Jonas", "Jonah", 4], ["Miqueias", "Micah", 7], ["Naum", "Nahum", 3],
  ["Habacuque", "Habakkuk", 3], ["Sofonias", "Zephaniah", 3],
  ["Ageu", "Haggai", 2], ["Zacarias", "Zechariah", 14],
  ["Malaquias", "Malachi", 4], ["Mateus", "Matthew", 28],
  ["Marcos", "Mark", 16], ["Lucas", "Luke", 24], ["João", "John", 21],
  ["Atos", "Acts", 28], ["Romanos", "Romans", 16],
  ["1 Coríntios", "1 Corinthians", 16], ["2 Coríntios", "2 Corinthians", 13],
  ["Gálatas", "Galatians", 6], ["Efésios", "Ephesians", 6],
  ["Filipenses", "Philippians", 4], ["Colossenses", "Colossians", 4],
  ["1 Tessalonicenses", "1 Thessalonians", 5],
  ["2 Tessalonicenses", "2 Thessalonians", 3],
  ["1 Timóteo", "1 Timothy", 6], ["2 Timóteo", "2 Timothy", 4],
  ["Tito", "Titus", 3], ["Filemom", "Philemon", 1],
  ["Hebreus", "Hebrews", 13], ["Tiago", "James", 5],
  ["1 Pedro", "1 Peter", 5], ["2 Pedro", "2 Peter", 3],
  ["1 João", "1 John", 5], ["2 João", "2 John", 1],
  ["3 João", "3 John", 1], ["Judas", "Jude", 1],
  ["Apocalipse", "Revelation", 22],
];

const id = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function OutputCanvas({ output, stage = false }) {
  const theme = output?.theme || themes[0];
  const slide = output?.item?.slides?.[output.slideIndex] || null;
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    if (!stage) return undefined;
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, [stage]);
  return (
    <div
      className={`output-canvas ${stage ? "stage-view" : ""}`}
      style={{
        "--output-bg": theme.background,
        "--output-color": theme.color,
        "--output-accent": theme.accent,
      }}
    >
      {stage && (
        <header className="stage-header">
          <span><Radio size={12} /> AO VIVO</span>
          <strong>{output?.item?.title || "Sem conteúdo"}</strong>
          <time>{clock.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time>
        </header>
      )}
      <div className="output-center">
        {output?.blackout ? null : output?.timerVisible ? (
          <div className="timer-output">
            <span>COMEÇAMOS EM</span>
            <strong>{formatTime(output.timerSeconds)}</strong>
          </div>
        ) : slide ? (
          <>
            {output.item.kind === "image" && <img src={slide.url || `file://${slide.path}`} alt="" />}
            {output.item.kind === "video" && <video src={slide.url || `file://${slide.path}`} autoPlay playsInline />}
            {!["image", "video"].includes(output.item.kind) && (
              <div className="projected-text">
                {output.item.kind === "bible" && <span>{slide.label}</span>}
                <p>{slide.text}</p>
              </div>
            )}
          </>
        ) : (
          <div className="empty-output"><MonitorUp size={44} /><span>Aguardando conteúdo</span></div>
        )}
      </div>
      {output?.alert && <div className="output-alert">{output.alert}</div>}
      {stage && (
        <footer className="stage-footer">
          <span>PRÓXIMO</span>
          <strong>{output?.nextText || "—"}</strong>
        </footer>
      )}
    </div>
  );
}

function OutputWindow() {
  const mode = location.hash.split("=")[1] || "audience";
  const [output, setOutput] = useState(null);
  useEffect(() => desktop?.onOutput(setOutput), []);
  return <OutputCanvas output={output} stage={mode === "stage"} />;
}

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function BibleDialog({ onClose, onCreate }) {
  const [bookIndex, setBookIndex] = useState(42);
  const [chapter, setChapter] = useState(3);
  const [verses, setVerses] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const book = books[bookIndex];

  async function searchBible() {
    setLoading(true);
    setError("");
    try {
      const reference = encodeURIComponent(`${book[1]} ${chapter}`);
      const response = await fetch(`https://bible-api.com/${reference}?translation=almeida`);
      if (!response.ok) throw new Error();
      const result = await response.json();
      setVerses(result.verses || []);
      setSelected((result.verses || []).map((verse) => verse.verse));
    } catch {
      setError("Não foi possível consultar o capítulo. Verifique a internet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(searchBible, 0);
    return () => clearTimeout(timer);
  }, [bookIndex, chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  function create() {
    const chosen = verses.filter((verse) => selected.includes(verse.verse));
    if (!chosen.length) return;
    const first = chosen[0].verse;
    const last = chosen.at(-1).verse;
    const title = `${book[0]} ${chapter}:${first}${last !== first ? `–${last}` : ""}`;
    onCreate({
      id: id("bible"),
      kind: "bible",
      title,
      subtitle: `Almeida · ${chosen.length} versículo(s)`,
      slides: chosen.map((verse) => ({
        id: id("verse"),
        label: `${book[0]} ${chapter}:${verse.verse}`,
        text: verse.text.trim(),
      })),
    });
  }

  return (
    <div className="backdrop">
      <section className="dialog bible-dialog">
        <header>
          <div><small>BÍBLIA · ALMEIDA</small><h2>Localizar passagem</h2></div>
          <button className="icon" onClick={onClose}><X /></button>
        </header>
        <div className="bible-controls">
          <label>Livro<select value={bookIndex} onChange={(e) => { setBookIndex(+e.target.value); setChapter(1); }}>
            {books.map((item, index) => <option value={index} key={item[0]}>{item[0]}</option>)}
          </select></label>
          <label>Capítulo<select value={chapter} onChange={(e) => setChapter(+e.target.value)}>
            {Array.from({ length: book[2] }, (_, index) => <option key={index + 1}>{index + 1}</option>)}
          </select></label>
          <button className="button secondary" onClick={searchBible}>Atualizar</button>
        </div>
        <div className="verse-toolbar">
          <strong>{book[0]} {chapter}</strong>
          <span>{selected.length} selecionado(s)</span>
          <button onClick={() => setSelected(selected.length === verses.length ? [] : verses.map((v) => v.verse))}>
            {selected.length === verses.length ? "Desmarcar todos" : "Selecionar todos"}
          </button>
        </div>
        <div className="verse-list">
          {loading && <div className="empty-state">Carregando capítulo…</div>}
          {error && <div className="empty-state error">{error}</div>}
          {!loading && !error && verses.map((verse) => (
            <label className={selected.includes(verse.verse) ? "selected" : ""} key={verse.verse}>
              <input type="checkbox" checked={selected.includes(verse.verse)} onChange={() =>
                setSelected((current) => current.includes(verse.verse)
                  ? current.filter((n) => n !== verse.verse)
                  : [...current, verse.verse].sort((a, b) => a - b))
              } />
              <strong>{verse.verse}</strong><span>{verse.text}</span>
            </label>
          ))}
        </div>
        <footer>
          <span>Tradução pública João Ferreira de Almeida</span>
          <button className="button ghost" onClick={onClose}>Cancelar</button>
          <button className="button primary" disabled={!selected.length} onClick={create}><Plus size={16} /> Criar slides</button>
        </footer>
      </section>
    </div>
  );
}

function App() {
  const [state, setState] = useState(emptyState);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [live, setLive] = useState(null);
  const [themeId, setThemeId] = useState("midnight");
  const [blackout, setBlackout] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [alert, setAlert] = useState("");
  const [alertDraft, setAlertDraft] = useState("");
  const [bibleOpen, setBibleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [displays, setDisplays] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([desktop?.loadState(), desktop?.listDisplays()]).then(([saved, screens]) => {
      setState(saved ? { ...emptyState, ...saved, settings: { ...emptyState.settings, ...saved.settings } } : emptyState);
      setDisplays(screens || []);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => desktop?.saveState(state), 250);
    return () => clearTimeout(timer);
  }, [ready, state]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    function handleShortcut(event) {
      const tag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        takeLive();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedSlide((current) => Math.max(0, current - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedSlide((current) =>
          Math.min((selectedItem?.slides.length || 1) - 1, current + 1));
      } else if (event.key.toLowerCase() === "b") {
        setBlackout((current) => !current);
        setTimerVisible(false);
      } else if (event.key === "Escape") {
        setBlackout(false);
        setTimerVisible(false);
        setAlert("");
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const activePlaylist = state.playlists.find((p) => p.id === state.activePlaylistId) || state.playlists[0];
  const selectedItem = state.library.find((item) => item.id === selectedItemId) || null;
  const liveItem = state.library.find((item) => item.id === live?.itemId) || null;
  const theme = themes.find((item) => item.id === themeId) || themes[0];
  const playlistItems = (activePlaylist?.entries || [])
    .map((entry) => ({ entry, item: state.library.find((item) => item.id === entry.itemId) }))
    .filter((row) => row.item);
  const filtered = useMemo(() => state.library.filter((item) => {
    const query = search.toLowerCase().trim();
    return (filter === "all" || item.kind === filter) &&
      (!query || item.title.toLowerCase().includes(query) || item.slides.some((slide) => slide.text?.toLowerCase().includes(query)));
  }), [filter, search, state.library]);

  const nextText = liveItem?.slides?.[live.slideIndex + 1]?.text || "";
  const output = {
    item: liveItem,
    slideIndex: live?.slideIndex || 0,
    theme,
    blackout,
    timerSeconds,
    timerVisible,
    alert,
    nextText,
  };

  useEffect(() => {
    if (ready) desktop?.sendOutput(output);
  }, [ready, live, theme, blackout, timerSeconds, timerVisible, alert]); // eslint-disable-line react-hooks/exhaustive-deps

  function mutate(updater) {
    setState((current) => updater(current));
  }

  function addItem(item) {
    mutate((current) => ({ ...current, library: [item, ...current.library] }));
    setSelectedItemId(item.id);
    setSelectedSlide(0);
    setBibleOpen(false);
    setToast("Conteúdo adicionado à biblioteca");
  }

  function addToPlaylist(itemId) {
    mutate((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) =>
        playlist.id === current.activePlaylistId
          ? { ...playlist, entries: [...playlist.entries, { id: id("entry"), itemId }] }
          : playlist),
    }));
    setToast("Adicionado à programação");
  }

  function removeItem(itemId) {
    const item = state.library.find((entry) => entry.id === itemId);
    if (!item || !confirm(`Remover "${item.title}" da biblioteca e das programações?`)) return;
    mutate((current) => ({
      ...current,
      library: current.library.filter((entry) => entry.id !== itemId),
      playlists: current.playlists.map((playlist) => ({
        ...playlist,
        entries: playlist.entries.filter((entry) => entry.itemId !== itemId),
      })),
    }));
    if (selectedItemId === itemId) {
      setSelectedItemId("");
      setSelectedSlide(0);
    }
    if (live?.itemId === itemId) setLive(null);
    setToast("Conteúdo removido");
  }

  function createText() {
    const title = prompt("Título do conteúdo:");
    if (!title?.trim()) return;
    const content = prompt("Texto do slide:");
    if (!content?.trim()) return;
    addItem({
      id: id("text"),
      kind: "text",
      title: title.trim(),
      subtitle: "Texto · 1 slide",
      slides: [{ id: id("slide"), label: title.trim(), text: content.trim() }],
    });
  }

  async function importText() {
    const paths = await desktop?.chooseFiles([{ name: "Textos", extensions: ["txt"] }]);
    if (!paths?.length) return;
    for (const filePath of paths) {
      const content = await desktop.readTextFile(filePath);
      const parts = content.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
      const title = filePath.split(/[\\/]/).at(-1).replace(/\.txt$/i, "");
      addItem({
        id: id("song"),
        kind: "song",
        title,
        subtitle: `Música · ${parts.length} slide(s)`,
        slides: parts.map((text, index) => ({ id: id("slide"), label: `Parte ${index + 1}`, text })),
      });
    }
  }

  async function importMedia() {
    const paths = await desktop?.chooseFiles([
      { name: "Mídia", extensions: ["png", "jpg", "jpeg", "webp", "mp4", "webm"] },
    ]);
    if (!paths?.length) return;
    for (const filePath of paths) {
      const extension = filePath.split(".").at(-1).toLowerCase();
      const kind = ["mp4", "webm"].includes(extension) ? "video" : "image";
      const title = filePath.split(/[\\/]/).at(-1);
      const url = await desktop?.toFileUrl(filePath);
      addItem({
        id: id(kind),
        kind,
        title,
        subtitle: kind === "video" ? "Vídeo local" : "Imagem local",
        slides: [{ id: id("slide"), label: title, path: filePath, url }],
      });
    }
  }

  function takeLive() {
    if (!selectedItem) return;
    setLive({ itemId: selectedItem.id, slideIndex: selectedSlide });
    setBlackout(false);
    setTimerVisible(false);
    setToast("Conteúdo enviado para projeção");
  }

  function nextLive(direction) {
    if (!liveItem || !live) return;
    const next = Math.max(0, Math.min(liveItem.slides.length - 1, live.slideIndex + direction));
    setLive({ ...live, slideIndex: next });
    setSelectedItemId(live.itemId);
    setSelectedSlide(next);
  }

  async function openOutput(mode) {
    const displayId = mode === "audience" ? state.settings.audienceDisplayId : state.settings.stageDisplayId;
    await desktop?.openOutput(mode, displayId);
    desktop?.sendOutput(output);
    setToast(mode === "audience" ? "Projeção aberta" : "Retorno aberto");
  }

  if (!ready) return <main className="loading"><div>WR</div><span>Preparando central de projeção…</span></main>;

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand"><span>WR</span><div><strong>Lyrics Pro</strong><small>Aplicativo Windows</small></div></div>
        <div className="active-program"><ListMusic size={17} /><div><small>PROGRAMAÇÃO ATIVA</small><strong>{activePlaylist?.name}</strong></div></div>
        <div className="top-actions">
          <button className="button ghost" onClick={() => openOutput("stage")}><Monitor size={16} /> Retorno</button>
          <button className="button primary" onClick={() => openOutput("audience")}><MonitorUp size={16} /> Projeção</button>
          <button className="icon" onClick={() => setSettingsOpen(true)}><Settings2 /></button>
        </div>
      </header>

      <div className="workspace">
        <nav className="rail">
          <button className="active"><Radio /><span>Ao vivo</span></button>
          <button><Music2 /><span>Músicas</span></button>
          <button onClick={() => setBibleOpen(true)}><BookOpen /><span>Bíblia</span></button>
          <button onClick={importMedia}><Image /><span>Mídia</span></button>
          <button onClick={createText}><FileText /><span>Textos</span></button>
          <button onClick={() => desktop?.openLouvorJa()}><ExternalLink /><span>LouvorJA Web</span></button>
        </nav>

        <aside className="panel library-panel">
          <header className="panel-title"><div><small>CONTEÚDO</small><h2>Biblioteca</h2></div><button className="icon" onClick={createText}><Plus /></button></header>
          <label className="search"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar título ou trecho" /></label>
          <div className="filters">
            {[["all", "Todos"], ["song", "Músicas"], ["bible", "Bíblia"], ["text", "Textos"], ["image", "Imagens"], ["video", "Vídeos"]].map(([value, label]) =>
              <button className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>
            )}
          </div>
          <div className="summary"><span>{filtered.length} itens</span><small>Biblioteca local</small></div>
          <div className="library-list">
            {filtered.map((item) => (
              <article className={selectedItemId === item.id ? "selected" : ""} key={item.id} onClick={() => { setSelectedItemId(item.id); setSelectedSlide(0); }}>
                <div className={`kind ${item.kind}`}>{item.kind === "bible" ? <BookOpen /> : item.kind === "song" ? <Music2 /> : item.kind === "image" ? <Image /> : item.kind === "video" ? <Video /> : <FileText />}</div>
                <div><strong>{item.title}</strong><span>{item.subtitle}</span></div>
                <div className="item-actions">
                  <button title="Adicionar à programação" onClick={(event) => { event.stopPropagation(); addToPlaylist(item.id); }}><Plus /></button>
                  <button className="remove" title="Remover da biblioteca" onClick={(event) => { event.stopPropagation(); removeItem(item.id); }}><Trash2 /></button>
                </div>
              </article>
            ))}
            {!filtered.length && <div className="empty-state"><Library /><strong>Biblioteca vazia</strong><span>Importe ou crie o primeiro conteúdo.</span></div>}
          </div>
          <footer>
            <button className="button ghost" onClick={importText}><Upload size={15} /> Importar TXT</button>
            <button className="button ghost" onClick={importMedia}><Image size={15} /> Mídia</button>
            <button className="button secondary" onClick={() => setBibleOpen(true)}><BookOpen size={15} /> Bíblia</button>
          </footer>
        </aside>

        <aside className="panel playlist-panel">
          <header className="panel-title"><div><small>PROGRAMAÇÃO</small><h2>Ordem do culto</h2></div><button className="icon" onClick={() => {
            const name = prompt("Nome da programação:");
            if (!name?.trim()) return;
            const playlist = { id: id("playlist"), name: name.trim(), entries: [] };
            mutate((current) => ({ ...current, playlists: [...current.playlists, playlist], activePlaylistId: playlist.id }));
          }}><Plus /></button></header>
          <select className="playlist-select" value={state.activePlaylistId} onChange={(e) => mutate((current) => ({ ...current, activePlaylistId: e.target.value }))}>
            {state.playlists.map((playlist) => <option value={playlist.id} key={playlist.id}>{playlist.name}</option>)}
          </select>
          <div className="summary"><span>{playlistItems.length} itens</span><small>Ordem manual</small></div>
          <div className="playlist-list">
            {playlistItems.map(({ entry, item }, index) => (
              <article className={live?.itemId === item.id ? "live" : ""} key={entry.id} onClick={() => { setSelectedItemId(item.id); setSelectedSlide(0); }}>
                <span className="index">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><span>{item.slides.length} slide(s)</span></div>
                <button onClick={(event) => {
                  event.stopPropagation();
                  mutate((current) => ({ ...current, playlists: current.playlists.map((playlist) =>
                    playlist.id === current.activePlaylistId ? { ...playlist, entries: playlist.entries.filter((e) => e.id !== entry.id) } : playlist) }));
                }}><Trash2 /></button>
              </article>
            ))}
            {!playlistItems.length && <div className="empty-state"><ListMusic /><strong>Programação vazia</strong><span>Adicione itens pela biblioteca.</span></div>}
          </div>
        </aside>

        <section className="operator">
          <div className="monitors">
            <article><header><span className="preview-dot" /> PRÉVIA <small>{selectedItem?.title || "Sem seleção"}</small></header><OutputCanvas output={{ ...output, item: selectedItem, slideIndex: selectedSlide, blackout: false, timerVisible: false, alert: "" }} /></article>
            <article><header><span className="live-dot" /> NO AR <small>{liveItem?.title || "Sem conteúdo"}</small></header><OutputCanvas output={output} /></article>
          </div>
          <div className="transport">
            <button onClick={() => nextLive(-1)}><SkipBack /></button>
            <button onClick={() => setSelectedSlide((n) => Math.max(0, n - 1))}><ChevronLeft /></button>
            <button className="take" onClick={takeLive}><Play fill="currentColor" /> EXIBIR AGORA <kbd>ENTER</kbd></button>
            <button onClick={() => setSelectedSlide((n) => Math.min((selectedItem?.slides.length || 1) - 1, n + 1))}><ChevronRight /></button>
            <button onClick={() => nextLive(1)}><SkipForward /></button>
            <button className={blackout ? "danger active" : "danger"} onClick={() => { setBlackout((v) => !v); setTimerVisible(false); }}><Square /> Tela preta</button>
            <button className="danger" onClick={() => { setLive(null); setBlackout(false); setTimerVisible(false); }}><X /> Limpar</button>
          </div>
          <div className="slides-area">
            <header><div><small>SLIDES</small><h3>{selectedItem?.title || "Selecione um conteúdo"}</h3></div><span>{selectedItem ? selectedSlide + 1 : 0} / {selectedItem?.slides.length || 0}</span></header>
            <div className="slides">
              {selectedItem?.slides.map((slide, index) => (
                <button className={selectedSlide === index ? "selected" : ""} key={slide.id} onClick={() => setSelectedSlide(index)} onDoubleClick={() => { setSelectedSlide(index); setLive({ itemId: selectedItem.id, slideIndex: index }); }}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <div style={{ background: theme.background, color: theme.color }}>{slide.path ? <span>{selectedItem.kind === "video" ? "VÍDEO" : "IMAGEM"}</span> : <p>{slide.text}</p>}</div>
                  <span>{slide.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="control-panel">
          <div className="control-tabs"><button className="active"><Palette /> Visual</button><button><Settings2 /> Ferramentas</button></div>
          <section>
            <small>TEMA ATIVO</small><h3>{theme.name}</h3>
            <div className="theme-grid">{themes.map((item) => (
              <button className={item.id === themeId ? "selected" : ""} onClick={() => setThemeId(item.id)} key={item.id}>
                <i style={{ background: item.background, color: item.color }}>Aa</i><span>{item.name}</span>{item.id === themeId && <Check />}
              </button>
            ))}</div>
          </section>
          <section className="tool-card">
            <header><Clock3 /><div><strong>Contagem regressiva</strong><span>Exiba antes do início</span></div></header>
            <div className="timer">{formatTime(timerSeconds)}</div>
            <label className="timer-input">Minutos
              <input type="number" min="0" max="999" value={Math.floor(timerSeconds / 60)}
                onChange={(event) => { setTimerRunning(false); setTimerSeconds(Math.max(0, Number(event.target.value) || 0) * 60); }} />
            </label>
            <div className="tool-actions">
              <button className="button ghost" onClick={() => setTimerRunning((v) => !v)} disabled={!timerSeconds}>{timerRunning ? "Pausar" : "Iniciar"}</button>
              <button className="button ghost" onClick={() => { setTimerRunning(false); setTimerSeconds(300); setTimerVisible(false); }}>Reiniciar</button>
              <button className="button primary" onClick={() => { setTimerVisible((current) => !current); setBlackout(false); }}>{timerVisible ? "Ocultar" : "Exibir"}</button>
            </div>
          </section>
          <section className="tool-card">
            <header><MessageSquareText /><div><strong>Alerta na tela</strong><span>Mensagem sem trocar slide</span></div></header>
            <textarea value={alertDraft} onChange={(e) => setAlertDraft(e.target.value)} placeholder="Digite uma mensagem curta" />
            <div className="tool-actions"><button className="button ghost" onClick={() => { setAlert(""); setAlertDraft(""); }}>Limpar</button><button className="button primary" onClick={() => setAlert(alertDraft.trim())}>Exibir</button></div>
          </section>
        </aside>
      </div>

      <footer className="status"><span><Radio size={9} /> Sistema pronto</span><small>Salvamento automático · Base local</small></footer>

      {bibleOpen && <BibleDialog onClose={() => setBibleOpen(false)} onCreate={addItem} />}
      {settingsOpen && (
        <div className="backdrop">
          <section className="dialog settings-dialog">
            <header><div><small>APLICATIVO WINDOWS</small><h2>Configurações</h2></div><button className="icon" onClick={() => setSettingsOpen(false)}><X /></button></header>
            <div className="settings-body">
              <label>Tela de projeção<select value={state.settings.audienceDisplayId || ""} onChange={(e) => mutate((current) => ({ ...current, settings: { ...current.settings, audienceDisplayId: +e.target.value || null } }))}>
                <option value="">Tela principal</option>{displays.map((display) => <option value={display.id} key={display.id}>{display.label}{display.primary ? " · Principal" : ""} · {display.bounds.width}×{display.bounds.height}</option>)}
              </select></label>
              <label>Tela de retorno<select value={state.settings.stageDisplayId || ""} onChange={(e) => mutate((current) => ({ ...current, settings: { ...current.settings, stageDisplayId: +e.target.value || null } }))}>
                <option value="">Tela principal</option>{displays.map((display) => <option value={display.id} key={display.id}>{display.label}{display.primary ? " · Principal" : ""} · {display.bounds.width}×{display.bounds.height}</option>)}
              </select></label>
              <div className="folder-setting">
                <div><span>Fonte local do LouvorJA</span><strong>{state.settings.louvorJaPath || "Não configurada"}</strong><small>A leitura será implementada quando você indicar a pasta.</small></div>
                <button className="button secondary" onClick={async () => {
                  const folder = await desktop?.chooseDirectory();
                  if (folder) mutate((current) => ({ ...current, settings: { ...current.settings, louvorJaPath: folder } }));
                }}><FolderOpen size={16} /> Indicar pasta</button>
              </div>
              <button className="louvor-link" onClick={() => desktop?.openLouvorJa()}><ExternalLink /> Abrir LouvorJA Web</button>
            </div>
            <footer><button className="button primary" onClick={() => setSettingsOpen(false)}>Concluir</button></footer>
          </section>
        </div>
      )}
      {toast && <div className="toast"><Check /> {toast}</div>}
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  location.hash.startsWith("#output=") ? <OutputWindow /> : <App />,
);
