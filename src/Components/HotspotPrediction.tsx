import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Types
interface TimeRange {
  start_hour: number;
  end_hour: number;
}

interface PredictionInput {
  city: string;
  date: string;
  time_range: TimeRange;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface HotspotZone {
  zone: string;
  city: string;
  hotspot_probability: number;
  predicted_emergencies: number;
  peak_hours: number[];
  risk_level: string;
  recommendation: string;
  coordinates: Coordinates;
  average_severity?: number;
  average_traffic?: number;
}

interface HotspotResponse {
  date: string;
  day_of_week: string;
  city: string;
  time_range: TimeRange;
  hotspot_zones: HotspotZone[];
  summary: {
    total_zones_analyzed: number;
    high_risk_zones: number;
    medium_risk_zones: number;
    low_risk_zones: number;
    total_ambulances_recommended?: number;
  };
  top_5_hotspots?: HotspotZone[];
}

// Map center adjustment component
const ChangeMapView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const HotspotPrediction: React.FC = () => {
 
  // State
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [city, setCity] = useState('Hyderabad');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);

  // Hotspot data
  const [currentHotspots, setCurrentHotspots] = useState<HotspotResponse | null>(null);
  const [allCitiesData, setAllCitiesData] = useState<{ [key: string]: HotspotResponse }>({});
  const [selectedCity, setSelectedCity] = useState('');

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([17.385044, 78.486671]); // Hyderabad default
  const [mapZoom, setMapZoom] = useState(11);
  const [mapKey, setMapKey] = useState(0); // Key to force map remount

  const cityCoordinates: { [key: string]: [number, number] } = {
    'Hyderabad': [17.385044, 78.486671],
    'Bangalore': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Visakhapatnam': [17.6868, 83.2185],
    'Vijayawada': [16.5062, 80.6480],
    'All Cities': [17.385044, 78.486671] // Default to Hyderabad for "All"
  };

