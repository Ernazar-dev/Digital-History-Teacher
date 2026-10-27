import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import type { MapFeature } from '@/services/explore.service';
import { featureKey, featureLink, featureType } from '../mapFeature';

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Marker: obyekt — o'z rasmi bilan dumaloq, manba — rangli nuqta; tanlangani kattalashib, to'lqin chiqaradi */
const pinIcon = (f: MapFeature, selected: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20],
    html: `<div class="map-pin ${f.kind === 'object' ? 'map-pin--object' : 'map-pin--source'} ${selected ? 'is-selected' : ''}">${
      f.thumbnailUrl ? `<img src="${escapeAttr(f.thumbnailUrl)}" alt="" />` : '<span></span>'
    }</div>`,
  });

/** Ma'lumot o'zgarganda barcha nuqtalarga moslashadi; tanlangan joyga silliq uchadi */
const MapController = ({ features, selected }: { features: MapFeature[]; selected?: MapFeature }) => {
  const map = useMap();
  useEffect(() => {
    if (features.length === 0) return;
    const bounds = L.latLngBounds(features.map((f) => [f.latitude, f.longitude] as [number, number]));
    map.flyToBounds(bounds.pad(0.25), { duration: 0.8, maxZoom: 9 });
  }, [features, map]);
  useEffect(() => {
    if (selected) map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 11), { duration: 1 });
  }, [selected, map]);
  return null;
};

/**
 * Tarixiy xarita (OpenStreetMap; plitkalar sahifa ranglariga mos yumshatilgan — .history-map).
 * Nuqtalar faqat bazada koordinatasi kiritilgan yozuvlar uchun — koordinata taxmin qilinmaydi.
 */
const HistoryMap = ({ features, selectedKey, onSelect }: { features: MapFeature[]; selectedKey?: string; onSelect: (key: string) => void }) => {
  const selected = useMemo(() => features.find((f) => featureKey(f) === selectedKey), [features, selectedKey]);
  const markers = useRef(new Map<string, L.Marker>());
  useEffect(() => {
    if (selectedKey) markers.current.get(selectedKey)?.openPopup();
  }, [selectedKey]);

  return (
    <MapContainer center={[40.5, 64.5]} zoom={6} scrollWheelZoom className="history-map h-full min-h-[420px] w-full">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> mualliflari' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapController features={features} selected={selected} />
      {features.map((f) => {
        const key = featureKey(f);
        return (
          <Marker
            key={key}
            position={[f.latitude, f.longitude]}
            icon={pinIcon(f, key === selectedKey)}
            zIndexOffset={key === selectedKey ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(key) }}
            ref={(m) => {
              if (m) markers.current.set(key, m);
              else markers.current.delete(key);
            }}
          >
            <Popup>
              <div className="w-56">
                {f.thumbnailUrl && <img src={f.thumbnailUrl} alt="" className="mb-2 h-28 w-full rounded-lg object-cover" />}
                <div className="text-[11px] font-semibold uppercase tracking-wider text-accent">{featureType(f)}</div>
                <div className="mt-0.5 font-semibold leading-snug">{f.title}</div>
                {(f.period || f.dateLabel) && <div className="mt-1 text-xs text-muted">{[f.period?.name, f.dateLabel].filter(Boolean).join(' · ')}</div>}
                <Link to={featureLink(f)} className="mt-2 inline-block text-sm font-medium">Batafsil →</Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default HistoryMap;
