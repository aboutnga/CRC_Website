import assert from 'node:assert/strict';
import {eligibleDaily,deduplicateDailyEvents} from '../src/data/dailyEditorial';
import {sameStory} from '../src/data/newsDuplicates';
const item=(title:string,date='2026-11-25T15:00:00Z')=>({title,date,url:'https://www.koreadaily.com/article/'+encodeURIComponent(title),sourceId:'news-koreadaily',summary:''});
for(const title of ['KFAM, 한인타운 아웃리치 성료','파바월드 청소년들, 시니어센터 한인들에 추수감사절 온정','휴대폰 내려놓고 성경 속으로…나성순복음교회·미주복음방송 주최','한인여성 10인, 기억을 그리다…카리스마 5주년 그룹전','[Biz & Now] 포니정 영리더상에 배드민턴 안세영, 김도형 교수','추방재판 한인 2년 연속↑… 1년새 29% 급증','[프리즘] 우표 한 장의 꿈, 수출 1조 달러가 되다'])assert(!eligibleDaily(item(title)),title);
for(const title of ['LA 인근 여성, 가짜 컴퓨터 해킹 경고에 2만2천 달러 사기…전액 회수','사기조직 대소탕, 170억불 동결…8개월간 800여명 사법 처리','미중러정상 자리배치 갑론을박…일반적 의전','한인 DACA 수혜자 9개월 새 20% 급감'])assert(eligibleDaily({...item(title),summary:title.startsWith('사기조직')?'미국인의 재산을 노리는 사기 조직':''}),title);
const groups=[
['LA 신규 주택 건축허가 10건 중 4건이 ADU…별채 건축 열풍','LA 신규주택 10채 중 4채 ADU…작년 신규 주택 허가 41.2%'],
['[속보] 美, 한국 등 14개 경제주체에 ‘과잉생산 관세’ 예고','美, 중국 등 14개 경제주체에 과잉생산 관세…韓 15% 상한 유지(종합2보)','EU, 새 美관세에 "유럽, 과잉생산 원천 아냐…15% 상한 준수돼야"','[속보] 美 USTR "한국, 일본, EU 등 관세 15% 상한 유지"'],
['[속보] 美 10월 PCE 물가 전년 대비 3.8%↑…예상치 부합','미 10월 PCE 물가 전년대비 3.8%↑…예상치 부합','美10월 PCE 물가 3.8%↑…12월 금리인상 전망 굳어져(종합)'],
['남가주 해안 덮친 초대형 만조...도로 침수·방파제 뚫려','CA 해안 ‘킹 타이드’ 대피령 확산.. 오늘부터 본격 고비'],
['AI 투자 안해서 웃었다? 애플, 엔비디아 ‘시총 왕좌’ 뺏었다','애플이 1위, 꼴찌는 메타…‘곳간사정’이 가른 M7 판도']
];
for(const group of groups){const first=item(group[0],'2026-11-25T13:00:00Z');assert.deepEqual(deduplicateDailyEvents([...group.slice(1).map(t=>item(t)),first]),[first]);}
assert.equal(deduplicateDailyEvents([item('미국 10월 PCE 물가 3.8% 상승'),item('미국 11월 PCE 물가 3.8% 상승')]).length,2);
assert(sameStory(item('[속보] LA 지역 소비자 보호 새로운 정보 발표'),item('LA 지역 소비자 보호 새로운 정보 발표(종합2보)')));
console.log('PASS: Nov25 event duplicates, earliest reports, publicity and enforcement exclusions; scam, benefits and security reporting preserved');
