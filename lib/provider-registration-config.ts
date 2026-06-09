import type { ProviderRegistrationData, ProviderService } from "./provider-registration-types";

export const serviceSpecialties: Record<ProviderService, string[]> = {
  Chef: ["Arabic", "Malay", "Indian", "Western", "Vegetarian"],
  Maid: ["Cleaning", "Vacuum", "Ironing", "Laundry", "Deep cleaning"],
  Tutor: ["Mathematics", "English", "Science", "BM", "Tamil"],
  Driver: ["Personal driver", "Airport pickup", "Delivery", "Outstation", "Hourly driver"],
  Cleaner: ["Cleaning", "Vacuum", "Ironing", "Laundry", "Deep cleaning"],
  Babysitter: ["Newborn care", "Toddler care", "Feeding", "Homework support", "Night care"],
  Plumber: ["Pipe repair", "Toilet repair", "Water leak", "Installation", "Emergency repair"],
  Electrician: ["Wiring", "Lighting", "Fan installation", "Socket repair", "Emergency repair"],
  Other: ["General help", "On-site support", "Custom requests", "Home visits", "Flexible service"],
};

export const serviceIcons: Record<ProviderService, string> = {
  Chef: "chef",
  Maid: "maid",
  Tutor: "tutor",
  Driver: "driver",
  Cleaner: "cleaner",
  Babysitter: "babysitter",
  Plumber: "plumber",
  Electrician: "electrician",
  Other: "other",
};

export const availabilityDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const timePresets = [
  "Any time",
  "9 AM - 5 PM",
  "8 AM - 8 PM",
  "10 AM - 10 PM",
  "Custom Time",
];

export const documentTypes = [
  "IC / Passport / Driving License",
  "Passport",
  "Driving License",
  "National ID",
];

export const sexOptions = ["Male", "Female"];

export function createEmptyServiceDetails(): ProviderRegistrationData["serviceDetails"] {
  return {
    Chef: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Maid: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Tutor: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Driver: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Cleaner: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Babysitter: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Plumber: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Electrician: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
    Other: {
      yearsExperience: "",
      specialties: [],
      imageCaptions: ["", "", ""],
      imageDataUrls: ["", "", ""],
      certificateCaptions: ["", "", ""],
      certificateDataUrls: ["", "", ""],
      hourlyRate: "",
      dailyRate: "",
    },
  };
}

export function createDefaultProviderRegistration(): ProviderRegistrationData {
  return {
    basicProfile: {
      firstName: "",
      lastName: "",
      sex: "",
      profileImageName: "",
      avatarDataUrl: "",
      marketingName: "",
      dateOfBirth: "",
      residentialAddress: "",
      serviceLocation: "",
      serviceRadius: 15,
    },
    account: {
      email: "",
      phoneCountryCode: "+60",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    selectedServices: [],
    serviceDetails: createEmptyServiceDetails(),
    availability: {
      days: [],
      timePreset: "",
      startTime: "",
      endTime: "",
    },
    providerLocation: {
      radius: 15,
      areaLabel: "",
    },
    verification: {
      phoneOtp: ["", "", "", "", "", ""],
      emailOtp: ["", "", "", "", "", ""],
      documentType: "",
      frontImageName: "",
      frontImageDataUrl: "",
      backImageName: "",
      backImageDataUrl: "",
    },
  };
}
