import { jsPDF } from 'jspdf';

/**
 * High-Resolution 1080x1350 Royal Light-Pink Wedding Card Generator.
 * Renders directly to HTML5 Canvas using native font metrics, guaranteeing
 * crisp Devanagari ligatures and beautiful geometric Phulkari & floral borders.
 */

export interface CardRenderOptions {
  guestName?: string;
  lang: 'en' | 'hi';
}

export async function generatePersonalizedCardBlob(options: CardRenderOptions): Promise<Blob> {
  // Wait for web fonts (Fraunces & Noto Serif Devanagari) to be active
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness timeout
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const { guestName = '', lang } = options;
  const isHi = lang === 'hi';

  // 1. Soft Blush-Pink Background (#FFF4F6)
  ctx.fillStyle = '#FFF4F6';
  ctx.fillRect(0, 0, 1080, 1350);

  // Subtle radial gradient bloom in center
  const radialGrad = ctx.createRadialGradient(540, 675, 50, 540, 675, 600);
  radialGrad.addColorStop(0, '#FFFFFF');
  radialGrad.addColorStop(0.65, '#FFF4F6');
  radialGrad.addColorStop(1, '#F8E3E9');
  ctx.fillStyle = radialGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // 2. Refined Gold Inner Borders
  ctx.strokeStyle = '#D6AD62'; // wedding gold
  ctx.lineWidth = 3.5;
  ctx.strokeRect(50, 50, 980, 1250);

  ctx.strokeStyle = 'rgba(112, 44, 67, 0.25)'; // burgundy hairline
  ctx.lineWidth = 1.2;
  ctx.strokeRect(62, 62, 956, 1226);

  // 3. Decorative Corner Motifs
  drawCornerFlourish(ctx, 75, 75);
  drawCornerFlourish(ctx, 1005, 75);
  drawCornerFlourish(ctx, 75, 1275);
  drawCornerFlourish(ctx, 1005, 1275);

  // 4. Auspicious Blessing / Ganesh Invocation
  ctx.textAlign = 'center';
  ctx.fillStyle = '#702C43'; // burgundy
  ctx.font = isHi
    ? '600 28px "Noto Serif Devanagari", Georgia, serif'
    : '600 24px "Fraunces", Georgia, serif';
  ctx.fillText(
    isHi
      ? '॥ श्री गणेशाय नमः ॥ · बड़ों के आशीर्वाद से'
      : '॥ Shree Ganeshay Namah ॥ · With Elders’ Blessings',
    540,
    165
  );

  // 5. Monogram inside Gold Circle
  ctx.strokeStyle = '#D6AD62';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(540, 255, 48, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#702C43';
  ctx.font = '700 34px "Fraunces", Georgia, serif';
  ctx.fillText(isHi ? 'रा • रा' : 'R & R', 540, 267);

  // 6. Couple Wedding Announcement in Burgundy & Gold
  ctx.fillStyle = '#702C43';
  ctx.font = isHi
    ? 'bold 74px "Noto Serif Devanagari", Georgia, serif'
    : 'bold 70px "Fraunces", Georgia, serif';
  ctx.fillText(isHi ? 'राहुल संग राधिका' : 'Rahul weds Radhika', 540, 395);

  ctx.fillStyle = '#C76B84'; // dusty rose
  ctx.font = isHi
    ? '500 32px "Noto Serif Devanagari", Georgia, serif'
    : 'italic 30px "Fraunces", Georgia, serif';
  ctx.fillText(isHi ? 'का शुभ विवाह उत्सव' : 'Wedding Celebration', 540, 448);

  // Divider
  drawDivider(ctx, 540, 490, 340);

  // 7. Personalized Guest Invitation Box
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  roundRect(ctx, 130, 540, 820, 240, 24);
  ctx.fill();
  ctx.strokeStyle = '#EBD9DE';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#C76B84';
  ctx.font = isHi ? '600 26px "Hind", sans-serif' : '600 22px "Inter", sans-serif';
  ctx.fillText(
    isHi ? 'स्नेह निमंत्रण' : 'Warm Invitation To',
    540,
    595
  );

  ctx.fillStyle = '#702C43';
  ctx.font = isHi
    ? 'bold 44px "Noto Serif Devanagari", serif'
    : 'bold 40px "Fraunces", serif';
  const displayGuest = guestName.trim() || (isHi ? 'सम्मानित अतिथि एवं परिवार' : 'Honored Guest & Family');
  ctx.fillText(displayGuest, 540, 660);

  ctx.fillStyle = '#33252B';
  ctx.font = isHi ? '400 25px "Hind", sans-serif' : '400 22px "Inter", sans-serif';
  ctx.fillText(
    isHi
      ? 'आप सपरिवार इस पावन अवसर पर सादर आमंत्रित हैं — आइयो ज़रूर!'
      : 'You and your family are joyfully invited to bless the couple.',
    540,
    720
  );

  // 8. Key Wedding Details
  ctx.fillStyle = '#702C43';
  ctx.font = isHi
    ? 'bold 36px "Noto Serif Devanagari", serif'
    : 'bold 34px "Fraunces", serif';
  ctx.fillText(
    isHi ? 'शनिवार, 28 नवंबर 2026' : 'Saturday, 28 November 2026',
    540,
    860
  );

  ctx.fillStyle = '#765F68';
  ctx.font = isHi ? '500 28px "Hind", sans-serif' : '500 25px "Inter", sans-serif';
  ctx.fillText(
    isHi
      ? 'मोरबाग़ कोर्टयार्ड मंडप · रोहतक, हरियाणा'
      : 'Morbagh Courtyard Pavilion · Rohtak, Haryana',
    540,
    910
  );

  // 9. Traditional Haryanvi Hospitality Quote
  ctx.fillStyle = '#33252B';
  ctx.font = isHi
    ? 'italic 28px "Noto Serif Devanagari", serif'
    : 'italic 25px "Fraunces", serif';
  ctx.fillText(
    isHi
      ? '“देसी घी का चूरमा और ढोल की थाप, म्हारे आंगन में थारा स्वागत सै”'
      : '“With love, warmth, and the joyful beat of the dhol, we await you”',
    540,
    1015
  );

  // 10. Family Signature
  drawDivider(ctx, 540, 1070, 260);

  ctx.fillStyle = '#702C43';
  ctx.font = isHi
    ? 'bold 28px "Noto Serif Devanagari", serif'
    : 'bold 26px "Fraunces", serif';
  ctx.fillText(
    isHi ? 'दहिया एवं हुड्डा परिवार' : 'Dahiya & Hooda Families',
    540,
    1130
  );

  ctx.fillStyle = '#C76B84';
  ctx.font = '600 22px "Hind", "Inter", sans-serif';
  ctx.fillText('rahulweddsradhika.in · राम राम!', 540, 1175);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create canvas blob'));
    }, 'image/png');
  });
}

