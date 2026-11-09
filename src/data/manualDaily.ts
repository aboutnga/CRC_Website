import type { NewsItem } from './newsFeeds';
export const MANUAL_EDITION='2026-10-29';
// Explicit user additions for this edition only; preserve original publisher dates.
export const manualDailyItems:NewsItem[]=[
 {sourceId:'news-koreatimes',publisher:'미주한국일보',title:'임대 보증금 마련도 어려운 시대… 신청서 제출 전부터 마련해야',url:'https://www.koreatimes.com/article/11629539',date:'2026-10-28',publicationDay:'2026-10-28',summary:'',firstPublishedEdition:MANUAL_EDITION},
 {sourceId:'news-koreatimes',publisher:'미주한국일보',title:'페어플랜 주택보험료 가주 30% 급등 ‘비상’',url:'https://www.koreatimes.com/article/1634388',date:'2026-10-19',publicationDay:'2026-10-19',summary:'',firstPublishedEdition:MANUAL_EDITION},
 {sourceId:'news-koreatimes',publisher:'미주한국일보',title:'대한항공 ‘갤러리’서 비행 체험… LA 새뮤얼 오신 항공우주센터 개관',url:'https://www.koreatimes.com/article/11629583',date:'2026-10-29',publicationDay:'2026-10-29',summary:'',firstPublishedEdition:MANUAL_EDITION},
];
const november9:NewsItem[]=[
  {sourceId:'news-radiokorea',publisher:'라디오코리아',title:'전기·수도요금 자동이체 주의…요금 폭탄 위험',url:'https://www.radiokorea.com/news/article.php?uid=509173',date:'2026-11-09T19:06:00Z',summary:''},
  {sourceId:'news-koreatownpress',publisher:'코리아타운프레스',title:'"밤엔 피해 가세요" 405 프리웨이 세풀베다 구간 9일부터 야간 통제',url:'https://koreatownpress.org/news/local/405-freeway-sepulveda-night-closure',date:'2026-11-09T19:19:00Z',summary:''},
  {sourceId:'news-radiokorea',publisher:'라디오코리아',title:'맥도날드서 훔친 카드 사용했다 덜미...차량 절도범 체포',url:'https://www.radiokorea.com/news/article.php?uid=509073',date:'2026-11-09T13:33:00Z',summary:''},
  {sourceId:'news-radiokorea',publisher:'라디오코리아',title:'스쿨버스 앞에서도 멈추지 않은 웨이모...연방정부 재조사',url:'https://www.radiokorea.com/news/article.php?uid=509162',date:'2026-11-09T17:50:00Z',summary:''}
];
function reviewedFor(day:string):NewsItem[] {
  if(day===MANUAL_EDITION)return manualDailyItems;
  return day==='2026-11-09'?november9:[];
}
export function isManualDaily(item:NewsItem,day:string):boolean {
 return reviewedFor(day).some(x=>x.url===item.url);
}
export function withManualDaily(items:NewsItem[],day:string):NewsItem[] {
 const reviewed=reviewedFor(day);
 if(!reviewed.length)return items;
 return [...items.filter(item=>!reviewed.some(x=>x.url===item.url||x.title===item.title)),...reviewed];
}
