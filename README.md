# NutriByte

NutriByte is a full-stack web application that allows users to search, compare, and evaluate nutritional data for food items powered by USDA’s FoodData Central. Designed with accessibility and usability in mind, NutriByte helps users make more informed dietary choices with intuitive tools and clean presentation.

---

## Features

- **Search Foods**: Use keyword and custom filters (brand, category, ingredients) to find food items.
- **Advanced Filtering**: Include/exclude ingredients and clear filters with one click. Input is sanitized to prevent malformed queries.
- **Compare Items**: Select multiple foods and view side-by-side nutritional comparisons.
- **Food Details View**: See comprehensive information for each food item.
- **"Swap This Food" Suggestions**: Get healthier alternative recommendations based on ingredient analysis.
- **Diet Tracking**: Track foods to a personal list stored in the browser using localStorage. Viewable in the "My Diet" page.
- **Clean, Responsive UI**: Card-based design, styled buttons, and fixed action bars ensure easy navigation.
- **Informational Pages**: Clear guidance to help users navigate features like comparison and filtering.

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (vanilla, with custom web components)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (local development via Compass, cloud via Atlas)
- **Deployment**: Heroku (with GitHub CI/CD integration)
- **Development Tools**: VSCode, Git, GitHub

---

## Project Structure

```
/public
  /css          → Style sheets
  /htmls        → Static pages (search, compare, diet)
  /images       → Logo and visual assets
  header.js     → Custom header component

nutriserver.cjs → Express server setup
nutridb.cjs     → Routes for search, compare, detail, and diet features
nutridbconn.cjs → MongoDB connection logic
package.json    → Node.js dependencies and scripts
```

---

## Design Highlights

- Server-rendered architecture with minimal dependencies
- Search logic supports fuzzy matching, field-specific filtering, and ingredient parsing
- Modular backend routes designed for clarity and maintainability
- UI redesigned for v2.0 to use flexible layout, buttons instead of links, and modern responsive styles
- Diet tracking feature added using localStorage for simplicity (no user login required)
- Sanitization and validation strategies in place to prevent malformed input or overly broad queries
- Headers added to prevent caching and stale data display

---

## Version 2.0 Highlights

- Added "Track This Food" feature with diet log page
- Improved input sanitization and validation for safer searches
- Added cache-control headers to reduce stale page behavior
- Refined UI styling across all pages
- Implemented search result limiting and backend safeguards against RegExp overload

---

## Deployment

NutriByte is deployed on Heroku:
**https://nutribyte-ou-9f0b6b531be9.herokuapp.com/**

---

## Attribution

Food data sourced from [USDA FoodData Central](https://fdc.nal.usda.gov/about-us.html)


