import { request } from "./service.js";
const inputRecherche = document.querySelector("#recherche-article")
const containerArticles = document.querySelector("#articles-container")
const selectTri = document.querySelector("#tri-articles")
const selectStatut = document.querySelector("#filtre-statut")

let articles = [];

async function chargerArticles() {
    try{
        const donnees = await request("/posts")
        const statuts = ["Disponible", "Réservé", "Vendu"]
        articles = donnees.map((article, index) => ({
            ...article,
            status: statuts[index % statuts.length],
            price:(index + 1)*100,
            date:"2026-01-"+String((index%28)+1).padStart(2,"0")
        }))
    }catch(error){
        console.log(error)
    }
    appliquerFiltres();
   
    
}
function appliquerFiltres() {
    const recherche = inputRecherche.value.toLowerCase().trim();
    let resultats = articles.filter(article =>
        article.title.toLowerCase().includes(recherche)
    );
    if (selectTri.value === "asc") {
      resultats.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (selectTri.value === "desc") {
        resultats.sort((a, b) => b.title.localeCompare(a.title));
    }
    const statut = selectStatut.value;
    if(statut){
        resultats = resultats.filter(article =>
            article.status === statut
        )
    }
    if (selectTri.value === "price-asc"){
        resultats.sort((a,b)=> a.price - b.price)
    }if(selectTri.value === "price-desc"){
        resultats.sort((a,b)=> b.price - a.price)
    }if(selectTri.value === "date-asc"){
        resultats.sort((a,b)=> new Date(a.date)-new Date(b.date))
    }if(selectTri.value === "date-desc"){
        resultats.sort((a,b)=> new Date(b.date) - new Date(a.date))
    }

    afficherArticles(resultats);
}
inputRecherche.addEventListener("input", appliquerFiltres);
selectTri.addEventListener("change", appliquerFiltres);
selectStatut.addEventListener("change", appliquerFiltres)

function afficherArticles(liste) {
    containerArticles.replaceChildren()
    liste.forEach(article => {
        const titre = document.createElement("h3")
        titre.textContent=article.title;
        const description = document.createElement("p")
        description.textContent=article.body
        const carte = document.createElement("article")
        const boutounDetails = document.createElement("button")
        boutounDetails.textContent = "Voir détails"
        const zoneDetails = document.createElement("div")
        carte.append(titre, description,boutounDetails,zoneDetails)
        containerArticles.append(carte)
        boutounDetails.addEventListener("click", async() =>{
            try {
                const details = await request(`/posts/${article.id}`)
                const info = document.createElement("p")
                info.textContent = `ID: ${details.id} | User: ${details.userId}`
                zoneDetails.replaceChildren(info)
            } catch (error) {
                zoneDetails.textContent=error.message
            }
        })

    });
}
chargerArticles();


