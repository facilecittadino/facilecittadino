// js/navbar.js

(function () {
  "use strict";

  const cfg = (window.APP_CONFIG || { LARGE_BP: 992 });
  const menuToggle  = document.getElementById('menuToggle');
  const drawer      = document.getElementById('mobileDrawer');
  const overlay     = document.getElementById('overlay');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer(){
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    menuToggle && menuToggle.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.hidden = false;
    if (drawerClose) drawerClose.focus?.({ preventScroll:true });
  }

  function closeDrawer(){
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.hidden = true;
  }

  // Clicks
  menuToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // ESC key
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && drawer?.classList.contains('open')) closeDrawer();
  });

  // Resize: desktop par drawer close
  window.addEventListener('resize', ()=>{
    if(window.innerWidth >= cfg.LARGE_BP && drawer?.classList.contains('open')) closeDrawer();
  });

  // Drawer link click -> close
  drawer?.addEventListener('click', (e)=>{
    const target = e.target;
    if(target instanceof HTMLElement && target.tagName === 'A') closeDrawer();
  });

  // (future) export if needed
  window.Navbar = { openDrawer, closeDrawer };
})();