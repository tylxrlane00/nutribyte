# NutriByte

NutriByte is a full-stack web application that allows users to search, compare, and evaluate nutritional data for food items powered by USDA’s FoodData Central. Designed with accessibility and usability in mind, NutriByte helps users make more informed dietary choices with intuitive tools and clean presentation.

## Features

- Search Foods: Use keyword and custom filters (brand, category, ingredients) to find food items.
- Advanced Filtering: Include/exclude ingredients and clear filters with one click.
- Compare Items: Select multiple foods and view side-by-side nutritional comparisons.
- Food Details View: See comprehensive information for each food item.
- "Swap This Food" Suggestions: Get healthier alternative recommendations based on ingredient analysis.
- Clean, Responsive UI: Accessible design with modern styling across all views.
- Informational Pages: Clear guidance to help users navigate features like comparison and filters.

## Tech Stack

- Frontend: HTML, CSS, JavaScript (vanilla, with custom components)
- Backend: Node.js with Express.js
- Database: MongoDB (local development via Compass, cloud via Atlas)
- Deployment: Heroku (CI/CD integration)
- Tools: VSCode, Git, GitHub

## Project Structure

/public
  /css          → Style sheets
  /htmls        → Static pages (search, compare)
  /images       → Logo and visual assets
  header.js     → Custom header component

nutriserver.cjs → Express server setup
nutridb.cjs     → Routes for search & detail pages
nutridbconn.cjs → MongoDB connection
package.json    → Node.js dependencies

## Design Highlights

- Server-rendered app with clean routing and minimal dependencies
- Component-based layout using Shadow DOM (custom header)
- Search logic supports fuzzy matching, category filtering, and ingredient parsing
- Modular backend routes for maintainability
- UI improvements implemented with full CSS custom styling
- Designed for clarity and ease of use — especially for first-time visitors

## Attribution

Food data sourced from [USDA FoodData Central](https://fdc.nal.usda.gov/about-us.html)
