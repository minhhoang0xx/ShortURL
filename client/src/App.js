import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { routes } from './routes';
import { Fragment } from 'react';
import 'antd/dist/reset.css';
import DefaultComponent from "./components/DefaultComponent/DefaultComponent";
import PrivateRoute from "./routes/PrivateRoute";
import * as SSOService from './services/SSOService'
import { message, Spin } from "antd";
function TokenHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        if (token === "") {
          const response = await SSOService.checkLogin(token);
          message.error(response.error);
          window.location.href = response.redirectUrl;
        }
        if (token) {
          setLoading(true);
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
        const redirectUrl = error.response?.data?.redirectUrl;
        window.location.href = redirectUrl;
      } finally {
        setLoading(false);
      }
    };
    handleToken();
  }, [location, navigate]);
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" tip="Đang xác thực token..." />
      </div>
    );
  }
  return null;
}

function App() {

  return (
    <Router>
      <TokenHandler />
      <Routes>
        {routes.map((route) => {
          const Page = route.page
          const hasLayout = route.isShowHeader || route.isShowFooter;
          const WrappedLayout = ({ children }) =>
            hasLayout ? (
              <DefaultComponent
                isShowHeader={route.isShowHeader}
                isShowFooter={route.isShowFooter}
              >
                {children}
              </DefaultComponent>
            ) : (
              <>{children}</>
            );
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.requireAuth ? (
                  <PrivateRoute>
                    <WrappedLayout>
                      <Page />
                    </WrappedLayout>
                  </PrivateRoute>
                ) : (
                  <WrappedLayout>
                    <Page />
                  </WrappedLayout>
                )
              } />
          )
        })}
      </Routes>
    </Router>
  );
}

export default App;