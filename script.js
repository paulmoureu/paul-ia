const serviceType = document.querySelector("#serviceType");
const days = document.querySelector("#days");
const kilometers = document.querySelector("#kilometers");
const grooming = document.querySelector("#grooming");
const estimate = document.querySelector("#estimate");
const galleryTrack = document.querySelector("#galleryTrack");
const previousPhoto = document.querySelector(".gallery-prev");
const nextPhoto = document.querySelector(".gallery-next");
const reservationForm = document.querySelector("#reservation");

function formatEuro(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

function updateEstimate() {
  const dayRate = Number(serviceType.value);
  const dayCount = Math.max(1, Number(days.value || 1));
  const taxiKm = Math.max(0, Number(kilometers.value || 0));
  const groomingPrice = grooming.checked ? 25 : 0;
  const total = dayRate * dayCount + taxiKm * 0.9 + groomingPrice;

  estimate.value = formatEuro(total);
}

if (serviceType && days && kilometers && grooming && estimate) {
  [serviceType, days, kilometers, grooming].forEach((field) => {
    field.addEventListener("input", updateEstimate);
    field.addEventListener("change", updateEstimate);
  });

  updateEstimate();
}

if (reservationForm) {
  reservationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(reservationForm);
    const name = formData.get("Nom et prenom") || "";
    const email = formData.get("Email") || "";
    const phone = formData.get("Telephone") || "";
    const message = formData.get("Demande") || "";
    const subject = `Demande de réservation - ${name}`;
    const body = [
      `Nom et prénom : ${name}`,
      `Email : ${email}`,
      `Téléphone : ${phone}`,
      "",
      "Demande :",
      message
    ].join("\n");

    window.location.href = `mailto:aupanierdouillet@outlook.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const revealItems = document.querySelectorAll(
  ".section, .service-card, .band, .photo-section, .quick-info > *"
);

if ("IntersectionObserver" in window) {
  revealItems.forEach((item) => item.classList.add("reveal-ready"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

function galleryStep() {
  if (!galleryTrack) return 0;

  const firstCard = galleryTrack.querySelector(".photo-card");
  if (!firstCard) return galleryTrack.clientWidth;

  const gap = Number.parseFloat(getComputedStyle(galleryTrack).gap || "0");
  return firstCard.getBoundingClientRect().width + gap;
}

function scrollGallery(direction) {
  if (!galleryTrack) return;

  galleryTrack.scrollBy({
    left: galleryStep() * direction,
    behavior: "smooth"
  });
}

if (galleryTrack && previousPhoto && nextPhoto) {
  previousPhoto.addEventListener("click", () => scrollGallery(-1));
  nextPhoto.addEventListener("click", () => scrollGallery(1));

  let galleryTimer = window.setInterval(() => {
    const maxScroll = galleryTrack.scrollWidth - galleryTrack.clientWidth - 8;

    if (galleryTrack.scrollLeft >= maxScroll) {
      galleryTrack.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      scrollGallery(1);
    }
  }, 4800);

  galleryTrack.addEventListener("pointerenter", () => {
    window.clearInterval(galleryTimer);
  });

  galleryTrack.addEventListener("pointerleave", () => {
    galleryTimer = window.setInterval(() => {
      const maxScroll = galleryTrack.scrollWidth - galleryTrack.clientWidth - 8;

      if (galleryTrack.scrollLeft >= maxScroll) {
        galleryTrack.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollGallery(1);
      }
    }, 4800);
  });
}

function previewPhoto(card, file) {
  if (!file || !file.type.startsWith("image/")) return;

  let image = card.querySelector("img");
  const previewUrl = URL.createObjectURL(file);

  if (!image) {
    image = document.createElement("img");
    image.alt = "Photo ajoutée";
    card.prepend(image);
  }

  image.hidden = false;
  image.src = previewUrl;
  card.classList.add("has-preview");

  const caption = card.querySelector("figcaption span");
  if (caption) {
    caption.textContent = "Aperçu local, à remplacer dans assets";
  }
}

document.querySelectorAll(".photo-card[data-photo-slot]").forEach((card) => {
  const input = card.querySelector(".photo-input");

  if (input) {
    input.addEventListener("change", () => {
      previewPhoto(card, input.files[0]);
    });
  }

  card.addEventListener("dragenter", () => card.classList.add("is-dragging"));
  card.addEventListener("dragover", (event) => {
    event.preventDefault();
    card.classList.add("is-dragging");
  });
  card.addEventListener("dragleave", () => card.classList.remove("is-dragging"));
  card.addEventListener("drop", (event) => {
    event.preventDefault();
    card.classList.remove("is-dragging");
    previewPhoto(card, event.dataTransfer.files[0]);
  });
});
