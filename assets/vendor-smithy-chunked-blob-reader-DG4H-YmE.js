async function t(t,n,a=1048576){const o=t.size;let c=0;for(;c<o;){const r=t.slice(c,Math.min(o,c+a));n(new Uint8Array(await r.arrayBuffer())),c+=r.size}}export{t as b};
