import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

import { AuthProviderFunc, AuthContext, useAuth } from "./methods/auth";

import Navbar from './components/partials/navbar/navbar.view';
import Breadcrumbs from './components/partials/breadcrumb/breadcrumb.view';

import Index from './components/index/index.view';
import SignIn from './components/signin/signin.view';

import SearchTypes from './components/search/types.view';
import Search from './components/search/search.view';

import Members from './components/members/members.view';

import Profile from './components/profile/profile.view';

function AuthProvider({ children }: { children: React.ReactNode }) {
  let [token, setToken] = React.useState<any>(localStorage.getItem('token') || "{}");
  let [user, setUser] = React.useState<any>(localStorage.getItem('user') || "{}");

  let signin = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      AuthProviderFunc.signin(email, password).then(tokenRes => {
        axios.get('http://localhost/user/@me', {
          headers: {
            Authorization: `Bearer ${tokenRes.data.Token}` 
          }
        }).then(userRes => {
          setToken(JSON.stringify(tokenRes.data));
          localStorage.setItem('token', JSON.stringify(tokenRes.data));

          setUser(JSON.stringify(userRes.data));
          localStorage.setItem('user', JSON.stringify(userRes.data));

          resolve();
        })
        .catch(err => reject(err.response.data))
      }).catch(err => reject(err.response.data));
    });
  };

  let signout = (callback: VoidFunction) => {
    return AuthProviderFunc.signout(() => {
      setToken('{}');
      setUser('{}');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      callback();
    });
  };

  let value = { token, user, signin, signout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  let tokenObj = JSON.parse(auth.token);

  if (!tokenObj.Token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar/>
        <Breadcrumbs/>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<div>Page</div>} />
          
          <Route path="/search" element={<SearchTypes />} />
          <Route path="/search/:type" element={<Search />} />
          <Route path="/search/:type/:page" element={<Search />} />
          <Route path="/search/:type/:query/:page" element={<Search />} />
          {/*<Route path="/search/:type/:page(\d+)" element={<div>TYPE/PAGE</div>} />
          <Route path="/search/:type/:query(/[a-zA-Z0-9-_]+/g)?" element={<div>TYPE/QUERY/PAGE</div>} />
          <Route path="/search/:type/:query/:page" element={<div>TYPE/QUERY/PAGE</div>} />*/}

          <Route path="/members" element={<Members />} />
          <Route path="/members/:page" element={<Members />} />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

reportWebVitals();