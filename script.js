/* =========================
   VARIABLES
========================= */

let ingredients = [];
let ingredientId = 0;

let steps = [];
let stepId = 0;

let recipes = [];

let currentRecipeId = null;


/* =========================
   SAUVEGARDE
========================= */

function loadRecipes() {

    const savedRecipes = localStorage.getItem("mesRecettes");

    if (savedRecipes) {

        try {

            recipes = JSON.parse(savedRecipes);

        } catch (error) {

            console.error(
                "Erreur lors du chargement des recettes :",
                error
            );

            recipes = [];
        }

    } else {

        recipes = [];
    }
}


function saveRecipes() {

    localStorage.setItem(
        "mesRecettes",
        JSON.stringify(recipes)
    );
}


/* =========================
   NAVIGATION
========================= */

function showPage(pageId) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active");
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   NOUVELLE RECETTE
========================= */

function newRecipe() {

    ingredients = [];
    ingredientId = 0;

    steps = [];
    stepId = 0;

    currentRecipeId = null;


    document.getElementById(
        "recipe-name"
    ).value = "";


    document.getElementById(
        "recipe-description"
    ).value = "";


    document.getElementById(
        "ingredients-list"
    ).innerHTML = "";


    document.getElementById(
        "steps-list"
    ).innerHTML = "";


    showPage("creer");
}


/* =========================
   COMMENCER LES INGREDIENTS
========================= */

function startIngredients() {

    const name =
        document.getElementById(
            "recipe-name"
        ).value.trim();


    if (!name) {

        alert(
            "Merci de donner un nom à ta recette."
        );

        return;
    }


    showPage("ingredients");


    if (ingredients.length === 0) {

        addIngredient();
    }
}


/* =========================
   AJOUTER UN INGREDIENT
========================= */

function addIngredient() {

    ingredients.push({

        id: ingredientId,

        product: "",

        quantity: "",

        type: "mass",

        unit: "g"

    });


    ingredientId++;


    renderIngredients();
}


/* =========================
   AFFICHER LES INGREDIENTS
========================= */

function renderIngredients() {

    const container =
        document.getElementById(
            "ingredients-list"
        );


    container.innerHTML = "";


    ingredients.forEach(ingredient => {

        const card =
            document.createElement("div");


        card.className =
            "ingredient-card";


        card.innerHTML = `

            <div class="ingredient-field">

                <label>
                    Produit
                </label>

                <input
                    type="text"
                    value="${escapeHtml(ingredient.product)}"
                    placeholder="Ex : Farine"
                    oninput="
                        updateProduct(
                            ${ingredient.id},
                            this.value
                        )
                    "
                >

            </div>


            <div class="ingredient-field">

                <label>
                    Quantité
                </label>

                <input
                    type="number"
                    min="0"
                    step="any"
                    value="${escapeHtml(ingredient.quantity)}"
                    placeholder="500"
                    oninput="
                        updateQuantity(
                            ${ingredient.id},
                            this.value
                        )
                    "
                >

            </div>


            <div class="ingredient-field">

                <label>
                    Type
                </label>

                <select
                    onchange="
                        updateType(
                            ${ingredient.id},
                            this.value
                        )
                    "
                >

                    <option
                        value="mass"
                        ${
                            ingredient.type === "mass"
                                ? "selected"
                                : ""
                        }
                    >
                        MASSE
                    </option>

                    <option
                        value="volume"
                        ${
                            ingredient.type === "volume"
                                ? "selected"
                                : ""
                        }
                    >
                        VOLUME
                    </option>

                </select>

            </div>


            <div class="ingredient-field">

                <label>
                    Unité
                </label>

                <select
                    onchange="
                        updateUnit(
                            ${ingredient.id},
                            this.value
                        )
                    "
                >

                    ${getUnitOptions(
                        ingredient.type,
                        ingredient.unit
                    )}

                </select>

            </div>


            <button
                class="delete-button"
                onclick="
                    deleteIngredient(
                        ${ingredient.id}
                    )
                "
                title="Supprimer"
            >
                ✕
            </button>

        `;


        container.appendChild(card);

    });
}


