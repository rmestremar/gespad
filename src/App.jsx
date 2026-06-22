import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Home, Circle } from 'lucide-react';

const COLORS = {
  primary: '#005baa',
  primaryDark: '#003d7a',
  primaryLight: '#e8f1fb',
  accent: '#00a651',
  accentLight: '#e6f7ef',
  text: '#1a1a2e',
  textMuted: '#5a6a7a',
  white: '#ffffff',
  border: '#d0dcea',
  badgeBg: '#f0f4fa',
  tagBlue: '#dbeafe',
  tagGreen: '#d1fae5',
};

const slides = [
  { id: 'portada', type: 'cover' },
  { id: 'intro', type: 'intro' },
  { id: 'func1', type: 'feature', index: 0 },
  { id: 'func2', type: 'feature', index: 1 },
  { id: 'func3', type: 'feature', index: 2 },
  { id: 'func4', type: 'feature', index: 3 },
  { id: 'func5', type: 'feature', index: 4 },
  { id: 'cierre', type: 'closing' },
];

const features = [
  {
    number: '01',
    title: 'Identificación de habitantes bajo expediente de baja',
    tag: 'Control y seguimiento',
    tagColor: 'blue',
    body: [
      'Se incorpora una funcionalidad para identificar a los habitantes en proceso de baja, como primer paso para su control en la futura generación de certificados.',
    ],
    details: [
      {
        icon: '●',
        label: 'Marca directa en la ficha',
        text: 'Indicador específico en la ficha del habitante.',
      },
      {
        icon: '●',
        label: 'Via procedimiento',
        text: 'El habitante está incluido en un procedimiento con actividad "Padrón de habitantes (baja)".',
      },
    ],
    note: 'Basta con que se cumpla uno de los dos mecanismos para que el habitante quede identificado con ese estado.',
  },
  {
    number: '02',
    title: 'Modificación de datos adicionales sin generar movimiento',
    tag: 'Operativa',
    tagColor: 'green',
    body: [
      'Nueva acción que permite modificar determinados datos adicionales del habitante sin crear un movimiento de modificación de datos personales.',
    ],
    details: [
      {
        icon: '◆',
        label: 'Campos incluidos',
        text: 'Autoriza · Habitante bajo expediente de baja · Observaciones',
      },
    ],
    note: 'Evita movimientos innecesarios en el historial del habitante al actualizar información auxiliar.',
  },
  {
    number: '03',
    title: 'Recuperación de hoja padronal antigua',
    tag: 'Certificados',
    tagColor: 'blue',
    body: [
      'Primer paso para permitir la obtención de certificados a partir de una hoja padronal antigua, especialmente cuando existían varias hojas padronales por vivienda de forma indebida.',
    ],
    details: [
      {
        icon: '▶',
        label: 'En esta versión',
        text: 'El dato NHOP que figuraba en observaciones para habitantes migrados se traslada al nuevo campo "Hoja Padronal Antigua".',
      },
      {
        icon: '▶',
        label: 'Versión posterior',
        text: 'Se prevé emitir certificados indicando directamente ese número de hoja padronal.',
      },
    ],
    note: null,
  },
  {
    number: '04',
    title: 'Modificación de extremos de un tramo de numeración',
    tag: 'Datos territoriales',
    tagColor: 'green',
    body: [
      'Acción específica para modificar el extremo inferior y/o superior de un tramo de numeración sin provocar un movimiento de modificación de datos territoriales sobre los habitantes empadronados.',
    ],
    details: [
      {
        icon: '◆',
        label: 'Beneficio clave',
        text: 'Los cambios en tramos de numeración ya no generan movimientos innecesarios sobre los habitantes afectados.',
      },
    ],
    note: null,
  },
  {
    number: '05',
    title: 'Mejora de usabilidad en gestión de errores INE',
    tag: 'INE / Usabilidad',
    tagColor: 'blue',
    body: [
      'Se mejora la usabilidad del módulo de gestión de errores mediante un código de colores que permite identificar visualmente el estado de cada error de forma más rápida e intuitiva.',
    ],
    details: [
      {
        icon: '●',
        label: 'Código de colores',
        text: 'Identificación visual inmediata del estado de cada error INE.',
      },
      {
        icon: '●',
        label: 'Objetivo',
        text: 'Reducir el tiempo de revisión y mejorar la detección de incidencias pendientes.',
      },
    ],
    note: null,
  },
];

// ─── Layout wrapper ──────────────────────────────────────────────────────────

