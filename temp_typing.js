/* =========================
   TYPING EFFECT
========================= */

document.addEventListener('DOMContentLoaded', () => {
    const text = "Mid-Senior Power Platform Developer | 3+ Years Experience | Myanmar";
    const speed = 100; // Typing speed in ms
    const element = document.getElementById('typing-text');
    let index = 0;
  
    // Clear content initially in case of reload
    if (element) {
      element.textContent = '';
      
      function typeWriter() {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          setTimeout(typeWriter, speed);
        }
      }
      
      // Start typing after a short delay
      setTimeout(typeWriter, 500);
    }
  });
