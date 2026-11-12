import assert from 'node:assert/strict';
import { eligibleDaily, deduplicateDailyEvents } from '../src/data/dailyEditorial';
import { dailySelection } from '../src/data/dailySelection';
import { peopleCategory } from '../src/data/sportsEntertainment';
import { commercialSolicitation, nonNewsPage } from '../src/data/newsContentPolicy';
const item=(title:string,date='2026-11-12T15:00:00Z')=>({title,date,url:'https://www.koreadaily.com/article/'+encodeURIComponent(title),sourceId:'news-koreadaily',summary:''});
assert.equal(eligibleDaily(item("'유조선 무덤' 된 호르무즈…기름 범벅 환경재앙 현실화")),false,'Reviewed exclusions must normalize ellipses consistently');
for(const title of ['암보험- 흡연자 이셔서, 당뇨나 혈압이 있으셔서 걱정 이신가요','가주마켓 11월 셋째주 세일 품목!!!!','가족 건강보험 장례보험 메디케어 오바마케어 가입','스피커, 앰프 매매 합니다'])assert.equal(commercialSolicitation(item(title)),true,title);
for(const title of ['쑨원 탄생 160주년 대회…시진핑 조국통일','美中 외교수장, 핵군축 3자회담','줄리 진, 나소카운티 첫 한인의원 유력','미주한상총연, 호스피탈리티 전시회 참여','2027년도 상반기 재외동포단체 지원사업 수요조사 실시'])assert.equal(eligibleDaily(item(title)),false,title);
for(const title of ['LA 싱글아파트 깨끗하고 안전하고 교통편리합니다','한인타운 중심 위치·컨디션·가격 다 잡은 1BED / 1BATH / 1 Parking']){
  assert.equal(dailySelection([item(title)],new Date('2026-11-12T17:00:00Z'),true).items.length,0);
  assert.equal(dailySelection([item(title,'2026-11-14T15:00:00Z')],new Date('2026-11-14T17:00:00Z'),true).items.length,1);
}
const pairs=[['엔비디아 주가 13% 급락 출발','엔비디아 장 초반 13% 급락에 시총 붕괴'],['어바인서 현관문 발길질 유행','어바인서 현관문 발차기 장난 확산'],['개 우리에 갇혀 생매장 된 아기','美서 개 운반용 우리에 갇혀 생매장된 아기']];
for(const [a,b] of pairs){const early=item(a,'2026-11-12T14:00:00Z');assert.deepEqual(deduplicateDailyEvents([item(b),early]),[early]);}
for(const title of ['비티에스그래픽 BTS GRAPHIX',"'뉴진스 민지 닮은' 방예원, 배우 데뷔","'71승 1패' 안세영 유일한 패배 안긴 선수인데...中 왕즈이, 세계 25위 상대 진땀승→8강 진출"])assert.equal(peopleCategory(title),null,title);
assert.equal(peopleCategory('아이유, 새 앨범 발표'),'entertainment');
assert.equal(eligibleDaily(item('LA 식당 폭리 계산서 논란')),true);
assert.equal(eligibleDaily(item('과일·채소 20불 사면 20불 돌려준다…캘프레시 EBT 카드 이용자 대상')),true);
assert.equal(nonNewsPage('<link rel="canonical" href="https://radiokorea.com/rakotel/view.php?uid=681855">'),true);
assert.equal(nonNewsPage('<link rel="canonical" href="https://radiokorea.com/news/article.php?uid=505899">'),false);
console.log('PASS: Nov 12 advertising, politics, organization, weekday rentals, earliest duplicate and celebrity-subject regressions.');
