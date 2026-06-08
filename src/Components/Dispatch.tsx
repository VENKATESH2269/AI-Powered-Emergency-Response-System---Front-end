import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const emergencyIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23DC2626' stroke='white' stroke-width='3'/%3E%3Ctext x='20' y='28' font-size='24' text-anchor='middle' fill='white' font-weight='bold'%3E!%3C/text%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const ambulanceIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%23EF4444' stroke='white' stroke-width='3'/%3E%3Crect x='11' y='18' width='18' height='8' rx='2' fill='white'/%3E%3Crect x='17' y='13' width='6' height='18' fill='white'/%3E%3C/svg%3E",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Types
interface EmergencyCall {
  id: string;
  city: string;
  zone: string;
  emergencyType: string;
  severity: number;
  priority: string;
  patientAge: number;
  patientGender: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: 'pending' | 'allocated' | 'dispatched' | 'completed';
  allocatedAmbulance?: string;
  dispatchTime?: string;
  estimatedResponseTime?: number;
  actualResponseTime?: number;
}

interface Ambulance {
  id: string;
  zone: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'busy';
  equipment: string[];
  driver: string;
}

interface AllocationResult {
  selected_ambulance: {
    ambulance_id: string;
    distance_km: number;
    estimated_time_minutes: number;
    score: number;
    driver: string;
    equipment: string[];
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  emergency_assessment: {
    is_hotspot: boolean;
    hotspot_probability: number;
    predicted_response_time: number;
    severity: number;
    priority: string;
  };

  all_options: {
    ambulance_id: string;
    distance_km: number;
    estimated_time_minutes: number;
    score: number;
    driver: string;
    equipment: string[];
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }[];

  allocation_factors: {
    distance_weight: string;
    time_weight: string;
    equipment_weight: string;
    hotspot_weight: string;
  };
}

// Map center adjustment component
const ChangeMapView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
};

