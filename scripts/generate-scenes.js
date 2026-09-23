/* Original vector scenery for Danilo V. Cardoso's portfolio.
 * Run: node scripts/generate-scenes.js
 * No dependencies, downloaded artwork, fonts, or runtime randomness.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, '..', 'assets', 'scenes');
fs.mkdirSync(output, { recursive: true });

const num = n => Number(n.toFixed(1));
const pt = ([x, y]) => `${num(x)},${num(y)}`;
const line = points => points.map((p, i) => `${i ? 'L' : 'M'}${pt(p)}`).join('');
const random = seed => () => {
  seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const svg = (width, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">${body}</svg>\n`;
const save = (name, width, height, body) => {
  const content = svg(width, height, body);
  fs.writeFileSync(path.join(output, `${name}.svg`), content);
  console.log(`${name}.svg: ${width} x ${height}, ${Buffer.byteLength(content)} bytes`);
};
const terrain = (d, fill, opacity = 1) => `<path d="${d}L1600 920H0Z" fill="${fill}" opacity="${opacity}"/>`;
const ridge = (d, color, opacity, width = 1) => `<path d="${d}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;

// Distant slopes dissolve into a wide, unoccupied valley. Every ridge is drawn
// with cubic curves; variation in the slope creates weight without triangles.
const farA = 'M0 570C58 553 92 555 150 525S238 487 287 464S350 413 385 429S442 473 488 482S552 446 587 418S645 373 678 397S711 452 744 469S815 467 857 478S914 507 963 504S1052 450 1084 451S1124 410 1167 384S1211 389 1246 416S1295 426 1322 448S1371 450 1402 469S1497 470 1533 448S1581 414 1600 409';
const farB = 'M0 651C59 634 110 607 148 621S214 601 243 577S276 579 307 587S353 551 392 555S449 598 497 611S565 622 600 604S654 564 689 580S735 620 769 629S837 610 872 598S927 594 970 578S1024 548 1075 544S1138 570 1199 558S1247 519 1276 494S1342 509 1365 525S1410 524 1434 536S1498 505 1538 514S1582 560 1600 560';
const farC = 'M0 696C70 679 113 663 158 672S221 640 272 650S344 713 400 711S485 666 529 675S585 708 643 710S728 688 772 692S853 724 905 712S985 681 1039 689S1127 703 1175 686S1239 638 1289 628S1357 653 1401 658S1481 611 1523 624S1573 647 1600 650';
save('landscape-far', 1600, 900, `<defs><linearGradient id="distance" x2="0" y2="1"><stop stop-color="#969b94"/><stop offset="1" stop-color="#bec0b5" stop-opacity=".55"/></linearGradient><linearGradient id="haze" x2="0" y2="1"><stop stop-color="#7f8984"/><stop offset="1" stop-color="#a8afa6" stop-opacity=".4"/></linearGradient></defs>${terrain(farA, 'url(#distance)', .78)}${ridge(farA, '#f2e7ce', .2, 2)}${terrain(farB, 'url(#haze)', .9)}${terrain(farC, '#768580', .51)}<path d="M620 488C700 499 720 518 794 523S920 511 987 517" stroke="#e5dec9" stroke-width="3" opacity=".12"/><path d="M784 630C898 607 1020 615 1178 583" stroke="#e4dbc7" stroke-width="9" opacity=".1"/>`);

const midA = 'M0 421C50 442 72 442 114 493S177 501 211 535S239 582 283 598S340 598 373 625S421 654 456 666S513 663 549 691S609 722 660 729S720 718 771 742S846 769 920 751S997 717 1046 702S1110 636 1157 624S1208 608 1238 572S1263 548 1298 540S1344 490 1381 483S1435 516 1480 493S1550 430 1600 408';
const midB = 'M0 564C57 551 89 596 121 592S198 635 227 660S288 694 335 711S398 687 438 710S505 754 546 752S614 775 649 774S714 809 775 807S858 785 911 790S997 749 1038 742S1086 747 1125 722S1175 665 1223 658S1287 619 1322 620S1390 587 1441 584S1521 549 1600 497';
const midRng = random(4701);
let striation = '';
for (let i = 0; i < 32; i++) {
  const right = i > 12;
  const x = right ? 1150 + midRng() * 450 : midRng() * 380;
  const y = right ? 660 - (x - 1150) * .43 : 500 + x * .56;
  striation += `<path d="M${num(x)} ${num(y)}q${right ? '-20 53 -45 94' : '24 58 54 85'}" stroke="#b8b9a4" stroke-width="${num(.7 + midRng())}" opacity="${num(.06 + midRng() * .04)}"/>`;
}
save('landscape-mid', 1600, 900, `<defs><linearGradient id="slope" x1=".2" y1="0" x2=".7" y2="1"><stop stop-color="#353f3a"/><stop offset="1" stop-color="#697770"/></linearGradient><linearGradient id="front" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1e2b27"/><stop offset=".6" stop-color="#334943"/><stop offset="1" stop-color="#65766b"/></linearGradient><clipPath id="slopeclip"><path d="${midA}L1600 920H0Z"/></clipPath></defs>${terrain(midA, 'url(#slope)')}${ridge(midA, '#c0bdac', .18, 1.5)}<g clip-path="url(#slopeclip)">${striation}</g>${terrain(midB, 'url(#front)', .84)}<path d="M867 754C834 777 859 787 813 807S789 834 733 852S680 875 651 904" stroke="#d7ddcd" stroke-width="2" opacity=".23"/><path d="M867 754C834 777 859 787 813 807S789 834 733 852S680 875 651 904" stroke="#a0b7a9" stroke-width="8" opacity=".08"/>`);

const nearPath = 'M0 810C91 781 174 801 240 819S353 827 414 839S516 859 579 857S698 894 774 890S866 864 934 856S1066 815 1131 805S1202 735 1242 728S1291 695 1308 677S1329 669 1357 643S1401 630 1432 597S1483 584 1516 552S1572 541 1600 526';
const nearRng = random(8027);
let grass = '';
for (let i = 0; i < 96; i++) {
  const x = nearRng() * 1600;
  const base = x < 700 ? 823 + x * .08 : x < 1120 ? 908 - (x - 700) * .23 : 806 - (x - 1120) * .55;
  const h = 8 + nearRng() * 28;
  grass += `<path d="M${num(x)} ${num(base)}q${num(4 + nearRng() * 13)} ${num(-h * .72)} ${num(9 + nearRng() * 25)} ${num(-h)}" stroke="#18221d" stroke-width="${num(1 + nearRng() * 1.5)}"/>`;
}
save('landscape-near', 1600, 900, `<defs><linearGradient id="cliff" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#111b17"/><stop offset=".7" stop-color="#15251e"/><stop offset="1" stop-color="#354537"/></linearGradient></defs>${terrain(nearPath, 'url(#cliff)')}${ridge(nearPath, '#a4ac8b', .14, 2)}${grass}<path d="M1600 563C1554 596 1535 656 1460 694S1395 769 1352 807M1521 610C1490 656 1506 697 1439 729M1380 685C1397 751 1343 799 1320 840M1590 710C1521 767 1510 823 1430 900" stroke="#65715b" opacity=".16"/><path d="M1440 745C1460 712 1478 703 1495 682L1479 753 1439 798 1414 861 1373 900H1339C1360 858 1370 810 1397 789Z" fill="#758168" opacity=".07"/>`);

// A bent, multi-stem tree anchors the near plane. Leaf shapes follow the same
// left-to-right prevailing wind as the environment engine.
const branchRng = random(8821);
let foliage = '';
const clusters = [
  [1482, 148, 129, 34], [1365, 205, 134, 34], [1290, 257, 116, 30],
  [1487, 295, 113, 40], [1194, 342, 121, 33], [1306, 405, 104, 31],
  [1436, 450, 130, 32], [1082, 356, 100, 24], [1350, 533, 112, 27]
];
for (const [cx, cy, rx, ry] of clusters) {
  for (let i = 0; i < 31; i++) {
    const a = branchRng() * Math.PI * 2;
    const distance = Math.sqrt(branchRng());
    const x = cx + Math.cos(a) * rx * distance;
    const y = cy + Math.sin(a) * ry * distance;
    const s = 3.4 + branchRng() * 5.5;
    const accent = branchRng() > .945;
    foliage += `<use href="#leaf" transform="translate(${num(x)} ${num(y)}) rotate(${num(-20 + branchRng() * 40)}) scale(${num(s)})" fill="${accent ? '#8d4838' : branchRng() > .5 ? '#283b2b' : '#162a21'}" opacity="${num(.58 + branchRng() * .4)}"/>`;
  }
}
save('branches', 1600, 900, `<defs><path id="leaf" d="M-1.8 0Q-.9-1.1 1.6-.15Q.6 1.2-1.8 0Z"/></defs><path d="M1557 904C1544 815 1521 724 1508 649S1490 522 1467 460S1461 359 1447 303C1436 267 1452 216 1474 167L1481 168C1464 226 1457 279 1469 322S1488 411 1500 452S1517 530 1535 576S1560 636 1559 671C1557 716 1588 805 1590 900Z" fill="#18221b"/><path d="M1526 603C1498 564 1471 551 1431 537S1338 517 1297 522L1272 529C1331 523 1384 545 1429 559S1495 594 1537 646Z" fill="#17271e"/><path d="M1510 539C1485 485 1450 466 1396 448S1298 428 1234 400L1191 368 1208 368C1258 410 1320 406 1399 426S1489 469 1513 502Z" fill="#18291f"/><path d="M1476 419C1439 380 1405 354 1364 340S1280 330 1247 316S1206 298 1173 313L1155 326C1204 303 1221 336 1263 345S1351 352 1400 384S1450 429 1492 461Z" fill="#1c2c20"/><path d="M1460 325C1424 299 1398 280 1357 266S1298 260 1269 259L1233 269C1286 252 1324 278 1356 285S1422 316 1470 349Z" fill="#1a2d22"/><path d="M1460 253C1428 225 1399 210 1366 208S1299 207 1272 220M1464 347C1430 347 1410 322 1368 321M1410 452C1370 448 1347 467 1306 468M1324 338C1285 371 1230 356 1189 352S1109 346 1070 367M1490 449C1506 398 1480 343 1504 303M1474 171C1502 155 1552 158 1585 142" stroke="#1c2c21" stroke-width="4" stroke-linecap="round"/><path d="M1559 896C1555 810 1519 715 1522 659S1498 537 1484 485M1474 458C1487 473 1495 493 1500 526" stroke="#667057" opacity=".14" stroke-width="2"/>${foliage}`);

const projectDefs = '<defs><radialGradient id="ambient"><stop stop-color="#384940" stop-opacity=".65"/><stop offset="1" stop-color="#101714" stop-opacity="0"/></radialGradient><radialGradient id="ember"><stop stop-color="#a85340" stop-opacity=".22"/><stop offset="1" stop-color="#a85340" stop-opacity="0"/></radialGradient></defs>';
// MapCloud: irregular nested topographic contours, flowing rather than grid-like.
let contours = '';
for (let band = 0; band < 26; band++) {
  const points = [];
  for (let step = 0; step <= 104; step++) {
    const a = step / 104 * Math.PI * 2;
    const r = 38 + band * 16.5 + Math.sin(a * 3 + band * .1) * 19 + Math.sin(a * 5 + .3) * 8;
    points.push([485 + Math.cos(a) * r * 1.28 + Math.sin(a * 2) * 32, 339 + Math.sin(a) * r * .73]);
  }
  contours += `<path d="${line(points)}Z" stroke="${band % 5 === 0 ? '#aebcaf' : '#72897d'}" opacity="${band % 5 === 0 ? '.34' : '.19'}" stroke-width="${band % 5 === 0 ? '1.2' : '.8'}"/>`;
}
const mapNodes = [[156, 491], [279, 422], [414, 413], [516, 290], [643, 260], [751, 169]];
const route = 'M84 552C120 534 130 504 156 491S238 418 279 422S379 441 414 413S477 306 516 290S603 294 643 260S711 188 751 169S812 120 851 138';
let mapDetails = '';
for (const [i, [x, y]] of mapNodes.entries()) {
  mapDetails += `<circle cx="${x}" cy="${y}" r="${i === 3 ? 21 : 13}" stroke="#c8cfc0" opacity=".21"/><circle cx="${x}" cy="${y}" r="4" fill="#d77e60"/><path d="M${x + 25} ${y}h27m-13-13v26" stroke="#cbd0bd" opacity=".33" stroke-width=".7"/>`;
}
save('mapcloud', 900, 700, `${projectDefs}<ellipse cx="485" cy="335" rx="500" ry="350" fill="url(#ambient)"/>${contours}<path d="${route}" stroke="#a65343" stroke-width="1.8"/><path d="${route}" stroke="#d09477" stroke-width=".6" opacity=".5"/>${mapDetails}<path d="M279 422C245 329 329 226 437 197S668 337 751 169" stroke="#d2d4bf" stroke-dasharray="2 7" opacity=".16"/><g stroke="#c7cdb8" opacity=".16"><path d="M73 73h31m-15-15v31M812 608h31m-15-15v31M451 597h16m-8-8v16"/></g>`);

// Atlas3D: a parameterized twisted surface, projected from a real 3D shape.
const project3d = (u, v) => {
  const angle = u * Math.PI * 2;
  const radius = 139 + Math.cos(v) * 65;
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  const y = Math.sin(v) * 77 + Math.sin(angle * 2) * 61;
  const yaw = -.47;
  const xx = x * Math.cos(yaw) - z * Math.sin(yaw);
  const zz = x * Math.sin(yaw) + z * Math.cos(yaw);
  const yy = y * .81 - zz * .58;
  const depth = y * .58 + zz * .81;
  const perspective = 1 + depth / 1400;
  return [450 + xx * perspective * 1.35, 337 + yy * perspective * 1.35];
};
let geometry = '';
for (let ring = 0; ring < 24; ring++) {
  const points = [];
  for (let i = 0; i <= 72; i++) points.push(project3d(i / 72, ring / 24 * Math.PI * 2));
  geometry += `<path d="${line(points)}Z" stroke="${ring === 5 ? '#c77960' : '#d4d6c5'}" opacity="${ring === 5 ? '.8' : '.27'}" stroke-width="${ring === 5 ? '1.6' : '.7'}"/>`;
}
for (let meridian = 0; meridian < 38; meridian++) {
  const points = [];
  for (let i = 0; i <= 28; i++) points.push(project3d(meridian / 38, i / 28 * Math.PI * 2));
  geometry += `<path d="${line(points)}Z" stroke="#cdd3c1" opacity=".19" stroke-width=".7"/>`;
}
save('atlas3d', 900, 700, `${projectDefs}<ellipse cx="450" cy="353" rx="367" ry="275" fill="url(#ambient)"/><g stroke="#a9b3a1" opacity=".16"><ellipse cx="450" cy="557" rx="295" ry="61"/><ellipse cx="450" cy="557" rx="214" ry="44"/><path d="M117 557h666M450 622V97M210 642L690 472M249 479L648 635"/><path d="M450 97l-4 9m4-9 4 9M783 557l-9-4m9 4-9 4"/></g>${geometry}<g fill="#d4d5c1"><circle cx="450" cy="557" r="2"/><circle cx="450" cy="97" r="2"/></g><path d="M652 135h76v75M169 467v81h75" stroke="#d2d1be" opacity=".22"/>`);

// Azriel: a restrained organic network with a calm central opening.
const signalRng = random(29831);
const center = [454, 343];
let network = '';
const signalNodes = [];
for (let i = 0; i < 38; i++) {
  const a = i / 38 * Math.PI * 2;
  const r = 94 + signalRng() * 189;
  const endR = r + 64 + signalRng() * 100;
  const bend = a + .2 + Math.sin(a * 3) * .23;
  const start = [center[0] + Math.cos(a) * 57, center[1] + Math.sin(a) * 52];
  const middle = [center[0] + Math.cos(bend) * r, center[1] + Math.sin(bend) * r * .78];
  const end = [center[0] + Math.cos(a + .38) * endR, center[1] + Math.sin(a + .38) * endR * .78];
  signalNodes.push(middle);
  network += `<path d="M${pt(start)}Q${pt(middle)} ${pt(end)}" stroke="${i % 9 === 0 ? '#b76f55' : '#aeb9a7'}" stroke-width="${i % 9 === 0 ? '1.2' : '.7'}" opacity="${i % 9 === 0 ? '.64' : '.22'}"/><circle cx="${num(end[0])}" cy="${num(end[1])}" r="${i % 5 === 0 ? 3 : 1.5}" fill="#c4c9b4" opacity=".45"/>`;
}
for (let i = 0; i < signalNodes.length; i++) {
  const from = signalNodes[i];
  const to = signalNodes[(i + 3) % signalNodes.length];
  network += `<path d="M${pt(from)}Q454 343 ${pt(to)}" stroke="#b9c1ab" opacity=".08" stroke-width=".7"/>`;
}
save('azriel', 900, 700, `${projectDefs}<ellipse cx="454" cy="343" rx="390" ry="312" fill="url(#ambient)"/><circle cx="454" cy="343" r="197" fill="url(#ember)"/><g stroke="#d1cfb9"><circle cx="454" cy="343" r="236" opacity=".07" stroke-dasharray="2 9"/><circle cx="454" cy="343" r="157" opacity=".1"/><circle cx="454" cy="343" r="77" opacity=".15"/></g>${network}<circle cx="454" cy="343" r="46" fill="#702d27" opacity=".68"/><circle cx="454" cy="343" r="42" stroke="#c17456" opacity=".65"/><path d="M430 343h48m-24-24v48" stroke="#dfb994" opacity=".4"/><circle cx="454" cy="343" r="4" fill="#dfb994"/>`);

save('grain', 160, 160, '<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".76" numOctaves="3" stitchTiles="stitch" seed="17"/><feColorMatrix type="saturate" values="0"/></filter><path fill="#a5a090" d="M0 0h160v160H0z" filter="url(#grain)" opacity=".25"/>');
