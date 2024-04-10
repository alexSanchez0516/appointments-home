import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { CalendarApp } from "./Calendar";
import { Login } from "./Login";

import { useEffect, useState } from "react";
import "./App.css";
import { Services } from "./Services";

function App() {
  const [loginSuccess, setLoginSuccess] = useState(false);
  useEffect(() => {
    const userFromLocalStorage = localStorage.getItem("user");
    setLoginSuccess(
      userFromLocalStorage !== null &&
        userFromLocalStorage !== undefined &&
        userFromLocalStorage !== ""
    );
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/notas"
          element={loginSuccess ? <Services /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={loginSuccess ? <Navigate to="/calendario" /> : <Login />}
        />

        <Route
          path="/calendario"
          element={loginSuccess ? <CalendarApp /> : <Navigate to="/login" />}
        />
      
        <Route
          path="/"
          element={
            loginSuccess ? <Navigate to="/calendario" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
