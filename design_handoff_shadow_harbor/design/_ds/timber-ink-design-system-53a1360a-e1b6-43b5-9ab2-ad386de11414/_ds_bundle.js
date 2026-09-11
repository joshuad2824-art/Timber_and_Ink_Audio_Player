/* @ds-bundle: {"format":4,"namespace":"TimberInkDesignSystem_53a136","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Masthead","sourcePath":"components/navigation/Masthead.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"a8a23cf0c99b","components/core/Button.jsx":"714fa1fc19ed","components/core/Card.jsx":"e641ac18f2c7","components/core/Icon.jsx":"a45346f29a6c","components/core/IconButton.jsx":"328b002579da","components/core/Tag.jsx":"00d0e12b566b","components/feedback/Dialog.jsx":"c405ad6f2cd2","components/feedback/Toast.jsx":"2af2f206e7c3","components/feedback/Tooltip.jsx":"a12da9a66885","components/forms/Checkbox.jsx":"16f6b6b34d49","components/forms/Field.jsx":"9bf768580e57","components/forms/Input.jsx":"bcd6e14e5155","components/forms/Radio.jsx":"1acb2f1d6751","components/forms/Select.jsx":"60b245cf2744","components/forms/Switch.jsx":"4ea138c95541","components/forms/Textarea.jsx":"a07de1072322","components/navigation/Masthead.jsx":"858aac108e67","components/navigation/Tabs.jsx":"ce40b459981c","ui_kits/field_notes_app/AccountScreen.jsx":"189a0eacc545","ui_kits/field_notes_app/FieldNotesApp.jsx":"4096e893a7bc","ui_kits/field_notes_app/NotesScreen.jsx":"672d04dbc88d","ui_kits/field_notes_app/Phone.jsx":"8b406c11a0e0","ui_kits/field_notes_app/ReaderScreen.jsx":"71d7e0f576c8","ui_kits/field_notes_app/ShelfScreen.jsx":"e5121dd894c1","ui_kits/journal_web/ArchiveScreen.jsx":"7413662602f9","ui_kits/journal_web/ArchiveScreen.sa.jsx":"7413662602f9","ui_kits/journal_web/ArticleScreen.jsx":"bf24620b7fab","ui_kits/journal_web/ArticleScreen.sa.jsx":"0a621bd5ba23","ui_kits/journal_web/HomeScreen.jsx":"14cbf7e899cc","ui_kits/journal_web/HomeScreen.sa.jsx":"7dade8dc9934","ui_kits/journal_web/JournalApp.jsx":"54a6e25e08c3","ui_kits/journal_web/JournalApp.sa.jsx":"fca96f254776","ui_kits/journal_web/Shared.jsx":"351f92fbe5f5","ui_kits/journal_web/Shared.sa.jsx":"6d4c04dd7193","ui_kits/journal_web/SubscribeScreen.jsx":"407220a30f5e","ui_kits/journal_web/SubscribeScreen.sa.jsx":"eb12472c7aa9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TimberInkDesignSystem_53a136 = window.TimberInkDesignSystem_53a136 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "var(--wash-hover-strong)",
    fg: "var(--text-heading)",
    border: "1px solid var(--border-hairline)"
  },
  brass: {
    bg: "var(--brass-300)",
    fg: "var(--teal-950)",
    border: "1px solid var(--brass-500)"
  },
  forest: {
    bg: "var(--teal-700)",
    fg: "var(--cream-100)",
    border: "1px solid var(--teal-700)"
  },
  teal: {
    bg: "var(--teal-700)",
    fg: "var(--cream-100)",
    border: "1px solid var(--teal-800)"
  },
  danger: {
    bg: "var(--status-danger)",
    fg: "var(--cream-050)",
    border: "1px solid var(--danger-paper)"
  },
  success: {
    bg: "var(--success-paper)",
    fg: "var(--cream-050)",
    border: "1px solid var(--success-paper)"
  },
  outline: {
    bg: "transparent",
    fg: "var(--text-heading)",
    border: "1px solid var(--border-strong)"
  }
};
function Badge({
  tone = "neutral",
  shape = "square",
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const stamp = shape === "stamp";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      padding: stamp ? 0 : "3px 8px",
      width: stamp ? 44 : undefined,
      height: stamp ? 44 : undefined,
      background: t.bg,
      color: t.fg,
      border: t.border,
      borderRadius: stamp ? "var(--radius-stamp)" : "var(--radius-xs)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-2xs)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-wider)",
      textTransform: "uppercase",
      lineHeight: 1.2,
      textAlign: "center",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: "6px 14px",
    fontSize: "var(--text-xs)",
    gap: "6px"
  },
  md: {
    padding: "10px 18px",
    fontSize: "var(--text-sm)",
    gap: "8px"
  },
  lg: {
    padding: "14px 26px",
    fontSize: "var(--text-base)",
    gap: "10px"
  }
};
const VARIANTS = {
  primary: {
    bg: "var(--action-primary)",
    bgHover: "var(--action-primary-hover)",
    fg: "var(--text-on-primary)",
    border: "2px solid var(--action-primary-border)"
  },
  accent: {
    bg: "var(--action-accent)",
    bgHover: "var(--action-accent-hover)",
    fg: "var(--text-on-action-accent)",
    border: "2px solid var(--action-accent-border)"
  },
  secondary: {
    bg: "transparent",
    bgHover: "var(--wash-hover)",
    fg: "var(--text-heading)",
    border: "2px solid var(--border-strong)"
  },
  ghost: {
    bg: "transparent",
    bgHover: "var(--wash-hover)",
    fg: "var(--text-heading)",
    border: "2px solid transparent"
  },
  inverse: {
    bg: "var(--action-inverse-bg)",
    bgHover: "var(--action-inverse-bg)",
    fg: "var(--action-inverse-fg)",
    border: "2px solid var(--action-inverse-bg)"
  }
};

/* Letterpress plate: the button lifts up-left on hover and stamps back down
   on press. No color-only hover states, no scale transforms.
   Labels are sentence case — the voice offers, it does not shout. */
function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  type = "button",
  children,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const lifted = hover && !press && !disabled;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? "flex" : "inline-flex",
      width: fullWidth ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      padding: s.padding,
      fontFamily: "var(--font-ui)",
      fontSize: s.fontSize,
      fontWeight: 600,
      letterSpacing: "var(--tracking-normal)",
      color: disabled ? "var(--action-disabled-text)" : v.fg,
      background: disabled ? "var(--action-disabled-bg)" : hover && !press ? v.bgHover : v.bg,
      border: disabled ? "2px solid transparent" : v.border,
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "var(--transition-control)",
      transform: lifted ? "translate(-1px, -1px)" : "translate(0, 0)",
      boxShadow: disabled ? "none" : press ? "var(--shadow-press)" : lifted ? variant === "accent" ? "var(--shadow-plate-brass)" : "var(--shadow-plate)" : "none",
      ...style
    }
  }, rest), iconLeft, /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  paper: {
    bg: "var(--surface-card)",
    fg: "var(--text-body)",
    border: "1px solid var(--border-hairline)"
  },
  raised: {
    bg: "var(--surface-raised)",
    fg: "var(--text-body)",
    border: "1px solid var(--border-hairline)"
  },
  forest: {
    bg: "var(--teal-700)",
    fg: "var(--text-on-dark)",
    border: "1px solid var(--border-on-dark)"
  },
  brass: {
    bg: "var(--surface-accent)",
    fg: "var(--text-on-accent)",
    border: "1px solid var(--amber-700)"
  },
  plate: {
    bg: "var(--surface-card)",
    fg: "var(--text-body)",
    border: "2px solid var(--border-strong)"
  }
};

/* A card is a piece of paper: hairline rule, tiny radius, warm low shadow.
   tone="plate" gets the offset letterpress block instead of a shadow. */
function Card({
  tone = "paper",
  padding = "var(--pad-card)",
  interactive = false,
  eyebrow,
  title,
  meta,
  media,
  footer,
  children,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const t = TONES[tone] || TONES.paper;
  const dark = tone === "forest";
  /* The amber plate is printed matter: flip the whole subtree to paper stock so
     nested controls stop inheriting night-stock text colours. */
  const onLight = tone === "brass";
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-stock": onLight ? "paper" : undefined,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      background: t.bg,
      color: t.fg,
      ...(onLight ? {
        "--text-quiet": "var(--amber-700)",
        "--text-accent": "var(--amber-700)"
      } : null),
      border: t.border,
      borderRadius: "var(--radius-md)",
      boxShadow: tone === "plate" ? interactive && hover ? "5px 5px 0 var(--plate-offset)" : "var(--shadow-plate)" : interactive && hover ? "var(--shadow-lift)" : "var(--shadow-card)",
      transform: interactive && hover ? "translateY(-2px)" : "none",
      transition: "box-shadow var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)",
      cursor: interactive ? "pointer" : "default",
      overflow: "hidden",
      ...style
    }
  }, rest), media, /*#__PURE__*/React.createElement("div", {
    style: {
      padding,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-2xs)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-widest)",
      textTransform: "uppercase",
      color: dark ? "var(--brass-400)" : onLight ? "var(--brass-700)" : "var(--text-accent)"
    }
  }, eyebrow) : null, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--text-xl)",
      lineHeight: "var(--leading-snug)",
      color: dark ? "var(--cream-100)" : onLight ? "var(--text-on-accent)" : "var(--text-heading)"
    }
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, children) : null, meta ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      letterSpacing: "var(--tracking-wide)",
      color: dark ? "var(--text-on-dark-muted)" : onLight ? "var(--brass-700)" : "var(--text-quiet)"
    }
  }, meta) : null), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4) var(--pad-card)",
      borderTop: dark ? "1px solid var(--border-on-dark)" : onLight ? "1px solid rgba(11,13,17,0.18)" : "1px solid var(--border-hairline)"
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Timber & Ink uses Lucide (1.5px stroke) as its icon set — no proprietary
   glyph set shipped with the brand assets. Load lucide's UMD build once in
   the page, then Icon injects the requested glyph inline so it inherits
   currentColor. */
