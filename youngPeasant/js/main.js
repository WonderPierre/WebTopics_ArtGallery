const wikiUrl = "https://query.wikidata.org/sparql";

const schilderijQuery = `
SELECT ?schilderij ?schilderijLabel ?img
WHERE {
  BIND(wd:Q26221231 AS ?schilderij)
  ?schilderij wdt:P18 ?img.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}
`;

document.addEventListener('DOMContentLoaded', function() {
    const lottieContainer = document.getElementById('lottie-container');
    const schilderijContainer = document.getElementById('schilderij');
    const lottiePlayer = document.querySelector('lottie-player');

    setTimeout(() => {
        setTimeout(() => {
            lottieContainer.style.display = 'none';
            fetchSchilderij();
        }, 1000);

        lottiePlayer.stop();
    }, 10000);

    function fetchSchilderij() {
        fetch(wikiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/sparql-query", "Accept": "application/json" },
            body: schilderijQuery
        })
        .then(response => response.json())
        .then(data => {
            if (data.results.bindings.length > 0) {
                const schilderij = data.results.bindings[0];
                const img = document.createElement('img');
                img.src = schilderij.img.value;
                img.alt = schilderij.schilderijLabel.value;
                img.style.maxWidth= "20rem";
                schilderijContainer.appendChild(img);

                const titel = document.createElement('p');
                titel.textContent = schilderij.schilderijLabel.value;
                schilderijContainer.appendChild(titel);

            }
        })
        .catch(error => console.error('Error:', error));
    }
});