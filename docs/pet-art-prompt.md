# Prompts de arte — mascotas nuevas (hipogrifo y unicornio)

Objetivo: que las mascotas nuevas sean **indistinguibles en estilo** de
`assets/pets/dragon/`, `assets/pets/fox/` y `assets/pets/panda/`.

**Paso 0 (el más importante):** adjunta `assets/pets/dragon/normal.png` como
imagen de referencia de estilo (`--cref`/`--sref` en Midjourney, "reference image"
en ChatGPT/DALL·E, IP-Adapter o ControlNet en Stable Diffusion) y además usa los
prompts de este documento. La referencia sola no basta y el prompt solo tampoco:
juntos es lo que garantiza el clon de estilo.

## Especificaciones técnicas (obligatorias)

| Requisito | Valor |
|---|---|
| Tamaño | **1024 × 1024 px** (cuadrado; cualquier cuadrado sirve, la app escala con `contain`) |
| Formato | **PNG con transparencia real (alpha)**. Nunca fondo negro, blanco ni de color |
| Composición | Cuerpo completo, sentado de frente, simétrico, centrado, ~85% del cuadro con margen uniforme |
| Sin | marcos, escenarios, sombras en el suelo, texto, marcas de agua |
| Nombres de archivo | `happy.png`, `normal.png`, `sleepy.png`, `sad.png` |
| Ubicación final | `assets/pets/hippogriff/` y `assets/pets/unicorn/` |

## Identidad visual común (no negociable, visto en las referencias)

1. **Contorno negro grueso y uniforme en TODOS los elementos** (cuerpo, ropa, ojos,
   plumas, cola). Sin contorno grueso la imagen está fuera de estilo.
2. **Cabeza gigante: ~55-60% de la altura total.** Cuerpo diminuto debajo.
3. **Cuerpo ancho y regordete**, hombros caídos, base estable (redondo, no flaco).
4. **Ojos enormes casi juntos**: iris con degradado ámbar→marrón, pupila pequeña,
   2-3 brillos blancos grandes, borde negro grueso.
5. **Pijama y gorro con lunas y estrellas amarillas**, ribete blanco, botones
   amarillos, pompón blanco esponjoso grande.
6. **Rubor rosado** en las mejillas.
7. **Cel-shading plano de 2 tonos**: sin degradados pintados, sin brillos 3D,
   sin aerógrafo.
8. **Formas redondeadas y lisas**: sin plumas/pelos puntiagudos, sin texturas finas.
9. **Pose sentada, de frente, simétrica**, con las patas delanteras grandes y
   redondas visibles al frente (con almohadillas).
10. **Fondo transparente real (alpha)**, sin fondo negro ni blanco.

## Colores de pijama (regla)

- Mascotas **normales**: azul (zorro, panda, etc.).
- **Legendarias, cada una con su color propio**:

| Mascota | Pijama y gorro |
|---|---|
| Dragón (ya existe) | Morado |
| Hipogrifo | **Verde esmeralda** |
| Unicornio | **Rosa** |

El patrón es idéntico en todas: lunas + estrellas amarillas, ribete blanco,
botones amarillos, banda blanca en la frente y pompón blanco.

## Bloque STYLE (va SIEMPRE primero)

```
Chibi kawaii mascot, huge round head (60% of total height), tiny wide chubby body,
sitting facing forward, full body centered, occupying 85% of the canvas with even
margins. Bold thick uniform black outlines on every shape, flat cel-shaded colors
with simple 2-tone shading (no painterly gradients, no airbrush), smooth rounded
shapes, no sharp spikes, no fine texture. Very big glossy eyes with a golden-amber
gradient iris, small black pupil, two or three large white highlights, thick black
eye rim, rosy blush cheeks. {PAJAMA}. Flat vector-like cartoon illustration, vibrant
flat colors, perfect symmetry, isolated on a fully transparent background (alpha
channel), no background elements, 1:1 square.
```

Sustituye `{PAJAMA}` por:

- Hipogrifo —
  `Wearing an emerald green pajama set with a yellow crescent-moon and star pattern, white trim and yellow buttons, and a matching emerald green nightcap with a white band across the forehead and a big fluffy white pompom hanging to the side`
- Unicornio —
  `Wearing a rose pink pajama set with a yellow crescent-moon and star pattern, white trim and yellow buttons, and a matching rose pink nightcap with a white band across the forehead and a big fluffy white pompom hanging to the side`

## Bloque CHARACTER (uno por mascota)

- Hipogrifo —
  `A baby hippogriff: front half of a fluffy eagle (light brown and cream feathers, small rounded head, very small cream beak, folded wings against the body) and back half of a pony (smooth light brown coat, short fluffy tail, cream hooves), front legs ending in small round talons, sitting on its hindquarters, soft rounded feathers (not spiky), fluffy cheek tufts giving a wide round silhouette.`
