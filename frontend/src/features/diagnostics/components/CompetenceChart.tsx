import { Empty } from 'antd';
import { Bar, BarChart, CartesianGrid, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { tokens } from '@/app/tokens';

interface Item { name: string; score: number | null }

/** Komponentlar bo'yicha natijalar (radar). Ma'lumot yo'q komponentlar 0 sifatida emas, bo'sh holat sifatida ko'rsatiladi. */
export const CompetenceRadar = ({ items, height = 280 }: { items: Item[]; height?: number }) => {
  if (!items.some((i) => i.score !== null)) return <Empty description="Hali baholash natijalari yo‘q" />;
  const data = items.map((i) => ({ name: i.name, score: i.score ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="62%" margin={{ top: 12, right: 48, bottom: 12, left: 48 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar dataKey="score" stroke={tokens.color.primary} fill={tokens.color.primary} fillOpacity={0.25} />
        <Tooltip formatter={(v: number) => `${v}%`} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

/** Bosqichlar (boshlang'ich/yakuniy) bo'yicha taqqoslash */
export const StageCompareBars = ({ data, height = 300 }: { data: { name: string; initial: number | null; final: number | null }[]; height?: number }) => {
  if (!data.some((d) => d.initial !== null || d.final !== null)) return <Empty description="Bosqichlar bo‘yicha natijalar hali yo‘q" />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(v: number) => `${v}%`} />
        <Legend />
        <Bar dataKey="initial" name="Boshlang‘ich" fill="#9fb0cc" radius={[4, 4, 0, 0]} />
        <Bar dataKey="final" name="Yakuniy" fill={tokens.color.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
