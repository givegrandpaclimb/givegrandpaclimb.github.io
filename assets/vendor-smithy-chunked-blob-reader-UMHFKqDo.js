async function a(a,n,t=1048576){const e=a.size;let i=0;for(;i<e;){const r=a.slice(i,Math.min(e,i+t));n(new Uint8Array(await r.arrayBuffer())),i+=r.size}}export{a as b};
