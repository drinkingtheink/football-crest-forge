<script setup>
// The Crest Foundry mark: a molten-gold crest forged on an anvil. A hammer
// swings a 3-strike loop, each impact shuddering the crest, flaring the spark
// burst and spitting embers, then the mark rests aglow before repeating.
// Pure CSS — no JS, no SMIL — and fully stilled under prefers-reduced-motion.
</script>

<template>
  <span class="logo-mark" aria-hidden="true">
    <svg class="logo-svg" viewBox="0 0 543.67 627.4" role="img">
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe89a" />
          <stop offset="52%" stop-color="#e8c84a" />
          <stop offset="100%" stop-color="#c2911f" />
        </linearGradient>
      </defs>

      <g fill="url(#logo-gold)">
        <g class="shake">
        <path id="anvil" d="M369.72,396.61h-53.8c2.35,5.03,4.28,9.69,6.64,14.13,10.74,20.27,26.21,36.43,44.27,50.28.94.72,2.41,1.02,3.63,1.04,6.76.1,13.53.05,20.47.05v15.48h-239.06v-15.47c5.37,0,10.72-.22,16.04.07,3.67.2,6.29-1.01,8.97-3.49,15-13.92,28.52-29.02,38.35-47.12,2.55-4.68,4.72-9.57,7.28-14.8h-49.42c-.05-1.21-.14-2.2-.14-3.2-.01-7.25-.12-14.51.05-21.76.05-2.33-.67-3.18-2.9-3.79-28.3-7.79-50.4-23.98-65.67-49.17-2.36-3.9-4.24-8.09-6.58-12.6h74.99v-16.9h196.8v24.8c19.06,4.59,35.38,13.9,50.23,27.18-6.44,4.9-12.5,9.8-18.87,14.28-8.95,6.31-18.49,11.63-28.8,15.43-1.86.69-2.59,1.59-2.54,3.65.15,6.21.05,12.43.05,18.65,0,1.01,0,2.02,0,3.26Z" />
        <path id="hammer" d="M181.04,212.46c-5.87-14.57-11.65-28.89-17.51-43.42,5.23-2.97,10.3-5.85,15.37-8.72,2.35-1.33,4.78-2.53,7.05-3.98,1.52-.97,2.54-.95,4,.25,15.12,12.5,30.32,24.92,45.47,37.39.8.66,1.55,1.56,1.94,2.5,7.12,17.49,14.19,35.01,21.26,52.52.1.24.13.52.27,1.1-12.45,7.01-24.97,14.06-37.76,21.26-9.37-12.55-18.66-24.97-28-37.47-45.67,25.73-91.11,51.33-136.81,77.08-4.03-7.15-7.99-14.16-12.09-21.43,45.63-25.7,91.06-51.29,136.83-77.08Z" />
        <path id="sparks" d="M449.24,142.01c-16.54,23.8-33.09,47.6-50.1,72.07,25.09.71,49.37,1.4,73.65,2.08.05.26.11.51.16.77-44.47,17.84-88.93,35.69-133.94,53.75v-31.57c-22.53,10.55-44.44,20.81-67.19,31.47,10.77-31.76,21.29-62.77,31.81-93.78.25-.02.5-.03.76-.05,2.75,10.85,5.5,21.69,8.53,33.65,27.2-43.26,53.89-85.71,80.59-128.16l.64.29c-7.43,33.06-14.86,66.11-22.5,100.07,26.17-13.98,51.66-27.58,77.14-41.19.15.2.3.41.45.61Z" />

        <g id="shrapnel">
          <circle class="bit" cx="252" cy="278" r="20" style="--dx: 96px;  --dy: -84px;" />
          <circle class="bit" cx="252" cy="278" r="16" style="--dx: 142px; --dy: -26px;" />
          <circle class="bit" cx="252" cy="278" r="18" style="--dx: 44px;  --dy: -128px;" />
          <circle class="bit" cx="252" cy="278" r="16" style="--dx: -82px; --dy: -72px;" />
          <circle class="bit" cx="252" cy="278" r="14" style="--dx: -128px;--dy: -14px;" />
          <circle class="bit" cx="252" cy="278" r="16" style="--dx: 112px; --dy: 46px;" />
          <circle class="bit" cx="252" cy="278" r="14" style="--dx: -62px; --dy: 56px;" />
          <circle class="bit" cx="252" cy="278" r="12" style="--dx: 8px;   --dy: -164px;" />
          <circle class="bit" cx="252" cy="278" r="14" style="--dx: 172px; --dy: -96px;" />
          <circle class="bit" cx="252" cy="278" r="10" style="--dx: -34px; --dy: -142px;" />
        </g>
        </g>

        <path id="border" d="M271.21,627.4c-13.19,0-24.25-5.95-33.31-12.21-57.96-40.03-105.46-90.92-145.19-155.6C37.66,370.01,8.78,268.28,1.86,139.56c-4.47-17.28-4.2-48.09,39.57-74.15,20.83-12.4,40.89-27.86,60.3-42.81,6.03-4.64,12.26-9.45,18.46-14.12,14.85-11.18,28.91-11.3,44.25-.37,30.51,21.74,69.23,33.76,109.04,33.86.16,0,.33,0,.49,0,39.56,0,77.62-11.79,107.22-33.21,15.25-11.04,29.38-10.87,44.46.55,13.79,10.44,27.95,20.94,41.64,31.1,19.94,14.79,40.55,30.08,60.58,45.58,9.49,7.35,16.12,20.98,15.77,32.42-4.18,134.53-34.37,245.94-92.29,340.59-38.25,62.51-88.33,115.47-148.84,157.41-11.54,7.99-21.96,10.99-31.31,10.99ZM142.47,33.22c-.49.27-1.27.76-2.41,1.61-6.06,4.56-12.22,9.31-18.18,13.9-20.17,15.54-41.04,31.62-63.56,45.02-30.3,18.03-25.75,33.4-24.25,38.45l.56,1.88.1,1.95c6.45,123.84,33.8,221.16,86.1,306.27,37.29,60.69,81.72,108.35,135.83,145.72,11.76,8.12,16.82,8.35,27.08,1.25,56.72-39.31,103.65-88.94,139.49-147.51,54.82-89.59,83.43-195.64,87.45-324.2-.2-1.48-1.86-4.56-2.99-5.5-19.76-15.29-40.23-30.48-60.03-45.16-13.76-10.2-27.98-20.75-41.9-31.29-1.25-.95-2.1-1.48-2.62-1.77-.52.27-1.36.75-2.57,1.63-36.46,26.39-81.41,39.58-126.58,39.58-45.48,0-91.18-13.37-128.68-40.08-1.36-.97-2.28-1.49-2.83-1.76Z" />
      </g>
    </svg>
  </span>
