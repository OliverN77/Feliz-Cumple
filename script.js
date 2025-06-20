document.addEventListener("DOMContentLoaded", () => {
  // Crear confeti de fondo
  function createConfetti() {
    const confettiContainer = document.getElementById("confetti-container");
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7", "#ff6b9d"];

    // Limpiar confeti anterior
    confettiContainer.innerHTML = "";

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 3 + "s";
      confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
      confettiContainer.appendChild(confetti);
    }
  }

  // Referencias a elementos del sobre
  const envelope = document.getElementById("envelope");
  const backFlap = document.getElementById("back-flap");
  const letter = document.getElementById("letter");
  const letterContent = document.getElementById("letter-content");
  const envelopeSection = document.getElementById("envelope-section");
  const scrollIndicator = document.querySelector(".scroll-indicator");
  
  let envelopeOpened = false;
  let wasCentered = false;
  let returnTimeout = null;
  let showTimeout = null;

  // Calcula el progreso de scroll
  function getSectionScrollProgress(section, ratio = 0.7) {
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const sectionHeight = rect.height;
    const scrollY = window.scrollY;
    const scrollPosition = scrollY - sectionTop;
    const animationDistance = sectionHeight * ratio;
    return Math.min(Math.max(scrollPosition / animationDistance, 0), 1);
  }

  // Animación principal del sobre y la carta
  function updateAnimation() {
    const progress = getSectionScrollProgress(envelopeSection);

    // Indicador de scroll
    scrollIndicator.style.opacity = progress > 0.1 ? "0" : "1";

    // Animación de la solapa trasera
    if (progress > 0.1) {
      const flapProgress = Math.min(Math.max((progress - 0.1) / 0.3, 0), 1);
      const flapRotation = flapProgress * 180;
      
      // Opacidad de la solapa: 0% scroll = opacity 0, 75% scroll = opacity 1
      const flapOpacity = Math.min(Math.max(progress / 0.75, 0), 1);
      
      backFlap.style.transform = `rotateX(${180 - flapRotation}deg) translateZ(1.5px)`;
      backFlap.style.opacity = flapOpacity.toString();
      
      envelope.style.transform = flapProgress > 0.8 ? "rotateX(5deg)" : "rotateX(0deg)";
      envelopeOpened = flapProgress > 0.8;

      // Efecto de explosión cuando se abre el sobre
      if (flapProgress > 0.5 && !envelope.classList.contains("celebrating")) {
        envelope.classList.add("celebrating");
        createBurstEffect();
      }
    } else {
      backFlap.style.transform = "rotateX(180deg) translateZ(1.5px)";
      backFlap.style.opacity = "0";
      envelope.style.transform = "rotateX(0deg)";
      envelopeOpened = false;
      envelope.classList.remove("celebrating");
    }

    // Animación de la carta
    if (progress > 0.3) {
      const letterProgress = Math.min(Math.max((progress - 0.3) / 0.4, 0), 1);
      const letterTranslateY = -letterProgress * 90;
      const letterZ = letterProgress < 0.1 ? -5 : 5;
      letter.style.opacity = letterProgress.toString();
      // Mantener la carta centrada usando translateX(-50%)
      letter.style.transform = `translateX(-50%) translateZ(${letterZ}px) translateY(${letterTranslateY}%)`;

      // Animación del contenido de la carta
      if (progress > 0.5) {
        const contentProgress = Math.min(Math.max((progress - 0.5) / 0.2, 0), 1);
        letterContent.style.transform = `translateY(${30 - (contentProgress * 30)}%)`;
        letterContent.style.opacity = contentProgress.toString();
      } else {
        letterContent.style.transform = "translateY(30%)";
        letterContent.style.opacity = "0";
      }

      // Carta centrada
      if (progress >= 0.95) {
        if (returnTimeout) {
          clearTimeout(returnTimeout);
          returnTimeout = null;
          letter.classList.remove("returning");
        }
        if (!letter.classList.contains("centered")) {
          letter.classList.add("centered", "showing");
          createCelebrationEffect();
          if (showTimeout) clearTimeout(showTimeout);
          showTimeout = setTimeout(() => {
            letter.classList.remove("showing");
            showTimeout = null;
          }, 500);
        }
        wasCentered = true;
      } else {
        if (wasCentered) {
          letter.classList.add("returning");
          if (returnTimeout) clearTimeout(returnTimeout);
          returnTimeout = setTimeout(() => {
            letter.classList.remove("centered", "returning");
            returnTimeout = null;
          }, 500);
        } else {
          letter.classList.remove("centered", "returning");
          if (returnTimeout) {
            clearTimeout(returnTimeout);
            returnTimeout = null;
          }
        }
        wasCentered = false;
      }
    } else {
      // Estado inicial - mantener centrada
      letter.style.opacity = "0";
      letter.style.transform = "translateX(-50%) translateZ(-5px) translateY(0%)";
      letterContent.style.transform = "translateY(30%)";
      letterContent.style.opacity = "0";
      letter.classList.remove("centered");
    }
  }

  // Efecto de explosión cuando se abre el sobre
  function createBurstEffect() {
    const burstContainer = document.createElement("div");
    burstContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 1000;
    `;

    const emojis = ["🎉", "🎊", "✨", "🎈", "🎁", "💖", "⭐"];

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement("div");
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.cssText = `
        position: absolute;
        font-size: 1.5rem;
        animation: burst 1s ease-out forwards;
        animation-delay: ${Math.random() * 0.3}s;
      `;

      const angle = (i / 12) * Math.PI * 2;
      const distance = 100;
      particle.style.setProperty("--end-x", Math.cos(angle) * distance + "px");
      particle.style.setProperty("--end-y", Math.sin(angle) * distance + "px");

      burstContainer.appendChild(particle);
    }

    document.body.appendChild(burstContainer);
    setTimeout(() => document.body.removeChild(burstContainer), 1500);
  }

  // Efecto de celebración cuando la carta se centra
  function createCelebrationEffect() {
    const celebrationContainer = document.createElement("div");
    celebrationContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 998;
    `;

    const emojis = ["🎉", "🎊", "🎈", "✨", "🎁", "💖", "🌟"];

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.cssText = `
        position: absolute;
        font-size: 2rem;
        left: ${Math.random() * 100}%;
        top: -50px;
        animation: celebration-fall 3s linear forwards;
        animation-delay: ${Math.random() * 2}s;
      `;

      celebrationContainer.appendChild(particle);
    }

    document.body.appendChild(celebrationContainer);
    setTimeout(() => document.body.removeChild(celebrationContainer), 5000);
  }

  // Agregar animaciones CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes burst {
      0% {
        transform: translate(0, 0) scale(0);
        opacity: 1;
      }
      100% {
        transform: translate(var(--end-x), var(--end-y)) scale(1);
        opacity: 0;
      }
    }
    
    @keyframes celebration-fall {
      0% {
        transform: translateY(-50px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Event listeners optimizados
  function onScrollOrResize() {
    window.requestAnimationFrame(updateAnimation);
  }
  
  window.addEventListener("scroll", onScrollOrResize);
  window.addEventListener("resize", onScrollOrResize);

  // Efectos de hover en el sobre
  envelope.addEventListener("mouseenter", () => {
    if (!envelopeOpened) {
      envelope.style.transform = "rotateX(5deg) rotateY(5deg) scale(1.05)";
    }
  });

  envelope.addEventListener("mouseleave", () => {
    if (!envelopeOpened) {
      envelope.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    }
  });

  // Efecto 3D con el mouse cuando el sobre está abierto
  document.addEventListener("mousemove", (e) => {
    if (envelopeOpened) {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;
      envelope.style.transform = `rotateX(${5 - mouseY * 10}deg) rotateY(${mouseX * 10}deg) scale(1.02)`;
    }
  });

  // Inicialización
  createConfetti();
  updateAnimation();
  
  // Recrear confeti cada 10 segundos
  setInterval(createConfetti, 10000);
});