function Icon({
  name,
  size = 18,
  strokeWidth = 1.5,
  color = "currentColor",
  style,
  ...rest
}) {
  const host = React.useRef(null);
  React.useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled || !host.current) return;
      const L = window.lucide;
      if (!L) {
        setTimeout(draw, 120);
        return;
      }
      const icons = L.icons || L.default && L.default.icons;
      const key = name.split("-").map(function (p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
      }).join("");
      const node = icons && (icons[key] || icons[name]);
      if (!node) return;
      host.current.innerHTML = "";
      const svg = L.createElement ? L.createElement(node) : null;
      if (!svg) return;
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);
      svg.setAttribute("stroke-width", strokeWidth);
      svg.setAttribute("stroke", color);
      host.current.appendChild(svg);
    };
    draw();
    return function () {
      cancelled = true;
    };
  }, [name, size, strokeWidth, color]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: host,
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      flex: "0 0 auto",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BOX = {
  sm: 30,
  md: 38,
  lg: 46
};
function IconButton({
  icon,
  label,
  variant = "secondary",
  size = "md",
  disabled = false,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const box = BOX[size] || BOX.md;
  const bare = variant === "ghost";
  const inverse = variant === "inverse";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: box,
      height: box,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: disabled ? "var(--action-disabled-text)" : inverse ? "var(--text-on-dark)" : "var(--text-heading)",
      background: hover && !disabled ? inverse ? "var(--wash-hover-strong)" : "var(--wash-hover)" : "transparent",
      border: bare || inverse ? "1px solid transparent" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Interactive counterpart to Badge: topic filters in the archive. */
function Tag({
  children,
  selected = false,
  removable = false,
  onRemove,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const clickable = Boolean(onClick);
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      background: selected ? "var(--wash-selected)" : hover && clickable ? "var(--wash-hover)" : "transparent",
      color: selected ? "var(--text-on-selected)" : "var(--text-body)",
      border: selected ? "1px solid var(--wash-selected)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-xs)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-xs)",
      letterSpacing: "var(--tracking-wide)",
      cursor: clickable ? "pointer" : "default",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), children, removable ? /*#__PURE__*/React.createElement("span", {
    role: "button",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      if (onRemove) onRemove(e);
    },
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-sm)",
      lineHeight: 1,
      opacity: 0.7,
      cursor: "pointer"
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Modal sheet on a fogged scrim: the veil is the brand's atmosphere —
   dark ink at 62% with a slight blur, sheet is cream paper with a 2px ink rule. */
function Dialog({
  open = true,
  title,
  eyebrow,
  onClose,
  footer,
  width = 480,
  children,
  style,
  ...rest
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return function () {
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      zIndex: "var(--z-modal)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-8)",
      background: "var(--surface-overlay)",
      backdropFilter: "blur(3px)"
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation(),
    style: {
      width: width,
      maxWidth: "100%",
      background: "var(--surface-card)",
      border: "2px solid var(--border-strong)",
      borderRadius: "var(--radius-md)",
      boxShadow: "6px 6px 0 rgba(0,0,0,0.5)",
      animation: "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--pad-card-lg) var(--pad-card-lg) var(--space-5)",
      borderBottom: "1px solid var(--border-hairline)"
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-2xs)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-widest)",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: "var(--space-3)"
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--text-xl)",
      lineHeight: "var(--leading-snug)",
      color: "var(--text-heading)"
    }
  }, title), onClose ? /*#__PURE__*/React.createElement("span", {
    role: "button",
    "aria-label": "Close",
    onClick: onClose,
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-lg)",
      lineHeight: 1,
      color: "var(--text-muted)",
      cursor: "pointer"
    }
  }, "\xD7") : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-6) var(--pad-card-lg)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--text-body)"
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-5) var(--pad-card-lg) var(--pad-card-lg)",
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--space-4)"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "var(--teal-700)",
    fg: "var(--cream-100)",
    accent: "var(--brass-400)"
  },
  success: {
    bg: "var(--teal-700)",
    fg: "var(--cream-100)",
    accent: "var(--status-success)"
  },
  danger: {
    bg: "var(--teal-900)",
    fg: "var(--cream-100)",
    accent: "var(--status-danger)"
  }
};

/* Dark teal slip with a 3px accent rule down its left edge. Fades up. */
function Toast({
  tone = "neutral",
  icon,
  title,
  children,
  action,
  onClose,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-4)",
      minWidth: 280,
      maxWidth: 420,
      padding: "var(--space-5) var(--space-6)",
      background: t.bg,
      color: t.fg,
      borderLeft: "3px solid " + t.accent,
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-lift)",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.accent,
      marginTop: 1
    }
  }, icon) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)"
    }
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      lineHeight: "var(--leading-normal)",
      color: "var(--text-on-dark-muted)"
    }
  }, children) : null), action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: -2
    }
  }, action) : null, onClose ? /*#__PURE__*/React.createElement("span", {
    role: "button",
    "aria-label": "Dismiss",
    onClick: onClose,
    style: {
      fontFamily: "var(--font-mono)",
      color: "var(--text-on-dark-muted)",
      cursor: "pointer",
      lineHeight: 1
    }
  }, "\xD7") : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Hover label: ink slip, mono uppercase micro-type, no arrow. */
function Tooltip({
  label,
  placement = "top",
  children,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", _extends({
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    }
  }, rest), children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: "var(--z-overlay)",
      whiteSpace: "nowrap",
      padding: "5px 9px",
      background: "var(--teal-900)",
      color: "var(--cream-100)",
      borderRadius: "var(--radius-xs)",
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-wide)",
      textTransform: "uppercase",
      pointerEvents: "none",
      opacity: open ? 1 : 0,
      transition: "opacity var(--duration-fast) var(--ease-standard)",
      ...pos
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  checked,
  defaultChecked,
  onChange,
  label,
  description,
  disabled = false,
  style,
  ...rest
}) {
  const controlled = checked !== undefined;
  const [inner, setInner] = React.useState(Boolean(defaultChecked));
  const on = controlled ? checked : inner;
  const toggle = e => {
    if (disabled) return;
    if (!controlled) setInner(!on);
    if (onChange) onChange(!on, e);
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "checkbox",
    "aria-checked": on,
    tabIndex: disabled ? -1 : 0,
    onClick: toggle,
    onKeyDown: e => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle(e);
      }
    },
    style: {
      display: "inline-flex",
      gap: "var(--space-4)",
      alignItems: description ? "flex-start" : "center",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      flex: "0 0 auto",
      marginTop: description ? 3 : 0,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: on ? "var(--action-primary)" : "var(--control-well)",
      border: on ? "1px solid var(--action-primary-border)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-xs)",
      boxShadow: on ? "none" : "var(--control-inset)",
      transition: "var(--transition-control)"
    }
  }, on ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-on-primary)",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })) : null), label || description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "2px"
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      lineHeight: "var(--leading-normal)"
    }
  }, label) : null, description ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      color: "var(--text-quiet)"
    }
  }, description) : null) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
/* Shared field furniture: mono uppercase label, hairline-ruled well, brass
   focus ring. Inputs read like a form printed on paper. */
function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-2xs)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-widest)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger-paper)"
    }
  }, " *") : null) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-xs)",
      color: "var(--status-danger)"
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      color: "var(--text-quiet)"
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  invalid = false,
  iconLeft,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const input = /*#__PURE__*/React.createElement("input", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      background: invalid ? "rgba(196,87,67,0.10)" : "var(--control-well)",
      color: "var(--text-body)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-normal)",
      border: invalid ? "1px solid var(--status-danger)" : focus ? "1px solid var(--focus-ring)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      boxShadow: focus ? "var(--focus-glow)" : "var(--control-inset)",
      outline: "none",
      transition: "var(--transition-control)",
      ...(iconLeft ? {
        paddingLeft: 38
      } : null),
      ...style
    }
  }, rest));
  if (!iconLeft) return input;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-quiet)",
      pointerEvents: "none"
    }
  }, iconLeft), input);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  options = [],
  value,
  defaultValue,
  onChange,
  name,
  direction = "column",
  style,
  ...rest
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue);
  const current = controlled ? value : inner;
  const pick = v => {
    if (!controlled) setInner(v);
    if (onChange) onChange(v);
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "radiogroup",
    style: {
      display: "flex",
      flexDirection: direction,
      gap: direction === "row" ? "var(--space-7)" : "var(--space-4)",
      ...style
    }
  }, rest), options.map(function (o) {
    const v = typeof o === "string" ? o : o.value;
    const label = typeof o === "string" ? o : o.label;
    const description = typeof o === "string" ? null : o.description;
    const on = current === v;
    return /*#__PURE__*/React.createElement("span", {
      key: v,
      role: "radio",
      "aria-checked": on,
      tabIndex: 0,
      onClick: () => pick(v),
      onKeyDown: e => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          pick(v);
        }
      },
      style: {
        display: "inline-flex",
        gap: "var(--space-4)",
        alignItems: description ? "flex-start" : "center",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        flex: "0 0 auto",
        marginTop: description ? 3 : 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--control-well)",
        border: on ? "1px solid var(--action-primary-border)" : "1px solid var(--border-default)",
        borderRadius: "var(--radius-stamp)",
        boxShadow: on ? "none" : "var(--control-inset)",
        transition: "var(--transition-control)"
      }
    }, on ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: "var(--radius-stamp)",
        background: "var(--action-primary)"
      }
    }) : null), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "2px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-base)",
        color: "var(--text-body)"
      }
    }, label), description ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        color: "var(--text-quiet)"
      }
    }, description) : null), name ? /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: name,
      value: v,
      checked: on,
      readOnly: true,
      style: {
        display: "none"
      }
    }) : null);
  }));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  invalid = false,
  options = [],
  children,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      background: invalid ? "rgba(196,87,67,0.10)" : "var(--control-well)",
      color: "var(--text-body)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-normal)",
      border: invalid ? "1px solid var(--status-danger)" : focus ? "1px solid var(--focus-ring)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      boxShadow: focus ? "var(--focus-glow)" : "var(--control-inset)",
      outline: "none",
      transition: "var(--transition-control)",
      appearance: "none",
      paddingRight: 34,
      fontFamily: "var(--font-ui)",
      fontSize: "var(--text-sm)",
      cursor: "pointer",
      ...style
    }
  }, rest), options.map(function (o) {
    const value = typeof o === "string" ? o : o.value;
    const label = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, label);
  }), children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, "\u25BE"));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  style,
  ...rest
}) {
  const controlled = checked !== undefined;
  const [inner, setInner] = React.useState(Boolean(defaultChecked));
  const on = controlled ? checked : inner;
  const toggle = () => {
    if (disabled) return;
    if (!controlled) setInner(!on);
    if (onChange) onChange(!on);
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "switch",
    "aria-checked": on,
    tabIndex: disabled ? -1 : 0,
    onClick: toggle,
    onKeyDown: e => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    },
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-4)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 22,
      padding: 2,
      background: on ? "var(--brass-400)" : "var(--wash-hover-strong)",
      border: on ? "1px solid var(--brass-600)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-stamp)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: on ? "flex-end" : "flex-start",
      transition: "background-color var(--duration-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: "var(--radius-stamp)",
      background: "var(--cream-100)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.45)",
      transition: "transform var(--duration-base) var(--ease-out)"
    }
  })), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      color: "var(--text-body)"
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  invalid = false,
  rows = 4,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      background: invalid ? "rgba(196,87,67,0.10)" : "var(--control-well)",
      color: "var(--text-body)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-normal)",
      border: invalid ? "1px solid var(--status-danger)" : focus ? "1px solid var(--focus-ring)" : "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      boxShadow: focus ? "var(--focus-glow)" : "var(--control-inset)",
      outline: "none",
      transition: "var(--transition-control)",
      resize: "vertical",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Masthead.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Site header: wordmark lockup left, sentence-case nav center-right,
   one accent action. Sits on cream or teal. */
