let slideIndex = 1;
showSlides(slideIndex);
let timer = setInterval(() => plusSlides(1), 4000); 

function plusSlides(n) {
  clearInterval(timer);
  showSlides(slideIndex += n);
  timer = setInterval(() => plusSlides(1), 4000); 
}

function currentSlide(n) {
  clearInterval(timer); 
  showSlides(slideIndex = n);
  timer = setInterval(() => plusSlides(1), 4000); 
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}




