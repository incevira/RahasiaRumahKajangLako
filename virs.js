/* script.js
 - Menangani:
   * Lightbox di cover
   * Slider / swipe pada halaman komik (touch & mouse drag & keyboard)
   * Progress dots
*/

document.addEventListener("DOMContentLoaded", () => {
  // ----- Lightbox pada cover -----
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCaption = document.getElementById("lb-caption");
  const lbClose = document.getElementById("lb-close");
  const imgButton = document.querySelector(".image-open img");

  if (imgButton) {
    imgButton.addEventListener("click", () => {
      lbImg.src = imgButton.src;
      lbCaption.textContent = imgButton.alt || "";
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
    });
  }
  if (lbClose) lbClose.addEventListener("click", closeLB);
  if (lb)
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLB();
    });
  function closeLB() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
  }

  // ----- Slider (hanya jika ada element #slider) -----
  const slider = document.getElementById("slider");
  if (!slider) return;

  // Wrap slides into a track element to allow row transform
  const slides = Array.from(slider.querySelectorAll(".slide"));
  const track = document.createElement("div");
  track.className = "track";
  track.style.display = "flex";
  track.style.width = `${slides.length * 100}%`;
  track.style.height = "100%";
  track.style.transition = "transform 450ms cubic-bezier(.22,.9,.25,1)";
  track.style.willChange = "transform";

  slides.forEach((s) => {
    s.style.width = `${100 / slides.length}%`;
    s.style.flex = `0 0 ${100 / slides.length}%`;
    s.style.height = "100%";
    track.appendChild(s);
  });
  // clear and append track
  slider.innerHTML = "";
  slider.appendChild(track);

  let index = 0;
  const maxIndex = slides.length - 1;

  // create dots
  const dotsWrap =
    document.getElementById("dots") || document.querySelector(".progress-dots");
  const dots = [];
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    for (let i = 0; i < slides.length; i++) {
      const d = document.createElement("div");
      d.className = "dot" + (i === 0 ? " active" : "");
      d.dataset.i = i;
      d.addEventListener("click", () => goto(i));
      dotsWrap.appendChild(d);
      dots.push(d);
    }
  }

  function updateDots() {
    dots.forEach((d, idx) => {
      d.classList.toggle("active", idx === index);
    });
  }

  function goto(i) {
    index = Math.max(0, Math.min(maxIndex, i));
    const percent = -(index * (100 / slides.length));
    track.style.transform = `translateX(${percent}%)`;
    updateDots();
  }

  // Swipe / drag handling
  let startX = 0,
    currentX = 0,
    dragging = false,
    startTime = 0;
  const threshold = 40; // minimal px for swipe
  const velocityThreshold = 0.3;

  track.addEventListener("touchstart", startTouch, { passive: true });
  track.addEventListener("touchmove", moveTouch, { passive: false });
  track.addEventListener("touchend", endTouch);

  track.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", moveDrag);
  window.addEventListener("mouseup", endDrag);

  function startTouch(e) {
    if (e.touches.length > 1) return;
    dragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    startTime = Date.now();
    track.style.transition = "none";
  }
  function moveTouch(e) {
    if (!dragging) return;
    currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    const percent = (dx / slider.clientWidth) * (100 / slides.length);
    const base = -(index * (100 / slides.length));
    track.style.transform = `translateX(${base + percent}%)`;
    e.preventDefault();
  }
  function endTouch(e) {
    if (!dragging) return;
    dragging = false;
    track.style.transition = "";
    const dx = currentX - startX;
    const dt = (Date.now() - startTime) / 1000;
    const velocity = Math.abs(dx) / (dt || 1);
    if (Math.abs(dx) > threshold || velocity > velocityThreshold * 1000) {
      if (dx < 0) goto(index + 1);
      else goto(index - 1);
    } else {
      goto(index);
    }
  }

  // Mouse drag (desktop)
  function startDrag(e) {
    dragging = true;
    startX = e.clientX;
    currentX = startX;
    startTime = Date.now();
    track.style.transition = "none";
  }
  function moveDrag(e) {
    if (!dragging) return;
    currentX = e.clientX;
    const dx = currentX - startX;
    const percent = (dx / slider.clientWidth) * (100 / slides.length);
    const base = -(index * (100 / slides.length));
    track.style.transform = `translateX(${base + percent}%)`;
  }
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    track.style.transition = "";
    const dx = currentX - startX;
    const dt = (Date.now() - startTime) / 1000;
    const velocity = Math.abs(dx) / (dt || 1);
    if (Math.abs(dx) > threshold || velocity > velocityThreshold * 1000) {
      if (dx < 0) goto(index + 1);
      else goto(index - 1);
    } else {
      goto(index);
    }
  }

  // keyboard
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goto(index + 1);
    if (e.key === "ArrowLeft") goto(index - 1);
  });

  // initial
  goto(0);
});
