const a=(a,r,t)=>{let e,n,s,c=!1;return async r=>(s&&!r?.forceRefresh||(e=await(async()=>{n||(n=a());try{e=await n,s=!0,c=!1}finally{n=void 0}return e})()),e)};export{a as m};
