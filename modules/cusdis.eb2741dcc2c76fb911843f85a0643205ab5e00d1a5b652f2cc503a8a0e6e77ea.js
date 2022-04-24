(()=>{window.CUSDIS={};var n;function m(e){return n||(n=document.createElement("iframe"),function(t,d){let i=window.matchMedia("(prefers-color-scheme: dark)"),u=o=>{try{let s=JSON.parse(o.data);if(s.from==="cusdis")switch(s.event){case"onload":d.dataset.theme==="auto"&&c("setTheme",i.matches?"dark":"light");break;case"resize":t.style.height=s.data+"px"}}catch{}};function h(o){let s=o.matches;d.dataset.theme==="auto"&&c("setTheme",s?"dark":"light")}window.addEventListener("message",u),i.addEventListener("change",h)}(n,e)),n.srcdoc=(t=>{let d=t.dataset.host||"https://cusdis.com",i=t.dataset.iframe||`${d}/js/iframe.umd.js`;return`<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="${d}/js/style.css">
    <base target="_parent" />
    <link>
    <script>
      window.CUSDIS_LOCALE = ${JSON.stringify(window.CUSDIS_LOCALE)}
      window.__DATA__ = ${JSON.stringify(t.dataset)}
    <\/script>
  </head>
  <body>
    <div id="root"></div>
    <script src="${i}" type="module">
      
    <\/script>
  </body>
</html>`})(e),n.style.width="100%",n.style.border="0",n}function c(e,t){n&&n.contentWindow.postMessage(JSON.stringify({from:"cusdis",event:e,data:t}))}function r(e){if(e){e.innerHTML="";let t=m(e);e.appendChild(t)}}function a(){let e;window.cusdisElementId?e=document.querySelector(`#${window.cusdisElementId}`):document.querySelector("#cusdis_thread")?e=document.querySelector("#cusdis_thread"):document.querySelector("#cusdis")&&(console.warn("id `cusdis` is deprecated. Please use `cusdis_thread` instead"),e=document.querySelector("#cusdis")),window.CUSDIS_PREVENT_INITIAL_RENDER===!0||e&&r(e)}window.renderCusdis=r,window.CUSDIS.renderTo=r,window.CUSDIS.setTheme=function(e){c("setTheme",e)},window.CUSDIS.initial=a,a();})();
