"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { symptomContent, findTopic } from "../../lib/symptoms/content";
import {
  fitCamera,
  zoomAt,
  easeInOutQuad,
  topicPoint,
  topicBounds,
  topicArms,
  summaryText,
  toggleTopic,
  toggleFeature,
  GROUP_POSITIONS,
  OVERVIEW,
  GROUP_WIDTH,
  type Specialty,
  type Camera,
  type Point,
  type Selection,
  type Topic,
} from "../../lib/symptoms/model";
const emptySize = { width: 1000, height: 660 };
export default function SymptomMap({ specialty }: { specialty: Specialty }) {
  const content = symptomContent[specialty],
    uid = useId();
  const [camera, setCamera] = useState<Camera>(() =>
    fitCamera(OVERVIEW, emptySize),
  );
  const [size, setSize] = useState(emptySize),
    [active, setActive] = useState<string | null>(null),
    [expanded, setExpanded] = useState(false),
    [view, setView] = useState<"map" | "list">("map"),
    [selection, setSelection] = useState<Selection>({}),
    [status, setStatus] = useState("");
  const viewport = useRef<HTMLDivElement>(null),
    cam = useRef(camera),
    dimensions = useRef(size),
    activeRef = useRef<string | null>(null),
    animation = useRef(0),
    expansion = useRef<ReturnType<typeof setTimeout> | null>(null),
    reduced = useRef(false),
    lastActivity = useRef(Date.now()),
    points = useRef(new Map<number, Point>());
  const activeTopic = active ? findTopic(content, active) : undefined;
  const positionFor = (topic: Topic) =>
    topicPoint(
      topic.group,
      content.groups[topic.group].topics.findIndex((t) => t.id === topic.id),
    );
  const activePoint = activeTopic ? positionFor(activeTopic) : undefined;
  const put = useCallback((next: Camera) => {
    cam.current = next;
    setCamera(next);
  }, []);
  const animate = useCallback(
    (target: Camera, duration = 680) => {
      cancelAnimationFrame(animation.current);
      if (reduced.current || !duration) {
        put(target);
        return;
      }
      const start = cam.current,
        started = performance.now();
      function frame(time: number) {
        const t = Math.min(1, (time - started) / duration),
          e = easeInOutQuad(t);
        put({
          x: start.x + (target.x - start.x) * e,
          y: start.y + (target.y - start.y) * e,
          scale: start.scale + (target.scale - start.scale) * e,
        });
        if (t < 1) animation.current = requestAnimationFrame(frame);
      }
      animation.current = requestAnimationFrame(frame);
    },
    [put],
  );
  function cancelMotion() {
    cancelAnimationFrame(animation.current);
    if (expansion.current) clearTimeout(expansion.current);
    setExpanded(true);
  }
  function overview() {
    cancelMotion();
    activeRef.current = null;
    setActive(null);
    setExpanded(false);
    animate(fitCamera(OVERVIEW, dimensions.current));
  }
  function openTopic(topic: Topic) {
    cancelMotion();
    lastActivity.current = Date.now();
    activeRef.current = topic.id;
    setActive(topic.id);
    setExpanded(false);
    const point = positionFor(topic),
      box = dimensions.current;
    if (view === "list") {
      setExpanded(true);
      return;
    }
    if (reduced.current) {
      setExpanded(true);
      animate(fitCamera(topicBounds(point), box), 0);
      return;
    }
    const focusScale = Math.min(1.05, box.width / 340);
    animate(
      {
        scale: focusScale,
        x: box.width / 2 - point.x * focusScale,
        y: box.height / 2 - point.y * focusScale,
      },
      200,
    );
    expansion.current = setTimeout(() => {
      setExpanded(true);
      animate(fitCamera(topicBounds(point), dimensions.current));
    }, 210);
  }
  function zoom(
    factor: number,
    anchor = {
      x: dimensions.current.width / 2,
      y: dimensions.current.height / 2,
    },
  ) {
    cancelMotion();
    animate(zoomAt(cam.current, anchor, cam.current.scale * factor), 180);
  }
  function clear(ask = true) {
    if (
      ask &&
      Object.keys(selection).length &&
      !window.confirm(
        "Wyczyścić wybrane tematy, cechy i notatki z tego ekranu?",
      )
    )
      return;
    setSelection({});
    setStatus("Wybory i notatki wyczyszczono.");
    overview();
  }
  useEffect(() => {
    cancelAnimationFrame(animation.current);
    if (expansion.current) clearTimeout(expansion.current);
    setExpanded(!!activeRef.current);
    if (view !== "map") return;
    const rect = viewport.current?.getBoundingClientRect();
    if (!rect || rect.width < 1 || rect.height < 1) return;
    const box = { width: rect.width, height: rect.height };
    dimensions.current = box;
    setSize(box);
    const topic = activeRef.current
      ? findTopic(content, activeRef.current)
      : undefined;
    put(fitCamera(topic ? topicBounds(positionFor(topic)) : OVERVIEW, box));
    // Specialty is fixed by the parent's component key.
  }, [view, put]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = media.matches;
    const change = () => {
      reduced.current = media.matches;
      if (media.matches) {
        cancelAnimationFrame(animation.current);
        if (expansion.current) clearTimeout(expansion.current);
        setExpanded(!!activeRef.current);
        const topic = activeRef.current
          ? findTopic(content, activeRef.current)
          : undefined;
        put(
          fitCamera(
            topic ? topicBounds(positionFor(topic)) : OVERVIEW,
            dimensions.current,
          ),
        );
      }
    };
    media.addEventListener("change", change);
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(animation.current);
      if (expansion.current) clearTimeout(expansion.current);
      setExpanded(!!activeRef.current);
      const rect = entries[0].contentRect,
        box = { width: rect.width, height: rect.height };
      if (box.width < 1 || box.height < 1) return;
      dimensions.current = box;
      setSize(box);
      const topic = activeRef.current
        ? findTopic(content, activeRef.current)
        : undefined;
      put(fitCamera(topic ? topicBounds(positionFor(topic)) : OVERVIEW, box));
    });
    observer.observe(element);
    const activity = () => {
      lastActivity.current = Date.now();
    };
    ["pointerdown", "keydown", "input", "wheel"].forEach((event) =>
      element.closest(".symptom-app")?.addEventListener(event, activity),
    );
    const interval = setInterval(() => {
      if (Date.now() - lastActivity.current > 5 * 60000) {
        setSelection({});
        setActive(null);
        activeRef.current = null;
        setStatus("Wybory wyczyszczono po 5 minutach bezczynności.");
        cancelAnimationFrame(animation.current);
        if (expansion.current) clearTimeout(expansion.current);
        put(fitCamera(OVERVIEW, dimensions.current));
        lastActivity.current = Date.now();
      }
    }, 10000);
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", restored);
    const hide = () => {
      setSelection({});
    };
    window.addEventListener("pagehide", hide);
    function wheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = element!.getBoundingClientRect();
      cancelMotion();
      put(
        zoomAt(
          cam.current,
          { x: event.clientX - rect.left, y: event.clientY - rect.top },
          cam.current.scale * Math.exp(-event.deltaY * 0.003),
        ),
      );
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      media.removeEventListener("change", change);
      clearInterval(interval);
      cancelAnimationFrame(animation.current);
      if (expansion.current) clearTimeout(expansion.current);
      element.removeEventListener("wheel", wheel);
      ["pointerdown", "keydown", "input", "wheel"].forEach((event) =>
        element.closest(".symptom-app")?.removeEventListener(event, activity),
      );
      window.removeEventListener("pageshow", restored);
      window.removeEventListener("pagehide", hide);
    };
    // The parent keys the component by specialty; no state crosses specialties.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [put]);
  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button,a,input,select,textarea"))
      return;
    cancelMotion();
    event.currentTarget.setPointerCapture(event.pointerId);
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
  }
  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!points.current.has(event.pointerId)) return;
    const before = [...points.current.values()];
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = [...points.current.values()];
    let next = cam.current;
    if (before.length === 1) {
      next = {
        ...next,
        x: next.x + after[0].x - before[0].x,
        y: next.y + after[0].y - before[0].y,
      };
    } else if (before.length === 2) {
      const middle = (p: Point[]) => ({
          x: (p[0].x + p[1].x) / 2,
          y: (p[0].y + p[1].y) / 2,
        }),
        distance = (p: Point[]) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y),
        old = middle(before),
        now = middle(after),
        rect = event.currentTarget.getBoundingClientRect();
      next = zoomAt(
        next,
        { x: old.x - rect.left, y: old.y - rect.top },
        (next.scale * distance(after)) / Math.max(1, distance(before)),
      );
      next = { ...next, x: next.x + now.x - old.x, y: next.y + now.y - old.y };
    }
    put(next);
  }
  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    points.current.delete(event.pointerId);
  }
  function keyboard(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const directions: Record<string, Point> = {
      ArrowLeft: { x: 80, y: 0 },
      ArrowRight: { x: -80, y: 0 },
      ArrowUp: { x: 0, y: 80 },
      ArrowDown: { x: 0, y: -80 },
    };
    if (directions[event.key]) {
      event.preventDefault();
      cancelMotion();
      const d = directions[event.key];
      put({ ...cam.current, x: cam.current.x + d.x, y: cam.current.y + d.y });
    } else if (["+", "=", "-", "Home", "Escape"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "Home" || event.key === "Escape") overview();
      else zoom(event.key === "-" ? 1 / 1.3 : 1.3);
    }
  }
  function add(topic: Topic) {
    setSelection((previous) => toggleTopic(previous, topic.id));
    setStatus("Zmieniono wspólny obraz wybranych tematów.");
  }
  function download() {
    const blob = new Blob([summaryText(content, selection)], {
        type: "text/plain;charset=utf-8",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "bm-clinic-moje-objawy.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      "Podsumowanie pobrano na Twoje urządzenie. Niczego nie wysłano do kliniki.",
    );
  }
  const chosen = content.groups
    .flatMap((g) => g.topics)
    .filter((t) => selection[t.id]);
  return (
    <section
      className="symptom-app"
      data-specialty={specialty}
      aria-labelledby={uid + "-title"}
    >
      <header className="symptom-intro">
        <p className="symptom-eyebrow">BM CLINIC · MAPA DO ROZMOWY</p>
        <h2 id={uid + "-title"}>Co Cię niepokoi?</h2>
        <p>{content.lead}</p>
        <p className="symptom-explainer">
          Otwórz temat, żeby zobaczyć cztery perspektywy. Zaznacz „Dotyczy
          mnie”, by połączyć kilka tematów w swoim podsumowaniu. Linie
          porządkują mapę — nie wskazują rozpoznania ani przyczyny.
        </p>
      </header>
      <aside className="symptom-safety">
        <h3>Kiedy nie czekać na konsultację?</h3>
        {content.emergency.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </aside>
      <div className="symptom-toolbar">
        <div role="group" aria-label="Sposób przeglądania">
          <button
            type="button"
            aria-pressed={view === "map"}
            onClick={() => setView("map")}
          >
            Mapa
          </button>
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            Czytelna lista
          </button>
        </div>
        <span>
          {chosen.length
            ? `Wybrane tematy: ${chosen.length}`
            : "Możesz wybrać więcej niż jeden temat"}
        </span>
      </div>
      <div className="symptom-map-container" hidden={view !== "map"}>
        <div
          className="symptom-map-controls"
          role="group"
          aria-label="Sterowanie mapą"
        >
          <button
            type="button"
            onClick={() => zoom(1.3)}
            aria-label="Przybliż mapę"
          >
            ＋
          </button>
          <button
            type="button"
            onClick={() => zoom(1 / 1.3)}
            aria-label="Oddal mapę"
          >
            −
          </button>
          <button type="button" onClick={overview}>
            Cała mapa
          </button>
          {activePoint && (
            <button
              type="button"
              onClick={() => {
                cancelMotion();
                animate(
                  fitCamera(topicBounds(activePoint), dimensions.current),
                );
              }}
            >
              Cały temat
            </button>
          )}
          <output aria-label="Powiększenie">
            {Math.round(camera.scale * 100)}%
          </output>
        </div>
        <div
          ref={viewport}
          className="symptom-viewport"
          tabIndex={0}
          role="region"
          aria-label="Przesuwana mapa objawów. Strzałki przesuwają, plus i minus zmieniają skalę, Home przywraca całość."
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          onLostPointerCapture={pointerUp}
          onKeyDown={keyboard}
        >
          <div
            className="symptom-world"
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
            }}
          >
            <div
              className={"symptom-overview" + (active ? " is-dimmed" : "")}
              inert={!!active}
            >
              <svg
                className="symptom-overview-lines"
                width="1450"
                height="960"
                aria-hidden="true"
              >
                {GROUP_POSITIONS.map((p, i) => (
                  <path
                    key={i}
                    d={`M 725 840 Q ${p.x + 185} 840 ${p.x + 185} ${p.y + 480}`}
                    className={
                      content.groups[i].topics.some((t) => selection[t.id])
                        ? "is-chosen"
                        : ""
                    }
                  />
                ))}
              </svg>
              {content.groups.map((group, i) => (
                <section
                  key={group.title}
                  className="symptom-map-group"
                  style={{
                    left: GROUP_POSITIONS[i].x,
                    top: GROUP_POSITIONS[i].y,
                    width: GROUP_WIDTH,
                  }}
                >
                  <span className="symptom-group-number">0{i + 1}</span>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                  <div>
                    {group.topics.map((topic) => (
                      <div
                        className={
                          "symptom-map-row" +
                          (selection[topic.id] ? " is-chosen" : "")
                        }
                        key={topic.id}
                      >
                        <button
                          type="button"
                          aria-label={"Otwórz temat: " + topic.label}
                          aria-controls={uid + "-reading"}
                          onClick={() => openTopic(topic)}
                        >
                          {topic.label}
                          <span aria-hidden="true">↗</span>
                        </button>
                        <input
                          type="checkbox"
                          checked={!!selection[topic.id]}
                          aria-label={"Dotyczy mnie: " + topic.label}
                          onChange={() => add(topic)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              <div className="symptom-hub">
                <span>WSPÓLNY OBRAZ</span>
                <strong>
                  {chosen.length
                    ? `${chosen.length} wybranych tematów`
                    : "Twoje objawy w kontekście"}
                </strong>
                <p>
                  {chosen.length
                    ? "Zaznaczenia pokazują, co współwystępuje u Ciebie."
                    : "Otwórz temat lub zaznacz kilka pozycji."}
                </p>
              </div>
            </div>
            {activeTopic && activePoint && (
              <div
                className={
                  "symptom-constellation" + (expanded ? " is-expanded" : "")
                }
              >
                <svg
                  className="symptom-detail-lines"
                  style={{
                    left: activePoint.x - 650,
                    top: activePoint.y - 480,
                  }}
                  width="1300"
                  height="960"
                  aria-hidden="true"
                >
                  <path d="M650 480 L220 480 M650 480 L1080 480 M650 480 L650 160 M650 480 L650 800" />
                </svg>
                <div
                  className="symptom-center"
                  style={{ left: activePoint.x - 140, top: activePoint.y - 80 }}
                >
                  <span>WYBRANY TEMAT</span>
                  <h3>{activeTopic.label}</h3>
                  <button
                    type="button"
                    aria-pressed={!!selection[activeTopic.id]}
                    onClick={() => add(activeTopic)}
                  >
                    {selection[activeTopic.id]
                      ? "✓ Dotyczy mnie"
                      : "＋ Dotyczy mnie"}
                  </button>
                </div>
                {topicArms(activeTopic).map((arm, index) => {
                  const offsets = [
                    [-440, 0],
                    [0, -320],
                    [440, 0],
                    [0, 320],
                  ];
                  return (
                    <div
                      key={arm.title}
                      className="symptom-arm"
                      aria-hidden="true"
                      style={{
                        left: activePoint.x - 175,
                        top: activePoint.y - 125,
                        transform: expanded
                          ? `translate(${offsets[index][0]}px, ${offsets[index][1]}px) scale(1)`
                          : "translate(0, 0) scale(.1)",
                        opacity: expanded ? 1 : 0,
                      }}
                    >
                      <span>0{index + 1}</span>
                      <h3>{arm.title}</h3>
                      <p>{arm.text}</p>
                      {arm.prompts.length > 0 && (
                        <div className="symptom-arm-tags">
                          {arm.prompts.slice(0, 4).map((p) => (
                            <span key={p}>{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          className="symptom-minimap"
          aria-label="Miniatura mapy — wróć do całości"
          onClick={overview}
        >
          <svg viewBox="0 0 1450 960" aria-hidden="true">
            {GROUP_POSITIONS.map((p, i) => (
              <rect
                key={i}
                x={p.x}
                y={p.y}
                width="370"
                height="500"
                className={
                  content.groups[i].topics.some((t) => selection[t.id])
                    ? "is-chosen"
                    : ""
                }
              />
            ))}
            <circle cx="725" cy="840" r="55" />
            <rect
              className="symptom-camera-rect"
              x={-camera.x / camera.scale}
              y={-camera.y / camera.scale}
              width={size.width / camera.scale}
              height={size.height / camera.scale}
            />
          </svg>
          <span>Całość ↖</span>
        </button>
        <p className="symptom-map-help">
          Przeciągnij tło, użyj przycisków ＋/− lub dwóch palców. Na komputerze:
          Ctrl/⌘ + kółko myszy. Możesz też wybrać czytelną listę.
        </p>
      </div>
      <div className="symptom-topic-jump">
        <label htmlFor={uid + "-topic"}>
          Otwórz temat bez przesuwania mapy
        </label>
        <select
          id={uid + "-topic"}
          value={active ?? ""}
          onChange={(e) => {
            const t = findTopic(content, e.target.value);
            if (t) openTopic(t);
            else overview();
          }}
        >
          <option value="">Całość / wybierz temat</option>
          {content.groups.map((g) => (
            <optgroup key={g.title} label={g.title}>
              {g.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {view === "list" && (
        <div className="symptom-reading-groups">
          {content.groups.map((g) => (
            <section key={g.title}>
              <h3>{g.title}</h3>
              <p>{g.description}</p>
              {g.topics.map((t) => (
                <div className="symptom-list-row" key={t.id}>
                  <button
                    type="button"
                    aria-expanded={active === t.id}
                    aria-controls={uid + "-reading"}
                    onClick={() => openTopic(t)}
                  >
                    {t.label} ↗
                  </button>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!selection[t.id]}
                      onChange={() => add(t)}
                    />{" "}
                    Dotyczy mnie
                  </label>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
      {activeTopic && (
        <section
          className="symptom-reading"
          id={uid + "-reading"}
          aria-labelledby={uid + "-active"}
        >
          <div className="symptom-reading-title">
            <div>
              <p className="symptom-eyebrow">
                WYBRANY TEMAT · CZYTELNE OBJAŚNIENIA
              </p>
              <h3 id={uid + "-active"}>{activeTopic.label}</h3>
            </div>
            <button
              type="button"
              aria-pressed={!!selection[activeTopic.id]}
              onClick={() => add(activeTopic)}
            >
              {selection[activeTopic.id]
                ? "✓ Dotyczy mnie"
                : "＋ Dodaj do mojego obrazu"}
            </button>
          </div>
          <div className="symptom-reading-arms">
            {topicArms(activeTopic).map((arm, index) => (
              <section key={arm.title}>
                <span className="symptom-eyebrow">0{index + 1}</span>
                <h4>{arm.title}</h4>
                <p>{arm.text}</p>
                {arm.prompts.length > 0 && (
                  <div
                    className="symptom-feature-buttons"
                    role="group"
                    aria-label={arm.title}
                  >
                    {arm.prompts.map((feature) => (
                      <button
                        type="button"
                        key={feature}
                        aria-pressed={
                          !!selection[activeTopic.id]?.features.includes(
                            feature,
                          )
                        }
                        onClick={() =>
                          setSelection((previous) =>
                            toggleFeature(previous, activeTopic.id, feature),
                          )
                        }
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
          <p className="symptom-private-note">
            Wybranie cechy dodaje temat do podsumowania. Nie ma tu automatycznej
            diagnozy.
          </p>
          <label className="symptom-note-label">
            Moja notatka do tego tematu (opcjonalnie)
            <textarea
              maxLength={1000}
              rows={3}
              autoComplete="off"
              value={selection[activeTopic.id]?.note ?? ""}
              onChange={(e) => {
                const note = e.target.value;
                setSelection((previous) => ({
                  ...previous,
                  [activeTopic.id]: {
                    features: previous[activeTopic.id]?.features ?? [],
                    note,
                  },
                }));
              }}
            />
          </label>
          <button type="button" onClick={overview}>
            ← Wróć do wspólnej mapy
          </button>
        </section>
      )}
      <section className="symptom-summary" aria-labelledby={uid + "-summary"}>
        <p className="symptom-eyebrow">
          WSPÓŁWYSTĘPOWANIE · BEZ ZGADYWANIA ROZPOZNANIA
        </p>
        <h3 id={uid + "-summary"}>Mój obraz objawów</h3>
        <p>
          Zbierz to, co występuje u Ciebie. Zaznaczenia nie oznaczają, że objawy
          mają jedną przyczynę.
        </p>
        {chosen.length ? (
          <ul>
            {chosen.map((t) => (
              <li key={t.id}>
                <div>
                  <button type="button" onClick={() => openTopic(t)}>
                    {t.label} ↗
                  </button>
                  <button
                    type="button"
                    className="symptom-remove"
                    aria-label={"Usuń z podsumowania: " + t.label}
                    onClick={() => add(t)}
                  >
                    Usuń
                  </button>
                </div>
                {selection[t.id].features.length > 0 && (
                  <p>{selection[t.id].features.join(" · ")}</p>
                )}
                {selection[t.id].note && (
                  <p className="symptom-summary-note">{selection[t.id].note}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="symptom-summary-empty">
            Jeszcze nic nie zaznaczono. Możesz najpierw spokojnie obejrzeć mapę.
          </p>
        )}
        <div className="symptom-summary-actions">
          <button type="button" disabled={!chosen.length} onClick={download}>
            Pobierz moje podsumowanie (.txt)
          </button>
          <button type="button" onClick={() => clear()}>
            Wyczyść wybory i notatki
          </button>
        </div>
        <p className="symptom-private-note">
          Wybory są tylko na tym ekranie. Nie wysyłamy ich do kliniki ani do
          statystyk. Odświeżenie, opuszczenie strony lub 5 minut bezczynności
          usuwa wybory. Pobrany plik pozostaje na Twoim urządzeniu.
        </p>
        <p role="status">{status}</p>
      </section>
      <details className="symptom-sources">
        <summary>O mapie i źródłach informacji</summary>
        <p>
          Mapa pomaga nazwać i uporządkować dolegliwości przed konsultacją. Nie
          zastępuje wywiadu, badania, kwalifikacji ani zaleceń lekarza. Treść
          przygotowana do weryfikacji w klinice.
        </p>
        <ul>
          {content.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
