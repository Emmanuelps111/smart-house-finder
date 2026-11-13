import { describe, test, expect } from 'bun:test';
import './roommate-math.js';
const { matchScore, rentSplit } = globalThis.SHFRoommateMath;
describe('roommate compatibility', () => {
  const me = { cleanliness: 'High', sleep: 'Early Bird', smoking: 'No Smoking/Drinking' };
  test('identical habits match fully', () => expect(matchScore(me, me).pct).toBe(100));
  test('missing habits are not counted as agreement', () => {
    expect(matchScore(null, me)).toBeNull();
    expect(matchScore({}, me)).toBeNull();
    expect(matchScore({ cleanliness: 'High' }, me).parts).toHaveLength(1);
  });
  test('opposite sleep schedules have low agreement', () => expect(matchScore({ sleep: 'Early Bird' }, { sleep: 'Night Owl' }).pct).toBe(10));
  test('no preference allows either tolerance', () => expect(matchScore({ smoking: 'No Preference' }, me).pct).toBe(100));
  test('unknown smoking options are omitted', () => expect(matchScore({ smoking: 'unknown' }, me)).toBeNull());
});
describe('equal rent contribution estimates', () => {
  test('one requested roommate means two people', () => expect(rentSplit(300000, { roommates_needed: '1', max_budget: 150000 })).toEqual({ rent: 300000, people: 2, share: 150000, save: 150000, approximate: false, fits: true }));
  test('budget below the share does not fit', () => expect(rentSplit(300000, { roommates_needed: '1', max_budget: 149999 }).fits).toBe(false));
  test('4+ is a five-person estimate rather than an exact count', () => expect(rentSplit(300000, { roommates_needed: '4+' })).toEqual({ rent: 300000, people: 5, share: 60000, save: 240000, approximate: true, fits: null }));
  test('rounding never understates a contribution', () => expect(rentSplit(100000, { roommates_needed: '2' }).share).toBe(33334));
  test('invalid rent or count gives no estimate', () => {
    expect(rentSplit(0, { roommates_needed: '1' })).toBeNull();
    expect(rentSplit(300000, { roommates_needed: '999999' })).toBeNull();
  });
});