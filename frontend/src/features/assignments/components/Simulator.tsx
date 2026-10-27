import { ArrowDownOutlined, ArrowUpOutlined, CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Input, InputNumber, Radio, Table, Tag } from 'antd';
import { useState } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import { tokens } from '@/app/tokens';
import type { ChronologyEvent, MapPlace, SimulatorAnswer, SimulatorConfig, SimulatorResult } from '@/types/api';

/**
 * 6-modul «raqamli simulyator»: xronologik tartiblash va xaritada belgilash.
 * O'qituvchi to'g'ri javoblarni kiritadi; talaba interaktiv bajaradi; topshirilganda server avtomatik tekshiradi.
 */

const CENTER: [number, number] = [40.5, 64.5];
const TILE = { attribution: '&copy; OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' };
/** Talaba topshirig'i uchun: shahar va joy nomlari yozilmagan qatlam — aks holda xarita javobni ochib qo'yadi */
const TILE_NO_LABELS = {
  attribution: 'Tiles &copy; Esri — US National Park Service',
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
  maxNativeZoom: 8,
};
const newId = () => Math.random().toString(36).slice(2, 8);

const ClickCatcher = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onClick(Math.round(e.latlng.lat * 10000) / 10000, Math.round(e.latlng.lng * 10000) / 10000) });
  return null;
};

export const simulatorKindFor = (type: string): SimulatorConfig['kind'] | null =>
  type === 'CHRONOLOGY' ? 'CHRONOLOGY' : type === 'MAP_IDENTIFICATION' ? 'MAP' : null;

export const emptySimulator = (kind: SimulatorConfig['kind']): SimulatorConfig =>
  kind === 'CHRONOLOGY' ? { kind, events: [] } : { kind, toleranceKm: 50, places: [] };

// ───────────────────────── O'qituvchi: muharrir ─────────────────────────

