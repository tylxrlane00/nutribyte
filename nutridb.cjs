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
// (2.0) Sanitize input and escape RegExp special characters
function sanitizeInput(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").trim();
}

router.get("/food", async function (req, res) {
  try {
      // Sanitize all inputs
      const searchString = sanitizeInput(req.query.searchString);
      const brandOwner = sanitizeInput(req.query.brandOwner);
      const category = sanitizeInput(req.query.category);
      const includeIngredients = sanitizeInput(req.query.includeIngredients);
      const excludeIngredients = sanitizeInput(req.query.excludeIngredients);
      const page = parseInt(req.query.page) || 1;
      const limit = 25;
      const skip = (page - 1) * limit;

      // Build query dynamically
      let query = {};
      if (searchString) query.description = { "$regex": searchString, "$options": "i" };
      if (brandOwner) query.brandOwner = { "$regex": brandOwner, "$options": "i" };
      if (category) query.brandedFoodCategory = { "$regex": category, "$options": "i" };

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

      // Return message if query is empty
      if (Object.keys(query).length === 0) {
          return res.send("<h2>Please enter at least one search filter.</h2><br><a href='/htmls/search.html'>Back to search</a>");
      }

      // Query MongoDB with limit + skip
      const food = await Food.find(query).limit(limit).skip(skip);
      console.log(`Found ${food.length} matching food items.`);

      // Set cache-control headers to prevent stale page reload
      res.set({
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "Surrogate-Control": "no-store"
      });

      // No matches found
      if (!food || food.length === 0) {
          return res.send(`<h2>No results found for your search.</h2><br><a href='/htmls/search.html'>Try again</a>`);
      }

      // Build HTML
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
          <h2>Search Results</h2>
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
          <p><em>Showing ${food.length} result(s)</em></p>
        </div>
      </body>
      </html>
      `;

      res.send(html);
  } catch (e) {
      console.error(e);
      res.status(400).send("An error occurred during your search.");
  }
});



// Route to get details for a specific food item by fdcId
// (2.0) diet tracking button
router.get("/food/:fdcId", async function (req, res) {
  try {
    const fdcId = parseInt(req.params.fdcId);
    const food = await Food.findOne({ fdcId });

    if (!food) {
      return res.status(404).send(`<h2>Food item with FDC ID ${fdcId} not found.</h2>`);
    }

    const swapSuggestions = await Food.find({
      brandedFoodCategory: food.brandedFoodCategory,
      fdcId: { $ne: food.fdcId },
      ingredients: { $not: /sugar|corn syrup|high fructose/i }
    }).limit(3);

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

          <div class="card-actions">
            <button id="trackBtn">Track This Food</button>
            <a href="/htmls/search.html"><button type="button">← Back to Search</button></a>
          </div>
        </div>
    `;

    if (swapSuggestions.length > 0) {
      html += `
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
      `;
    } else {
      html += `<p><em>No alternative suggestions found for this item.</em></p>`;
    }

    html += `
      </div>
      <script>
        document.getElementById("trackBtn").addEventListener("click", () => {
          const tracked = JSON.parse(localStorage.getItem("dietLog") || "[]");
          const newItem = {
            fdcId: ${food.fdcId},
            description: "${food.description.replace(/"/g, '\\"')}",
            brand: "${(food.brandOwner || "Unknown").replace(/"/g, '\\"')}",
            serving: "${food.servingSize || "-"} ${food.servingSizeUnit || ""}"
          };
          const alreadyAdded = tracked.some(item => item.fdcId === newItem.fdcId);
          if (!alreadyAdded) {
            tracked.push(newItem);
            localStorage.setItem("dietLog", JSON.stringify(tracked));
            alert("Food tracked successfully!");
          } else {
            alert("You already tracked this food.");
          }
        });
      </script>
    </body>
    </html>
    `;

    res.send(html);
  } catch (e) {
    console.error(e);
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