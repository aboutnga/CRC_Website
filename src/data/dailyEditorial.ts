import { isOrganizationNews } from './organizationNews';
import { sameStory } from './newsDuplicates';
import type { NewsItem } from './newsFeeds';
import { newsSources } from './newsFeeds';
import { US_COMMUNITY_TERMS } from './newsLocality';
import { isExcludedNews } from './newsEditorial';
import { isAllowedDailyHeadline } from './dailyLocality';
import reviewedExclusions from './reviewedDailyHeadlines.json';
const excludedHeadlines=new Set(reviewedExclusions);

const KOREAN_AMERICAN=/한인|미주|재미|교포|동포|한인타운|코리아타운|Korean.American/i;
const US_LOCAL=/남가주|북가주|말리부|어바인|오리건|맨해튼|샌타|산타|샌디|샌프|라스베|브렌트우드|할리우드|헐리우드|벤투라|리버사이드|샌버나디노|패서디나|풀러턴|버뱅크|헌팅턴|롱비치|미시건|위스콘신|애리조나|메릴랜드|펜실베이니아|뉴잉글랜드|노스캐롤라이나|사우스캐롤라이나|보스턴|뉴욕|캐나다|미국인|미국행|미국산|달러|USC|UCLA|TSA|FDA|코스트코|소셜시큐리티/i;
const PRACTICAL=/건강|의료|병원|질환|치료|예방|다리|혈액|백신|약값|메디케어|치매|당뇨|암\s|항공|공항|비행|여권|국적|재외|한국행|귀국|방문|환율|송금|연금|상속|세금|리콜|식품|영주|비자|취업허가|노후|은퇴|주택|렌트|전기|휘발유|개솔린|물가|금리/;
const ANNOUNCEMENTS=/단체\s*소식|이취임|취임식|공식\s*취임|정기총회|창립\s*기념|이사회|축제재단|동문회|향우회|한인회|상공회의소|어워즈|기금\s*모금|후원\s*행사|한인재단.*지원금|사설|오피니언|특별기고|오늘의\s*운세|증권\s*소식|뉴스\s*헤드라인/;
const PROMOTIONS=/프로모션\s*코드|할인\s*코드|고객\s*모집|상품\s*출시|한정판.*출시|매장\s*오픈|타운\s*비지니스|\[(?:부동산|보험|재정|세무)\s*(?:가이드|칼럼)\]/;
const NON_DAILY=/백악관|대변인|전폭기|국방부|군사|교황|평통|진보.*보수|스왈웰|재정적자.*증세|총결산.*세일|폭탄세일|팝업스토어|출사표|기업.*세미나|대학원.*세미나|친목|찬양|선교단|개인전|사진전|작품전|시조.*수상|대회.*대상|\[(?:금요단상|한국춘추|전망대|지평선|핫피플|전문)\]|\[(?:베스트원|케이만남|엘리트골프)|월드\s*파이널|월드시리즈|대표팀|손흥민|오타니|태민|뷔|방탄소년단|빅나티|하츠웨이브|하트시그널|김혜자|오스카|LA다저스|(?<!공공)공연.*홍보/;

/** Prioritize Korean-American coverage; useful Korea-related information is eligible. */
export function isKoreanConsumerReport(item:NewsItem):boolean {
  const source=newsSources.find(source=>source.lang==='ko' && source.id===item.sourceId);
  const context=item.title+' '+(item.summary??'');
  const impersonation=/목소리.{0,15}(?:속아|사칭)|(?:AI|인공지능).{0,18}(?:사칭|피싱)/i.test(context);
  return !!source && (!!source.keywords?.test(context)||impersonation)
    && (!source.requiredKeywords || source.requiredKeywords.test(context))
    && !source.excludeKeywords?.test(item.title);
}

export function dailyPriority(item:NewsItem):number {
  const text=item.title+' '+item.summary;
  if(KOREAN_AMERICAN.test(text))return 0;
  if(US_COMMUNITY_TERMS.test(text)||US_LOCAL.test(text))return 1;
  return 2;
}
/** Reject direct job solicitations, not reporting about employment or wages. */
export function isRecruitmentAd(item:Pick<NewsItem,'title'|'summary'>):boolean {
  const text=item.title+' '+(item.summary??'');
  return /직원\s*모집|사원\s*모집|인재\s*모집|함께\s*일할|채용\s*(?:공고|광고|문의|상담)|\[\s*구인\s*\]|(?:^|[✅✔\s])구인\s+(?!난|시장|동향|건수|감소|증가)|모병관.*(?:직접\s*)?상담|\b(?:now hiring|help wanted|we are hiring|we're hiring|job openings|apply now for (?:a |the )?job)\b/i.test(text);
}
export function eligibleDaily(item:NewsItem):boolean {
  if(excludedHeadlines.has((item.date??'').slice(0,10)+'|'+item.title.normalize('NFKC').trim()))return false;
  if(/종전\s*협상|전후\s*안보|새\s*안보\s*틀|군사\s*동맹|핵\s*협상|외교장관\s*회담|우라늄\s*농축.{0,25}합의|미\s*의회.{0,20}규제법안|재산.{0,12}과세안\s*부결|과세\s*부결|국경.{0,12}검문소\s*재개방/.test(item.title))return false;
  if(/빅세일|최대\s*\d+%\s*할인|사회봉사상.{0,15}후보\s*모집|에세이\s*공모전.{0,12}개최/.test(item.title))return false;
  const context=item.title+' '+(item.summary??'');
  if(/시니어.{0,12}협력\s*MOU|기업.{0,4}지정|화가.{0,35}전시회|빌보드.{0,20}앨범\s*차트/.test(item.title))return false;
  if(/(?:EU|유럽연합).{0,15}출입국시스템|(?:인도|이란).{0,25}(?:공군|작전|간첩)|美\s*제재.{0,8}자체\s*개발/.test(item.title))return false;
  if(/우크라(?:이나)?.{0,20}지원|팔레스타인\s*국기|다카이치.{0,25}악수|추가관세.{0,30}유예|보수\s*연대|선전\s*APEC|외교부|의회\s*브리핑/.test(item.title))return false;
  if(/칼리지\s*페어|college\s*fair/i.test(context)&&/주최|후원|참가|등록|\[알림\]/.test(context))return false;
  if(/아이캠프|초대전|한미우호상|세계\s*회계사대회|\[롤드컵/.test(item.title))return false;
  if(/재정설계|금융\s*전문가/.test(context)&&/포브스.{0,18}최고|전문가.{0,14}합류/.test(item.title))return false;
  if(/젠슨\s*황/.test(context)&&/불륜|포섭|간첩/.test(context)&&!/주가|급락|하락세/.test(item.title))return false;
  if(/농구감독|삼성화재.{0,18}(?:영국|英)/.test(item.title)&&!US_COMMUNITY_TERMS.test(item.title))return false;
  if(isRecruitmentAd(item)||isOrganizationNews(item))return false;
  if(!isAllowedDailyHeadline(item))return false;
  if(/보러\s*오세요|실질적\s*기여\s*약속|외식협.*세미나|봄\s*마켓\s*준비|의료.*시대\s*연다|센터메디컬그룹.*행사|단체.*교류\s*확대|풀러턴.*횡성군|지속.*위로\s*전할/.test(item.title))return false;
  if(isExcludedNews(item)||ANNOUNCEMENTS.test(item.title)||NON_DAILY.test(item.title)||PROMOTIONS.test(item.title+' '+item.summary))return false;
  // Health information is eligible without a U.S. place name; a domestic Korean
  // incident is not automatically useful solely because it mentions a house or flight.
  return isKoreanConsumerReport(item)||dailyPriority(item)<2||/건강.*(?:정보|관리)|혈액|질환|치매|당뇨|백신|한국행|한국.*(?:병원|건강보험|입국|여행)|재외|복수국적|국적.*(?:법|신청)|환율|송금/.test(item.title);
}

/** Known local incidents with heavily rewritten syndicated headlines. */
export function dailyEvent(item:NewsItem):string|null {
  const headline=item.title;
  const month=headline.match(/(\d{1,2})월/)?.[1];
  if(month&&/美|미국/.test(headline)&&/소비자물가|CPI/i.test(headline)&&/0\.4%/.test(headline))return 'us-cpi-'+month+'-0.4';
  if(/월러/.test(headline)&&/12월/.test(headline)&&/50bp|빅스텝/i.test(headline))return 'waller-december-half-point';
  if(/홈디포/.test(headline)&&/천만|1,?000만/.test(headline)&&/절도/.test(headline)&&/유죄/.test(headline))return 'home-depot-theft-verdict';
  if(/FDA|비만약|위고비|마운자로/i.test(headline)&&/비만|위고비|마운자로/.test(headline)&&/시력|실명/.test(headline)&&/경고/.test(headline))return 'fda-glp1-vision-warning';
  if(/앤젤레스\s*국유림/.test(headline)&&/방화/.test(headline)&&/체포/.test(headline))return 'angeles-forest-arson-arrest';
  if(/엔비디아/.test(item.title)&&/젠슨\s*황/.test(item.title)&&/불륜/.test(item.title)&&/급락|하락/.test(item.title))return 'nvidia-huang-price-drop';
  const topic=item.title+' '+(item.summary??'');
  if(/하프\s*마라톤|half.marathon/i.test(item.title)&&/산타바[바버]라|샌타바버라|Santa Barbara/i.test(topic)&&/병원|이송|hospital|fall ill|symptoms/i.test(item.title))return 'santa-barbara-half-marathon-illness';
  if(/CA주\s*하프마라톤/.test(item.title)&&/19명.*병원/.test(item.title))return 'santa-barbara-half-marathon-illness';
  if(/91 Freeway/i.test(item.title)&&/Corona/i.test(item.title)&&/closure/i.test(item.title))return 'corona-91-closure';
  if(/firefighters rescue dog/i.test(item.title)&&/apartment fire/i.test(item.title)&&/Irvine|Southern California/i.test(item.title))return 'irvine-dog-apartment-fire';
  if(/삼성화재/.test(item.title)&&/3조/.test(item.title)&&/보험사/.test(item.title))return 'samsung-insurance-uk-acquisition';
  // One quarterly U.S. GDP bulletin, including forecasts and results, per user request.
  const quarter=item.title.match(/([1-4])\s*분기/);
  if(quarter&&/미국|美|미\s|U\.?S\.?/i.test(item.title)&&/GDP|국내총생산/i.test(item.title))return 'us-gdp-q'+quarter[1];
  if(/말리부/.test(item.title)&&/산불/.test(item.title))return 'malibu-fire';
  if(/오리건/.test(item.title)&&/초등/.test(item.title)&&/총격|총기/.test(item.title))return 'oregon-school-shooting';
  if(/남가주|샌타애나|산타애나/.test(item.title)&&/강풍/.test(item.title)&&/적색경보|산불.*위험/.test(item.title))return 'socal-wind-fire-warning';
  return null;
}
export function deduplicateDailyEvents(rows:NewsItem[]):NewsItem[] {
  const bulletinNumber=(item:NewsItem)=>Number(item.title.match(/^\[(\d+)보\]/)?.[1]??Infinity);
  const sorted=[...rows].sort((a,b)=>Date.parse(a.date!)-Date.parse(b.date!) || bulletinNumber(a)-bulletinNumber(b));
  const winners:NewsItem[]=[];
  for(const item of sorted) {
    if(winners.some(prior=>(prior.sourceId==='daily-la')===(item.sourceId==='daily-la')
      && (sameStory(prior,item)||(dailyEvent(item)&&dailyEvent(prior)===dailyEvent(item)
      &&Math.abs(Date.parse(item.date!)-Date.parse(prior.date!))<48*3600000))))continue;
    winners.push(item);
  }
  return winners;
}

