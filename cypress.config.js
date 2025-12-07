const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "smvz27",

  e2e: {
    setupNodeEvents(on, config) {
      // Tu peux ici ajouter d'autres hooks si besoin
      return config;
    },
    baseUrl: "http://localhost:3000", // Ton serveur local pendant les tests
    specPattern: "cypress/e2e/**/*.cy.js",
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig: require("./webpack.config.js"), // fichier webpack compatible

    },
  },
});
