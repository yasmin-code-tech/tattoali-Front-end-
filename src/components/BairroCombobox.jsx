import { useState, useEffect, useMemo, useRef } from "react";

function normalizeSearch(s) {
  return String(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/**
 * Lista de bairros ordenada (pt-BR) + campo digitável com sugestões.
 */
export default function BairroCombobox({
  options = [],
  valueId = "",
  onChangeId,
  label,
  hint,
  placeholder = "Digite para buscar o bairro…",
  labelClassName = "block text-sm font-medium text-white mb-2",
  inputClassName = "input-field w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600",
}) {
  const sorted = useMemo(
    () =>
      [...options].sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || "", "pt-BR", {
          sensitivity: "base",
        })
      ),
    [options]
  );

  const selected = useMemo(
    () => sorted.find((b) => String(b.id) === String(valueId)),
    [sorted, valueId]
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const wrapRef = useRef(null);
  const blurTimer = useRef(null);
  const valueIdRef = useRef(valueId);
  const selectedRef = useRef(selected);
  valueIdRef.current = valueId;
  selectedRef.current = selected;

  useEffect(() => {
    if (!menuOpen) {
      setSearchText(selected?.nome ?? "");
    }
  }, [selected?.nome, menuOpen, valueId]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(searchText.trim());
    if (!q) return sorted;
    return sorted.filter((b) => normalizeSearch(b.nome).includes(q));
  }, [sorted, searchText]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onFocusInput = () => {
    if (blurTimer.current) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
    setMenuOpen(true);
  };

  const onBlurInput = () => {
    blurTimer.current = window.setTimeout(() => {
      setMenuOpen(false);
      if (valueIdRef.current) {
        setSearchText(selectedRef.current?.nome ?? "");
      } else {
        setSearchText("");
      }
    }, 200);
  };

  const onInputChange = (e) => {
    const v = e.target.value;
    setSearchText(v);
    setMenuOpen(true);
    if (!v.trim()) {
      onChangeId("");
      return;
    }
    const sel = selectedRef.current;
    if (sel && normalizeSearch(sel.nome) !== normalizeSearch(v)) {
      onChangeId("");
    }
  };

  const onPick = (b) => {
    onChangeId(String(b.id));
    setSearchText(b.nome);
    setMenuOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setMenuOpen(false);
      e.preventDefault();
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      {label ? <label className={labelClassName}>{label}</label> : null}
      <input
        type="text"
        role="combobox"
        aria-expanded={menuOpen}
        aria-autocomplete="list"
        autoComplete="off"
        value={searchText}
        onChange={onInputChange}
        onFocus={onFocusInput}
        onBlur={onBlurInput}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={inputClassName}
      />
      {menuOpen && (
        <ul
          role="listbox"
          className="absolute z-[60] mt-1 max-h-56 w-full overflow-auto rounded-lg border border-gray-600 bg-gray-900 py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">Nenhum bairro encontrado</li>
          ) : (
            filtered.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={String(b.id) === String(valueId)}
                  className="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(b)}
                >
                  {b.nome}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
