import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Play, Pause, Square, Navigation } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface GPSActivityMapProps {
  activityType: 'walk' | 'run' | 'cycle';
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export const GPSActivityMap = ({ 
  activityType, 
  isActive, 
  onStart, 
  onPause, 
  onStop 
}: GPSActivityMapProps) => {
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [activityPath, setActivityPath] = useState<LocationPoint[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  
  const watchIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestLocationPermission();
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (isActive && !isTracking) {
      startTracking();
    } else if (!isActive && isTracking) {
      pauseTracking();
    }
  }, [isActive]);

  const requestLocationPermission = async () => {
    try {
      const permission = await Geolocation.requestPermissions({
        permissions: ['location']
      });
      
      if (permission.location === 'granted') {
        setPermissionGranted(true);
        getCurrentLocation();
        toast.success('Location permission granted');
      } else {
        toast.error('Location permission is required for GPS tracking');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      toast.error('Failed to request location permission');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const location: LocationPoint = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now(),
        accuracy: position.coords.accuracy
      };

      setCurrentLocation(location);
      setMapReady(true);
    } catch (error) {
      console.error('Error getting current location:', error);
      toast.error('Failed to get current location');
    }
  };

  const startTracking = async () => {
    if (!permissionGranted) {
      await requestLocationPermission();
      return;
    }

    try {
      const watchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      }, (position) => {
        if (position) {
          const newPoint: LocationPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy
          };

          setCurrentLocation(newPoint);
          setActivityPath(prev => [...prev, newPoint]);
          updateDistance(newPoint);
        }
      });

      watchIdRef.current = watchId;
      setIsTracking(true);
      startTimeRef.current = Date.now();
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);

      onStart();
      toast.success('GPS tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      toast.error('Failed to start GPS tracking');
    }
  };

  const pauseTracking = () => {
    if (watchIdRef.current) {
      Geolocation.clearWatch({ id: watchIdRef.current });
      watchIdRef.current = null;
    }
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    setIsTracking(false);
    onPause();
    toast.info('GPS tracking paused');
  };

  const stopTracking = () => {
    pauseTracking();
    setActivityPath([]);
    setDistance(0);
    setDuration(0);
    startTimeRef.current = null;
    onStop();
    toast.success('Activity completed');
  };

  const updateDistance = (newPoint: LocationPoint) => {
    if (activityPath.length > 0) {
      const lastPoint = activityPath[activityPath.length - 1];
      const distanceIncrement = calculateDistance(lastPoint, newPoint);
      setDistance(prev => prev + distanceIncrement);
    }
  };

  const calculateDistance = (point1: LocationPoint, point2: LocationPoint): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
  };

  if (!permissionGranted) {
    return (
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            GPS Activity Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Location Permission Required</h3>
          <p className="text-muted-foreground mb-4">
            Enable location access to track your {activityType} with GPS
          </p>
          <Button onClick={requestLocationPermission}>
            Grant Location Permission
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Stats */}
      <Card className="card-modern">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{formatDuration(duration)}</p>
              <p className="text-xs text-muted-foreground">Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{formatDistance(distance)}</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                {distance > 0 && duration > 0 
                  ? ((distance / (duration / 3600)).toFixed(1)) 
                  : '0.0'
                }
              </p>
              <p className="text-xs text-muted-foreground">km/h</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="card-modern">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Live GPS Tracking
            </div>
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? 'Tracking' : 'Paused'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-64 rounded-lg overflow-hidden bg-muted">
            {mapReady && currentLocation ? (
              <MapContainer
                center={[currentLocation.lat, currentLocation.lng]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Current location marker */}
                <Marker position={[currentLocation.lat, currentLocation.lng]}>
                  <Popup>
                    Current Location
                    <br />
                    Accuracy: ±{currentLocation.accuracy?.toFixed(0)}m
                  </Popup>
                </Marker>

                {/* Activity path */}
                {activityPath.length > 1 && (
                  <Polyline
                    positions={activityPath.map(point => [point.lat, point.lng])}
                    color="#3b82f6"
                    weight={4}
                    opacity={0.8}
                  />
                )}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isTracking ? (
          <Button onClick={startTracking} className="flex-1 flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start Tracking
          </Button>
        ) : (
          <Button onClick={pauseTracking} variant="outline" className="flex-1 flex items-center gap-2">
            <Pause className="h-4 w-4" />
            Pause
          </Button>
        )}
        
        <Button 
          onClick={stopTracking} 
          variant="destructive" 
          className="flex items-center gap-2"
          disabled={activityPath.length === 0}
        >
          <Square className="h-4 w-4" />
          Stop
        </Button>
      </div>
    </div>
  );
};