  // Load stored data on component mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = () => {
    const storedData: { [key: string]: HotspotResponse } = {};
    // Load all stored city data
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('hotspot_')) {
        const data = sessionStorage.getItem(key);
        if (data) {
          storedData[key] = JSON.parse(data);
        }
      }
    }
    setAllCitiesData(storedData);

    // If there's data, show the first city
    const cities = Object.keys(storedData);
    if (cities.length > 0) {
      setSelectedCity(cities[0]);
      setCurrentHotspots(storedData[cities[0]]);
      
      // Set map center based on first zone or city
      const cityData = storedData[cities[0]];
      if (cityData.hotspot_zones.length > 0) {
        const firstZone = cityData.hotspot_zones[0];
        setMapCenter([firstZone.coordinates.latitude, firstZone.coordinates.longitude]);
      } else {
        const cityName = cityData.city;
        if (cityCoordinates[cityName]) {
          setMapCenter(cityCoordinates[cityName]);
        }
      }
      setMapKey(prev => prev + 1);
    }
  };

  const handlePredictHotspots = async () => {
    setLoading(true);
    setError(null);

    const requestBody: PredictionInput = {
      city: city,
      date: date,
      time_range: {
        start_hour: startHour,
        end_hour: endHour
      }
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict-zone-hotspots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotspot predictions');
      }

      const data: HotspotResponse = await response.json();

      // Store in session storage with city-specific key
      const storageKey = `hotspot_${city}_${date}`;
      sessionStorage.setItem(storageKey, JSON.stringify(data));

      // Update state
      setCurrentHotspots(data);
      setSelectedCity(storageKey);
      setAllCitiesData(prev => ({
        ...prev,
        [storageKey]: data
      }));

      // Set map center to first hotspot zone or city center
      if (data.hotspot_zones.length > 0) {
        const firstZone = data.hotspot_zones[0];
        setMapCenter([firstZone.coordinates.latitude, firstZone.coordinates.longitude]);
        setMapZoom(12);
      } else if (cityCoordinates[city]) {
        setMapCenter(cityCoordinates[city]);
        setMapZoom(11);
      }
      
      // Force map remount
      setMapKey(prev => prev + 1);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error predicting hotspots:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'HIGH':
        return '#EF4444'; // Red
      case 'MEDIUM':
        return '#F59E0B'; // Amber
      case 'LOW':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const getRiskBgColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const switchCity = (cityKey: string) => {
    const data = allCitiesData[cityKey];
    if (data) {
      setCurrentHotspots(data);
      setSelectedCity(cityKey);

      // Update map center
      if (data.hotspot_zones.length > 0) {
        const firstZone = data.hotspot_zones[0];
        setMapCenter([firstZone.coordinates.latitude, firstZone.coordinates.longitude]);
        setMapZoom(12);
      } else {
        const cityName = data.city;
        if (cityCoordinates[cityName]) {
          setMapCenter(cityCoordinates[cityName]);
          setMapZoom(11);
        }
      }
      
      // Force map remount
      setMapKey(prev => prev + 1);
    }
  };

  const zoomToZone = (zone: HotspotZone) => {
    setMapCenter([zone.coordinates.latitude, zone.coordinates.longitude]);
    setMapZoom(13);
    setMapKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl" style={{marginTop:"60px"}}>
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-4 border-t-4 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
            <span>🗺️</span> Hotspot Prediction
          </h1>
          <p className="text-gray-600 text-lg">
            Predict high-demand emergency zones and optimize ambulance deployment
          </p>
        </div>

        {/* Predict Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
          >
            <span>🔮</span> Predict Hotspots
          </button>
        </div>

        {/* Stored Cities Tabs */}
        {Object.keys(allCitiesData).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3 justify-center">
            {Object.keys(allCitiesData).map((cityKey) => (
              <button
                key={cityKey}
                onClick={() => switchCity(cityKey)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCity === cityKey
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {cityKey.replace('hotspot_', '').split('_')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        {currentHotspots ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Zones</h3>
                <p className="text-3xl font-bold text-gray-800">{currentHotspots.summary.total_zones_analyzed}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">High Risk</h3>
                <p className="text-3xl font-bold text-red-600 flex items-center gap-2">
                  {currentHotspots.summary.high_risk_zones}
                  <span className="text-2xl">🔴</span>
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Medium Risk</h3>
                <p className="text-3xl font-bold text-amber-600 flex items-center gap-2">
                  {currentHotspots.summary.medium_risk_zones}
                  <span className="text-2xl">🟡</span>
                </p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Low Risk</h3>
                <p className="text-3xl font-bold text-green-600 flex items-center gap-2">
                  {currentHotspots.summary.low_risk_zones}
                  <span className="text-2xl">🟢</span>
                </p>
              </div>
            </div>

            {/* Map Section - Fixed overflow and scrolling */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🗺️</span> Hotspot Zones Map
                </h2>
              </div>
              
              {/* Map Container - Fixed height and no scroll */}
              <div className="sticky" style={{ height: '500px', width: '100%' }}>
                <MapContainer
                  key={mapKey}
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  zoomControl={true}
                >
                  <ChangeMapView center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {currentHotspots.hotspot_zones.map((zone, index) => (
                    <CircleMarker
                      key={index}
                      center={[zone.coordinates.latitude, zone.coordinates.longitude]}
                      radius={zone.hotspot_probability / 5}
                      fillColor={getRiskColor(zone.risk_level)}
                      color={getRiskColor(zone.risk_level)}
                      fillOpacity={0.6}
                      weight={2}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg mb-2">{zone.zone}</h3>
                          <p className="mb-1">
                            <strong>Risk:</strong>{' '}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskBgColor(zone.risk_level)}`}>
                              {zone.risk_level}
                            </span>
                          </p>
                          <p className="mb-1">
                            <strong>Probability:</strong> {zone.hotspot_probability}%
                          </p>
                          <p className="mb-1">
                            <strong>Emergencies:</strong> {zone.predicted_emergencies}
                          </p>
                          <p className="mb-1">
                            <strong>Peak Hours:</strong> {zone.peak_hours.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {zone.recommendation}
                          </p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>

                {/* Legend - Positioned over map */}
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                  <h4 className="font-semibold text-sm mb-2 text-gray-700">Risk Levels</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <span>High Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                      <span>Medium Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span>Low Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Zones List - Fixed overflow and scrolling */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📍</span> Zone Details
                </h2>
              </div>
              
              {/* Fixed height with proper overflow scroll */}
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <div className="space-y-4">
                  {currentHotspots.hotspot_zones
                    .sort((a, b) => b.hotspot_probability - a.hotspot_probability)
                    .map((zone, index) => (
                      <div
                        key={index}
                        className={`border-2 rounded-xl p-4 transition-all hover:shadow-md cursor-pointer ${
                          getRiskBgColor(zone.risk_level)
                        }`}
                        onClick={() => zoomToZone(zone)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold">{zone.zone}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getRiskBgColor(zone.risk_level)}`}>
                            {zone.risk_level}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Probability:</strong>{' '}
                            <span className="font-semibold">{zone.hotspot_probability}%</span>
                          </div>
                          <div>
                            <strong>Expected Emergencies:</strong>{' '}
                            <span className="font-semibold">{zone.predicted_emergencies}</span>
                          </div>
                          <div className="md:col-span-2">
                            <strong>Peak Hours:</strong>{' '}
                            <span className="font-semibold">
                              {zone.peak_hours.map(h => `${h}:00`).join(', ')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-sm italic flex items-start gap-2">
                            <span>💡</span>
                            <span>{zone.recommendation}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Prediction Info */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm opacity-90 mb-1">Date</p>
                  <p className="text-lg font-bold">{currentHotspots.date}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Day</p>
                  <p className="text-lg font-bold">{currentHotspots.day_of_week}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">City</p>
                  <p className="text-lg font-bold">{currentHotspots.city}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Time Range</p>
                  <p className="text-lg font-bold">
                    {currentHotspots.time_range.start_hour}:00 - {currentHotspots.time_range.end_hour}:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Predictions Yet</h3>
            <p className="text-gray-600">Click "Predict Hotspots" to start analyzing emergency zones</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">Predict Hotspots</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* City Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Vijayawada">Vijayawada</option>
                    <option value="All Cities">All Cities</option>
                  </select>
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Hour
                    </label>
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i}:00
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Hour
                    </label>
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i}:00
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePredictHotspots}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Loading...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🔮</span>
                        Predict
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotspotPrediction;