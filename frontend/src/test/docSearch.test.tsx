import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { DocSearch } from '@/features/source-library/components/DocSearch';

const Harness = ({ initial }: { initial?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <DocSearch rootRef={ref} ready initial={initial} />
      <div ref={ref} data-testid="doc">
        <p>Özbekiston tarixi. <b>Amir</b> Temur davlati — Temuriylar.</p>
        <p>Özbek xalqi va amir temur haqida.</p>
      </div>
    </div>
  );
};

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined;
});

const type = (v: string) => fireEvent.change(screen.getByLabelText('Matn içidan qidiriş'), { target: { value: v } });

describe('Ma’ruza matni içidan qidiriş', () => {
  it('söz sonini körsatadi; qalin matn va katta-kiçik harf, apostrof körinişlariga e’tibor bermaydi', async () => {
    render(<Harness />);
    type('amir temur');
    expect(await screen.findByText('1 / 2')).toBeInTheDocument();
    type("özbek");
    expect(await screen.findByText('1 / 2')).toBeInTheDocument();
  });

  it('topilmasa «topilmadi», bir harfli sörovda qidirilmaydi; Enter keyingisiga ötadi', async () => {
    render(<Harness />);
    type('mavjud emas');
    expect(await screen.findByText('topilmadi')).toBeInTheDocument();
    type('t');
    expect(await screen.findByText('kamida 2 harf')).toBeInTheDocument();
    type('tem');
    expect(await screen.findByText('1 / 3')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText('Matn içidan qidiriş'), { key: 'Enter' });
    expect(await screen.findByText('2 / 3')).toBeInTheDocument();
  });

  it('havoladan kelgan boşlanğiç söz darhol qidiriladi', async () => {
    render(<Harness initial="temuriylar" />);
    expect(await screen.findByText('1 / 1')).toBeInTheDocument();
  });
});