- Unicornio —
  `A baby unicorn foal: white body, pastel lavender-pink mane and tail, small golden spiral horn, cream hooves, rosy inner ears.`

## Bloque MOOD (uno por archivo)

- `happy.png` — `Expression: big joyful open-mouth smile, sparkling happy eyes, both front paws visible.`
- `normal.png` — `Expression: calm neutral face, relaxed half-closed eyes, small closed-mouth smile.`
- `sleepy.png` — `Expression: eyes closed, big yawn with one paw covering the mouth, floating purple "Z z z" letters on the left side.`
- `sad.png` — `Expression: teary glossy eyes, two blue tears running down the cheeks, sad tilted eyebrows, pouting mouth.`

Nota hipogrifo: el happy no lleva dientes ni colmillos (es pico): añade `open beak smile, no teeth`.

## Prompt final

Prompt completo = **STYLE + CHARACTER + MOOD**, en ese orden, sin quitar nada.
Ejemplo (hipogrifo happy, listo para copiar/pegar):

```
Chibi kawaii mascot, huge round head (60% of total height), tiny wide chubby body, sitting facing forward, full body centered, occupying 85% of the canvas with even margins. Bold thick uniform black outlines on every shape, flat cel-shaded colors with simple 2-tone shading (no painterly gradients, no airbrush), smooth rounded shapes, no sharp spikes, no fine texture. Very big glossy eyes with a golden-amber gradient iris, small black pupil, two or three large white highlights, thick black eye rim, rosy blush cheeks. Wearing an emerald green pajama set with a yellow crescent-moon and star pattern, white trim and yellow buttons, and a matching emerald green nightcap with a white band across the forehead and a big fluffy white pompom hanging to the side. A baby hippogriff: front half of a fluffy eagle (light brown and cream feathers, small rounded head, very small cream beak, folded wings against the body) and back half of a pony (smooth light brown coat, short fluffy tail, cream hooves), front legs ending in small round talons, sitting on its hindquarters, soft rounded feathers (not spiky), fluffy cheek tufts giving a wide round silhouette. Flat vector-like cartoon illustration, vibrant flat colors, perfect symmetry, isolated on a fully transparent background (alpha channel), no background elements, 1:1 square. Expression: big joyful open-mouth smile, open beak smile, no teeth, sparkling happy eyes, both front paws visible.
```

## Negative prompt (añádelo siempre si tu herramienta lo soporta)

```
thin outlines, no outlines, soft airbrush shading, painterly, 3D render, realistic,
glossy plastic, black background, white background, colored background, scenery,
landscape, frame, border, text, watermark, signature, extra limbs, extra paws, extra
fingers, deformed anatomy, cropped, cut off, multiple characters, adult proportions,
sharp spiky fur, long neck, thin body
```

## Checklist antes de aceptar una imagen (sí o sí)

1. Contornos negros gruesos en todo.
2. Cabeza ~60% de la altura; cuerpo pequeño y ancho.
3. Ojos enormes con brillos y borde negro.
4. Pijama con lunas/estrellas, ribete blanco, botones, pompón grande.
5. Cel-shading plano (sin sombras pintadas ni 3D).
6. Formas redondeadas, sin púas ni texturas.
7. Fondo transparente real (no negro, no blanco).
8. Sentado, de frente, centrado, cuerpo completo.

Si falla 1, 2, 6 o 7: **regenerar**, no intentar arreglar recortando.

## Si se ve "raro": ajustes rápidos

| Síntoma | Añadir al prompt |
|---|---|
| Se ve flaco | `tiny wide chubby body, round barrel torso, wide base` |
| Cresta o plumas gigantes | `small rounded crest, soft rounded feathers, no spiky feathers` |
| Cola más grande que el cuerpo | `small tail, smaller than the body, tucked behind` |
| Falta el contorno negro | `bold thick black outlines, vector line art, flat colors` |
| Fondo negro/blanco | `transparent background, alpha channel PNG`; si persiste, generar sobre blanco y volverlo transparente |
| Aspecto 3D o pintado | `flat cel shading, 2 flat tones, no gradients, no airbrush` |
| Parece pollito (pico grande) | `very small rounded cream beak, subtle, tiny eagle head` |
| Inclina la cabeza o el gorro | `facing forward, symmetrical, nightcap centered with white band across the forehead` |

## Consejos para consistencia entre los 4 moods

1. Genera primero `normal.png`; cuando quede perfecto, **reutiliza la misma seed**
   y/o úsalo como referencia de personaje para los otros 3 moods.
2. Cambia solo el bloque MOOD; STYLE y CHARACTER deben quedar idénticos.
3. Las 4 imágenes deben tener el mismo gorro, pijama, proporciones y encuadre.
4. Al terminar: crear `assets/pets/hippogriff/` y `assets/pets/unicorn/`, copiar los PNG
   con los 4 nombres exactos y compilar. La app detecta la carpeta sola; mientras
   falten, se ven como "Próximamente".
