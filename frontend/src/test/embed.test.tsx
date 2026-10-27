import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmbedViewer, isAllowedEmbed } from '@/components/common/EmbedViewer';

describe('3D/360° embed va fallback', () => {
  it('faqat ruxsat etilgan https hostlarni qabul qiladi', () => {
    expect(isAllowedEmbed('https://sketchfab.com/models/abc/embed')).toBe(true);
    expect(isAllowedEmbed('https://uzbekistan360.uz/ru?city=10')).toBe(true);
    expect(isAllowedEmbed('http://sketchfab.com/models/abc/embed')).toBe(false);
    expect(isAllowedEmbed('https://evil.example/frame')).toBe(false);
    expect(isAllowedEmbed('https://sketchfab.com.evil.example/x')).toBe(false);
    expect(isAllowedEmbed(null)).toBe(false);
  });

  it('ruxsat etilmagan manzil uchun iframe o‘rniga tushunarli fallback va tashqi havola', () => {
    const { container } = render(<EmbedViewer title="Obyekt" embedUrl="https://evil.example/frame" externalUrl="https://example.org/page" />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Ichki ko‘rish mavjud emas')).toBeInTheDocument();
    expect(screen.getByText('Yangi oynada ochish').closest('a')).toHaveAttribute('href', 'https://example.org/page');
  });

  it('kontent sahifa ochilganda yuklanmaydi (lazy), bosilganda iframe paydo bo‘ladi', () => {
    const url = 'https://sketchfab.com/models/af54f5280eb249beb6501eab4769c351/embed';
    const { container } = render(<EmbedViewer title="Registon" embedUrl={url} kind="3d" />);
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByText('3D modelni yuklash'));
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute('src', url);
    expect(iframe?.getAttribute('sandbox')).toContain('allow-scripts');
  });
});
