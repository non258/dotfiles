importScripts("GnnEK.js");var mw={pushPhaseInfo:function(a){Fv.A=a},"ỊIĨ":function(a){Fv[So][Pn]=JSON.parse(a)},pushLineConfig:function(a){Fv[ut]=a[ut]?a[ut]:Fv[ut],Fv.LEGY_ENCRYPT_KEY=a.LEGY_ENCRYPT_KEY||Fv.LEGY_ENCRYPT_KEY,Fv[ap]=a[ap]||Fv[ap],Fv.B=a.B||Fv.B,Fv.A=a.A||Fv.A,Fv[mf]=a[mf]||Fv[mf],Fv[Ki]=a[Ki]||Fv[Ki],Fv[So]=a[So]||Fv[So];var b=function(a){reply("refreshTokenT",{token:a})};ew.ǏĨȈ().ĨÍṮŢṪȊٱlŦŤ(b)},requestAuthVerifyPolling:function(a,b){try{var c=aw.ǏĨȈ().ŦȊlĮŦІLŦlĨ(a,b);c.output.ٲĮÎṰÏٱṮΪΪЇ().ǏǀlЇŢṪÏٲٳỈ(!1,function(){var a=c.output.ٲĮÎṰÏٱṮΪΪЇ().read(),b=qz.ЇĲiȈḬŦĨĮlṮ(a);reply("requestAuthVerifyPolling",b)})}catch(d){d instanceof DOMException?reply("requestAuthVerifyPolling","DOMException"):reply("requestAuthVerifyPolling",d)}},requestAuthVerifyWithE2EEPolling:function(a,b){try{var c=aw.ǏĨȈ().ÎḬŢÌiǀٲŦٳỊ(a,b);c.output.ٲĮÎṰÏٱṮΪΪЇ().ǏǀlЇŢṪÏٲٳỈ(!1,function(){var a=c.output.ٲĮÎṰÏٱṮΪΪЇ().read(),b=qz.ЇĲiȈḬŦĨĮlṮ(a);reply("requestAuthVerifyWithE2EEPolling",b)})}catch(d){d instanceof DOMException?reply("requestAuthVerifyWithE2EEPolling","DOMException"):reply("requestAuthVerifyWithE2EEPolling",d)}},"ٲٳĬІٱlỈŤṬỈ":function(){reply("isRunningOperationPoller",!0)},"ỊȈĨ":function(a,b,c,d,e){try{var f=ew.ǏĨȈ().ÌÎḮIḬЇȈĨٱṬ(Fv[ap],e),g=f.ḮǏȊĨiṪΪ(a,b,c,d);reply("ỊȈĨ",g)}catch(h){h instanceof DOMException?reply("errorOperationPolling","DOMException"):reply("errorOperationPolling",h)}},refreshTokenT:function(){}};onmessage=function(a){if(a.data instanceof Object&&a.data.hasOwnProperty("method")&&a.data.hasOwnProperty("arguments")){var b=Array.prototype.slice.call(a.data.arguments);mw[a.data[at]].apply(self,b)}else Ia(a.data)};var reply=function(){if(arguments[dt]<1)throw new TypeError("reply - not enough arguments");postMessage({method:arguments[0],arguments:Array.prototype.slice.call(arguments,1)})}