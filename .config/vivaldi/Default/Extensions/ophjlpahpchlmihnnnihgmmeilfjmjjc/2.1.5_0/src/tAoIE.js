importScripts("sFiYn.js");var pw={},mw={DLR:function(a){a&&(Fv[So][Pn]=JSON.parse(a))},pushLineConfig:function(a){Fv[ut]=a[ut]?a[ut]:Fv[ut],Fv.LEGY_ENCRYPT_KEY=a.LEGY_ENCRYPT_KEY||Fv.LEGY_ENCRYPT_KEY,Fv[ap]=a[ap]||Fv[ap],Fv.B=a.B||Fv.B,Fv.A=a.A||Fv.A,Fv[mf]=a[mf]||Fv[mf],Fv[Ki]=a[Ki]||Fv[Ki],Fv[So]=a[So]||Fv[So]},stopGetContentT:function(a){pw["getContentT"+a]&&pw["getContentT"+a].abort()},getContentT:function(a,b,c){var d=Qv.TfbFmencPf(Fv[ap],b),e="getContentT"+a;pw[e]=d.ZFNRPWfmlU(),qw(d,e,pw[e],c)},getOBSInfoT:function(a,b,c){var d=Qv.WPzlcqwjlW(Fv[ap]),e="getOBSInfoT"+a;pw[e]=d.ZFNRPWfmlU(),qw(d,e,pw[e],b,c)},getPlayBackT:function(a,b,c){var d=c.replace(/.*oid=(.*?)&.*/,"$1"),e=Qv.vWLMAdUJig(Fv[ap],d),f="getPlayBackT"+a;pw[f]=e.ZFNRPWfmlU(),qw(e,f,pw[f],b,c)}},qw=function(a,b,c,d,e){var c=a.ZFNRPWfmlU();for(var f in a.header)c.setRequestHeader(f,a.header[f]);c[Kk]=d,c[Er]=Fv.DOWNLOAD_TIMEOUT_INTERVAL,c.onload=function(){4==c.readyState&&200==c[Ks]?reply(b,{callbackType:"success",value:c.response}):reply(b,{callbackType:"error",statusCode:c[Ks]})};var g=_.throttle(function(a){a.lengthComputable&&reply(b,{callbackType:"progress",value:a.loaded/a.total*100})},500);c.onprogress=g,c.onabort=function(){reply(b,{callbackType:"abort"})},c.onerror=function(){reply(b,{callbackType:"error"})},c.ontimeout=function(){c.onerror()},"undefined"!=typeof e?c.send(e):c.send()};onmessage=function(a){if(a.data instanceof Object&&a.data.hasOwnProperty("method")&&a.data.hasOwnProperty("arguments")){var b=Array.prototype.slice.call(a.data.arguments);mw[a.data[at]].apply(self,b)}};var reply=function(){if(arguments[dt]<1)throw new TypeError("reply - not enough arguments");postMessage({method:arguments[0],arguments:Array.prototype.slice.call(arguments,1)})}