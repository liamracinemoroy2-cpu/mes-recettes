// ============================================================
// FIREBASE
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBKpLpyXlwAzFauEte-XFQdEiML-nRbaJ8",
    authDomain: "mes-recettes39.firebaseapp.com",
    projectId: "mes-recettes39",
    storageBucket: "mes-recettes39.firebasestorage.app",
    messagingSenderId: "121399383526",
    appId: "1:121399383526:web:de0667b9467530a4b13227"
};


// Initialisation Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();


// ============================================================
// VARIABLES
// ============================================================

let ingredients = [];
let ingredientId = 0;

let steps = [];
let stepId = 0;

let recipes = [];

let currentRecipeId = null;
let currentStepIndex = 0;


// ============================================================
// AUTHENTIFICATION ANONYME
// ============================================================

auth.signInAnonymously()
    .then(() => {

        console.log("Connexion Firebase réussie.");

    })
    .catch((error) => {

        console.error(
            "Erreur de connexion Firebase :",
            error
        );

        alert(
            "Impossible de se connecter à Firebase.\n\n" +
            "Vérifie que l'authentification anonyme est activée dans Firebase."
        );

    });


auth.onAuthStateChanged((user) => {

    if (user) {

        console.log(
            "Utilisateur Firebase connecté :",
            user.uid
        );

        subscribeToRecipes();

    }

});


// ============================================================
// NAVIGATION
// ============================================================