function Masthead({
  logoSrc,
  wordmark = "Timber & Ink",
  tagline,
  items = [],
  active,
  onNavigate,
  tone = "light",
  action,
  style,
  ...rest
}) {
  const dark = tone === "dark";
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-9)",
      height: "var(--header-height)",
      padding: "0 var(--gutter-page)",
      background: dark ? "var(--teal-900)" : "var(--surface-raised)",
      borderBottom: dark ? "1px solid var(--border-on-dark)" : "2px solid var(--border-strong)",
      color: dark ? "var(--text-on-dark)" : "var(--text-heading)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      flex: "0 0 auto"
    }
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: wordmark,
    style: {
      height: 26,
      width: "auto",
      filter: "var(--logo-filter)"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-lg)",
      letterSpacing: "var(--tracking-tight)",
      textTransform: "uppercase"
    }
  }, wordmark), tagline ? /*#__PURE__*/React.createElement("span", {
    style: {
      paddingLeft: "var(--space-5)",
      borderLeft: dark ? "1px solid var(--border-on-dark)" : "1px solid var(--border-default)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-2xs)",
      letterSpacing: "var(--tracking-wider)",
      textTransform: "uppercase",
      color: dark ? "var(--text-on-dark-muted)" : "var(--text-muted)"
    }
  }, tagline) : null), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-8)",
      marginLeft: "auto"
    }
  }, items.map(function (i) {
    const item = typeof i === "string" ? {
      value: i,
      label: i
    } : i;
    const on = active === item.value;
    return /*#__PURE__*/React.createElement("span", {
      key: item.value,
      onClick: () => onNavigate && onNavigate(item.value),
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        letterSpacing: "var(--tracking-normal)",
        color: on ? dark ? "var(--brass-400)" : "var(--text-accent)" : "inherit",
        cursor: "pointer",
        paddingBottom: 2,
        borderBottom: on ? "2px solid " + (dark ? "var(--brass-400)" : "var(--rule-accent)") : "2px solid transparent"
      }
    }, item.label);
  }), action));
}
Object.assign(__ds_scope, { Masthead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Masthead.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Ruled tabs: a hairline baseline with an ink 2px marker under the active
   item. Underline moves instantly — no sliding pill. */
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  tone = "light",
  style,
  ...rest
}) {
  const list = items.map(function (i) {
    return typeof i === "string" ? {
      value: i,
      label: i
    } : i;
  });
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(defaultValue !== undefined ? defaultValue : list[0] && list[0].value);
  const current = controlled ? value : inner;
  const dark = tone === "dark";
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "flex",
      gap: "var(--space-8)",
      borderBottom: dark ? "1px solid var(--border-on-dark)" : "1px solid var(--border-hairline)",
      ...style
    }
  }, rest), list.map(function (i) {
    const on = current === i.value;
    return /*#__PURE__*/React.createElement("span", {
      key: i.value,
      role: "tab",
      "aria-selected": on,
      tabIndex: 0,
      onClick: () => {
        if (!controlled) setInner(i.value);
        if (onChange) onChange(i.value);
      },
      onKeyDown: e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!controlled) setInner(i.value);
          if (onChange) onChange(i.value);
        }
      },
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "0 0 var(--space-4)",
        marginBottom: -1,
        fontFamily: "var(--font-ui)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        letterSpacing: "var(--tracking-normal)",
        color: on ? dark ? "var(--cream-050)" : "var(--text-heading)" : dark ? "var(--text-on-dark-muted)" : "var(--text-quiet)",
        borderBottom: on ? dark ? "2px solid var(--brass-400)" : "2px solid var(--rule-accent)" : "2px solid transparent",
        cursor: "pointer",
        transition: "color var(--duration-fast) var(--ease-standard)"
      }
    }, i.icon, i.label, i.count !== undefined ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-2xs)",
        color: dark ? "var(--text-on-dark-muted)" : "var(--text-quiet)"
      }
    }, i.count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field_notes_app/AccountScreen.jsx
