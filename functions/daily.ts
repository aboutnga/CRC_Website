import {releaseDaily} from '../src/lib/dailyRelease';
export const onRequestGet=(context:any)=>releaseDaily(context,'en');
