function e(e){for(var t={},n=0,r=e.length;n<r;++n)t[e[n]]=!0;return t}var t,n=["alias","and","BEGIN","begin","break","case","class","def","defined?","do","else","elsif","END","end","ensure","false","for","if","in","module","next","not","or","redo","rescue","retry","return","self","super","then","true","undef","unless","until","when","while","yield","nil","raise","throw","catch","fail","loop","callcc","caller","lambda","proc","public","protected","private","require","load","require_relative","extend","autoload","__END__","__FILE__","__LINE__","__dir__"],r=e(n),i=e(["def","class","case","for","while","until","module","catch","loop","proc","begin"]),a=e(["end","until"]),o={"[":"]","{":"}","(":")"},u={"]":"[","}":"{",")":"("};function l(e,t,n){return n.tokenize.push(e),e(t,n)}function f(e,n){if(e.sol()&&e.match("=begin")&&e.eol())return n.tokenize.push(p),"comment";if(e.eatSpace())return null;var r,i,a,u=e.next();if("`"==u||"'"==u||'"'==u)return l(c(u,"string",'"'==u||"`"==u),e,n);if("/"==u)return function(e){for(var t,n=e.pos,r=0,i=!1,a=!1;null!=(t=e.next());)if(a)a=!1;else{if("[{(".indexOf(t)>-1)r++;else if("]})".indexOf(t)>-1){if(--r<0)break}else if("/"==t&&0==r){i=!0;break}a="\\"==t}return e.backUp(e.pos-n),i}(e)?l(c(u,"string.special",!0),e,n):"operator";if("%"==u){var f="string",s=!0;e.eat("s")?f="atom":e.eat(/[WQ]/)?f="string":e.eat(/[r]/)?f="string.special":e.eat(/[wxq]/)&&(f="string",s=!1);var d=e.eat(/[^\w\s=]/);return d?(o.propertyIsEnumerable(d)&&(d=o[d]),l(c(d,f,s,!0),e,n)):"operator"}if("#"==u)return e.skipToEnd(),"comment";if("<"==u&&(r=e.match(/^<([-~])[\`\"\']?([a-zA-Z_?]\w*)[\`\"\']?(?:;|$)/)))return l((i=r[2],a=r[1],function(e,t){return a&&e.eatSpace(),e.match(i)?t.tokenize.pop():e.skipToEnd(),"string"}),e,n);if("0"==u)return e.eat("x")?e.eatWhile(/[\da-fA-F]/):e.eat("b")?e.eatWhile(/[01]/):e.eatWhile(/[0-7]/),"number";if(/\d/.test(u))return e.match(/^[\d_]*(?:\.[\d_]+)?(?:[eE][+\-]?[\d_]+)?/),"number";if("?"==u){for(;e.match(/^\\[CM]-/););return e.eat("\\")?e.eatWhile(/\w/):e.next(),"string"}if(":"==u)return e.eat("'")?l(c("'","atom",!1),e,n):e.eat('"')?l(c('"',"atom",!0),e,n):e.eat(/[\<\>]/)?(e.eat(/[\<\>]/),"atom"):e.eat(/[\+\-\*\/\&\|\:\!]/)?"atom":e.eat(/[a-zA-Z$@_\xa1-\uffff]/)?(e.eatWhile(/[\w$\xa1-\uffff]/),e.eat(/[\?\!\=]/),"atom"):"operator";if("@"==u&&e.match(/^@?[a-zA-Z_\xa1-\uffff]/))return e.eat("@"),e.eatWhile(/[\w\xa1-\uffff]/),"propertyName";if("$"==u)return e.eat(/[a-zA-Z_]/)?e.eatWhile(/[\w]/):e.eat(/\d/)?e.eat(/\d/):e.next(),"variableName.special";if(/[a-zA-Z_\xa1-\uffff]/.test(u))return e.eatWhile(/[\w\xa1-\uffff]/),e.eat(/[\?\!]/),e.eat(":")?"atom":"variable";if("|"!=u||!n.varList&&"{"!=n.lastTok&&"do"!=n.lastTok){if(/[\(\)\[\]{}\\;]/.test(u))return t=u,null;if("-"==u&&e.eat(">"))return"operator";if(/[=+\-\/*:\.^%<>~|]/.test(u)){var k=e.eatWhile(/[=+\-\/*:\.^%<>~|]/);return"."!=u||k||(t="."),"operator"}return null}return t="|",null}function s(e){return e||(e=1),function(t,n){if("}"==t.peek()){if(1==e)return n.tokenize.pop(),n.tokenize[n.tokenize.length-1](t,n);n.tokenize[n.tokenize.length-1]=s(e-1)}else"{"==t.peek()&&(n.tokenize[n.tokenize.length-1]=s(e+1));return f(t,n)}}function d(){var e=!1;return function(t,n){return e?(n.tokenize.pop(),n.tokenize[n.tokenize.length-1](t,n)):(e=!0,f(t,n))}}function c(e,t,n,r){return function(i,a){var o,u=!1;for("read-quoted-paused"===a.context.type&&(a.context=a.context.prev,i.eat("}"));null!=(o=i.next());){if(o==e&&(r||!u)){a.tokenize.pop();break}if(n&&"#"==o&&!u){if(i.eat("{")){"}"==e&&(a.context={prev:a.context,type:"read-quoted-paused"}),a.tokenize.push(s());break}if(/[@\$]/.test(i.peek())){a.tokenize.push(d());break}}u=!u&&"\\"==o}return t}}function p(e,t){return e.sol()&&e.match("=end")&&e.eol()&&t.tokenize.pop(),e.skipToEnd(),"comment"}const k={name:"ruby",startState:function(e){return{tokenize:[f],indented:0,context:{type:"top",indented:-e},continuedLine:!1,lastTok:null,varList:!1}},token:function(e,n){t=null,e.sol()&&(n.indented=e.indentation());var o,u=n.tokenize[n.tokenize.length-1](e,n),l=t;if("variable"==u){var f=e.current();"keyword"==(u="."==n.lastTok?"property":r.propertyIsEnumerable(e.current())?"keyword":/^[A-Z]/.test(f)?"tag":"def"==n.lastTok||"class"==n.lastTok||n.varList?"def":"variable")&&(l=f,i.propertyIsEnumerable(f)?o="indent":a.propertyIsEnumerable(f)?o="dedent":"if"!=f&&"unless"!=f||e.column()!=e.indentation()?"do"==f&&n.context.indented<n.indented&&(o="indent"):o="indent")}return(t||u&&"comment"!=u)&&(n.lastTok=l),"|"==t&&(n.varList=!n.varList),"indent"==o||/[\(\[\{]/.test(t)?n.context={prev:n.context,type:t||u,indented:n.indented}:("dedent"==o||/[\)\]\}]/.test(t))&&n.context.prev&&(n.context=n.context.prev),e.eol()&&(n.continuedLine="\\"==t||"operator"==u),u},indent:function(e,t,n){if(e.tokenize[e.tokenize.length-1]!=f)return null;var r=t&&t.charAt(0),i=e.context,a=i.type==u[r]||"keyword"==i.type&&/^(?:end|until|else|elsif|when|rescue)\b/.test(t);return i.indented+(a?0:n.unit)+(e.continuedLine?n.unit:0)},languageData:{indentOnInput:/^\s*(?:end|rescue|elsif|else|\})$/,commentTokens:{line:"#"},autocomplete:n}};export{k as ruby};
