// app.js

// =========================================================
// 0) DOM References
// =========================================================
const menuToggle   = document.getElementById('menuToggle');
const drawer       = document.getElementById('mobileDrawer');
const overlay      = document.getElementById('overlay');
const drawerClose  = document.getElementById('drawerClose');

// =========================================================
// 1) Navbar / Drawer: Open & Close Functions
// =========================================================
function openDrawer(){
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  overlay.hidden = false;
  drawerClose.focus({ preventScroll:true });
}

function closeDrawer(){
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  overlay.hidden = true;
}

// =========================================================
// 2) Event Listeners (Clicks, Overlay, Escape key, Resize)
// =========================================================
menuToggle?.addEventListener('click', openDrawer);
drawerClose?.addEventListener('click', closeDrawer);
overlay?.addEventListener('click', closeDrawer);

document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
});

const LARGE_BP = 992;
window.addEventListener('resize', ()=>{
  if(window.innerWidth >= LARGE_BP && drawer.classList.contains('open')) closeDrawer();
});

drawer?.addEventListener('click', (e)=>{
  const target = e.target;
  if(target instanceof HTMLElement && target.tagName === 'A') closeDrawer();
});

// =========================================================
// 3) Future Navbar Utilities (group here)
// =========================================================
// function highlightActiveLink(){ /* ... */ }