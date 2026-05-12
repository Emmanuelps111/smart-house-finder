## Problem

On `public/detail.html`, the auth-gate script runs **after** `leaflet.js`, `data.js`, `partials.js`, and `app.js` load — so the page renders briefly before the redirect fires, causing the ~2 second flash of listing details.

## Fix

Move the auth check into a **blocking inline `<script>` in `<head>`**, before any other script or render happens. This makes the redirect synchronous on navigation, so nothing paints first.

### Change in `public/detail.html`

1. Add at the top of `<head>` (right after `<meta viewport>`):
   ```html
   <script>
     (function(){
       try {
         if (!JSON.parse(localStorage.getItem('shf-user') || 'null')) {
           var next = encodeURIComponent(location.pathname + location.search);
           location.replace('/login.html?next=' + next);
         }
       } catch(e){
         location.replace('/login.html');
       }
     })();
   </script>
   ```
2. Remove the duplicate auth-check block from the bottom `<script>` (the `_shfUser` lines), since it's now handled in `<head>`.

### Optional hardening

Add `<style>body{visibility:hidden}</style>` in `<head>` and a tiny inline script after auth passes to set `document.documentElement.style.visibility=''` — guarantees zero flash even on slow devices. Only add if the user wants belt-and-braces.

## Files touched

- `public/detail.html` — head-level auth gate + remove duplicate check below.