</template>

<style scoped>
/* Timeline (percentages of --loop): 3 strikes, then the crest rests aglow,
   then embers dim before the loop restarts. Impacts land at 7.8 / 20.3 / 32.8%. */
.logo-mark {
  --loop: 8s;
  --lift: -22deg;        /* windup angle (negative = raised) */
  --strike: 5deg;        /* contact angle (positive = onto the anvil) */
  --shake: 1.6px;        /* interior shudder on impact — keep it small */
  --border-shake: 0;     /* shield frame response, 0–1. 0 = locked frame */
  --recoil: 4px;         /* anvil settle on impact */
  --spark-pop: 1.45;     /* how far the spark burst flares */
  --spark-rest: 1;       /* opacity of the burst while the crest holds static */
  --spark-gone: .5;      /* how far the burst collapses as it dies out */
  --particle-fade: .9;   /* opacity of the flying spark bits */

  position: relative;
  display: inline-flex;
  flex: none;
  width: 38px;
  height: 43px;
  line-height: 0;
}

/* Molten-gold glow, breathing on its own gentle cycle */
.logo-svg {
  width: 100%;
  height: 100%;
  overflow: visible;             /* let stray embers clear the mark */
  filter: drop-shadow(0 0 2px rgba(255, 140, 40, 0.4));
  animation: logo-glow 3.4s ease-in-out infinite;
}
@keyframes logo-glow {
  0%, 100% { filter: drop-shadow(0 0 1.5px rgba(255, 138, 42, 0.35)); }
  50%      { filter: drop-shadow(0 0 5px rgba(255, 176, 66, 0.8)) drop-shadow(0 0 9px rgba(255, 120, 26, 0.35)); }
}
.logo-mark:hover .logo-svg {
  filter: drop-shadow(0 0 6px rgba(255, 190, 80, 0.95)) drop-shadow(0 0 12px rgba(255, 120, 26, 0.5));
  animation-play-state: paused;
}

