/* Preserve the visible pose when a higher-priority gesture interrupts a clip.
 * This study contains transform animation only; shape paths and hierarchy match.
 */
(() => {
  const vector=v=>Array.isArray(v)?v:[v];
  const coordinate=(value,index)=>Array.isArray(value)?value[Math.min(index,value.length-1)]:value;
  function curve(x,o,i,index){
    const bx=coordinate(o?.x??0,index),by=coordinate(o?.y??0,index),cx=coordinate(i?.x??1,index),cy=coordinate(i?.y??1,index);
    const cubic=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
    let lo=0,hi=1;
    for(let j=0;j<22;j++){const u=(lo+hi)/2;if(cubic(u,bx,cx)<x)lo=u;else hi=u;}
    return cubic((lo+hi)/2,by,cy);
  }
  function sample(property,frame){
    if(!property?.a)return vector(property?.k??0);
    const keys=property.k;let index=0;
    while(index<keys.length-1&&keys[index+1].t<=frame)index++;
    const a=keys[index],b=keys[index+1],start=vector(a.s??keys[Math.max(0,index-1)].s);
    if(!b||a.h===1||frame<=a.t)return start;
    const end=vector(a.e??b.s??start),t=Math.max(0,Math.min(1,(frame-a.t)/(b.t-a.t)));
    return start.map((v,j)=>v+(end[j]-v)*curve(t,a.o,a.i,j));
  }
  function transforms(data){
    const values=new Map();
    function walk(value,path){
      if(!value||typeof value!=='object')return;
      if(value.ty==='tr')values.set(path,value);
      for(const [key,child]of Object.entries(value))if(typeof child==='object')walk(child,path+'/'+key);
    }
    walk(data,'');return values;
  }
  function bridge(next,previous,frame,frames=12){
    const result=structuredClone(next),old=transforms(previous),fresh=transforms(result);
    const neutral=new Map([...fresh].map(([path,tr])=>[path,Object.fromEntries(['p','s','r','o'].map(key=>[key,sample(tr[key],0)]))]));
    function shift(value){
      if(!value||typeof value!=='object')return;
      if(value.a===1&&Array.isArray(value.k)&&value.k[0]?.t!==undefined){value.k.forEach(k=>k.t+=frames);return;}
      for(const child of Object.values(value))if(typeof child==='object')shift(child);
    }
    shift(result);result.op+=frames;result.layers.forEach(layer=>layer.op+=frames);
    const easing={o:{x:[.16],y:[1]},i:{x:[.3],y:[1]}};
    for(const [path,tr]of fresh){
      const from=old.get(path);if(!from)throw Error('Mascot hierarchy changed: '+path);
      for(const key of ['p','s','r','o']){
        const start=sample(from[key],frame),end=neutral.get(path)[key],property=tr[key];
        if(start.every((value,j)=>Math.abs(value-end[j])<.00001))continue;
        if(property.a===1)property.k.unshift({t:0,s:start,...structuredClone(easing)});
        else tr[key]={a:1,k:[{t:0,s:start,...structuredClone(easing)},{t:frames,s:end}]};
      }
    }
    return result;
  }
  globalThis.MascotPoseBridge={sample,transforms,bridge};
})();
