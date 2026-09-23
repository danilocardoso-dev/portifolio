const fs = require("fs");
const path = require("path");

const width = 180;
const height = 102;
const frameCount = 14;
const delay = 9;
const palette = [
  [9, 9, 8],
  [23, 23, 21],
  [43, 43, 40],
  [238, 232, 220],
  [169, 39, 44],
  [214, 90, 94],
  [119, 115, 108],
  [185, 179, 168],
];

const le16 = (value) => [value & 255, (value >> 8) & 255];

function setPixel(frame, x, y, color) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= width || py >= height) return;
  frame[py * width + px] = color;
}

function line(frame, x0, y0, x1, y1, color) {
  let x = Math.round(x0);
  let y = Math.round(y0);
  const endX = Math.round(x1);
  const endY = Math.round(y1);
  const dx = Math.abs(endX - x);
  const sx = x < endX ? 1 : -1;
  const dy = -Math.abs(endY - y);
  const sy = y < endY ? 1 : -1;
  let error = dx + dy;

  while (true) {
    setPixel(frame, x, y, color);
    if (x === endX && y === endY) break;
    const twice = 2 * error;
    if (twice >= dy) { error += dy; x += sx; }
    if (twice <= dx) { error += dx; y += sy; }
  }
}

function circle(frame, centerX, centerY, radius, color, filled = false) {
  const r = Math.max(1, Math.round(radius));
  if (filled) {
    for (let y = -r; y <= r; y += 1) {
      const extent = Math.floor(Math.sqrt(r * r - y * y));
      for (let x = -extent; x <= extent; x += 1) setPixel(frame, centerX + x, centerY + y, color);
    }
    return;
  }

  let x = r;
  let y = 0;
  let error = 1 - r;
  while (x >= y) {
    [[x,y],[y,x],[-y,x],[-x,y],[-x,-y],[-y,-x],[y,-x],[x,-y]].forEach(([dx,dy]) => setPixel(frame, centerX + dx, centerY + dy, color));
    y += 1;
    if (error < 0) error += 2 * y + 1;
    else { x -= 1; error += 2 * (y - x) + 1; }
  }
}

function polyline(frame, points, color) {
  for (let index = 0; index < points.length - 1; index += 1) {
    line(frame, points[index][0], points[index][1], points[index + 1][0], points[index + 1][1], color);
  }
}

function pointOnPath(points, progress) {
  const lengths = [];
  let total = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const length = Math.hypot(points[index + 1][0] - points[index][0], points[index + 1][1] - points[index][1]);
    lengths.push(length);
    total += length;
  }
  let distance = (progress % 1) * total;
  for (let index = 0; index < lengths.length; index += 1) {
    if (distance <= lengths[index]) {
      const ratio = distance / lengths[index];
      return [
        points[index][0] + (points[index + 1][0] - points[index][0]) * ratio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * ratio,
      ];
    }
    distance -= lengths[index];
  }
  return points.at(-1);
}

function baseFrame() {
  const frame = new Uint8Array(width * height);
  for (let x = 0; x < width; x += 20) line(frame, x, 0, x, height - 1, 1);
  for (let y = 0; y < height; y += 17) line(frame, 0, y, width - 1, y, 1);
  return frame;
}

function mapFrame(index) {
  const frame = baseFrame();
  const points = [[12,72],[42,43],[73,58],[105,29],[138,47],[168,20]];
  polyline(frame, points, 4);
  points.forEach(([x,y], nodeIndex) => circle(frame, x, y, nodeIndex === 3 ? 3 : 2, nodeIndex === 3 ? 5 : 3, true));
  const pulse = pointOnPath(points, index / frameCount);
  circle(frame, pulse[0], pulse[1], 7, 2, true);
  circle(frame, pulse[0], pulse[1], 4, 4, true);
  circle(frame, pulse[0], pulse[1], 2, 5, true);
  polyline(frame, [[0,90],[35,78],[72,84],[108,69],[144,76],[179,62]], 6);
  return frame;
}

