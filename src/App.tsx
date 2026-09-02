import { type CSSProperties, useEffect, useMemo, useState } from 'react';

type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  hint: string;
};

type Coordinates = {
  lat: number;
  lng: number;
};

type MagicToast = {
  id: number;
  text: string;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Quelle est sa boisson réconfort ?',
    options: ['Un café glacé', 'Un chocolat chaud', 'Un thé menthe', 'Un smoothie'],
    answerIndex: 1,
    hint: 'Indice : quelque chose de doux et rassurant.',
  },
  {
    question: 'Quel duo résume le mieux votre soirée idéale ?',
    options: ['Film + plaid', 'Balade + musique', 'Cuisine + fou rire', 'Jeu + câlins'],
    answerIndex: 0,
    hint: 'Le plus cocooning possible.',
  },
  {
    question: 'Quel message lui fait toujours plaisir ?',
    options: ['Tu es forte.', 'Tu m’épates.', 'Je pense à toi.', 'Tu gères tout.'],
    answerIndex: 2,
    hint: 'Simple, court, et plein d’amour.',
  },
];

const MAGIC_MESSAGES = [
  'Pensée envoyée : un petit bisou pour ton cœur.',
  'Mini vague de douceur en approche.',
  'PS : tu rends les jours beaucoup plus jolis.',
  'Un câlin invisible t’attend juste là.',
];

const DEFAULT_REUNION = '2026-09-05T12:23';
const DEFAULT_A: Coordinates = { lat: 50.6372, lng: 3.071 };
const DEFAULT_B: Coordinates = { lat: 45.7640, lng: 4.8357 };

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const integerFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

function readStored(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function toNumber(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { diff, days, hours, minutes, seconds };
}

function haversineDistance(a: Coordinates, b: Coordinates) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

function HeartBurst() {
  return (
    <div className="heart-burst" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <span key={index} style={{ '--i': index } as CSSProperties}>♥</span>
      ))}
    </div>
  );
}

