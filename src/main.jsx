import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Image,
  Library,
  ListMusic,
  LockKeyhole,
  MessageSquareText,
  MicOff,
  Monitor,
  MonitorUp,
  Music2,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Pencil,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Square,
  Trash2,
  Upload,
  Video,
  Volume2,
  X,
} from "lucide-react";
import "./styles.css";
import { ObsClient } from "./obs-client.js";

const desktop = window.wrDesktop;
const defaultLayouts = [
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

const emptyState = {
  library: [],
  playlists: [{ id: "initial", name: "Nova programação", entries: [] }],
  activePlaylistId: "initial",
  layouts: defaultLayouts,
  activeLayoutId: "midnight",
  scenes: [{ id: "initial-scene", name: "Cena principal", layoutId: "midnight", itemId: "", slideIndex: 0, obsSceneName: "" }],
  activeSceneId: "initial-scene",
  transition: { type: "fade", duration: 400 },
  hotkeys: {
    takeLive: "Enter",
    previousSlide: "ArrowLeft",
    nextSlide: "ArrowRight",
    blackout: "B",
    clear: "Escape",
    nextScene: "Ctrl+ArrowRight",
  },
  settings: {
    audienceDisplayId: null,
    stageDisplayId: null,
    safeBackground: "#000000",
    safeBackgroundImage: "",
    obsHost: "127.0.0.1",
    obsPort: 4455,
    louvorJaPath: "",
    louvorJaPinHash: "",
  },
};

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

function normalizeHex(value, fallback) {
  if (/^#[0-9a-f]{6}$/i.test(value || "")) return value;
  if (/^#[0-9a-f]{3}$/i.test(value || "")) {
    return `#${value.slice(1).split("").map((part) => part.repeat(2)).join("")}`;
  }
  return fallback;
}

function keyboardShortcut(event) {
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  const modifiers = [];
  if (event.ctrlKey && key !== "Control") modifiers.push("Ctrl");
  if (event.altKey && key !== "Alt") modifiers.push("Alt");
  if (event.shiftKey && key !== "Shift") modifiers.push("Shift");
  if (event.metaKey && key !== "Meta") modifiers.push("Meta");
  if (["Control", "Alt", "Shift", "Meta"].includes(key)) return modifiers.join("+");
  return [...modifiers, key].join("+");
}

async function hashPin(pin) {
  const bytes = new TextEncoder().encode(pin);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

const imageExtensions = ["png", "jpg", "jpeg", "webp", "gif", "bmp"];
const videoExtensions = ["mp4", "webm", "mov", "m4v"];
const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac", "flac"];
const textExtensions = ["txt", "md", "csv", "json", "xml"];

function OutputCanvas({ output, stage = false }) {
  const theme = output?.theme || defaultLayouts[0];
  const slide = output?.item?.slides?.[output.slideIndex] || null;
  const isEmpty = !output?.item && !output?.timerVisible && !output?.blackout;
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    if (!stage) return undefined;
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, [stage]);
  return (
    <div
      className={`output-canvas ${stage ? "stage-view" : ""} ${isEmpty ? "empty-view" : ""}`}
      style={{
        "--output-bg": theme.background,
        "--safe-bg": output?.safeBackground || "#000000",
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
      <div key={output?.transitionNonce || 0} className={`output-center transition-${output?.transition?.type || "cut"}`} style={{ "--transition-duration": `${output?.transition?.duration || 0}ms` }}>
        {output?.blackout ? null : output?.timerVisible ? (
          <div className={`timer-output ${output.timerSeconds <= 0 ? "finished" : output.timerSeconds <= 10 ? "ending" : ""}`}>
            <span>COMEÇAMOS EM</span>
            <strong>{formatTime(output.timerSeconds)}</strong>
          </div>
        ) : slide ? (
          <>
            {output.item.kind === "image" && <img src={slide.url || `file://${slide.path}`} alt="" />}
            {output.item.kind === "video" && <video src={slide.url || `file://${slide.path}`} autoPlay playsInline />}
            {output.item.kind === "audio" && <audio src={slide.url || `file://${slide.path}`} autoPlay controls />}
            {!["image", "video", "audio"].includes(output.item.kind) && (
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
  useEffect(() => {
    function handleEmergencyKey(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      desktop?.requestEmergencyClear();
    }
    window.addEventListener("keydown", handleEmergencyKey);
    return () => window.removeEventListener("keydown", handleEmergencyKey);
  }, []);
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

function TextDialog({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const slides = content.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

  function create(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !slides.length) return;
    onCreate({
      id: id("text"),
      kind: "text",
      title: cleanTitle,
      subtitle: `Texto · ${slides.length} slide(s)`,
      slides: slides.map((text, index) => ({
        id: id("slide"),
        label: slides.length === 1 ? cleanTitle : `Parte ${index + 1}`,
        text,
      })),
    });
    onClose();
  }

  return (
    <div className="backdrop">
      <form className="dialog text-dialog" onSubmit={create}>
        <header>
          <div><small>NOVO CONTEÚDO</small><h2>Criar texto</h2></div>
          <button className="icon" type="button" onClick={onClose}><X /></button>
        </header>
        <div className="text-editor">
          <label>Título<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Avisos" /></label>
          <label>Conteúdo<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Digite o texto. Separe slides com uma linha em branco." /></label>
        </div>
        <footer>
          <span>{slides.length} slide(s)</span>
          <button className="button ghost" type="button" onClick={onClose}>Cancelar</button>
          <button className="button primary" type="submit" disabled={!title.trim() || !slides.length}><Plus size={16} /> Criar</button>
        </footer>
      </form>
    </div>
  );
}

function PlaylistDialog({ initialName = "", mode, onClose, onSave }) {
  const [name, setName] = useState(initialName);

  function save(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    onSave(cleanName);
    onClose();
  }

  return (
    <div className="backdrop">
      <form className="dialog name-dialog" onSubmit={save}>
        <header>
          <div><small>PROGRAMAÇÃO</small><h2>{mode === "edit" ? "Renomear programação" : "Nova programação"}</h2></div>
          <button className="icon" type="button" onClick={onClose}><X /></button>
        </header>
        <div className="name-editor">
          <label>Nome<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Culto de domingo" /></label>
        </div>
        <footer>
          <button className="button ghost" type="button" onClick={onClose}>Cancelar</button>
          <button className="button primary" type="submit" disabled={!name.trim()}>Salvar</button>
        </footer>
      </form>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel = "Excluir", onClose, onConfirm }) {
  return (
    <div className="backdrop">
      <section className="dialog confirm-dialog">
        <header>
          <div><small>CONFIRMAÇÃO</small><h2>{title}</h2></div>
          <button className="icon" onClick={onClose}><X /></button>
        </header>
        <div className="confirm-body"><p>{message}</p></div>
        <footer>
          <button className="button ghost" onClick={onClose}>Cancelar</button>
          <button className="button danger-button" onClick={() => { onConfirm(); onClose(); }}><Trash2 size={15} /> {confirmLabel}</button>
        </footer>
      </section>
    </div>
  );
}

function SceneDialog({ initialScene, layouts, library, obsScenes, mode, onClose, onSave }) {
  const [name, setName] = useState(mode === "create" ? "Nova cena" : initialScene?.name || "Cena");
  const [layoutId, setLayoutId] = useState(initialScene?.layoutId || layouts[0]?.id || "");
  const [itemId, setItemId] = useState(initialScene?.itemId || "");
  const [obsSceneName, setObsSceneName] = useState(initialScene?.obsSceneName || "");

  function save(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    onSave({ name: cleanName, layoutId, itemId, slideIndex: 0, obsSceneName });
    onClose();
  }

  return (
    <div className="backdrop">
      <form className="dialog scene-dialog" onSubmit={save}>
        <header>
          <div><small>CENA</small><h2>{mode === "edit" ? "Editar cena" : "Criar cena"}</h2></div>
          <button className="icon" type="button" onClick={onClose}><X /></button>
        </header>
        <div className="scene-editor">
          <label>Nome<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Layout<select value={layoutId} onChange={(event) => setLayoutId(event.target.value)}>{layouts.map((layout) => <option value={layout.id} key={layout.id}>{layout.name}</option>)}</select></label>
          <label>Conteúdo inicial<select value={itemId} onChange={(event) => setItemId(event.target.value)}><option value="">Sem conteúdo</option>{library.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
          <label>Cena vinculada no OBS<select value={obsSceneName} onChange={(event) => setObsSceneName(event.target.value)}><option value="">Nenhuma</option>{obsScenes.map((sceneName) => <option value={sceneName} key={sceneName}>{sceneName}</option>)}</select></label>
        </div>
        <footer>
          <button className="button ghost" type="button" onClick={onClose}>Cancelar</button>
          <button className="button primary" type="submit" disabled={!name.trim()}>Salvar cena</button>
        </footer>
      </form>
    </div>
  );
}

function HotkeyInput({ value, onChange }) {
  return <input className="hotkey-input" readOnly value={value} onKeyDown={(event) => {
    event.preventDefault();
    event.stopPropagation();
    const shortcut = keyboardShortcut(event);
    if (shortcut) onChange(shortcut);
  }} onFocus={(event) => event.target.select()} />;
}

function LayoutDialog({ initialLayout, mode, onClose, onSave }) {
  const [name, setName] = useState(mode === "create" ? `${initialLayout?.name || "Layout"} cópia` : initialLayout?.name || "Novo layout");
  const [background, setBackground] = useState(
    normalizeHex(initialLayout?.background, "#111a29"),
  );
  const [backgroundEdited, setBackgroundEdited] = useState(!initialLayout?.background);
  const [backgroundImage, setBackgroundImage] = useState(initialLayout?.backgroundImage || "");
  const [color, setColor] = useState(normalizeHex(initialLayout?.color, "#ffffff"));
  const [accent, setAccent] = useState(normalizeHex(initialLayout?.accent, "#6ed7ff"));

  function save(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    onSave({
      name: cleanName,
      background: backgroundImage
        ? `url("${backgroundImage}") center / cover no-repeat`
        : backgroundEdited ? background : initialLayout.background,
      backgroundImage,
      color,
      accent,
    });
    onClose();
  }

  async function chooseBackgroundImage() {
    const paths = await desktop?.chooseFiles([{ name: "Imagens de fundo", extensions: imageExtensions }]);
    if (!paths?.length) return;
    const url = await desktop.toFileUrl(paths[0]);
    setBackgroundImage(url);
  }

  return (
    <div className="backdrop">
      <form className="dialog layout-dialog" onSubmit={save}>
        <header>
          <div><small>LAYOUT BASE</small><h2>{mode === "edit" ? "Editar layout" : "Criar layout"}</h2></div>
          <button className="icon" type="button" onClick={onClose}><X /></button>
        </header>
        <div className="layout-editor">
          <label className="layout-name">Nome<input autoFocus value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label>Cor do fundo<input type="color" value={background} onChange={(event) => { setBackground(event.target.value); setBackgroundEdited(true); setBackgroundImage(""); }} /></label>
          <label>Texto<input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></label>
          <label>Destaque<input type="color" value={accent} onChange={(event) => setAccent(event.target.value)} /></label>
          <div className="background-upload"><button className="button secondary" type="button" onClick={chooseBackgroundImage}><Upload size={15} /> Carregar imagem de fundo</button>{backgroundImage && <button className="button ghost" type="button" onClick={() => { setBackgroundImage(""); setBackgroundEdited(true); }}>Remover imagem</button>}</div>
          <div className="layout-preview" style={{ background: backgroundImage ? `url("${backgroundImage}") center / cover no-repeat` : backgroundEdited ? background : initialLayout?.background, color, borderColor: accent }}><span style={{ color: accent }}>PRÉVIA</span><strong>Texto projetado</strong></div>
        </div>
        <footer>
          <button className="button ghost" type="button" onClick={onClose}>Cancelar</button>
          <button className="button primary" type="submit" disabled={!name.trim()}>Salvar layout</button>
        </footer>
      </form>
    </div>
  );
}

function LouvorJaSetupDialog({ initialPath, onClose, onSave }) {
  const [selectedPath, setSelectedPath] = useState(initialPath || "");
  const [pin, setPin] = useState("");
  const [pinConfirmation, setPinConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selectedPath && initialPath) setSelectedPath(initialPath);
  }, [initialPath, selectedPath]);

  async function chooseExecutable() {
    const paths = await desktop?.chooseFiles([{ name: "Aplicativo LouvorJA", extensions: ["exe"] }]);
    if (paths?.[0]) {
      setSelectedPath(paths[0]);
      setError("");
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!/^\d{4,8}$/.test(pin)) {
      setError("Crie um PIN numérico de 4 a 8 dígitos.");
      return;
    }
    if (pin !== pinConfirmation) {
      setError("A confirmação do PIN não confere.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const info = await desktop?.inspectLouvorJa(selectedPath);
      if (!info?.valid) throw new Error(info?.error || "Arquivo do LouvorJA inválido.");
      onSave({ path: info.executablePath, pinHash: await hashPin(pin), info });
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="backdrop">
      <form className="dialog louvorja-dialog" onSubmit={save}>
        <header><div><small>CONFIGURAÇÃO INICIAL</small><h2>Conectar ao LouvorJA</h2></div><LockKeyhole /></header>
        <div className="louvorja-setup-body">
          <p>Selecione o arquivo original <strong>LouvorJA.exe</strong>. O catálogo será acessado somente para pesquisa.</p>
          <label>Arquivo do LouvorJA<div className="path-picker"><input value={selectedPath} onChange={(event) => setSelectedPath(event.target.value)} placeholder="Ex.: E:\\Louvor JA\\Louvor JA\\LouvorJA.exe" /><button className="button secondary" type="button" onClick={chooseExecutable}><FolderOpen size={15} /> Procurar</button></div></label>
          <div className="pin-fields">
            <label>PIN administrativo<input type="password" inputMode="numeric" maxLength="8" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="4 a 8 dígitos" /></label>
            <label>Confirmar PIN<input type="password" inputMode="numeric" maxLength="8" value={pinConfirmation} onChange={(event) => setPinConfirmation(event.target.value.replace(/\D/g, ""))} placeholder="Repita o PIN" /></label>
          </div>
          <small>Esse PIN protege o acesso à pesquisa e a alteração do caminho em Ferramentas.</small>
          {error && <p className="settings-error">{error}</p>}
        </div>
        <footer><button className="button ghost" type="button" onClick={onClose}>Configurar depois</button><button className="button primary" type="submit" disabled={busy || !selectedPath}>{busy ? "Validando…" : "Salvar e proteger"}</button></footer>
      </form>
    </div>
  );
}

function ProtectedAccessDialog({ pinHash, onClose, onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function unlock(event) {
    event.preventDefault();
    if (await hashPin(pin) !== pinHash) {
      setError("PIN incorreto.");
      setPin("");
      return;
    }
    onUnlock();
  }

  return (
    <div className="backdrop">
      <form className="dialog protected-access-dialog" onSubmit={unlock}>
        <header><div><small>ÁREA PROTEGIDA</small><h2>Ferramentas do LouvorJA</h2></div><button className="icon" type="button" onClick={onClose}><X /></button></header>
        <div className="protected-access-body"><LockKeyhole /><label>PIN administrativo<input autoFocus type="password" inputMode="numeric" maxLength="8" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} /></label>{error && <p className="settings-error">{error}</p>}</div>
        <footer><button className="button ghost" type="button" onClick={onClose}>Cancelar</button><button className="button primary" type="submit" disabled={!pin}>Desbloquear</button></footer>
      </form>
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
  const [liveLayoutId, setLiveLayoutId] = useState(emptyState.activeLayoutId);
  const [transitionNonce, setTransitionNonce] = useState(0);
  const [blackout, setBlackout] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [alert, setAlert] = useState("");
  const [alertDraft, setAlertDraft] = useState("");
  const [bibleOpen, setBibleOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [playlistDialog, setPlaylistDialog] = useState(null);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [layoutDialog, setLayoutDialog] = useState(null);
  const [sceneDialog, setSceneDialog] = useState(null);
  const [sceneToDelete, setSceneToDelete] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlTab, setControlTab] = useState("visual");
  const [activeTool, setActiveTool] = useState("timer");
  const [controlPanelOpen, setControlPanelOpen] = useState(true);
  const [louvorJaSetupOpen, setLouvorJaSetupOpen] = useState(false);
  const [louvorJaUnlockOpen, setLouvorJaUnlockOpen] = useState(false);
  const [louvorJaUnlocked, setLouvorJaUnlocked] = useState(false);
  const [louvorJaSuggestedPath, setLouvorJaSuggestedPath] = useState("");
  const [louvorJaBusy, setLouvorJaBusy] = useState(false);
  const [louvorJaInfo, setLouvorJaInfo] = useState(null);
  const [louvorJaError, setLouvorJaError] = useState("");
  const [louvorJaSearch, setLouvorJaSearch] = useState("");
  const [louvorJaResults, setLouvorJaResults] = useState([]);
  const [louvorJaSearching, setLouvorJaSearching] = useState(false);
  const [louvorJaPlaying, setLouvorJaPlaying] = useState("");
  const [displays, setDisplays] = useState([]);
  const [toast, setToast] = useState("");
  const [, setSaveStatus] = useState("Salvo");
  const obsClientRef = useRef(null);
  const [obsPassword, setObsPassword] = useState("");
  const [obsStatus, setObsStatus] = useState("disconnected");
  const [obsError, setObsError] = useState("");
  const [obsScenes, setObsScenes] = useState([]);
  const [obsCurrentScene, setObsCurrentScene] = useState("");

  useEffect(() => {
    const setupPromise = desktop?.getLouvorJaSetup?.() || Promise.resolve(null);
    Promise.all([desktop?.loadState(), desktop?.listDisplays(), setupPromise]).then(([saved, screens, detectedLouvorJa]) => {
      const savedState = saved?.state || null;
      const legacyImportedIds = new Set((savedState?.library || [])
        .filter((item) => item.source?.type === "louvorja")
        .map((item) => item.id));
      const loaded = savedState ? {
        ...savedState,
        library: savedState.library.filter((item) => !legacyImportedIds.has(item.id)),
        playlists: savedState.playlists.map((playlist) => ({
          ...playlist,
          entries: playlist.entries.filter((entry) => !legacyImportedIds.has(entry.itemId)),
        })),
        scenes: (savedState.scenes || []).map((scene) => legacyImportedIds.has(scene.itemId) ? { ...scene, itemId: "", slideIndex: 0 } : scene),
      } : null;
      const hydrated = loaded ? {
        ...emptyState,
        ...loaded,
        layouts: loaded.layouts?.length ? loaded.layouts : defaultLayouts,
        scenes: loaded.scenes?.length ? loaded.scenes : emptyState.scenes,
        transition: { ...emptyState.transition, ...loaded.transition },
        hotkeys: { ...emptyState.hotkeys, ...loaded.hotkeys },
        settings: {
          ...emptyState.settings,
          ...loaded.settings,
          louvorJaPath: loaded.settings?.louvorJaPath || detectedLouvorJa?.executablePath || "",
        },
      } : {
        ...emptyState,
        settings: { ...emptyState.settings, louvorJaPath: detectedLouvorJa?.executablePath || "" },
      };
      setState(hydrated);
      setLiveLayoutId(hydrated.activeLayoutId);
      setDisplays(screens || []);
      setLouvorJaSuggestedPath(hydrated.settings.louvorJaPath || detectedLouvorJa?.executablePath || "");
      setLouvorJaInfo(detectedLouvorJa?.valid ? detectedLouvorJa : null);
      if (!hydrated.settings.louvorJaPinHash) setLouvorJaSetupOpen(true);
      setReady(true);
      if (saved?.recovered) setToast("Backup recuperado após detectar dados inválidos");
    }).catch(() => {
      setState(emptyState);
      setReady(true);
      setLouvorJaSetupOpen(true);
      setToast("Não foi possível carregar os dados. Uma base vazia foi aberta.");
    });
  }, []);

  useEffect(() => () => obsClientRef.current?.disconnect(), []);
  useEffect(() => desktop?.onEmergencyClear(emergencyClear), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!ready) return;
    setSaveStatus("Salvando…");
    const timer = setTimeout(async () => {
      try {
        await desktop?.saveState(state);
        setSaveStatus("Salvo");
      } catch {
        setSaveStatus("Falha ao salvar");
        setToast("Falha ao salvar. Verifique o espaço disponível no computador.");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [ready, state]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const searchText = louvorJaSearch.trim();
    if (!louvorJaUnlocked || controlTab !== "tools" || !state.settings.louvorJaPath || searchText.length < 2) {
      setLouvorJaResults([]);
      setLouvorJaSearching(false);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLouvorJaSearching(true);
      setLouvorJaError("");
      try {
        const result = await desktop?.searchLouvorJa(state.settings.louvorJaPath, searchText);
        if (cancelled) return;
        setLouvorJaResults(result?.results || []);
        if (result?.info) setLouvorJaInfo(result.info);
      } catch (error) {
        if (!cancelled) {
          setLouvorJaResults([]);
          setLouvorJaError(error.message);
        }
      } finally {
        if (!cancelled) setLouvorJaSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [controlTab, louvorJaSearch, louvorJaUnlocked, state.settings.louvorJaPath]);

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
      if (event.key === "Escape") {
        event.preventDefault();
        emergencyClear();
        return;
      }
      const tag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;
      const shortcut = keyboardShortcut(event);
      if (shortcut === state.hotkeys.takeLive) {
        event.preventDefault();
        takeLive();
      } else if (shortcut === state.hotkeys.previousSlide) {
        event.preventDefault();
        setSelectedSlide((current) => Math.max(0, current - 1));
      } else if (shortcut === state.hotkeys.nextSlide) {
        event.preventDefault();
        setSelectedSlide((current) =>
          Math.min((selectedItem?.slides.length || 1) - 1, current + 1));
      } else if (shortcut === state.hotkeys.blackout) {
        event.preventDefault();
        setBlackout((current) => !current);
        setTimerVisible(false);
      } else if (shortcut === state.hotkeys.clear) {
        event.preventDefault();
        clearLiveOutput();
      } else if (shortcut === state.hotkeys.nextScene) {
        event.preventDefault();
        const currentIndex = scenes.findIndex((scene) => scene.id === activeScene?.id);
        const nextScene = scenes[(currentIndex + 1) % scenes.length];
        if (nextScene) previewScene(nextScene.id);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  });

  const activePlaylist = state.playlists.find((p) => p.id === state.activePlaylistId) || state.playlists[0];
  const selectedItem = state.library.find((item) => item.id === selectedItemId) || null;
  const liveItem = state.library.find((item) => item.id === live?.itemId) || null;
  const layouts = state.layouts?.length ? state.layouts : defaultLayouts;
  const theme = layouts.find((item) => item.id === state.activeLayoutId) || layouts[0] || defaultLayouts[0];
  const liveTheme = layouts.find((item) => item.id === liveLayoutId) || theme;
  const scenes = state.scenes?.length ? state.scenes : emptyState.scenes;
  const activeScene = scenes.find((scene) => scene.id === state.activeSceneId) || scenes[0];
  const operatorDisplay = displays.find((display) => display.operator) || displays.find((display) => display.primary) || displays[0];
  const externalDisplays = displays.filter((display) => display.id !== operatorDisplay?.id);
  const configuredAudienceDisplay = displays.find((display) => display.id === state.settings.audienceDisplayId);
  const configuredStageDisplay = displays.find((display) => display.id === state.settings.stageDisplayId);
  const audienceRoleDisplay = configuredAudienceDisplay || externalDisplays[0] || operatorDisplay;
  const stageRoleDisplay = configuredStageDisplay || externalDisplays[1] || operatorDisplay;
  const playlistItems = (activePlaylist?.entries || [])
    .map((entry) => ({ entry, item: state.library.find((item) => item.id === entry.itemId) }))
    .filter((row) => row.item);
  const filtered = useMemo(() => state.library.filter((item) => {
    const query = search.toLowerCase().trim();
    const matchesKind = filter === "all" || item.kind === filter ||
      (filter === "song" && item.kind === "audio") ||
      (filter === "media" && ["image", "video"].includes(item.kind));
    return matchesKind &&
      (!query || item.title.toLowerCase().includes(query) || item.slides.some((slide) => slide.text?.toLowerCase().includes(query)));
  }), [filter, search, state.library]);
  const nextText = liveItem?.slides?.[live.slideIndex + 1]?.text || "";
  const output = {
    item: liveItem,
    slideIndex: live?.slideIndex || 0,
    theme: liveTheme,
    blackout,
    timerSeconds,
    timerVisible,
    alert,
    nextText,
    transition: state.transition,
    transitionNonce,
    safeBackground: state.settings.safeBackgroundImage
      ? `url("${state.settings.safeBackgroundImage}") center / cover no-repeat`
      : state.settings.safeBackground,
  };

  useEffect(() => {
    if (ready) desktop?.sendOutput(output);
  }, [ready, live, liveTheme, blackout, timerSeconds, timerVisible, alert, state.transition, state.settings.safeBackground, state.settings.safeBackgroundImage, transitionNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  function mutate(updater) {
    setState((current) => updater(current));
  }

  function clearLiveOutput() {
    setLive(null);
    setBlackout(false);
    setTimerRunning(false);
    setTimerVisible(false);
    setAlert("");
    setAlertDraft("");
    setTransitionNonce((current) => current + 1);
  }

  function configureTimer(totalSeconds) {
    const safeDuration = Math.max(0, Math.min(59999, Math.floor(Number(totalSeconds) || 0)));
    setTimerRunning(false);
    setTimerDuration(safeDuration);
    setTimerSeconds(safeDuration);
  }

  function toggleTimer() {
    if (timerRunning) {
      setTimerRunning(false);
      return;
    }
    if (!timerSeconds && timerDuration) setTimerSeconds(timerDuration);
    if (timerSeconds || timerDuration) setTimerRunning(true);
  }

  function resetTimer() {
    setTimerRunning(false);
    setTimerSeconds(timerDuration);
  }

  function emergencyClear() {
    clearLiveOutput();
    setSelectedItemId("");
    setSelectedSlide(0);
    setBibleOpen(false);
    setTextOpen(false);
    setPlaylistDialog(null);
    setPlaylistToDelete(null);
    setLayoutDialog(null);
    setSceneDialog(null);
    setSceneToDelete(null);
    setSettingsOpen(false);
    setLouvorJaSetupOpen(false);
    setLouvorJaUnlockOpen(false);
    setLouvorJaUnlocked(false);
    setControlPanelOpen(false);
    desktop?.closeOutput("audience");
    desktop?.closeOutput("stage");
    setToast("Saídas limpas e janelas fechadas");
  }

  async function chooseSafeBackgroundImage() {
    const paths = await desktop?.chooseFiles([{ name: "Imagem de fundo de segurança", extensions: imageExtensions }]);
    if (!paths?.length) return;
    const url = await desktop.toFileUrl(paths[0]);
    mutate((current) => ({ ...current, settings: { ...current.settings, safeBackgroundImage: url } }));
    setToast("Fundo de segurança atualizado");
  }

  async function refreshObsScenes(client = obsClientRef.current) {
    if (!client) return;
    const result = await client.request("GetSceneList");
    setObsScenes((result.scenes || []).map((scene) => scene.sceneName).reverse());
    setObsCurrentScene(result.currentProgramSceneName || "");
  }

  async function connectObs() {
    setObsError("");
    obsClientRef.current?.disconnect();
    const client = new ObsClient({
      onStatus: setObsStatus,
      onEvent: (eventType, eventData) => {
        if (eventType === "CurrentProgramSceneChanged") setObsCurrentScene(eventData.sceneName || "");
        if (["SceneListChanged", "SceneCreated", "SceneRemoved", "SceneNameChanged"].includes(eventType)) {
          refreshObsScenes(client).catch(() => {});
        }
      },
    });
    obsClientRef.current = client;
    try {
      await client.connect({
        host: state.settings.obsHost || "127.0.0.1",
        port: Number(state.settings.obsPort) || 4455,
        password: obsPassword,
      });
      await refreshObsScenes(client);
      setToast("Conectado ao OBS");
    } catch (error) {
      setObsError(error.message);
      setObsStatus("error");
    }
  }

  function disconnectObs() {
    obsClientRef.current?.disconnect();
    obsClientRef.current = null;
    setObsStatus("disconnected");
    setObsScenes([]);
    setObsCurrentScene("");
  }

  async function setObsProgramScene(sceneName) {
    if (!sceneName || obsStatus !== "connected") return;
    try {
      await obsClientRef.current.request("SetCurrentProgramScene", { sceneName });
      setObsCurrentScene(sceneName);
    } catch (error) {
      setObsError(error.message);
    }
  }

  function previewScene(sceneId) {
    const scene = scenes.find((item) => item.id === sceneId);
    if (!scene) return;
    mutate((current) => ({ ...current, activeSceneId: scene.id, activeLayoutId: scene.layoutId || current.activeLayoutId }));
    setSelectedItemId(scene.itemId || "");
    setSelectedSlide(scene.slideIndex || 0);
  }

  async function takeSceneLive(scene = activeScene) {
    if (!scene) return;
    previewScene(scene.id);
    setLive(scene.itemId ? { itemId: scene.itemId, slideIndex: scene.slideIndex || 0 } : null);
    setLiveLayoutId(scene.layoutId || state.activeLayoutId);
    setTransitionNonce((current) => current + 1);
    setBlackout(false);
    setTimerVisible(false);
    if (scene.obsSceneName) await setObsProgramScene(scene.obsSceneName);
    setToast("Cena enviada ao ar");
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

  function configureLouvorJa({ path, pinHash, info }) {
    mutate((current) => ({
      ...current,
      settings: { ...current.settings, louvorJaPath: path, louvorJaPinHash: pinHash },
    }));
    setLouvorJaSuggestedPath(path);
    setLouvorJaInfo(info);
    setLouvorJaSetupOpen(false);
    setLouvorJaUnlocked(true);
    setControlTab("tools");
    setActiveTool("louvorja");
    setControlPanelOpen(true);
    setToast("LouvorJA conectado e protegido");
  }

  async function changeLouvorJaFolder() {
    const paths = await desktop?.chooseFiles([{ name: "Aplicativo LouvorJA", extensions: ["exe"] }]);
    if (!paths?.[0]) return;
    setLouvorJaError("");
    try {
      const info = await desktop?.inspectLouvorJa(paths[0]);
      if (!info?.valid) throw new Error(info?.error || "Arquivo do LouvorJA inválido.");
      mutate((current) => ({ ...current, settings: { ...current.settings, louvorJaPath: info.executablePath } }));
      setLouvorJaSuggestedPath(info.executablePath);
      setLouvorJaInfo(info);
      setLouvorJaResults([]);
      setLouvorJaSearch("");
      setToast("Local do LouvorJA atualizado");
    } catch (error) {
      setLouvorJaError(error.message);
    }
  }

  async function openLouvorJaOriginal(song = null) {
    if (!state.settings.louvorJaPath) {
      setLouvorJaSetupOpen(true);
      return;
    }
    setLouvorJaBusy(true);
    setLouvorJaError("");
    try {
      await desktop?.openLouvorJa(state.settings.louvorJaPath);
      setToast(song ? `LouvorJA aberto · ${song.title}` : "LouvorJA original aberto");
    } catch (error) {
      setLouvorJaError(error.message);
    } finally {
      setLouvorJaBusy(false);
    }
  }

  async function playInLouvorJa(song, tag) {
    const operationId = `${song.id}:${tag}`;
    setLouvorJaPlaying(operationId);
    setLouvorJaError("");
    try {
      await desktop?.playLouvorJa(state.settings.louvorJaPath, song.id, tag);
      const mode = tag === 2 ? "playback" : tag === 3 ? "somente áudio" : "original";
      setToast(`Reproduzindo ${song.title} · ${mode}`);
    } catch (error) {
      setLouvorJaError(error.message);
    } finally {
      setLouvorJaPlaying("");
    }
  }

  async function importFiles() {
    const supportedExtensions = [...textExtensions, ...audioExtensions, ...imageExtensions, ...videoExtensions];
    const paths = await desktop?.chooseFiles([
      { name: "Todos os arquivos compatíveis", extensions: supportedExtensions },
      { name: "Todos os arquivos", extensions: ["*"] },
      { name: "Textos e letras", extensions: textExtensions },
      { name: "Áudios", extensions: audioExtensions },
      { name: "Imagens", extensions: imageExtensions },
      { name: "Vídeos", extensions: videoExtensions },
    ]);
    if (!paths?.length) return;
    let unsupportedCount = 0;
    for (const filePath of paths) {
      const extension = filePath.split(".").at(-1).toLowerCase();
      if (textExtensions.includes(extension)) {
        const content = await desktop.readTextFile(filePath);
        const parts = content.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
        const title = filePath.split(/[\\/]/).at(-1).replace(/\.[^.]+$/i, "");
        addItem({
          id: id("song"),
          kind: "song",
          title,
          subtitle: `Música · ${parts.length} slide(s)`,
          slides: parts.map((text, index) => ({ id: id("slide"), label: `Parte ${index + 1}`, text })),
        });
        continue;
      }
      const kind = audioExtensions.includes(extension) ? "audio"
        : videoExtensions.includes(extension) ? "video"
          : imageExtensions.includes(extension) ? "image" : null;
      if (!kind) {
        unsupportedCount += 1;
        continue;
      }
      const title = filePath.split(/[\\/]/).at(-1);
      const url = await desktop?.toFileUrl(filePath);
      addItem({
        id: id(kind),
        kind,
        title,
        subtitle: kind === "audio" ? "Áudio local" : kind === "video" ? "Vídeo local" : "Imagem local",
        slides: [{ id: id("slide"), label: title, path: filePath, url }],
      });
    }
    if (unsupportedCount) setToast(`${unsupportedCount} arquivo(s) ignorado(s): formato ainda não suportado`);
  }

  function takeLive() {
    if (!selectedItem) return;
    setLive({ itemId: selectedItem.id, slideIndex: selectedSlide });
    setLiveLayoutId(state.activeLayoutId);
    setTransitionNonce((current) => current + 1);
    setBlackout(false);
    setTimerVisible(false);
    setToast("Conteúdo enviado para projeção");
  }

  function nextLive(direction) {
    if (!liveItem || !live) return;
    const next = Math.max(0, Math.min(liveItem.slides.length - 1, live.slideIndex + direction));
    setLive({ ...live, slideIndex: next });
    setTransitionNonce((current) => current + 1);
    setSelectedItemId(live.itemId);
    setSelectedSlide(next);
  }

  async function openOutput(mode) {
    const displayId = mode === "audience" ? state.settings.audienceDisplayId : state.settings.stageDisplayId;
    const result = await desktop?.openOutput(mode, displayId);
    if (result?.ok === false) {
      const occupiedBy = result.conflictingMode === "audience" ? "Projeção" : "Retorno";
      setToast(`${result.displayLabel} já está sendo usada por ${occupiedBy}`);
      return;
    }
    desktop?.sendOutput(output);
    const label = mode === "audience" ? "Projeção" : "Retorno";
    setToast(result?.operatorPreview
      ? `${label} aberto em janela de teste no Operador`
      : `${label} aberto em tela cheia · ${result?.displayLabel || "tela configurada"}`);
  }

  async function openSettings() {
    const screens = await desktop?.listDisplays?.();
    if (screens?.length) setDisplays(screens);
    setSettingsOpen(true);
  }

  if (!ready) return <main className="loading"><div>LP</div><span>Preparando central de projeção…</span></main>;

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand"><span>LP</span><div><strong>Lyrics Pro</strong><small>Aplicativo Windows</small></div></div>
        <div className="active-program"><ListMusic size={17} /><div><small>PROGRAMAÇÃO ATIVA</small><strong>{activePlaylist?.name}</strong></div></div>
        <div className="top-actions">
          <button className="button ghost" onClick={() => openOutput("stage")}><Monitor size={16} /> Retorno</button>
          <button className="button primary" onClick={() => openOutput("audience")}><MonitorUp size={16} /> Projeção</button>
          <button className="button ghost panel-toggle" onClick={() => setControlPanelOpen((current) => !current)}><PanelRightOpen size={16} /> Painel</button>
          <button className="icon" title="Configurações" onClick={openSettings}><Settings2 /></button>
        </div>
      </header>

      <div className="workspace">
        <nav className="rail">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}><Radio /><span>Ao vivo</span></button>
          <button className={filter === "song" ? "active" : ""} onClick={() => setFilter("song")}><Music2 /><span>Músicas</span></button>
          <button className={filter === "bible" ? "active" : ""} onClick={() => { setFilter("bible"); setBibleOpen(true); }}><BookOpen /><span>Bíblia</span></button>
          <button className={filter === "media" ? "active" : ""} onClick={() => setFilter("media")}><Image /><span>Mídia</span></button>
          <button className={filter === "text" ? "active" : ""} onClick={() => setFilter("text")}><FileText /><span>Textos</span></button>
        </nav>

        <aside className="panel library-panel">
          <header className="panel-title"><div><small>CONTEÚDO</small><h2>Biblioteca</h2></div><button className="icon" title="Criar texto" onClick={() => setTextOpen(true)}><Plus /></button></header>
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
                <div className={`kind ${item.kind}`}>{item.kind === "bible" ? <BookOpen /> : ["song", "audio"].includes(item.kind) ? <Music2 /> : item.kind === "image" ? <Image /> : item.kind === "video" ? <Video /> : <FileText />}</div>
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
            <button className="button ghost" onClick={importFiles}><Upload size={15} /> Importar arquivos</button>
            <button className="button secondary" onClick={() => setBibleOpen(true)}><BookOpen size={15} /> Bíblia</button>
          </footer>
        </aside>

        <aside className="panel playlist-panel">
          <header className="panel-title"><div><small>PROGRAMAÇÃO</small><h2>Ordem do culto</h2></div><div className="panel-actions">
            <button className="icon" title="Renomear programação" onClick={() => setPlaylistDialog({ mode: "edit", id: activePlaylist.id, name: activePlaylist.name })}><Pencil /></button>
            <button className="icon remove-action" title="Excluir programação" disabled={state.playlists.length <= 1} onClick={() => setPlaylistToDelete(activePlaylist)}><Trash2 /></button>
            <button className="icon" title="Criar programação" onClick={() => setPlaylistDialog({ mode: "create", name: "" })}><Plus /></button>
          </div></header>
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
            <article><header><span className="preview-dot" /> PRÉVIA <small>{selectedItem?.title || "Sem seleção"}</small></header><OutputCanvas output={{ ...output, item: selectedItem, slideIndex: selectedSlide, theme, blackout: false, timerVisible: false, alert: "" }} /></article>
            <article><header><span className="live-dot" /> NO AR <small>{liveItem?.title || "Sem conteúdo"}</small></header><OutputCanvas output={output} /></article>
          </div>
          <div className="transport">
            <button onClick={() => nextLive(-1)}><SkipBack /></button>
            <button onClick={() => setSelectedSlide((n) => Math.max(0, n - 1))}><ChevronLeft /></button>
            <button className="take" onClick={takeLive}><Play fill="currentColor" /> EXIBIR AGORA <kbd>ENTER</kbd></button>
            <button onClick={() => setSelectedSlide((n) => Math.min((selectedItem?.slides.length || 1) - 1, n + 1))}><ChevronRight /></button>
            <button onClick={() => nextLive(1)}><SkipForward /></button>
            <button className={blackout ? "danger active" : "danger"} onClick={() => { setBlackout((v) => !v); setTimerVisible(false); }}><Square /> Tela preta</button>
            <button className="danger" onClick={clearLiveOutput}><X /> Limpar</button>
          </div>
          <div className="slides-area">
            <header><div><small>SLIDES</small><h3>{selectedItem?.title || "Selecione um conteúdo"}</h3></div><span>{selectedItem ? selectedSlide + 1 : 0} / {selectedItem?.slides.length || 0}</span></header>
            <div className="slides">
              {selectedItem?.slides.map((slide, index) => (
                <button className={selectedSlide === index ? "selected" : ""} key={slide.id} onClick={() => setSelectedSlide(index)} onDoubleClick={() => { setSelectedSlide(index); setLive({ itemId: selectedItem.id, slideIndex: index }); }}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <div style={{ background: theme.background, color: theme.color }}>{slide.path ? <span>{selectedItem.kind === "audio" ? "ÁUDIO" : selectedItem.kind === "video" ? "VÍDEO" : "IMAGEM"}</span> : <p>{slide.text}</p>}</div>
                  <span>{slide.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {controlPanelOpen && <button className="panel-scrim" aria-label="Fechar painel lateral" onClick={() => setControlPanelOpen(false)} />}
        <aside className={`control-panel ${controlTab === "tools" ? "tools-panel" : ""} ${controlPanelOpen ? "open" : ""}`}>
          <div className="control-tabs">
            <button className={controlTab === "visual" ? "active" : ""} onClick={() => setControlTab("visual")}><Palette /> Visual</button>
            <button className={controlTab === "tools" ? "active" : ""} onClick={() => setControlTab("tools")}><Settings2 /> Ferramentas</button>
            <button className="drawer-close" title="Fechar painel" onClick={() => setControlPanelOpen(false)}><PanelRightClose /></button>
          </div>
          {controlTab === "visual" && <>
          <section className="scene-control">
            <div className="section-heading"><div><small>CENAS</small><h3>{activeScene?.name}</h3></div><div className="mini-actions">
              <button title="Editar cena" onClick={() => setSceneDialog({ mode: "edit", scene: activeScene })}><Pencil /></button>
              <button title="Excluir cena" disabled={scenes.length <= 1} onClick={() => setSceneToDelete(activeScene)}><Trash2 /></button>
              <button title="Criar cena" onClick={() => setSceneDialog({ mode: "create", scene: { layoutId: theme.id, itemId: selectedItemId, obsSceneName: obsCurrentScene } })}><Plus /></button>
            </div></div>
            <select value={activeScene?.id || ""} onChange={(event) => previewScene(event.target.value)}>{scenes.map((scene) => <option value={scene.id} key={scene.id}>{scene.name}</option>)}</select>
            <button className="button primary scene-take" onClick={() => takeSceneLive()}><Play size={14} fill="currentColor" /> Exibir cena</button>
            {obsStatus === "connected" && <label className="obs-scene-select">Cena OBS<select value={obsCurrentScene} onChange={(event) => setObsProgramScene(event.target.value)}>{obsScenes.map((sceneName) => <option value={sceneName} key={sceneName}>{sceneName}</option>)}</select></label>}
            <div className={`obs-sync ${obsStatus}`}><span />{obsStatus === "connected" ? `OBS no ar: ${obsCurrentScene || "—"}` : "OBS desconectado"}</div>
          </section>
          <section>
            <small>LAYOUT ATIVO</small><div className="layout-heading"><h3>{theme.name}</h3><div>
              <button title="Editar layout" onClick={() => setLayoutDialog({ mode: "edit", layout: theme })}><Pencil /></button>
              <button title="Criar layout" onClick={() => setLayoutDialog({ mode: "create", layout: theme })}><Plus /></button>
            </div></div>
            <div className="theme-grid">{layouts.map((item) => (
              <button className={item.id === theme.id ? "selected" : ""} onClick={() => mutate((current) => ({ ...current, activeLayoutId: item.id }))} key={item.id}>
                <i style={{ background: item.background, color: item.color }}>Aa</i><span>{item.name}</span>{item.id === theme.id && <Check />}
              </button>
            ))}</div>
          </section>
          <section className="transition-control">
            <small>TRANSIÇÃO</small>
            <div><label>Tipo<select value={state.transition.type} onChange={(event) => mutate((current) => ({ ...current, transition: { ...current.transition, type: event.target.value } }))}><option value="cut">Corte</option><option value="fade">Fade</option><option value="slide">Deslizar</option><option value="zoom">Zoom</option></select></label>
            <label>Duração (ms)<input type="number" min="0" max="5000" step="50" value={state.transition.duration} onChange={(event) => mutate((current) => ({ ...current, transition: { ...current.transition, duration: Math.max(0, Number(event.target.value) || 0) } }))} /></label></div>
          </section>
          </>}
          {controlTab === "tools" && <>
          <nav className="tool-selector">
            <button className={activeTool === "timer" ? "active" : ""} onClick={() => setActiveTool("timer")}><Clock3 /> Cronômetro</button>
            <button className={activeTool === "louvorja" ? "active" : ""} onClick={() => setActiveTool("louvorja")}><Music2 /> LouvorJA</button>
            <button className={activeTool === "alert" ? "active" : ""} onClick={() => setActiveTool("alert")}><MessageSquareText /> Alerta</button>
          </nav>
          {activeTool === "timer" && <section className="tool-card timer-card">
            <header><Clock3 /><div><strong>Contagem regressiva</strong><span>Controle de tempo da transmissão</span></div><i className={`timer-status ${timerVisible ? "live" : timerRunning ? "running" : ""}`}>{timerVisible ? "NO AR" : timerRunning ? "RODANDO" : timerSeconds === 0 ? "FINALIZADO" : "PRONTO"}</i></header>
            <div className="timer-display">
              <strong>{formatTime(timerSeconds)}</strong>
              <div className="timer-progress"><i style={{ width: `${timerDuration ? Math.max(0, Math.min(100, timerSeconds / timerDuration * 100)) : 0}%` }} /></div>
            </div>
            <div className="timer-presets" aria-label="Durações rápidas">
              {[5, 10, 15, 30].map((minutes) => <button className={timerDuration === minutes * 60 ? "active" : ""} onClick={() => configureTimer(minutes * 60)} disabled={timerRunning} key={minutes}>{minutes} min</button>)}
            </div>
            <div className="timer-editor">
              <label><span>MINUTOS</span><input type="number" min="0" max="999" value={Math.floor(timerDuration / 60)} disabled={timerRunning} onChange={(event) => configureTimer(Math.max(0, Number(event.target.value) || 0) * 60 + timerDuration % 60)} /></label>
              <b>:</b>
              <label><span>SEGUNDOS</span><input type="number" min="0" max="59" value={timerDuration % 60} disabled={timerRunning} onChange={(event) => configureTimer(Math.floor(timerDuration / 60) * 60 + Math.max(0, Math.min(59, Number(event.target.value) || 0)))} /></label>
            </div>
            <div className="timer-actions">
              <button className="button secondary" onClick={toggleTimer} disabled={!timerSeconds && !timerDuration}>{timerRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />} {timerRunning ? "Pausar" : timerSeconds === 0 ? "Recomeçar" : "Iniciar"}</button>
              <button className="button ghost" onClick={resetTimer} disabled={timerSeconds === timerDuration && !timerRunning}><RotateCcw size={15} /> Reiniciar</button>
            </div>
            <button className={`button timer-output-toggle ${timerVisible ? "active" : ""}`} onClick={() => { setTimerVisible((current) => !current); setBlackout(false); }}>{timerVisible ? <EyeOff size={15} /> : <Eye size={15} />} {timerVisible ? "Ocultar das telas" : "Exibir nas telas"}</button>
          </section>}
          {activeTool === "alert" && <section className="tool-card">
            <header><MessageSquareText /><div><strong>Alerta na tela</strong><span>Mensagem sem trocar slide</span></div></header>
            <textarea value={alertDraft} onChange={(e) => setAlertDraft(e.target.value)} placeholder="Digite uma mensagem curta" />
            <div className="tool-actions"><button className="button ghost" onClick={() => { setAlert(""); setAlertDraft(""); }}>Limpar</button><button className="button primary" onClick={() => setAlert(alertDraft.trim())}>Exibir</button></div>
          </section>}
          {activeTool === "louvorja" && <section className="tool-card protected-tool">
            <header>{louvorJaUnlocked ? <ShieldCheck /> : <LockKeyhole />}<div><strong>LouvorJA original</strong><span>Pesquisar e abrir o programa</span></div><i>{louvorJaUnlocked ? "Desbloqueado" : "Protegido"}</i></header>
            {!state.settings.louvorJaPinHash ? (
              <div className="protected-locked"><p>Indique onde está o LouvorJA.exe e crie um PIN administrativo.</p><button className="button secondary" onClick={() => setLouvorJaSetupOpen(true)}><Database size={15} /> Configurar acesso</button></div>
            ) : !louvorJaUnlocked ? (
              <div className="protected-locked"><p>A pesquisa e a abertura do programa original exigem o PIN administrativo.</p><button className="button secondary" onClick={() => setLouvorJaUnlockOpen(true)}><LockKeyhole size={15} /> Desbloquear</button></div>
            ) : (
              <div className="protected-open">
                <div className="louvorja-path"><span>ARQUIVO ORIGINAL</span><strong title={louvorJaInfo?.executablePath || state.settings.louvorJaPath}>{louvorJaInfo?.executablePath || state.settings.louvorJaPath || "Nenhum arquivo selecionado"}</strong></div>
                <div className="louvorja-stats"><span><strong>{louvorJaInfo?.musicCount || 0}</strong> no catálogo</span><span><strong>0</strong> importadas</span></div>
                <button className="button primary open-louvorja" onClick={() => openLouvorJaOriginal()} disabled={louvorJaBusy}><ExternalLink size={14} /> {louvorJaBusy ? "Abrindo…" : "Abrir LouvorJA"}</button>
                <label className="louvorja-search"><Search /><input value={louvorJaSearch} onChange={(event) => setLouvorJaSearch(event.target.value)} placeholder="Pesquisar música ou álbum" /></label>
                <div className="louvorja-results">
                  {louvorJaSearching && <p>Pesquisando no catálogo…</p>}
                  {!louvorJaSearching && louvorJaSearch.trim().length >= 2 && !louvorJaResults.length && !louvorJaError && <p>Nenhuma música encontrada.</p>}
                  {louvorJaResults.map((song) => (
                    <article className="louvorja-result" key={song.id}>
                      <button className="louvorja-song-main" title="Reproduzir versão original" onClick={() => playInLouvorJa(song, 1)} disabled={!song.has_audio || Boolean(louvorJaPlaying)}><div><strong>{song.title}</strong><span>{song.album || "Sem álbum informado"}</span></div><Play /></button>
                      <small className="louvorja-mode-title">ESCOLHA O MODO</small>
                      <div className="louvorja-modes">
                        <button title="Música original com voz" onClick={() => playInLouvorJa(song, 1)} disabled={!song.has_audio || Boolean(louvorJaPlaying)}><Music2 /><span>{louvorJaPlaying === `${song.id}:1` ? "Enviando…" : "Original"}</span></button>
                        <button title="Playback instrumental, sem voz" onClick={() => playInLouvorJa(song, 2)} disabled={!song.has_playback || Boolean(louvorJaPlaying)}><MicOff /><span>{louvorJaPlaying === `${song.id}:2` ? "Enviando…" : "Playback"}</span></button>
                        <button title="Reproduzir apenas o áudio" onClick={() => playInLouvorJa(song, 3)} disabled={!song.has_audio || Boolean(louvorJaPlaying)}><Volume2 /><span>{louvorJaPlaying === `${song.id}:3` ? "Enviando…" : "Só áudio"}</span></button>
                      </div>
                    </article>
                  ))}
                </div>
                {louvorJaError && <p className="settings-error">{louvorJaError}</p>}
                <small>O aplicativo apenas consulta o catálogo e abre o LouvorJA.exe. Nenhuma música é copiada.</small>
                <div className="protected-actions"><button className="button ghost" onClick={changeLouvorJaFolder} disabled={louvorJaBusy}><FolderOpen size={14} /> Alterar arquivo</button></div>
                <button className="lock-again" onClick={() => setLouvorJaUnlocked(false)}>Bloquear novamente</button>
              </div>
            )}
          </section>}
          </>}
        </aside>
      </div>

      <footer className="status app-credit"><span>Desenvolvido por: José Eduardo Boas ©</span></footer>

      {bibleOpen && <BibleDialog onClose={() => setBibleOpen(false)} onCreate={addItem} />}
      {textOpen && <TextDialog onClose={() => setTextOpen(false)} onCreate={addItem} />}
      {playlistDialog && <PlaylistDialog initialName={playlistDialog.name} mode={playlistDialog.mode} onClose={() => setPlaylistDialog(null)} onSave={(name) => {
        if (playlistDialog.mode === "create") {
          const playlist = { id: id("playlist"), name, entries: [] };
          mutate((current) => ({ ...current, playlists: [...current.playlists, playlist], activePlaylistId: playlist.id }));
          setToast("Programação criada");
          return;
        }
        mutate((current) => ({ ...current, playlists: current.playlists.map((playlist) =>
          playlist.id === playlistDialog.id ? { ...playlist, name } : playlist) }));
        setToast("Programação renomeada");
      }} />}
      {playlistToDelete && <ConfirmDialog title="Excluir programação" message={`A programação “${playlistToDelete.name}” e sua ordem serão removidas. Os conteúdos continuarão na biblioteca.`} onClose={() => setPlaylistToDelete(null)} onConfirm={() => {
        mutate((current) => {
          const playlists = current.playlists.filter((playlist) => playlist.id !== playlistToDelete.id);
          return { ...current, playlists, activePlaylistId: playlists[0].id };
        });
        setToast("Programação excluída");
      }} />}
      {layoutDialog && <LayoutDialog initialLayout={layoutDialog.layout} mode={layoutDialog.mode} onClose={() => setLayoutDialog(null)} onSave={(layoutData) => {
        if (layoutDialog.mode === "create") {
          const layout = { id: id("layout"), ...layoutData };
          mutate((current) => ({ ...current, layouts: [...(current.layouts || defaultLayouts), layout], activeLayoutId: layout.id }));
          setToast("Layout criado e ativado");
          return;
        }
        mutate((current) => ({ ...current, layouts: (current.layouts || defaultLayouts).map((layout) =>
          layout.id === layoutDialog.layout.id ? { ...layout, ...layoutData } : layout) }));
        setToast("Layout atualizado");
      }} />}
      {sceneDialog && <SceneDialog initialScene={sceneDialog.scene} layouts={layouts} library={state.library} obsScenes={obsScenes} mode={sceneDialog.mode} onClose={() => setSceneDialog(null)} onSave={(sceneData) => {
        if (sceneDialog.mode === "create") {
          const scene = { id: id("scene"), ...sceneData };
          mutate((current) => ({ ...current, scenes: [...(current.scenes || emptyState.scenes), scene], activeSceneId: scene.id, activeLayoutId: scene.layoutId }));
          setSelectedItemId(scene.itemId || "");
          setSelectedSlide(0);
          setToast("Cena criada");
          return;
        }
        mutate((current) => ({ ...current, scenes: (current.scenes || emptyState.scenes).map((scene) =>
          scene.id === sceneDialog.scene.id ? { ...scene, ...sceneData } : scene), activeLayoutId: sceneData.layoutId }));
        setSelectedItemId(sceneData.itemId || "");
        setSelectedSlide(0);
        setToast("Cena atualizada");
      }} />}
      {sceneToDelete && <ConfirmDialog title="Excluir cena" message={`A cena “${sceneToDelete.name}” será removida. Conteúdos, layouts e cenas do OBS não serão apagados.`} onClose={() => setSceneToDelete(null)} onConfirm={() => {
        mutate((current) => {
          const scenes = current.scenes.filter((scene) => scene.id !== sceneToDelete.id);
          const nextScene = scenes[0];
          return { ...current, scenes, activeSceneId: nextScene.id, activeLayoutId: nextScene.layoutId || current.activeLayoutId };
        });
        setToast("Cena excluída");
      }} />}
      {settingsOpen && (
        <div className="backdrop">
          <section className="dialog settings-dialog">
            <header><div><small>APLICATIVO WINDOWS</small><h2>Configurações</h2></div><button className="icon" onClick={() => setSettingsOpen(false)}><X /></button></header>
            <div className="settings-body">
              <section className="display-settings">
                <header><div><small>DISTRIBUIÇÃO DE TELAS</small><h3>Operador, Projeção e Retorno</h3></div><span>{displays.length} detectada{displays.length === 1 ? "" : "s"}</span></header>
                <div className="display-role-grid">
                  <article><Monitor /><div><span>OPERADOR</span><strong>{operatorDisplay?.label || "Tela principal"}</strong><small>Central de controle</small></div></article>
                  <article><MonitorUp /><div><span>PROJEÇÃO</span><strong>{audienceRoleDisplay?.label || "Janela local"}</strong><small>{audienceRoleDisplay?.operator ? "Janela de teste" : "Apresentação em tela cheia"}</small></div></article>
                  <article><Radio /><div><span>RETORNO</span><strong>{stageRoleDisplay?.label || "Janela local"}</strong><small>{stageRoleDisplay?.operator ? "Janela de teste" : "Palco em tela cheia"}</small></div></article>
                </div>
                <p>No modo automático, o Operador permanece na tela atual, a Projeção usa a primeira tela externa e o Retorno usa a segunda. Sem tela dedicada, a saída abre em uma janela de teste.</p>
                <div className="display-selects">
                  <label>Tela de projeção<select value={state.settings.audienceDisplayId || ""} onChange={(e) => mutate((current) => ({ ...current, settings: { ...current.settings, audienceDisplayId: +e.target.value || null } }))}>
                    <option value="">Automático · {externalDisplays[0]?.label || "janela no Operador"}</option>{displays.map((display) => <option value={display.id} key={display.id}>{display.label}{display.operator ? " · Operador" : display.primary ? " · Principal" : ""} · {display.bounds.width}×{display.bounds.height}</option>)}
                  </select></label>
                  <label>Tela de retorno<select value={state.settings.stageDisplayId || ""} onChange={(e) => mutate((current) => ({ ...current, settings: { ...current.settings, stageDisplayId: +e.target.value || null } }))}>
                    <option value="">Automático · {externalDisplays[1]?.label || "janela no Operador"}</option>{displays.map((display) => <option value={display.id} key={display.id}>{display.label}{display.operator ? " · Operador" : display.primary ? " · Principal" : ""} · {display.bounds.width}×{display.bounds.height}</option>)}
                  </select></label>
                </div>
              </section>
              <label className="safe-background-setting">Fundo de segurança após limpar<input type="color" value={state.settings.safeBackground} onChange={(event) => mutate((current) => ({ ...current, settings: { ...current.settings, safeBackground: event.target.value } }))} /><small>O ESC limpa todas as saídas e fecha as janelas de projeção e retorno.</small></label>
              <div className="safe-background-actions"><button className="button secondary" type="button" onClick={chooseSafeBackgroundImage}><Upload size={15} /> Carregar imagem de fundo</button>{state.settings.safeBackgroundImage && <button className="button ghost" type="button" onClick={() => mutate((current) => ({ ...current, settings: { ...current.settings, safeBackgroundImage: "" } }))}>Remover imagem</button>}</div>
              <section className="obs-settings">
                <header><div><small>INTEGRAÇÃO</small><h3>OBS WebSocket</h3></div><span className={obsStatus}>{obsStatus === "connected" ? "Conectado" : obsStatus === "connecting" ? "Conectando…" : obsStatus === "error" ? "Erro" : "Desconectado"}</span></header>
                <div className="obs-fields">
                  <label>Endereço<input value={state.settings.obsHost} onChange={(event) => mutate((current) => ({ ...current, settings: { ...current.settings, obsHost: event.target.value } }))} placeholder="127.0.0.1" /></label>
                  <label>Porta<input type="number" value={state.settings.obsPort} onChange={(event) => mutate((current) => ({ ...current, settings: { ...current.settings, obsPort: Number(event.target.value) || 4455 } }))} /></label>
                  <label>Senha<input type="password" value={obsPassword} onChange={(event) => setObsPassword(event.target.value)} placeholder="Não será salva" /></label>
                </div>
                {obsError && <p className="settings-error">{obsError}</p>}
                <div className="obs-actions"><button className="button ghost" type="button" onClick={disconnectObs} disabled={obsStatus === "disconnected"}>Desconectar</button><button className="button secondary" type="button" onClick={connectObs} disabled={obsStatus === "connecting"}>Conectar ao OBS</button></div>
              </section>
              <section className="hotkey-settings">
                <header><div><small>OPERAÇÃO</small><h3>Atalhos configuráveis</h3></div></header>
                <p>Clique em um campo e pressione a combinação desejada.</p>
                {[
                  ["takeLive", "Exibir agora"], ["previousSlide", "Slide anterior"], ["nextSlide", "Próximo slide"],
                  ["blackout", "Tela preta"], ["clear", "Limpar saída"], ["nextScene", "Próxima cena"],
                ].map(([action, label]) => <label key={action}>{label}<HotkeyInput value={state.hotkeys[action]} onChange={(shortcut) => mutate((current) => ({ ...current, hotkeys: { ...current.hotkeys, [action]: shortcut } }))} /></label>)}
              </section>
            </div>
            <footer><button className="button primary" onClick={() => setSettingsOpen(false)}>Concluir</button></footer>
          </section>
        </div>
      )}
      {louvorJaSetupOpen && <LouvorJaSetupDialog initialPath={state.settings.louvorJaPath || louvorJaSuggestedPath} onClose={() => setLouvorJaSetupOpen(false)} onSave={configureLouvorJa} />}
      {louvorJaUnlockOpen && <ProtectedAccessDialog pinHash={state.settings.louvorJaPinHash} onClose={() => setLouvorJaUnlockOpen(false)} onUnlock={() => { setLouvorJaUnlocked(true); setLouvorJaUnlockOpen(false); setLouvorJaError(""); }} />}
      {toast && <div className="toast"><Check /> {toast}</div>}
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  location.hash.startsWith("#output=") ? <OutputWindow /> : <App />,
);
