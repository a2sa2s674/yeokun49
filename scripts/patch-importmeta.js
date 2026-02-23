/**
 * Post-build 패치: import.meta.env 제거
 *
 * Zustand v5 devtools 미들웨어가 import.meta.env.MODE를 사용하는데,
 * Expo Metro 웹 번들러가 이를 변환하지 못해 런타임 에러 발생.
 * 빌드된 JS 번들에서 import.meta 참조를 안전한 값으로 치환합니다.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.name.endsWith('.js')) {
      files.push(full);
    }
  }
  return files;
}

let patched = 0;

for (const file of walkDir(DIST)) {
  let code = fs.readFileSync(file, 'utf8');
  const original = code;

  // 1) import.meta.env?.MODE 패턴 → "production"
  code = code.replace(
    /import\.meta\.env\?import\.meta\.env\.MODE:void 0/g,
    '"production"'
  );

  // 2) 남은 import.meta.env → undefined
  code = code.replace(/import\.meta\.env/g, 'undefined');

  // 3) 남은 import.meta → ({})
  code = code.replace(/import\.meta/g, '({})');

  if (code !== original) {
    fs.writeFileSync(file, code, 'utf8');
    patched++;
    console.log(`  ✓ Patched: ${path.relative(DIST, file)}`);
  }
}

console.log(`\n✅ import.meta 패치 완료 (${patched}개 파일)`);