export default function App() {
  const [reunion, setReunion] = useState(() => readStored('bulle.reunion', DEFAULT_REUNION));
  const [placeA, setPlaceA] = useState(() => ({
    lat: readStored('bulle.a.lat', String(DEFAULT_A.lat)),
    lng: readStored('bulle.a.lng', String(DEFAULT_A.lng)),
  }));
  const [placeB, setPlaceB] = useState(() => ({
    lat: readStored('bulle.b.lat', String(DEFAULT_B.lat)),
    lng: readStored('bulle.b.lng', String(DEFAULT_B.lng)),
  }));
  const [now, setNow] = useState(Date.now());
  const [quizAnswers, setQuizAnswers] = useState<Array<number | null>>(Array(QUIZ_QUESTIONS.length).fill(null));
  const [magicToast, setMagicToast] = useState<MagicToast | null>(null);
  const [burst, setBurst] = useState(false);
  const [messageLog, setMessageLog] = useState<string[]>([
    'Bienvenue dans votre petite bulle privée.',
    'Tout est pensé pour vous deux.',
  ]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted',
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('bulle.reunion', reunion);
  }, [reunion]);

  useEffect(() => {
    window.localStorage.setItem('bulle.a.lat', placeA.lat);
    window.localStorage.setItem('bulle.a.lng', placeA.lng);
    window.localStorage.setItem('bulle.b.lat', placeB.lat);
    window.localStorage.setItem('bulle.b.lng', placeB.lng);
  }, [placeA, placeB]);

  useEffect(() => {
    if (!magicToast) return;
    const timeout = window.setTimeout(() => setMagicToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [magicToast]);

  useEffect(() => {
    if (!burst) return;
    const timeout = window.setTimeout(() => setBurst(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [burst]);

  const countdown = useMemo(() => formatCountdown(new Date(reunion)), [now, reunion]);
  const distanceKm = useMemo(
    () => haversineDistance(
      { lat: toNumber(placeA.lat, DEFAULT_A.lat), lng: toNumber(placeA.lng, DEFAULT_A.lng) },
      { lat: toNumber(placeB.lat, DEFAULT_B.lat), lng: toNumber(placeB.lng, DEFAULT_B.lng) },
    ),
    [placeA, placeB],
  );

  const score = quizAnswers.reduce<number>((total, answer, index) => (
    answer === QUIZ_QUESTIONS[index].answerIndex ? total + 1 : total
  ), 0);

  const openMagic = (prefix: string) => {
    const text = MAGIC_MESSAGES[Math.floor(Math.random() * MAGIC_MESSAGES.length)];
    setBurst(true);
    setMagicToast({ id: Date.now(), text });
    setMessageLog((current) => [
      `${prefix} ${text}`,
      ...current,
    ].slice(0, 6));

    if (notificationsEnabled && typeof Notification !== 'undefined') {
      try {
        new Notification('Notre bulle', {
          body: text,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      } catch {
        // Silently ignore notification errors.
      }
    }
  };

  const askNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    if (permission === 'granted') {
      setMessageLog((current) => ['Les notifications sont activées.', ...current].slice(0, 6));
    }
  };

  return (
    <main className="app-shell">
      <div className={`ambient-glow ${burst ? 'active' : ''}`} />
      {burst && <HeartBurst />}

      <section className="hero card">
        <p className="eyebrow">Mini app privée pour deux cœurs</p>
        <h1>Notre bulle</h1>
        <p className="hero-copy">
          Une web app douce, installable sur l’écran d’accueil, pensée pour les quiz, les petites pensées et les retrouvailles.
        </p>

        <div className="hero-grid">
          <div className="stat">
            <span>Retrouvailles</span>
            <strong>{countdown.days} j {countdown.hours} h</strong>
            <small>{countdown.minutes} min {countdown.seconds} s restantes</small>
          </div>
          <div className="stat">
            <span>Distance</span>
            <strong>{numberFormat.format(distanceKm)} km</strong>
            <small>entre vos deux lieux</small>
          </div>
          <div className="stat">
            <span>Quiz</span>
            <strong>{score}/{QUIZ_QUESTIONS.length}</strong>
            <small>petit score du soir</small>
          </div>
        </div>
      </section>

      <section className="card actions">
        <div>
          <p className="eyebrow">Pensée magique</p>
          <h2>Un message court et mignon</h2>
          <p>Le bouton affiche un message doux à l’écran et, si autorisé, envoie aussi une notification navigateur.</p>
        </div>
        <div className="button-row">
          <button className="primary" onClick={() => openMagic('Pensée magique :')}>
            Pensée magique
          </button>
          <button className="secondary" onClick={() => openMagic('Tu me manques :')}>
            Tu me manques
          </button>
          <button className="ghost" onClick={askNotificationPermission}>
            Activer les notifs
          </button>
        </div>
      </section>

      <section className="card quiz-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Quiz personnalisé</p>
            <h2>Testez à quel point elle te connaît</h2>
          </div>
          <div className="score-pill">Score actuel : {score}/{QUIZ_QUESTIONS.length}</div>
        </div>

        <div className="quiz-list">
          {QUIZ_QUESTIONS.map((item, questionIndex) => (
            <article className="quiz-item" key={item.question}>
              <header>
                <h3>{item.question}</h3>
                <p>{item.hint}</p>
              </header>
              <div className="options">
                {item.options.map((option, optionIndex) => {
                  const isActive = quizAnswers[questionIndex] === optionIndex;
                  return (
                    <button
                      key={option}
                      className={isActive ? 'option active' : 'option'}
                      onClick={() => {
                        setQuizAnswers((current) => {
                          const next = [...current];
                          next[questionIndex] = optionIndex;
                          return next;
                        });
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="quiz-footer">
          <button className="ghost" onClick={() => setQuizAnswers(Array(QUIZ_QUESTIONS.length).fill(null))}>
            Réinitialiser le quiz
          </button>
          <p>{score === QUIZ_QUESTIONS.length ? 'Parfait. Elle te connaît par cœur.' : 'Continuez à jouer ensemble.'}</p>
        </div>
      </section>

      <section className="grid-2">
        <article className="card">
          <p className="eyebrow">Décompte en direct</p>
          <h2>Avant votre prochaine retrouvaille</h2>
          <label className="field">
            Date et heure
            <input type="datetime-local" value={reunion} onChange={(event) => setReunion(event.target.value)} />
          </label>
          <div className="countdown-live">
            <span>{countdown.days}</span>
            <span>{countdown.hours}</span>
            <span>{countdown.minutes}</span>
            <span>{countdown.seconds}</span>
          </div>
          <div className="countdown-labels">
            <span>jours</span>
            <span>heures</span>
            <span>minutes</span>
            <span>secondes</span>
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">Widget distance</p>
          <h2>Les kilomètres qui vous séparent</h2>
          <p className="muted">Modifiez les coordonnées ci-dessous pour adapter l’app à vos deux lieux.</p>

          <div className="coordinates-grid">
            <label className="field">
              Lieu A — lat
              <input value={placeA.lat} onChange={(event) => setPlaceA((current) => ({ ...current, lat: event.target.value }))} />
            </label>
            <label className="field">
              Lieu A — lng
              <input value={placeA.lng} onChange={(event) => setPlaceA((current) => ({ ...current, lng: event.target.value }))} />
            </label>
            <label className="field">
              Lieu B — lat
              <input value={placeB.lat} onChange={(event) => setPlaceB((current) => ({ ...current, lat: event.target.value }))} />
            </label>
            <label className="field">
              Lieu B — lng
              <input value={placeB.lng} onChange={(event) => setPlaceB((current) => ({ ...current, lng: event.target.value }))} />
            </label>
          </div>

          <div className="distance-box">
            <strong>{integerFormat.format(distanceKm)} km</strong>
            <span>calculés en direct</span>
          </div>
        </article>
      </section>

      <section className="card messages-card">
        <p className="eyebrow">Mur de douceur</p>
        <h2>Les derniers petits mots</h2>
        <div className="message-list">
          {messageLog.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      </section>

      {magicToast ? (
        <aside className="magic-toast" role="status" aria-live="polite">
          <span>Pensée magique</span>
          <strong>{magicToast.text}</strong>
        </aside>
      ) : null}
    </main>
  );
}