function showPage(pageId) {

    const pages = document.querySelectorAll(".page");

    pages.forEach((page) => {

        page.classList.remove("active");

    });


    const page = document.getElementById(pageId);

    if (page) {

        page.classList.add("active");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ============================================================
// NOUVELLE RECETTE
// ============================================================

function newRecipe() {

    ingredients = [];
    ingredientId = 0;

    steps = [];
    stepId = 0;

    currentRecipeId = null;
    currentStepIndex = 0;


    document.getElementById("recipe-name").value = "";
    document.getElementById("recipe-description").value = "";


    document.getElementById("ingredients-list").innerHTML = "";

    document.getElementById("steps-list").innerHTML = "";


    showPage("creer");

}


// ============================================================
// ETAPE 1 : INFORMATIONS
// ============================================================

function startIngredients() {

    const name = document
        .getElementById("recipe-name")
        .value
        .trim();


    if (!name) {

        alert("Merci d'indiquer un nom pour la recette.");

        return;

    }


    if (ingredients.length === 0) {

        addIngredient();

    }


    showPage("ingredients");

}


// ============================================================
// INGREDIENTS
// ============================================================

function addIngredient() {

    const ingredient = {

        id: ingredientId++,

        product: "",

        quantity: "",

        type: "Masse",

        unit: "g",

        customUnit: "",

        used: false

    };


    ingredients.push(ingredient);

    renderIngredients();

}


// ============================================================
// AFFICHAGE INGREDIENTS
// ============================================================

function renderIngredients() {

    const container =
        document.getElementById("ingredients-list");


    container.innerHTML = "";


    ingredients.forEach((ingredient) => {

        const row = document.createElement("div");

        row.className = "ingredient-row";


        let unitOptions = "";


        if (ingredient.type === "Masse") {

            unitOptions = `
                <option value="mg" ${ingredient.unit === "mg" ? "selected" : ""}>mg</option>
                <option value="g" ${ingredient.unit === "g" ? "selected" : ""}>g</option>
                <option value="kg" ${ingredient.unit === "kg" ? "selected" : ""}>kg</option>
                <option value="t" ${ingredient.unit === "t" ? "selected" : ""}>t</option>
            `;

        }


        else if (ingredient.type === "Volume") {

            unitOptions = `
                <option value="ml" ${ingredient.unit === "ml" ? "selected" : ""}>ml</option>
                <option value="cl" ${ingredient.unit === "cl" ? "selected" : ""}>cl</option>
                <option value="dl" ${ingredient.unit === "dl" ? "selected" : ""}>dl</option>
                <option value="l" ${ingredient.unit === "l" ? "selected" : ""}>l</option>
            `;

        }


        row.innerHTML = `

            <input
                type="text"
                placeholder="Produit"
                value="${escapeHtml(ingredient.product)}"
                oninput="updateProduct(${ingredient.id}, this.value)"
            >


            <input
                type="number"
                min="0"
                step="any"
                placeholder="Quantité"
                value="${escapeHtml(ingredient.quantity)}"
                oninput="updateQuantity(${ingredient.id}, this.value)"
            >


            <select
                onchange="updateType(${ingredient.id}, this.value)"
            >

                <option
                    value="Masse"
                    ${ingredient.type === "Masse" ? "selected" : ""}
                >
                    MASSE
                </option>

                <option
                    value="Volume"
                    ${ingredient.type === "Volume" ? "selected" : ""}
                >
                    VOLUME
                </option>

                <option
                    value="Personnaliser"
                    ${ingredient.type === "Personnaliser" ? "selected" : ""}
                >
                    PERSONNALISER
                </option>

            </select>


            ${
                ingredient.type === "Personnaliser"

                ?

                `
                    <input
                        type="text"
                        placeholder="Unité"
                        value="${escapeHtml(ingredient.customUnit)}"
                        oninput="updateUnit(${ingredient.id}, this.value)"
                    >
                `

                :

                `
                    <select
                        onchange="updateUnit(${ingredient.id}, this.value)"
                    >
                        ${unitOptions}
                    </select>
                `
            }


            <button
                class="delete-button"
                onclick="deleteIngredient(${ingredient.id})"
                title="Supprimer"
            >
                🗑️
            </button>

        `;


        container.appendChild(row);

    });

}


// ============================================================
// MODIFICATION INGREDIENT
// ============================================================

function updateProduct(id, value) {

    const ingredient =
        ingredients.find(item => item.id === id);


    if (ingredient) {

        ingredient.product = value;

    }

}


function updateQuantity(id, value) {

    const ingredient =
        ingredients.find(item => item.id === id);


    if (ingredient) {

        ingredient.quantity = value;

    }

}


function updateType(id, value) {

    const ingredient =
        ingredients.find(item => item.id === id);


    if (!ingredient) return;


    ingredient.type = value;


    if (value === "Masse") {

        ingredient.unit = "g";
        ingredient.customUnit = "";

    }

    else if (value === "Volume") {

        ingredient.unit = "ml";
        ingredient.customUnit = "";

    }

    else {

        ingredient.unit = "";
        ingredient.customUnit = "";

    }


    renderIngredients();

}


function updateUnit(id, value) {

    const ingredient =
        ingredients.find(item => item.id === id);


    if (!ingredient) return;


    if (ingredient.type === "Personnaliser") {

        ingredient.customUnit = value;

    }

    else {

        ingredient.unit = value;

    }

}


// ============================================================
// SUPPRESSION INGREDIENT
// ============================================================

function deleteIngredient(id) {

    ingredients = ingredients.filter(
        ingredient => ingredient.id !== id
    );


    renderIngredients();

}


// ============================================================
// FIN INGREDIENTS
// ============================================================

function finishIngredients() {

    if (ingredients.length === 0) {

        alert("Ajoute au moins un ingrédient.");

        return;

    }


    for (const ingredient of ingredients) {

        if (!ingredient.product.trim()) {

            alert("Chaque ingrédient doit avoir un produit.");

            return;

        }


        if (
            ingredient.quantity === "" ||
            Number(ingredient.quantity) < 0
        ) {

            alert(
                `Indique une quantité pour "${ingredient.product}".`
            );

            return;

        }


        if (
            ingredient.type === "Personnaliser" &&
            !ingredient.customUnit.trim()
        ) {

            alert(
                `Indique une unité pour "${ingredient.product}".`
            );

            return;

        }

    }


    if (steps.length === 0) {

        addStep();

    }


    renderSteps();

    showPage("etapes");

}


// ============================================================
// ETAPES
// ============================================================

function addStep() {

    const step = {

        id: stepId++,

        text: "",

        ingredientsUsed: []

    };


    steps.push(step);

    renderSteps();

}


// ============================================================
// AFFICHAGE DES ETAPES
// ============================================================

function renderSteps() {

    const container =
        document.getElementById("steps-list");


    container.innerHTML = "";


    steps.forEach((step, index) => {

        const row = document.createElement("div");

        row.className = "step-row";


        row.innerHTML = `

            <div class="step-number">
                Étape ${index + 1}
            </div>


            <textarea
                placeholder="Décris cette étape..."
                oninput="updateStepText(${step.id}, this.value)"
            >${escapeHtml(step.text)}</textarea>


            <div class="step-tools">

                <select
                    onchange="insertIngredient(${step.id}, this.value)"
                >

                    <option value="">
                        + Insérer un ingrédient
                    </option>

                    ${getIngredientOptions(step)}

                </select>


                <button
                    class="delete-button"
                    onclick="deleteStep(${step.id})"
                    title="Supprimer l'étape"
                >
                    🗑️
                </button>

            </div>

        `;


        container.appendChild(row);

    });

}


// ============================================================
// OPTIONS INGREDIENTS POUR LES ETAPES
// ============================================================

function getIngredientOptions(step) {

    return ingredients
        .map((ingredient) => {

            const used =
                step.ingredientsUsed.includes(ingredient.id);


            const quantity =
                ingredient.quantity;


            const unit =
                ingredient.type === "Personnaliser"
                    ? ingredient.customUnit
                    : ingredient.unit;


            const label =
                `${quantity} ${unit} de ${ingredient.product}`;


            return `
                <option value="${ingredient.id}">
                    ${used ? "✅ " : ""}${escapeHtml(label)}
                </option>
            `;

        })
        .join("");

}


// ============================================================
// MODIFICATION ETAPE
// ============================================================

function updateStepText(id, value) {

    const step =
        steps.find(item => item.id === id);


    if (step) {

        step.text = value;

    }

}


// ============================================================
// INSERTION INGREDIENT DANS UNE ETAPE
// ============================================================

function insertIngredient(stepIdValue, ingredientIdValue) {

    if (ingredientIdValue === "") {

        return;

    }


    const step =
        steps.find(item => item.id === stepIdValue);


    const ingredient =
        ingredients.find(
            item => item.id === Number(ingredientIdValue)
        );


    if (!step || !ingredient) {

        return;

    }


    const unit =
        ingredient.type === "Personnaliser"
            ? ingredient.customUnit
            : ingredient.unit;


    const text =
        `${ingredient.quantity} ${unit} de ${ingredient.product}`;


    if (step.text.trim() !== "") {

        step.text += " ";

    }


    step.text += text;


    if (!step.ingredientsUsed.includes(ingredient.id)) {

        step.ingredientsUsed.push(ingredient.id);

    }


    renderSteps();

}


// ============================================================
// SUPPRESSION ETAPE
// ============================================================

function deleteStep(id) {

    steps = steps.filter(
        step => step.id !== id
    );


    renderSteps();

}


// ============================================================
// TERMINER LA RECETTE
// ============================================================

async function finishRecipe() {

    const name =
        document
            .getElementById("recipe-name")
            .value
            .trim();


    const description =
        document
            .getElementById("recipe-description")
            .value
            .trim();


    if (!name) {

        alert("Le nom de la recette est obligatoire.");

        return;

    }


    if (steps.length === 0) {

        alert("Ajoute au moins une étape.");

        return;

    }


    for (const step of steps) {

        if (!step.text.trim()) {

            alert(
                "Toutes les étapes doivent contenir du texte."
            );

            return;

        }

    }


    const user = auth.currentUser;


    if (!user) {

        alert(
            "La connexion à Firebase n'est pas encore prête. Réessaie dans quelques secondes."
        );

        return;

    }


    const recipe = {

        name: name,

        description: description,

        ingredients: ingredients.map(ingredient => ({

            product: ingredient.product,

            quantity: ingredient.quantity,

            type: ingredient.type,

            unit: ingredient.unit,

            customUnit: ingredient.customUnit

        })),

        steps: steps.map(step => ({

            text: step.text,

            ingredientsUsed: step.ingredientsUsed

        })),

        author_uid: user.uid,

        createdAt: firebase.firestore.FieldValue.serverTimestamp()

    };


    try {

        await db
            .collection("recipes")
            .add(recipe);


        alert("🎉 Recette enregistrée avec succès !");


        showRecipes();

    }

    catch (error) {

        console.error(
            "Erreur lors de l'enregistrement :",
            error
        );


        alert(
            "Impossible d'enregistrer la recette.\n\n" +
            error.message
        );

    }

}


// ============================================================
// FIRESTORE : RECUPERATION EN TEMPS REEL
// ============================================================

function subscribeToRecipes() {

    db.collection("recipes")
        .onSnapshot(

            (snapshot) => {

                recipes = snapshot.docs
                    .map((document) => {

                        return {

                            id: document.id,

                            ...document.data()

                        };

                    })
                    .filter((recipe) => {

                        return (
                            recipe.name &&
                            Array.isArray(recipe.ingredients) &&
                            Array.isArray(recipe.steps)
                        );

                    });


                renderRecipes();

            },


            (error) => {

                console.error(
                    "Erreur Firestore :",
                    error
                );


                document.getElementById(
                    "recipes-grid"
                ).innerHTML = `

                    <div class="empty-state">

                        <h2>⚠️ Erreur de connexion</h2>

                        <p>
                            Impossible de récupérer les recettes.
                        </p>

                    </div>

                `;

            }

        );

}


// ============================================================
// MES RECETTES
// ============================================================

function showRecipes() {

    showPage("recettes");

    renderRecipes();

}


// ============================================================
// AFFICHAGE DES CARTES
// ============================================================

function renderRecipes() {

    const container =
        document.getElementById("recipes-grid");


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (recipes.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h2>🍴 Aucune recette</h2>

                <p>
                    Tu n'as encore créé aucune recette.
                </p>

                <button
                    class="primary-button"
                    onclick="newRecipe()"
                >
                    Créer ma première recette →
                </button>

            </div>

        `;

        return;

    }


    recipes.forEach((recipe) => {

        const card =
            document.createElement("div");


        card.className = "recipe-card";


        card.innerHTML = `

            <div class="recipe-card-content">

                <h2>
                    ${escapeHtml(recipe.name)}
                </h2>


                ${
                    recipe.description

                    ?

                    `
                        <p>
                            ${escapeHtml(recipe.description)}
                        </p>
                    `

                    :

                    `
                        <p>
                            Aucune description.
                        </p>
                    `
                }


                <div class="recipe-card-actions">

                    <button
                        class="primary-button"
                        onclick="startRecipe('${recipe.id}')"
                    >
                        VOIR PLUS
                    </button>


                    <button
                        class="delete-button"
                        onclick="deleteRecipe('${recipe.id}')"
                        title="Supprimer la recette"
                    >
                        🗑️
                    </button>

                </div>

            </div>

        `;


        container.appendChild(card);

    });

}


// ============================================================
// SUPPRESSION RECETTE
// ============================================================

async function deleteRecipe(id) {

    const recipe =
        recipes.find(item => item.id === id);


    if (!recipe) {

        return;

    }


    const confirmed =
        confirm(
            `Supprimer la recette "${recipe.name}" ?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await db
            .collection("recipes")
            .doc(String(id))
            .delete();


    }

    catch (error) {

        console.error(
            "Erreur lors de la suppression :",
            error
        );


        alert(
            "Impossible de supprimer la recette.\n\n" +
            error.message
        );

    }

}


// ============================================================
// LECTURE D'UNE RECETTE
// ============================================================

function startRecipe(id) {

    currentRecipeId = id;

    currentStepIndex = 0;


    const recipe =
        recipes.find(item => item.id === id);


    if (!recipe) {

        alert("Recette introuvable.");

        return;

    }


    startReadingRecipe(recipe);

}


// ============================================================
// ECRAN DE PRESENTATION
// ============================================================

function startReadingRecipe(recipe) {

    const reader =
        document.getElementById("recipe-reader");


    const ingredientsHtml =
        recipe.ingredients
            .map((ingredient) => {

                const unit =
                    ingredient.type === "Personnaliser"
                        ? ingredient.customUnit
                        : ingredient.unit;


                return `
                    <li>
                        <strong>
                            ${escapeHtml(ingredient.quantity)}
                            ${escapeHtml(unit)}
                        </strong>
                        de
                        ${escapeHtml(ingredient.product)}
                    </li>
                `;

            })
            .join("");


    reader.innerHTML = `

        <div class="reader-card">

            <div class="reader-header">

                <h1>
                    ${escapeHtml(recipe.name)}
                </h1>


                ${
                    recipe.description

                    ?

                    `
                        <p>
                            ${escapeHtml(recipe.description)}
                        </p>
                    `

                    :

                    ""
                }

            </div>


            <div class="reader-ingredients">

                <h2>🛒 Ingrédients</h2>

                <ul>
                    ${ingredientsHtml}
                </ul>

            </div>


            <div class="reader-actions">

                <button
                    class="secondary-button"
                    onclick="showRecipes()"
                >
                    ← RETOUR
                </button>


                <button
                    class="primary-button big-button"
                    onclick="showRecipeStep()"
                >
                    COMMENCER →
                </button>

            </div>

        </div>

    `;


    showPage("lecture");

}


// ============================================================
// AFFICHAGE D'UNE ETAPE
// ============================================================

function showRecipeStep() {

    const recipe =
        recipes.find(
            item => item.id === currentRecipeId
        );


    if (!recipe) {

        return;

    }


    const total =
        recipe.steps.length;


    const step =
        recipe.steps[currentStepIndex];


    if (!step) {

        showRecipeFinished();

        return;

    }


    const reader =
        document.getElementById("recipe-reader");


    const isLast =
        currentStepIndex === total - 1;


    reader.innerHTML = `

        <div class="reader-card step-reader">

            <div class="progress">

                Étape ${currentStepIndex + 1} / ${total}

            </div>


            <h1>
                ${escapeHtml(recipe.name)}
            </h1>


            <div class="current-step">

                <div class="current-step-number">

                    ${currentStepIndex + 1}

                </div>


                <p>
                    ${escapeHtml(step.text)}
                </p>

            </div>


            <div class="reader-actions">

                <button
                    class="secondary-button"
                    onclick="previousRecipeStep()"
                    ${currentStepIndex === 0 ? "disabled" : ""}
                >
                    ← RETOUR
                </button>


                ${
                    isLast

                    ?

                    `
                        <button
                            class="primary-button"
                            onclick="showRecipeFinished()"
                        >
                            TERMINER ✓
                        </button>
                    `

                    :

                    `
                        <button
                            class="primary-button"
                            onclick="nextRecipeStep()"
                        >
                            SUIVANT →
                        </button>
                    `
                }

            </div>

        </div>

    `;


    showPage("lecture");

}


// ============================================================
// ETAPE SUIVANTE
// ============================================================

function nextRecipeStep() {

    const recipe =
        recipes.find(
            item => item.id === currentRecipeId
        );


    if (!recipe) {

        return;

    }


    if (
        currentStepIndex <
        recipe.steps.length - 1
    ) {

        currentStepIndex++;

        showRecipeStep();

    }

    else {

        showRecipeFinished();

    }

}


// ============================================================
// ETAPE PRECEDENTE
// ============================================================

function previousRecipeStep() {

    if (currentStepIndex > 0) {

        currentStepIndex--;

        showRecipeStep();

    }

}


// ============================================================
// FIN DE RECETTE
// ============================================================

function showRecipeFinished() {

    const recipe =
        recipes.find(
            item => item.id === currentRecipeId
        );


    const reader =
        document.getElementById("recipe-reader");


    reader.innerHTML = `

        <div class="reader-card finished-card">

            <div class="finished-icon">
                🎉
            </div>


            <h1>
                Recette terminée !
            </h1>


            <p>
                Bravo ! Tu as terminé
                <strong>
                    ${recipe ? escapeHtml(recipe.name) : "ta recette"}
                </strong>.
            </p>


            <div class="reader-actions">

                <button
                    class="secondary-button"
                    onclick="showRecipes()"
                >
                    ← MES RECETTES
                </button>


                <button
                    class="primary-button"
                    onclick="restartRecipe()"
                >
                    RECOMMENCER ↻
                </button>

            </div>

        </div>

    `;


    showPage("lecture");

}


// ============================================================
// RECOMMENCER
// ============================================================

function restartRecipe() {

    currentStepIndex = 0;

    showRecipeStep();

}


// ============================================================
// SECURITE HTML
// ============================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ============================================================
// INITIALISATION
// ============================================================

renderRecipes();
