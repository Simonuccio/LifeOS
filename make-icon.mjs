import fs from 'node:fs';
import zlib from 'node:zlib';

const S = 512, C = 256, R = 155, HW = 18;
const a0 = -Math.PI / 2, a1 = Math.PI * 0.85;
const c0x = C + R * Math.cos(a0), c0y = C + R * Math.sin(a0);
const c1x = C + R * Math.cos(a1), c1y = C + R * Math.sin(a1);
const raw = Buffer.alloc(S * (S * 4 + 1));
const clamp = (v) => Math.max(0, Math.min(1, v));

for (let y = 0; y < S; y++) {
  const row = y * (S * 4 + 1);
  raw[row] = 0;
  for (let x = 0; x < S; x++) {
    const dx = x - C, dy = y - C;
    const d = Math.hypot(dx, dy);
    const ang = Math.atan2(dy, dx);

    let r = 24, g = 24, b = 29; // #18181D

    const ringAlpha = clamp(HW + 0.5 - Math.abs(d - R)) * 0.12;
    r += (255 - r) * ringAlpha;
    g += (255 - g) * ringAlpha;
    b += (255 - b) * ringAlpha;

    let arcDist = Math.min(Math.hypot(x - c0x, y - c0y), Math.hypot(x - c1x, y - c1y));
    if (ang >= a0 && ang <= a1) arcDist = Math.min(arcDist, Math.abs(d - R));
    const arcAlpha = clamp(HW + 0.5 - arcDist);
    r += (110 - r) * arcAlpha;
    g += (231 - g) * arcAlpha;
    b += (183 - b) * arcAlpha;

    const dotAlpha = clamp(56 + 0.5 - d);
    r += (242 - r) * dotAlpha;
    g += (107 - g) * dotAlpha;
    b += (58 - b) * dotAlpha;

    const i = row + 1 + x * 4;
    raw[i] = Math.round(r);
    raw[i + 1] = Math.round(g);
    raw[i + 2] = Math.round(b);
    raw[i + 3] = 255;
  }
}

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0);
ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8;
ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0))
]);

fs.writeFileSync('public/icon.png', png);
console.log('Icona public/icon.png creata con successo!');