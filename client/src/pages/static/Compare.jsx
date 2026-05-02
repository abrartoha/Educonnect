import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GitCompare,
  X,
  Plus,
  Search,
  Star,
  MapPin,
  GraduationCap,
  Building2,
  Users,
  Globe2,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { directoryApi } from '../../api/endpoints';
import { useApiResource } from '../../hooks/useApiResource';
import { normaliseDirectoryItem } from '../../api/mappers';

const MAX_SLOTS = 3;

// Formatter helpers ---------------------------------------------------------
const fmt = (v, fallback = '—') =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
    ? fallback
    : v;

const formatTuition = (t) => {
  if (!t || !t.min || !t.max) return '—';
  return `$${Number(t.min).toLocaleString()} – $${Number(t.max).toLocaleString()} ${t.currency || 'AUD'}/yr`;
};

const formatStudentCount = (n) => (n ? `${Math.round(n / 1000)}k` : '—');

// Attribute rows we compare — label, accessor, and a formatter.
const ROWS = [
  { label: 'Location', icon: MapPin, get: (u) => fmt(u.location) },
  { label: 'Type', icon: Building2, get: (u) => fmt(u.type) },
  { label: 'Founded', icon: Calendar, get: (u) => fmt(u.foundedYear) },
  {
    label: 'Global ranking',
    icon: Star,
    get: (u) => (u.ranking ? `#${u.ranking}` : '—'),
  },
  { label: 'Students', icon: Users, get: (u) => formatStudentCount(u.studentCount) },
  {
    label: 'International',
    icon: Globe2,
    get: (u) => (u.internationalPct ? `${u.internationalPct}%` : '—'),
  },
  {
    label: 'Tuition (international)',
    icon: GraduationCap,
    get: (u) => formatTuition(u.tuitionRange),
  },
  {
    label: 'Rating',
    icon: Star,
    get: (u) =>
      u.rating ? `${Number(u.rating).toFixed(1)} ★ (${u.reviewCount})` : '—',
  },
  {
    label: 'Intakes',
    icon: Calendar,
    get: (u) => fmt(u.intakes?.slice(0, 3).join(', ')),
  },
  {
    label: 'Top programs',
    icon: GraduationCap,
    get: (u) => fmt(u.courses?.slice(0, 4).join(', ')),
  },
  {
    label: 'Scholarships',
    icon: Star,
    get: (u) =>
      u.scholarships?.length ? `${u.scholarships.length} available` : '—',
  },
  {
    label: 'Facilities',
    icon: Building2,
    get: (u) => fmt(u.facilities?.slice(0, 3).join(', ')),
  },
  {
    label: 'Accreditations',
    icon: CheckCircle2,
    get: (u) => fmt(u.accreditations?.slice(0, 3).join(', ')),
  },
];

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialIds = (searchParams.get('ids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLOTS);
  const padded = [...initialIds, ...Array(MAX_SLOTS - initialIds.length).fill('')];

  const [slots, setSlots] = useState(padded);
  const [pickerForSlot, setPickerForSlot] = useState(null);

  const { data: listData } = useApiResource(
    () => directoryApi.listUniversities({ limit: 60 }),
    []
  );
  const allUnis = useMemo(
    () => (listData?.items || []).map(normaliseDirectoryItem),
    [listData]
  );

  const selectedIds = slots.filter(Boolean);
  const { data: compareData, loading: compareLoading } = useApiResource(
    () =>
      selectedIds.length >= 2
        ? directoryApi.compareUniversities(selectedIds)
        : Promise.resolve({ items: [] }),
    [selectedIds.join(',')]
  );
  const selectedUnis = useMemo(() => {
    const items = (compareData?.items || []).map(normaliseDirectoryItem);
    const byId = new Map(items.map((u) => [u.id, u]));
    return slots.map((id) => (id ? byId.get(id) || null : null));
  }, [compareData, slots]);

  // Keep the URL in sync so users can share a link like /compare?ids=a,b.
  useEffect(() => {
    if (selectedIds.length) {
      setSearchParams({ ids: selectedIds.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots.join(',')]);

  const setSlot = (index, id) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
    setPickerForSlot(null);
  };

  const clearSlot = (index) => setSlot(index, '');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary-500/20">
              <GitCompare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Compare Universities
            </h1>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
              Pick up to {MAX_SLOTS} universities to see them side by side —
              tuition, programs, rankings, and more.
            </p>
          </div>

          {/* Slot cards */}
          <div
            className="grid gap-4 mb-8"
            style={{ gridTemplateColumns: `repeat(${MAX_SLOTS}, minmax(0, 1fr))` }}
          >
            {slots.map((id, i) => {
              const uni = selectedUnis[i];
              if (!uni) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPickerForSlot(i)}
                    className="group relative flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-6 transition-all hover:border-primary-400 hover:bg-white"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 group-hover:bg-primary-50">
                      <Plus className="h-6 w-6 text-slate-400 group-hover:text-primary-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-primary-700">
                      Add a university
                    </span>
                    <span className="text-xs text-slate-400">Slot {i + 1}</span>
                  </button>
                );
              }
              return (
                <div
                  key={uni.id}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => clearSlot(i)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-center mb-3">
                    {uni.logo ? (
                      <img
                        src={uni.logo}
                        alt={uni.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-primary-100 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-primary-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-center text-lg font-bold text-slate-900 leading-tight">
                    {uni.name}
                  </h3>
                  <p className="text-center text-xs text-slate-500 mt-1">
                    {uni.shortName || uni.location}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {uni.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ) : null}
                  </div>
                  <Link
                    to={`/universities/${uni.id}`}
                    className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    View details <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          {selectedIds.length >= 2 ? (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {compareLoading ? (
                <div className="py-12 text-center text-slate-500">
                  Loading comparison…
                </div>
              ) : (
                <div
                  className="grid divide-x divide-slate-100"
                  style={{
                    gridTemplateColumns: `180px repeat(${MAX_SLOTS}, minmax(0, 1fr))`,
                  }}
                >
                  {/* Header row */}
                  <div className="bg-slate-50 p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Feature
                  </div>
                  {selectedUnis.map((uni, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-4 text-sm font-bold text-slate-700 truncate"
                    >
                      {uni?.shortName || uni?.name || '—'}
                    </div>
                  ))}

                  {/* Attribute rows */}
                  {ROWS.map((row) => (
                    <RowGroup
                      key={row.label}
                      row={row}
                      unis={selectedUnis}
                      cols={MAX_SLOTS}
                    />
                  ))}

                  {/* CTA row */}
                  <div className="bg-slate-50 p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </div>
                  {selectedUnis.map((uni, i) => (
                    <div key={i} className="bg-slate-50 p-4">
                      {uni ? (
                        <Link
                          to={`/universities/${uni.id}?enquire=true`}
                          className="inline-flex w-full items-center justify-center rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                          Send enquiry
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-12 text-center">
              <GitCompare className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-600">
                Pick at least two universities
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Use the slots above to start comparing.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {pickerForSlot !== null ? (
        <PickerModal
          universities={allUnis}
          excludeIds={slots.filter(Boolean)}
          onClose={() => setPickerForSlot(null)}
          onSelect={(uni) => setSlot(pickerForSlot, uni.id)}
        />
      ) : null}
    </div>
  );
}

// Renders a single attribute row, highlighting the "best" cell when the value
// is numeric (top rating / lowest global ranking).
function RowGroup({ row, unis, cols }) {
  const Icon = row.icon;
  const values = unis.map((u) => (u ? row.get(u) : '—'));

  const numericRating = row.label === 'Rating';
  const numericRank = row.label === 'Global ranking';

  let bestIndex = -1;
  if (numericRating || numericRank) {
    const parsed = unis.map((u) => {
      if (!u) return null;
      if (numericRating) return u.rating || 0;
      if (numericRank) return u.ranking || Infinity;
      return null;
    });
    const valid = parsed.filter((v) => v !== null && v !== Infinity);
    if (valid.length) {
      const best = numericRating ? Math.max(...valid) : Math.min(...valid);
      bestIndex = parsed.findIndex((v) => v === best);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 p-4 text-sm font-medium text-slate-700">
        <Icon className="h-4 w-4 text-slate-400" />
        {row.label}
      </div>
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className={`p-4 text-sm leading-relaxed ${
            i === bestIndex
              ? 'font-bold text-primary-700 bg-primary-50/40'
              : 'text-slate-700'
          }`}
        >
          {values[i]}
        </div>
      ))}
    </>
  );
}

function PickerModal({ universities, excludeIds, onClose, onSelect }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const available = universities.filter((u) => !excludeIds.includes(u.id));
    if (!q.trim()) return available;
    const needle = q.toLowerCase();
    return available.filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.location?.toLowerCase().includes(needle)
    );
  }, [universities, excludeIds, q]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Pick a university</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or location…"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No matching universities.
            </p>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onSelect(u)}
                className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                {u.logo ? (
                  <img
                    src={u.logo}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {u.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">{u.location}</p>
                </div>
                {u.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