try { (() => {
function AccountScreen({
  onCancel
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AppBar, {
    kicker: "Reading since 2019",
    title: "Sam Whitlock",
    right: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "settings"
      }),
      label: "Settings",
      size: "sm"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 20px 26px",
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "forest",
    padding: "18px",
    eyebrow: "Supporting",
    title: "Patron",
    meta: "RENEWS 12 FEB 2027 \xB7 $60",
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "inverse",
      size: "sm"
    }, "Manage"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      style: {
        color: "var(--cream-200)"
      },
      onClick: onCancel
    }, "Cancel"))
  }, "Thank you \u2014 this is what keeps the hosting on and the microphone plugged in."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "The letter"), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Tell me when something new is posted"
  }), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "The monthly letter"
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Podcast notes"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      paddingTop: 4,
      borderTop: "1px solid var(--border-hairline)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      paddingTop: 12
    }
  }, "Reading"), /*#__PURE__*/React.createElement(Field, {
    label: "Text size"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["Small", "Comfortable", "Large"],
    defaultValue: "Comfortable"
  })), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Download episodes over Wi-Fi only"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A + "logo-wordmark-reverse.png",
    alt: "Timber & Ink",
    style: {
      height: 20,
      opacity: 0.75
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-quiet)"
    }
  }, "App 3.4 \xB7 Tulsa"))));
}
Object.assign(window, {
  AccountScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field_notes_app/AccountScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field_notes_app/FieldNotesApp.jsx
try { (() => {
function FieldNotesApp() {
  const [tab, setTab] = React.useState("shelf");
  const [toast, setToast] = React.useState(null);
  const [dialog, setDialog] = React.useState(false);
  const fire = t => {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "linear-gradient(170deg,var(--teal-900),var(--teal-800))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 56,
      padding: "40px 32px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 300,
      color: "var(--cream-200)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A + "logo-wordmark-reverse.png",
    alt: "Timber & Ink",
    style: {
      height: 30,
      marginBottom: 18
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--brass-400)",
      marginBottom: 10
    }
  }, "Field Notes \u2014 companion app"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 15,
      lineHeight: 1.6,
      color: "var(--cream-200)",
      maxWidth: "34ch"
    }
  }, "Listen to the latest episode, keep the notes you make while you read, and manage the letter. Tap the tab bar to move between the four surfaces.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Phone, {
    tab: tab,
    onTab: setTab
  }, tab === "shelf" ? /*#__PURE__*/React.createElement(ShelfScreen, {
    onOpen: () => setTab("read")
  }) : null, tab === "read" ? /*#__PURE__*/React.createElement(ReaderScreen, {
    onBack: () => setTab("shelf"),
    onSave: () => fire({
      title: "Saved",
      body: "It will be waiting under Saved."
    })
  }) : null, tab === "note" ? /*#__PURE__*/React.createElement(NotesScreen, {
    onSaved: () => fire({
      title: "Note kept",
      body: "Filed under Kitchen table."
    })
  }) : null, tab === "you" ? /*#__PURE__*/React.createElement(AccountScreen, {
    onCancel: () => setDialog(true)
  }) : null, /*#__PURE__*/React.createElement(Dialog, {
    open: dialog,
    width: 300,
    eyebrow: "Supporting",
    title: "Stop supporting?",
    onClose: () => setDialog(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: () => setDialog(false)
    }, "Keep it"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      onClick: () => {
        setDialog(false);
        fire({
          title: "All set",
          body: "No hard feelings — the letter keeps coming."
        });
      }
    }, "Cancel"))
  }, "You keep everything you have until February, and the letter stays free either way."), toast ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 14,
      right: 14,
      bottom: 14,
      zIndex: 1000
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15
    }),
    title: toast.title,
    onClose: () => setToast(null),
    style: {
      minWidth: 0
    }
  }, toast.body)) : null)));
}
Object.assign(window, {
  FieldNotesApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field_notes_app/FieldNotesApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field_notes_app/NotesScreen.jsx
try { (() => {
const NOTES = [{
  t: "Four minutes",
  d: "14 MAR · KITCHEN TABLE",
  b: "Long enough to notice the yard. Short enough that I don't start anything."
}, {
  t: "The knife",
  d: "28 FEB · THE GARAGE",
  b: "Flatten the back first. Everything after that is bookkeeping."
}, {
  t: "Margin",
  d: "19 FEB · FRONT PORCH",
  b: "Leave the edge of the week blank on purpose, and see what shows up in it."
}];
function NotesScreen({
  onSaved
}) {
  const [draft, setDraft] = React.useState("");
  const [place, setPlace] = React.useState("Kitchen table");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AppBar, {
    kicker: "23 notes",
    title: "Field notes",
    right: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "filter"
      }),
      label: "Filter",
      size: "sm"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 20px 26px",
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "paper",
    padding: "16px",
    title: "New note"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 3,
    value: draft,
    onChange: e => setDraft(e.target.value),
    placeholder: "Fog sat in the yard until nine."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Select, {
    value: place,
    onChange: e => setPlace(e.target.value),
    options: ["Kitchen table", "The garage", "Front porch", "Somewhere else"],
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => {
      setDraft("");
      onSaved();
    },
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15
    })
  }, "Save")), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Send this one to Joshua",
    description: "I read every note. Some of them end up in the letter."
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, NOTES.map(function (n) {
    return /*#__PURE__*/React.createElement("div", {
      key: n.t,
      style: {
        padding: "14px 16px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-hairline)",
        borderLeft: "3px solid var(--amber-500)",
        borderRadius: "var(--radius-sm)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-ui)",
        fontWeight: 600,
        fontSize: 15,
        color: "var(--text-heading)"
      }
    }, n.t), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.1em",
        color: "var(--text-quiet)"
      }
    }, n.d)), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "6px 0 0",
        maxWidth: "none",
        fontSize: 15,
        color: "var(--text-body)"
      }
    }, n.b));
  }))));
}
Object.assign(window, {
  NotesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field_notes_app/NotesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field_notes_app/Phone.jsx
try { (() => {
const {
  Button,
  IconButton,
  Icon,
  Badge,
  Tag,
  Card,
  Tabs,
  Input,
  Field,
  Checkbox,
  Switch,
  Select,
  Textarea,
  Dialog,
  Toast,
  Radio
} = window.TimberInkDesignSystem_53a136;
const A = "../../assets/";
function Phone({
  children,
  onTab,
  tab
}) {
  const TABS = [["shelf", "Shelf", "library"], ["read", "Reading", "book-open"], ["note", "Notes", "pencil-line"], ["you", "You", "user"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 780,
      position: "relative",
      background: "var(--surface-page)",
      borderRadius: 28,
      border: "8px solid var(--teal-900)",
      boxShadow: "0 24px 60px rgba(18,26,22,0.45)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 34,
      flex: "0 0 auto",
      background: "var(--teal-700)",
      color: "var(--cream-200)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 18px",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.08em"
    }
  }, /*#__PURE__*/React.createElement("span", null, "06:40"), /*#__PURE__*/React.createElement("span", null, "FOG \xB7 4\xB0C")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      position: "relative"
    }
  }, children), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: "0 0 auto",
      height: "var(--tabbar-height)",
      background: "var(--teal-700)",
      borderTop: "1px solid var(--border-on-dark)",
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)"
    }
  }, TABS.map(function (t) {
    const on = tab === t[0];
    return /*#__PURE__*/React.createElement("span", {
      key: t[0],
      onClick: () => onTab(t[0]),
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        cursor: "pointer",
        color: on ? "var(--brass-400)" : "var(--text-on-dark-muted)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t[2],
      size: 19
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase"
      }
    }, t[1]));
  })));
}
function AppBar({
  title,
  right,
  kicker
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 14px",
      background: "var(--surface-raised)",
      borderBottom: "2px solid var(--border-strong)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      position: "sticky",
      top: 0,
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", null, kicker ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-quiet)",
      marginBottom: 3
    }
  }, kicker) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-editorial)",
      fontWeight: 700,
      fontSize: 24,
      color: "var(--text-heading)",
      lineHeight: 1.1
    }
  }, title)), right);
}
Object.assign(window, {
  Phone,
  AppBar,
  A,
  Button,
  IconButton,
  Icon,
  Badge,
  Tag,
  Card,
  Tabs,
  Input,
  Field,
  Checkbox,
  Switch,
  Select,
  Textarea,
  Dialog,
  Toast,
  Radio
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field_notes_app/Phone.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field_notes_app/ReaderScreen.jsx
try { (() => {
function ReaderScreen({
  onBack,
  onSave
}) {
  const [saved, setSaved] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 210,
      background: "var(--wash-forest)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A + "engraving-moose-puffin.png",
    alt: "",
    style: {
      position: "absolute",
      right: -22,
      bottom: -18,
      height: 220,
      opacity: 0.5,
      filter: "var(--engraving-filter)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--protection-scrim)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 12,
      left: 14,
      right: 14,
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left"
    }),
    label: "Back",
    variant: "inverse",
    onClick: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: saved ? "bookmark-check" : "bookmark"
    }),
    label: "Save",
    variant: "inverse",
    onClick: () => {
      setSaved(!saved);
      if (!saved) onSave();
    }
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "type"
    }),
    label: "Text size",
    variant: "inverse"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 20,
      bottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--brass-400)"
    }
  }, "Slow living"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 22px 0"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      margin: "0 0 10px"
    }
  }, "The slow joy of loose-leaf tea"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-quiet)",
      marginBottom: 16
    }
  }, "JOSHUA DAVIS \xB7 9 MIN \xB7 MAR 2026"), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none",
      fontSize: 16
    }
  }, "I came to loose leaf the long way around \u2014 a tin somebody left at our house, and a stretch of months where the mornings were the only quiet I got."), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      maxWidth: "none",
      fontSize: 18
    }
  }, "Attention isn't something you find lying around. Mostly you have to build a small room for it."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none",
      fontSize: 16
    }
  }, "Four minutes is too short to start anything and too long to just stand there. So the day starts a little later than it would have."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "14px 16px",
      background: "var(--amber-200)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--amber-700)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil-line",
    size: 16,
    color: "var(--amber-700)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 14,
      color: "var(--teal-900)"
    }
  }, "Keep a note while you read"), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "sm",
    style: {
      marginLeft: "auto"
    }
  }, "Add one"))));
}
Object.assign(window, {
  ReaderScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field_notes_app/ReaderScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/field_notes_app/ShelfScreen.jsx
try { (() => {
const SHELF = [{
  n: 12,
  title: "Margin",
  meta: "MAR 2026 · 22 MIN",
  progress: 0.42,
  tone: "forest"
}, {
  n: 11,
  title: "Heirlooms",
  meta: "FEB 2026 · 19 MIN",
  progress: 1,
  tone: "teal"
}, {
  n: 10,
  title: "The long bench",
  meta: "JAN 2026 · 26 MIN",
  progress: 0,
  tone: "cream"
}];
function ShelfScreen({
  onOpen
}) {
  const [filter, setFilter] = React.useState("episodes");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(AppBar, {
    kicker: "Timber & Ink",
    title: "Your shelf",
    right: /*#__PURE__*/React.createElement(IconButton, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "search"
      }),
      label: "Search",
      size: "sm"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      value: "episodes",
      label: "Episodes",
      count: 12
    }, {
      value: "saved",
      label: "Saved",
      count: 6
    }, {
      value: "notes",
      label: "Notes",
      count: 23
    }],
    value: filter,
    onChange: setFilter
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 20px 26px",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "plate",
    padding: "16px",
    interactive: true,
    onClick: onOpen,
    media: /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        height: 168,
        background: "var(--wash-forest)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: A + "engraving-moose-puffin.png",
      alt: "",
      style: {
        position: "absolute",
        right: -10,
        bottom: -12,
        height: 176,
        opacity: 0.55,
        filter: "var(--engraving-filter)"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "var(--fog-veil-dark)",
        opacity: 0.85
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 16,
        bottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.18em",
        color: "var(--brass-400)",
        marginBottom: 4
      }
    }, "EPISODE 12 \xB7 LATEST"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 26,
        textTransform: "uppercase",
        color: "var(--cream-100)",
        lineHeight: 1.05
      }
    }, "Margin"))),
    meta: "42% PLAYED \xB7 13 MIN LEFT"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      background: "var(--wash-hover-strong)",
      borderRadius: 2,
      overflow: "hidden",
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "42%",
      height: "100%",
      background: "var(--amber-500)"
    }
  }))), SHELF.slice(1).map(function (s) {
    return /*#__PURE__*/React.createElement("div", {
      key: s.n,
      onClick: onOpen,
      style: {
        display: "grid",
        gridTemplateColumns: "66px 1fr auto",
        gap: 14,
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid var(--border-hairline)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 86,
        background: s.tone === "teal" ? "linear-gradient(150deg,var(--teal-800),var(--teal-600))" : "linear-gradient(160deg,var(--cream-300),var(--cream-400))",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "flex-end",
        padding: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        letterSpacing: "0.14em",
        color: s.tone === "teal" ? "var(--cream-200)" : "var(--teal-800)"
      }
    }, "EP.", s.n)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-editorial)",
        fontSize: 20,
        color: "var(--text-heading)"
      }
    }, s.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.1em",
        color: "var(--text-quiet)",
        marginTop: 3
      }
    }, s.meta)), s.progress === 1 ? /*#__PURE__*/React.createElement(Badge, {
      tone: "success"
    }, "Played") : /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 18,
      color: "var(--text-quiet)"
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      paddingTop: 4
    }
  }, ["Slow living", "Hand skills", "Fatherhood", "Mornings"].map(function (t) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: t
    }, t);
  }))));
}
Object.assign(window, {
  ShelfScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/field_notes_app/ShelfScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/ArchiveScreen.jsx
try { (() => {
function ArchiveScreen({
  onNavigate
}) {
  const [view, setView] = React.useState("all");
  const [tags, setTags] = React.useState(["Slow living"]);
  const [sort, setSort] = React.useState("Newest first");
  const toggle = t => setTags(tags.indexOf(t) > -1 ? tags.filter(function (x) {
    return x !== t;
  }) : tags.concat([t]));
  const list = ARTICLES.filter(function (a) {
    return view === "all" ? true : a.tag === "Field notes";
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-11) var(--gutter-page) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "var(--space-9)",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: 8
    }
  }, "Everything, 2019\u20132026"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-3xl)"
    }
  }, "The archive")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 15
    }),
    placeholder: "tea, margin, sharpening",
    style: {
      width: 280
    }
  }), /*#__PURE__*/React.createElement(Select, {
    value: sort,
    onChange: e => setSort(e.target.value),
    options: ["Newest first", "Oldest first", "Most read"],
    style: {
      width: 170
    }
  }))), /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      value: "all",
      label: "Everything",
      count: 142
    }, {
      value: "notes",
      label: "Field notes",
      count: 38
    }, {
      value: "episodes",
      label: "Episodes",
      count: 12
    }, {
      value: "letters",
      label: "Letters",
      count: 26
    }],
    value: view,
    onChange: setView,
    style: {
      marginBottom: "var(--space-7)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      flexWrap: "wrap",
      marginBottom: "var(--space-9)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-quiet)",
      marginRight: 4
    }
  }, "Topics"), ["Slow living", "Hand skills", "Fatherhood", "Margin", "Mornings", "Tulsa"].map(function (t) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: t,
      selected: tags.indexOf(t) > -1,
      onClick: () => toggle(t)
    }, t);
  }), tags.length ? /*#__PURE__*/React.createElement(Tag, {
    removable: true,
    onRemove: () => setTags([]),
    style: {
      marginLeft: 8
    }
  }, "Clear ", tags.length) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-7)",
      marginBottom: "var(--space-11)"
    }
  }, [12, 11, 10, 9].map(function (n, i) {
    return /*#__PURE__*/React.createElement(Card, {
      key: n,
      tone: i === 0 ? "plate" : "paper",
      interactive: true,
      onClick: () => onNavigate("article"),
      padding: "var(--space-6)",
      media: /*#__PURE__*/React.createElement(MediaPlate, {
        height: 210,
        tone: i % 2 ? "teal" : "forest",
        engraving: i === 0,
        caption: "EPISODE " + n
      }),
      eyebrow: i === 0 ? "Latest episode" : "Episode " + n,
      title: ["Margin", "Heirlooms", "The long bench", "Woodsmoke"][i],
      meta: ["Mar 2026 · 22 min", "Feb 2026 · 19 min", "Jan 2026 · 26 min", "Dec 2025 · 24 min"][i]
    });
  })), /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Loose pieces",
    title: "Writing" + (tags.length ? " · " + tags.join(", ") : ""),
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "rss",
        size: 14
      })
    }, "Follow")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, list.map(function (a) {
    return /*#__PURE__*/React.createElement("div", {
      key: a.id,
      onClick: () => onNavigate("article"),
      style: {
        display: "grid",
        gridTemplateColumns: "120px 1fr auto",
        gap: "var(--space-7)",
        alignItems: "center",
        padding: "var(--space-6) 0",
        borderBottom: "1px solid var(--border-hairline)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(MediaPlate, {
      height: 72,
      tone: a.tone,
      style: {
        borderRadius: "var(--radius-sm)"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--text-accent)",
        marginBottom: 4
      }
    }, a.eyebrow), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-editorial)",
        fontSize: "var(--text-xl)",
        color: "var(--text-heading)"
      }
    }, a.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, a.dek)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-quiet)",
        textAlign: "right"
      }
    }, a.meta));
  })));
}
Object.assign(window, {
  ArchiveScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/ArchiveScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/ArchiveScreen.sa.jsx
try { (() => {
function ArchiveScreen({
  onNavigate
}) {
  const [view, setView] = React.useState("all");
  const [tags, setTags] = React.useState(["Slow living"]);
  const [sort, setSort] = React.useState("Newest first");
  const toggle = t => setTags(tags.indexOf(t) > -1 ? tags.filter(function (x) {
    return x !== t;
  }) : tags.concat([t]));
  const list = ARTICLES.filter(function (a) {
    return view === "all" ? true : a.tag === "Field notes";
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-11) var(--gutter-page) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "var(--space-9)",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: 8
    }
  }, "Everything, 2019\u20132026"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: "var(--text-3xl)"
    }
  }, "The archive")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 15
    }),
    placeholder: "tea, margin, sharpening",
    style: {
      width: 280
    }
  }), /*#__PURE__*/React.createElement(Select, {
    value: sort,
    onChange: e => setSort(e.target.value),
    options: ["Newest first", "Oldest first", "Most read"],
    style: {
      width: 170
    }
  }))), /*#__PURE__*/React.createElement(Tabs, {
    items: [{
      value: "all",
      label: "Everything",
      count: 142
    }, {
      value: "notes",
      label: "Field notes",
      count: 38
    }, {
      value: "episodes",
      label: "Episodes",
      count: 12
    }, {
      value: "letters",
      label: "Letters",
      count: 26
    }],
    value: view,
    onChange: setView,
    style: {
      marginBottom: "var(--space-7)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      flexWrap: "wrap",
      marginBottom: "var(--space-9)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-quiet)",
      marginRight: 4
    }
  }, "Topics"), ["Slow living", "Hand skills", "Fatherhood", "Margin", "Mornings", "Tulsa"].map(function (t) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: t,
      selected: tags.indexOf(t) > -1,
      onClick: () => toggle(t)
    }, t);
  }), tags.length ? /*#__PURE__*/React.createElement(Tag, {
    removable: true,
    onRemove: () => setTags([]),
    style: {
      marginLeft: 8
    }
  }, "Clear ", tags.length) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-7)",
      marginBottom: "var(--space-11)"
    }
  }, [12, 11, 10, 9].map(function (n, i) {
    return /*#__PURE__*/React.createElement(Card, {
      key: n,
      tone: i === 0 ? "plate" : "paper",
      interactive: true,
      onClick: () => onNavigate("article"),
      padding: "var(--space-6)",
      media: /*#__PURE__*/React.createElement(MediaPlate, {
        height: 210,
        tone: i % 2 ? "teal" : "forest",
        engraving: i === 0,
        caption: "EPISODE " + n
      }),
      eyebrow: i === 0 ? "Latest episode" : "Episode " + n,
      title: ["Margin", "Heirlooms", "The long bench", "Woodsmoke"][i],
      meta: ["Mar 2026 · 22 min", "Feb 2026 · 19 min", "Jan 2026 · 26 min", "Dec 2025 · 24 min"][i]
    });
  })), /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Loose pieces",
    title: "Writing" + (tags.length ? " · " + tags.join(", ") : ""),
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "rss",
        size: 14
      })
    }, "Follow")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, list.map(function (a) {
    return /*#__PURE__*/React.createElement("div", {
      key: a.id,
      onClick: () => onNavigate("article"),
      style: {
        display: "grid",
        gridTemplateColumns: "120px 1fr auto",
        gap: "var(--space-7)",
        alignItems: "center",
        padding: "var(--space-6) 0",
        borderBottom: "1px solid var(--border-hairline)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(MediaPlate, {
      height: 72,
      tone: a.tone,
      style: {
        borderRadius: "var(--radius-sm)"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--text-accent)",
        marginBottom: 4
      }
    }, a.eyebrow), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-editorial)",
        fontSize: "var(--text-xl)",
        color: "var(--text-heading)"
      }
    }, a.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-sm)",
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, a.dek)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-quiet)",
        textAlign: "right"
      }
    }, a.meta));
  })));
}
Object.assign(window, {
  ArchiveScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/ArchiveScreen.sa.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/ArticleScreen.jsx
try { (() => {
function ArticleScreen({
  onNavigate,
  onToast
}) {
  const [saved, setSaved] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(MediaPlate, {
    height: 340,
    tone: "forest",
    engraving: true
  }), /*#__PURE__*/React.createElement("article", {
    style: {
      maxWidth: "var(--container-reading)",
      margin: "-88px auto 0",
      position: "relative",
      background: "var(--surface-card)",
      border: "1px solid var(--border-hairline)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-card)",
      padding: "var(--space-11) var(--space-11) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      marginBottom: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "forest",
    shape: "stamp"
  }, "Mar 26"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)"
    }
  }, "Slow living"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: "0.08em",
      color: "var(--text-quiet)"
    }
  }, "JOSHUA DAVIS \xB7 9 MIN READ \xB7 MAR 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(Tooltip, {
    label: saved ? "Saved" : "Save this"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: saved ? "bookmark-check" : "bookmark"
    }),
    label: "Save this",
    onClick: () => {
      setSaved(!saved);
      if (!saved && onToast) onToast();
    }
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Share"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "share-2"
    }),
    label: "Share"
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Print"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "printer"
    }),
    label: "Print"
  })))), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-4xl)",
      margin: "0 0 var(--space-6)"
    }
  }, "The slow joy of loose-leaf tea"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--text-lg)",
      fontStyle: "italic",
      color: "var(--text-muted)",
      maxWidth: "none"
    }
  }, "Four minutes of waiting, and what I've started noticing in them."), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none"
    }
  }, "I came to loose leaf the long way around \u2014 a tin somebody left at our house, a strainer I didn't know how to use, and a stretch of months where the mornings were the only quiet I got. The bag is faster. That turns out to be the whole argument against it."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none"
    }
  }, "Here's the part I didn't expect. Steeping takes about four minutes, and four minutes is too short to start anything and too long to just stand there. So you look out the window, or you don't, and either way the day starts a little later than it would have \u2014 which is, I think, the point."), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      maxWidth: "none"
    }
  }, "Attention isn't something you find lying around. Mostly you have to build a small room for it and then agree to sit in it."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none"
    }
  }, "If you're starting out, I'd encourage you to buy less tea than you think you want and better water than you think you need. Everything else \u2014 the pot, the timer, the ritual you'll invent by week three \u2014 can wait."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      flexWrap: "wrap",
      margin: "var(--space-9) 0 var(--space-8)"
    }
  }, ["Slow living", "Mornings", "Episode 12", "Tulsa"].map(function (t) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: t,
      onClick: () => onNavigate("archive")
    }, t);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-6)",
      padding: "var(--space-6)",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-hairline)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A + "logo-hobby-journal.png",
    alt: "Timber & Ink",
    style: {
      height: 42,
      filter: "var(--engraving-filter)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      maxWidth: "40ch"
    }
  }, "This one went out to the letter first. If you'd like the next one before it lands here, I'd be glad to send it."), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "sm",
    style: {
      marginLeft: "auto"
    },
    onClick: () => onNavigate("subscribe")
  }, "Get the letter"))), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-12) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "If you liked that",
    title: "Three more from this spring"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-8)"
    }
  }, ARTICLES.slice(1, 4).map(function (a) {
    return /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      tone: "paper",
      interactive: true,
      onClick: () => onNavigate("article"),
      eyebrow: a.eyebrow,
      title: a.title,
      meta: a.meta,
      media: /*#__PURE__*/React.createElement(MediaPlate, {
        height: 130,
        tone: a.tone,
        caption: "Photograph to come"
      })
    });
  }))));
}
Object.assign(window, {
  ArticleScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/ArticleScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/ArticleScreen.sa.jsx
try { (() => {
function ArticleScreen({
  onNavigate,
  onToast
}) {
  const [saved, setSaved] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(MediaPlate, {
    height: 340,
    tone: "forest",
    engraving: true
  }), /*#__PURE__*/React.createElement("article", {
    style: {
      maxWidth: "var(--container-reading)",
      margin: "-88px auto 0",
      position: "relative",
      background: "var(--surface-card)",
      border: "1px solid var(--border-hairline)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-card)",
      padding: "var(--space-11) var(--space-11) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      marginBottom: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "forest",
    shape: "stamp"
  }, "Mar 26"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)"
    }
  }, "Slow living"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      letterSpacing: "0.08em",
      color: "var(--text-quiet)"
    }
  }, "JOSHUA DAVIS \xB7 9 MIN READ \xB7 MAR 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(Tooltip, {
    label: saved ? "Saved" : "Save this"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: saved ? "bookmark-check" : "bookmark"
    }),
    label: "Save this",
    onClick: () => {
      setSaved(!saved);
      if (!saved && onToast) onToast();
    }
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Share"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "share-2"
    }),
    label: "Share"
  })), /*#__PURE__*/React.createElement(Tooltip, {
    label: "Print"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "printer"
    }),
    label: "Print"
  })))), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--text-4xl)",
      margin: "0 0 var(--space-6)"
    }
  }, "The slow joy of loose-leaf tea"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-editorial)",
      fontSize: "var(--text-lg)",
      fontStyle: "italic",
      color: "var(--text-muted)",
      maxWidth: "none"
    }
  }, "Four minutes of waiting, and what I've started noticing in them."), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none"
    }
  }, "I came to loose leaf the long way around \u2014 a tin somebody left at our house, a strainer I didn't know how to use, and a stretch of months where the mornings were the only quiet I got. The bag is faster. That turns out to be the whole argument against it."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none"
    }
  }, "Here's the part I didn't expect. Steeping takes about four minutes, and four minutes is too short to start anything and too long to just stand there. So you look out the window, or you don't, and either way the day starts a little later than it would have \u2014 which is, I think, the point."), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      maxWidth: "none"
    }
  }, "Attention isn't something you find lying around. Mostly you have to build a small room for it and then agree to sit in it."), /*#__PURE__*/React.createElement("p", {
    style: {
      maxWidth: "none"
    }
  }, "If you're starting out, I'd encourage you to buy less tea than you think you want and better water than you think you need. Everything else \u2014 the pot, the timer, the ritual you'll invent by week three \u2014 can wait."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      flexWrap: "wrap",
      margin: "var(--space-9) 0 var(--space-8)"
    }
  }, ["Slow living", "Mornings", "Episode 12", "Tulsa"].map(function (t) {
    return /*#__PURE__*/React.createElement(Tag, {
      key: t,
      onClick: () => onNavigate("archive")
    }, t);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-6)",
      padding: "var(--space-6)",
      background: "var(--surface-sunken)",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-hairline)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources.lockup,
    alt: "Timber & Ink",
    style: {
      height: 42,
      filter: "var(--engraving-filter)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      maxWidth: "40ch"
    }
  }, "This one went out to the letter first. If you'd like the next one before it lands here, I'd be glad to send it."), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "sm",
    style: {
      marginLeft: "auto"
    },
    onClick: () => onNavigate("subscribe")
  }, "Get the letter"))), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-12) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "If you liked that",
    title: "Three more from this spring"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-8)"
    }
  }, ARTICLES.slice(1, 4).map(function (a) {
    return /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      tone: "paper",
      interactive: true,
      onClick: () => onNavigate("article"),
      eyebrow: a.eyebrow,
      title: a.title,
      meta: a.meta,
      media: /*#__PURE__*/React.createElement(MediaPlate, {
        height: 130,
        tone: a.tone,
        caption: "Photograph to come"
      })
    });
  }))));
}
Object.assign(window, {
  ArticleScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/ArticleScreen.sa.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/HomeScreen.jsx
try { (() => {
function Hero({
  onNavigate,
  onSubscribe
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      background: "var(--wash-forest)",
      color: "var(--text-on-dark)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A + "engraving-moose-puffin.png",
    alt: "",
    style: {
      position: "absolute",
      right: 40,
      bottom: -40,
      height: 460,
      opacity: 0.5,
      filter: "var(--engraving-filter)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-13) var(--gutter-page) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      marginBottom: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brass"
  }, "Episode 12 is up"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-on-dark-muted)"
    }
  }, "March 2026 \xB7 Tulsa, Oklahoma")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 72,
      lineHeight: 1.02,
      letterSpacing: "-0.01em",
      textTransform: "uppercase",
      color: "var(--cream-100)",
      maxWidth: "17ch",
      margin: "0 0 var(--space-7)"
    }
  }, "Ordinary life deserves extraordinary attention"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-md)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--cream-200)",
      maxWidth: "48ch"
    }
  }, "A blog and a podcast about craft, margin, and the slow work of noticing. One long piece a month, and a shorter conversation somewhere in between."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      marginTop: "var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    onClick: onSubscribe,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 16
    })
  }, "Get the letter"), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "lg",
    onClick: () => onNavigate("article")
  }, "Read the latest"))));
}
function HomeScreen({
  onNavigate,
  onSubscribe
}) {
  const [featured] = ARTICLES;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    onNavigate: onNavigate,
    onSubscribe: onSubscribe
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-12) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Lately",
    title: "Six things worth a slow morning",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => onNavigate("archive"),
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 15
      })
    }, "Everything")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.35fr 1fr",
      gap: "var(--space-8)",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "paper",
    interactive: true,
    onClick: () => onNavigate("article"),
    padding: "var(--pad-card-lg)",
    eyebrow: featured.eyebrow,
    title: featured.title,
    meta: featured.meta,
    media: /*#__PURE__*/React.createElement(MediaPlate, {
      height: 280,
      tone: "forest",
      engraving: true,
      caption: "Photograph \u2014 J. Davis"
    })
  }, featured.dek), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, ARTICLES.slice(1, 4).map(function (a) {
    return /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      tone: "raised",
      interactive: true,
      onClick: () => onNavigate("article"),
      padding: "var(--space-6)",
      eyebrow: a.eyebrow,
      title: a.title,
      meta: a.meta
    });
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "var(--space-8)"
    }
  }, ARTICLES.slice(3).map(function (a) {
    return /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      tone: "paper",
      interactive: true,
      onClick: () => onNavigate("article"),
      eyebrow: a.eyebrow,
      title: a.title,
      meta: a.meta,
      media: /*#__PURE__*/React.createElement(MediaPlate, {
        height: 150,
        tone: a.tone,
        caption: "Photograph to come"
      })
    }, a.dek);
  }))), /*#__PURE__*/React.createElement("section", {
    "data-stock": "paper",
    style: {
      background: "var(--surface-page)",
      borderTop: "2px solid var(--brass-700)",
      borderBottom: "2px solid var(--brass-700)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-11) var(--gutter-page)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: 8
    }
  }, "The letter"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 var(--space-4)",
      fontSize: "var(--text-2xl)"
    }
  }, "One letter a month. Sometimes two, if something's worth it."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      maxWidth: "46ch"
    }
  }, "What I'm making, what I got wrong, and one thing worth your Saturday.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      minWidth: 380
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "joshua@example.com",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md"
  }, "Send it to me")))));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/HomeScreen.sa.jsx