/* =========================
   UNITES
========================= */

function getUnitOptions(
    type,
    selectedUnit
) {

    let units = [];


    if (type === "mass") {

        units = [
            "mg",
            "g",
            "kg",
            "t"
        ];

    } else {

        units = [
            "ml",
            "cl",
            "dl",
            "l"
        ];
    }


    return units.map(unit => {

        return `

            <option
                value="${unit}"
                ${
                    unit === selectedUnit
                        ? "selected"
                        : ""
                }
            >
                ${unit}
            </option>

        `;

    }).join("");
}


/* =========================
   MISE À JOUR INGREDIENT
========================= */

function updateProduct(
    id,
    value
) {

    const ingredient =
        ingredients.find(
            item => item.id === id
        );


    if (ingredient) {

        ingredient.product = value;
    }
}


function updateQuantity(
    id,
    value
) {

    const ingredient =
        ingredients.find(
            item => item.id === id
        );


    if (ingredient) {

        ingredient.quantity = value;
    }
}


function updateType(
    id,
    value
) {

    const ingredient =
        ingredients.find(
            item => item.id === id
        );


    if (!ingredient) {

        return;
    }


    ingredient.type = value;


    if (value === "mass") {

        ingredient.unit = "g";

    } else {

        ingredient.unit = "ml";
    }


    renderIngredients();
}


function updateUnit(
    id,
    value
) {

    const ingredient =
        ingredients.find(
            item => item.id === id
        );


    if (ingredient) {

        ingredient.unit = value;
    }
}


/* =========================
   SUPPRIMER INGREDIENT
========================= */

function deleteIngredient(id) {

    ingredients =
        ingredients.filter(
            ingredient =>
                ingredient.id !== id
        );


    /*
     * On retire également cet ingrédient
     * des étapes où il avait été sélectionné.
     */

    steps.forEach(step => {

        if (
            Array.isArray(
                step.ingredientsUsed
            )
        ) {

            step.ingredientsUsed =
                step.ingredientsUsed.filter(
                    ingredientId =>
                        ingredientId !== id
                );
        }

    });


    renderIngredients();

    renderSteps();
}


/* =========================
   FIN INGREDIENTS
========================= */

function finishIngredients() {

    if (ingredients.length === 0) {

        alert(
            "Ajoute au moins un ingrédient."
        );

        return;
    }


    for (const ingredient of ingredients) {

        if (!ingredient.product.trim()) {

            alert(
                "Merci de renseigner tous les produits."
            );

            return;
        }


        if (
            ingredient.quantity === "" ||
            Number(ingredient.quantity) <= 0
        ) {

            alert(
                "Merci de renseigner une quantité valide pour chaque ingrédient."
            );

            return;
        }
    }


    showPage("etapes");


    if (steps.length === 0) {

        addStep();
    }
}


/* =========================
   AJOUTER UNE ETAPE
========================= */

function addStep() {

    steps.push({

        id: stepId,

        text: "",

        /*
         * Liste des ingrédients déjà
         * ajoutés à cette étape.
         */

        ingredientsUsed: []

    });


    stepId++;


    renderSteps();
}


/* =========================
   AFFICHER LES ETAPES
========================= */

function renderSteps() {

    const container =
        document.getElementById(
            "steps-list"
        );


    container.innerHTML = "";


    steps.forEach((step, index) => {

        /*
         * Sécurité pour les anciennes étapes
         * qui n'auraient pas encore
         * ingredientsUsed.
         */

        if (
            !Array.isArray(
                step.ingredientsUsed
            )
        ) {

            step.ingredientsUsed = [];
        }


        const card =
            document.createElement("div");


        card.className =
            "step-editor";


        card.innerHTML = `

            <div class="step-editor-header">

                <div class="step-title">
                    Étape ${index + 1}
                </div>


                <button
                    class="delete-button"
                    onclick="
                        deleteStep(
                            ${step.id}
                        )
                    "
                    title="Supprimer l'étape"
                >
                    ✕
                </button>

            </div>


            <textarea
                class="step-textarea"
                placeholder="Écris ici ce qu'il faut faire..."
                oninput="
                    updateStepText(
                        ${step.id},
                        this.value
                    )
                "
            >${escapeHtml(step.text)}</textarea>


            <div class="step-tools">

                <select
                    onchange="
                        insertIngredient(
                            ${step.id},
                            this.value
                        )
                    "
                >

                    <option value="">
                        Insérer un ingrédient...
                    </option>

                    ${getIngredientOptions(
                        step.id
                    )}

                </select>

            </div>

        `;


        container.appendChild(card);

    });
}


