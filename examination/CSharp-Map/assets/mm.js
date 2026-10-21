
(function(){
  'use strict';
  var MM = window.MM, DATA = MM.data;
  var nodesEl=document.getElementById('nodes'), wires=document.getElementById('wires'),
      viewport=document.getElementById('viewport'), canvas=document.getElementById('canvas');
  var COLORS=['#4f7cff','#e5484d','#30a46c','#f5a623','#8e4ec6','#00a2c7','#e2699b','#0ea5e9','#14b8a6',
              '#f97316','#6366f1','#d946ef','#059669','#dc2626','#7c3aed','#0891b2'];
  var all=[], root=null, scale=1, tx=0, ty=0;

  function build(data,parent,depth,color,side){
    var el=document.createElement('div');
    el.className='node d'+Math.min(depth,4)+' side-'+side+((data.children&&data.children.length)?' has-children':'');
    var card=document.createElement('div'); card.className='card';
    if(depth===1) card.style.background=color;
    if(depth>1) card.style.borderLeftColor=color;
    var t=document.createElement('div'); t.className='t'; t.textContent=data.text; card.appendChild(t);
    if(data.desc){var d=document.createElement('div'); d.className='d'; d.textContent=data.desc; card.appendChild(d);}
    if(depth===0&&data.children&&data.children.length){
      var n0=document.createElement('div'); n0.className='d'; n0.textContent='共 '+data.children.length+' 个分册';
      card.appendChild(n0);
    }
    el.appendChild(card);
    var fold=document.createElement('div'); fold.className='fold'; fold.textContent='−';
    el.appendChild(fold); nodesEl.appendChild(el);

    var self={el:el,data:data,parent:parent,depth:depth,children:[],x:0,y:0,w:0,h:0,
              collapsed:false,hidden:false,color:color,side:side};
    all.push(self);

    if(data.children&&data.children.length){
      data.children.forEach(function(ch,i){
        var cs = depth===0 ? (i%2===0?'r':'l') : side;
        var cc = depth===0 ? COLORS[i%COLORS.length] : color;
        self.children.push(build(ch,self,depth+1,cc,cs));
      });
    }

    fold.addEventListener('click',function(ev){
      ev.stopPropagation(); ev.preventDefault();
      self.collapsed=!self.collapsed;
      self.el.classList.toggle('collapsed',self.collapsed);
      fold.textContent=self.collapsed?'+':'−';
      layout();
    });

    el.addEventListener('pointerdown',function(ev){
      if(ev.target.classList.contains('fold')) return;
      ev.stopPropagation(); ev.preventDefault();
      var sx=ev.clientX, sy=ev.clientY;
      var grp=[]; (function collect(n){grp.push(n);n.children.forEach(collect);})(self);
      var origin=grp.map(function(n){return{n:n,x:n.x,y:n.y};});
      el.classList.add('dragging');
      function move(e){
        var dx=(e.clientX-sx)/scale, dy=(e.clientY-sy)/scale;
        origin.forEach(function(o){o.n.x=o.x+dx;o.n.y=o.y+dy;});
        place(); drawWires();
      }
      function up(){
        el.classList.remove('dragging');
        window.removeEventListener('pointermove',move);
        window.removeEventListener('pointerup',up);
      }
      window.addEventListener('pointermove',move); window.addEventListener('pointerup',up);
    });

    el.addEventListener('dblclick',function(ev){
      ev.stopPropagation();
      if(MM.links && MM.links[data.text]){ location.href=MM.links[data.text]; return; }
      centerOn(self);
    });
    return self;
  }

  function place(){
    all.forEach(function(n){
      if(n.hidden){n.el.style.display='none';return;}
      n.el.style.display='';
      n.el.style.left=n.x+'px'; n.el.style.top=n.y+'px';
    });
  }
  function applyHidden(){ (function walk(n){ n.children.forEach(function(c){ c.hidden=n.hidden||n.collapsed; walk(c); }); })(root); }
  function measure(){
    all.forEach(function(n){
      if(n.hidden){n.w=160;n.h=30;return;}
      var r=n.el.getBoundingClientRect();
      n.w=r.width/scale||160; n.h=r.height/scale||30;
    });
  }

  function layout(){
    applyHidden();
    all.forEach(function(n){ n.el.style.display=n.hidden?'none':''; });
    var keep=scale; scale=1; canvas.style.transform='translate(0,0) scale(1)';
    measure(); scale=keep;

    var COLGAP=52, ROWGAP=13, rootW=root.w, rootH=root.h;
    function colsFor(side){
      var w={},maxD=1;
      all.forEach(function(n){
        if(n.hidden||n.side!==side||n.depth<1) return;
        w[n.depth]=Math.max(w[n.depth]||0,n.w); maxD=Math.max(maxD,n.depth);
      });
      var x={},cur=0;
      for(var d=1;d<=maxD;d++){ x[d]=cur; cur+=(w[d]||140)+COLGAP; }
      return x;
    }
    var colR=colsFor('r'), colL=colsFor('l');
    var groups={r:[],l:[]};
    root.children.forEach(function(c){ groups[c.side].push(c); });
    var heights={};
    ['r','l'].forEach(function(side){
      var cursor=0;
      function stack(n){
        var kids=n.children.filter(function(c){return !c.hidden;});
        if(n.collapsed||!kids.length){ n.y=cursor; cursor+=n.h+ROWGAP; return n.y+n.h/2; }
        var ys=kids.map(stack);
        n.y=(ys[0]+ys[ys.length-1])/2-n.h/2;
        return n.y+n.h/2;
      }
      groups[side].forEach(function(b){ stack(b); cursor+=22; });
      heights[side]=Math.max(cursor-22,0);
    });

    var H=Math.max(heights.r,heights.l,rootH);
    root.y=(H-rootH)/2; root.x=-rootW/2;
    groups.r.forEach(function(n){ (function sh(x){ x.y+=(H-heights.r)/2; x.children.forEach(sh); })(n); });
    groups.l.forEach(function(n){ (function sh(x){ x.y+=(H-heights.l)/2; x.children.forEach(sh); })(n); });

    function placeSide(n){
      if(n.depth===1){
        if(n.side==='r') n.x = rootW/2 + COLGAP + colR[1];
        else n.x = -rootW/2 - COLGAP - colL[1] - n.w;
      }else{
        var p=n.parent;
        if(n.side==='r') n.x = p.x + p.w + COLGAP;
        else n.x = p.x - COLGAP - n.w;
      }
      n.children.forEach(placeSide);
    }
    groups.r.forEach(placeSide); groups.l.forEach(placeSide);
    place(); drawWires();
  }

  function drawWires(){
    var s='';
    all.forEach(function(n){
      if(n.hidden||!n.parent||n.parent.hidden) return;
      var p=n.parent, ax,ay,bx,by,mx;
      if(n.side==='r'){ ax=p.x+p.w; ay=p.y+p.h/2; bx=n.x; by=n.y+n.h/2; }
      else { ax=p.x; ay=p.y+p.h/2; bx=n.x+n.w; by=n.y+n.h/2; }
      mx=(ax+bx)/2;
      var op = n.depth<=1?0.92:(n.depth===2?0.6:0.4);
      var wd = n.depth<=1?2.6:(n.depth===2?1.7:1.2);
      s+='<path d="M '+ax+' '+ay+' C '+mx+' '+ay+', '+mx+' '+by+', '+bx+' '+by+'" fill="none" stroke="'+n.color+
         '" stroke-width="'+wd+'" stroke-opacity="'+op+'" stroke-linecap="round"/>';
    });
    wires.innerHTML=s;
  }

  function applyTransform(){ canvas.style.transform='translate('+tx+'px,'+ty+'px) scale('+scale+')'; }
  function bounds(){
    var minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
    all.forEach(function(n){
      if(n.hidden)return;
      minX=Math.min(minX,n.x);minY=Math.min(minY,n.y);
      maxX=Math.max(maxX,n.x+n.w);maxY=Math.max(maxY,n.y+n.h);
    });
    if(minX>maxX)return{x:0,y:0,w:100,h:100};
    return{x:minX,y:minY,w:maxX-minX,h:maxY-minY};
  }
  function fitAll(){
    var b=bounds(), r=viewport.getBoundingClientRect();
    var padX=60,padTop=82,padBottom=44;
    var sx=(r.width-padX*2)/Math.max(b.w,1), sy=(r.height-padTop-padBottom)/Math.max(b.h,1);
    scale=Math.max(0.1,Math.min(sx,sy,1.1));
    tx=padX+(Math.max(0,(r.width-padX*2-b.w*scale)/2))-b.x*scale;
    ty=padTop-b.y*scale;
    applyTransform();
  }
  function centerOn(n,fixedScale){
    var r=viewport.getBoundingClientRect();
    if(fixedScale) scale=fixedScale; else scale=Math.max(scale,0.75);
    tx=r.width/2-(n.x+n.w/2)*scale;
    ty=r.height/2-(n.y+n.h/2)*scale;
    applyTransform();
  }

  viewport.addEventListener('pointerdown',function(e){
    if(e.target.closest('.node')||e.target.closest('#toolbar'))return;
    e.preventDefault(); viewport.classList.add('dragging');
    var sx=e.clientX-tx, sy=e.clientY-ty;
    function mv(ev){tx=ev.clientX-sx;ty=ev.clientY-sy;applyTransform();}
    function up(){viewport.classList.remove('dragging');
      window.removeEventListener('pointermove',mv);window.removeEventListener('pointerup',up);}
    window.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);
  });
  viewport.addEventListener('wheel',function(e){
    e.preventDefault();
    var k=e.deltaY<0?1.12:1/1.12, r=viewport.getBoundingClientRect();
    var px=e.clientX-r.left, py=e.clientY-r.top;
    var ns=Math.min(3,Math.max(0.08,scale*k)); k=ns/scale;
    tx=px-(px-tx)*k; ty=py-(py-ty)*k; scale=ns; applyTransform();
  },{passive:false});
  function zoom(f){
    var r=viewport.getBoundingClientRect(), px=r.width/2, py=r.height/2;
    var ns=Math.min(3,Math.max(0.08,scale*f)), k=ns/scale;
    tx=px-(px-tx)*k; ty=py-(py-ty)*k; scale=ns; applyTransform();
  }
  document.getElementById('btnZoomIn').onclick=function(){zoom(1.2);};
  document.getElementById('btnZoomOut').onclick=function(){zoom(1/1.2);};
  document.getElementById('btnFit').onclick=fitAll;

  function setCollapseDepth(minDepth){
    all.forEach(function(n){
      var c=n.children.length>0 && n.depth>=minDepth;
      n.collapsed=c; n.el.classList.toggle('collapsed',c);
      var f=n.el.querySelector(':scope > .fold'); if(f) f.textContent=c?'+':'−';
    });
    layout();
  }
  document.getElementById('btnExpand').onclick=function(){ setCollapseDepth(99); fitAll(); };
  document.getElementById('btnCollapse').onclick=function(){ setCollapseDepth(1); centerOn(root,0.9); };
  document.getElementById('btnReset').onclick=function(){ setCollapseDepth(MM.defaultDepth||1); centerOn(root,0.9); };

  root=build(DATA,null,0,'#111827','r');
  setCollapseDepth(MM.defaultDepth||1);
  centerOn(root,0.9);
  document.getElementById('stat').textContent='共 '+all.length+' 个节点';
  window.addEventListener('resize',fitAll);

  // 分册下拉
  var sel=document.getElementById('navSel');
  if(sel && MM.nav){
    MM.nav.forEach(function(item){
      var o=document.createElement('option');
      o.value=item.href; o.textContent=item.label;
      if(item.href.endsWith(MM.current)) o.selected=true;
      sel.appendChild(o);
    });
    sel.onchange=function(){ location.href=sel.value; };
  }
})();
