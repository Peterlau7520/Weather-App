import React from "react";
import logo from "./logo.svg";
// import { Card, Button, Dialog, Overlay, Intent, MenuItem, Elevation, Spinner } from "@blueprintjs/core";

import {
  Button,
  Card,
  Form,
  Modal,
  Container,
  Row,
  ListGroup,
  Image
} from "react-bootstrap";
import fs from "fs";

import "./App.css";

//Sorry Danny was quite busy these days and couldn't refactor the code. This is just the basic of basic.
//There are a few things I can do e.g. 
// 1. adding loaders from lottie
// 2. building functional components
// 3. improve the layout further (format the numbers etc)
// 4. Use Jslint
// I will make some changes on Friday perhaps as I was quite busy these days with some other engagements. Cheers!
export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      countries: [],
      cities: [],
      availableCities: [],
      selectedCountry: "",
      selectedCity: "",
      currentWeather: "",
      forecastWeather: ""
    };
    this.toggleOverlay = this.toggleOverlay.bind(this);
    this.createSelectItems = this.createSelectItems.bind(this);
    this.handleCountry = this.handleCountry.bind(this);
    this.handleCity = this.handleCity.bind(this);
    this.matchCities = this.matchCities.bind(this);
    this.queryWeather = this.queryWeather.bind(this);
    this.forecastData = this.forecastData.bind(this);
  }
  createSelectItems() {
    let items = [];
    items.push(
      <option hidden disabled selected value> -- select an option -- </option>
    )
    for (let i = 0; i < this.state.countries.length; i++) {
      items.push(
        <option key={i} value={this.state.countries[i]["alpha-2"]}>
          {" "}
          {this.state.countries[i].name}{" "}
        </option>
      );
    }

    return items;
  }
  matchCities() {
    var countryCode = this.state.selectedCountry;
    var availableCities = this.state.cities[countryCode];
    let items = [];
    for (let i = 0; i < availableCities.length; i++) {
      items.push(
        <option key={i} value={availableCities[i]}>
          {" "}
          {availableCities[i]}{" "}
        </option>
      );
    }
    return items;
  }
  componentDidMount() {
    fetch(
      "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-2/slim-2.json"
    )
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            countries: result
          });
        },
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
    fetch("city.list.min.json")
      .then(res => res.json())
      .then(
        result => {
          var cities = {};
          for (var i = 0; i < result.length; i++) {
            if (result[i]["country"] in cities) {
              cities[result[i]["country"]].push(result[i]["name"]);
            } else {
              cities[result[i]["country"]] = [result[i]["name"]];
            }
          }
          this.setState({
            cities: cities
          });
        },
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }
  toggleOverlay() {
    var status = this.state.isOpen;
    this.setState({
      isOpen: !status
    });
  }
  handleCountry(event) {
    this.setState({ selectedCountry: event.target.value });
  }
  handleCity(event) {
    this.setState({ selectedCity: event.target.value });
  }
  queryWeather() {
    var status = this.state.isOpen;
    this.setState({
      isOpen: !status
    });
    var cors = "https://cors-anywhere.herokuapp.com/http://";
    var link =
      cors +
      `api.openweathermap.org/data/2.5/weather?q=${this.state.selectedCity},${this.state.selectedCountry}&appid=` +
      "5cd905ac0125fabe2597a8835e00345c" +
      "&units=metric";
    var link2 =
      cors +
      `api.openweathermap.org/data/2.5/forecast?q=${this.state.selectedCity},${this.state.selectedCountry}&appid=` +
      "5cd905ac0125fabe2597a8835e00345c" +
      "&units=metric";
    fetch(link)
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            currentWeather: result
          });
        },
        error => {
          this.setState({
            isLoaded: true
          });
        }
      );
    fetch(link2)
      .then(res => res.json())
      .then(
        result => {
          // rewrite this bit
          var forecast = {};
          for (var i = 0; i < result.list.length; i++) {
            if (result.list[i].dt_txt in forecast) {
              forecast[result.list[i].dt_txt].push(result.list[i]);
            } else {
              forecast[result.list[i].dt_txt] = result.list[i];
            }
          }
          this.setState({
            forecastWeather: forecast
          });
        },
        error => {
          this.setState({
            isLoaded: true
          });
        }
      );
  }
  forecastData() {
    const keys = Object.keys(this.state.forecastWeather);
    var forecastData = {};
    for (var i = 0; i < keys.length; i++) {
      var date = keys[i].split(" ")[0];
      var time = keys[i].split(" ")[1];
      if (date in forecastData) {
        forecastData[date].push(this.state.forecastWeather[keys[i]]);
      } else {
        forecastData[date] = [this.state.forecastWeather[keys[i]]];
      }
    }
    return Object.keys(forecastData).map((item, i) => (
      <div key={i}>
        <h2> {item} </h2>
        {forecastData[item].map((item, j) => (
          <li key={j}>
            {" "}
            {item["dt_txt"].split(" ")[1]}
            <Image
              src={
                "http://openweathermap.org/img/wn/" +
                item.weather[0].icon +
                ".png"
              }
            />
            <span>
              {" "}
              {item.main.temp_min} {item.main.temp_max}
            </span>
          </li>
        ))}
      </div>
    ));
  }
  render() {
    return (
      <div className="App">
        <Container>
          <Row className="justify-content-md-center">
            <Card style={{ width: "38rem" }}>
              <Card.Title>AsiaHospitality WeatherApp</Card.Title>
              <Card.Body>
                <Button variant="primary" onClick={this.toggleOverlay}>
                  Launch demo modal
                </Button>
              </Card.Body>
              <Modal show={this.state.isOpen} onHide={this.toggleOverlay}>
                <Modal.Header closeButton>
                  <Modal.Title>Choose locations</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <h3>Here is a list of locations to pick</h3>
                  <Form>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                      <Form.Control as="select" onChange={this.handleCountry}>
                        {this.createSelectItems()}
                      </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="exampleForm.ControlSelect1">
                      <Form.Control as="select" onChange={this.handleCity}>
                        {this.state.selectedCountry
                          ? this.matchCities()
                          : "None"}
                      </Form.Control>
                    </Form.Group>
                  </Form>
                  <Button onClick={this.queryWeather}>Submit</Button>
                </Modal.Body>
              </Modal>
            </Card>
          </Row>
        </Container>
        <Container>
          <Row className="justify-content-md-center">
            <Card style={{ width: "19rem" }}>
              <Card.Img variant="top" />
              <Card.Body>
                <Card.Title>Current</Card.Title>
                {this.state.currentWeather ? (
                  <Image
                    src={
                      "http://openweathermap.org/img/wn/" +
                      this.state.currentWeather.weather[0].icon +
                      "@2x.png"
                    }
                    rounded
                  />
                ) : (
                  "None"
                )}
                {this.state.currentWeather ? (
                  <Card.Text>
                    {this.state.currentWeather.main.temp} &#8451; {", "}
                    {this.state.currentWeather.weather[0].description}
                    <br />
                    {"Humidity: " + this.state.currentWeather.main.humidity}
                    <br />
                    {"Wind: " + this.state.currentWeather.wind.speed + "m/s"}
                  </Card.Text>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
            <Card
              style={{ width: "19rem", height: "19rem", overflow: "scroll" }}
            >
              <Card.Img variant="top" />
              <Card.Body>
                <Card.Title>Forecast</Card.Title>

                {this.state.forecastWeather ? this.forecastData() : "None"}
              </Card.Body>
            </Card>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
