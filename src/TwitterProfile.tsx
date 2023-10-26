import * as React from "react";

import ProfileImage from "./profile.jpeg";

export default function TwitterProfile() {
  return (
    <div>
      <div className="flex sm:justify-center sm:items-center">
        <div className="flex-shrink-0">
          <img
            src={ProfileImage}
            alt="vicapow"
            className="h-16 w-16 rounded-full"
          />
        </div>
        <div className="ml-4">
          <h2 className="text-md font-semibold">By Victor Powell</h2>
          <p className="text-gray-600">@vicapow</p>
        </div>
      </div>
    </div>
  );
}
