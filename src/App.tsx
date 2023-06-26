import "./App.css";
import GuideVersionIndexLoader from "./GuideVersionIndexLoader.tsx";
import InitialGuideSelection from "./InitialGuideSelection.tsx";

function App() {
  return (
    <GuideVersionIndexLoader>
      <InitialGuideSelection />
    </GuideVersionIndexLoader>
  );
}

export default App;
