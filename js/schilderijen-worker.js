self.addEventListener('message', function(e) {
  const { query, id } = e.data;
  
  fetch("https://query.wikidata.org/sparql", {
    method: "POST",
    headers: {
      "Content-Type": "application/sparql-query",
      "Accept": "application/json"
    },
    body: query
  })
  .then(response => response.json())
  .then(data => {
    self.postMessage({ id, data });
  })
  .catch(error => {
    self.postMessage({ id, error: error.message });
  });
});