module.exports = {
  siteUrl: "https://guide.appliedenergistics.org",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    // Do not list the in-dev content
    "/development/*",
  ],
  outDir: "out",
};
