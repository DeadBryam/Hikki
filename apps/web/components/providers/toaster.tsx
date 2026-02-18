"use client";

import { Toaster as SileoToaster } from "sileo";

const Toaster = () => (
  <SileoToaster
    options={{
      fill: "#262626",
      autopilot: true,
    }}
    position="top-right"
  />
);

export { Toaster };
