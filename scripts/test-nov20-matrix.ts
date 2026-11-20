import {retainedNews} from '../src/data/newsHistory';
import assert from 'node:assert/strict';
import {eligibleDaily,deduplicateDailyEvents} from '../src/data/dailyEditorial';
import {isExcludedNews} from '../src/data/newsEditorial';
import {peopleCategory} from '../src/data/sportsEntertainment';
import {prepareDailyPublication} from '../src/data/dailyPublication';
import {headlineKey} from '../src/data/newsDuplicates';
import {newsSources} from '../src/data/newsFeeds';
import {dailySelection} from '../src/data/dailySelection';
const story=(title:string,date='2026-11-20T16:00:00Z',url='https://www.koreadaily.com/article/20261120000000000')=>({title,date,url,sourceId:'news-koreadaily',summary:''});
for(const title of ['미주총연, 21일 재외동포 DB 등록 캠페인','남가주사진작가협회 전시회…내달 10일 LA한국문화원서', "소망소사이어티 '웰 에이징' 세미나…30일 에스콘디도서 개최",'한인타운 시니어센터, ‘윤동주 시와 산문’ 특강','[뱅크카드서비스] 제4회 K-프랜차이즈 엑스포, 창업의 새 지평 열다','[가나다 메디컬] "어바인에서 만나는 든든한 내과 주치의"','오스트리아 스파클링 티 ‘메종 티 로열’, 한국 첫 출시','가든그로브 한인타운 알라딘 서점 폐업 세일 12월 1일~15일 2주간','MLB 투수서 배우로…랜스 브로드웨이, 계단서 숨진 채 발견'])assert(!eligibleDaily(story(title)),title);
assert(eligibleDaily(story('미중러정상 자리배치 갑론을박…"中중심 연출" vs "일반적 의전"')));
assert(!isExcludedNews(story('대통령 국가 안보 회의 결과')));
assert(isExcludedNews(story('대통령 국가 안보 선거 유세')));
assert(eligibleDaily(story('[LA 하지정맥외과] 다리 건강의 첫걸음… 올바른 혈액순환 관리')));
assert.equal(peopleCategory("'안세영 없으면 누가 여왕이냐?' 중국 자존심 왕즈이 VS 일본 배드민턴 아이돌 미야자키 정면충돌"),null);
assert.equal(peopleCategory("'손흥민도 못한 대기록 썼다!' 이강인, AFC 올해의 국제선수상 2연패"),'sports');
const early=story('LA 인앤아웃서 한인 모녀 인종차별 폭행 피해…매장 방관 논란에 소송','2026-11-20T02:01:00Z','https://www.radiokorea.com/news/article.php?uid=510200');
assert.deepEqual(deduplicateDailyEvents([story('“인종차별·폭행 방관했다” 한인, 인앤아웃 상대로 소송'),early,story('한인 모녀 인앤아웃 소송…“인종차별 방치”','2026-11-20T03:43:45Z')]),[early]);
const pass=story('399불에 항공편 무제한 탑승','2026-11-20T06:25:58Z');
assert.deepEqual(deduplicateDailyEvents([story("프론티어, 399달러 '연중 무제한 항공 패스' 출시"),pass]),[pass]);
const fraud=story('LA 한인 전화 사기 피해 주의','2026-11-19T16:00:00Z');
const saved={items:[],fortune:null,stocks:null,generatedAt:'2026-11-19T23:00:00Z',editionDate:'2026-11-19',publishedHistory:{}};
const news={items:[fraud],fortune:null,stocks:null};
const now=new Date('2026-11-20T14:00:00Z');
assert.equal(prepareDailyPublication(news,saved,now).items.length,1,'unseen morning fraud must not be treated more strictly');
assert.equal(prepareDailyPublication(news,{...saved,publishedHistory:{['title:'+headlineKey(fraud.title)]:'2026-11-19'}},now).items.length,0,'never recycle already displayed fraud');
const fresh=story('LA 한인 전화 사기 피해 주의');
const fortyFive=Array.from({length:45},(_,i)=>story('LA 생활 정보 '+i, '2026-11-20T17:00:00Z','https://example.com/'+i));
const edition=dailySelection([...fortyFive,fresh],new Date('2026-11-20T18:00:00Z'),true).items;
assert.equal(edition.length,45);
assert(edition.some(x=>x.title===fresh.title),'fraud must have a reserved place ahead of general stories');
console.log('PASS: Nov20 matrix, earliest duplicates, security exception, first-publication fraud and 45-story priority');

for(const source of newsSources.filter(s=>s.lang==='ko')){
 assert(source.keywords?.test('LA 소비자 피해: 제조물 책임 소송'));
 assert(source.keywords?.test('가주 판매 제품 리콜'));
}

assert(!eligibleDaily(story('글로벌어린이재단 감사송년회…12월 4일 활동보고·공연')));
assert(eligibleDaily(story('LA 재단 후원금 횡령 기소')));
assert.equal(deduplicateDailyEvents([story('패서디나 옛 99센트 매장 부지에 289가구 아파트 신축 추진'),story('패서디나에 289가구 아파트 신축 추진','2026-11-20T06:24:00Z')]).length,1);

const contextual={...story('온수기 제조물 책임 소송'),summary:'LA 소비자 피해 관련 보도'};
assert.equal(retainedNews({items:[contextual]},newsSources,+new Date('2026-11-20T18:00:00Z'),true).length,1,'collection retains verified article context after daily edition changes');
assert.equal(retainedNews({items:[{...contextual,summary:'국내 소비자 피해'}]},newsSources,+new Date('2026-11-20T18:00:00Z'),true).length,0);