try { (() => {
function Hero({
  onNavigate,
  onSubscribe
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      background: "var(--wash-forest)",
      color: "var(--text-on-dark)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources.engraving,
    alt: "",
    style: {
      position: "absolute",
      right: 40,
      bottom: -40,
      height: 460,
      opacity: 0.5,
      filter: "var(--engraving-filter)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-13) var(--gutter-page) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      marginBottom: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brass"
  }, "Episode 12 is up"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-on-dark-muted)"
    }
  }, "March 2026 \xB7 Tulsa, Oklahoma")), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 72,
      lineHeight: 1.02,
      letterSpacing: "-0.01em",
      textTransform: "uppercase",
      color: "var(--cream-100)",
      maxWidth: "17ch",
      margin: "0 0 var(--space-7)"
    }
  }, "Ordinary life deserves extraordinary attention"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-md)",
      lineHeight: "var(--leading-relaxed)",
      color: "var(--cream-200)",
      maxWidth: "48ch"
    }
  }, "A blog and a podcast about craft, margin, and the slow work of noticing. One long piece a month, and a shorter conversation somewhere in between."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      marginTop: "var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    onClick: onSubscribe,
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 16
    })
  }, "Get the letter"), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "lg",
    onClick: () => onNavigate("article")
  }, "Read the latest"))));
}
function HomeScreen({
  onNavigate,
  onSubscribe
}) {
  const [featured] = ARTICLES;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    onNavigate: onNavigate,
    onSubscribe: onSubscribe
  }), /*#__PURE__*/React.createElement("section", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-12) var(--gutter-page)"
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Lately",
    title: "Six things worth a slow morning",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => onNavigate("archive"),
      iconRight: /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 15
      })
    }, "Everything")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.35fr 1fr",
      gap: "var(--space-8)",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "paper",
    interactive: true,
    onClick: () => onNavigate("article"),
    padding: "var(--pad-card-lg)",
    eyebrow: featured.eyebrow,
    title: featured.title,
    meta: featured.meta,
    media: /*#__PURE__*/React.createElement(MediaPlate, {
      height: 280,
      tone: "forest",
      engraving: true,
      caption: "Photograph \u2014 J. Davis"
    })
  }, featured.dek), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)"
    }
  }, ARTICLES.slice(1, 4).map(function (a) {
    return /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      tone: "raised",
      interactive: true,
      onClick: () => onNavigate("article"),
      padding: "var(--space-6)",
      eyebrow: a.eyebrow,
      title: a.title,
      meta: a.meta
    });
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "var(--space-8)"
    }
  }, ARTICLES.slice(3).map(function (a) {
    return /*#__PURE__*/React.createElement(Card, {
      key: a.id,
      tone: "paper",
      interactive: true,
      onClick: () => onNavigate("article"),
      eyebrow: a.eyebrow,
      title: a.title,
      meta: a.meta,
      media: /*#__PURE__*/React.createElement(MediaPlate, {
        height: 150,
        tone: a.tone,
        caption: "Photograph to come"
      })
    }, a.dek);
  }))), /*#__PURE__*/React.createElement("section", {
    "data-stock": "paper",
    style: {
      background: "var(--surface-page)",
      borderTop: "2px solid var(--brass-700)",
      borderBottom: "2px solid var(--brass-700)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      padding: "var(--space-11) var(--gutter-page)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: 8
    }
  }, "The letter"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "0 0 var(--space-4)",
      fontSize: "var(--text-2xl)"
    }
  }, "One letter a month. Sometimes two, if something's worth it."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      maxWidth: "46ch"
    }
  }, "What I'm making, what I got wrong, and one thing worth your Saturday.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      minWidth: 380
    }
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "joshua@example.com",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md"
  }, "Send it to me")))));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/HomeScreen.sa.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/JournalApp.jsx
