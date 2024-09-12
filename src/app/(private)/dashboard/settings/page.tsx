"use client";

import React, { useState } from "react";
import { IconHome } from "@tabler/icons-react";
import { useQRCode } from "next-qrcode";
import SelectSwitch from "@/components/SelectSwitch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Setting {
  name: string;
  icon: React.JSX.Element;
}

interface QRSizes {
  [key: string]: number;
}

export default function SettingsPage() {
  // Hooks
  const { SVG } = useQRCode();

  // States
  const [selectedSettings, setSelectedSettings] = useState<string>("general");
  const [qrSize, setQRSize] = useState<string>("medium");
  const [qrErrorCorrectionLevel, setQRErrorCorrectionLevel] =
    useState<string>("M");

  // Variables
  const qrSizeLookup: QRSizes = {
    small: 60,
    medium: 90,
    large: 180,
  };

  const availableSettings: Setting[] = [
    {
      name: "General",
      icon: <IconHome size={24} />,
    },
    {
      name: "Billing",
      icon: <IconHome size={24} />,
    },
  ];

  return (
    <div className={`flex flex-col w-full`}>
      <h1 className={`mb-4 text-xl font-bold`}>Settings</h1>
      <section className={`flex gap-3 h-full`}>
        {/*/!* TODO Sprint#2: Settings Navigation *!/*/}
        {/*<article className={`flex flex-col gap-2`}>*/}
        {/*  <div className={`flex items-center gap-1 font-bold`}>*/}
        {/*    <IconHome size={24} /> General*/}
        {/*  </div>*/}
        {/*</article>*/}

        <article className={`flex-grow flex flex-col gap-4`}>
          <h3
            className={`mt-8 text-lg font-bold text-qrmory-purple-800 uppercase`}
          >
            General
          </h3>
          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <div className={`flex flex-col gap-4`}>
              <h4 className={`font-sans font-semibold`}>
                Default QR Code Size
              </h4>
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
              className={`w-full max-w-[250px]`}
              onChange={(value) => setQRSize(value as string)}
            />
          </div>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <h4 className={`font-sans font-semibold`}>
              Error Correction Level
            </h4>
            {/* TODO Sprint#2: Explain Error Correction Levels */}
            <SelectSwitch
              options={[
                { value: "L", label: "L" },
                { value: "M", label: "M" },
                { value: "Q", label: "Q" },
                { value: "H", label: "H" },
              ]}
              value={qrErrorCorrectionLevel}
              className={`w-full max-w-[250px]`}
              onChange={(value) => setQRErrorCorrectionLevel(value as string)}
            />
          </div>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <h3
            className={`mt-8 text-lg font-bold text-qrmory-purple-800 uppercase`}
          >
            Account
          </h3>

          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <h4 className={`font-sans font-semibold`}>Default Logo</h4>
            <div className={`w-12 h-12 bg-stone-400`}></div>
          </div>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <h4 className={`font-sans font-semibold`}>Change Password</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"default"}
                  className={`bg-qrmory-purple-800 hover:bg-qrmory-purple-400 hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ease-in-out`}
                >
                  Edit Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    To change your password, please enter your current password
                    and choose a new one. Make sure it's strong💪
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Current Password{" "}
                    </Label>
                    <Input
                      id="name"
                      defaultValue="Pedro Duarte"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      New Password
                    </Label>
                    <Input
                      id="username"
                      defaultValue="@peduarte"
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Confirm New Password
                    </Label>
                    <Input
                      id="username"
                      defaultValue="@peduarte"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <h3 className={`mt-8 text-lg font-bold text-rose-800 uppercase`}>
            Danger Zone
          </h3>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <h4 className={`font-sans font-semibold`}>Deactivate Account</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"destructive"}
                  className={`bg-rose-800/30 hover:bg-rose-700 text-rose-800 hover:text-rose-200 hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ease-in-out`}
                >
                  Deactivate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className={`text-rose-800`}>
                    Deactivate My Account
                  </DialogTitle>
                  <DialogDescription>
                    ⚠️ Deactivating your account will not delete your data but
                    your QR Codes will no longer be accessible. To re-activate
                    your account, all you need to do is log back in and your
                    account will be automatically reactivated.
                  </DialogDescription>

                  <DialogDescription className={`pt-4 text-stone-900`}>
                    If you still want to go ahead and deactivate your account,
                    please type in your username exactly as it appears on your
                    profile page.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2 grid gap-4">
                  <div className="py-4 grid grid-cols-4 items-center gap-4 border-y border-stone-200">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      defaultValue="peduarte"
                      className="col-span-3"
                    />
                  </div>
                  <p className={`text-stone-500 text-xs italic`}>
                    Note: Once you confirm deactivation, you will be
                    automatically logged out.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    variant={"destructive"}
                    className={`bg-rose-800/30 hover:bg-rose-700 text-rose-800 hover:text-rose-200 hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ease-in-out`}
                  >
                    Confirm Deactivation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <h4 className={`font-sans font-semibold`}>Delete Account</h4>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={"destructive"}
                  className={`bg-rose-800/30 hover:bg-rose-700 text-rose-800 hover:text-rose-200 hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ease-in-out`}
                >
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className={`text-rose-800`}>
                    Delete My Account
                  </DialogTitle>

                  <DialogDescription>
                    🚨 Deleting your account will also delete your data and your
                    QR Codes. We do not delete your account immediately when you
                    confirm below but allow a grace period of 7 calendar days.
                    To cancel account deletion within this time, all you need to
                    do is log back in and your account will be removed from the
                    deletion queue.
                  </DialogDescription>

                  <DialogDescription className={`pt-4 text-stone-900`}>
                    If you still want to go ahead and delete your account,
                    please type in your username exactly as it appears on your
                    profile page.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="py-4 grid grid-cols-4 items-center gap-4 border-y border-stone-200">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      defaultValue="peduarte"
                      className="col-span-3"
                    />
                  </div>
                  <p className={`text-stone-500 text-xs italic`}>
                    Note: Once you confirm deletion, you will be automatically
                    logged out.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    variant={"destructive"}
                    className={`bg-rose-800/30 hover:bg-rose-700 text-rose-800 hover:text-rose-200 hover:translate-x-1 hover:-translate-y-1 transition-all duration-300 ease-in-out`}
                  >
                    Confirm Deletion
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {/*<div>Email Notifications</div>*/}
        </article>
      </section>
    </div>
  );
}
