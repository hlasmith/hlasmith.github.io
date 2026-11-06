// Full search page: runs ?q= searches against /api/search. Kept out of the HTML
// so the Content-Security-Policy needs no hash for it.
(function(){
  var PROMPTS = ["are MCPs the new APIs","moving a team from Scrum to Kanban","what the P3M module taught me","training for a marathon","balancing a degree with full-time work","AI in the public sector"];
  var form = document.getElementById("search-form"), input = document.getElementById("search-q");
  var box = document.getElementById("search-results"), note = document.getElementById("search-note"), prompts = document.getElementById("search-prompts");
  function esc(s){ var d=document.createElement("div"); d.textContent=(s==null?"":s); return d.innerHTML; }
  PROMPTS.slice().sort(function(){return Math.random()-0.5;}).slice(0,4).forEach(function(p){
var b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=p;
b.addEventListener("click", function(){ input.value=p; run(p); }); prompts.appendChild(b);
  });
  form.addEventListener("submit", function(e){ e.preventDefault(); run(input.value.trim()); });
  function run(q){
if(!q) return;
history.replaceState(null, "", "?q=" + encodeURIComponent(q));
note.textContent = "Searching…"; box.innerHTML = '<li class="skeleton" aria-hidden="true"></li>';
fetch("/api/search?q=" + encodeURIComponent(q)).then(function(r){ return r.json(); }).then(function(d){
  var res = (d && d.results) || [];
  if(!res.length){ box.innerHTML=""; note.textContent = "No close matches. Try different words, or browse by shelf above."; return; }
  note.textContent = res.length + " closest match" + (res.length === 1 ? "" : "es") + ".";
  box.innerHTML = res.map(function(x){
    return '<li><a href="'+esc(x.url)+'">'+(x.category?'<span class="kicker">'+esc(x.category)+'</span>':'')+'<span class="t">'+esc(x.title)+'</span><span class="muted">'+esc(x.snippet)+'</span></a></li>';
  }).join("");
}).catch(function(){ box.innerHTML=""; note.textContent = "Search is unavailable right now. Please browse by shelf above."; });
  }
  var q0 = new URLSearchParams(location.search).get("q");
  if (q0) { input.value = q0; run(q0); }
})();