/* =========================
   OPTIONS INGREDIENTS
========================= */

function getIngredientOptions(
    stepIdValue
) {

    const step =
        steps.find(
            item =>
                item.id ===
                Number(stepIdValue)
        );


    /*
     * Si l'étape n'existe pas,
     * on affiche simplement les ingrédients.
     */

    const usedIngredients =
        step &&
        Array.isArray(
            step.ingredientsUsed
        )
            ? step.ingredientsUsed
            : [];


    return ingredients.map(
        ingredient => {

            /*
             * On vérifie si cet ingrédient
             * a déjà été utilisé dans cette étape.
             */

            const alreadyUsed =
                usedIngredients.includes(
                    ingredient.id
                );


            return `

                <option
                    value="${ingredient.id}"
                >

                    ${
                        alreadyUsed
                            ? "✅ "
                            : ""
                    }

                    ${escapeHtml(
                        ingredient.product
                    )}

                    —
                    ${escapeHtml(
                        ingredient.quantity
                    )}
                    ${escapeHtml(
                        getUnitSymbol(
                            ingredient.unit
                        )
                    )}

                </option>

            `;

        }
    ).join("");
}


/* =========================
   SYMBOLE UNITE
========================= */

function getUnitSymbol(unit) {

    return unit;
}


/* =========================
   INSERER INGREDIENT
========================= */

function insertIngredient(
    stepIdValue,
    ingredientIdValue
) {

    if (
        ingredientIdValue === ""
    ) {

        return;
    }


    const step =
        steps.find(
            item =>
                item.id ===
                Number(stepIdValue)
        );


    const ingredient =
        ingredients.find(
            item =>
                item.id ===
                Number(ingredientIdValue)
        );


    if (!step || !ingredient) {

        return;
    }


    /*
     * Création de la liste si nécessaire.
     */

    if (
        !Array.isArray(
            step.ingredientsUsed
        )
    ) {

        step.ingredientsUsed = [];
    }


    /*
     * On ajoute l'ingrédient à la liste
     * des ingrédients utilisés.
     *
     * Même s'il est déjà utilisé,
     * on l'ajoute quand même dans le texte.
     *
     * Cela permet de mettre plusieurs fois
     * le même ingrédient dans la recette.
     */

    if (
        !step.ingredientsUsed.includes(
            ingredient.id
        )
    ) {

        step.ingredientsUsed.push(
            ingredient.id
        );
    }


    const ingredientText =
        `${ingredient.quantity} ${getUnitSymbol(
            ingredient.unit
        )} de ${ingredient.product}`;


    if (step.text.trim()) {

        step.text +=
            " " + ingredientText;

    } else {

        step.text =
            ingredientText;
    }


    /*
     * On recharge la liste.
     *
     * L'ingrédient apparaît maintenant
     * avec le petit ✅.
     */

    renderSteps();
}


/* =========================
   MODIFIER TEXTE ETAPE
========================= */

function updateStepText(
    id,
    value
) {

    const step =
        steps.find(
            item => item.id === id
        );


    if (step) {

        step.text = value;
    }
}


/* =========================
   SUPPRIMER ETAPE
========================= */

function deleteStep(id) {

    steps =
        steps.filter(
            step =>
                step.id !== id
        );


    renderSteps();
}


/* =========================
   TERMINER LA RECETTE
========================= */

