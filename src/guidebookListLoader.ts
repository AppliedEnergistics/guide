export default async function guidebookListLoader() {
  return fetch("guide-assets/index.json");
}
