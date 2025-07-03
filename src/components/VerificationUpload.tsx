import React, { useState } from 'react';
import { Camera, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationUploadProps {
  activityId: string;
  onVerified?: () => void;
  currentStatus?: string;
  existingImageUrl?: string;
}

export const VerificationUpload: React.FC<VerificationUploadProps> = ({ 
  activityId, 
  onVerified,
  currentStatus = 'pending',
  existingImageUrl 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload to Supabase storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload verification');
        return;
      }

      const fileName = `${user.id}/${activityId}-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('verification-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-images')
        .getPublicUrl(fileName);

      // Update activity
      const { error: updateError } = await supabase
        .from('activities')
        .update({
          verification_status: 'verified',
          verification_image_url: publicUrl,
          verified_at: new Date().toISOString(),
          verified_by: user.id
        })
        .eq('id', activityId);

      if (updateError) throw updateError;

      // Log to history
      await supabase.from('verification_history').insert({
        activity_id: activityId,
        user_id: user.id,
        action: 'verified',
        image_url: publicUrl
      });

      toast.success('Steps verified successfully!');
      onVerified?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload verification');
    } finally {
      setUploading(false);
    }
  };

  const isVerified = currentStatus === 'verified';

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Verification" 
            className="rounded-lg max-h-48 mx-auto w-full object-cover"
          />
          {isVerified && (
            <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
              <Check className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      ) : (
        <label className="cursor-pointer">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Upload screenshot from health app
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max 5MB • JPG, PNG
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || isVerified}
            />
          </div>
        </label>
      )}
      
      {uploading && (
        <div className="text-center text-sm text-muted-foreground">
          <Upload className="w-4 h-4 inline animate-pulse mr-2" />
          Uploading verification...
        </div>
      )}

      {!isVerified && !uploading && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
        >
          <Camera className="w-4 h-4 mr-2" />
          Choose Photo
        </Button>
      )}
    </div>
  );
};