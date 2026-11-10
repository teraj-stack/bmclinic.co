import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  fitCamera,
  zoomAt,
  easeInOutQuad,
  topicArms,
  summaryText,
  toggleTopic,
  toggleFeature,
  OVERVIEW,
  MIN_SCALE,
  MAX_SCALE,
} from "../src/lib/symptoms/model";
import { symptomContent } from "../src/lib/symptoms/content";
import { treatmentIntents } from "../src/lib/symptoms/treatment-intent";
import SymptomMap from "../src/components/symptoms/SymptomMap";
import TreatmentNavigator from "../src/components/symptoms/TreatmentNavigator";
test("both specialties expose three groups of six independent topics and four explanation arms", () => {
  for (const content of Object.values(symptomContent)) {
    assert.equal(content.groups.length, 3);
    assert.ok(content.groups.every((g) => g.topics.length === 6));
    const topics = content.groups.flatMap((g) => g.topics);
    assert.equal(new Set(topics.map((t) => t.id)).size, 18);
    for (const t of topics) {
      const arms = topicArms(t);
      assert.equal(arms.length, 4);
      assert.ok(arms.every((a) => a.text.length > 30));
    }
    assert.ok(content.emergency.some((s) => s.includes("112")));
  }
  assert.ok(
    symptomContent.flebologia.emergency.some((s) =>
      s.includes("nie wyklucza zakrzepicy"),
    ),
  );
});
test("overview fits desktop and mobile; anchored zoom preserves the world point and clamps scale", () => {
  for (const viewport of [
    { width: 1100, height: 640 },
    { width: 340, height: 440 },
  ]) {
    const c = fitCamera(OVERVIEW, viewport);
    assert.ok(c.x + OVERVIEW.x * c.scale >= 0);
    assert.ok(c.y + OVERVIEW.y * c.scale >= 0);
    assert.ok(
      c.x + (OVERVIEW.x + OVERVIEW.width) * c.scale <= viewport.width + 1,
    );
    assert.ok(
      c.y + (OVERVIEW.y + OVERVIEW.height) * c.scale <= viewport.height + 1,
    );
    const anchor = { x: viewport.width * 0.4, y: viewport.height * 0.3 },
      z = zoomAt(c, anchor, c.scale * 1.4);
    assert.ok(
      Math.abs((anchor.x - c.x) / c.scale - (anchor.x - z.x) / z.scale) < 1e-8,
    );
    assert.ok(
      Math.abs((anchor.y - c.y) / c.scale - (anchor.y - z.y) / z.scale) < 1e-8,
    );
    assert.equal(zoomAt(c, anchor, 100).scale, MAX_SCALE);
    assert.equal(zoomAt(c, anchor, 0.001).scale, MIN_SCALE);
  }
  assert.equal(easeInOutQuad(0), 0);
  assert.equal(easeInOutQuad(0.5), 0.5);
  assert.equal(easeInOutQuad(1), 1);
});
test("multiple patient-selected topics survive edits; removing one cannot erase the others", () => {
  const initial = {};
  const a = toggleTopic(initial, "pain"),
    b = toggleTopic(a, "bleeding"),
    c = toggleFeature(b, "pain", "Po wypróżnieniu");
  assert.deepEqual(initial, {});
  assert.deepEqual(a.pain.features, []);
  assert.ok(c.bleeding);
  assert.equal(c.pain.features[0], "Po wypróżnieniu");
  const d = toggleTopic(c, "pain");
  assert.ok(d.bleeding);
  assert.equal(d.pain, undefined);
  const text = summaryText(symptomContent.proktologia, {
    ...c,
    pain: {
      ...c.pain,
      note: "Fikcyjna notatka <script>bez uruchamiania</script>",
    },
  });
  assert.match(text, /Ból/);
  assert.match(text, /Krwawienie/);
  assert.match(text, /nie rozpoznanie/);
  assert.match(text, /Fikcyjna notatka/);
});
test("SSR preserves accessible topic controls, reading alternative and emergency advice", () => {
  const html = renderToStaticMarkup(
    createElement(SymptomMap, { specialty: "proktologia" }),
  );
  assert.match(html, /Czytelna lista/);
  assert.match(html, /Miniatura mapy/);
  assert.match(html, /112/);
  assert.match(html, /Otwórz temat: Krwawienie/);
  assert.match(html, /Dotyczy mnie: Ból/);
  assert.match(html, /Pobierz moje podsumowanie/);
});
test("treatment-seeking paths lead with patient goals and respect cosmetic concerns without universal pain claims", () => {
  for (const specialty of ["proktologia", "flebologia"] as const) {
    assert.equal(treatmentIntents[specialty].length, 3);
    const html = renderToStaticMarkup(
      createElement(TreatmentNavigator, { specialty, demo: true }),
    );
    assert.match(html, /Komfort jest indywidualny/);
    assert.doesNotMatch(html, /bezbolesn/i);
  }
  assert.match(treatmentIntents.flebologia[0].intro, /Nie musisz czekać/);
  assert.match(treatmentIntents.proktologia[0].intro, /Nie musisz|nie musisz/);
});