/**
 * Downloads a high-quality PDF containing the wedding invitation card.
 */
export async function downloadInvitationPdf(options: CardRenderOptions): Promise<void> {
  const blob = await generatePersonalizedCardBlob(options);
  const reader = new FileReader();

  return new Promise<void>((resolve, reject) => {
    reader.onload = () => {
      try {
        const base64data = reader.result as string;
        // Standard A4 portrait: 210 x 297 mm
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // 1080x1350 aspect ratio is 4:5
        // Fit within 180mm width and 225mm height
        const marginX = (210 - 180) / 2;
        const marginY = 20;

        pdf.setFillColor(255, 244, 246);
        pdf.rect(0, 0, 210, 297, 'F');

        pdf.addImage(base64data, 'PNG', marginX, marginY, 180, 225);

        pdf.setFontSize(10);
        pdf.setTextColor(112, 44, 67);
        pdf.text('Rahul weds Radhika · 28 November 2026 · Rohtak, Haryana', 105, 260, {
          align: 'center',
        });
        pdf.setFontSize(8);
        pdf.setTextColor(118, 95, 104);
        pdf.text('Website: https://rahulweddsradhika.in · Ram Ram!', 105, 266, {
          align: 'center',
        });

        pdf.save(`rahul-radhika-invitation-${options.guestName?.trim() || 'card'}.pdf`);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error reading card blob'));
    reader.readAsDataURL(blob);
  });
}

function drawCornerFlourish(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = '#D6AD62';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.lineTo(x, y - 12);
  ctx.lineTo(x + 12, y);
  ctx.lineTo(x, y + 12);
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#C76B84';
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, cx: number, cy: number, width: number): void {
  ctx.save();
  ctx.strokeStyle = '#EBD9DE';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(cx - width / 2, cy);
  ctx.lineTo(cx - 25, cy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 25, cy);
  ctx.lineTo(cx + width / 2, cy);
  ctx.stroke();

  // Center diamond
  ctx.strokeStyle = '#D6AD62';
  ctx.fillStyle = '#FFF4F6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy);
  ctx.lineTo(cx, cy - 7);
  ctx.lineTo(cx + 8, cy);
  ctx.lineTo(cx, cy + 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