try { (() => {
function JournalApp() {
  const [screen, setScreen] = React.useState("home");
  const [dialog, setDialog] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const go = s => {
    setScreen(s);
    window.scrollTo({
      top: 0
    });
  };
  const fireToast = t => {
    setToast(t);
    setTimeout(() => setToast(null), 3200);
  };
  const NAV = [{
    value: "home",
    label: "Latest"
  }, {
    value: "article",
    label: "Writing"
  }, {
    value: "archive",
    label: "Archive"
  }, {
    value: "subscribe",
    label: "The letter"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: "100vh",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement(Masthead, {
    logoSrc: A + "logo-wordmark-reverse.png",
    tagline: "Blog & podcast",
    items: NAV,
    active: screen,
    onNavigate: go,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "sm",
      onClick: () => setDialog(true)
    }, "Get the letter")
  })), screen === "home" ? /*#__PURE__*/React.createElement(HomeScreen, {
    onNavigate: go,
    onSubscribe: () => setDialog(true)
  }) : null, screen === "article" ? /*#__PURE__*/React.createElement(ArticleScreen, {
    onNavigate: go,
    onToast: () => fireToast({
      tone: "success",
      title: "Saved",
      body: "It'll be waiting under Saved."
    })
  }) : null, screen === "archive" ? /*#__PURE__*/React.createElement(ArchiveScreen, {
    onNavigate: go
  }) : null, screen === "subscribe" ? /*#__PURE__*/React.createElement(SubscribeScreen, {
    onNavigate: go,
    onToast: () => fireToast({
      tone: "success",
      title: "You're on the list",
      body: "The next letter goes out on the first."
    })
  }) : null, /*#__PURE__*/React.createElement(Footer, {
    onNavigate: go
  }), /*#__PURE__*/React.createElement(Dialog, {
    open: dialog,
    eyebrow: "The letter",
    title: "One letter a month",
    onClose: () => setDialog(false),
    width: 460,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setDialog(false)
    }, "Not now"), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      onClick: () => {
        setDialog(false);
        go("subscribe");
      }
    }, "Sounds good"))
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: "none"
    }
  }, "What I'm making, what I got wrong, and one thing worth your Saturday. It's free, and unsubscribing takes one click.")), toast ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 24,
      bottom: 24,
      zIndex: 1000
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: toast.tone,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }),
    title: toast.title,
    onClose: () => setToast(null)
  }, toast.body)) : null);
}
Object.assign(window, {
  JournalApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/JournalApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/JournalApp.sa.jsx
try { (() => {
function JournalApp() {
  const [screen, setScreen] = React.useState("home");
  const [dialog, setDialog] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const go = s => {
    setScreen(s);
    window.scrollTo({
      top: 0
    });
  };
  const fireToast = t => {
    setToast(t);
    setTimeout(() => setToast(null), 3200);
  };
  const NAV = [{
    value: "home",
    label: "Latest"
  }, {
    value: "article",
    label: "Writing"
  }, {
    value: "archive",
    label: "Archive"
  }, {
    value: "subscribe",
    label: "The letter"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: "100vh",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement(Masthead, {
    logoSrc: window.__resources.wordmark,
    tagline: "Blog & podcast",
    items: NAV,
    active: screen,
    onNavigate: go,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "sm",
      onClick: () => setDialog(true)
    }, "Get the letter")
  })), screen === "home" ? /*#__PURE__*/React.createElement(HomeScreen, {
    onNavigate: go,
    onSubscribe: () => setDialog(true)
  }) : null, screen === "article" ? /*#__PURE__*/React.createElement(ArticleScreen, {
    onNavigate: go,
    onToast: () => fireToast({
      tone: "success",
      title: "Saved",
      body: "It'll be waiting under Saved."
    })
  }) : null, screen === "archive" ? /*#__PURE__*/React.createElement(ArchiveScreen, {
    onNavigate: go
  }) : null, screen === "subscribe" ? /*#__PURE__*/React.createElement(SubscribeScreen, {
    onNavigate: go,
    onToast: () => fireToast({
      tone: "success",
      title: "You're on the list",
      body: "The next letter goes out on the first."
    })
  }) : null, /*#__PURE__*/React.createElement(Footer, {
    onNavigate: go
  }), /*#__PURE__*/React.createElement(Dialog, {
    open: dialog,
    eyebrow: "The letter",
    title: "One letter a month",
    onClose: () => setDialog(false),
    width: 460,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setDialog(false)
    }, "Not now"), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      onClick: () => {
        setDialog(false);
        go("subscribe");
      }
    }, "Sounds good"))
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: "none"
    }
  }, "What I'm making, what I got wrong, and one thing worth your Saturday. It's free, and unsubscribing takes one click.")), toast ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      left: 24,
      bottom: 24,
      zIndex: 1000
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: toast.tone,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }),
    title: toast.title,
    onClose: () => setToast(null)
  }, toast.body)) : null);
}
Object.assign(window, {
  JournalApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/JournalApp.sa.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/Shared.jsx
try { (() => {
const {
  Button,
  IconButton,
  Icon,
  Badge,
  Tag,
  Card,
  Masthead,
  Tabs,
  Input,
  Field,
  Checkbox,
  Radio,
  Switch,
  Select,
  Textarea,
  Dialog,
  Toast,
  Tooltip
} = window.TimberInkDesignSystem_53a136;
const A = "../../assets/";

/* A plate stands in for photography that isn't on file yet. */
function MediaPlate({
  height = 190,
  tone = "forest",
  caption,
  engraving = false,
  style
}) {
  const bg = tone === "forest" ? "var(--wash-forest)" : tone === "cream" ? "linear-gradient(160deg,var(--cream-300),var(--cream-400))" : "linear-gradient(150deg,var(--teal-800),var(--teal-600))";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height,
      background: bg,
      overflow: "hidden",
      ...style
    }
  }, tone === "cream" ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--vignette)"
    }
  }), engraving ? /*#__PURE__*/React.createElement("img", {
    src: A + "engraving-moose-puffin.png",
    alt: "",
    style: {
      position: "absolute",
      right: -18,
      bottom: -14,
      height: height * 1.05,
      opacity: tone === "cream" ? 0.9 : 0.55,
      filter: tone === "cream" ? "none" : "var(--engraving-filter)"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: tone === "cream" ? "var(--fog-veil)" : "var(--fog-veil-dark)",
      opacity: 0.9
    }
  }), caption ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 14,
      bottom: 12,
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: tone === "cream" ? "var(--text-on-paper)" : "var(--text-on-dark-muted)"
    }
  }, caption) : null);
}
function SectionHead({
  eyebrow,
  title,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "var(--space-8)",
      paddingBottom: "var(--space-5)",
      borderBottom: "var(--border-ink)",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: 6
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)"
    }
  }, title)), action);
}
function Footer({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--teal-900)",
      color: "var(--text-on-dark)",
      padding: "var(--space-12) var(--gutter-page) var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
      gap: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: A + "logo-wordmark-reverse.png",
    alt: "Timber & Ink",
    style: {
      height: 30,
      filter: "var(--logo-filter)"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-on-dark-muted)",
      marginTop: "var(--space-5)",
      maxWidth: "34ch"
    }
  }, "A blog and podcast about craft, margin, and paying attention. Written in Tulsa, Oklahoma.")), [["The writing", ["Latest", "Archive", "Field notes", "About"]], ["The podcast", ["Episodes", "Guests", "Transcripts", "Where to listen"]], ["Elsewhere", ["The letter", "Contact", "Support the work", "Terms"]]].map(function (col) {
    return /*#__PURE__*/React.createElement("div", {
      key: col[0]
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--brass-400)",
        marginBottom: "var(--space-5)"
      }
    }, col[0]), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)"
      }
    }, col[1].map(function (l) {
      return /*#__PURE__*/React.createElement("span", {
        key: l,
        onClick: () => onNavigate && onNavigate("archive"),
        style: {
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--cream-200)",
          cursor: "pointer"
        }
      }, l);
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "var(--space-10) auto 0",
      paddingTop: "var(--space-6)",
      borderTop: "1px solid var(--border-on-dark)",
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-on-dark-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Timber & Ink"), /*#__PURE__*/React.createElement("span", null, "More slow stories")));
}
const ARTICLES = [{
  id: 1,
  eyebrow: "Slow living",
  title: "The slow joy of loose-leaf tea",
  meta: "Joshua Davis · 9 min",
  dek: "Four minutes of waiting, and what I've started noticing in them.",
  tone: "forest",
  tag: "Slow living"
}, {
  id: 2,
  eyebrow: "Field note",
  title: "Fog sat in the yard until nine",
  meta: "03.14 · Tulsa",
  dek: "Some mornings the day asks you to wait for it.",
  tone: "teal",
  tag: "Field notes"
}, {
  id: 3,
  eyebrow: "Hand skills",
  title: "Sharpening a knife my grandfather ruined",
  meta: "Joshua Davis · 6 min",
  dek: "Flatten the back first — everything after that is bookkeeping.",
  tone: "cream",
  tag: "Hand skills"
}, {
  id: 4,
  eyebrow: "Podcast",
  title: "Episode 12 — Margin",
  meta: "22 min",
  dek: "On the space you leave at the edge of a page, and of a week.",
  tone: "forest",
  tag: "Episodes"
}, {
  id: 5,
  eyebrow: "Fatherhood",
  title: "Reading aloud past bedtime",
  meta: "Joshua Davis · 12 min",
  dek: "The chapter always ends later than I mean it to.",
  tone: "teal",
  tag: "Fatherhood"
}, {
  id: 6,
  eyebrow: "Workshop",
  title: "A bench for a garage you rent",
  meta: "Joshua Davis · 7 min",
  dek: "Bolted, not glued — so it leaves when you do.",
  tone: "cream",
  tag: "Hand skills"
}];
Object.assign(window, {
  MediaPlate,
  SectionHead,
  Footer,
  ARTICLES,
  A,
  Button,
  IconButton,
  Icon,
  Badge,
  Tag,
  Card,
  Masthead,
  Tabs,
  Input,
  Field,
  Checkbox,
  Radio,
  Switch,
  Select,
  Textarea,
  Dialog,
  Toast,
  Tooltip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/Shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/Shared.sa.jsx
try { (() => {
const {
  Button,
  IconButton,
  Icon,
  Badge,
  Tag,
  Card,
  Masthead,
  Tabs,
  Input,
  Field,
  Checkbox,
  Radio,
  Switch,
  Select,
  Textarea,
  Dialog,
  Toast,
  Tooltip
} = window.TimberInkDesignSystem_53a136;
const A = "../../assets/";

/* A plate stands in for photography that isn't on file yet. */
function MediaPlate({
  height = 190,
  tone = "forest",
  caption,
  engraving = false,
  style
}) {
  const bg = tone === "forest" ? "var(--wash-forest)" : tone === "cream" ? "linear-gradient(160deg,var(--cream-300),var(--cream-400))" : "linear-gradient(150deg,var(--teal-800),var(--teal-600))";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height,
      background: bg,
      overflow: "hidden",
      ...style
    }
  }, tone === "cream" ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--vignette)"
    }
  }), engraving ? /*#__PURE__*/React.createElement("img", {
    src: window.__resources.engraving,
    alt: "",
    style: {
      position: "absolute",
      right: -18,
      bottom: -14,
      height: height * 1.05,
      opacity: tone === "cream" ? 0.9 : 0.55,
      filter: tone === "cream" ? "none" : "var(--engraving-filter)"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: tone === "cream" ? "var(--fog-veil)" : "var(--fog-veil-dark)",
      opacity: 0.9
    }
  }), caption ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 14,
      bottom: 12,
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: tone === "cream" ? "var(--text-on-paper)" : "var(--text-on-dark-muted)"
    }
  }, caption) : null);
}
function SectionHead({
  eyebrow,
  title,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "var(--space-8)",
      paddingBottom: "var(--space-5)",
      borderBottom: "var(--border-ink)",
      marginBottom: "var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-ui)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-accent)",
      marginBottom: 6
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: "var(--text-2xl)"
    }
  }, title)), action);
}
function Footer({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--teal-900)",
      color: "var(--text-on-dark)",
      padding: "var(--space-12) var(--gutter-page) var(--space-9)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
      gap: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: window.__resources.wordmark,
    alt: "Timber & Ink",
    style: {
      height: 30,
      filter: "var(--logo-filter)"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-on-dark-muted)",
      marginTop: "var(--space-5)",
      maxWidth: "34ch"
    }
  }, "A blog and podcast about craft, margin, and paying attention. Written in Tulsa, Oklahoma.")), [["The writing", ["Latest", "Archive", "Field notes", "About"]], ["The podcast", ["Episodes", "Guests", "Transcripts", "Where to listen"]], ["Elsewhere", ["The letter", "Contact", "Support the work", "Terms"]]].map(function (col) {
    return /*#__PURE__*/React.createElement("div", {
      key: col[0]
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-ui)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--brass-400)",
        marginBottom: "var(--space-5)"
      }
    }, col[0]), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)"
      }
    }, col[1].map(function (l) {
      return /*#__PURE__*/React.createElement("span", {
        key: l,
        onClick: () => onNavigate && onNavigate("archive"),
        style: {
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          color: "var(--cream-200)",
          cursor: "pointer"
        }
      }, l);
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-page)",
      margin: "var(--space-10) auto 0",
      paddingTop: "var(--space-6)",
      borderTop: "1px solid var(--border-on-dark)",
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-on-dark-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Timber & Ink"), /*#__PURE__*/React.createElement("span", null, "More slow stories")));
}
const ARTICLES = [{
  id: 1,
  eyebrow: "Slow living",
  title: "The slow joy of loose-leaf tea",
  meta: "Joshua Davis · 9 min",
  dek: "Four minutes of waiting, and what I've started noticing in them.",
  tone: "forest",
  tag: "Slow living"
}, {
  id: 2,
  eyebrow: "Field note",
  title: "Fog sat in the yard until nine",
  meta: "03.14 · Tulsa",
  dek: "Some mornings the day asks you to wait for it.",
  tone: "teal",
  tag: "Field notes"
}, {
  id: 3,
  eyebrow: "Hand skills",
  title: "Sharpening a knife my grandfather ruined",
  meta: "Joshua Davis · 6 min",
  dek: "Flatten the back first — everything after that is bookkeeping.",
  tone: "cream",
  tag: "Hand skills"
}, {
  id: 4,
  eyebrow: "Podcast",
  title: "Episode 12 — Margin",
  meta: "22 min",
  dek: "On the space you leave at the edge of a page, and of a week.",
  tone: "forest",
  tag: "Episodes"
}, {
  id: 5,
  eyebrow: "Fatherhood",
  title: "Reading aloud past bedtime",
  meta: "Joshua Davis · 12 min",
  dek: "The chapter always ends later than I mean it to.",
  tone: "teal",
  tag: "Fatherhood"
}, {
  id: 6,
  eyebrow: "Workshop",
  title: "A bench for a garage you rent",
  meta: "Joshua Davis · 7 min",
  dek: "Bolted, not glued — so it leaves when you do.",
  tone: "cream",
  tag: "Hand skills"
}];
Object.assign(window, {
  MediaPlate,
  SectionHead,
  Footer,
  ARTICLES,
  A,
  Button,
  IconButton,
  Icon,
  Badge,
  Tag,
  Card,
  Masthead,
  Tabs,
  Input,
  Field,
  Checkbox,
  Radio,
  Switch,
  Select,
  Textarea,
  Dialog,
  Toast,
  Tooltip
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/Shared.sa.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/SubscribeScreen.jsx
try { (() => {
function SubscribeScreen({
  onNavigate,
  onToast
}) {
  const [plan, setPlan] = React.useState("letter");
  const [notes, setNotes] = React.useState(false);
  const [err, setErr] = React.useState("");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980,
      margin: "0 auto",
      padding: "var(--space-11) var(--gutter-page) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A + "logo-hobby-journal.png",
    alt: "Timber & Ink",
    style: {
      height: 64,
      filter: "var(--engraving-filter)"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-6) auto 0",
      maxWidth: "44ch",
      fontSize: "var(--text-md)",
      color: "var(--text-muted)"
    }
  }, "One letter a month. Sometimes two, if something's worth it. Unsubscribe any time \u2014 one click, no hard feelings.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: "var(--space-10)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "paper",
    padding: "var(--pad-card-lg)",
    title: "Where should I send it?"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      marginTop: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "First name"
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Joshua"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    required: true,
    error: err,
    hint: err ? undefined : "Only for the letter. I don't share it, and I don't send anything else."
  }, /*#__PURE__*/React.createElement(Input, {
    invalid: Boolean(err),
    placeholder: "joshua@example.com",
    onChange: () => setErr("")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Anything you'd like me to write about?",
    hint: "Optional, and I do read these."
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 3,
    placeholder: "I've been trying to slow my Saturdays down and I don't know where to start."
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Where would you like to start?"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["The latest letter", "Episode 12 — Margin", "Start at the beginning"]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      paddingTop: "var(--space-3)",
      borderTop: "1px solid var(--border-hairline)"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Send the podcast notes too",
    description: "A short email when a new episode goes up.",
    checked: notes,
    onChange: setNotes
  }), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Let me know when something new is posted"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    fullWidth: true,
    onClick: () => {
      if (!notes) {
        setErr("I'll need an email address to send it to.");
      } else if (onToast) onToast();
    }
  }, "Send me the letter"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "brass",
    padding: "var(--pad-card-lg)",
    eyebrow: "If you'd like to help",
    title: "Free, or a little more"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    value: plan,
    onChange: setPlan,
    options: [{
      value: "letter",
      label: "The letter — free",
      description: "Everything I write, in your inbox. This is the whole thing."
    }, {
      value: "supporter",
      label: "Supporter — $6 a month",
      description: "Keeps the hosting on and the microphone plugged in."
    }, {
      value: "patron",
      label: "Patron — $60 a year",
      description: "The same, and a note from me at the start of the year."
    }]
  }))), /*#__PURE__*/React.createElement(Card, {
    tone: "forest",
    padding: "var(--pad-card-lg)",
    eyebrow: "What arrives",
    title: "One letter, no advertising",
    meta: "Written at a kitchen table in Tulsa"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "var(--space-4) 0 0",
      paddingLeft: 18,
      color: "var(--cream-200)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, /*#__PURE__*/React.createElement("li", null, "The month's long piece, before it goes online"), /*#__PURE__*/React.createElement("li", null, "A few field notes \u2014 short, and sometimes just a photograph"), /*#__PURE__*/React.createElement("li", null, "One thing I read, made, or got wrong"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "outline"
  }, "Since 2019"), /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "Free"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-quiet)"
    }
  }, "2,140 readers")))));
}
Object.assign(window, {
  SubscribeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/SubscribeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/journal_web/SubscribeScreen.sa.jsx
try { (() => {
function SubscribeScreen({
  onNavigate,
  onToast
}) {
  const [plan, setPlan] = React.useState("letter");
  const [notes, setNotes] = React.useState(false);
  const [err, setErr] = React.useState("");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980,
      margin: "0 auto",
      padding: "var(--space-11) var(--gutter-page) var(--space-12)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources.lockup,
    alt: "Timber & Ink",
    style: {
      height: 64,
      filter: "var(--engraving-filter)"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-6) auto 0",
      maxWidth: "44ch",
      fontSize: "var(--text-md)",
      color: "var(--text-muted)"
    }
  }, "One letter a month. Sometimes two, if something's worth it. Unsubscribe any time \u2014 one click, no hard feelings.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: "var(--space-10)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "paper",
    padding: "var(--pad-card-lg)",
    title: "Where should I send it?"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-6)",
      marginTop: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "First name"
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Joshua"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    required: true,
    error: err,
    hint: err ? undefined : "Only for the letter. I don't share it, and I don't send anything else."
  }, /*#__PURE__*/React.createElement(Input, {
    invalid: Boolean(err),
    placeholder: "joshua@example.com",
    onChange: () => setErr("")
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Anything you'd like me to write about?",
    hint: "Optional, and I do read these."
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 3,
    placeholder: "I've been trying to slow my Saturdays down and I don't know where to start."
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Where would you like to start?"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["The latest letter", "Episode 12 — Margin", "Start at the beginning"]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      paddingTop: "var(--space-3)",
      borderTop: "1px solid var(--border-hairline)"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Send the podcast notes too",
    description: "A short email when a new episode goes up.",
    checked: notes,
    onChange: setNotes
  }), /*#__PURE__*/React.createElement(Switch, {
    defaultChecked: true,
    label: "Let me know when something new is posted"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    fullWidth: true,
    onClick: () => {
      if (!notes) {
        setErr("I'll need an email address to send it to.");
      } else if (onToast) onToast();
    }
  }, "Send me the letter"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-7)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "brass",
    padding: "var(--pad-card-lg)",
    eyebrow: "If you'd like to help",
    title: "Free, or a little more"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    value: plan,
    onChange: setPlan,
    options: [{
      value: "letter",
      label: "The letter — free",
      description: "Everything I write, in your inbox. This is the whole thing."
    }, {
      value: "supporter",
      label: "Supporter — $6 a month",
      description: "Keeps the hosting on and the microphone plugged in."
    }, {
      value: "patron",
      label: "Patron — $60 a year",
      description: "The same, and a note from me at the start of the year."
    }]
  }))), /*#__PURE__*/React.createElement(Card, {
    tone: "forest",
    padding: "var(--pad-card-lg)",
    eyebrow: "What arrives",
    title: "One letter, no advertising",
    meta: "Written at a kitchen table in Tulsa"
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "var(--space-4) 0 0",
      paddingLeft: 18,
      color: "var(--cream-200)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, /*#__PURE__*/React.createElement("li", null, "The month's long piece, before it goes online"), /*#__PURE__*/React.createElement("li", null, "A few field notes \u2014 short, and sometimes just a photograph"), /*#__PURE__*/React.createElement("li", null, "One thing I read, made, or got wrong"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "outline"
  }, "Since 2019"), /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "Free"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-quiet)"
    }
  }, "2,140 readers")))));
}
Object.assign(window, {
  SubscribeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/journal_web/SubscribeScreen.sa.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Masthead = __ds_scope.Masthead;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
