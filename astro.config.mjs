import { defineConfig } from 'astro/config';
import { mkdir, writeFile, readFile } from 'node:fs/promises';


/**
 * Public base URL, used for canonical and hreflang tags.
 *
 * Do NOT hardcode a guessed pages.dev hostname here — an earlier guess pointed at
 * a different organisation's live site, which would have handed them every
 * canonical link on this site.
 *
 * Resolution order:
 *  1. SITE_URL      — set this in the Cloudflare Pages project once the real
 *                     domain exists (Settings -> Environment variables).
 *  2. CF_PAGES_URL  — set automatically by Cloudflare Pages on every build, so
 *                     deployments are always self-consistent even before step 1.
 *  3. localhost     — local dev and local builds.
 */
const site = process.env.SITE_URL || process.env.CF_PAGES_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  integrations: [{
    name:'prepare-six-am-release',
    hooks:{'astro:build:done':async({dir})=>{
      const now=new Date();
      const tz='America/Los_Angeles';
      const day=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
      const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'numeric',hourCycle:'h23'}).format(now));
      if(process.env.CF_PAGES!=='1'||hour>=6)return;
      const edition=JSON.parse(await readFile('src/data/dailyEdition.json','utf8'));
      if(day!==edition.editionDate)return;
      const target=new URL('./previous-daily/',dir);
      await mkdir(target,{recursive:true});
      for(const [name,path] of [['ko','/ko/daily/'],['en','/daily/'],['feed','/daily-feed.json']]){
        const res=await fetch('https://crcnow.org'+path+'?previous='+now.getTime(),{signal:AbortSignal.timeout(15000)});
        if(!res.ok)throw Error('Could not stage previous daily edition: '+path);
        const body=await res.text();
        if(name==='feed'?!(JSON.parse(body).editionDate<day):!body.includes('daily-heading'))throw Error('Invalid previous edition: '+path);
        await writeFile(new URL(day+'-'+name+'.txt',target),body);
      }
    }}
  }],
});
