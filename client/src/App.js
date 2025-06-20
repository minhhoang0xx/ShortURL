import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { routes } from './routes';
import { Fragment } from 'react';
import 'antd/dist/reset.css';
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import PrivateRoute from "./routes/PrivateRoute";
import * as SSOService from './services/SSOService'
import { message } from "antd";
function TokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if(token){
          const response = await SSOService.checkLogin(token);
          if (response && response.tokenVerify) {
            localStorage.setItem("token", response.tokenVerify);
            const cleanUrl = window.location.origin + location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            navigate("/shortUrl", { replace: true });
          } else if (response && response.redirectUrl) {
            message.error(response.error);
            window.location.href = response.redirectUrl;
          }
        }
      } catch (error) {
        message.error(error.response?.data?.error);
        const redirectUrl = error.response?.data?.redirectUrl ;
        window.location.href = redirectUrl;
      }
    };
    handleToken();
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