function finishRecipe() {

    if (steps.length === 0) {

        alert(
            "Ajoute au moins une étape."
        );

        return;
    }


    for (const step of steps) {

        if (!step.text.trim()) {

            alert(
                "Merci de remplir toutes les étapes."
            );

            return;
        }
    }


    const name =
        document.getElementById(
            "recipe-name"
        ).value.trim();


    const description =
        document.getElementById(
            "recipe-description"
        ).value.trim();


    if (!name) {

        alert(
            "Le nom de la recette est obligatoire."
        );

        showPage("creer");

        return;
    }


    const recipe = {

        id: Date.now(),

        name: name,

        description: description,

        ingredients:
            ingredients.map(
                ingredient => ({
                    ...ingredient
                })
            ),

        steps:
            steps.map(
                step => ({
                    ...step,

                    ingredientsUsed:
                        Array.isArray(
                            step.ingredientsUsed
                        )
                            ? [
                                ...step.ingredientsUsed
                            ]
                            : []
                })
            )

    };


    recipes.push(recipe);


    saveRecipes();


    showRecipes();


    alert(
        "🎉 Ta recette a bien été enregistrée !"
    );
}


/* =========================
   AFFICHER MES RECETTES
========================= */

function showRecipes() {

    renderRecipes();

    showPage("recettes");
}


/* =========================
   AFFICHER LES CARTES
========================= */