export const SimulatorEditor = ({ value, onChange }: { value: SimulatorConfig; onChange: (v: SimulatorConfig) => void }) => {
  const [active, setActive] = useState(0);
  if (value.kind === 'CHRONOLOGY') {
    const events = value.events;
    const set = (i: number, patch: Partial<ChronologyEvent>) => onChange({ ...value, events: events.map((e, j) => (j === i ? { ...e, ...patch } : e)) });
    return (
      <div className="space-y-2">
        <p className="m-0 text-sm text-muted">Voqealarni istalgan tartibda kiriting — talabaga ular aralashtirilgan holda, yillarsiz ko‘rsatiladi.</p>
        {events.map((e, i) => (
          <div key={e.id} className="flex items-center gap-2">
            <span className="w-6 text-right text-sm text-muted">{i + 1}.</span>
            <Input aria-label={`${i + 1}-voqea`} value={e.text} placeholder="Voqea" onChange={(ev) => set(i, { text: ev.target.value })} />
            <InputNumber aria-label={`${i + 1}-voqea yili`} className="w-28 shrink-0" value={e.year} placeholder="Yil" onChange={(y) => set(i, { year: y ?? undefined })} />
            <Button danger icon={<DeleteOutlined />} aria-label="Voqeani o‘chirish" onClick={() => onChange({ ...value, events: events.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <Button icon={<PlusOutlined />} onClick={() => onChange({ ...value, events: [...events, { id: newId(), text: '', year: undefined }] })}>Voqea qo‘shish</Button>
      </div>
    );
  }
  const places = value.places;
  const set = (i: number, patch: Partial<MapPlace>) => onChange({ ...value, places: places.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>Ruxsat etilgan xato:</span>
        <InputNumber aria-label="Ruxsat etilgan masofa" min={1} max={1000} value={value.toleranceKm} onChange={(v) => onChange({ ...value, toleranceKm: v ?? 50 })} suffix="km" className="w-36" />
        <span className="text-muted">Joyni tanlab, xaritani bosing — koordinata o‘zi yoziladi.</span>
      </div>
      {places.map((p, i) => (
        <div key={p.id} className={`flex flex-wrap items-center gap-2 rounded-md p-1 ${i === active ? 'bg-primary-soft' : ''}`}>
          <Radio checked={i === active} onChange={() => setActive(i)} aria-label={`${i + 1}-joyni xaritada belgilash`} />
          <Input aria-label={`${i + 1}-joy nomi`} className="min-w-[160px] flex-1" value={p.label} placeholder="Joy yoki voqea nomi" onChange={(e) => set(i, { label: e.target.value })} />
          <InputNumber aria-label="Kenglik" className="w-28" value={p.lat} placeholder="Kenglik" onChange={(v) => set(i, { lat: v ?? undefined })} />
          <InputNumber aria-label="Uzunlik" className="w-28" value={p.lng} placeholder="Uzunlik" onChange={(v) => set(i, { lng: v ?? undefined })} />
          <Button danger icon={<DeleteOutlined />} aria-label="Joyni o‘chirish" onClick={() => onChange({ ...value, places: places.filter((_, j) => j !== i) })} />
        </div>
      ))}
      <Button icon={<PlusOutlined />} onClick={() => { onChange({ ...value, places: [...places, { id: newId(), label: '' }] }); setActive(places.length); }}>Joy qo‘shish</Button>
      <MapContainer center={CENTER} zoom={5} scrollWheelZoom className="h-[360px] w-full rounded-lg">
        <TileLayer {...TILE} />
        <ClickCatcher onClick={(lat, lng) => places[active] && set(active, { lat, lng })} />
        {places.filter((p) => p.lat !== undefined && p.lng !== undefined).map((p) => (
          <CircleMarker key={p.id} center={[p.lat!, p.lng!]} radius={8} pathOptions={{ color: tokens.color.primary, fillOpacity: 0.8 }}>
            <Tooltip permanent direction="top">{p.label || '—'}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

/** Saqlashdan oldin to'liqlik tekshiruvi (serverdagi zod sxemasiga mos) */
export const simulatorProblems = (s: SimulatorConfig): string[] => {
  if (s.kind === 'CHRONOLOGY') {
    const p: string[] = [];
    if (s.events.length < 3) p.push('Kamida 3 ta voqea kiriting');
    if (s.events.some((e) => e.text.trim().length < 2 || e.year === undefined)) p.push('Har bir voqeaning matni va yilini kiriting');
    return p;
  }
  const p: string[] = [];
  if (s.places.length < 2) p.push('Kamida 2 ta joy kiriting');
  if (s.places.some((x) => x.label.trim().length < 2 || x.lat === undefined || x.lng === undefined)) p.push('Har bir joyning nomi va koordinatasini kiriting');
  return p;
};

// ───────────────────────── Talaba: topshiriq ─────────────────────────

export const SimulatorTask = ({
  config, answer, onChange, disabled,
}: { config: SimulatorConfig; answer: SimulatorAnswer | null | undefined; onChange: (a: SimulatorAnswer) => void; disabled?: boolean }) =>
  config.kind === 'CHRONOLOGY' ? (
    <ChronologyTask events={config.events} order={answer && 'order' in answer ? answer.order : null} onChange={(order) => onChange({ order })} disabled={disabled} />
  ) : (
    <MapTask places={config.places} placements={answer && 'placements' in answer ? answer.placements : {}} onChange={(placements) => onChange({ placements })} disabled={disabled} />
  );

const ChronologyTask = ({
  events, order, onChange, disabled,
}: { events: ChronologyEvent[]; order: string[] | null; onChange: (o: string[]) => void; disabled?: boolean }) => {
  const ids = order && order.length === events.length ? order : events.map((e) => e.id);
  const byId = new Map(events.map((e) => [e.id, e]));
  const move = (i: number, to: number) => {
    const next = [...ids];
    const [x] = next.splice(i, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  return (
    <div>
      <p className="mb-3 mt-0 text-sm text-muted">Voqealarni eng qadimgisidan eng keyingisigacha tartiblang (↑ ↓ tugmalari bilan).</p>
      <ol className="m-0 list-none space-y-2 p-0">
        {ids.map((id, i) => (
          <li key={id} className="flex items-center gap-3 rounded-lg border border-solid border-line bg-canvas px-3 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{i + 1}</span>
            <span className="min-w-0 flex-1">{byId.get(id)?.text}</span>
            {!disabled && (
              <span className="flex shrink-0 gap-1">
                <Button size="small" icon={<ArrowUpOutlined />} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`«${byId.get(id)?.text}» ni yuqoriga`} />
                <Button size="small" icon={<ArrowDownOutlined />} disabled={i === ids.length - 1} onClick={() => move(i, i + 1)} aria-label={`«${byId.get(id)?.text}» ni pastga`} />
              </span>
            )}
          </li>
        ))}
      </ol>
      {!disabled && !order && <Button className="mt-3" onClick={() => onChange(ids)}>Shu tartibni tasdiqlash</Button>}
    </div>
  );
};

const MapTask = ({
  places, placements, onChange, disabled,
}: { places: MapPlace[]; placements: Record<string, { lat: number; lng: number }>; onChange: (p: Record<string, { lat: number; lng: number }>) => void; disabled?: boolean }) => {
  const [active, setActive] = useState(places[0]?.id);
  const done = places.filter((p) => placements[p.id]).length;
  return (
    <div className="space-y-3">
      <p className="m-0 text-sm text-muted">Nomni tanlang va uni xaritadagi joyiga bosing. Joylashtirildi: {done}/{places.length}</p>
      {!disabled && (
        <Radio.Group value={active} onChange={(e) => setActive(e.target.value)} optionType="button" className="flex flex-wrap gap-y-2">
          {places.map((p) => (
            <Radio.Button key={p.id} value={p.id}>{placements[p.id] ? '✓ ' : ''}{p.label}</Radio.Button>
          ))}
        </Radio.Group>
      )}
      <MapContainer center={CENTER} zoom={5} scrollWheelZoom className="h-[420px] w-full rounded-lg">
        <TileLayer {...TILE_NO_LABELS} />
        {!disabled && <ClickCatcher onClick={(lat, lng) => active && onChange({ ...placements, [active]: { lat, lng } })} />}
        {places.filter((p) => placements[p.id]).map((p) => (
          <CircleMarker key={p.id} center={[placements[p.id].lat, placements[p.id].lng]} radius={8} pathOptions={{ color: p.id === active ? tokens.color.accent : tokens.color.primary, fillOpacity: 0.85 }}>
            <Tooltip permanent direction="top">{p.label}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

// ───────────────────────── Natija (o'qituvchi; baholangandan keyin talaba) ─────────────────────────

export const SimulatorResultView = ({ result, config }: { result: SimulatorResult; config?: SimulatorConfig | null }) => {
  const isMap = config?.kind === 'MAP' || result.toleranceKm !== undefined;
  const ok = (c: boolean) => (c ? <CheckCircleTwoTone twoToneColor="#2f7d4f" /> : <CloseCircleTwoTone twoToneColor="#b42318" />);
  return (
    <div className="space-y-3">
      <Alert
        type={result.score >= 80 ? 'success' : result.score >= 55 ? 'warning' : 'error'}
        showIcon
        message={`Avtomatik tekshiruv: ${result.correct}/${result.total} to‘g‘ri (${result.score}%)`}
        description="Bu natija o‘qituvchi uchun tavsiya. Yakuniy baho mezonlar asosida o‘qituvchi tomonidan qo‘yiladi."
      />
      {isMap ? (
        <>
          <MapContainer center={CENTER} zoom={5} scrollWheelZoom className="h-[360px] w-full rounded-lg">
            <TileLayer {...TILE} />
            {result.details.map((d) => (
              <span key={d.id}>
                <CircleMarker center={[d.lat!, d.lng!]} radius={7} pathOptions={{ color: '#2f7d4f', fillOpacity: 0.9 }}>
                  <Tooltip direction="top">{d.label} — to‘g‘ri joy</Tooltip>
                </CircleMarker>
                {d.placed && (
                  <>
                    <CircleMarker center={[d.placed.lat, d.placed.lng]} radius={7} pathOptions={{ color: d.correct ? '#2f7d4f' : '#b42318', dashArray: '3', fillOpacity: 0.4 }}>
                      <Tooltip direction="bottom">{d.label} — talaba belgisi</Tooltip>
                    </CircleMarker>
                    <Polyline positions={[[d.lat!, d.lng!], [d.placed.lat, d.placed.lng]]} pathOptions={{ color: '#888', dashArray: '4' }} />
                  </>
                )}
              </span>
            ))}
          </MapContainer>
          <Table
            size="small"
            rowKey="id"
            pagination={false}
            dataSource={result.details}
            columns={[
              { title: '', width: 36, render: (_, d) => ok(d.correct) },
              { title: 'Joy', dataIndex: 'label' },
              { title: 'Farq', width: 120, render: (_, d) => (d.distanceKm == null ? '—' : `${d.distanceKm} km`) },
            ]}
            footer={() => <span className="text-sm text-muted">Ruxsat etilgan xato: {result.toleranceKm} km</span>}
          />
        </>
      ) : (
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={result.details}
          columns={[
            { title: '', width: 36, render: (_, d) => ok(d.correct) },
            { title: '№', width: 50, dataIndex: 'position' },
            { title: 'Voqea (talaba tartibi)', dataIndex: 'text' },
            { title: 'Yil', width: 80, render: (_, d) => <Tag className="m-0">{d.year}</Tag> },
          ]}
        />
      )}
    </div>
  );
};
