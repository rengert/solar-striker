/* eslint-disable no-magic-numbers */
import { getPilotRank } from './pilot-rank.model';

describe('getPilotRank', () => {
  it('starts as cadet and climbs with the total kills', () => {
    expect(getPilotRank(0)).toEqual({ id: 'cadet', killsToNext: 100 });
    expect(getPilotRank(99)).toEqual({ id: 'cadet', killsToNext: 1 });
    expect(getPilotRank(100)).toEqual({ id: 'ensign', killsToNext: 200 });
    expect(getPilotRank(1600)).toEqual({ id: 'captain', killsToNext: 1400 });
  });

  it('has no next rank at the top', () => {
    expect(getPilotRank(99_999)).toEqual({ id: 'fleetAdmiral', killsToNext: undefined });
  });
});
