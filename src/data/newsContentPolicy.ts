import type { NewsItem } from './newsFeeds';

/** Publisher domains also host business directories and community classifieds. */
export function nonNewsUrl(url:string):boolean {
  try {
    const u=new URL(url);
    return /(?:^|\.)radiokorea\.com$/i.test(u.hostname)
      && (/^\/rakotel\//i.test(u.pathname)
        || (/^\/bulletin\//i.test(u.pathname) && !/^ad_rent$/.test(u.searchParams.get('bo_table')??'')));
  } catch { return false; }
}
export function commercialSolicitation(item:Pick<NewsItem,'title'|'url'>):boolean {
  return nonNewsUrl(item.url) || /세일\s*품목|매매\s*합니다|보험.{0,40}(?:가입\s*$|걱정\s*이신가요)|BTS\s*GRAPHIX|비티에스그래픽|공식\s*분양\s*대행|분양\s*상담|제품\s*공급|판촉\s*활발/i.test(item.title);
}
/** Only inspect the article's canonical URL and explicit advertisement labels. */
export function nonNewsPage(html:string):boolean {
  const canonical=html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1];
  const ogUrl=html.match(/<meta\b[^>]*(?:property|name)=["']og:url["'][^>]*content=["']([^"']+)/i)?.[1];
  return [canonical,ogUrl].some(url=>url && nonNewsUrl(url.replace(/&amp;/g,'&')));
}
