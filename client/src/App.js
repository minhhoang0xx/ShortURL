import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { routes } from './routes';
import { Fragment } from 'react';
import 'antd/dist/reset.css';
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import PrivateRoute from "./routes/PrivateRoute";
function TokenHandler() {
  const location = useLocation();
  const navigate = useNavigate(); 
  useEffect(() => {
    // let token = location.search.substring(1);
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/ShortUrl", { replace: true });
    }
  }, [location, navigate]);

  return null; 
}

function App() {  
 
  return (
    <Router>
       <TokenHandler />
      <Routes>
        {routes.map((route) => {
          const Page = route.page
          const Layout = route.isShowHeader ? DefaultComponent : Fragment
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requireAuth ? (
                  <PrivateRoute>
                    <Layout>
                      <Page />
                    </Layout>
                  </PrivateRoute>
                ) : (
                  <Layout>
                    <Page />
                  </Layout>
                )
              } />
          )
        })}
      </Routes>
    </Router>
  );
}

export default App;