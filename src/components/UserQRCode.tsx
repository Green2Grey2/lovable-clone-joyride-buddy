
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import QRCodeLib from 'qrcode';

export const UserQRCode = () => {
  const { user } = useAuth();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      generateQRCode();
    }
  }, [user]);

  const generateQRCode = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const qrData = `user:${user.id}`;
      const dataUrl = await QRCodeLib.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1D244D',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = 'my-qr-code.png';
    link.href = qrCodeDataUrl;
    link.click();
    toast.success('QR code downloaded!');
  };

  const shareQRCode = async () => {
    if (!qrCodeDataUrl) return;
    
    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'my-qr-code.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My QR Code',
          text: 'Here is my QR code for event check-ins',
          files: [file]
        });
        toast.success('QR code shared!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        toast.success('QR code copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast.error('Failed to share QR code');
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view your QR code</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5" />
          My QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Use this QR code for quick event check-ins
          </p>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#735CF7]"></div>
            </div>
          ) : qrCodeDataUrl ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border inline-block">
                <img 
                  src={qrCodeDataUrl} 
                  alt="User QR Code" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={downloadQRCode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={shareQRCode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Button onClick={generateQRCode} className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Generate QR Code
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
