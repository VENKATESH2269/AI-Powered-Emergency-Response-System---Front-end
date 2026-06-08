import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// FIXED: Better ambulance icon using URL-encoded SVG
const ambulanceIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23EF4444' stroke='white' stroke-width='3'/%3E%3Crect x='11' y='18' width='18' height='8' rx='2' fill='white'/%3E%3Crect x='17' y='13' width='6' height='18' fill='white'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Types
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

interface TimeRange {
  start_hour: number;
  end_hour: number;
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
  };
}

interface Ambulance {
  id: string;
  zone: string;
  city: string;
  coordinates: Coordinates;
  count: number;
  risk_level: string;
  timestamp: string;
  status?: 'available' | 'busy';
  equipment?: string[];
  driver?: string;
}

interface CityAmbulances {
  [cityKey: string]: Ambulance[];
}

// FIXED: Map center adjustment component - removed 'map' from dependencies
const ChangeMapView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
};

const Ambulances: React.FC = () => {
  const navigate = useNavigate(); // FIXED: Using React Router navigation
  
  const [hotspotData, setHotspotData] = useState<{ [key: string]: HotspotResponse }>({});
  const [hasHotspots, setHasHotspots] = useState(false);
  const [ambulances, setAmbulances] = useState<CityAmbulances>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewMap, setShowViewMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([17.385044, 78.486671]);
  const [mapZoom, setMapZoom] = useState(6);

  // City coordinates
  const cityCoordinates: { [key: string]: [number, number] } = {
    'Hyderabad': [17.385044, 78.486671],
    'Bangalore': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Visakhapatnam': [17.6868, 83.2185],
    'Vijayawada': [16.5062, 80.6480],
    'All': [17.385044, 78.486671] // FIXED: Changed from 'All Cities' to 'All'
  };

  useEffect(() => {
    loadHotspotData();
    loadAmbulances();
  }, []);

  const loadHotspotData = () => {
    const storedData: { [key: string]: HotspotResponse } = {};
    let foundData = false;

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('hotspot_')) {
        const data = sessionStorage.getItem(key);
        if (data) {
          try {
            storedData[key] = JSON.parse(data);
            foundData = true;
          } catch (error) {
            console.error(`Error parsing data for key ${key}:`, error);
          }
        }
      }
    }

    setHotspotData(storedData);
    setHasHotspots(foundData);
  };

  const loadAmbulances = () => {
    const storedAmbulances = sessionStorage.getItem('ambulances');
    if (storedAmbulances) {
      try {
        setAmbulances(JSON.parse(storedAmbulances));
      } catch (error) {
        console.error('Error loading ambulances:', error);
      }
    }
  };

  const saveAmbulances = (newAmbulances: CityAmbulances) => {
    sessionStorage.setItem('ambulances', JSON.stringify(newAmbulances));
    setAmbulances(newAmbulances);
  };

  const addAmbulancesForCity = (cityKey: string) => {
    const cityData = hotspotData[cityKey];
    if (!cityData) return;

    const newAmbulances: Ambulance[] = [];
    
    // Generate drivers and equipment sets
    const drivers = ['Rajesh Kumar', 'Suresh Reddy', 'Mohammed Ali', 'Vijay Singh', 'Arun Patel', 'Prakash Rao', 'Deepak Singh'];
    const equipmentSets = [
      ['cardiac', 'oxygen', 'defibrillator'],
      ['basic', 'oxygen'],
      ['advanced', 'cardiac', 'trauma'],
      ['basic', 'oxygen', 'ventilator'],
      ['cardiac', 'oxygen', 'ECG'],
      ['advanced', 'trauma', 'ventilator'],
      ['basic', 'oxygen', 'first-aid']
    ];

    cityData.hotspot_zones.forEach((zone, zoneIndex) => {
      // FIXED: More robust regex to handle plural "ambulances"
      const match = zone.recommendation.match(/Deploy (\d+) ambulance(s)?/i);
      const count = match ? parseInt(match[1]) : 1;

      // Create individual ambulance entries for each count
      for (let i = 0; i < count; i++) {
        const ambulance: Ambulance = {
          id: `AMB-${cityData.city.substring(0, 3).toUpperCase()}-${String(zoneIndex * 10 + i + 1).padStart(3, '0')}`,
          zone: zone.zone,
          city: cityData.city,
          coordinates: {
            // Add slight variation to coordinates for each ambulance in same zone
            latitude: zone.coordinates.latitude + (Math.random() - 0.5) * 0.01,
            longitude: zone.coordinates.longitude + (Math.random() - 0.5) * 0.01
          },
          count: 1, // Each ambulance is individual
          risk_level: zone.risk_level,
          timestamp: new Date().toISOString(),
          // Add fields that Dispatcher expects
          status: 'available' as const,
          equipment: equipmentSets[(zoneIndex * 10 + i) % equipmentSets.length],
          driver: drivers[(zoneIndex * 10 + i) % drivers.length],
        };

        newAmbulances.push(ambulance);
      }
    });

    const updatedAmbulances = {
      ...ambulances,
      [cityKey]: newAmbulances,
    };

    saveAmbulances(updatedAmbulances);
    setShowAddModal(false);
    
    console.log(`✅ Deployed ${newAmbulances.length} ambulances for ${cityData.city}`);
  };

  const addAmbulancesForAllCities = () => {
    const allAmbulances: CityAmbulances = {};
    
    // Generate drivers and equipment sets
    const drivers = ['Rajesh Kumar', 'Suresh Reddy', 'Mohammed Ali', 'Vijay Singh', 'Arun Patel', 'Prakash Rao', 'Deepak Singh'];
    const equipmentSets = [
      ['cardiac', 'oxygen', 'defibrillator'],
      ['basic', 'oxygen'],
      ['advanced', 'cardiac', 'trauma'],
      ['basic', 'oxygen', 'ventilator'],
      ['cardiac', 'oxygen', 'ECG'],
      ['advanced', 'trauma', 'ventilator'],
      ['basic', 'oxygen', 'first-aid']
    ];

    Object.entries(hotspotData).forEach(([cityKey, cityData]) => {
      const cityAmbulanceList: Ambulance[] = [];

      cityData.hotspot_zones.forEach((zone, zoneIndex) => {
        // FIXED: More robust regex
        const match = zone.recommendation.match(/Deploy (\d+) ambulance(s)?/i);
        const count = match ? parseInt(match[1]) : 1;

        // Create individual ambulance entries for each count
        for (let i = 0; i < count; i++) {
          const ambulance: Ambulance = {
            id: `AMB-${cityData.city.substring(0, 3).toUpperCase()}-${String(zoneIndex * 10 + i + 1).padStart(3, '0')}`,
            zone: zone.zone,
            city: cityData.city,
            coordinates: {
              // Add slight variation to coordinates for each ambulance in same zone
              latitude: zone.coordinates.latitude + (Math.random() - 0.5) * 0.01,
              longitude: zone.coordinates.longitude + (Math.random() - 0.5) * 0.01
            },
            count: 1, // Each ambulance is individual
            risk_level: zone.risk_level,
            timestamp: new Date().toISOString(),
            // Add fields that Dispatcher expects
            status: 'available' as const,
            equipment: equipmentSets[(zoneIndex * 10 + i) % equipmentSets.length],
            driver: drivers[(zoneIndex * 10 + i) % drivers.length],
          };

          cityAmbulanceList.push(ambulance);
        }
      });

      allAmbulances[cityKey] = cityAmbulanceList;
    });

    saveAmbulances(allAmbulances);
    setShowAddModal(false);
    
    const totalDeployed = Object.values(allAmbulances).reduce((sum, ambs) => sum + ambs.length, 0);
    console.log(`✅ Deployed ${totalDeployed} ambulances across all cities`);
  };

  // NEW: Remove ambulances for specific city
  const removeAmbulancesForCity = (cityKey: string) => {
    const cityName = cityKey.replace('hotspot_', '').split('_')[0];
    if (window.confirm(`Remove all ambulances for ${cityName}?`)) {
      const updated = { ...ambulances };
      delete updated[cityKey];
      saveAmbulances(updated);
    }
  };

  const getAllAmbulances = (): Ambulance[] => {
    const allAmb: Ambulance[] = [];
    Object.values(ambulances).forEach((cityAmbs) => {
      allAmb.push(...cityAmbs);
    });
    return allAmb;
  };

  const getTotalAmbulanceCount = (): number => {
    return getAllAmbulances().reduce((sum, amb) => sum + amb.count, 0);
  };

  const viewAmbulancesOnMap = () => {
    const allAmbs = getAllAmbulances();
    if (allAmbs.length > 0) {
      setMapCenter([allAmbs[0].coordinates.latitude, allAmbs[0].coordinates.longitude]);
      setMapZoom(6);
    }
    setShowViewMap(true);
  };

  const getRiskColor = (riskLevel: string): string => {
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

  const clearAllAmbulances = () => {
    if (window.confirm('Are you sure you want to remove all ambulances from all cities?')) {
      sessionStorage.removeItem('ambulances');
      setAmbulances({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-4 border-red-600">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
            <span>🚑</span> Ambulance Management
          </h1>
          <p className="text-gray-600 text-lg">
            Deploy ambulances based on hotspot predictions and monitor their locations
          </p>
        </div>

        {!hasHotspots ? (
          // No hotspots found
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Hotspots Found</h3>
            <p className="text-gray-600 mb-6">
              Please predict hotspots first before adding ambulances
            </p>
            {/* FIXED: Using navigate instead of <a> tag */}
            <button
              onClick={() => navigate('/admin/hotspot-prediction')}
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Go to Hotspot Prediction
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Hotspot Cities</h3>
                <p className="text-3xl font-bold text-gray-800">{Object.keys(hotspotData).length}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Cities with Ambulances</h3>
                <p className="text-3xl font-bold text-green-600">{Object.keys(ambulances).length}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Ambulances Deployed</h3>
                <p className="text-3xl font-bold text-red-600 flex items-center gap-2">
                  {getTotalAmbulanceCount()}
                  <span className="text-2xl">🚑</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
              >
                <span>➕</span> Add Ambulances
              </button>

              {getTotalAmbulanceCount() > 0 && (
                <>
                  <button
                    onClick={viewAmbulancesOnMap}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                  >
                    <span>🗺️</span> View on Map
                  </button>

                  <button
                    onClick={clearAllAmbulances}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                  >
                    <span>🗑️</span> Clear All
                  </button>
                </>
              )}
            </div>

            {/* Ambulance Deployments by City */}
            {getTotalAmbulanceCount() > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-red-600 to-pink-600">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🚑</span> Deployed Ambulances by City
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {Object.entries(ambulances).map(([cityKey, cityAmbs]) => {
                    const cityName = cityKey.replace('hotspot_', '').split('_')[0];
                    const totalCount = cityAmbs.reduce((sum, amb) => sum + amb.count, 0);
                    
                    return (
                      <div key={cityKey} className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-800">{cityName}</h3>
                          <div className="flex items-center gap-3">
                            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-bold">
                              {totalCount} Ambulances
                            </span>
                            {/* NEW: Remove button for specific city */}
                            <button
                              onClick={() => removeAmbulancesForCity(cityKey)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
                              title="Remove ambulances for this city"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cityAmbs.map((amb) => (
                            <div
                              key={amb.id}
                              className={`border-2 rounded-lg p-4 ${getRiskColor(amb.risk_level)}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg">{amb.zone}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getRiskColor(amb.risk_level)}`}>
                                  {amb.risk_level}
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-sm">
                                <p>
                                  <strong>ID:</strong> {amb.id}
                                </p>
                                {amb.driver && (
                                  <p>
                                    <strong>Driver:</strong> {amb.driver}
                                  </p>
                                )}
                                {amb.equipment && amb.equipment.length > 0 && (
                                  <div>
                                    <strong>Equipment:</strong>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {amb.equipment.map((eq, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs"
                                        >
                                          {eq}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <p className="text-xs text-gray-600">
                                  <strong>Location:</strong> {amb.coordinates.latitude.toFixed(4)}, {amb.coordinates.longitude.toFixed(4)}
                                </p>
                                {amb.status && (
                                  <p>
                                    <strong>Status:</strong>{' '}
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      amb.status === 'available' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                    }`}>
                                      {amb.status.toUpperCase()}
                                    </span>
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Deployed: {new Date(amb.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Map View - REMOVED mapKey */}
            {showViewMap && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-green-600 to-teal-600 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🗺️</span> Ambulance Locations Map
                  </h2>
                  <button
                    onClick={() => setShowViewMap(false)}
                    className="text-white hover:text-gray-200 transition text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="relative" style={{ height: '600px', width: '100%' }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <ChangeMapView center={mapCenter} zoom={mapZoom} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {getAllAmbulances().map((amb) => (
                      <Marker
                        key={amb.id}
                        position={[amb.coordinates.latitude, amb.coordinates.longitude]}
                        icon={ambulanceIcon}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-lg mb-2">{amb.id}</h3>
                            <p className="mb-1">
                              <strong>Zone:</strong> {amb.zone}
                            </p>
                            <p className="mb-1">
                              <strong>City:</strong> {amb.city}
                            </p>
                            {amb.driver && (
                              <p className="mb-1">
                                <strong>Driver:</strong> {amb.driver}
                              </p>
                            )}
                            {amb.equipment && amb.equipment.length > 0 && (
                              <div className="mb-1">
                                <strong>Equipment:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {amb.equipment.map((eq, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs"
                                    >
                                      {eq}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="mb-1">
                              <strong>Risk Level:</strong>{' '}
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(amb.risk_level)}`}>
                                {amb.risk_level}
                              </span>
                            </p>
                            {amb.status && (
                              <p className="mb-1">
                                <strong>Status:</strong>{' '}
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  amb.status === 'available' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                }`}>
                                  {amb.status.toUpperCase()}
                                </span>
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-2">
                              Deployed: {new Date(amb.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Map Legend */}
                  <div 
                    className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3"
                    style={{ zIndex: 1000 }}
                  >
                    <h4 className="font-semibold text-sm mb-2 text-gray-700">Legend</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🚑</span>
                        <span>Ambulance Location</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Ambulances Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">Add Ambulances</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-200 transition text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-600 mb-4">
                  Select a city to deploy ambulances based on hotspot recommendations
                </p>

                {/* Add All Cities Button */}
                <button
                  onClick={addAmbulancesForAllCities}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>🚑</span> Add Ambulances for All Cities
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                {/* Individual City Buttons */}
                <div className="space-y-3">
                  {Object.entries(hotspotData).map(([cityKey, cityData]) => {
                    const cityName = cityKey.replace('hotspot_', '').split('_')[0];
                    const totalZones = cityData.hotspot_zones.length;
                    const highRisk = cityData.hotspot_zones.filter(z => z.risk_level === 'HIGH').length;
                    
                    return (
                      <div
                        key={cityKey}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold text-gray-800">{cityName}</h3>
                          <span className="text-sm text-gray-600">
                            {totalZones} zones, {highRisk} high risk
                          </span>
                        </div>
                        <button
                          onClick={() => addAmbulancesForCity(cityKey)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          Add Ambulances for {cityName}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ambulances;