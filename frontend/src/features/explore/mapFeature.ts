import { OBJECT_TYPE, SOURCE_TYPE } from '@/lib/labels';
import type { MapFeature } from '@/services/explore.service';
import type { ObjectType, SourceType } from '@/types/api';

/** Xarita nuqtasi bilan ishlash uchun yordamchilar (leaflet'siz — sahifa ham, xarita ham ishlatadi) */
export const featureKey = (f: MapFeature) => `${f.kind}-${f.id}`;
export const featureLink = (f: MapFeature) => (f.kind === 'object' ? `/app/museum/${f.slug}` : `/app/sources/${f.slug}`);
export const featureType = (f: MapFeature) => (f.kind === 'object' ? OBJECT_TYPE[f.type as ObjectType] : SOURCE_TYPE[f.type as SourceType]);
