import "./App.css";
import { createHashRouter, RouterProvider } from "react-router-dom";
import GuidebookList from "./GuidebookList.tsx";
import GuidebookRoot from "./GuidebookRoot.tsx";
import guidebookListLoader from "./guidebookListLoader.ts";
import guidebookRootLoader from "./guidebookRootLoader.ts";

const router = createHashRouter(
  [
    {
      path: "/",
      element: <GuidebookList />,
      loader: guidebookListLoader,
    },
    {
      id: "guideRoot",
      path: "/:version/*",
      element: <GuidebookRoot />,
      loader: guidebookRootLoader,
    },
  ],
  {}
);

function App() {
  return (
    <RouterProvider router={router} fallbackElement={<div>Loading</div>} />
  );
}

export default App;
