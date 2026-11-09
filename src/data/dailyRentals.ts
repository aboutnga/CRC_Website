import type { NewsItem } from './newsFeeds';

/** Ordering only: housing reporting stays news; obvious classifieds come last. */
export function isDailyAdvertisement(item:Pick<NewsItem,'title'|'summary'|'url'>):boolean {
  const t=item.title;
  if(/\/ad_(?:rent|property|proshop|market|car|job)\//i.test(item.url))return true;
  if(/\[(?:광고|유료광고|협찬|sponsored|advertisement)\]|\b(?:sponsored content|paid advertisement)\b/i.test(t))return true;
  const housing=/아파트|콘도|베츄러|베드룸|베드|배드|스튜디오|민박|하숙|룸메이트|\b(?:apartment|apt|condo|studio|bedroom|roommate)\b/i.test(t);
  return housing && /조용하고\s*깨끗한|중심가\s*위치|즉시\s*입주|입주\s*가능|(?:아파트|콘도|스튜디오)\s*(?:렌트|리스|임대)\s*$|\b(?:apartment rentals?|roommate wanted)\b|\$\s*[\d,]+|프로모션|파킹|베스|배쓰|베츄러|위치\s*좋은|세탁기.{0,12}포함|정직한\s*가격|\d+\s*(?:베드|배드|베스|배쓰|파킹)|\b(?:for rent|available now|move.in special|\d+\s*(?:br|ba|bed|bath))\b/i.test(t);
}

/** Detect other rental content covered by the existing Sunday fallback. */
export function isRentalNews(item:Pick<NewsItem,'title'|'summary'>):boolean {
  const text=item.title+' '+(item.summary??'');
  if(/(?:넓고|위치\s*좋은|인기\s*많은|중심가|장단기|중단기).*studio\s*apt|(?:콘도|아파트).*\d+\s*(?:배드|베드).*\d+\s*파킹/i.test(item.title))return true;
  return /렌트|렌탈|임대|월세|전세|룸메이트|리스(?=\s|$|기회|매물|정보|안내|계약|료)|리테일\s*공간|\b(?:rent(?:s|al|als|ed|ing)?|renters?|landlords?|tenan(?:t|ts|cy)|leases?|leasing|roommates?|sublets?|subleases?|evictions?)\b/i.test(text);
}
export function weekendEdition(now:Date):boolean {
  const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short'}).format(now);
  return weekday==='Sat'||weekday==='Sun';
}
export function applyDailyRentalPolicy<T extends Pick<NewsItem,'title'|'summary'|'url'>>(items:T[],now:Date):T[] {
  const ads=items.filter(isDailyAdvertisement);
  const regular=items.filter(item=>!isDailyAdvertisement(item));
  const news=regular.filter(item=>!isRentalNews(item));
  const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',weekday:'short'}).format(now);
  const eligible=news.length || weekday!=='Sun' ? news : regular;
  return weekendEdition(now) ? [...eligible,...ads] : eligible;
}