import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nowChanges, nowHeadings, type NowSnapshot } from './now-diff.ts';

const body = `## Making

### [Routines](/projects/routines/)
Text.

### Rebuilding *this* site
Text.

## Into lately

### Learning hockey
`;

test('nowHeadings groups ### under their ## section', () => {
  assert.deepEqual(nowHeadings(body), {
    making: ['Routines', 'Rebuilding this site'],
    into: ['Learning hockey'],
  });
});

const snap = (o: Partial<NowSnapshot>): NowSnapshot => ({
  reading: [], watching: [], links: [], making: [], into: [], ...o,
});

test('three versions produce the right change lines', () => {
  const v1 = snap({ reading: [{ title: 'Dune' }], making: ['Routines'], quote: { text: 'a' } });
  const v2 = snap({
    reading: [{ title: ' dune ' }, { title: 'Piranesi' }],
    watching: [{ title: 'Heated Rivalry' }],
    making: ['Routines', 'The Stacks'],
    quote: { text: 'a' },
  });
  const v3 = snap({
    reading: [{ title: 'Piranesi' }],
    links: [{ title: 'An essay' }],
    into: ['Hockey'],
    quote: { text: 'b' },
  });
  assert.deepEqual(nowChanges(v1), []);
  assert.deepEqual(nowChanges(v2, v1), ['+ reading Piranesi', '+ watched Heated Rivalry', '+ making: The Stacks']);
  assert.deepEqual(nowChanges(v3, v2), [
    '− reading dune',
    '− watched Heated Rivalry',
    '+ link An essay',
    '− making: Routines',
    '− making: The Stacks',
    '+ into: Hockey',
    '~ new quote',
  ]);
});

test('manual changes replace the diff', () => {
  assert.deepEqual(nowChanges(snap({ changes: ['✓ finished Dune'] }), snap({})), ['✓ finished Dune']);
});
