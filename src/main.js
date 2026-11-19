
const url = "https://xaus.com/api/v1/spot";

const container = document.querySelector("#metals-container");
const selectDevise = document.querySelector("#currency");

// Devise sauvegardée
const devises = ["MAD", "USD", "EUR"];

const ancienneDevise = localStorage.getItem("devise");

let deviseChoisie = devises.includes(ancienneDevise)
    ? ancienneDevise
    : "MAD";

// Données globales
let metaux = [];
let dateMaj = "";
let fxRates = {};

selectDevise.value = deviseChoisie;


// US-01 + US-02
async function getPrices() {

    try {
        container.textContent = "Chargement...";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Erreur HTTP");
        }

        const data = await response.json();

        fxRates = data.fx_rates;

        const prixOrUSD = data.spot_usd_oz;
        const prixArgentUSD = data.silver_usd_oz;

        dateMaj = data.updated_at;

        // Récupérer les variations
        const [variationOr, variationArgent] =
            await Promise.all([
                getVariation("xau", prixOrUSD),
                getVariation("silver", prixArgentUSD)
            ]);

        // Tableau des métaux
        metaux = [
            {
                nom: "Or",
                prixUSD: prixOrUSD,
                image: "photos/gold-bars.png",
                variation: variationOr
            },
            {
                nom: "Argent",
                prixUSD: prixArgentUSD,
                image: "photos/bars.png",
                variation: variationArgent
            }
        ];

        afficherCartes(metaux, dateMaj);

    } catch (error) {
        console.error(error);
        container.textContent = "Erreur de chargement";
    }
}


// US-02 + US-03
function afficherCartes(metaux, dateMaj) {

    container.replaceChildren();

    const taux = fxRates[deviseChoisie];

    if (typeof taux !== "number") {
        container.textContent = "Taux de change indisponible";
        return;
    }

    metaux.forEach(function(metal) {

        const carte = document.createElement("div");
        carte.classList.add("gold");

        const content = document.createElement("div");
        content.classList.add("content");

        // Image
        const photo = document.createElement("div");
        photo.classList.add("photo");

        const image = document.createElement("img");
        image.src = metal.image;
        image.alt = metal.nom;
        image.width = 200;

        photo.appendChild(image);

        // Informations
        const info = document.createElement("div");
        info.classList.add("linfo");

        const titre = document.createElement("h2");
        titre.textContent = metal.nom;

        // Conversion du prix actuel
        const prix = document.createElement("p");

        const prixConverti = metal.prixUSD * taux;

        prix.textContent =
            `${prixConverti.toFixed(2)} ${deviseChoisie}`;

        // Variation
        const variation = document.createElement("p");

        if (metal.variation !== null) {

            const valeur =
                metal.variation.valeur * taux;

            const pourcentage =
                metal.variation.pourcentage;

            let fleche = "→";
            let couleur = "stable";

            if (valeur > 0) {
                fleche = "↑";
                couleur = "hausse";
            } else if (valeur < 0) {
                fleche = "↓";
                couleur = "baisse";
            }

            const signeValeur = valeur > 0 ? "+" : "";
            const signePourcentage = pourcentage > 0 ? "+" : "";

            variation.textContent =
                `${fleche} ${signeValeur}${valeur.toFixed(2)} ${deviseChoisie} (${signePourcentage}${pourcentage.toFixed(2)}%)`;

            variation.classList.add(couleur);

        } else {
            variation.textContent = "Variation indisponible";
        }

        info.appendChild(titre);
        info.appendChild(prix);
        info.appendChild(variation);

        content.appendChild(photo);
        content.appendChild(info);

        // Date
        const mise = document.createElement("div");
        mise.classList.add("mise");

        const dateTexte = document.createElement("p");

        dateTexte.textContent =
            `🕐 Dernière mise à jour : ${dateMaj}`;

        mise.appendChild(dateTexte);

        // Assemblage
        carte.appendChild(content);
        carte.appendChild(mise);

        container.appendChild(carte);
    });
}


// Récupérer l'historique et calculer la variation
async function getVariation(symbol, prixActuel) {

    try {
        const urlHistorique =
            `https://xaus.com/api/v1/chart?symbol=${symbol}&range=5d&interval=1d`;

        const response = await fetch(urlHistorique);

        if (!response.ok) {
            throw new Error("Erreur historique");
        }

        const historique = await response.json();

        if (!Array.isArray(historique.points) ||
            historique.points.length < 2) {
            return null;
        }

        const prixPrecedent =
            historique.points[historique.points.length - 2].c;

        const variation = prixActuel - prixPrecedent;

        const pourcentage =
            (variation / prixPrecedent) * 100;

        return {
            valeur: variation,
            pourcentage: pourcentage
        };

    } catch (error) {
        console.error(error);
        return null;
    }
}


// US-03 : Changement de devise
selectDevise.addEventListener("change", function() {

    deviseChoisie = selectDevise.value;

    // Sauvegarder le choix
    localStorage.setItem("devise", deviseChoisie);

    // Réafficher les cartes avec la nouvelle devise
    if (metaux.length > 0) {
        afficherCartes(metaux, dateMaj);
    }
});


// Démarrage
getPrices();
