var De=Object.defineProperty;var Oe=(t,e,r)=>e in t?De(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var x=(t,e,r)=>Oe(t,typeof e!="symbol"?e+"":e,r);import{r as C,j as c,m as $,aO as ge,A as ae,aP as Ne,aQ as Le,aR as Be,aS as Me,aT as Ge,G as qe,aU as Fe,F as le,aV as We,aW as Ve,aX as Ze,aY as Ue,aL as fe,aZ as He,a_ as me}from"./index-wkEvcO21.js";function Q(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var P=Q();function ke(t){P=t}var A={exec:()=>null};function m(t,e=""){let r=typeof t=="string"?t:t.source,s={replace:(n,a)=>{let l=typeof a=="string"?a:a.source;return l=l.replace(w.caret,"$1"),r=r.replace(n,l),s},getRegex:()=>new RegExp(r,e)};return s}var Qe=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),w={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}#`),htmlBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}<(?:[a-z].*>|!--)`,"i"),blockquoteBeginRegex:t=>new RegExp(`^ {0,${Math.min(3,t-1)}}>`)},Ke=/^(?:[ \t]*(?:\n|$))+/,Ye=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Xe=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,D=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Je=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,K=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,xe=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,be=m(xe).replace(/bull/g,K).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),et=m(xe).replace(/bull/g,K).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Y=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,tt=/^[^\n]+/,X=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,rt=m(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",X).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),st=m(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,K).getRegex(),F="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",J=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,nt=m("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",J).replace("tag",F).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),ye=m(Y).replace("hr",D).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",F).getRegex(),it=m(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",ye).getRegex(),ee={blockquote:it,code:Ye,def:rt,fences:Xe,heading:Je,hr:D,html:nt,lheading:be,list:st,newline:Ke,paragraph:ye,table:A,text:tt},oe=m("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",D).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",F).getRegex(),at={...ee,lheading:et,table:oe,paragraph:m(Y).replace("hr",D).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",oe).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",F).getRegex()},lt={...ee,html:m(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",J).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:A,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:m(Y).replace("hr",D).replace("heading",` *#{1,6} *[^
]`).replace("lheading",be).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},ot=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,ct=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,we=/^( {2,}|\\)\n(?!\s*$)/,pt=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,W=/[\p{P}\p{S}]/u,te=/[\s\p{P}\p{S}]/u,Se=/[^\s\p{P}\p{S}]/u,ht=m(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,te).getRegex(),Re=/(?!~)[\p{P}\p{S}]/u,ut=/(?!~)[\s\p{P}\p{S}]/u,dt=/(?:[^\s\p{P}\p{S}]|~)/u,ve=/(?![*_])[\p{P}\p{S}]/u,gt=/(?![*_])[\s\p{P}\p{S}]/u,ft=/(?:[^\s\p{P}\p{S}]|[*_])/u,mt=m(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",Qe?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),Ce=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,kt=m(Ce,"u").replace(/punct/g,W).getRegex(),xt=m(Ce,"u").replace(/punct/g,Re).getRegex(),Ae="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",bt=m(Ae,"gu").replace(/notPunctSpace/g,Se).replace(/punctSpace/g,te).replace(/punct/g,W).getRegex(),yt=m(Ae,"gu").replace(/notPunctSpace/g,dt).replace(/punctSpace/g,ut).replace(/punct/g,Re).getRegex(),wt=m("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,Se).replace(/punctSpace/g,te).replace(/punct/g,W).getRegex(),St=m(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,ve).getRegex(),Rt="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",vt=m(Rt,"gu").replace(/notPunctSpace/g,ft).replace(/punctSpace/g,gt).replace(/punct/g,ve).getRegex(),Ct=m(/\\(punct)/,"gu").replace(/punct/g,W).getRegex(),At=m(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Tt=m(J).replace("(?:-->|$)","-->").getRegex(),Pt=m("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Tt).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),M=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,Et=m(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label",M).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Te=m(/^!?\[(label)\]\[(ref)\]/).replace("label",M).replace("ref",X).getRegex(),Pe=m(/^!?\[(ref)\](?:\[\])?/).replace("ref",X).getRegex(),$t=m("reflink|nolink(?!\\()","g").replace("reflink",Te).replace("nolink",Pe).getRegex(),ce=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,re={_backpedal:A,anyPunctuation:Ct,autolink:At,blockSkip:mt,br:we,code:ct,del:A,delLDelim:A,delRDelim:A,emStrongLDelim:kt,emStrongRDelimAst:bt,emStrongRDelimUnd:wt,escape:ot,link:Et,nolink:Pe,punctuation:ht,reflink:Te,reflinkSearch:$t,tag:Pt,text:pt,url:A},jt={...re,link:m(/^!?\[(label)\]\((.*?)\)/).replace("label",M).getRegex(),reflink:m(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",M).getRegex()},Z={...re,emStrongRDelimAst:yt,emStrongLDelim:xt,delLDelim:St,delRDelim:vt,url:m(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",ce).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:m(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",ce).getRegex()},It={...Z,br:m(we).replace("{2,}","*").getRegex(),text:m(Z.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},N={normal:ee,gfm:at,pedantic:lt},I={normal:re,gfm:Z,breaks:It,pedantic:jt},zt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},pe=t=>zt[t];function v(t,e){if(e){if(w.escapeTest.test(t))return t.replace(w.escapeReplace,pe)}else if(w.escapeTestNoEncode.test(t))return t.replace(w.escapeReplaceNoEncode,pe);return t}function he(t){try{t=encodeURI(t).replace(w.percentDecode,"%")}catch{return null}return t}function ue(t,e){var a;let r=t.replace(w.findPipe,(l,i,p)=>{let o=!1,h=i;for(;--h>=0&&p[h]==="\\";)o=!o;return o?"|":" |"}),s=r.split(w.splitPipe),n=0;if(s[0].trim()||s.shift(),s.length>0&&!((a=s.at(-1))!=null&&a.trim())&&s.pop(),e)if(s.length>e)s.splice(e);else for(;s.length<e;)s.push("");for(;n<s.length;n++)s[n]=s[n].trim().replace(w.slashPipe,"|");return s}function z(t,e,r){let s=t.length;if(s===0)return"";let n=0;for(;n<s&&t.charAt(s-n-1)===e;)n++;return t.slice(0,s-n)}function _t(t,e){if(t.indexOf(e[1])===-1)return-1;let r=0;for(let s=0;s<t.length;s++)if(t[s]==="\\")s++;else if(t[s]===e[0])r++;else if(t[s]===e[1]&&(r--,r<0))return s;return r>0?-2:-1}function Dt(t,e=0){let r=e,s="";for(let n of t)if(n==="	"){let a=4-r%4;s+=" ".repeat(a),r+=a}else s+=n,r++;return s}function de(t,e,r,s,n){let a=e.href,l=e.title||null,i=t[1].replace(n.other.outputLinkReplace,"$1");s.state.inLink=!0;let p={type:t[0].charAt(0)==="!"?"image":"link",raw:r,href:a,title:l,text:i,tokens:s.inlineTokens(i)};return s.state.inLink=!1,p}function Ot(t,e,r){let s=t.match(r.other.indentCodeCompensation);if(s===null)return e;let n=s[1];return e.split(`
`).map(a=>{let l=a.match(r.other.beginningSpace);if(l===null)return a;let[i]=l;return i.length>=n.length?a.slice(n.length):a}).join(`
`)}var G=class{constructor(t){x(this,"options");x(this,"rules");x(this,"lexer");this.options=t||P}space(t){let e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){let e=this.rules.block.code.exec(t);if(e){let r=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?r:z(r,`
`)}}}fences(t){let e=this.rules.block.fences.exec(t);if(e){let r=e[0],s=Ot(r,e[3]||"",this.rules);return{type:"code",raw:r,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:s}}}heading(t){let e=this.rules.block.heading.exec(t);if(e){let r=e[2].trim();if(this.rules.other.endingHash.test(r)){let s=z(r,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(r=s.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:r,tokens:this.lexer.inline(r)}}}hr(t){let e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:z(e[0],`
`)}}blockquote(t){let e=this.rules.block.blockquote.exec(t);if(e){let r=z(e[0],`
`).split(`
`),s="",n="",a=[];for(;r.length>0;){let l=!1,i=[],p;for(p=0;p<r.length;p++)if(this.rules.other.blockquoteStart.test(r[p]))i.push(r[p]),l=!0;else if(!l)i.push(r[p]);else break;r=r.slice(p);let o=i.join(`
`),h=o.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${o}`:o,n=n?`${n}
${h}`:h;let g=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(h,a,!0),this.lexer.state.top=g,r.length===0)break;let d=a.at(-1);if((d==null?void 0:d.type)==="code")break;if((d==null?void 0:d.type)==="blockquote"){let u=d,b=u.raw+`
`+r.join(`
`),f=this.blockquote(b);a[a.length-1]=f,s=s.substring(0,s.length-u.raw.length)+f.raw,n=n.substring(0,n.length-u.text.length)+f.text;break}else if((d==null?void 0:d.type)==="list"){let u=d,b=u.raw+`
`+r.join(`
`),f=this.list(b);a[a.length-1]=f,s=s.substring(0,s.length-d.raw.length)+f.raw,n=n.substring(0,n.length-u.raw.length)+f.raw,r=b.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:a,text:n}}}list(t){var r,s;let e=this.rules.block.list.exec(t);if(e){let n=e[1].trim(),a=n.length>1,l={type:"list",raw:"",ordered:a,start:a?+n.slice(0,-1):"",loose:!1,items:[]};n=a?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=a?n:"[*+-]");let i=this.rules.other.listItemRegex(n),p=!1;for(;t;){let h=!1,g="",d="";if(!(e=i.exec(t))||this.rules.block.hr.test(t))break;g=e[0],t=t.substring(g.length);let u=Dt(e[2].split(`
`,1)[0],e[1].length),b=t.split(`
`,1)[0],f=!u.trim(),y=0;if(this.options.pedantic?(y=2,d=u.trimStart()):f?y=e[1].length+1:(y=u.search(this.rules.other.nonSpaceChar),y=y>4?1:y,d=u.slice(y),y+=e[1].length),f&&this.rules.other.blankLine.test(b)&&(g+=b+`
`,t=t.substring(b.length+1),h=!0),!h){let E=this.rules.other.nextBulletRegex(y),O=this.rules.other.hrRegex(y),ne=this.rules.other.fencesBeginRegex(y),ie=this.rules.other.headingBeginRegex(y),ze=this.rules.other.htmlBeginRegex(y),_e=this.rules.other.blockquoteBeginRegex(y);for(;t;){let V=t.split(`
`,1)[0],j;if(b=V,this.options.pedantic?(b=b.replace(this.rules.other.listReplaceNesting,"  "),j=b):j=b.replace(this.rules.other.tabCharGlobal,"    "),ne.test(b)||ie.test(b)||ze.test(b)||_e.test(b)||E.test(b)||O.test(b))break;if(j.search(this.rules.other.nonSpaceChar)>=y||!b.trim())d+=`
`+j.slice(y);else{if(f||u.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||ne.test(u)||ie.test(u)||O.test(u))break;d+=`
`+b}f=!b.trim(),g+=V+`
`,t=t.substring(V.length+1),u=j.slice(y)}}l.loose||(p?l.loose=!0:this.rules.other.doubleBlankLine.test(g)&&(p=!0)),l.items.push({type:"list_item",raw:g,task:!!this.options.gfm&&this.rules.other.listIsTask.test(d),loose:!1,text:d,tokens:[]}),l.raw+=g}let o=l.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;l.raw=l.raw.trimEnd();for(let h of l.items){if(this.lexer.state.top=!1,h.tokens=this.lexer.blockTokens(h.text,[]),h.task){if(h.text=h.text.replace(this.rules.other.listReplaceTask,""),((r=h.tokens[0])==null?void 0:r.type)==="text"||((s=h.tokens[0])==null?void 0:s.type)==="paragraph"){h.tokens[0].raw=h.tokens[0].raw.replace(this.rules.other.listReplaceTask,""),h.tokens[0].text=h.tokens[0].text.replace(this.rules.other.listReplaceTask,"");for(let d=this.lexer.inlineQueue.length-1;d>=0;d--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[d].src)){this.lexer.inlineQueue[d].src=this.lexer.inlineQueue[d].src.replace(this.rules.other.listReplaceTask,"");break}}let g=this.rules.other.listTaskCheckbox.exec(h.raw);if(g){let d={type:"checkbox",raw:g[0]+" ",checked:g[0]!=="[ ]"};h.checked=d.checked,l.loose?h.tokens[0]&&["paragraph","text"].includes(h.tokens[0].type)&&"tokens"in h.tokens[0]&&h.tokens[0].tokens?(h.tokens[0].raw=d.raw+h.tokens[0].raw,h.tokens[0].text=d.raw+h.tokens[0].text,h.tokens[0].tokens.unshift(d)):h.tokens.unshift({type:"paragraph",raw:d.raw,text:d.raw,tokens:[d]}):h.tokens.unshift(d)}}if(!l.loose){let g=h.tokens.filter(u=>u.type==="space"),d=g.length>0&&g.some(u=>this.rules.other.anyLine.test(u.raw));l.loose=d}}if(l.loose)for(let h of l.items){h.loose=!0;for(let g of h.tokens)g.type==="text"&&(g.type="paragraph")}return l}}html(t){let e=this.rules.block.html.exec(t);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(t){let e=this.rules.block.def.exec(t);if(e){let r=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",n=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:r,raw:e[0],href:s,title:n}}}table(t){var l;let e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let r=ue(e[1]),s=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),n=(l=e[3])!=null&&l.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:e[0],header:[],align:[],rows:[]};if(r.length===s.length){for(let i of s)this.rules.other.tableAlignRight.test(i)?a.align.push("right"):this.rules.other.tableAlignCenter.test(i)?a.align.push("center"):this.rules.other.tableAlignLeft.test(i)?a.align.push("left"):a.align.push(null);for(let i=0;i<r.length;i++)a.header.push({text:r[i],tokens:this.lexer.inline(r[i]),header:!0,align:a.align[i]});for(let i of n)a.rows.push(ue(i,a.header.length).map((p,o)=>({text:p,tokens:this.lexer.inline(p),header:!1,align:a.align[o]})));return a}}lheading(t){let e=this.rules.block.lheading.exec(t);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(t){let e=this.rules.block.paragraph.exec(t);if(e){let r=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:r,tokens:this.lexer.inline(r)}}}text(t){let e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){let e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){let e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){let e=this.rules.inline.link.exec(t);if(e){let r=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let a=z(r.slice(0,-1),"\\");if((r.length-a.length)%2===0)return}else{let a=_t(e[2],"()");if(a===-2)return;if(a>-1){let l=(e[0].indexOf("!")===0?5:4)+e[1].length+a;e[2]=e[2].substring(0,a),e[0]=e[0].substring(0,l).trim(),e[3]=""}}let s=e[2],n="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(s);a&&(s=a[1],n=a[3])}else n=e[3]?e[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?s=s.slice(1):s=s.slice(1,-1)),de(e,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:n&&n.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let r;if((r=this.rules.inline.reflink.exec(t))||(r=this.rules.inline.nolink.exec(t))){let s=(r[2]||r[1]).replace(this.rules.other.multipleSpaceGlobal," "),n=e[s.toLowerCase()];if(!n){let a=r[0].charAt(0);return{type:"text",raw:a,text:a}}return de(r,n,r[0],this.lexer,this.rules)}}emStrong(t,e,r=""){let s=this.rules.inline.emStrongLDelim.exec(t);if(!(!s||s[3]&&r.match(this.rules.other.unicodeAlphaNumeric))&&(!(s[1]||s[2])||!r||this.rules.inline.punctuation.exec(r))){let n=[...s[0]].length-1,a,l,i=n,p=0,o=s[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(o.lastIndex=0,e=e.slice(-1*t.length+n);(s=o.exec(e))!=null;){if(a=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!a)continue;if(l=[...a].length,s[3]||s[4]){i+=l;continue}else if((s[5]||s[6])&&n%3&&!((n+l)%3)){p+=l;continue}if(i-=l,i>0)continue;l=Math.min(l,l+i+p);let h=[...s[0]][0].length,g=t.slice(0,n+s.index+h+l);if(Math.min(n,l)%2){let u=g.slice(1,-1);return{type:"em",raw:g,text:u,tokens:this.lexer.inlineTokens(u)}}let d=g.slice(2,-2);return{type:"strong",raw:g,text:d,tokens:this.lexer.inlineTokens(d)}}}}codespan(t){let e=this.rules.inline.code.exec(t);if(e){let r=e[2].replace(this.rules.other.newLineCharGlobal," "),s=this.rules.other.nonSpaceChar.test(r),n=this.rules.other.startingSpaceChar.test(r)&&this.rules.other.endingSpaceChar.test(r);return s&&n&&(r=r.substring(1,r.length-1)),{type:"codespan",raw:e[0],text:r}}}br(t){let e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t,e,r=""){let s=this.rules.inline.delLDelim.exec(t);if(s&&(!s[1]||!r||this.rules.inline.punctuation.exec(r))){let n=[...s[0]].length-1,a,l,i=n,p=this.rules.inline.delRDelim;for(p.lastIndex=0,e=e.slice(-1*t.length+n);(s=p.exec(e))!=null;){if(a=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!a||(l=[...a].length,l!==n))continue;if(s[3]||s[4]){i+=l;continue}if(i-=l,i>0)continue;l=Math.min(l,l+i);let o=[...s[0]][0].length,h=t.slice(0,n+s.index+o+l),g=h.slice(n,-n);return{type:"del",raw:h,text:g,tokens:this.lexer.inlineTokens(g)}}}}autolink(t){let e=this.rules.inline.autolink.exec(t);if(e){let r,s;return e[2]==="@"?(r=e[1],s="mailto:"+r):(r=e[1],s=r),{type:"link",raw:e[0],text:r,href:s,tokens:[{type:"text",raw:r,text:r}]}}}url(t){var r;let e;if(e=this.rules.inline.url.exec(t)){let s,n;if(e[2]==="@")s=e[0],n="mailto:"+s;else{let a;do a=e[0],e[0]=((r=this.rules.inline._backpedal.exec(e[0]))==null?void 0:r[0])??"";while(a!==e[0]);s=e[0],e[1]==="www."?n="http://"+e[0]:n=e[0]}return{type:"link",raw:e[0],text:s,href:n,tokens:[{type:"text",raw:s,text:s}]}}}inlineText(t){let e=this.rules.inline.text.exec(t);if(e){let r=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:r}}}},S=class U{constructor(e){x(this,"tokens");x(this,"options");x(this,"state");x(this,"inlineQueue");x(this,"tokenizer");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||P,this.options.tokenizer=this.options.tokenizer||new G,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let r={other:w,block:N.normal,inline:I.normal};this.options.pedantic?(r.block=N.pedantic,r.inline=I.pedantic):this.options.gfm&&(r.block=N.gfm,this.options.breaks?r.inline=I.breaks:r.inline=I.gfm),this.tokenizer.rules=r}static get rules(){return{block:N,inline:I}}static lex(e,r){return new U(r).lex(e)}static lexInline(e,r){return new U(r).inlineTokens(e)}lex(e){e=e.replace(w.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let r=0;r<this.inlineQueue.length;r++){let s=this.inlineQueue[r];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,r=[],s=!1){var n,a,l;for(this.options.pedantic&&(e=e.replace(w.tabCharGlobal,"    ").replace(w.spaceLine,""));e;){let i;if((a=(n=this.options.extensions)==null?void 0:n.block)!=null&&a.some(o=>(i=o.call({lexer:this},e,r))?(e=e.substring(i.raw.length),r.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let o=r.at(-1);i.raw.length===1&&o!==void 0?o.raw+=`
`:r.push(i);continue}if(i=this.tokenizer.code(e)){e=e.substring(i.raw.length);let o=r.at(-1);(o==null?void 0:o.type)==="paragraph"||(o==null?void 0:o.type)==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.at(-1).src=o.text):r.push(i);continue}if(i=this.tokenizer.fences(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.heading(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.hr(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.blockquote(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.list(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.html(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.def(e)){e=e.substring(i.raw.length);let o=r.at(-1);(o==null?void 0:o.type)==="paragraph"||(o==null?void 0:o.type)==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.raw,this.inlineQueue.at(-1).src=o.text):this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title},r.push(i));continue}if(i=this.tokenizer.table(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.lheading(e)){e=e.substring(i.raw.length),r.push(i);continue}let p=e;if((l=this.options.extensions)!=null&&l.startBlock){let o=1/0,h=e.slice(1),g;this.options.extensions.startBlock.forEach(d=>{g=d.call({lexer:this},h),typeof g=="number"&&g>=0&&(o=Math.min(o,g))}),o<1/0&&o>=0&&(p=e.substring(0,o+1))}if(this.state.top&&(i=this.tokenizer.paragraph(p))){let o=r.at(-1);s&&(o==null?void 0:o.type)==="paragraph"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):r.push(i),s=p.length!==e.length,e=e.substring(i.raw.length);continue}if(i=this.tokenizer.text(e)){e=e.substring(i.raw.length);let o=r.at(-1);(o==null?void 0:o.type)==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):r.push(i);continue}if(e){let o="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(o);break}else throw new Error(o)}}return this.state.top=!0,r}inline(e,r=[]){return this.inlineQueue.push({src:e,tokens:r}),r}inlineTokens(e,r=[]){var p,o,h,g,d;let s=e,n=null;if(this.tokens.links){let u=Object.keys(this.tokens.links);if(u.length>0)for(;(n=this.tokenizer.rules.inline.reflinkSearch.exec(s))!=null;)u.includes(n[0].slice(n[0].lastIndexOf("[")+1,-1))&&(s=s.slice(0,n.index)+"["+"a".repeat(n[0].length-2)+"]"+s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(n=this.tokenizer.rules.inline.anyPunctuation.exec(s))!=null;)s=s.slice(0,n.index)+"++"+s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let a;for(;(n=this.tokenizer.rules.inline.blockSkip.exec(s))!=null;)a=n[2]?n[2].length:0,s=s.slice(0,n.index+a)+"["+"a".repeat(n[0].length-a-2)+"]"+s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);s=((o=(p=this.options.hooks)==null?void 0:p.emStrongMask)==null?void 0:o.call({lexer:this},s))??s;let l=!1,i="";for(;e;){l||(i=""),l=!1;let u;if((g=(h=this.options.extensions)==null?void 0:h.inline)!=null&&g.some(f=>(u=f.call({lexer:this},e,r))?(e=e.substring(u.raw.length),r.push(u),!0):!1))continue;if(u=this.tokenizer.escape(e)){e=e.substring(u.raw.length),r.push(u);continue}if(u=this.tokenizer.tag(e)){e=e.substring(u.raw.length),r.push(u);continue}if(u=this.tokenizer.link(e)){e=e.substring(u.raw.length),r.push(u);continue}if(u=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(u.raw.length);let f=r.at(-1);u.type==="text"&&(f==null?void 0:f.type)==="text"?(f.raw+=u.raw,f.text+=u.text):r.push(u);continue}if(u=this.tokenizer.emStrong(e,s,i)){e=e.substring(u.raw.length),r.push(u);continue}if(u=this.tokenizer.codespan(e)){e=e.substring(u.raw.length),r.push(u);continue}if(u=this.tokenizer.br(e)){e=e.substring(u.raw.length),r.push(u);continue}if(u=this.tokenizer.del(e,s,i)){e=e.substring(u.raw.length),r.push(u);continue}if(u=this.tokenizer.autolink(e)){e=e.substring(u.raw.length),r.push(u);continue}if(!this.state.inLink&&(u=this.tokenizer.url(e))){e=e.substring(u.raw.length),r.push(u);continue}let b=e;if((d=this.options.extensions)!=null&&d.startInline){let f=1/0,y=e.slice(1),E;this.options.extensions.startInline.forEach(O=>{E=O.call({lexer:this},y),typeof E=="number"&&E>=0&&(f=Math.min(f,E))}),f<1/0&&f>=0&&(b=e.substring(0,f+1))}if(u=this.tokenizer.inlineText(b)){e=e.substring(u.raw.length),u.raw.slice(-1)!=="_"&&(i=u.raw.slice(-1)),l=!0;let f=r.at(-1);(f==null?void 0:f.type)==="text"?(f.raw+=u.raw,f.text+=u.text):r.push(u);continue}if(e){let f="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(f);break}else throw new Error(f)}}return r}},q=class{constructor(t){x(this,"options");x(this,"parser");this.options=t||P}space(t){return""}code({text:t,lang:e,escaped:r}){var a;let s=(a=(e||"").match(w.notSpaceStart))==null?void 0:a[0],n=t.replace(w.endingNewline,"")+`
`;return s?'<pre><code class="language-'+v(s)+'">'+(r?n:v(n,!0))+`</code></pre>
`:"<pre><code>"+(r?n:v(n,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}def(t){return""}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){let e=t.ordered,r=t.start,s="";for(let l=0;l<t.items.length;l++){let i=t.items[l];s+=this.listitem(i)}let n=e?"ol":"ul",a=e&&r!==1?' start="'+r+'"':"";return"<"+n+a+`>
`+s+"</"+n+`>
`}listitem(t){return`<li>${this.parser.parse(t.tokens)}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",r="";for(let n=0;n<t.header.length;n++)r+=this.tablecell(t.header[n]);e+=this.tablerow({text:r});let s="";for(let n=0;n<t.rows.length;n++){let a=t.rows[n];r="";for(let l=0;l<a.length;l++)r+=this.tablecell(a[l]);s+=this.tablerow({text:r})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+s+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){let e=this.parser.parseInline(t.tokens),r=t.header?"th":"td";return(t.align?`<${r} align="${t.align}">`:`<${r}>`)+e+`</${r}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${v(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:r}){let s=this.parser.parseInline(r),n=he(t);if(n===null)return s;t=n;let a='<a href="'+t+'"';return e&&(a+=' title="'+v(e)+'"'),a+=">"+s+"</a>",a}image({href:t,title:e,text:r,tokens:s}){s&&(r=this.parser.parseInline(s,this.parser.textRenderer));let n=he(t);if(n===null)return v(r);t=n;let a=`<img src="${t}" alt="${v(r)}"`;return e&&(a+=` title="${v(e)}"`),a+=">",a}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:v(t.text)}},se=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}checkbox({raw:t}){return t}},R=class H{constructor(e){x(this,"options");x(this,"renderer");x(this,"textRenderer");this.options=e||P,this.options.renderer=this.options.renderer||new q,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new se}static parse(e,r){return new H(r).parse(e)}static parseInline(e,r){return new H(r).parseInline(e)}parse(e){var s,n;let r="";for(let a=0;a<e.length;a++){let l=e[a];if((n=(s=this.options.extensions)==null?void 0:s.renderers)!=null&&n[l.type]){let p=l,o=this.options.extensions.renderers[p.type].call({parser:this},p);if(o!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(p.type)){r+=o||"";continue}}let i=l;switch(i.type){case"space":{r+=this.renderer.space(i);break}case"hr":{r+=this.renderer.hr(i);break}case"heading":{r+=this.renderer.heading(i);break}case"code":{r+=this.renderer.code(i);break}case"table":{r+=this.renderer.table(i);break}case"blockquote":{r+=this.renderer.blockquote(i);break}case"list":{r+=this.renderer.list(i);break}case"checkbox":{r+=this.renderer.checkbox(i);break}case"html":{r+=this.renderer.html(i);break}case"def":{r+=this.renderer.def(i);break}case"paragraph":{r+=this.renderer.paragraph(i);break}case"text":{r+=this.renderer.text(i);break}default:{let p='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(p),"";throw new Error(p)}}}return r}parseInline(e,r=this.renderer){var n,a;let s="";for(let l=0;l<e.length;l++){let i=e[l];if((a=(n=this.options.extensions)==null?void 0:n.renderers)!=null&&a[i.type]){let o=this.options.extensions.renderers[i.type].call({parser:this},i);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){s+=o||"";continue}}let p=i;switch(p.type){case"escape":{s+=r.text(p);break}case"html":{s+=r.html(p);break}case"link":{s+=r.link(p);break}case"image":{s+=r.image(p);break}case"checkbox":{s+=r.checkbox(p);break}case"strong":{s+=r.strong(p);break}case"em":{s+=r.em(p);break}case"codespan":{s+=r.codespan(p);break}case"br":{s+=r.br(p);break}case"del":{s+=r.del(p);break}case"text":{s+=r.text(p);break}default:{let o='Token with "'+p.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return s}},B,_=(B=class{constructor(t){x(this,"options");x(this,"block");this.options=t||P}preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}emStrongMask(t){return t}provideLexer(){return this.block?S.lex:S.lexInline}provideParser(){return this.block?R.parse:R.parseInline}},x(B,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens","emStrongMask"])),x(B,"passThroughHooksRespectAsync",new Set(["preprocess","postprocess","processAllTokens"])),B),Nt=class{constructor(...t){x(this,"defaults",Q());x(this,"options",this.setOptions);x(this,"parse",this.parseMarkdown(!0));x(this,"parseInline",this.parseMarkdown(!1));x(this,"Parser",R);x(this,"Renderer",q);x(this,"TextRenderer",se);x(this,"Lexer",S);x(this,"Tokenizer",G);x(this,"Hooks",_);this.use(...t)}walkTokens(t,e){var s,n;let r=[];for(let a of t)switch(r=r.concat(e.call(this,a)),a.type){case"table":{let l=a;for(let i of l.header)r=r.concat(this.walkTokens(i.tokens,e));for(let i of l.rows)for(let p of i)r=r.concat(this.walkTokens(p.tokens,e));break}case"list":{let l=a;r=r.concat(this.walkTokens(l.items,e));break}default:{let l=a;(n=(s=this.defaults.extensions)==null?void 0:s.childTokens)!=null&&n[l.type]?this.defaults.extensions.childTokens[l.type].forEach(i=>{let p=l[i].flat(1/0);r=r.concat(this.walkTokens(p,e))}):l.tokens&&(r=r.concat(this.walkTokens(l.tokens,e)))}}return r}use(...t){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(r=>{let s={...r};if(s.async=this.defaults.async||s.async||!1,r.extensions&&(r.extensions.forEach(n=>{if(!n.name)throw new Error("extension name required");if("renderer"in n){let a=e.renderers[n.name];a?e.renderers[n.name]=function(...l){let i=n.renderer.apply(this,l);return i===!1&&(i=a.apply(this,l)),i}:e.renderers[n.name]=n.renderer}if("tokenizer"in n){if(!n.level||n.level!=="block"&&n.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=e[n.level];a?a.unshift(n.tokenizer):e[n.level]=[n.tokenizer],n.start&&(n.level==="block"?e.startBlock?e.startBlock.push(n.start):e.startBlock=[n.start]:n.level==="inline"&&(e.startInline?e.startInline.push(n.start):e.startInline=[n.start]))}"childTokens"in n&&n.childTokens&&(e.childTokens[n.name]=n.childTokens)}),s.extensions=e),r.renderer){let n=this.defaults.renderer||new q(this.defaults);for(let a in r.renderer){if(!(a in n))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let l=a,i=r.renderer[l],p=n[l];n[l]=(...o)=>{let h=i.apply(n,o);return h===!1&&(h=p.apply(n,o)),h||""}}s.renderer=n}if(r.tokenizer){let n=this.defaults.tokenizer||new G(this.defaults);for(let a in r.tokenizer){if(!(a in n))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let l=a,i=r.tokenizer[l],p=n[l];n[l]=(...o)=>{let h=i.apply(n,o);return h===!1&&(h=p.apply(n,o)),h}}s.tokenizer=n}if(r.hooks){let n=this.defaults.hooks||new _;for(let a in r.hooks){if(!(a in n))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let l=a,i=r.hooks[l],p=n[l];_.passThroughHooks.has(a)?n[l]=o=>{if(this.defaults.async&&_.passThroughHooksRespectAsync.has(a))return(async()=>{let g=await i.call(n,o);return p.call(n,g)})();let h=i.call(n,o);return p.call(n,h)}:n[l]=(...o)=>{if(this.defaults.async)return(async()=>{let g=await i.apply(n,o);return g===!1&&(g=await p.apply(n,o)),g})();let h=i.apply(n,o);return h===!1&&(h=p.apply(n,o)),h}}s.hooks=n}if(r.walkTokens){let n=this.defaults.walkTokens,a=r.walkTokens;s.walkTokens=function(l){let i=[];return i.push(a.call(this,l)),n&&(i=i.concat(n.call(this,l))),i}}this.defaults={...this.defaults,...s}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return S.lex(t,e??this.defaults)}parser(t,e){return R.parse(t,e??this.defaults)}parseMarkdown(t){return(e,r)=>{let s={...r},n={...this.defaults,...s},a=this.onError(!!n.silent,!!n.async);if(this.defaults.async===!0&&s.async===!1)return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return a(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return a(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(n.hooks&&(n.hooks.options=n,n.hooks.block=t),n.async)return(async()=>{let l=n.hooks?await n.hooks.preprocess(e):e,i=await(n.hooks?await n.hooks.provideLexer():t?S.lex:S.lexInline)(l,n),p=n.hooks?await n.hooks.processAllTokens(i):i;n.walkTokens&&await Promise.all(this.walkTokens(p,n.walkTokens));let o=await(n.hooks?await n.hooks.provideParser():t?R.parse:R.parseInline)(p,n);return n.hooks?await n.hooks.postprocess(o):o})().catch(a);try{n.hooks&&(e=n.hooks.preprocess(e));let l=(n.hooks?n.hooks.provideLexer():t?S.lex:S.lexInline)(e,n);n.hooks&&(l=n.hooks.processAllTokens(l)),n.walkTokens&&this.walkTokens(l,n.walkTokens);let i=(n.hooks?n.hooks.provideParser():t?R.parse:R.parseInline)(l,n);return n.hooks&&(i=n.hooks.postprocess(i)),i}catch(l){return a(l)}}}onError(t,e){return r=>{if(r.message+=`
Please report this to https://github.com/markedjs/marked.`,t){let s="<p>An error occurred:</p><pre>"+v(r.message+"",!0)+"</pre>";return e?Promise.resolve(s):s}if(e)return Promise.reject(r);throw r}}},T=new Nt;function k(t,e){return T.parse(t,e)}k.options=k.setOptions=function(t){return T.setOptions(t),k.defaults=T.defaults,ke(k.defaults),k};k.getDefaults=Q;k.defaults=P;k.use=function(...t){return T.use(...t),k.defaults=T.defaults,ke(k.defaults),k};k.walkTokens=function(t,e){return T.walkTokens(t,e)};k.parseInline=T.parseInline;k.Parser=R;k.parser=R.parse;k.Renderer=q;k.TextRenderer=se;k.Lexer=S;k.lexer=S.lex;k.Tokenizer=G;k.Hooks=_;k.parse=k;k.options;k.setOptions;k.use;k.walkTokens;k.parseInline;R.parse;S.lex;function Ee(t){me.initialize({startOnLoad:!1,theme:t?"dark":"default",themeVariables:t?{darkMode:!0,primaryColor:"#60a5ff",primaryTextColor:"#e8edf5",primaryBorderColor:"#262e3a",lineColor:"#505a6a",secondaryColor:"#22c55e",tertiaryColor:"#12161e",noteTextColor:"#e8edf5",noteBkgColor:"#12161e",noteBorderColor:"#262e3a",mainBkg:"#0a0e14",nodeBkg:"#12161e",nodeBorder:"#262e3a",clusterBkg:"#12161e",clusterBorder:"#262e3a",titleColor:"#e8edf5",edgeLabelBackground:"#0a0e14",background:"#0a0e14",fontFamily:'"JetBrains Mono", "Fira Code", monospace',fontSize:"13px"}:{darkMode:!1,primaryColor:"#4f46e5",primaryTextColor:"#1e293b",primaryBorderColor:"#e2e8f0",lineColor:"#94a3b8",secondaryColor:"#16a34a",tertiaryColor:"#f1f5f9",noteTextColor:"#1e293b",noteBkgColor:"#ffffff",noteBorderColor:"#e2e8f0",mainBkg:"#f8fafc",nodeBkg:"#ffffff",nodeBorder:"#e2e8f0",clusterBkg:"#f1f5f9",clusterBorder:"#e2e8f0",titleColor:"#1e293b",edgeLabelBackground:"#f8fafc",background:"#f8fafc",fontFamily:'"JetBrains Mono", "Fira Code", monospace',fontSize:"13px"},flowchart:{curve:"basis",padding:20},er:{fontSize:11,useMaxWidth:!0},sequence:{useMaxWidth:!0,actorFontSize:12,messageFontSize:12}})}Ee(document.documentElement.getAttribute("data-theme")!=="light");const L=[{id:"er-diagram",name:"er.mmd",type:"mermaid",icon:c.jsx(Me,{size:14}),iconColor:"var(--accent-orange)",label:"ER Diagram",code:`erDiagram
    USERS {
        uuid id PK
        string email UK
        string username
        string password_hash
        timestamp created_at
        enum role
    }
    PRODUCTS {
        uuid id PK
        string title
        text description
        decimal price
        int stock_count
        uuid category_id FK
        jsonb metadata
    }
    ORDERS {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        enum status
        timestamp placed_at
        timestamp shipped_at
    }
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }
    PAYMENTS {
        uuid id PK
        uuid order_id FK
        decimal amount
        enum method
        enum status
        string transaction_id
        timestamp processed_at
    }
    CATEGORIES {
        uuid id PK
        string name
        string slug
        uuid parent_id FK
    }
    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        int rating
        text comment
        timestamp created_at
    }

    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDER_ITEMS }o--|| PRODUCTS : references
    ORDERS ||--o| PAYMENTS : "paid via"
    PRODUCTS }o--|| CATEGORIES : "belongs to"
    PRODUCTS ||--o{ REVIEWS : receives
    CATEGORIES ||--o{ CATEGORIES : "parent of"`},{id:"architecture",name:"arch.mmd",type:"mermaid",icon:c.jsx(Ge,{size:14}),iconColor:"var(--accent-blue)",label:"Architecture",code:`graph TB
    subgraph Client["🖥️ Client Layer"]
        WEB["React SPA"]
        MOB["Mobile App"]
    end

    subgraph Gateway["🔀 API Gateway"]
        NGINX["Nginx Reverse Proxy"]
        AUTH["Auth Middleware"]
        RATE["Rate Limiter"]
    end

    subgraph Services["⚙️ Microservices"]
        USER_SVC["User Service<br/>Node.js"]
        PRODUCT_SVC["Product Service<br/>Python"]
        ORDER_SVC["Order Service<br/>Go"]
        PAYMENT_SVC["Payment Service<br/>Java"]
        NOTIFY_SVC["Notification Service<br/>Node.js"]
        SEARCH_SVC["Search Service<br/>Python"]
    end

    subgraph Data["💾 Data Layer"]
        PG[("PostgreSQL<br/>Primary DB")]
        REDIS[("Redis<br/>Cache")]
        ES[("Elasticsearch<br/>Full-text")]
        S3["S3 Bucket<br/>Assets"]
    end

    subgraph Infra["📊 Observability"]
        PROM["Prometheus"]
        GRAF["Grafana"]
        JAEG["Jaeger Tracing"]
    end

    WEB --> NGINX
    MOB --> NGINX
    NGINX --> AUTH --> RATE
    RATE --> USER_SVC & PRODUCT_SVC & ORDER_SVC & PAYMENT_SVC
    ORDER_SVC --> NOTIFY_SVC
    PRODUCT_SVC --> SEARCH_SVC
    USER_SVC & ORDER_SVC & PAYMENT_SVC --> PG
    PRODUCT_SVC --> PG & REDIS
    SEARCH_SVC --> ES
    PRODUCT_SVC --> S3
    USER_SVC & PRODUCT_SVC & ORDER_SVC --> PROM --> GRAF
    ORDER_SVC --> JAEG`},{id:"sequence",name:"sequence.mmd",type:"mermaid",icon:c.jsx(qe,{size:14}),iconColor:"var(--accent-green)",label:"Sequence",code:`sequenceDiagram
    autonumber
    actor Customer
    participant Web as React Frontend
    participant GW as API Gateway
    participant Auth as Auth Service
    participant Cart as Cart Service
    participant Order as Order Service
    participant Pay as Payment Service
    participant Notify as Notification

    Customer->>Web: Click "Checkout"
    Web->>GW: POST /api/checkout
    GW->>Auth: Validate JWT Token
    Auth-->>GW: ✅ Token Valid

    GW->>Cart: GET /cart/{userId}
    Cart-->>GW: Cart Items + Totals

    GW->>Order: POST /orders
    Note over Order: Create order record<br/>Status: PENDING

    Order->>Pay: POST /payments/charge
    Pay->>Pay: Process via Stripe
    alt Payment Success
        Pay-->>Order: ✅ Payment Confirmed
        Order->>Order: Status → CONFIRMED
        Order->>Notify: Emit OrderConfirmed
        Notify->>Customer: 📧 Email Confirmation
        Notify->>Customer: 📱 Push Notification
        Order-->>GW: 201 Order Created
        GW-->>Web: Order Confirmation
        Web-->>Customer: Show Success Page
    else Payment Failed
        Pay-->>Order: ❌ Payment Declined
        Order->>Order: Status → FAILED
        Order-->>GW: 402 Payment Required
        GW-->>Web: Error Response
        Web-->>Customer: Show Retry Option
    end`},{id:"systems",name:"systems.mmd",type:"mermaid",icon:c.jsx(Fe,{size:14}),iconColor:"var(--accent-purple)",label:"Systems",code:`graph LR
    REPO["Git Repository"] --> CI["CI Pipeline"]
    CI --> ANALYZER["Code Analyzer"]
    ANALYZER --> ER["ER Diagram"]
    ANALYZER --> ARCH["Architecture Diagram"]
    ANALYZER --> SEQ["Sequence Diagram"]
    ANALYZER --> ADR["ADR Draft"]
    ANALYZER --> README["README.md"]
    ANALYZER --> API["API Documentation"]
    ER --> PORTAL["Project Docs Portal"]
    ARCH --> PORTAL
    SEQ --> PORTAL
    ADR --> PORTAL
    README --> PORTAL
    API --> PORTAL`},{id:"adr",name:"ADR-001.md",type:"markdown",icon:c.jsx(le,{size:14}),iconColor:"var(--accent-blue)",label:"ADR",code:`# ADR-001: Adopt CI-Generated Living Documentation

## Status
Accepted

## Context
Documentation drift causes onboarding delays and release risk. Our codebase changes daily, but manual docs updates are inconsistent.

## Decision
Generate and update project docs automatically in CI for every push:
- README
- Architecture artifacts (ADR, arch, ER, sequence, systems)
- API documentation

## Consequences
- Lower documentation drift risk
- Faster team onboarding and review
- Reliable documentation visibility for all teammates
`},{id:"readme",name:"README.md",type:"markdown",icon:c.jsx(We,{size:14}),iconColor:"var(--accent-cyan)",label:"README",code:`# 🛍️ ShopStream — E-Commerce Platform

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-96%25-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Docker](https://img.shields.io/badge/docker-ready-blue)]()

> A production-grade microservices e-commerce platform built with modern cloud-native patterns.

## 🏗️ Architecture Overview

ShopStream is composed of **6 independent microservices**, each owning its domain logic and data:

| Service | Stack | Port | Description |
|---------|-------|------|-------------|
| User Service | Node.js + Express | 3001 | Authentication, profiles, RBAC |
| Product Service | Python + FastAPI | 3002 | Catalog, search, inventory |
| Order Service | Go + Gin | 3003 | Orders, cart, checkout flow |
| Payment Service | Java + Spring | 3004 | Stripe integration, refunds |
| Notification | Node.js + Bull | 3005 | Email, SMS, push notifications |
| Search Service | Python + FastAPI | 3006 | Elasticsearch-powered search |

## 🚀 Quick Start

\`\`\`bash
# Clone and start all services
git clone https://github.com/shopstream/platform.git
cd platform

# Start infrastructure
docker-compose up -d postgres redis elasticsearch

# Start all services
make dev

# Run migrations
make migrate

# Seed demo data
make seed
\`\`\`

## 📊 API Endpoints

\`\`\`
POST   /api/auth/register     Register new user
POST   /api/auth/login        Authenticate user
GET    /api/products           List products
GET    /api/products/:id       Get product details
POST   /api/orders             Create order
POST   /api/payments/charge    Process payment
GET    /api/orders/:id/track   Track order status
\`\`\`

## 🧪 Testing

\`\`\`bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run coverage
\`\`\`

---
*Auto-generated by CI Living Documentation • Last updated: 2 minutes ago*`},{id:"api-reference",name:"api-reference.md",type:"markdown",icon:c.jsx(le,{size:14}),iconColor:"var(--accent-pink)",label:"API Docs",code:`# 📡 ShopStream API Reference

## Authentication

### POST \`/api/auth/register\`

Register a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "securePassword123!"
}
\`\`\`

**Response:** \`201 Created\`
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "john_doe",
  "token": "eyJhbGciOiJIUz...",
  "expiresIn": 3600
}
\`\`\`

---

### POST \`/api/auth/login\`

Authenticate and receive a JWT token.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",  
  "password": "securePassword123!"
}
\`\`\`

---

## Products

### GET \`/api/products\`

List all products with pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| category | string | — | Filter by category |
| sort | string | created_at | Sort field |
| q | string | — | Search query |

**Response:** \`200 OK\`
\`\`\`json
{
  "data": [
    {
      "id": "prod_001",
      "title": "Wireless Headphones",
      "price": 79.99,
      "stock": 142,
      "rating": 4.5,
      "category": "Electronics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1284,
    "pages": 65
  }
}
\`\`\`

---

## Orders

### POST \`/api/orders\`

Create a new order from the user's cart.

**Headers:** \`Authorization: Bearer <token>\`

**Request Body:**
\`\`\`json
{
  "items": [
    { "productId": "prod_001", "quantity": 2 },
    { "productId": "prod_042", "quantity": 1 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105"
  }
}
\`\`\`

---

*Auto-generated from OpenAPI spec • ShopStream v2.1.0*`}];function Lt(t){return t.split(`
`).map(r=>{const s=r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),n=[],a=(h,g)=>{let d;for(;(d=h.exec(s))!==null;)n.push({start:d.index,end:d.index+d[0].length,cls:g})};a(/\b(erDiagram|graph|sequenceDiagram|classDiagram|flowchart|subgraph|end|participant|actor|Note over|alt|else|autonumber|TB|LR|TD|RL|PK|FK|UK)\b/g,"hl-keyword"),a(/"([^"]*)"/g,"hl-string"),a(/\b(string|int|uuid|text|decimal|timestamp|enum|jsonb|Boolean|Decimal|DateTime|String|UUID|Int|void|Object|List)\b/g,"hl-type"),a(/(\|\|--|\-\-o\{|\|\|--o\||}o--\|\||\|\|--\|{|\.\.\&gt;|--\&gt;|--\&gt;\&gt;|--\))/g,"hl-relation"),a(/(%%.*)$/g,"hl-comment"),n.sort((h,g)=>h.start-g.start);const l=[];let i=0;for(const h of n)h.start>=i&&(l.push(h),i=h.end);let p="",o=0;for(const h of l)p+=s.slice(o,h.start),p+=`<span class="${h.cls}">${s.slice(h.start,h.end)}</span>`,o=h.end;return p+=s.slice(o),p}).join(`
`)}function Bt(t){return t.split(`
`).map(r=>{let s=r.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return/^#{1,6}\s/.test(r)&&(s=`<span class="hl-keyword" style="font-weight:bold">${s}</span>`),s=s.replace(/\*\*([^*]+)\*\*/g,'<span class="hl-bold">**$1**</span>'),s=s.replace(/`([^`]+)`/g,'<span class="hl-string" style="padding:0 4px;border-radius:3px">`$1`</span>'),s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<span class="hl-link">[$1]($2)</span>'),/^\|[-|:\s]+\|$/.test(r.trim())&&(s=`<span class="hl-dim">${s}</span>`),/^&gt;/.test(s)&&(s=`<span class="hl-comment">${s}</span>`),/^\s*[-*]\s/.test(r)&&(s=s.replace(/^(\s*)([-*])/,'$1<span class="hl-keyword">$2</span>')),s}).join(`
`)}function $e({code:t,type:e}){const[r,s]=C.useState(!1),n=t.split(`
`),a=C.useCallback(()=>{navigator.clipboard.writeText(t),s(!0),setTimeout(()=>s(!1),2e3)},[t]),l=e==="mermaid"?Lt(t):Bt(t);return c.jsxs("div",{className:"lp-code-editor",children:[c.jsxs("div",{className:"lp-code-editor-bar",children:[c.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6},children:[c.jsx(ge,{size:12,style:{color:"var(--text-muted)"}}),c.jsx("span",{style:{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:500,color:"var(--text-secondary)"},children:"Source Code"})]}),c.jsxs("button",{onClick:a,className:`lp-copy-btn ${r?"copied":""}`,style:{},children:[r?c.jsx(Ve,{size:10}):c.jsx(Ze,{size:10}),r?"Copied!":"Copy"]})]}),c.jsx("div",{className:"lp-code-editor-content",children:c.jsxs("div",{style:{display:"flex"},children:[c.jsx("div",{className:"lp-code-gutter",children:n.map((i,p)=>c.jsx("div",{children:p+1},p))}),c.jsx("pre",{className:"lp-code-body",dangerouslySetInnerHTML:{__html:l}})]})})]})}function je({code:t,fileId:e}){const r=C.useRef(null),[s,n]=C.useState(null),[a,l]=C.useState(!0),{theme:i}=Ue(),p=i==="dark";return C.useEffect(()=>{let o=!0;return l(!0),n(null),Ee(p),(async()=>{try{const g=`mermaid-${e}-${Date.now()}`,{svg:d}=await me.render(g,t);if(o&&r.current){r.current.innerHTML=d;const u=r.current.querySelector("svg");u&&(u.style.maxWidth="100%",u.style.height="auto",u.style.maxHeight="500px"),l(!1)}}catch(g){o&&(n(g instanceof Error?g.message:"Render failed"),l(!1))}})(),()=>{o=!1}},[t,e,p]),c.jsxs("div",{className:"lp-preview-pane",children:[c.jsxs("div",{className:"lp-preview-bar",children:[c.jsx(fe,{size:12,style:{color:"var(--text-muted)"}}),c.jsx("span",{style:{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:500,color:"var(--text-secondary)"},children:"Rendered Preview"}),c.jsx("span",{className:"lp-live-badge",children:"LIVE"})]}),c.jsxs("div",{className:"lp-preview-content",style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[a&&c.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text-muted)"},children:[c.jsx("div",{style:{width:12,height:12,borderRadius:"50%",border:"2px solid var(--accent-blue)",borderTopColor:"transparent",animation:"lp-spin 1s linear infinite"}}),"Rendering diagram..."]}),s&&c.jsxs("div",{style:{fontSize:12,fontFamily:"var(--font-mono)",padding:10,borderRadius:4,color:"var(--accent-red)",background:"rgba(248,81,73,0.06)"},children:["Error: ",s]}),c.jsx("div",{ref:r,style:{width:"100%",display:"flex",alignItems:"center",justifyContent:"center"}})]})]})}function Ie({code:t}){const[e,r]=C.useState("");return C.useEffect(()=>{(async()=>{const n=await k(t,{gfm:!0,breaks:!0});r(n)})()},[t]),c.jsxs("div",{className:"lp-preview-pane",children:[c.jsxs("div",{className:"lp-preview-bar",children:[c.jsx(fe,{size:12,style:{color:"var(--text-muted)"}}),c.jsx("span",{style:{fontSize:11,fontFamily:"var(--font-mono)",fontWeight:500,color:"var(--text-secondary)"},children:"Rendered Preview"}),c.jsx("span",{className:"lp-live-badge",children:"LIVE"})]}),c.jsx("div",{className:"lp-preview-content lp-md-preview",dangerouslySetInnerHTML:{__html:e}})]})}function Mt({file:t,onClose:e}){return c.jsx($.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"lp-fs-overlay",onClick:e,children:c.jsxs($.div,{initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},className:"lp-fs-modal",onClick:r=>r.stopPropagation(),children:[c.jsxs("div",{className:"lp-fs-header",children:[c.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[c.jsx("span",{style:{color:t.iconColor},children:t.icon}),c.jsx("span",{style:{fontSize:13,fontFamily:"var(--font-mono)",fontWeight:500,color:"var(--text-primary)"},children:t.name}),c.jsx("span",{style:{fontSize:10,fontFamily:"var(--font-mono)",padding:"1px 6px",borderRadius:4,background:"var(--bg-subtle)",color:"var(--text-muted)",border:"1px solid var(--border-muted)"},children:t.type})]}),c.jsx("button",{onClick:e,className:"lp-fs-close",children:c.jsx(He,{size:16})})]}),c.jsxs("div",{className:"lp-fs-body",children:[c.jsx("div",{style:{overflow:"auto",borderRight:"1px solid var(--border-muted)"},children:c.jsx($e,{code:t.code,type:t.type})}),c.jsx("div",{style:{overflow:"auto"},children:t.type==="mermaid"?c.jsx(je,{code:t.code,fileId:`modal-${t.id}`}):c.jsx(Ie,{code:t.code})})]})]})})}function Ft(){const[t,e]=C.useState(L[0].id),[r,s]=C.useState(null),n=L.find(a=>a.id===t)||L[0];return c.jsxs("section",{id:"diagrams",className:"lp-section",children:[c.jsx("hr",{className:"lp-divider"}),c.jsxs("div",{className:"lp-container",style:{paddingTop:40},children:[c.jsxs($.div,{initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.5},className:"lp-section-header",children:[c.jsxs("span",{className:"lp-badge",children:[c.jsx(ge,{size:13,style:{color:"var(--accent-blue)"}}),"Live Diagram Preview"]}),c.jsx("h2",{className:"lp-section-title",style:{marginTop:16},children:"Generated Documentation, Instantly"}),c.jsx("p",{className:"lp-section-subtitle",children:"What we generate from your codebase: README, architecture artifacts (ADR, arch, ER, sequence, systems), and API documentation."}),c.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:14,fontSize:12,fontFamily:"var(--font-mono)",color:"var(--text-muted)"},children:c.jsx("span",{style:{padding:"2px 8px",borderRadius:4,background:"var(--bg-subtle)",border:"1px solid var(--border-muted)"},children:"Auto-generated from your repository"})})]}),c.jsx($.div,{initial:{opacity:0,y:16},whileInView:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.4,delay:.1},style:{marginBottom:20},children:c.jsx("div",{className:"lp-diagram-tabs",style:{background:"var(--bg-subtle)",border:"1px solid var(--border-muted)",borderRadius:8,padding:4},children:L.map(a=>c.jsxs("button",{onClick:()=>e(a.id),className:`lp-diagram-tab ${t===a.id?"active":""}`,children:[c.jsx("span",{style:{color:a.iconColor},children:a.icon}),c.jsx("span",{children:a.name})]},a.id))})}),c.jsx(ae,{mode:"wait",children:c.jsxs($.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},exit:{opacity:0,y:-12},transition:{duration:.3},children:[c.jsxs("div",{className:"lp-diagram-pane",children:[c.jsx($e,{code:n.code,type:n.type}),n.type==="mermaid"?c.jsx(je,{code:n.code,fileId:n.id}):c.jsx(Ie,{code:n.code})]}),c.jsxs("div",{style:{marginTop:14,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[c.jsxs("div",{style:{display:"flex",alignItems:"center",gap:14,fontSize:11,fontFamily:"var(--font-mono)",color:"var(--text-muted)"},children:[c.jsxs("span",{style:{display:"flex",alignItems:"center",gap:6},children:[c.jsx("span",{className:"lp-status-dot"}),"Auto-generated from source"]}),c.jsxs("span",{children:[n.code.split(`
`).length," lines"]}),c.jsxs("span",{style:{display:"flex",alignItems:"center",gap:4},children:[c.jsx(Ne,{size:10}),n.name]})]}),c.jsxs("button",{onClick:()=>s(n),className:"lp-fullscreen-btn",style:{width:"auto",padding:"4px 10px",gap:6,fontSize:11,fontFamily:"var(--font-mono)"},children:[c.jsx(Le,{size:11}),"Fullscreen"]})]})]},t)}),c.jsx($.div,{initial:{opacity:0},whileInView:{opacity:1},viewport:{once:!0},transition:{delay:.5},style:{marginTop:32,textAlign:"center"},children:c.jsxs("p",{style:{fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"var(--text-muted)"},children:[c.jsx(Be,{size:14}),"Switch between tabs to explore all auto-generated documentation artifacts"]})})]}),c.jsx(ae,{children:r&&c.jsx(Mt,{file:r,onClose:()=>s(null)})})]})}export{Ft as default};
