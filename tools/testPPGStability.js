// Harness TDD para cadena de estabilidad PPG (1 miss + ancla movil)
// Uso: node tools/testPPGStability.js
// RED: este test debe FALLAR hasta implementar services/PPGStability.js
import { createStability, pushReading, pushMiss } from "../services/PPGStability.js";

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "OK  " : "FAIL"} | ${name}`);
  if (!cond) failures++;
}

const R = (bpm, t = 0) => ({ bpm, conf: 0.7, t });

// 1. Deriva lenta no debe romper (ancla movil): 66..72 paso 1
let s = createStability();
for (let i = 0; i <= 6; i++) s = pushReading(s, R(66 + i, i * 500));
check("deriva lenta 66-72 conserva 7 lecturas", s.chain.length === 7);

// 2. Un miss aislado no resetea
s = createStability();
s = pushReading(s, R(70, 0));
s = pushReading(s, R(71, 500));
s = pushMiss(s);
s = pushReading(s, R(70, 1500));
check("1 miss aislado conserva cadena (3 validas)", s.chain.length === 3);

// 3. Dos misses seguidos si resetean
s = createStability();
s = pushReading(s, R(70, 0));
s = pushReading(s, R(71, 500));
s = pushMiss(s);
s = pushMiss(s);
check("2 misses seguidos resetean cadena", s.chain.length === 0);

// 4. Salto brusco reinicia en el nuevo valor
s = createStability();
s = pushReading(s, R(66, 0));
s = pushReading(s, R(67, 500));
s = pushReading(s, R(120, 1000));
check("salto 67->120 reinicia con [120]", s.chain.length === 1 && s.chain[0].bpm === 120);

console.log(failures === 0 ? "=== 4/4 OK ===" : `=== ${4 - failures}/4 OK, ${failures} FAIL ===`);
process.exit(failures === 0 ? 0 : 1);