const SlideLayout = ({ children, footer = true, current, total }) => (
  <div
    style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: COLORS.white,
      overflow: 'hidden',
    }}
  >
    <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    {footer && (
      <div
        style={{
          background: COLORS.primaryDark,
          color: 'rgba(255,255,255,0.55)',
          fontSize: '11px',
          padding: '8px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <span>Novedades Padrón de Habitantes · v10.0.3.38.0</span>
        <span>
          {current} / {total}
        </span>
      </div>
    )}
  </div>
);

// ─── Top bar shared component ─────────────────────────────────────────────────

const TopBar = ({ label }) => (
  <div
    style={{
      background: COLORS.primary,
      padding: '0 40px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <span
      style={{
        color: COLORS.white,
        fontWeight: 700,
        fontSize: '15px',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      Gestiona
    </span>
    {label && (
      <span
        style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    )}
  </div>
);

// ─── Slide: Portada ───────────────────────────────────────────────────────────

const SlideCover = ({ current, total }) => (
  <SlideLayout footer={false} current={current} total={total}>
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 60%, #0077cc 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          right: '-80px',
          top: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '60px',
          bottom: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '-40px',
          bottom: '80px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(0,166,81,0.18)',
        }}
      />

      {/* Logo bar */}
      <div
        style={{
          padding: '24px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            background: COLORS.accent,
            width: '8px',
            height: '36px',
            borderRadius: '4px',
          }}
        />
        <span
          style={{
            color: COLORS.white,
            fontWeight: 800,
            fontSize: '22px',
            letterSpacing: '0.04em',
          }}
        >
          Gestiona
        </span>
        <span
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '13px',
            marginLeft: '4px',
            paddingTop: '4px',
          }}
        >
          · Padrón de Habitantes
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 64px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '4px 16px',
            marginBottom: '28px',
            width: 'fit-content',
          }}
        >
          <span style={{ color: COLORS.accent, marginRight: '8px', fontSize: '10px' }}>●</span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Seminario · Junio 2026
          </span>
        </div>

        <h1
          style={{
            color: COLORS.white,
            fontSize: '46px',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
            marginBottom: '16px',
            maxWidth: '720px',
          }}
        >
          Novedades de Padrón de Habitantes
        </h1>

        <div
          style={{
            width: '60px',
            height: '4px',
            background: COLORS.accent,
            borderRadius: '2px',
            marginBottom: '24px',
          }}
        />

        <p
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: '18px',
            fontWeight: 400,
            maxWidth: '600px',
            lineHeight: 1.5,
            margin: 0,
            marginBottom: '40px',
          }}
        >
          Resumen funcional de mejoras e incidencias corregidas incluidas en la versión de junio de 2026.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(0,166,81,0.2)',
            border: '1px solid rgba(0,166,81,0.4)',
            borderRadius: '8px',
            padding: '8px 20px',
            width: 'fit-content',
          }}
        >
          <span style={{ color: COLORS.accent, fontSize: '13px', fontWeight: 600, letterSpacing: '0.03em' }}>
            Versión 10.0.3.38.0
          </span>
        </div>
      </div>

      {/* Bottom indicator */}
      <div
        style={{
          padding: '20px 48px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
          {current} / {total} · Usa las flechas para navegar
        </span>
      </div>
    </div>
  </SlideLayout>
);

// ─── Slide: Introducción ──────────────────────────────────────────────────────

const SlideIntro = ({ current, total }) => (
  <SlideLayout current={current} total={total}>
    <TopBar label="Introducción" />
    <div
      style={{
        padding: '44px 56px',
        height: 'calc(100vh - 52px - 36px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '36px',
              background: COLORS.accent,
              borderRadius: '3px',
              flexShrink: 0,
            }}
          />
          <h2
            style={{
              color: COLORS.primary,
              fontSize: '30px',
              fontWeight: 700,
              margin: 0,
            }}
          >
            Introducción
          </h2>
        </div>

        <p
          style={{
            color: COLORS.text,
            fontSize: '17px',
            lineHeight: 1.75,
            maxWidth: '820px',
            margin: '0 0 40px 0',
            padding: '20px 24px',
            background: COLORS.primaryLight,
            borderLeft: `4px solid ${COLORS.primary}`,
            borderRadius: '0 8px 8px 0',
          }}
        >
          Esta versión incorpora mejoras orientadas a reforzar la gestión de habitantes, facilitar
          determinadas operaciones sin generar movimientos innecesarios, preparar funcionalidades
          relacionadas con certificados y mejorar la usabilidad y resolución de incidencias en la
          integración con INE.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
          }}
        >
          {features.map((f) => (
            <div
              key={f.number}
              style={{
                background: COLORS.badgeBg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: COLORS.primary,
                  opacity: 0.6,
                }}
              >
                {f.number}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: COLORS.text,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {f.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          paddingTop: '16px',
          color: COLORS.textMuted,
          fontSize: '12px',
        }}
      >
        5 nuevas funcionalidades · Versión 10.0.3.38.0 · Junio 2026
      </div>
    </div>
  </SlideLayout>
);

// ─── Slide: Feature ───────────────────────────────────────────────────────────

const Tag = ({ label, color }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      background: color === 'green' ? COLORS.tagGreen : COLORS.tagBlue,
      color: color === 'green' ? '#065f46' : '#1e40af',
    }}
  >
    {label}
  </span>
);

