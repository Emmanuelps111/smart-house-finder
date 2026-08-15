# Plan: Shrink coverflow cards on mobile so side cards are visible

## Problem
On mobile (`max-width:640px`) each coverflow card is `82vw` wide with a `120px` gap between cards. Only the center card is really visible; the side cards are almost entirely pushed off-screen. The user wants the cards smaller so the adjacent cards also peek into view.

## Change
Edit `public/home.html` — two spots, mobile only (desktop untouched):

### 1. CSS — reduce mobile card width (line 57)
Current:
```css
@media (max-width:640px){ .cf-card { margin-left:-41vw; width:82vw; } .cf { padding:0 .5rem 3rem; } }
```
New:
```css
@media (max-width:640px){ .cf-card { margin-left:-34vw; width:68vw; } .cf { padding:0 .5rem 3rem; } }
```
- Width `82vw → 68vw` (smaller cards)
- `margin-left` keeps the card centered: `-41vw → -34vw` (half of 68vw)

### 2. JS — reduce mobile gap (line 304)
Current:
```js
const gap = narrow ? 120 : 230;
```
New:
```js
const gap = narrow ? 95 : 230;
```
A smaller gap (`120 → 95px`) pulls side cards closer to center so they sit visibly inside the viewport instead of being pushed off the edges.

## Result
On phones the center card shrinks from 82vw to 68vw and the spacing tightens, so the immediate left/right cards now visibly peek on either side — matching the coverflow look the user asked for. Desktop and the autoplay/pause/swipe logic are untouched.
