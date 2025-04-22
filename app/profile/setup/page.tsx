"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import { getSupabaseClient } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Briefcase, Building, DollarSign, Clock, BadgeCheck, ListFilter, Camera, CheckCircle2 } from "lucide-react";

export default function ProfileSetupPage() {
  const { user, updateProfile } = useUserStore();
  const router = useRouter();
  // Start with empty fields (clean slate)
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [center, setCenter] = useState("");
  const [hourlyWage, setHourlyWage] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [employeeId, setEmployeeId] = useState(user.employeeId || ""); // Keep the auto-generated ID
  const [unit, setUnit] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Check if user is already authenticated
  useEffect(() => {
    // If user is not authenticated, redirect to login page
    if (!user.id) {
      router.push('/login');
    }
    // If user already has a complete profile, redirect to profile page
    else if (user.profile_complete) {
      router.push('/profile');
    }
    // Initialize name with the value from authenticated user (from signup)
    else if (user.name && !name) {
      setName(user.name);
    }
  }, [router, user, name]);
  
  // Add a cleanup effect to prevent memory leaks and state updates after unmounting
  useEffect(() => {
    return () => {
      // This will run when the component unmounts
      setLoading(false);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to upload the avatar if one is selected
      let avatarUrl = avatar;
      if (avatarFile) {
        try {
          const supabase = getSupabaseClient();
          const timestamp = new Date().getTime();
          const filePath = `${user.id}_${timestamp}`;
          
          // Check if the avatars bucket exists
          const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
          if (bucketsError) throw bucketsError;
          
          const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
          
          if (avatarsBucketExists) {
            // Bucket exists, proceed with upload
            const { data, error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
            if (uploadError) throw uploadError;
            
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = urlData.publicUrl;
          } else {
            console.warn('Avatars bucket does not exist. Attempting to save profile without avatar.');
            avatarUrl = "";
          }
        } catch (avatarError: any) {
          // We don't want avatar upload issues to block profile creation
          console.error('Avatar upload failed:', avatarError);
          avatarUrl = "";
        }
      }

      // Create the profile update data
      const profileData = {
        name,
        position,
        center,
        hourlyWage,
        employmentStatus,
        employeeId,
        unit,
        avatar: avatarUrl,
        joinDate: new Date().toISOString().split('T')[0],
        profile_complete: true,
        department: "", // Ensure all fields are included
        phone: ""
      };
      
      // Save profile data using the proper updateProfile function
      await updateProfile(profileData);
      
      // Update user metadata in Supabase to mark profile as complete
      const supabase = getSupabaseClient();
      await supabase.auth.updateUser({
        data: {
          // Use a spread of profile data but don't specify profile_complete twice
          ...profileData
        }
      });
      
      console.log('Profile saved to Supabase');
            
      // Mark setup as complete
      setSetupComplete(true);
      setLoading(false);
      
      // Redirect to the profile page
      router.push('/profile');
      
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="pb-2 text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Set Up Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Complete your profile information to access your Schedio account.  
          </CardDescription>
          
          {/* Progress indicator */}
          <div className="mt-6 mb-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Profile Setup</span>
              <span>Almost There</span>
              <span>Account Ready</span>
            </div>
            <Progress value={66} className="h-2" />
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CardContent className="space-y-8 px-6">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="relative group">
                {avatar ? (
                  <Avatar className="w-24 h-24 border-4 border-primary/20 cursor-pointer">
                    <AvatarImage src={avatar} alt={name || 'Profile'} />
                    <AvatarFallback className="bg-primary/10 text-lg font-medium">
                      {name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20 cursor-pointer">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="sr-only"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setAvatar(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </div>
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 text-muted-foreground">
                Profile Picture (Optional)
              </Badge>
            </div>

            <Separator className="my-6" />
            
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-medium">
                <User size={16} />
                <h3>Personal Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    <span>Name</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="name"
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    placeholder="Enter your full name"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employee-id" className="flex items-center gap-1">
                    <span>Employee ID</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="employee-id"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="EMP-12345"
                    className="border-gray-300"
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />
            
            {/* Employment Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Briefcase size={16} />
                <h3>Employment Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-1">
                    <span>Position</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={position}
                    onValueChange={setPosition}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Correctional Officer">Correctional Officer</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Boss">Boss</SelectItem>
                      <SelectItem value="Teamleader">Teamleader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employment-status" className="flex items-center gap-1">
                    <span>Employment Status</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    required
                    value={employmentStatus}
                    onValueChange={setEmploymentStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-Time">Full-Time</SelectItem>
                      <SelectItem value="Part-Time">Part-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="center" className="flex items-center gap-1">
                    <span>Center</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    required
                    value={center}
                    onValueChange={setCenter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Center" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCC">Saskatoon Correctional Center (SCC)</SelectItem>
                      <SelectItem value="RCC">Regina Correctional Center (RCC)</SelectItem>
                      <SelectItem value="PACC">Prince-Albert Correctional Center (PACC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit" className="flex items-center gap-1">
                    <span>Unit</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="unit"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="Specify your unit"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly-wage" className="flex items-center gap-1">
                    <span>Hourly Wage</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="hourly-wage"
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyWage}
                      onChange={e => setHourlyWage(e.target.value)}
                      placeholder="0.00"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm flex items-start gap-2 mt-2">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 px-6 pb-6">
            <Button 
              type="submit" 
              disabled={loading} 
              className="px-6"
              size="lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Complete Setup</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