const SlideFeature = ({ feature, current, total }) => (
  <SlideLayout current={current} total={total}>
    <TopBar label={`Funcionalidad ${feature.number}`} />
    <div
      style={{
        padding: '36px 56px',
        height: 'calc(100vh - 52px - 36px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        <div
          style={{
            background: COLORS.primaryDark,
            color: COLORS.white,
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {feature.number}
        </div>
        <div>
          <Tag label={feature.tag} color={feature.tagColor} />
          <h2
            style={{
              color: COLORS.primary,
              fontSize: '26px',
              fontWeight: 700,
              margin: '8px 0 0 0',
              lineHeight: 1.25,
            }}
          >
            {feature.title}
          </h2>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '2px', background: COLORS.primaryLight }} />

      {/* Body */}
      {feature.body.map((text, i) => (
        <p
          key={i}
          style={{
            color: COLORS.text,
            fontSize: '16px',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {text}
        </p>
      ))}

      {/* Detail cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
        }}
      >
        {feature.details.map((d, i) => (
          <div
            key={i}
            style={{
              background: COLORS.badgeBg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}
          >
            <span style={{ color: COLORS.primary, fontSize: '10px', marginTop: '5px', flexShrink: 0 }}>
              {d.icon}
            </span>
            <div>
              <span
                style={{
                  display: 'block',
                  fontWeight: 700,
                  color: COLORS.primary,
                  fontSize: '13px',
                  marginBottom: '4px',
                }}
              >
                {d.label}
              </span>
              <span style={{ color: COLORS.text, fontSize: '14px', lineHeight: 1.5 }}>{d.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Note */}
      {feature.note && (
        <div
          style={{
            background: COLORS.accentLight,
            border: `1px solid ${COLORS.accent}30`,
            borderLeft: `4px solid ${COLORS.accent}`,
            borderRadius: '0 8px 8px 0',
            padding: '12px 16px',
            color: '#065f46',
            fontSize: '13px',
            lineHeight: 1.55,
          }}
        >
          <strong>Nota: </strong>
          {feature.note}
        </div>
      )}
    </div>
  </SlideLayout>
);

// ─── Slide: Cierre ────────────────────────────────────────────────────────────

const SlideClosing = ({ current, total }) => (
  <SlideLayout footer={false} current={current} total={total}>
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(160deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '-100px',
          top: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '-60px',
          bottom: '-60px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(0,166,81,0.12)',
        }}
      />

      <div
        style={{
          width: '64px',
          height: '4px',
          background: COLORS.accent,
          borderRadius: '2px',
          marginBottom: '32px',
        }}
      />

      <h2
        style={{
          color: COLORS.white,
          fontSize: '42px',
          fontWeight: 800,
          margin: '0 0 16px 0',
          textAlign: 'center',
        }}
      >
        ¡Gracias!
      </h2>

      <p
        style={{
          color: 'rgba(255,255,255,0.65)',
          fontSize: '16px',
          textAlign: 'center',
          maxWidth: '480px',
          lineHeight: 1.6,
          margin: '0 0 48px 0',
        }}
      >
        Novedades de Padrón de Habitantes · Versión 10.0.3.38.0
        <br />
        Junio 2026
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '600px',
        }}
      >
        {features.map((f) => (
          <div
            key={f.number}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: COLORS.accent, fontSize: '11px', fontWeight: 700 }}>{f.number}</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>{f.title}</span>
          </div>
        ))}
      </div>
    </div>
  </SlideLayout>
);

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
      if (e.key === 'Home') setCurrent(0);
      if (e.key === 'End') setCurrent(total - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, total]);

  const slide = slides[current];

  const renderSlide = () => {
    if (slide.type === 'cover') return <SlideCover current={current + 1} total={total} />;
    if (slide.type === 'intro') return <SlideIntro current={current + 1} total={total} />;
    if (slide.type === 'feature')
      return <SlideFeature feature={features[slide.index]} current={current + 1} total={total} />;
    if (slide.type === 'closing') return <SlideClosing current={current + 1} total={total} />;
    return null;
  };

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      {renderSlide()}

      {/* Navigation controls */}
      <div
        style={{
          position: 'fixed',
          bottom: '52px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setCurrent(0)}
          disabled={current === 0}
          title="Inicio"
          style={{
            background: 'rgba(0,61,122,0.85)',
            border: 'none',
            borderRadius: '8px',
            color: COLORS.white,
            width: '34px',
            height: '34px',
            cursor: current === 0 ? 'default' : 'pointer',
            opacity: current === 0 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Home size={14} />
        </button>
        <button
          onClick={prev}
          disabled={current === 0}
          title="Anterior (←)"
          style={{
            background: 'rgba(0,61,122,0.85)',
            border: 'none',
            borderRadius: '8px',
            color: COLORS.white,
            width: '34px',
            height: '34px',
            cursor: current === 0 ? 'default' : 'pointer',
            opacity: current === 0 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          disabled={current === total - 1}
          title="Siguiente (→)"
          style={{
            background: 'rgba(0,61,122,0.85)',
            border: 'none',
            borderRadius: '8px',
            color: COLORS.white,
            width: '34px',
            height: '34px',
            cursor: current === total - 1 ? 'default' : 'pointer',
            opacity: current === total - 1 ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dot indicators */}
      <div
        style={{
          position: 'fixed',
          bottom: '52px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          zIndex: 100,
        }}
      >
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            title={`Ir a diapositiva ${i + 1}`}
            style={{
              width: i === current ? '20px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === current ? COLORS.primary : COLORS.border,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
