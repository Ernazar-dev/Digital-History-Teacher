import type { MdBlock } from './markdown';

/**
 * Ma'ruza matnini (Markdown bloklari) toʻliq Word (.docx) faylga aylantirib, yuklab beradi.
 * `docx` kutubxonasi faqat tugma bosilganda yuklanadi — sahifa ogʻirlashmaydi.
 */
export const downloadLectureDocx = async (blocks: MdBlock[], title: string) => {
  const {
    AlignmentType, BorderStyle, Document, HeadingLevel, LevelFormat, Packer, Paragraph, ShadingType,
    Table, TableCell, TableRow, TextRun, WidthType,
  } = await import('docx');

  /** **qalin** va *kursiv* belgilarini Word matn boʻlaklariga aylantiradi */
  const runs = (text: string, base: { bold?: boolean; italics?: boolean } = {}) =>
    text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).filter(Boolean).map((part) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) return new TextRun({ text: part.slice(2, -2), ...base, bold: true });
      if (/^\*[^*]+\*$/.test(part)) return new TextRun({ text: part.slice(1, -1), ...base, italics: true });
      return new TextRun({ text: part, ...base });
    });

  const HEADINGS = { 1: HeadingLevel.TITLE, 2: HeadingLevel.HEADING_1, 3: HeadingLevel.HEADING_2 } as const;
  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  let listNo = 0; // har bir raqamli roʻyxat 1 dan boshlanadi
  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];

  for (const b of blocks) {
    switch (b.kind) {
      case 'h':
        children.push(new Paragraph({ heading: HEADINGS[b.level], children: runs(b.text), spacing: { before: 240, after: 120 } }));
        break;
      case 'ul':
        b.items.forEach((t) => children.push(new Paragraph({ children: runs(t), bullet: { level: 0 } })));
        break;
      case 'ol': {
        listNo += 1;
        const instance = listNo;
        b.items.forEach((t) => children.push(new Paragraph({ children: runs(t), numbering: { reference: 'num', level: 0, instance } })));
        break;
      }
      case 'quote':
        children.push(new Paragraph({
          children: runs(b.text, { italics: true }),
          indent: { left: 567 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'C9A227', space: 8 } },
          spacing: { before: 120, after: 120 },
        }));
        break;
      case 'table':
        children.push(new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: b.head.map((c) => new TableCell({
                borders,
                shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'EEF2F7' },
                children: [new Paragraph({ children: runs(c, { bold: true }) })],
              })),
            }),
            ...b.rows.map((r) => new TableRow({
              children: b.head.map((_, n) => new TableCell({ borders, children: [new Paragraph({ children: runs(r[n] ?? '') })] })),
            })),
          ],
        }));
        children.push(new Paragraph({ text: '' }));
        break;
      case 'hr':
        children.push(new Paragraph({ text: '', border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D9D9D9', space: 1 } } }));
        break;
      default:
        children.push(new Paragraph({ children: runs(b.text), alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 } }));
    }
  }

  const doc = new Document({
    creator: 'Digital History Teacher',
    title,
    styles: { default: { document: { run: { font: 'Times New Roman', size: 28 }, paragraph: { spacing: { line: 300 } } } } },
    numbering: {
      config: [{
        reference: 'num',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START, style: { paragraph: { indent: { left: 567, hanging: 340 } } } }],
      }],
    },
    sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 851 } } }, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 120) || 'Maruza'}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
