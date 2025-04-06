const express = require("express");
const router = express.Router();
const mongoose = require("./nutridbconn.cjs");
const numberInt = require("mongoose-int32");

//Make sure that the datatypes here match with datatypes in MongoDB
const branded_food_schema = new mongoose.Schema({
    fdcId: Number,
    description: String,
    brandOwner: String,
    marketCountry: String,
    gtinUpc: String,
    ingredients: String,
    servingSize: { type: Number },
    servingSizeUnit: String,
    householdServingFullText: String,
    brandedFoodCategory: String,
    publicationDate: String
}, {collection: "branded_food"});

const Food = mongoose.model("Food", branded_food_schema);

// Route to query food items in search with filters
router.get("/food", async function(req, res) {
    try {
        // Get query params
        const searchString = req.query.searchString || "";
        const brandOwner = req.query.brandOwner;
        const category = req.query.category;
        const includeIngredients = req.query.includeIngredients;
        const excludeIngredients = req.query.excludeIngredients;

        // Build query dynamically
        let query = {
            description: { "$regex": searchString, "$options": "i" }
        };

        if (brandOwner) {
            query.brandOwner = { "$regex": brandOwner, "$options": "i" };
        }

        if (category) {
            query.brandedFoodCategory = { "$regex": category, "$options": "i" };
        }

        if (includeIngredients) {
            query.ingredients = {
                ...query.ingredients,
                "$regex": includeIngredients,
                "$options": "i"
            };
        }

        if (excludeIngredients) {
            query.ingredients = {
                ...query.ingredients,
                "$not": new RegExp(excludeIngredients, "i")
            };
        }

        // Query the database
        const food = await Food.find(query);
        console.log(food.length);

        if (!food || food.length === 0) {
            return res.send("<h2>No documents found</h2><br><a href='/htmls/search.html'>Back to search</a>");
        }

        // Build HTML output
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Search Results - NutriByte</title>
          <link rel="stylesheet" href="/css/style.css">
          <script src="/header.js" defer></script>
        </head>
        <body>
          <header-component></header-component>
          <div class="container">
            <h2>Search Results for "${searchString}"</h2>
            <form method="get" action="/api/compare">
              <div class="action-bar">
                <button type="submit">Compare Selected</button>
                <a href="/htmls/search.html">
                  <button type="button">Search Again</button>
                </a>
              </div>
              <ul>
        `;
        
      

        food.forEach(item => {
            html += `
              <li>
                <input type="checkbox" name="ids" value="${item.fdcId}" />
                <a href="/api/food/${item.fdcId}">
                  <strong>${item.fdcId}</strong>: ${item.description}
                </a>
              </li>
            `;
        });

        html += `
                        </ul>
                    </form>
                </div>
            </body>
        </html>
        `;


        res.send(html);

    } catch (e) {
        console.error(e);
        res.status(400).send(e.message);
    }
});


// Route to get details for a specific food item by fdcId
router.get("/food/:fdcId", async function(req, res) {
    try {
        const fdcId = parseInt(req.params.fdcId); // ← convert to number

        const food = await Food.findOne({ fdcId: fdcId });

        // Swap suggestions (same category, different food, not super sugary)
        const swapSuggestions = await Food.find({
            brandedFoodCategory: food.brandedFoodCategory,
            fdcId: { $ne: food.fdcId },
            ingredients: { $not: /sugar|corn syrup|high fructose/i }
        })
        .limit(3);
  

        if (!food) {
            return res.status(404).send(`<h2>Food item with FDC ID ${fdcId} not found.</h2>`);
        }

        let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Food Details - NutriByte</title>
          <link rel="stylesheet" href="/css/style.css">
          <script src="/header.js" defer></script>
        </head>
        <body>
          <header-component></header-component>
          <div class="container">
            <div class="card">
              <h2>Details for ${food.description}</h2>
              <ul>
                <li><strong>FDC ID:</strong> ${food.fdcId}</li>
                <li><strong>Brand:</strong> ${food.brandOwner}</li>
                <li><strong>Category:</strong> ${food.brandedFoodCategory}</li>
                <li><strong>Ingredients:</strong> ${food.ingredients}</li>
                <li><strong>Serving Size:</strong> ${food.servingSize} ${food.servingSizeUnit}</li>
                <li><strong>Household Serving:</strong> ${food.householdServingFullText}</li>
                <li><strong>Market Country:</strong> ${food.marketCountry}</li>
                <li><strong>Publication Date:</strong> ${food.publicationDate}</li>
              </ul>
            </div>
            <a class="back-link" href="/htmls/search.html">← Back to search</a>
          </div>
        </body>
        </html>
        `;

        if (swapSuggestions.length > 0) {
            html += `
            <div class="container">
              <div class="card">
                <h3>Healthier Alternatives</h3>
                <ul>
                  ${swapSuggestions.map(item => `
                    <li>
                      <a href="/api/food/${item.fdcId}">
                        <strong>${item.fdcId}</strong>: ${item.description}
                      </a><br>
                      <small>Brand: ${item.brandOwner || "Unknown"}</small>
                    </li>
                  `).join("")}
                </ul>
              </div>
            </div>
          `;                  
          } else {
            html += `<p><em>No alternative suggestions found for this item.</em></p>`;
          }
          
        

        res.send(html);
    } catch (e) {
        res.status(500).send("Error fetching food item.");
    }
});

// Route to compare selected food items
router.get("/compare", async function(req, res) {
    try {
      const ids = req.query.ids;
  
      if (!ids) {
        return res.send("<h2>No items selected for comparison.</h2>");
      }
  
      // Ensure it's an array and convert to numbers
      const idArray = Array.isArray(ids) ? ids : [ids];
      const idNumbers = idArray.map(id => parseInt(id));
  
      const foods = await Food.find({ fdcId: { $in: idNumbers } });
  
      if (foods.length === 0) {
        return res.send("<h2>No matching items found for comparison.</h2>");
      }
  
      // Build the HTML page
      let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Food Comparison</title>
        <link rel="stylesheet" href="/css/style.css">
        <script src="/header.js" defer></script>
      </head>
      <body>
        <header-component></header-component>
        <div class="container">
          <h2>Food Comparison</h2>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                ${foods.map(f => `<th>${f.description}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              <tr><td>FDC ID</td>${foods.map(f => `<td>${f.fdcId}</td>`).join("")}</tr>
              <tr><td>Brand</td>${foods.map(f => `<td>${f.brandOwner || '-'}</td>`).join("")}</tr>
              <tr><td>Category</td>${foods.map(f => `<td>${f.brandedFoodCategory || '-'}</td>`).join("")}</tr>
              <tr><td>Serving Size</td>${foods.map(f => `<td>${f.servingSize || '-'} ${f.servingSizeUnit || ''}</td>`).join("")}</tr>
              <tr><td>Ingredients</td>${foods.map(f => `<td>${f.ingredients || '-'}</td>`).join("")}</tr>
              <tr><td>Market Country</td>${foods.map(f => `<td>${f.marketCountry || '-'}</td>`).join("")}</tr>
              <tr><td>Publication Date</td>${foods.map(f => `<td>${f.publicationDate || '-'}</td>`).join("")}</tr>
            </tbody>
          </table>
          <br><a href="/htmls/search.html">← Back to search</a>
        </div>
      </body>
      </html>
      `;
  
      res.send(html);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error generating comparison.");
    }
  });
  



 module.exports = router;