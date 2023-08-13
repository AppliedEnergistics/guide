import { useLocation } from "react-router-dom";

function GuidebookPageNotFound() {
  const location = useLocation();

  return (
    <>
      <h2>Page not found</h2>
      <p>The page {location.pathname} was not found.</p>
    </>
  );
}

export default GuidebookPageNotFound;
