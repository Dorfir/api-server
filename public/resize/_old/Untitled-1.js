var canvas=document.getElementById("canvas");
var ctx=canvas.getContext("2d");
var cw=canvas.width;
var ch=canvas.height;
function reOffset(){
  var BB=canvas.getBoundingClientRect();
  offsetX=BB.left;
  offsetY=BB.top;        
}
var offsetX,offsetY;
reOffset();
window.onscroll=function(e){ reOffset(); }
window.onresize=function(e){ reOffset(); }

var isDown=false;
var startX,startY;

var cursors=['default','w-resize','n-resize'];
var currentCursor=0;

var shapes=[];
shapes.push({
  points:[{x:20,y:50},{x:100,y:10},{x:180,y:50},{x:100,y:90}],
  cursor:1,
});
shapes.push({
  points:[{x:200,y:50},{x:250,y:150},{x:200,y:250},{x:150,y:150}],
  cursor:2,
});

for(var i=0;i<shapes.length;i++){
  var s=shapes[i];
  definePath(s.points);
  ctx.stroke();
}


$("#canvas").mousemove(function(e){handleMouseMove(e);});


function definePath(p){
  ctx.beginPath();
  ctx.moveTo(p[0].x,p[0].y);
  for(var i=1;i<p.length;i++){
    ctx.lineTo(p[i].x,p[i].y);
  }
  ctx.closePath();
}

function handleMouseMove(e){
  // tell the browser we're handling this event
  e.preventDefault();
  e.stopPropagation();

  mouseX=parseInt(e.clientX-offsetX);
  mouseY=parseInt(e.clientY-offsetY);

  // Put your mousemove stuff here
  var newCursor;
  for(var i=0;i<shapes.length;i++){
    var s=shapes[i];
    definePath(s.points);
    if(ctx.isPointInPath(mouseX,mouseY)){
      newCursor=s.cursor;
      break;
    }
  }
  if(!newCursor){
    if(currentCursor>0){
      currentCursor=0;
      canvas.style.cursor=cursors[currentCursor];              
    }
  }else if(!newCursor==currentCursor){
    currentCursor=newCursor;
    canvas.style.cursor=cursors[currentCursor];              
  }
}