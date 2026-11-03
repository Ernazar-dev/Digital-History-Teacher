import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { Ornament } from '@/components/motion/motion';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden py-16 text-center">
      <Ornament className="animate-spin-slow pointer-events-none absolute h-[28rem] w-[28rem] text-accent" strokeOpacity={0.18} />
      <div className="relative">
        <div className="font-serif-title text-gold-gradient animate-scale-in text-[120px] font-bold leading-none md:text-[160px]">404</div>
        <h1 className="font-serif-title animate-fade-up m-0 mt-4 text-3xl font-bold" style={{ animationDelay: '120ms' }}>Sahifa topilmadi</h1>
        <p className="animate-fade-up mx-auto mb-0 mt-3 max-w-md text-muted" style={{ animationDelay: '220ms' }}>
          Bu sahifa tarix sahifalari orasida yo‘qolib qolgan ko‘rinadi — mavjud emas yoki ko‘chirilgan.
        </p>
        {/* Platforma ichida — platformaning bosh sahifasiga (landing'ga emas) */}
        <Link to={pathname.startsWith('/app') ? '/app' : '/'} className="animate-fade-up mt-8 inline-block" style={{ animationDelay: '320ms' }}>
          <Button type="primary" size="large" icon={<ArrowLeftOutlined />} className="btn-shine">Bosh sahifaga qaytish</Button>
        </Link>
      </div>
    </div>
  );
}