function renderRecipes() {

    const grid =
        document.getElementById(
            "recipes-grid"
        );


    grid.innerHTML = "";


    if (recipes.length === 0) {

        grid.innerHTML = `

            <div class="empty-state">

                <h2>
                    🍽️ Aucune recette
                </h2>

                <p>
                    Tu n'as pas encore créé de recette.
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


    recipes.forEach(recipe => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "recipe-card";


        card.innerHTML = `

            <h2>
                ${escapeHtml(
                    recipe.name
                )}
            </h2>


            <p>

                ${
                    recipe.description
                        ? escapeHtml(
                            recipe.description
                        )
                        : "Aucune description."
                }

            </p>


            <div class="recipe-card-actions">

                <button
                    class="primary-button"
                    onclick="
                        startRecipe(
                            ${recipe.id}
                        )
                    "
                >
                    COMMENCER →
                </button>


                <button
                    class="secondary-button"
                    onclick="
                        deleteRecipe(
                            ${recipe.id}
                        )
                    "
                >
                    🗑 Supprimer
                </button>

            </div>

        `;


        grid.appendChild(card);

    });
}


/* =========================
   SUPPRIMER RECETTE
========================= */

function deleteRecipe(id) {

    const recipe =
        recipes.find(
            item =>
                item.id === id
        );


    if (!recipe) {

        return;
    }


    const confirmation =
        confirm(
            `Supprimer la recette "${recipe.name}" ?`
        );


    if (!confirmation) {

        return;
    }


    recipes =
        recipes.filter(
            item =>
                item.id !== id
        );


    saveRecipes();

    renderRecipes();
}


/* =========================
   COMMENCER UNE RECETTE
========================= */

function startRecipe(id) {

    const recipe =
        recipes.find(
            item =>
                item.id === id
        );


    if (!recipe) {

        return;
    }


    currentRecipeId = id;


    const reader =
        document.getElementById(
            "recipe-reader"
        );


    reader.innerHTML = `

        <div class="recipe-start-screen">

            <h1>
                ${escapeHtml(
                    recipe.name
                )}
            </h1>


            ${
                recipe.description

                    ? `

                        <p class="recipe-description">

                            ${escapeHtml(
                                recipe.description
                            )}

                        </p>

                    `

                    : ""
            }


            <div class="reader-section">

                <h2>
                    Ingrédients
                </h2>


                <ul class="reader-ingredients">

                    ${recipe.ingredients.map(
                        ingredient => `

                            <li>

                                ${escapeHtml(
                                    ingredient.quantity
                                )}

                                ${escapeHtml(
                                    getUnitSymbol(
                                        ingredient.unit
                                    )
                                )}

                                de

                                ${escapeHtml(
                                    ingredient.product
                                )}

                            </li>

                        `
                    ).join("")}

                </ul>

            </div>


            <div class="reader-actions">


                <button
                    class="secondary-button"
                    onclick="showRecipes()"
                >
                    ← Retour à mes recettes
                </button>


                <button
                    class="primary-button start-reading-button"
                    onclick="
                        startReadingRecipe(
                            ${recipe.id}
                        )
                    "
                >
                    COMMENCER →
                </button>


            </div>

        </div>

    `;


    showPage("lecture");
}


/* =========================
   COMMENCER LA LECTURE
========================= */

function startReadingRecipe(id) {

    const recipe =
        recipes.find(
            item =>
                item.id === id
        );


    if (!recipe) {

        return;
    }


    if (
        !recipe.steps ||
        recipe.steps.length === 0
    ) {

        alert(
            "Cette recette ne contient aucune étape."
        );

        return;
    }


    currentRecipeId = id;


    showRecipeStep(
        id,
        0
    );
}


/* =========================
   AFFICHER UNE ETAPE
========================= */

function showRecipeStep(
    id,
    stepIndex
) {

    const recipe =
        recipes.find(
            item =>
                item.id === id
        );


    if (!recipe) {

        return;
    }


    if (
        stepIndex >=
        recipe.steps.length
    ) {

        showRecipeFinished(id);

        return;
    }


    const reader =
        document.getElementById(
            "recipe-reader"
        );


    const step =
        recipe.steps[stepIndex];


    reader.innerHTML = `

        <div class="recipe-step-screen">


            <div class="step-progress">

                Étape
                ${stepIndex + 1}
                /
                ${recipe.steps.length}

            </div>


            <h1>

                ${escapeHtml(
                    recipe.name
                )}

            </h1>


            <div class="step-card">


                <div class="step-number">

                    ${stepIndex + 1}

                </div>


                <div class="step-content">

                    <h2>

                        Étape
                        ${stepIndex + 1}

                    </h2>


                    <p>

                        ${escapeHtml(
                            step.text
                        )}

                    </p>

                </div>

            </div>


            <div class="reader-actions">


                ${
                    stepIndex > 0

                        ? `

                            <button
                                class="secondary-button"
                                onclick="
                                    showRecipeStep(
                                        ${recipe.id},
                                        ${stepIndex - 1}
                                    )
                                "
                            >
                                ← RETOUR
                            </button>

                        `

                        : `

                            <button
                                class="secondary-button"
                                onclick="
                                    startRecipe(
                                        ${recipe.id}
                                    )
                                "
                            >
                                ← RETOUR
                            </button>

                        `
                }


                <button
                    class="primary-button"
                    onclick="
                        showRecipeStep(
                            ${recipe.id},
                            ${stepIndex + 1}
                        )
                    "
                >

                    ${
                        stepIndex ===
                        recipe.steps.length - 1

                            ? "TERMINER ✓"

                            : "SUIVANT →"
                    }

                </button>


            </div>


        </div>

    `;


    showPage("lecture");
}


/* =========================
   FIN DE LA RECETTE
========================= */

function showRecipeFinished(id) {

    const recipe =
        recipes.find(
            item =>
                item.id === id
        );


    if (!recipe) {

        return;
    }


    const reader =
        document.getElementById(
            "recipe-reader"
        );


    reader.innerHTML = `

        <div class="recipe-finished-screen">


            <div class="confetti">

                🎉

            </div>


            <h1>

                Recette terminée !

            </h1>


            <p>

                Bravo ! Tu as terminé

                <strong>

                    ${escapeHtml(
                        recipe.name
                    )}

                </strong>.

            </p>


            <div class="reader-actions">


                <button
                    class="secondary-button"
                    onclick="showRecipes()"
                >
                    ← Mes recettes
                </button>


                <button
                    class="primary-button"
                    onclick="
                        startRecipe(
                            ${recipe.id}
                        )
                    "
                >
                    RECOMMENCER
                </button>


            </div>


        </div>

    `;


    showPage("lecture");
}


/* =========================
   PROTECTION HTML
========================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================
   INITIALISATION
========================= */

loadRecipes();

renderRecipes();
