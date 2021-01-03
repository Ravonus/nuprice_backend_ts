/*!

=========================================================
* Argon Dashboard PRO React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
// react library for routing
import { Route, Switch, Redirect } from "react-router-dom";

// core components
import AuthNavbar from "components/Navbars/AuthNavbar.js";
import AuthFooter from "components/Footers/AuthFooter.js";

import routesImport from "routes.js";

class Auth extends React.Component {
  state = {
    sidenavOpen: true,
    routes: [],
  };

  async componentDidMount() {
    const routes = await routesImport();

    this.setState({ routes });
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (!this.refs.mainContent) this.refs.mainContent.scrollTop = 0;
    document.body.classList.add("bg-default");
  }
  componentWillUnmount() {
    document.body.classList.remove("bg-default");
  }
  componentDidUpdate(e) {
    if (e.history.pathname !== e.location.pathname) {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainContent.scrollTop = 0;
    }
  }
  getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return this.getRoutes(prop.views);
      }
      if (prop.layout === "/auth") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  render() {
    if (this.state.routes.length === 0) return null;

    return (
      <>
        <div className="main-content" ref="mainContent">
          <AuthNavbar />
          <Switch>
            {this.getRoutes(this.state.routes)}
            <Redirect from="*" to="/auth/login" />
          </Switch>
        </div>
        <AuthFooter />
      </>
    );
  }
}

export default Auth;
