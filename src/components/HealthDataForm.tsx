
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Scale, Ruler } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface HealthDataFormProps {
  onSave: () => void;
}

export const HealthDataForm = ({ onSave }: HealthDataFormProps) => {
  const { userProfile, updateProfile } = useApp();
  const { playConfirm } = useSoundEffects();
  
  const [formData, setFormData] = useState({
    height: userProfile.height || 170,
    weight: userProfile.weight || 70,
    sex: userProfile.sex || 'male' as 'male' | 'female',
    age: userProfile.age || 25
  });

  const handleSave = () => {
    updateProfile(formData);
    playConfirm();
    onSave();
  };

  return (
    <Card className="bg-white border-0 rounded-3xl shadow-[0px_10px_30px_rgba(115,92,247,0.1)]">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-[#1D244D] flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Health Information
        </CardTitle>
        <p className="text-sm text-[#8A94A6]">Used for accurate calorie calculations</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              className="rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              className="rounded-xl"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sex">Sex</Label>
            <Select value={formData.sex} onValueChange={(value: 'male' | 'female') => setFormData({ ...formData, sex: value })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              className="rounded-xl"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#735CF7] to-[#00A3FF] text-white rounded-xl"
          soundEnabled={false}
        >
          Save Health Data
        </Button>
      </CardContent>
    </Card>
  );
};
