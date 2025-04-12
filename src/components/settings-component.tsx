"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconHome, IconUpload, IconX } from "@tabler/icons-react";
import { useQRCode } from "next-qrcode";
import SelectSwitch from "@/components/SelectSwitch";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { UserSettings } from "@/lib/default-settings";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface QRSizes {
  [key: string]: number;
}

interface SettingsComponentProps {
  initialSettings: UserSettings;
  user: any;
}

export default function SettingsComponent({
  initialSettings,
  user,
}: SettingsComponentProps) {
  // Hooks
  const { SVG } = useQRCode();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [qrSize, setQRSize] = useState<string>(initialSettings.qrSize);
  const [qrErrorCorrectionLevel, setQRErrorCorrectionLevel] = useState<string>(
    initialSettings.qrErrorCorrectionLevel,
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialSettings.logoUrl || "",
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Variables
  const qrSizeLookup: QRSizes = {
    small: 60,
    medium: 90,
    large: 180,
  };

  // Update settings in database when they change
  useEffect(() => {
    const updateSettings = async () => {
      if (!user?.id) return;

      setIsUpdating(true);

      try {
        const { error } = await supabase.from("user_settings").upsert(
          {
            user_id: user.id,
            settings: {
              qrSize,
              qrErrorCorrectionLevel,
              logoUrl,
            },
          },
          {
            onConflict: "user_id",
          },
        );

        if (error) throw error;
      } catch (error) {
        console.error("Error updating settings:", error);
        toast.error("Failed to update settings");
      } finally {
        setIsUpdating(false);
      }
    };

    // Add a debounce to prevent too frequent updates
    const timeoutId = setTimeout(() => {
      updateSettings();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [qrSize, qrErrorCorrectionLevel, logoUrl, user?.id]);

  // Handle logo upload
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Maximum file size is 2MB",
      });
      return;
    }

    // Validate file type
    const validTypes = ["image/svg+xml", "image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Only SVG, PNG and JPG files are allowed",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("user-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-assets").getPublicUrl(filePath);

      // Update state with the new logo URL
      setLogoUrl(publicUrl);

      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle logo removal
  const handleRemoveLogo = async () => {
    if (!logoUrl) return;

    try {
      // Extract file path from URL
      const urlParts = logoUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `logos/${fileName}`;

      // Delete file from storage
      const { error } = await supabase.storage
        .from("user-assets")
        .remove([filePath]);

      if (error) throw error;

      // Update state
      setLogoUrl(null);

      toast.success("Logo removed");
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove logo");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    if (
      deleteUsername !== user.email &&
      deleteUsername !== user.user_metadata?.full_name
    ) {
      toast.error("Username doesn't match");
      return;
    }

    setIsDeletingAccount(true);

    try {
      // Update profiles table to queue account for deletion
      const { error } = await supabase
        .from("profiles")
        .update({
          queued_for_delete: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Account scheduled for deletion", {
        description:
          "Your account will be deleted after 14 days. You can cancel by logging in during this period.",
      });

      // Sign out the user
      await supabase.auth.signOut();

      // Close the dialog
      setDeleteDialogOpen(false);

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error queuing account for deletion:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <article className="flex-grow flex flex-col gap-4">
      <h3 className="mt-8 text-lg font-bold text-qrmory-purple-800 uppercase">
        General
      </h3>
      <div className="py-2 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-col gap-4">
          <h4 className="font-sans font-semibold">Default QR Code Size</h4>
          <SVG
            text={"It's not the size that counts!"}
            options={{
              errorCorrectionLevel: qrErrorCorrectionLevel,
              color: { dark: "#78716c", light: "#0000" },
              width: qrSizeLookup[qrSize],
              margin: 1,
            }}
          />
        </div>
        <SelectSwitch
          options={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
          value={qrSize}
          className="w-full max-w-[250px]"
          onChange={(value) => setQRSize(value as string)}
        />
      </div>

      {/* Separator */}
      <div className="w-full h-[1px] bg-stone-200"></div>

      <div className="py-2 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="font-sans font-semibold">Error Correction Level</h4>
          <p className="text-sm text-stone-500">
            Higher levels make QR codes more resistant to damage but increase
            density
          </p>
        </div>
        <SelectSwitch
          options={[
            { value: "L", label: "L" },
            { value: "M", label: "M" },
            { value: "Q", label: "Q" },
            { value: "H", label: "H" },
          ]}
          value={qrErrorCorrectionLevel}
          className="w-full max-w-[250px]"
          onChange={(value) => setQRErrorCorrectionLevel(value as string)}
        />
      </div>

      {/* Separator */}
      <div className="w-full h-[1px] bg-stone-200"></div>

      <h3 className="mt-8 text-lg font-bold text-qrmory-purple-800 uppercase">
        Account
      </h3>

      <div className="py-4 flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="font-sans font-semibold">Default QR Logo</h4>
          <p className="text-sm text-stone-500">
            SVG format is preferred for best quality. PNG and JPG should be
            150×150px.
          </p>
          <p className="text-sm text-stone-500">Maximum file size: 2MB</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center overflow-hidden relative">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Your logo"
                width={96}
                height={96}
                className="object-contain"
              />
            ) : (
              <div className="text-gray-400 text-sm text-center p-2">
                No logo uploaded
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className={`flex items-center gap-1 hover:bg-qrmory-purple-800 text-xs text-qrmory-purple-800 hover:text-white transition-all duration-300 ease-in-out`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <IconUpload size={14} />
              {isUploading ? "Uploading..." : "Upload Logo"}
            </Button>

            {logoUrl && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs text-rose-600 flex items-center gap-1"
                onClick={handleRemoveLogo}
              >
                <IconX size={14} />
                Remove
              </Button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".svg,.png,.jpg,.jpeg"
              onChange={handleLogoUpload}
            />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="w-full h-[1px] bg-stone-200"></div>

      <h3 className="mt-8 text-lg font-bold text-rose-800 uppercase">
        Danger Zone
      </h3>

      {/* Separator */}
      <div className="w-full h-[1px] bg-stone-200"></div>

      <div className="py-2 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="font-sans font-semibold">Delete Account</h4>
          <p className="text-sm text-stone-500">
            This will schedule your account for deletion in 14 days
          </p>
        </div>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="bg-rose-800/30 hover:bg-rose-700 text-rose-800 hover:text-rose-200 hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-rose-800">
                Delete My Account
              </DialogTitle>

              <DialogDescription>
                🚨 Deleting your account will also delete your data and your QR
                Codes. We do not delete your account immediately when you
                confirm below but allow a grace period of 14 days. To cancel
                account deletion within this time, all you need to do is log
                back in and your account will be removed from the deletion
                queue.
              </DialogDescription>

              <DialogDescription className="pt-4 text-stone-900">
                If you still want to go ahead, please type in your username
                exactly as it appears on your profile page to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="py-4 grid grid-cols-4 items-center gap-4 border-y border-stone-200">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={deleteUsername}
                  onChange={(e) => setDeleteUsername(e.target.value)}
                  placeholder={
                    user?.email ||
                    user?.user_metadata?.full_name ||
                    "Your username"
                  }
                  className="col-span-3"
                />
              </div>
              <p className="text-stone-500 text-xs italic">
                Note: Once you confirm deletion, you will be automatically
                logged out.
              </p>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="bg-rose-800/30 hover:bg-rose-700 text-rose-800 hover:text-rose-200 hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ease-in-out"
              >
                {isDeletingAccount ? "Processing..." : "Confirm Deletion"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </article>
  );
}
