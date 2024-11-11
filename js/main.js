const vanGoghQuery = `
SELECT ?schilderij ?schilderijLabel ?img
WHERE {
  ?schilderij wdt:P170 wd:Q5582; 
            wdt:P31 wd:Q3305213.
  ?schilderij wdt:P18 ?img.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC (?schilderijLabel)
LIMIT 3
`;

const willekeurigeSchilderijenQuery = `
SELECT ?schilderij ?schilderijLabel ?img
WHERE {
  ?schilderij wdt:P170 wd:Q296;     
             wdt:P31 wd:Q3305213.         
  ?schilderij wdt:P18 ?img.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}

ORDER BY DESC(?schilderijLabel)
LIMIT 3
`;

// Laad-cirkel
const lader = document.createElement("div");
lader.id = "laad-ding";
lader.innerHTML = '<div class="draai-cirkel"></div><p>Even geduld...</p>';
document.body.appendChild(lader);

let geladenAfbeeldingen = 0;
const totaalQueries = 2;
const verwachtAantalAfbeeldingen = 6;
let afgerondeQueries = 0;

const worker = new Worker("https://wonderpierre.github.io/WebTopics_ArtGallery/js/schilderijen-worker.js");

function haalSchilderijenOp(query, id) {
  return new Promise((resolve, reject) => {
    worker.postMessage({ query, id });
  });
}

worker.onmessage = function (e) {
  const { id, data, error } = e.data;
  let schilderijenLijst = document.getElementById(id);
  let afbeeldingBeloftes = [];

  if (error) {
    console.error("fout:", error);
    schilderijenLijst.innerHTML =
      "<li>Er ging iets mis bij het ophalen van de schilderijen.</li>";
    afgerondeQueries++;
    zijnAlleAfbeeldingenGeladen();
    return;
  }

  data.results.bindings.forEach((resultaat) => {
    const item = document.createElement("li");
    item.className = "verborgen";

    const img = document.createElement("img");
    img.src = resultaat.img.value;
    img.alt = resultaat.schilderijLabel.value;
    img.style.maxWidth = "20rem";
    img.style.opacity = "0";

    const titel = document.createElement("p");
    titel.textContent = resultaat.schilderijLabel.value;
    titel.style.fontSize = "1.5rem";
    titel.style.opacity = "0";

    item.appendChild(img);
    item.appendChild(titel);
    schilderijenLijst.appendChild(item);

    item.addEventListener("click", () => {
      if (img.alt === "Young Man with Cornflower") {
        window.location.href = "../youngPeasant/index.html";
      }
    });

    afbeeldingBeloftes.push(
      new Promise((imgResolve) => {
        img.onload = () => {
          geladenAfbeeldingen++;
          console.log(`Afbeelding geladen. Totaal: ${geladenAfbeeldingen}`);
          imgResolve();
        };
        img.onerror = () => {
          console.error(`Fout bij het laden van afbeelding: ${img.src}`);
          geladenAfbeeldingen++;
          imgResolve();
        };
      })
    );
  });

  Promise.all(afbeeldingBeloftes).then(() => {
    afgerondeQueries++;
    zijnAlleAfbeeldingenGeladen();
  });
};

function zijnAlleAfbeeldingenGeladen() {
  console.log(
    `Afgeronde queries: ${afgerondeQueries}, Geladen afbeeldingen: ${geladenAfbeeldingen}`
  );
  if (
    afgerondeQueries === totaalQueries &&
    geladenAfbeeldingen === verwachtAantalAfbeeldingen
  ) {
    console.log("Alle afbeeldingen zijn geladen, laadcirkel wordt verwijderd");
    if (lader && lader.parentNode) {
      lader.remove();
    }

    document
      .querySelectorAll("#schilderijenGogh li, #schilderijen li")
      .forEach((item) => {
        item.classList.remove("verborgen");
      });

    gsap.fromTo(
      "#schilderijenGogh img, #schilderijen img",
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" }
    );
    gsap.fromTo(
      "#schilderijenGogh p, #schilderijen p",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.2,
        ease: "power2.out",
      }
    );
  }
}

// Laad de 2 queries tegelijk in zodat de laadtijd versneld wordt
Promise.all([
  haalSchilderijenOp(vanGoghQuery, "schilderijenGogh"),
  haalSchilderijenOp(willekeurigeSchilderijenQuery, "schilderijen"),
])
  .then(() => {
    console.log("Alle queries zijn verzonden naar de worker");
  })
  .catch((error) => {
    console.error(
      "Er is een fout opgetreden bij het verzenden van de queries naar de worker:",
      error
    );
    if (lader && lader.parentNode) {
      lader.remove();
    }
  });
