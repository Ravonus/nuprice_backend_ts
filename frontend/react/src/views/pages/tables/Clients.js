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
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
// reactstrap components
import {
  Button,
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
    clients: [],
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
    console.log("WTF", this.props.clients);
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

  configGrab = $.socket.on("configGrab", (info) => {
    console.log(info);
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
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
                  <input className="mx-4 my-2"></input>
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
                <Col className="ml-auto mr-auto col-md-9">
                  {" "}
                  <div
                    style={{ overflow: "auto", height: "25%" }}
                    class="card card-bordered"
                  >
                    <div class="card-header">
                      <h4 class="card-title">
                        <strong>Chat</strong>
                      </h4>{" "}
                      <a
                        class="btn btn-xs btn-secondary"
                        href="#"
                        data-abc="true"
                      >
                        Let's Chat App
                      </a>
                    </div>
                    <div
                      class="ps-theme-default ps-active-y"
                      id="chat-content"
                      style={{
                        overflowY: "scroll !important",
                        height: "400px !important",
                      }}
                    >
                      <div class="media media-chat">
                        {" "}
                        <img
                          class="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt="..."
                        />
                        <div class="media-body">
                          <p>Hi</p>
                          <p>How are you ...???</p>
                          <p>
                            What are you doing tomorrow?
                            <br /> Can we come up a bar?
                          </p>
                          <p class="meta">
                            <time datetime="2018">23:58</time>
                          </p>
                        </div>
                      </div>
                      <div class="media media-meta-day">Today</div>
                      <div class="media media-chat media-chat-reverse">
                        <div class="media-body">
                          <p>Hiii, I'm good.</p>
                          <p>How are you doing?</p>
                          <p>
                            Long time no see! Tomorrow office. will be free on
                            sunday.
                          </p>
                          <p class="meta">
                            <time datetime="2018">00:06</time>
                          </p>
                        </div>
                      </div>
                      <div class="media media-chat">
                        {" "}
                        <img
                          class="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt="..."
                        />
                        <div class="media-body">
                          <p>Okay</p>
                          <p>We will go on sunday? </p>
                          <p class="meta">
                            <time datetime="2018">00:07</time>
                          </p>
                        </div>
                      </div>
                      <div class="media media-chat media-chat-reverse">
                        <div class="media-body">
                          <p>That's awesome!</p>
                          <p>I will meet you Sandon Square sharp at 10 AM</p>
                          <p>Is that okay?</p>
                          <p class="meta">
                            <time datetime="2018">00:09</time>
                          </p>
                        </div>
                      </div>
                      <div class="media media-chat">
                        {" "}
                        <img
                          class="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt="..."
                        />
                        <div class="media-body">
                          <p>Okay i will meet you on Sandon Square </p>
                          <p class="meta">
                            <time datetime="2018">00:10</time>
                          </p>
                        </div>
                      </div>
                      <div class="media media-chat media-chat-reverse">
                        <div class="media-body">
                          <p>Do you have pictures of Matley Marriage?</p>
                          <p class="meta">
                            <time datetime="2018">00:10</time>
                          </p>
                        </div>
                      </div>
                      <div class="media media-chat">
                        {" "}
                        <img
                          class="avatar"
                          src="https://img.icons8.com/color/36/000000/administrator-male.png"
                          alt="..."
                        />
                        <div class="media-body">
                          <p>Sorry I don't have. i changed my phone.</p>
                          <p class="meta">
                            <time datetime="2018">00:12</time>
                          </p>
                        </div>
                      </div>
                      <div class="media media-chat media-chat-reverse">
                        <div class="media-body">
                          <p>Okay then see you on sunday!!</p>
                          <p class="meta">
                            <time datetime="2018">00:12</time>
                          </p>
                        </div>
                      </div>
                      <div
                        class="ps-scrollbar-x-rail"
                        style={{ left: "0px", bottom: "0px" }}
                      >
                        <div
                          class="ps-scrollbar-x"
                          tabindex="0"
                          style={{ left: "0px", bottom: "0px" }}
                        ></div>
                      </div>
                      <div
                        class="ps-scrollbar-y-rail"
                        style={{ top: "0px", height: "0px", right: "2px" }}
                      >
                        <div
                          class="ps-scrollbar-y"
                          tabindex="0"
                          style={{ top: "0px", height: "2px" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div class="publisher bt-1 border-light">
                    {" "}
                    <img
                      class="avatar avatar-xs"
                      src="https://img.icons8.com/color/36/000000/administrator-male.png"
                      alt="..."
                    />{" "}
                    <input
                      class="publisher-input"
                      type="text"
                      placeholder="Write something"
                    />{" "}
                    <span class="publisher-btn file-group">
                      {" "}
                      <i class="fa fa-paperclip file-browser"></i>{" "}
                      <input type="file" />{" "}
                    </span>{" "}
                    <a class="publisher-btn" href="#" data-abc="true">
                      <i class="fa fa-smile"></i>
                    </a>{" "}
                    <a class="publisher-btn text-info" href="#" data-abc="true">
                      <i class="fa fa-paper-plane"></i>
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
                    {$.dayjs()
                      .diff(
                        $.dayjs(this.state.paneObj.user.expirationDate),
                        "day",
                        true
                      )
                      .toFixed()}{" "}
                    days
                  </h5>
                  <h5 className="mr-1">Country:</h5>
                  <h5>{this.state.paneObj.country}</h5>
                </Row>
              </Col>
            </Row>

            <Col className="col-12">
              <footer style={{ position: "absolute", bottom: "15px" }}>
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
                            await this.setState({ paneObj: column });
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