/* 1. impact shudder — the interior shakes inside a frame that holds still by
   default (--border-shake: 0), which makes the forging read harder. */
.shake { animation: crest-shake var(--loop) infinite linear; }
#border {
  --shake: calc(1.6px * var(--border-shake));
  animation: crest-shake var(--loop) infinite linear;
}
@keyframes crest-shake {
  0%, 7.8%    { transform: translate(0, 0); }
  8.1%        { transform: translate(var(--shake), calc(var(--shake) * .35)); }
  8.5%        { transform: translate(calc(var(--shake) * -.7), calc(var(--shake) * -.5)); }
  8.9%        { transform: translate(calc(var(--shake) * .35), 0); }
  9.4%, 20.3% { transform: translate(0, 0); }
  20.6%       { transform: translate(var(--shake), calc(var(--shake) * .35)); }
  21%         { transform: translate(calc(var(--shake) * -.7), calc(var(--shake) * -.5)); }
  21.4%       { transform: translate(calc(var(--shake) * .35), 0); }
  21.9%, 32.8%{ transform: translate(0, 0); }
  33.1%       { transform: translate(var(--shake), calc(var(--shake) * .35)); }
  33.5%       { transform: translate(calc(var(--shake) * -.7), calc(var(--shake) * -.5)); }
  33.9%       { transform: translate(calc(var(--shake) * .35), 0); }
  34.4%, 100% { transform: translate(0, 0); }
}

/* 2. the hammer — pivots at the butt of the handle, lower left */
#hammer {
  transform-box: view-box;
  transform-origin: 50px 300px;
  animation: swing var(--loop) infinite;
}
@keyframes swing {
  0%     { transform: rotate(0deg);          animation-timing-function: cubic-bezier(.3,.7,.4,1); }
  5%     { transform: rotate(var(--lift));    animation-timing-function: cubic-bezier(.75,0,.9,.35); }
  7.8%   { transform: rotate(var(--strike));  animation-timing-function: linear; }
  9%     { transform: rotate(var(--strike));  animation-timing-function: cubic-bezier(.2,.9,.4,1); }
  12.5%  { transform: rotate(0deg);          animation-timing-function: cubic-bezier(.3,.7,.4,1); }
  17.5%  { transform: rotate(var(--lift));    animation-timing-function: cubic-bezier(.75,0,.9,.35); }
  20.3%  { transform: rotate(var(--strike));  animation-timing-function: linear; }
  21.5%  { transform: rotate(var(--strike));  animation-timing-function: cubic-bezier(.2,.9,.4,1); }
  25%    { transform: rotate(0deg);          animation-timing-function: cubic-bezier(.3,.7,.4,1); }
  30%    { transform: rotate(var(--lift));    animation-timing-function: cubic-bezier(.75,0,.9,.35); }
  32.8%  { transform: rotate(var(--strike));  animation-timing-function: linear; }
  34%    { transform: rotate(var(--strike));  animation-timing-function: cubic-bezier(.2,.9,.4,1); }
  37.5%,
  100%   { transform: rotate(0deg); }
}

/* 3. the anvil takes the hit */
#anvil {
  transform-box: view-box;
  transform-origin: 271px 400px;
  animation: anvil-recoil var(--loop) infinite;
}
@keyframes anvil-recoil {
  0%, 7.8%    { transform: translateY(0) scaleY(1);              animation-timing-function: cubic-bezier(.3,0,.6,1); }
  8.2%        { transform: translateY(var(--recoil)) scaleY(.988); animation-timing-function: cubic-bezier(.2,.9,.4,1); }
  10.2%, 20.3%{ transform: translateY(0) scaleY(1);              animation-timing-function: cubic-bezier(.3,0,.6,1); }
  20.7%       { transform: translateY(var(--recoil)) scaleY(.988); animation-timing-function: cubic-bezier(.2,.9,.4,1); }
  22.7%, 32.8%{ transform: translateY(0) scaleY(1);              animation-timing-function: cubic-bezier(.3,0,.6,1); }
  33.2%       { transform: translateY(var(--recoil)) scaleY(.988); animation-timing-function: cubic-bezier(.2,.9,.4,1); }
  35.2%, 100% { transform: translateY(0) scaleY(1); }
}

