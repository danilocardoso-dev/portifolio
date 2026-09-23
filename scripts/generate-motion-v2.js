"use strict";
// Original 16-frame folding leaf. A sprite, not an autonomous animation:
// the site's single motion clock owns playback, wind, pause and reduced motion.
const fs = require("node:fs");
const path = require("node:path");
const size = 160, frames = 16;
const format = (n) => Number(n.toFixed(2));
let artwork = "";
for (let frame = 0; frame < frames; frame++) {
  const phase = frame / frames * Math.PI * 2;
  const roll = Math.cos(phase), fold = Math.sin(phase);
  const project = (x, y) => [format(frame * size + 80 + x * .89 + y * fold * .14), format(80 + y * (.15 + Math.abs(roll) * .85) + Math.sin(x / 20) * fold * 7)];
  const points = [];
  for (let i = 0; i <= 26; i++) {
    const x = -58 + i / 26 * 116;
    const width = Math.sin(i / 26 * Math.PI) * (19 + 6 * Math.sin(i * .48));
    points.push(project(x, -width));
  }
  for (let i = 26; i >= 0; i--) {
    const x = -58 + i / 26 * 116;
    points.push(project(x, Math.sin(i / 26 * Math.PI) * (18 + 5 * Math.cos(i * .4))));
  }
  const d = points.map(([x,y],i) => `${i ? "L" : "M"}${x} ${y}`).join("") + "Z";
  artwork += `<path d="${d}" fill="${roll > 0 ? "#a34b36" : "#604234"}"/>`;
  const vein = [-58,-35,-10,15,40,65].map(x => project(x,0));
  artwork += `<path d="${vein.map(([x,y],i) => `${i ? "L" : "M"}${x} ${y}`).join("")}" stroke="#d6b48a" stroke-opacity=".48" stroke-width=".9" fill="none"/>`;
  for (let i = 1; i <= 7; i++) {
    const x = -48 + i * 12, a = project(x,0), b = project(x - 12, -Math.sin((x + 58) / 116 * Math.PI) * 15), c = project(x - 13, Math.sin((x + 58) / 116 * Math.PI) * 14);
    artwork += `<path d="M${b}L${a}L${c}" fill="none" stroke="#e6c295" stroke-width=".55" opacity=".3"/>`;
  }
}
const output = path.join(__dirname, "../assets/motion/leaf-flight.svg");
fs.mkdirSync(path.dirname(output), { recursive:true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${frames*size}" height="${size}" viewBox="0 0 ${frames*size} ${size}">${artwork}</svg>\n`;
fs.writeFileSync(output, svg);
console.log(`leaf-flight.svg: ${frames} frames, ${Buffer.byteLength(svg)} bytes; original deterministic artwork.`);
