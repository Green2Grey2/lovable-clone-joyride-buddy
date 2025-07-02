import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { QrCode, CheckCircle, AlertCircle, Camera, Users, X, Scan, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
}

interface AttendanceRecord {
  id: string;
  user_name: string;
  check_in_time: string;
  event_name: string;
}

export const QRCodeScanner = () => {
  const { isManager } = useUserRole();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [scannedCode, setScannedCode] = useState('');
  const [recentAttendances, setRecentAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualUserId, setManualUserId] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isManager()) {
      fetchActiveEvents();
      fetchRecentAttendances();
      checkCameraPermission();
    }
  }, [isManager]);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const checkCameraPermission = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(permission.state);
      }
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  const fetchActiveEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, name, location, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch active events');
    }
  };

  const fetchRecentAttendances = async () => {
    try {
      const { data: attendances, error: attendanceError } = await supabase
        .from('event_attendances')
        .select(`
          id, 
          user_id, 
          check_in_time, 
          event_id
        `)
        .order('check_in_time', { ascending: false })
        .limit(10);

      if (attendanceError) throw attendanceError;

      const formattedAttendances = await Promise.all((attendances || []).map(async (attendance) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', attendance.user_id)
          .single();

        const { data: event } = await supabase
          .from('events')
          .select('name')
          .eq('id', attendance.event_id)
          .single();

        return {
          id: attendance.id,
          user_name: profile?.name || 'Unknown User',
          check_in_time: attendance.check_in_time || new Date().toISOString(),
          event_name: event?.name || 'Unknown Event'
        };
      }));

      setRecentAttendances(formattedAttendances);
    } catch (error) {
      console.error('Error fetching recent attendances:', error);
      toast.error('Failed to fetch recent check-ins');
    }
  };

  const recordAttendance = async (userId?: string) => {
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    const userIdToUse = userId || extractUserIdFromQR(scannedCode) || manualUserId;
    
    if (!userIdToUse) {
      toast.error('Please scan a QR code or enter a user ID');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userIdToUse)) {
        toast.error('Invalid user ID format');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', userIdToUse)
        .single();

      if (profileError || !profile) {
        toast.error('User not found');
        return;
      }

      const { data: existingAttendance } = await supabase
        .from('event_attendances')
        .select('id')
        .eq('event_id', selectedEvent)
        .eq('user_id', userIdToUse)
        .single();

      if (existingAttendance) {
        toast.error(`${profile.name} is already checked in for this event`);
        return;
      }

      const { error } = await supabase
        .from('event_attendances')
        .insert([{
          event_id: selectedEvent,
          user_id: userIdToUse,
          checked_in_by: user.id
        }]);

      if (error) throw error;

      await triggerCheckInNotification(userIdToUse, profile.name);

      toast.success(`${profile.name} checked in successfully!`);
      setScannedCode('');
      setManualUserId('');
      fetchRecentAttendances();

    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const extractUserIdFromQR = (qrCode: string): string | null => {
    if (!qrCode) return null;
    
    if (qrCode.startsWith('user:')) {
      return qrCode.replace('user:', '');
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(qrCode)) {
      return qrCode;
    }
    
    return null;
  };

  const triggerCheckInNotification = async (userId: string, userName: string) => {
    try {
      await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title: 'Checked In Successfully!',
          message: `Welcome! You've been checked in. 🎉`,
          type: 'success'
        }]);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    
    try {
      // First check if we have permission
      if (permissionState === 'denied') {
        setCameraError('Camera access was denied. Please enable camera permissions in your browser settings and refresh the page.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
      setPermissionState('granted');
      toast.success('Camera started - position QR code in view');
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      if (error.name === 'NotAllowedError') {
        setPermissionState('denied');
        setCameraError('Camera access denied. Please click "Allow" when prompted for camera access, or enable camera permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application.');
      } else {
        setCameraError(`Camera error: ${error.message || 'Unknown error occurred'}`);
      }
      
      toast.error('Unable to access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setCameraError('');
  };

  const requestCameraPermission = async () => {
    await startCamera();
  };

  if (!isManager()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Manager or admin access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <QrCode className="h-5 w-5" />
            QR Code Check-In System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="event-select" className="text-sm font-medium">Select Active Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-sm text-gray-500">{event.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Camera Scanner Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Camera Scanner</Label>
                {!showCamera ? (
                  <Button
                    onClick={startCamera}
                    size="sm"
                    className="flex items-center gap-2 bg-[#735CF7] hover:bg-[#5f4dd4]"
                  >
                    <Camera className="h-4 w-4" />
                    <Scan className="h-4 w-4" />
                    Start Scanner
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Stop Camera
                  </Button>
                )}
              </div>

              {/* Camera Permission Handling */}
              {permissionState === 'denied' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Camera access is required for QR code scanning. Please enable camera permissions in your browser settings and refresh the page.
                  </AlertDescription>
                </Alert>
              )}

              {permissionState === 'prompt' && !showCamera && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 flex items-center justify-between">
                    <span>Camera access needed for QR scanning.</span>
                    <Button 
                      onClick={requestCameraPermission}
                      size="sm"
                      className="ml-2"
                    >
                      Allow Camera
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {cameraError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {cameraError}
                  </AlertDescription>
                </Alert>
              )}
              
              {showCamera && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 bg-black rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white rounded-lg bg-transparent opacity-50"></div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm text-center bg-black/70 rounded px-2 py-1">
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="qr-input" className="text-sm font-medium">Scanned QR Code</Label>
              <Input
                id="qr-input"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="user:123e4567-e89b-12d3-a456-426614174000 or UUID"
                className="w-full mt-1 font-mono text-sm"
              />
            </div>

            <div className="text-center text-sm text-gray-500">— OR —</div>

            <div>
              <Label htmlFor="manual-user-id" className="text-sm font-medium">Manual User ID Entry</Label>
              <Input
                id="manual-user-id"
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                placeholder="Enter user UUID directly"
                className="w-full mt-1 font-mono text-sm"
              />
            </div>

            <Button 
              onClick={() => recordAttendance()} 
              disabled={loading || !selectedEvent || (!scannedCode && !manualUserId)}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Record Attendance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Check-ins Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-5 w-5" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAttendances.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent check-ins</p>
              </div>
            ) : (
              recentAttendances.map((attendance) => (
                <div key={attendance.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">{attendance.user_name}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{attendance.event_name}</div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {new Date(attendance.check_in_time).toLocaleString()}
                    </div>
                    <Badge variant="outline" className="w-fit">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Checked In
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
