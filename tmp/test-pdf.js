const fs = require('fs');
const pdfParse = require('pdf-parse');

globalThis.DOMMatrix = class DOMMatrix {}
globalThis.Path2D = class Path2D {}
globalThis.ImageData = class ImageData {}

async function test() {
  try {
    const buf = fs.readFileSync('lib/rag/templates/fir_template.pdf');
    const res = await pdfParse(buf);
    console.log("SUCCESS TEXT:", res.text.substring(0, 100));
  } catch(e) {
    console.error("FAIL", e);
  }
}
test();
