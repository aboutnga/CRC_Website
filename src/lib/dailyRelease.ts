// A completed early build switches to the new edition on the first request at 6am Pacific.
export async function releaseDaily(context:any,kind:'ko'|'en'|'feed',now=new Date()){
  const url=new URL(context.request.url);
  const zone='America/Los_Angeles';
  const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'numeric',hourCycle:'h23'}).format(now));
  const verify=kind==='feed'&&url.searchParams.has('verification');
  if(hour<6&&!verify){
    const day=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
    const prev=await context.env.ASSETS.fetch(new URL('/previous-daily/'+day+'-'+kind+'.txt',url));
    if(prev.ok&&prev.headers.get('content-type')?.includes('text/plain'))return new Response(prev.body,{headers:{
      'Content-Type':kind==='feed'?'application/json; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store'
    }});
  }
  const asset=await context.next();
  const response=new Response(asset.body,asset);
  response.headers.set('Cache-Control','no-cache, must-revalidate');
  return response;
}
