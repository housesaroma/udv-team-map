import React from "react";
import ReactDOM from "react-dom/client";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import App from "./App";
import "./index.css";
import "virtual:uno.css";
import { AppProviders } from "./providers/AppProviders";
import { USE_MOCK_DATA } from "./constants/apiConstants";

const enableMocking = async () => {
  if (!USE_MOCK_DATA) {
    return;
  }

  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
  });
};

const renderApp = () => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </React.StrictMode>
  );
};

enableMocking()
  .catch(error => {
    console.error("Не удалось запустить MSW", error);
  })
  .finally(renderApp);