/* 4. the built-in spark burst flares just after each impact */
#sparks {
  transform-box: view-box;
  transform-origin: 268px 272px;
  animation: spark-flare var(--loop) infinite;
}
@keyframes spark-flare {
  /* Each burst flares, settles onto its true logo form, then dies out — so
     every strike re-ignites the crest from nothing (dark between hits). */
  0%, 8.4%   { transform: scale(var(--spark-gone)); opacity: 0; }
  8.6%       { transform: scale(var(--spark-pop));  opacity: 1; }
  9.1%       { transform: scale(var(--spark-pop));  opacity: 1; animation-timing-function: cubic-bezier(.25,.8,.4,1); }
  11.5%      { transform: scale(1);                 opacity: var(--spark-rest); animation-timing-function: cubic-bezier(.45,0,.75,.5); }
  14.6%,
  20.9%      { transform: scale(var(--spark-gone)); opacity: 0; }
  21.1%      { transform: scale(var(--spark-pop));  opacity: 1; }
  21.6%      { transform: scale(var(--spark-pop));  opacity: 1; animation-timing-function: cubic-bezier(.25,.8,.4,1); }
  24%        { transform: scale(1);                 opacity: var(--spark-rest); animation-timing-function: cubic-bezier(.45,0,.75,.5); }
  27.1%,
  33.4%      { transform: scale(var(--spark-gone)); opacity: 0; }
  33.6%      { transform: scale(var(--spark-pop));  opacity: 1; }
  34.1%      { transform: scale(var(--spark-pop));  opacity: 1; animation-timing-function: cubic-bezier(.25,.8,.4,1); }
  /* the third stays lit through the static beat, then dies before the loop restarts */
  37.5%,
  86%        { transform: scale(1);                 opacity: var(--spark-rest); animation-timing-function: cubic-bezier(.45,0,.75,.5); }
  93%,
  100%       { transform: scale(var(--spark-gone)); opacity: 0; }
}

/* 5. spark shrapnel — the spitting embers; each bit carries its own vector.
   Radii/glow are authored in viewBox units (huge here) so they resolve to a
   visible ~1px spark once the 543-wide mark scales down to the 38px logo. */
#shrapnel { filter: drop-shadow(0 0 10px rgba(255, 150, 40, 0.9)); }
.bit {
  fill: #fff1c6;
  opacity: 0;
  animation: spark-fly var(--loop) infinite;
}
@keyframes spark-fly {
  0%, 8.5%    { transform: translate(0, 0) scale(.35); opacity: 0; }
  8.7%        { transform: translate(calc(var(--dx) * .18), calc(var(--dy) * .18)) scale(1);
                opacity: var(--particle-fade); animation-timing-function: cubic-bezier(.15,.7,.35,1); }
  12.3%       { transform: translate(var(--dx), var(--dy)) scale(.15); opacity: 0; }
  12.9%, 21%  { transform: translate(0, 0) scale(.35); opacity: 0; }
  21.2%       { transform: translate(calc(var(--dx) * .18), calc(var(--dy) * .18)) scale(1);
                opacity: var(--particle-fade); animation-timing-function: cubic-bezier(.15,.7,.35,1); }
  24.8%       { transform: translate(var(--dx), var(--dy)) scale(.15); opacity: 0; }
  25.4%, 33.5%{ transform: translate(0, 0) scale(.35); opacity: 0; }
  33.7%       { transform: translate(calc(var(--dx) * .18), calc(var(--dy) * .18)) scale(1);
                opacity: var(--particle-fade); animation-timing-function: cubic-bezier(.15,.7,.35,1); }
  37.3%       { transform: translate(var(--dx), var(--dy)) scale(.15); opacity: 0; }
  37.9%, 100% { transform: translate(0, 0) scale(.35); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .logo-svg { animation: none; filter: drop-shadow(0 0 2px rgba(255, 150, 40, 0.4)); }
  .shake, #border, #hammer, #anvil, #sparks, .bit { animation: none; }
  .bit { opacity: 0; }
  #sparks { opacity: var(--spark-rest); }
}
</style>
