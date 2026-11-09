import type { NewsItem } from './newsFeeds';
import { editionDate } from './dailySchedule';
import { dailyPriority, deduplicateDailyEvents, isKoreanConsumerReport } from './dailyEditorial';
import { isManualDaily } from './manualDaily';
import { applyDailyRentalPolicy, isDailyAdvertisement, weekendEdition } from './dailyRentals';

/** One edition: today's reports plus the previous evening's held news (5pm onward). */
export function dailySelection(items: NewsItem[], now: Date, korean: boolean) {
  const today = editionDate(now);
  const previous = new Date(`${today}T12:00:00Z`);
  previous.setUTCDate(previous.getUTCDate()-1);
  const yesterday = previous.toISOString().slice(0,10);
  const hour = new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',hourCycle:'h23'});
  const allowAds=weekendEdition(now);
  const rows = items.filter(item => {
    if (!item.date || (!allowAds && isDailyAdvertisement(item))) return false;
    const published = new Date(item.date);
    if (!Number.isFinite(+published) || +published > +now) return false;
    if(item.firstPublishedEdition)return item.firstPublishedEdition===today;
    const day = item.publicationDay ?? editionDate(published);
    return day === today || (day === yesterday && Number(hour.format(published)) >= 17);
  });
  // Reserve explicitly requested articles for this edition, including the rental exception.
  const manual=rows.filter(item=>isManualDaily(item,today));
  const pool=[...applyDailyRentalPolicy(rows.filter(item=>!isManualDaily(item,today)),now),...manual];
  const unique=deduplicateDailyEvents(pool).filter(item=>korean ? item.sourceId!=='daily-la' : item.sourceId==='daily-la');
  // Community relevance selects the pool; publication date controls visible order.
  const priority=[...unique].sort((a,b)=>Number(isDailyAdvertisement(a))-Number(isDailyAdvertisement(b))
    || Number(isKoreanConsumerReport(b))-Number(isKoreanConsumerReport(a))
    || (Number(isManualDaily(b,today))-Number(isManualDaily(a,today)))
    || (korean?dailyPriority(a)-dailyPriority(b):0)
    || (b.publicationDay??editionDate(new Date(b.date!))).localeCompare(a.publicationDay??editionDate(new Date(a.date!)))
    || (b.publicationDay?0:Date.parse(b.date!))-(a.publicationDay?0:Date.parse(a.date!)));
  // From the November 9 Pacific edition, show every eligible news story.
  // Weekend ads may still fill only unused places in the original 40 slots.
  const reserved = unique.filter(item => !isDailyAdvertisement(item)
    && (today >= '2026-11-09' || isKoreanConsumerReport(item))).length;
  const limit = Math.max(40, reserved);
  const selected=priority.slice(0,limit).sort((a,b)=>
    Number(isDailyAdvertisement(a))-Number(isDailyAdvertisement(b))
    || (b.publicationDay??editionDate(new Date(b.date!))).localeCompare(a.publicationDay??editionDate(new Date(a.date!)))
    || (b.publicationDay?0:Date.parse(b.date!))-(a.publicationDay?0:Date.parse(a.date!)));
  return { items: selected };
}
