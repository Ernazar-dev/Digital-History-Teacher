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

  it('ruxsat etilmagan manzil uçun iframe örniga tuşunarli fallback va taşqi havola', () => {
    const { container } = render(<EmbedViewer title="Obyekt" embedUrl="https://evil.example/frame" externalUrl="https://example.org/page" />);
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Içki köriş mavjud emas')).toBeInTheDocument();
    expect(screen.getByText('Yangi oynada oçiş').closest('a')).toHaveAttribute('href', 'https://example.org/page');
  });

  it('kontent sahifa oçilganda yuklanmaydi (lazy), bosilganda iframe paydo böladi', () => {
    const url = 'https://sketchfab.com/models/af54f5280eb249beb6501eab4769c351/embed';
    const { container } = render(<EmbedViewer title="Registon" embedUrl={url} kind="3d" />);
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByText('3D modelni yuklaş'));
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute('src', url);
    expect(iframe?.getAttribute('sandbox')).toContain('allow-scripts');
  });
});
