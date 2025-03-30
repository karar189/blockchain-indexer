import React from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/index";


function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
