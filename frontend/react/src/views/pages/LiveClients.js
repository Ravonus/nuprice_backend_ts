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
import Clients from "./tables/Clients";

const $ = window;

class LiveClients extends React.Component {
  constructor(props) {
    super(props);
    this.notification = React.createRef(LiveClients);
  }
  state = {
    sidenavOpen: true,
    routes: [],
    clients: [],
    show: 10,
    page: 0,
  };

  async notificationPush(data) {
    const clients = this.state.clients;
    const show = this.state.show;

    if (data.notificationType === "add") {

      data.doc.map((client) => {
        client.fullName = `${client.user.fullName.first} ${
          client.user.fullName.last || ""
        }`;
        clients.push(client);
      });

      await this.setState({ clients });
      this.notification.current.setClients(clients);
    }

    if (data.notificationType === "remove") {
      let clients = this.state.clients;

      clients = clients.map((client, i) => {
        if (!client) return;
        if (client.socketId == !data.doc.socketId) return client;
      });

      await this.setState({ clients });
      this.notification.current.setClients();
    }
  }

  nuPriceClients = $.socket.on("nuPriceClients", (data) => {
    data.map((client) => {
      client.fullName = `${client.user.fullName.first} ${
        client.user.fullName.last || ""
      }`;
    });

    console.log("RANZO", data);

    // const clients = this.convertArrayToObject(data, "deviceSerial");
    this.setState({ clients: data });
    this.notification.current.setClients();
  });

  render() {
    return (
      <Clients
        {...this.props}
        ref={this.notification}
        clients={this.state.clients}
      ></Clients>
    );
  }
}

export default LiveClients;
