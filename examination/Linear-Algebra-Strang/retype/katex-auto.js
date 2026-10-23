/* 统一把 [data-tex] 渲染成 KaTeX —— 所有重排版页共用 */
(function(){
  function run(){
    document.querySelectorAll('[data-tex]').forEach(function(el){
      var tex = el.getAttribute('data-tex');
      try{
        katex.render(tex, el, {throwOnError:false, displayMode:false});
      }catch(e){
        el.textContent = '[tex] ' + tex;
        el.style.color = '#c00';
      }
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  }else{
    run();
  }
})();
