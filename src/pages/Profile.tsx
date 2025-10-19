import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/common/Header";
import { SkipLink } from "@/components/common/SkipLink";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileFormSection } from "@/components/profile/ProfileFormSection";
import { AutoSaveInput } from "@/components/profile/AutoSaveInput";
import { AutoSaveSelect } from "@/components/profile/AutoSaveSelect";
import { AutoSaveDatePicker } from "@/components/profile/AutoSaveDatePicker";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: Date | null;
  height_value_in: number | null;
  weight_value_lb: number | null;
  gender: string | null;
}

export function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("first_name, last_name, email, birth_date, height_value_in, weight_value_lb, gender")
      .eq("id", user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      return;
    }

    setProfile({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || user.email || "",
      birth_date: data.birth_date ? new Date(data.birth_date) : null,
      height_value_in: data.height_value_in,
      weight_value_lb: data.weight_value_lb,
      gender: data.gender,
    });
  };

  const updateUserField = async (field: keyof UserProfile, value: any) => {
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({ [field]: value })
      .eq("id", user.id);

    if (error) throw error;

    setProfile((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleEmailUpdate = async (newEmail: string) => {
    if (!user) return;

    // Update public.users table
    await updateUserField("email", newEmail);

    // Update auth.users table
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    
    if (error) throw error;

    toast({
      title: "Email Update",
      description: "Please check your new email for a confirmation link",
    });
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset",
        description: "Check your email for a password reset link",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteAccount = () => {
    // Placeholder - not implemented yet
    toast({
      title: "Not Implemented",
      description: "Account deletion is not yet available",
    });
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    return profile?.email?.[0]?.toUpperCase() || "U";
  };

  const heightInches = profile?.height_value_in || 0;
  const heightFeet = Math.floor(heightInches / 12);
  const heightRemainingInches = heightInches % 12;

  if (loading || !profile) {
    return null;
  }

  return (
    <>
      <SkipLink />
      <Header variant="close" />
      <main id="main-content" className="container max-w-md mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>

        <ProfileFormSection title="Account Info">
          <AutoSaveInput
            label="First Name"
            value={profile.first_name}
            onSave={(value) => updateUserField("first_name", value)}
          />
          <AutoSaveInput
            label="Last Name"
            value={profile.last_name}
            onSave={(value) => updateUserField("last_name", value)}
          />
          <AutoSaveInput
            label="Update Email"
            value={profile.email}
            onSave={handleEmailUpdate}
            type="email"
          />
          <Button
            onClick={handleResetPassword}
            disabled={isResettingPassword}
            className="w-full"
          >
            Reset Password
          </Button>
        </ProfileFormSection>

        <ProfileFormSection title="When was your birth date?">
          <AutoSaveDatePicker
            label="Birth Date"
            value={profile.birth_date}
            onSave={(date) => updateUserField("birth_date", date.toISOString().split("T")[0])}
          />
        </ProfileFormSection>

        <ProfileFormSection title="What is your height?">
          <AutoSaveInput
            label="Feet"
            value={heightFeet.toString()}
            onSave={async (value) => {
              const feet = parseInt(value) || 0;
              const totalInches = feet * 12 + heightRemainingInches;
              await updateUserField("height_value_in", totalInches);
            }}
            type="number"
            min="0"
            max="8"
          />
          <AutoSaveInput
            label="Inches"
            value={heightRemainingInches.toString()}
            onSave={async (value) => {
              const inches = parseInt(value) || 0;
              const totalInches = heightFeet * 12 + inches;
              await updateUserField("height_value_in", totalInches);
            }}
            type="number"
            min="0"
            max="11"
          />
        </ProfileFormSection>

        <ProfileFormSection title="What is your weight?">
          <AutoSaveInput
            label="Pounds (lbs)"
            value={profile.weight_value_lb?.toString() || ""}
            onSave={(value) => updateUserField("weight_value_lb", parseInt(value) || null)}
            type="number"
            min="0"
          />
        </ProfileFormSection>

        <ProfileFormSection title="What is your gender?">
          <AutoSaveSelect
            label="Gender"
            value={profile.gender || ""}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            onSave={(value) => updateUserField("gender", value)}
          />
        </ProfileFormSection>

        <div className="space-y-3 pt-4">
          <Button onClick={handleLogout} className="w-full" variant="default">
            Log Out
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="ghost"
            className="w-full text-destructive hover:text-destructive"
          >
            Delete Account
          </Button>
        </div>
      </main>
    </>
  );
}