function atlasFrame(index) {
  const frame = baseFrame();
  const angle = (index / frameCount) * Math.PI * 2;
  const points3d = [
    [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
    [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],
  ];
  const projected = points3d.map(([x,y,z]) => {
    const rx = x * Math.cos(angle) - z * Math.sin(angle);
    const rz = x * Math.sin(angle) + z * Math.cos(angle);
    const ry = y * Math.cos(angle * .65) - rz * Math.sin(angle * .65);
    const depth = y * Math.sin(angle * .65) + rz * Math.cos(angle * .65);
    const scale = 25 / (3.8 + depth * .28);
    return [90 + rx * scale * 2.1, 51 + ry * scale * 1.75];
  });
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  edges.forEach(([a,b], edgeIndex) => line(frame, projected[a][0], projected[a][1], projected[b][0], projected[b][1], edgeIndex % 3 === 0 ? 5 : 7));
  circle(frame, 90, 51, 42, 2);
  const orbitX = 90 + Math.cos(angle * 1.7) * 42;
  const orbitY = 51 + Math.sin(angle * 1.7) * 15;
  circle(frame, orbitX, orbitY, 3, 5, true);
  return frame;
}

function azrielFrame(index) {
  const frame = baseFrame();
  const phase = index / frameCount;
  [13, 25, 39].forEach((base, ringIndex) => {
    const radius = base + ((phase * 12 + ringIndex * 4) % 12);
    circle(frame, 90, 51, radius, ringIndex === 0 ? 5 : ringIndex === 1 ? 4 : 2);
  });
  const nodes = [[90,18],[132,48],[111,82],[48,68],[55,31]];
  nodes.forEach(([x,y], nodeIndex) => {
    line(frame, 90, 51, x, y, nodeIndex % 2 ? 2 : 6);
    circle(frame, x, y, nodeIndex === index % nodes.length ? 4 : 2, nodeIndex === index % nodes.length ? 5 : 3, true);
  });
  circle(frame, 90, 51, 6, 4, true);
  circle(frame, 90, 51, 2, 3, true);
  return frame;
}

function encodePixels(pixels) {
  const bytes = [];
  let current = 0;
  let bitCount = 0;
  const writeCode = (code) => {
    current |= code << bitCount;
    bitCount += 4;
    while (bitCount >= 8) {
      bytes.push(current & 255);
      current >>= 8;
      bitCount -= 8;
    }
  };

  pixels.forEach((pixel) => {
    writeCode(8);
    writeCode(pixel);
  });
  writeCode(9);
  if (bitCount > 0) bytes.push(current & 255);
  return bytes;
}

function subBlocks(data) {
  const output = [];
  for (let index = 0; index < data.length; index += 255) {
    const block = data.slice(index, index + 255);
    output.push(block.length, ...block);
  }
  output.push(0);
  return output;
}

function buildGif(frameFactory) {
  const bytes = [
    ...Buffer.from("GIF89a", "ascii"),
    ...le16(width), ...le16(height),
    0xf2, 0x00, 0x00,
    ...palette.flat(),
    0x21, 0xff, 0x0b, ...Buffer.from("NETSCAPE2.0", "ascii"), 0x03, 0x01, 0x00, 0x00, 0x00,
  ];

  for (let index = 0; index < frameCount; index += 1) {
    const pixels = frameFactory(index);
    const imageData = encodePixels(pixels);
    bytes.push(
      0x21, 0xf9, 0x04, 0x04, ...le16(delay), 0x00, 0x00,
      0x2c, 0x00, 0x00, 0x00, 0x00, ...le16(width), ...le16(height), 0x00,
      0x03,
      ...subBlocks(imageData),
    );
  }

  bytes.push(0x3b);
  return Buffer.from(bytes);
}

const outputDirectory = path.resolve(__dirname, "..", "assets", "motion");
fs.mkdirSync(outputDirectory, { recursive: true });

const outputs = [
  ["mapcloud-signal.gif", mapFrame],
  ["atlas3d-orbit.gif", atlasFrame],
  ["azriel-pulse.gif", azrielFrame],
];

for (const [fileName, factory] of outputs) {
  const outputPath = path.join(outputDirectory, fileName);
  fs.writeFileSync(outputPath, buildGif(factory));
  console.log(`${fileName}: ${fs.statSync(outputPath).size} bytes`);
}