const Dispatch: React.FC = () => {
  // State
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCall[]>([]);
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([17.385044, 78.486671]);
  const [mapZoom, setMapZoom] = useState(12);
  const [showMap, setShowMap] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    city: 'Hyderabad',
    zone: '',
    emergencyType: 'Cardiac Emergency',
    severity: 3,
    priority: 'High',
    patientAge: 45,
    patientGender: 'Male',
    latitude: 17.385044,
    longitude: 78.486671,
  });

  // City coordinates and zones
  const cityData: { [key: string]: { coords: [number, number]; zones: string[] } } = {
    'Hyderabad': {
      coords: [17.385044, 78.486671],
      zones: ['Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Kukatpally', 'Madhapur', 'Gachibowli']
    },
    'Bangalore': {
      coords: [12.9716, 77.5946],
      zones: ['Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar', 'MG Road']
    },
    'Chennai': {
      coords: [13.0827, 80.2707],
      zones: ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Mylapore']
    },
    'Visakhapatnam': {
      coords: [17.6868, 83.2185],
      zones: ['MVP Colony', 'Dwaraka Nagar', 'Madhurawada', 'Gajuwaka']
    },
    'Vijayawada': {
      coords: [16.5062, 80.6480],
      zones: ['Benz Circle', 'Labbipet', 'Auto Nagar', 'Patamata']
    },
  };

  const emergencyTypes = [
    'Cardiac Emergency',
    'Road Accident',
    'Trauma/Injury',
    'Stroke',
    'Respiratory Distress',
    'Pregnancy Complication',
    'Fall/Fracture',
    'Poisoning',
    'Fire/Burn'
  ];

  // Load emergency calls from session storage
  useEffect(() => {
    loadEmergencyCalls();
  }, []);

  const loadEmergencyCalls = () => {
    const stored = sessionStorage.getItem('emergencyCalls');
    if (stored) {
      try {
        setEmergencyCalls(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading emergency calls:', error);
      }
    }
  };

  const saveEmergencyCalls = (calls: EmergencyCall[]) => {
    sessionStorage.setItem('emergencyCalls', JSON.stringify(calls));
    setEmergencyCalls(calls);
  };

  // Get deployed ambulances from session storage
  const getDeployedAmbulances = (city: string): Ambulance[] => {
    const stored = sessionStorage.getItem('ambulances');
    if (!stored) {
      console.log('No deployed ambulances found in session storage');
      return generateSampleAmbulances(city);
    }

    try {
      const allAmbulances = JSON.parse(stored);
      const cityAmbulances: Ambulance[] = [];

      // Find ambulances for this city from hotspot data
      Object.entries(allAmbulances).forEach(([cityKey, ambulances]: [string, any]) => {
        if (cityKey.toLowerCase().includes(city.toLowerCase())) {
          // Convert deployed ambulances to Ambulance type
          (ambulances as any[]).forEach((amb: any) => {
            cityAmbulances.push({
              id: amb.id || `AMB-${city.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
              zone: amb.zone,
              city: amb.city || city,
              latitude: amb.coordinates.latitude,
              longitude: amb.coordinates.longitude,
              status: 'available' as const,
              equipment: ['cardiac', 'oxygen', 'defibrillator'],
              driver: `Driver-${Math.floor(Math.random() * 100)}`,
            });
          });
        }
      });

      console.log(`Found ${cityAmbulances.length} deployed ambulances for ${city}`);
      
      if (cityAmbulances.length > 0) {
        return cityAmbulances;
      }
    } catch (error) {
      console.error('Error loading deployed ambulances:', error);
    }

    // Fallback to sample ambulances if no deployed ones found
    return generateSampleAmbulances(city);
  };

  // Generate sample ambulances as fallback
  const generateSampleAmbulances = (city: string): Ambulance[] => {
    const zones = cityData[city].zones;
    const drivers = ['Rajesh Kumar', 'Suresh Reddy', 'Mohammed Ali', 'Vijay Singh', 'Arun Patel'];
    const equipmentSets = [
      ['cardiac', 'oxygen', 'defibrillator'],
      ['basic', 'oxygen'],
      ['advanced', 'cardiac', 'trauma'],
      ['basic', 'oxygen', 'ventilator'],
      ['cardiac', 'oxygen']
    ];

    return zones.slice(0, 5).map((zone, index) => {
      const baseCoords = cityData[city].coords;
      return {
        id: `AMB-${city.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
        zone: zone,
        city: city,
        latitude: baseCoords[0] + (Math.random() - 0.5) * 0.1,
        longitude: baseCoords[1] + (Math.random() - 0.5) * 0.1,
        status: 'available' as const,
        equipment: equipmentSets[index % equipmentSets.length],
        driver: drivers[index % drivers.length],
      };
    });
  };

  const handleAddEmergency = () => {
    const newCall: EmergencyCall = {
      id: `EMG-${Date.now()}`,
      ...formData,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    const updated = [...emergencyCalls, newCall];
    saveEmergencyCalls(updated);
    setShowAddModal(false);
    
    // Reset form
    setFormData({
      ...formData,
      zone: '',
      patientAge: 45,
    });
  };

  const handleAllocateAmbulance = async (call: EmergencyCall) => {
    setSelectedCall(call);
    setLoading(true);
    setError(null);

    try {
      // Get deployed ambulances for this city
      const deployedAmbulances = getDeployedAmbulances(call.city);
      
      console.log(`Allocating from ${deployedAmbulances.length} deployed ambulances for ${call.city}`);

      // Prepare emergency data
      const emergencyData = {
        Hour: new Date().getHours(),
        Is_Weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
        Is_Peak_Hour: [8, 9, 17, 18, 19].includes(new Date().getHours()) ? 1 : 0,
        Is_Night: new Date().getHours() >= 22 || new Date().getHours() <= 6 ? 1 : 0,
        Latitude: call.latitude,
        Longitude: call.longitude,
        Severity: call.severity,
        Patient_Age: call.patientAge,
        Traffic_Density: 0.7,
        Population_Density: 12000,
        Nearest_Hospital_Distance_km: 3.5,
        Available_Ambulances: deployedAmbulances.length,
        Day_of_Week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        City: call.city,
        Zone: call.zone,
        Emergency_Type: call.emergencyType,
        Priority: call.priority,
        Patient_Gender: call.patientGender,
        Weather: 'Clear',
      };

      // Convert deployed ambulances to API format
      const availableAmbulances = deployedAmbulances.map(amb => ({
        ambulance_id: amb.id,
        latitude: amb.latitude,
        longitude: amb.longitude,
        status: amb.status,
        equipment: amb.equipment,
        driver: amb.driver,
      }));

      // Call allocation API
      const response = await fetch('http://127.0.0.1:5000/api/allocate-ambulance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergency_data: emergencyData,
          available_ambulances: availableAmbulances,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to allocate ambulance');
      }

      const data: AllocationResult = await response.json();
      setAllocationResult(data);
      setShowAllocationModal(true);

      // Update map
      setMapCenter([call.latitude, call.longitude]);
      setMapZoom(13);
      setShowMap(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error allocating ambulance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async () => {
    if (!selectedCall || !allocationResult) return;

    try {
      // Call dispatch API
      const response = await fetch('http://127.0.0.1:5000/api/dispatch-ambulance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emergency_id: selectedCall.id,
          ambulance_id: allocationResult.selected_ambulance.ambulance_id,
          emergency_location: {
            latitude: selectedCall.latitude,
            longitude: selectedCall.longitude,
            address: `${selectedCall.zone}, ${selectedCall.city}`,
          },
          patient_info: {
            age: selectedCall.patientAge,
            gender: selectedCall.patientGender,
            condition: selectedCall.emergencyType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to dispatch ambulance');
      }

      // Update call status
      const updated = emergencyCalls.map(call =>
        call.id === selectedCall.id
          ? {
              ...call,
              status: 'dispatched' as const,
              allocatedAmbulance: allocationResult.selected_ambulance.ambulance_id,
              dispatchTime: new Date().toISOString(),
              estimatedResponseTime: allocationResult.emergency_assessment.predicted_response_time,
            }
          : call
      );

      saveEmergencyCalls(updated);
      setShowAllocationModal(false);
      setAllocationResult(null);
      setSelectedCall(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error dispatching ambulance:', err);
    }
  };

  const handleCompleteCall = (callId: string) => {
    const updated = emergencyCalls.map(call =>
      call.id === callId
        ? {
            ...call,
            status: 'completed' as const,
            actualResponseTime: call.estimatedResponseTime ? call.estimatedResponseTime + Math.random() * 2 - 1 : undefined,
          }
        : call
    );
    saveEmergencyCalls(updated);
  };

  const handleDeleteCall = (callId: string) => {
    if (window.confirm('Are you sure you want to delete this emergency call?')) {
      const updated = emergencyCalls.filter(call => call.id !== callId);
      saveEmergencyCalls(updated);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'allocated':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'dispatched':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-red-100 text-red-800 border-red-300';
    if (severity >= 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const stats = {
    total: emergencyCalls.length,
    pending: emergencyCalls.filter(c => c.status === 'pending').length,
    dispatched: emergencyCalls.filter(c => c.status === 'dispatched').length,
    completed: emergencyCalls.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-t-4 border-red-600">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center gap-3">
            <span>🚨</span> Emergency Dispatch Center
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time emergency call management, ambulance allocation, and dispatch system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Calls</h3>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
              {stats.pending}
              <span className="text-2xl">⏳</span>
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Dispatched</h3>
            <p className="text-3xl font-bold text-purple-600 flex items-center gap-2">
              {stats.dispatched}
              <span className="text-2xl">🚑</span>
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600 flex items-center gap-2">
              {stats.completed}
              <span className="text-2xl">✅</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
          >
            <span>📞</span> New Emergency Call
          </button>

          {showMap && (
            <button
              onClick={() => setShowMap(false)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
            >
              <span>📋</span> Hide Map
            </button>
          )}
        </div>

        {/* Info Banner about Deployed Ambulances */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Using Deployed Ambulances</h3>
              <p className="text-sm text-blue-800">
                The system will automatically use ambulances that were deployed based on hotspot predictions. 
                If no ambulances are deployed in a city, sample ambulances will be used for demonstration.
                <strong> Nearest ambulance from the emergency zone will be allocated.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Calls List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-4 bg-gradient-to-r from-red-600 to-orange-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋</span> Emergency Calls Log
            </h2>
          </div>
          
          <div className="p-6">
            {emergencyCalls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📞</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Emergency Calls</h3>
                <p className="text-gray-600">Click "New Emergency Call" to add one</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emergencyCalls.map((call) => (
                  <div
                    key={call.id}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-md transition"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{call.emergencyType}</h3>
                        <p className="text-gray-600">
                          <strong>ID:</strong> {call.id}
                        </p>
                        <p className="text-gray-600">
                          <strong>Location:</strong> {call.zone}, {call.city}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Time:</strong> {new Date(call.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(call.status)}`}>
                          {call.status.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getSeverityColor(call.severity)}`}>
                          SEVERITY: {call.severity}/5
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold border-2 bg-blue-100 text-blue-800 border-blue-300">
                          {call.priority}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <strong>Patient:</strong> {call.patientGender}, {call.patientAge} years
                      </div>
                      <div>
                        <strong>Coordinates:</strong> {call.latitude.toFixed(4)}, {call.longitude.toFixed(4)}
                      </div>
                      {call.allocatedAmbulance && (
                        <div>
                          <strong>Ambulance:</strong> {call.allocatedAmbulance}
                        </div>
                      )}
                    </div>

                    {call.estimatedResponseTime && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                        <strong>Estimated Response Time:</strong> {call.estimatedResponseTime.toFixed(1)} minutes
                        {call.actualResponseTime && (
                          <span className="ml-4">
                            <strong>Actual:</strong> {call.actualResponseTime.toFixed(1)} minutes
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {call.status === 'pending' && (
                        <button
                          onClick={() => handleAllocateAmbulance(call)}
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                        >
                          {loading && selectedCall?.id === call.id ? '⏳ Allocating...' : '🚑 Allocate Ambulance'}
                        </button>
                      )}

                      {call.status === 'dispatched' && (
                        <button
                          onClick={() => handleCompleteCall(call.id)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                        >
                          ✅ Mark Complete
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setMapCenter([call.latitude, call.longitude]);
                          setMapZoom(14);
                          setShowMap(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                      >
                        🗺️ View on Map
                      </button>

                      <button
                        onClick={() => handleDeleteCall(call.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🗺️</span> Emergency Location Map
              </h2>
            </div>
            
            <div className="sticky" style={{ height: '600px', width: '100%' }}>
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
                
                {/* Emergency markers */}
                {emergencyCalls
                  .filter(call => call.status !== 'completed')
                  .map((call) => (
                    <Marker
                      key={call.id}
                      position={[call.latitude, call.longitude]}
                      icon={emergencyIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg mb-2">{call.emergencyType}</h3>
                          <p className="mb-1">
                            <strong>Location:</strong> {call.zone}, {call.city}
                          </p>
                          <p className="mb-1">
                            <strong>Status:</strong>{' '}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(call.status)}`}>
                              {call.status}
                            </span>
                          </p>
                          <p className="mb-1">
                            <strong>Severity:</strong> {call.severity}/5
                          </p>
                          {call.allocatedAmbulance && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Ambulance:</strong> {call.allocatedAmbulance}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                {/* Allocated ambulance marker and route */}
                {selectedCall && allocationResult && allocationResult.selected_ambulance && allocationResult.selected_ambulance.coordinates && (
                  <>
                    <Marker
                      position={[
                        allocationResult.selected_ambulance.coordinates.latitude,
                        allocationResult.selected_ambulance.coordinates.longitude,
                      ]}
                      icon={ambulanceIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-lg mb-2">
                            {allocationResult.selected_ambulance.ambulance_id}
                          </h3>
                          <p className="mb-1">
                            <strong>Distance:</strong> {allocationResult.selected_ambulance.distance_km.toFixed(2)} km
                          </p>
                          <p className="mb-1">
                            <strong>ETA:</strong> {allocationResult.selected_ambulance.estimated_time_minutes.toFixed(1)} min
                          </p>
                          <p className="mb-1">
                            <strong>Driver:</strong> {allocationResult.selected_ambulance.driver}
                          </p>
                        </div>
                      </Popup>
                    </Marker>

                    <Polyline
                      positions={[
                        [
                          allocationResult.selected_ambulance.coordinates.latitude,
                          allocationResult.selected_ambulance.coordinates.longitude,
                        ],
                        [selectedCall.latitude, selectedCall.longitude],
                      ]}
                      color="blue"
                      weight={3}
                      dashArray="10, 10"
                    />
                  </>
                )}
              </MapContainer>

              {/* Map Legend */}
              <div 
                className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3"
                style={{ zIndex: 1000 }}
              >
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚨</span>
                    <span>Emergency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🚑</span>
                    <span>Ambulance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 border-t-2 border-dashed border-blue-500"></div>
                    <span>Route</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Emergency Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">New Emergency Call</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-200 transition text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                    <button 
                      onClick={() => setError(null)}
                      className="absolute top-2 right-2 text-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => {
                      const city = e.target.value;
                      const coords = cityData[city].coords;
                      setFormData({
                        ...formData,
                        city,
                        zone: cityData[city].zones[0],
                        latitude: coords[0],
                        longitude: coords[1],
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {Object.keys(cityData).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Zone *
                  </label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select Zone</option>
                    {cityData[formData.city].zones.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Emergency Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Emergency Type *
                  </label>
                  <select
                    value={formData.emergencyType}
                    onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {emergencyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Severity and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Severity (1-5) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Patient Age *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Patient Gender *
                    </label>
                    <select
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEmergency}
                    disabled={!formData.zone}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mr-2">📞</span>
                    Add Emergency Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Allocation Result Modal */}
        {showAllocationModal && allocationResult && selectedCall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h2 className="text-2xl font-bold">Ambulance Allocation Result</h2>
                <button
                  onClick={() => {
                    setShowAllocationModal(false);
                    setAllocationResult(null);
                    setSelectedCall(null);
                  }}
                  className="text-white hover:text-gray-200 transition text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Emergency Assessment */}
                <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Emergency Assessment</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hotspot Status</p>
                      <p className="text-lg font-bold">
                        {allocationResult.emergency_assessment.is_hotspot ? (
                          <span className="text-red-600">🔥 YES - HOTSPOT</span>
                        ) : (
                          <span className="text-green-600">✅ NO - Normal Zone</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Probability: {allocationResult.emergency_assessment.hotspot_probability.toFixed(1)}%
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Predicted Response Time</p>
                      <p className="text-lg font-bold text-blue-600">
                        {allocationResult.emergency_assessment.predicted_response_time.toFixed(1)} minutes
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Severity Level</p>
                      <p className="text-lg font-bold">
                        {allocationResult.emergency_assessment.severity}/5
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Priority</p>
                      <p className="text-lg font-bold text-orange-600">
                        {allocationResult.emergency_assessment.priority}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Ambulance */}
                <div className="border-2 border-blue-500 rounded-xl p-6 bg-blue-50">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🚑</span> Selected Ambulance
                  </h3>
                 
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Ambulance ID:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {allocationResult.selected_ambulance.ambulance_id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Distance:</span>
                      <span className="text-lg font-bold">
                        {allocationResult.selected_ambulance.distance_km.toFixed(2)} km
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Estimated Arrival:</span>
                      <span className="text-lg font-bold text-green-600">
                        {allocationResult.selected_ambulance.estimated_time_minutes.toFixed(1)} minutes
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Driver:</span>
                      <span>{allocationResult.selected_ambulance.driver}</span>
                    </div>

                    <div className="flex justify-between items-start">
                      <span className="font-semibold">Equipment:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {allocationResult.selected_ambulance.equipment.map((eq) => (
                          <span
                            key={eq}
                            className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-semibold"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Selection Score:</span>
                      <span className="text-sm text-gray-600">
                        {allocationResult.selected_ambulance.score.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="pt-4">
                  <button
                    onClick={handleDispatch}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center justify-center gap-2 text-lg"
                  >
                    <span>🚀</span> Dispatch Ambulance Now
                  </button>
                </div>

                <p className="text-sm text-center text-gray-500">
                  Once dispatched, the ambulance will be en route to the emergency location
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dispatch;