/*!

=========================================================
* Black Dashboard PRO React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-pro-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Dashboard from "views/Index";
import Login from "views/pages/examples/Login";
import Register from "views/pages/examples/Register";
import LiveClients from "views/pages/LiveClients";

const components = {
  LiveClients,
  Register,
  Login,
  Dashboard,
};

export default (user) => {
  return new Promise(async (resolve) => {
    if (!user) user = {};

    let routes = await fetch("/grabRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((e) => {
      console.log(e);
    });

    try {
      routes = await routes.json();
    } catch (e) {}
    if (!routes) routes = [];

    routes.map((route) => {
      if (route.component) route.component = components[route.component];
      if (route.views)
        route.views.map((view) => {
          if (view.component)
            view.component =
              components[view.component ? view.component : route.component];
        });
    });
    let newRoutes = [];
    routes.map((route, i) => {
      if (route.groups && user && user.groups) {
        let found = false;
        let groupNames = user.groups.map((group) => group.name);
        console.log(groupNames, "as");
        route.groups.map((group) => {
          if (found) return;
          if (groupNames.includes(group)) {
            found = true;
            newRoutes.push(route);
          }
        });
      }

      if (route.permissions && user.permObject) {
        let routeArray = user.permObject(route.permissions);
        let userArray =
          typeof user.permissions === "number"
            ? user.permObject(user.permissions)
            : user.permissions;
        let keys = Object.keys(routeArray);
        for (let index = 0; index < keys.length; index++) {
          let key = keys[index];
          if (userArray[key]) {
            let views = [];
            if (routes[i].views)
              routes[i].views.map((route) => {
                if (!route.permissions) return views.push(route);
                let groupNames = user.groups.map((group) => group.name);
                route.groups.map((group) => {
                  if (groupNames.include(group)) {
                    views.push(route);
                    index = keys.length;
                  }
                });
                let routeArray = user.permObject(route.permissions);
                let keys = Object.keys(routeArray);
                for (let index = 0; index < keys.length; index++) {
                  const permission = keys[index];
                  if (userArray[permission]) {
                    views.push(route);
                    index = keys.length;
                  }
                }
              });
            routes[i].views = views;
            newRoutes.push(route);
            index = keys.length;
          }
        }
      } else if (!route.permissions) newRoutes.push(route);
    });

    resolve(newRoutes);
  });
};
