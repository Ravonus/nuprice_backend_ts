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
// react plugin that prints a given react component
import ReactToPrint from "react-to-print";
// react component for creating dynamic tables
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import InitialsAvatar from "react-initials-avatar";
import "react-initials-avatar/lib/ReactInitialsAvatar.css";
import Select from "react-select";

// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
// reactstrap components
import {
  Button,
  Input,
  ButtonGroup,
  Card,
  CardHeader,
  Container,
  Row,
  Col,
  UncontrolledTooltip,
} from "reactstrap";
// core components
import SimpleHeader from "components/Headers/SimpleHeader.js";
import Label from "reactstrap/lib/Label";
import { number } from "prop-types";

const $ = window;
const pagination = paginationFactory({
  page: 1,
  alwaysShowAllBtns: true,
  showTotal: true,
  withFirstAndLast: false,
  sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
    <div className="dataTables_length" id="datatable-basic_length">
      <label>
        Show{" "}
        {
          <select
            name="datatable-basic_length"
            aria-controls="datatable-basic"
            className="form-control form-control-sm"
            onChange={(e) => onSizePerPageChange(e.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        }{" "}
        entries.
      </label>
    </div>
  ),
});
const { SearchBar } = Search;

let socketLoaded = false;
class ReactBSTables extends React.Component {
  constructor(props) {
    super(props);
  }
  _isMounted = false;

  state = {
    isPaneOpen: false,
    top: true,
    view: "main",
    paneObj: {},
    alert: null,
    logNames: [],
    selectedValues: [],
    clientConfig: [],
    categories: [
      { value: 1, label: "Multi-Device" },
      { value: 2, label: "Turbo Price Pull" },
      { value: 3, label: "Extreme Price Pull" },
      { value: 4, label: "Ludicrous Price Pull" },
      { value: 5, label: "Api" },
    ],
    clients: [],
    messages: { direct: [] },
  };

  convertArrayToObject = (array, key) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: item,
      };
    }, initialValue);
  };

  setClients(clients) {
    this.setState({ clients: [] });
    this.setState({ clients: clients ? clients : this.props.clients });
  }

  componentWillMount() {
    this._isMounted = true;
  }

  logPush = $.socket.on("logPush", (info) => {
    console.log(info);
    if (info.type === "logs") this.setState({ logNames: info.data });
  });

  addons = $.socket.on("addons", (info) => {
    console.log(info);
    this.setState({ selectedValues: info.value });
  });

  configGrab = $.socket.on("configGrab", (configDoc) => {
    const clientConfig = [];

    this.configArrayCreation(configDoc, clientConfig);
    this.setState({ clientConfig });
  });

  configArrayCreation(configDoc, configArr, parent) {
    const cKeys = Object.keys(configDoc);
    cKeys.map((key) => {
      const value = configDoc[key];

      if (typeof value === "object" && Array.isArray(value)) {
      } else if (typeof value === "object") {
        if (key === "config") key = undefined;
        if (key === "info" || key === "extras") return;
        this.configArrayCreation(value, configArr, key);
        console.log("HUH?", key);
      } else {
        if (key === "version" || key === "name" || key === "sid") return;
        configArr.push({
          label: key,
          value: configDoc[key],
          parent,
          oldValue: configDoc[key],
        });
      }

      return configArr;
    });
  }

  async pushMessage(info) {
    if (!info.room) info.room = "direct";
    const messages = this.state.messages;

    if (
      messages[info.room].length === 0 ||
      messages[info.room][messages[info.room].length - 1].username !== info.user
    ) {
      messages[info.room].push(info);
    } else {
      if (!messages[info.room][messages[info.room].length - 1].extras)
        messages[info.room][messages[info.room].length - 1].extras = [];
      messages[info.room][messages[info.room].length - 1].extras.push(info.msg);
      messages[info.room][messages[info.room].length - 1].updatedAt =
        info.updatedAt;
      messages[info.room][messages[info.room].length - 1].createdAt =
        info.createdAt;
      messages[info.room][messages[info.room].length - 1].username = info.msg;

      const clonedMessages = JSON.parse(JSON.stringify(messages));

      clonedMessages[info.room] = [];
      await this.setState({ messages: clonedMessages });
    }

    this.setState({ messages });
  }

  configGrab = $.socket.on("chat", async (info) => {
    console.log(info);

    this.pushMessage(info);
  });

  componentDidMount() {
    $.socket.emit("nuPriceClients");

    this.setState({ clients: this.props.clients });
    // if (!socketLoaded)

    socketLoaded = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    $.socket.off("nuPriceClients");
    $.socket.off("logPush");
    $.socket.off("configGrab");
    $.socket.off("addons");
  }

  copyToClipboardAsTable = (el) => {
    var body = document.body,
      range,
      sel;
    if (document.createRange && window.getSelection) {
      range = document.createRange();
      sel = window.getSelection();
      sel.removeAllRanges();
      try {
        range.selectNodeContents(el);
        sel.addRange(range);
      } catch (e) {
        range.selectNode(el);
        sel.addRange(range);
      }
      document.execCommand("copy");
    } else if (body.createTextRange) {
      range = body.createTextRange();
      range.moveToElementText(el);
      range.select();
      range.execCommand("Copy");
    }
    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title="Good job!"
          onConfirm={() => this.setState({ alert: null })}
          onCancel={() => this.setState({ alert: null })}
          confirmBtnBsStyle="info"
          btnSize=""
        >
          Copied to clipboard!
        </ReactBSAlert>
      ),
    });
  };
  render() {
    const { messages, step3Select, categories } = this.state;

    return (
      <>
        {this.state.paneObj.user ? (
          <SlidingPane
            overlayClassName="z3"
            width={`${
              document.body.scrollWidth > 1920
                ? "50%"
                : document.body.scrollWidth <= 1920 &&
                  document.body.scrollWidth >= 1280
                ? "70%"
                : document.body.scrollWidth <= 1280 &&
                  document.body.scrollWidth >= 720
                ? "85%"
                : "100%"
            }`}
            isOpen={this.state.isPaneOpen}
            onConfirm={() => {}}
            style={{
              top: `${this.state.top ? "82px !important" : "0px !important"}`,
            }}
            onAfterOpen={() => {}}
            title={this.state.paneObj.user.username}
            subtitle={this.state.paneObj.socketId}
            onRequestClose={() => {
              // triggered on "<" on left top click or on outside click
              this.setState({ isPaneOpen: false });
            }}
          >
            <Row className="row flex-column-reverse flex-lg-row">
              {this.state.view === "chat" ? (
                <Col className="ml-auto mr-auto col-md-9"></Col>
              ) : (
                <Col className="ml-auto mr-auto col-md-9">
                  <Row>
                    {this.state.clientConfig.map((config, i) => (
                      <Col className="col-3">
                        <Label>{config.label}</Label>
                        {typeof config.value === "boolean" ? (
                          <Label className="custom-toggle mr-1">
                            <Input
                              onChange={(el) => {
                                console.log(config, el.target.checked);
                                config.value = el.target.checked;

                                $.socket.emit("config", {
                                  sid: this.state.paneObj.socketId,
                                  config,
                                });
                                config.oldValue = el.target.checked;
                                this.setState({ config });
                              }}
                              defaultChecked={config.value}
                              type="checkbox"
                            />
                            <span
                              data-label-off="False"
                              data-label-on="True"
                              className="custom-toggle-slider rounded-circle"
                            />
                          </Label>
                        ) : (
                          <Input
                            type={
                              Number(config.value) &&
                              typeof config.value !== "boolean"
                                ? "number"
                                : "text"
                            }
                            className="mx-1 my-1"
                            label={config.label}
                            value={config.value}
                            onBlur={() => {
                              if (config.value !== config.oldValue) {
                                $.socket.emit("config", {
                                  sid: this.state.paneObj.socketId,
                                  config,
                                });
                                config.oldValue = config.value;
                                this.setState({ config });
                              }
                            }}
                            onKeyUp={(event) => {
                              if (event.key === "Enter") {
                                console.log(config.value, config.oldValue);
                                if (config.value !== config.oldValue) {
                                  $.socket.emit("config", {
                                    sid: this.state.paneObj.socketId,
                                    config,
                                  });
                                  config.oldValue = config.value;
                                  this.setState({ config });
                                }
                              }
                            }}
                            onChange={(el) => {
                              const config = this.state.clientConfig;

                              config[i].value =
                                el.target.type === "text"
                                  ? el.target.value
                                  : Number(el.target.value);
                              this.setState({ config });
                            }}
                          ></Input>
                        )}
                      </Col>
                    ))}
                  </Row>
                </Col>
              )}

              <Col className="ml-auto mr-auto col-md-3">
                <Button
                  onClick={() => this.setState({ view: "chat" })}
                  className="btn btn-success btn-block my-3 px-4"
                >
                  Message
                </Button>
                <Row className="d-flex justify-content-between mx-1">
                  <Button
                    onClick={() => {
                      $.socket.emit("npCommand", {
                        type: "kick",
                        sid: this.state.paneObj.socketId,
                      });
                    }}
                    className="btn btn-warning"
                  >
                    Kick
                  </Button>
                  <Button
                    onClick={() => {
                      $.socket.emit("npCommand", {
                        type: "ban",
                        sid: this.state.paneObj.socketId,
                      });
                    }}
                    className="btn btn-danger"
                  >
                    Ban
                  </Button>
                </Row>
              </Col>
            </Row>

            <Row className="mt-2">
              {this.state.view === "chat" ? (
                <Col
                  style={{ height: "750px" }}
                  className="ml-auto mr-auto col-md-9"
                >
                  {" "}
                  <div
                    style={{
                      overflow: "auto",
                      height: "40%",
                      maxHeight: "40%",
                    }}
                    className="card card-bordered"
                  >
                    <div className="card-header">
                      <h4 className="card-title">
                        <strong>Chat</strong>
                      </h4>{" "}
                      <a
                        className="btn btn-xs btn-secondary"
                        href="#"
                        data-abc="true"
                      >
                        Let's Chat App
                      </a>
                    </div>
                    <div
                      className="ps-theme-default ps-active-y"
                      id="chat-content"
                      style={{
                        overflowY: "scroll !important",
                        height: "400px !important",
                      }}
                    >
                      {/* <div className="media media-chat">
                        {" "}
                        <InitialsAvatar name="Sherlock Holmes" />
                        <div className="media-body">
                          <p>Hi</p>
                          <p>How are you ...???</p>
                          <p>
                            What are you doing tomorrow?
                            <br /> Can we come up a bar?
                          </p>
                          <p className="meta">
                            <time datetime="2018">23:58</time>
                          </p>
                        </div>
                      </div> */}

                      {!this.state.messages[this.state.paneObj.user.username]
                        .action
                        ? this.state.messages[
                            this.state.paneObj.user.username
                          ].map((message) => (
                            <div
                              className={
                                message.userId === this.props.me.id
                                  ? "media media-chat"
                                  : "media media-chat media-chat-reverse"
                              }
                            >
                              {" "}
                              <InitialsAvatar
                                name={`${message.fullName.first} ${message.fullName.last}`}
                              />
                              <div className="media-body">
                                <p>{message.msg}</p>
                                {message.extras
                                  ? message.extras.map((msg) => <p>{msg}</p>)
                                  : null}
                                <p className="meta">
                                  <a className="dateTxt">
                                    {$.dayjs(message.createdAt).fromNow()}
                                  </a>
                                </p>
                              </div>
                            </div>
                          ))
                        : null}

                      <div className="media media-meta-day">Today</div>
                      {/* <div className="media media-chat media-chat-reverse">
                        <div className="media-body">
                          <p>Hiii, I'm good.</p>
                          <p>How are you doing?</p>
                          <p>
                            Long time no see! Tomorrow office. will be free on
                            sunday.
                          </p>
                          <p className="meta">
                            <time datetime="2018">00:06</time>
                          </p>
                        </div>
                      </div>
                      <div className="media media-chat">
                        {" "}
                        <img
                          className="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt="..."
                        />
                        <div className="media-body">
                          <p>Okay</p>
                          <p>We will go on sunday? </p>
                          <p className="meta">
                            <time datetime="2018">00:07</time>
                          </p>
                        </div>
                      </div>
                      <div className="media media-chat media-chat-reverse">
                        <div className="media-body">
                          <p>That's awesome!</p>
                          <p>I will meet you Sandon Square sharp at 10 AM</p>
                          <p>Is that okay?</p>
                          <p className="meta">
                            <time datetime="2018">00:09</time>
                          </p>
                        </div>
                      </div>
                      <div className="media media-chat">
                        {" "}
                        <img
                          className="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt="..."
                        />
                        <div className="media-body">
                          <p>Okay i will meet you on Sandon Square </p>
                          <p className="meta">
                            <time datetime="2018">00:10</time>
                          </p>
                        </div>
                      </div>
                      <div className="media media-chat media-chat-reverse">
                        <div className="media-body">
                          <p>Do you have pictures of Matley Marriage?</p>
                          <p className="meta">
                            <time datetime="2018">00:10</time>
                          </p>
                        </div>
                      </div>
                      <div className="media media-chat">
                        {" "}
                        <img
                          className="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt="..."
                        />
                        <div className="media-body">
                          <p>Sorry I don't have. i changed my phone.</p>
                          <p className="meta">
                            <time datetime="2018">00:12</time>
                          </p>
                        </div>
                      </div>
                      <div className="media media-chat media-chat-reverse">
                        <div className="media-body">
                          <p>Okay then see you on sunday!!</p>
                          <p className="meta">
                            <time datetime="2018">00:12</time>
                          </p>
                        </div>
                      </div> */}
                      <div
                        className="ps-scrollbar-x-rail"
                        style={{ left: "0px", bottom: "0px" }}
                      >
                        <div
                          className="ps-scrollbar-x"
                          tabindex="0"
                          style={{ left: "0px", bottom: "0px" }}
                        ></div>
                      </div>
                      <div
                        className="ps-scrollbar-y-rail"
                        style={{ top: "0px", height: "0px", right: "2px" }}
                      >
                        <div
                          className="ps-scrollbar-y"
                          tabindex="0"
                          style={{ top: "0px", height: "2px" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="publisher bt-1 border-light">
                    {" "}
                    <img
                      className="avatar avatar-xs"
                      src="https://img.icons8.com/color/36/000000/administrator-male.png"
                      alt="..."
                    />{" "}
                    <input
                      className="publisher-input"
                      type="text"
                      id="chatInput"
                      placeholder="Write something"
                    />{" "}
                    <span className="publisher-btn file-group">
                      {" "}
                      <i className="fa fa-paperclip file-browser"></i>{" "}
                      <input type="file" />{" "}
                    </span>{" "}
                    <a className="publisher-btn" href="#" data-abc="true">
                      <i className="fa fa-smile"></i>
                    </a>{" "}
                    <a
                      onClick={() => {
                        const msg = document.querySelector("#chatInput").value;

                        const message = {
                          user: this.props.me.username,
                          msg,
                          room: this.state.paneObj.user.username,
                          fullName: this.props.me.fullName,
                        };

                        console.log(this.props.me);

                        this.pushMessage(message);

                        $.socket.emit("chat", {
                          id: this.state.paneObj.socketId,
                          msg,
                        });

                        document.querySelector("#chatInput").value = "";
                      }}
                      className="publisher-btn text-info"
                      href="#"
                      data-abc="true"
                    >
                      <i className="fa fa-paper-plane"></i>
                    </a>{" "}
                  </div>
                </Col>
              ) : (
                <Col className="ml-auto mr-auto col-md-9"></Col>
              )}
              <Col className="ml-auto mr-auto col-md-3">
                <Row className="d-flex justify-content-between">
                  <h5 className="mr-1">Full Name:</h5>
                  <h5>{this.state.paneObj.fullName}</h5>
                  <h5 className="mr-1">Ip:</h5>
                  <h5>{this.state.paneObj.ip}</h5>
                </Row>
                <Row className="d-flex justify-content-between">
                  <h5 className="mr-1">Id:</h5>
                  <h5>{this.state.paneObj.user.id}</h5>
                  <h5 className="mr-1">City:</h5>
                  <h5>{this.state.paneObj.city}</h5>
                </Row>
                <Row className="d-flex justify-content-between">
                  <h5 className="mr-1">Member Since:</h5>
                  <h5>
                    {$.dayjs(this.state.paneObj.user.createdAt).fromNow(true)}
                  </h5>
                  <h5 className="mr-1">State:</h5>
                  <h5>{this.state.paneObj.region}</h5>
                </Row>
                <Row className="d-flex justify-content-between">
                  <h5 className="mr-1">Expires:</h5>
                  <h5>
                    In{" "}
                    {$.dayjs(this.state.paneObj.user.expirationDate)
                      .diff($.dayjs(), "day", true)
                      .toFixed()}{" "}
                    days
                  </h5>
                  <h5 className="mr-1">Country:</h5>
                  <h5>{this.state.paneObj.country}</h5>
                </Row>
              </Col>
            </Row>

            <Row>
              <Col className="col-6">
                <Select
                  multiple={true}
                  isMulti={true}
                  className={`react-selec`}
                  classNamePrefix="react-select"
                  name=""
                  onChange={(value, options) => {
                    $.socket.emit("addons", {
                      ...options,
                      id: this.state.paneObj.user.id,
                      sid: this.state.paneObj.socketId,
                      value: value,
                    });
                  }}
                  value={this.state.selectedValues}
                  options={categories}
                  placeholder="Select Category"
                />
              </Col>
            </Row>

            <Col className="col-12">
              <footer style={{}}>
                {this.state.logNames.map((name) => (
                  <Button
                    onClick={() => {
                      $.socket.emit("logGrab", {
                        sid: this.state.paneObj.socketId,
                        type: name,
                      });
                    }}
                    className="btn btn-info mx-2 my-2"
                  >
                    {name}
                  </Button>
                ))}
              </footer>
            </Col>
          </SlidingPane>
        ) : null}

        {this.state.alert}
        <SimpleHeader
          dataField={true}
          name="NuPrice Clients"
          parentName="Tables"
        />
        <Container className="mt--6" fluid>
          <Row>
            <div className="col">
              <Card>
                <CardHeader>
                  <h3 className="mb-0">React Bootstrap Table 2</h3>
                  <p className="text-sm mb-0">
                    This is an exmaple of data table using the well known
                    react-bootstrap-table2 plugin. This is a minimal setup in
                    order to get started fast.
                  </p>
                </CardHeader>
                <ToolkitProvider
                  data={this.state.clients}
                  keyField="user.username"
                  columns={[
                    {
                      onClick: () => {
                        console.log("RAN");
                      },
                      dataField: "ip",
                      text: "ip",
                      sort: true,
                    },
                    {
                      id: "username",
                      dataField: "user.username",
                      text: "Username",
                      sort: true,
                    },
                    {
                      id: "name",
                      dataField: "fullName",
                      text: "Name",
                    },
                  ]}
                  search
                >
                  {(props) => (
                    <div className="py-4 table-responsive">
                      <div
                        id="datatable-basic_filter"
                        className="dataTables_filter px-4 pb-1"
                      >
                        <label>
                          Search:
                          <SearchBar
                            className="form-control-sm"
                            placeholder=""
                            {...props.searchProps}
                          />
                        </label>
                      </div>
                      <BootstrapTable
                        rowEvents={{
                          onClick: async (
                            e,
                            column,
                            columnIndex,
                            row,
                            rowIndex
                          ) => {
                            const messages = this.state.messages;
                            if (!messages[column.user.username])
                              messages[column.user.username] = [];

                            this.setState(messages);
                            await this.setState({ paneObj: column });

                            const selectedValues = [];
                            const { addons } = column;

                            this.state.categories.map((addon) => {
                              if (addons[addon.label])
                                selectedValues.push({
                                  value: addons[addon.label].id,
                                  label: addon.label,
                                });
                            });

                            console.log(selectedValues);

                            this.setState({ selectedValues });

                            $.socket.emit("configGrab", {
                              sid: this.state.paneObj.socketId,
                            });
                            await this.setState({ isPaneOpen: true });
                            $.socket.emit("logGrab", { sid: column.socketId });
                          },
                        }}
                        {...props.baseProps}
                        bootstrap4={true}
                        pagination={pagination}
                        bordered={false}
                      />
                    </div>
                  )}
                </ToolkitProvider>
              </Card>
            </div>
          </Row>
        </Container>
      </>
    );
  }
}

export default ReactBSTables;
