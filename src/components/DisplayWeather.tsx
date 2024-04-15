import React, { useState, useEffect } from "react";
import { MainWrapper } from "./styles.module";
import { AiOutlineSearch } from "react-icons/ai";
import { WiHumidity } from "react-icons/wi";
import { SiWindicss } from "react-icons/si";
import {
  BsFillSunFill,
  BsCloudyFill,
  BsFillCloudRainFill,
  BsCloudFog2Fill,
} from "react-icons/bs";
import { RiLoaderFill } from "react-icons/ri";
import { TiWeatherPartlySunny } from "react-icons/ti";
import axios from "axios";

interface WeatherDataProps {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  sys: {
    country: string;
  };
  weather: {
    main: string;
  }[];
  wind: {
    speed: number;
  };
}

interface ForecastDataProps {
  dt_txt: string;
  main: {
    temp: number;
  };
  weather: {
    main: string;
  }[];
}

const DisplayWeather = () => {
  const api_key = process.env.REACT_APP_API_KEY;
  const api_Endpoint = process.env.REACT_APP_API_ENDPOINT;  

  const [weatherData, setWeatherData] = useState<WeatherDataProps | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDataProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCity, setSearchCity] = useState("");

  const fetchWeatherData = async (city: string) => {
    try {
      const url = `${api_Endpoint}weather?q=${city}&appid=${api_key}&units=metric`;
      const response = await axios.get(url);
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const fetchForecastData = async (city: string) => {
    try {
      const url = `${api_Endpoint}forecast?q=${city}&appid=${api_key}&units=metric`;
      const response = await axios.get(url);
      
      setForecastData(response.data.list);
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    }

  };

  const handleSearch = async () => {
    if (searchCity.trim() === "") {
      return;
    }

    setIsLoading(true);
    await Promise.all([fetchWeatherData(searchCity), fetchForecastData(searchCity)]);
    setIsLoading(false);
  };

  const iconChanger = (weather: string | undefined) => {
    let iconElement: React.ReactNode;
    let iconColor: string;

    switch (weather) {
      case "Rain":
        iconElement = <BsFillCloudRainFill />;
        iconColor = "#272829";
        break;
      case "Clear":
        iconElement = <BsFillSunFill />;
        iconColor = "#FFC436";
        break;
      case "Clouds":
        iconElement = <BsCloudyFill />;
        iconColor = "#102C57";
        break;
      case "Mist":
        iconElement = <BsCloudFog2Fill />;
        iconColor = "#279EFF";
        break;
      default:
        iconElement = <TiWeatherPartlySunny />;
        iconColor = "#7B2869";
    }

    return (
      <span className="icon" style={{ color: iconColor }}>
        {iconElement}
      </span>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `${api_Endpoint}weather?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric`;
        const response = await axios.get(url);
        setWeatherData(response.data);
      });
    };

    fetchData();
  }, [api_Endpoint, api_key]);

  return (
    <MainWrapper>
      <div className="container">
        <div className="searchArea">
          <input
            type="text"
            placeholder="Enter a city"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <AiOutlineSearch className="searchIcon" onClick={handleSearch} />
        </div>

        {isLoading ? (
          <div className="loading">
            <RiLoaderFill className="loadingIcon" />
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="weatherArea">
              <h1>{weatherData?.name}</h1>
              <span>{weatherData?.sys.country}</span>
              <div className="icon">
                {iconChanger(weatherData?.weather[0]?.main)}
                </div>
              <h1>{weatherData?.main.temp.toFixed(0)}</h1>
              <h2>{weatherData?.weather[0].main}</h2>
            </div>

            <div className="bottomInfoArea">
              <div className="humidityLevel">
                <WiHumidity className="windIcon" />
                <div className="humidInfo">
                  <h1>{weatherData?.main.humidity}%</h1>
                  <p>Humidity</p>
                </div>
              </div>

              <div className="wind">
                <SiWindicss className="windIcon" />
                <div className="humidInfo">
                  <h1>{weatherData?.wind.speed}km/h</h1>
                  <p>Wind speed</p>
                </div>
              </div>
            </div>

            <div className="forecastArea">
              <h2>Forecast for the next 5 days:</h2>
              <table className="table">
                <thead className="thead">
                  <tr>
                    <th>Date & Time</th>
                    <th>Temperature (°C)</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.slice(0, 5).map((data) => (
                    <tr key={data.dt_txt}>
                      <td>{data.dt_txt}</td>
                      <td>{data.main.temp.toFixed(0)}</td>
                      <td>{data.weather[0].main}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </MainWrapper>
  );
};

export default DisplayWeather;
