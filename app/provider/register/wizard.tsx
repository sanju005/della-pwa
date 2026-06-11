"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  availabilityDays,
  createDefaultProviderRegistration,
  documentTypes,
  sexOptions,
  serviceIcons,
  serviceSpecialties,
  timePresets,
} from "@/lib/provider-registration-config";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  ProviderRegistrationData,
  ProviderService,
} from "@/lib/provider-registration-types";
import { providerServices } from "@/lib/provider-registration-types";

type ReverseLocationResponse = {
  label: string;
  formattedAddress?: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  houseNumber?: string;
};

const DynamicLocationPickerMap = dynamic(
  () =>
    import("@/app/_components/location-picker-map").then((module) => ({
      default: module.LocationPickerMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#f5f1fa] text-[13px] font-semibold text-[#4b5563]">
        Loading map...
      </div>
    ),
  }
);

const TODAY_ISO = new Date().toISOString().split("T")[0];

type FlowStep =
  | { type: "basic"; label: string }
  | { type: "services"; label: string }
  | { type: "service-detail"; label: string; service: ProviderService }
  | { type: "availability"; label: string }
  | { type: "location"; label: string }
  | { type: "review"; label: string }
  | { type: "submitted"; label: string }
  | { type: "verification"; label: string }
  | { type: "identity"; label: string }
  | { type: "success"; label: string };

export function ProviderRegistrationWizard() {
  const [data, setData] = useState<ProviderRegistrationData>(
    createDefaultProviderRegistration()
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [registrationId, setRegistrationId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [invalidBasicFields, setInvalidBasicFields] = useState<string[]>([]);
  const [isSubmitting, startTransition] = useTransition();
  const [hasProviderSession, setHasProviderSession] = useState(false);

  const steps = useMemo<FlowStep[]>(() => {
    const dynamicServiceSteps = data.selectedServices.map((service) => ({
      type: "service-detail" as const,
      label: `${service} Service Details`,
      service,
    }));

    return [
      { type: "basic", label: "Basic Profile" },
      { type: "services", label: "Select Services" },
      ...dynamicServiceSteps,
      { type: "availability", label: "Availability" },
      { type: "location", label: "Provider Location" },
      { type: "review", label: "Review & Submit" },
      { type: "submitted", label: "Listing Submitted" },
      { type: "verification", label: "Verification - Step 1" },
      { type: "identity", label: "Verification - Step 2" },
      { type: "success", label: "Success" },
    ];
  }, [data.selectedServices]);

  const activeStep = steps[Math.min(stepIndex, steps.length - 1)];

  const submitRegistration = async () => {
    const response = await fetch("/api/provider/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

        const result = (await response.json()) as
          | {
              id: string;
              status: string;
              phoneVerified: boolean;
              emailVerified: boolean;
              identityVerified: boolean;
              verificationSetupFailed?: boolean;
            }
          | { error?: string };

    if (!response.ok || !("id" in result)) {
      throw new Error(
        "error" in result && result.error
          ? result.error
          : "Unable to submit registration."
      );
    }

    const client = getSupabaseClient();

    if (!client) {
      throw new Error("Supabase is not configured yet.");
    }

    const signInResult = await client.auth.signInWithPassword({
      email: data.account.email.trim().toLowerCase(),
      password: data.account.password,
    });

    if (signInResult.error) {
      throw new Error(signInResult.error.message || "Unable to sign in to the new provider account.");
    }

    setHasProviderSession(true);
    setRegistrationId(result.id);
    return result;
  };

  const goNext = () => {
    if (activeStep.type === "basic") {
      const missingFields = [
        !data.basicProfile.firstName.trim() ? "firstName" : null,
        !data.basicProfile.lastName.trim() ? "lastName" : null,
        !data.basicProfile.sex ? "sex" : null,
        !data.basicProfile.dateOfBirth.trim() ? "dateOfBirth" : null,
        !data.basicProfile.residentialAddress.trim() ? "residentialAddress" : null,
        !data.account.email.trim() ? "email" : null,
        !data.account.phoneNumber.trim() ? "phoneNumber" : null,
        !data.account.password ? "password" : null,
        !data.account.confirmPassword ? "confirmPassword" : null,
      ].filter((value): value is string => Boolean(value));

      if (missingFields.length > 0) {
        setInvalidBasicFields(missingFields);
        setSubmitError("Please fill in all required fields before continuing.");
        return;
      }

      if (data.account.password !== data.account.confirmPassword) {
        setInvalidBasicFields(["password", "confirmPassword"]);
        setSubmitError("Passwords do not match.");
        return;
      }

      if (data.account.password.length < 8) {
        setInvalidBasicFields(["password"]);
        setSubmitError("Password must be at least 8 characters long.");
        return;
      }

      setInvalidBasicFields([]);
      setSubmitError("");
    }

    if (activeStep.type === "services" && data.selectedServices.length === 0) {
      setSubmitError("Please select at least one service before continuing.");
      return;
    }

    if (activeStep.type === "review") {
      startTransition(async () => {
        setSubmitError("");
        try {
          await submitRegistration();
          setStepIndex((current) => Math.min(current + 1, steps.length - 1));
        } catch (error) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Unable to submit registration."
          );
          return;
        }
      });

      return;
    }

    if (activeStep.type === "identity") {
      startTransition(async () => {
        setSubmitError("");

        if (!hasProviderSession) {
          setSubmitError("Please submit the listing first before starting verification.");
          return;
        }

        const client = getSupabaseClient();

        if (!client) {
          setSubmitError("Supabase is not configured yet.");
          return;
        }

        const {
          data: { session },
        } = await client.auth.getSession();

        if (!session) {
          setSubmitError("Your provider session expired. Please log in again.");
          return;
        }

        const response = await fetch("/api/provider/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            phoneVerified: data.verification.phoneOtp.join("") === "123456",
            identityVerified: Boolean(
              data.verification.documentType &&
                data.verification.frontImageName &&
                data.verification.backImageName
            ),
          }),
        });

        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          setSubmitError(result.error || "Unable to submit verification.");
          return;
        }

        setStepIndex((current) => Math.min(current + 1, steps.length - 1));
      });

      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const updateBasic = (
    field: keyof ProviderRegistrationData["basicProfile"],
    value: string | number
  ) => {
    setData((current) => ({
      ...current,
      basicProfile: { ...current.basicProfile, [field]: value },
    }));
  };

  const updateAccount = (
    field: keyof ProviderRegistrationData["account"],
    value: string
  ) => {
    setData((current) => ({
      ...current,
      account: { ...current.account, [field]: value },
    }));
  };

  const toggleService = (service: ProviderService) => {
    setData((current) => {
      const selected = current.selectedServices.includes(service)
        ? current.selectedServices.filter((item) => item !== service)
        : [...current.selectedServices, service];

      return {
        ...current,
        selectedServices: selected,
      };
    });
  };

  const updateServiceDetail = (
    service: ProviderService,
    field: keyof ProviderRegistrationData["serviceDetails"][ProviderService],
    value: string | string[]
  ) => {
    setData((current) => ({
      ...current,
      serviceDetails: {
        ...current.serviceDetails,
        [service]: {
          ...current.serviceDetails[service],
          [field]: value,
        },
      },
    }));
  };

  const toggleSpecialty = (service: ProviderService, specialty: string) => {
    setData((current) => {
      const currentList = current.serviceDetails[service].specialties;
      const nextList = currentList.includes(specialty)
        ? currentList.filter((item) => item !== specialty)
        : [...currentList, specialty];

      return {
        ...current,
        serviceDetails: {
          ...current.serviceDetails,
          [service]: {
            ...current.serviceDetails[service],
            specialties: nextList,
          },
        },
      };
    });
  };

  const toggleAvailabilityDay = (day: string) => {
    setData((current) => {
      const days = current.availability.days.includes(day)
        ? current.availability.days.filter((item) => item !== day)
        : [...current.availability.days, day];

      return {
        ...current,
        availability: {
          ...current.availability,
          days,
        },
      };
    });
  };

  const updateAvailability = (
    field: keyof ProviderRegistrationData["availability"],
    value: string | string[]
  ) => {
    setData((current) => ({
      ...current,
      availability: { ...current.availability, [field]: value },
    }));
  };

  const updateVerification = (
    field: keyof ProviderRegistrationData["verification"],
    value: string | string[]
  ) => {
    setData((current) => ({
      ...current,
      verification: { ...current.verification, [field]: value },
    }));
  };

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#faf7fd]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-4 py-4 sm:justify-center">
        <div className="safe-top safe-bottom-lg overflow-hidden rounded-[34px] border border-[#e6daf1] bg-white shadow-[0_20px_60px_rgba(142,94,181,0.08)]">
          <div className="px-5 pb-6 pt-5">
            <div className="mb-5 flex items-center gap-3">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#111827]"
                  aria-label="Back"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              ) : (
                <span className="inline-flex h-8 w-8" aria-hidden />
              )}
              <div className="min-w-0 flex-1 text-center">
                <h1 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#111827]">
                  {screenHeading(activeStep)}
                </h1>
                <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
                  {screenSubtitle(activeStep)}
                </p>
              </div>
              <span className="inline-flex h-8 w-8" aria-hidden />
            </div>

            <ProgressHeader current={stepIndex} total={steps.length} label={activeStep.label} />

            {activeStep.type === "basic" ? (
              <BasicProfileStep
                data={data}
                updateBasic={updateBasic}
                updateAccount={updateAccount}
                invalidFields={invalidBasicFields}
                clearInvalidField={(field) =>
                  setInvalidBasicFields((current) =>
                    current.filter((item) => item !== field)
                  )
                }
                setSubmitError={setSubmitError}
              />
            ) : null}
            {activeStep.type === "services" ? (
              <SelectServicesStep
                selectedServices={data.selectedServices}
                onToggle={toggleService}
              />
            ) : null}
            {activeStep.type === "service-detail" ? (
              <ServiceDetailsStep
                service={activeStep.service}
                details={data.serviceDetails[activeStep.service]}
                onUpdate={updateServiceDetail}
                onToggleSpecialty={toggleSpecialty}
                setSubmitError={setSubmitError}
              />
            ) : null}
            {activeStep.type === "availability" ? (
              <AvailabilityStep data={data} onToggleDay={toggleAvailabilityDay} onUpdate={updateAvailability} />
            ) : null}
            {activeStep.type === "location" ? (
              <ProviderLocationStep
                data={data}
                setSubmitError={setSubmitError}
                onUpdate={(field, value) =>
                  setData((current) => ({
                    ...current,
                    basicProfile: {
                      ...current.basicProfile,
                      ...(field === "areaLabel"
                        ? { serviceLocation: String(value) }
                        : {}),
                      ...(field === "radius"
                        ? { serviceRadius: Number(value) }
                        : {}),
                    },
                    providerLocation: { ...current.providerLocation, [field]: value },
                  }))
                }
              />
            ) : null}
            {activeStep.type === "review" ? <ReviewStep data={data} /> : null}
            {activeStep.type === "submitted" ? (
              <SubmissionChoiceStep
                registrationId={registrationId}
                onStartVerification={() =>
                  setStepIndex((current) => Math.min(current + 1, steps.length - 1))
                }
              />
            ) : null}
            {activeStep.type === "verification" ? (
              <VerificationStep data={data} onUpdate={updateVerification} />
            ) : null}
            {activeStep.type === "identity" ? (
              <IdentityStep
                data={data}
                onUpdate={updateVerification}
                setSubmitError={setSubmitError}
              />
            ) : null}
            {activeStep.type === "success" ? (
              <SuccessStep data={data} registrationId={registrationId} />
            ) : null}

            {submitError ? (
              <p className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#dc2626]">
                {submitError}
              </p>
            ) : null}

            {activeStep.type !== "success" && activeStep.type !== "submitted" ? (
              <button
                type="button"
                onClick={goNext}
                disabled={isSubmitting}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[12px] bg-[#8E5EB5] text-[15px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.2)]"
              >
                {isSubmitting ? "Submitting..." : buttonLabel(activeStep)}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function BasicProfileStep({
  data,
  updateBasic,
  updateAccount,
  invalidFields,
  clearInvalidField,
  setSubmitError,
}: {
  data: ProviderRegistrationData;
  updateBasic: (
    field: keyof ProviderRegistrationData["basicProfile"],
    value: string | number
  ) => void;
  updateAccount: (
    field: keyof ProviderRegistrationData["account"],
    value: string
  ) => void;
  invalidFields: string[];
  clearInvalidField: (field: string) => void;
  setSubmitError: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please choose a JPG or PNG image for the profile photo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Profile photo must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSubmitError("");
      clearInvalidField("profileImage");
      updateBasic("profileImageName", file.name);
      updateBasic(
        "avatarDataUrl",
        typeof reader.result === "string" ? reader.result : "",
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-[15px] font-semibold text-[#111827]">
          Profile Image
        </span>
        <div className="rounded-[18px] border border-[#d9e2dd] bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)]">
          <div className="flex items-center gap-4">
            <div className="relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f1fa]">
              {data.basicProfile.avatarDataUrl ? (
                <Image
                  src={data.basicProfile.avatarDataUrl}
                  alt="Profile preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <ProfilePhotoIcon className="h-8 w-8 text-[#8E5EB5]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[#111827]">
                Add a profile photo
              </p>
              <p className="mt-1 text-[12px] text-[#6b7280]">
                JPG or PNG, up to 2MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleAvatarChange}
                className="mt-3 block w-full text-[13px] text-[#4b5563] file:mr-3 file:rounded-[10px] file:border-0 file:bg-[#8E5EB5] file:px-3 file:py-2 file:font-bold file:text-white"
              />
            </div>
          </div>
        </div>
      </label>

      <InputField
        label="First Name"
        value={data.basicProfile.firstName}
        invalid={invalidFields.includes("firstName")}
        onChange={(value) => {
          clearInvalidField("firstName");
          updateBasic("firstName", value);
        }}
      />
      <InputField
        label="Last Name"
        value={data.basicProfile.lastName}
        invalid={invalidFields.includes("lastName")}
        onChange={(value) => {
          clearInvalidField("lastName");
          updateBasic("lastName", value);
        }}
      />
      <SelectField
        label="Sex"
        value={data.basicProfile.sex}
        invalid={invalidFields.includes("sex")}
        onChange={(value) => {
          clearInvalidField("sex");
          updateBasic("sex", value);
        }}
        options={sexOptions}
        placeholder="Select sex"
      />
      <InputField label="Marketing Name" hint="e.g. Della Home Chef" value={data.basicProfile.marketingName} onChange={(value) => updateBasic("marketingName", value)} />
      <DateInputField
        label="Date of Birth"
        value={data.basicProfile.dateOfBirth}
        invalid={invalidFields.includes("dateOfBirth")}
        onChange={(value) => {
          clearInvalidField("dateOfBirth");
          updateBasic("dateOfBirth", value);
        }}
      />
      <TextAreaField
        label="Residential Address"
        value={data.basicProfile.residentialAddress}
        invalid={invalidFields.includes("residentialAddress")}
        onChange={(value) => {
          clearInvalidField("residentialAddress");
          updateBasic("residentialAddress", value);
        }}
        rows={3}
      />

      <InputField
        label="Email"
        value={data.account.email}
        invalid={invalidFields.includes("email")}
        onChange={(value) => {
          clearInvalidField("email");
          updateAccount("email", value);
        }}
      />
      <div>
        <p className="mb-2 text-[13px] font-semibold text-[#111827]">Phone</p>
        <div className="flex gap-2">
          <div className="flex h-11 w-[6.2rem] items-center rounded-[12px] border border-[#dfe8e2] px-3 text-[13px]">
            <MalaysiaFlagIcon className="mr-2 h-4 w-6 rounded-[3px]" />
            <span>{data.account.phoneCountryCode}</span>
            <ChevronDownIcon className="ml-auto h-4 w-4 text-[#6b7280]" />
          </div>
          <div className={`flex flex-1 items-center rounded-[12px] border px-4 ${invalidFields.includes("phoneNumber") ? "border-[#ef4444] bg-[#fff5f5]" : "border-[#dfe8e2]"}`}>
            <input
              value={data.account.phoneNumber}
              onChange={(event) => {
                clearInvalidField("phoneNumber");
                updateAccount("phoneNumber", event.target.value);
              }}
              className="h-11 w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none"
            />
          </div>
        </div>
      </div>
      <InputField
        label="Password"
        value={data.account.password}
        invalid={invalidFields.includes("password")}
        onChange={(value) => {
          clearInvalidField("password");
          updateAccount("password", value);
        }}
        rightIcon={<EyeIcon className="h-4 w-4 text-[#6b7280]" />}
        type="password"
      />
      <InputField
        label="Retype Password"
        value={data.account.confirmPassword}
        invalid={invalidFields.includes("confirmPassword")}
        onChange={(value) => {
          clearInvalidField("confirmPassword");
          updateAccount("confirmPassword", value);
        }}
        rightIcon={<EyeIcon className="h-4 w-4 text-[#6b7280]" />}
        type="password"
      />
    </div>
  );
}

function SelectServicesStep({
  selectedServices,
  onToggle,
}: {
  selectedServices: ProviderService[];
  onToggle: (service: ProviderService) => void;
}) {
  return (
    <div className="space-y-3">
      {providerServices.map((service) => {
        const active = selectedServices.includes(service);
        return (
          <button
            key={service}
            type="button"
            onClick={() => onToggle(service)}
            className="flex w-full items-center justify-between rounded-[16px] border border-[#e1e9e4] bg-white px-4 py-4 text-left shadow-[0_8px_20px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f5faf6] text-[#111827]">
                <ServiceIcon kind={serviceIcons[service]} className="h-5 w-5" />
              </span>
              <span className="text-[15px] font-semibold text-[#111827]">{service}</span>
            </div>
            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-[6px] border ${active ? "border-[#8E5EB5] bg-[#8E5EB5] text-white" : "border-[#cfd8d2] bg-white text-transparent"}`}>
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ServiceDetailsStep({
  service,
  details,
  onUpdate,
  onToggleSpecialty,
  setSubmitError,
}: {
  service: ProviderService;
  details: ProviderRegistrationData["serviceDetails"][ProviderService];
  onUpdate: (
    service: ProviderService,
    field: keyof ProviderRegistrationData["serviceDetails"][ProviderService],
    value: string | string[]
  ) => void;
  onToggleSpecialty: (service: ProviderService, specialty: string) => void;
  setSubmitError: (value: string) => void;
}) {
  const specialties = serviceSpecialties[service];

  return (
    <div className="space-y-4">
      <SelectField label="Years of Experience" value={details.yearsExperience} onChange={(value) => onUpdate(service, "yearsExperience", value)} options={["1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "6 Years", "7 Years", "8+ Years"]} />

      <div>
        <p className="mb-2 text-[13px] font-semibold text-[#111827]">{service} Specialties</p>
        <div className="flex flex-wrap gap-2">
          {specialties.map((specialty) => {
            const active = details.specialties.includes(specialty);
            return (
              <button
                key={specialty}
                type="button"
                onClick={() => onToggleSpecialty(service, specialty)}
                className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-[12px] font-semibold ${active ? "border-[#8E5EB5] bg-[#f5f1fa] text-[#8E5EB5]" : "border-[#d8e4dc] bg-white text-[#6b7280]"}`}
              >
                <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] ${active ? "bg-[#8E5EB5] text-white" : "border border-[#d8e4dc] bg-white text-transparent"}`}>
                  <CheckIcon className="h-3 w-3" />
                </span>
                {specialty}
              </button>
            );
          })}
        </div>
      </div>

      <AssetStrip
        label="Service Images"
        captions={details.imageCaptions}
        previews={details.imageDataUrls}
        tone="media"
        onSelect={(index, fileName, dataUrl) => {
          const nextNames = [...details.imageCaptions];
          const nextDataUrls = [...details.imageDataUrls];

          nextNames[index] = fileName;
          nextDataUrls[index] = dataUrl;

          setSubmitError("");
          onUpdate(service, "imageCaptions", nextNames);
          onUpdate(service, "imageDataUrls", nextDataUrls);
        }}
        setSubmitError={setSubmitError}
      />
      <AssetStrip
        label="Certificates"
        captions={details.certificateCaptions}
        previews={details.certificateDataUrls}
        tone="certificate"
        onSelect={(index, fileName, dataUrl) => {
          const nextNames = [...details.certificateCaptions];
          const nextDataUrls = [...details.certificateDataUrls];

          nextNames[index] = fileName;
          nextDataUrls[index] = dataUrl;

          setSubmitError("");
          onUpdate(service, "certificateCaptions", nextNames);
          onUpdate(service, "certificateDataUrls", nextDataUrls);
        }}
        setSubmitError={setSubmitError}
      />

      <div>
        <p className="mb-2 text-[13px] font-semibold text-[#111827]">Rate</p>
        <div className="grid grid-cols-2 gap-3">
          <InputField compact label="Per Hour (RM)" value={details.hourlyRate} onChange={(value) => onUpdate(service, "hourlyRate", value)} />
          <InputField compact label="Per Day (RM)" value={details.dailyRate} onChange={(value) => onUpdate(service, "dailyRate", value)} />
        </div>
      </div>
    </div>
  );
}

function AvailabilityStep({
  data,
  onToggleDay,
  onUpdate,
}: {
  data: ProviderRegistrationData;
  onToggleDay: (day: string) => void;
  onUpdate: (
    field: keyof ProviderRegistrationData["availability"],
    value: string | string[]
  ) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#111827]">Days</p>
          <button
            type="button"
            onClick={() => onUpdate("days", [...availabilityDays])}
            className="text-[12px] font-bold text-[#8E5EB5]"
          >
            Select All
          </button>
        </div>
        <div className="space-y-2">
          {availabilityDays.map((day) => {
            const active = data.availability.days.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => onToggleDay(day)}
                className="flex w-full items-center justify-between rounded-[12px] px-1 py-1 text-left"
              >
                <span className="flex items-center gap-3">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-[6px] border ${active ? "border-[#8E5EB5] bg-[#8E5EB5] text-white" : "border-[#cfd8d2] bg-white text-transparent"}`}>
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[14px] text-[#111827]">{day}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-semibold text-[#111827]">Time</p>
        <div className="space-y-2">
          {timePresets.map((preset) => {
            const active = data.availability.timePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onUpdate("timePreset", preset)}
                className="flex w-full items-center gap-3 rounded-[12px] px-1 py-1 text-left"
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-[#8E5EB5]" : "border-[#cfd8d2]"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-[#8E5EB5]" : "bg-transparent"}`} />
                </span>
                <span className="text-[14px] text-[#111827]">{preset}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputField compact label="Start Time" value={data.availability.startTime} onChange={(value) => onUpdate("startTime", value)} />
        <InputField compact label="End Time" value={data.availability.endTime} onChange={(value) => onUpdate("endTime", value)} />
      </div>
    </div>
  );
}

function ProviderLocationStep({
  data,
  setSubmitError,
  onUpdate,
}: {
  data: ProviderRegistrationData;
  setSubmitError: (value: string) => void;
  onUpdate: (
    field: keyof ProviderRegistrationData["providerLocation"],
    value: string | number
  ) => void;
}) {
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const updateMapLocation = async (latitude: number, longitude: number) => {
    setIsResolvingAddress(true);

    try {
      const response = await fetch(
        `/api/location/reverse?lat=${latitude}&lng=${longitude}`,
        { cache: "no-store" }
      );
      const resolved = (await response.json()) as ReverseLocationResponse;
      const locationLabel =
        resolved.formattedAddress?.trim() ||
        resolved.label?.trim() ||
        `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      onUpdate("latitude", latitude);
      onUpdate("longitude", longitude);
      onUpdate("areaLabel", locationLabel);
      onUpdate("formattedAddress", resolved.formattedAddress?.trim() || locationLabel);
      onUpdate("road", resolved.road?.trim() || "");
      onUpdate("suburb", resolved.suburb?.trim() || "");
      onUpdate("city", resolved.city?.trim() || "");
      onUpdate("state", resolved.state?.trim() || "");
      onUpdate("postcode", resolved.postcode?.trim() || "");
      onUpdate("country", resolved.country?.trim() || "");
      onUpdate("houseNumber", resolved.houseNumber?.trim() || "");
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const requestCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setSubmitError("Location is not supported on this device.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSubmitError("");
        void updateMapLocation(
          position.coords.latitude,
          position.coords.longitude,
        ).finally(() => {
          setIsLocating(false);
        });
      },
      () => {
        setIsLocating(false);
        setSubmitError("Unable to get current location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    if (!data.providerLocation.areaLabel.trim()) {
      requestCurrentLocation();
    }
  }, [data.providerLocation.areaLabel]);

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#dfe8e2] bg-[#f6fbf7] p-4">
        <div className="space-y-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-6 text-[#111827] break-words">
              {isResolvingAddress
                ? "Updating address..."
                : data.providerLocation.areaLabel || "Current location not loaded yet."}
            </p>
            <p className="mt-1 text-[12px] leading-5 text-[#6b7280]">
              Providers will be visible to users inside this service radius.
            </p>
          </div>
          <button
            type="button"
            onClick={requestCurrentLocation}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-white px-4 text-[13px] font-bold text-[#8E5EB5] shadow-[0_8px_20px_rgba(15,23,42,0.03)] sm:w-auto"
          >
            <PinIcon className="h-4 w-4" />
            {isLocating ? "Locating..." : "Use Current Location"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#dfe8e2] bg-[linear-gradient(180deg,#f7fbf7_0%,#eff7ef_100%)]">
        <div className="relative h-[18rem] overflow-hidden">
          <DynamicLocationPickerMap
            latitude={data.providerLocation.latitude}
            longitude={data.providerLocation.longitude}
            radiusKm={data.providerLocation.radius}
            onChange={({ latitude, longitude }) => {
              void updateMapLocation(latitude, longitude);
            }}
          />
          <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-[13px] font-bold text-[#8E5EB5] shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
            {data.providerLocation.radius} KM
          </span>
          <span className="absolute bottom-4 left-4 right-4 rounded-[12px] bg-white/92 px-3 py-2 text-[13px] font-medium text-[#111827] shadow-[0_8px_18px_rgba(15,23,42,0.08)]">
            {isResolvingAddress
              ? "Updating address..."
              : data.providerLocation.areaLabel || "Current location not loaded yet."}
          </span>
        </div>
      </div>

      <RangeField
        label="Service Radius"
        value={data.providerLocation.radius}
        min={5}
        max={30}
        suffix="KM"
        onChange={(value) => onUpdate("radius", value)}
      />
    </div>
  );
}

function ReviewStep({ data }: { data: ProviderRegistrationData }) {
  return (
    <div className="space-y-5">
      <ReviewCard title="Profile">
        <ReviewLine icon={<UserIcon className="h-4 w-4" />} text={`${getProviderFullName(data)} (${data.basicProfile.marketingName})`} />
        <ReviewLine icon={<UserIcon className="h-4 w-4" />} text={`Sex: ${data.basicProfile.sex || "Not selected"}`} />
        <ReviewLine icon={<PhoneIcon className="h-4 w-4" />} text={`${data.account.phoneCountryCode} ${data.account.phoneNumber}`} />
        <ReviewLine icon={<PinIcon className="h-4 w-4" />} text={data.basicProfile.serviceLocation} />
        <ReviewLine icon={<RangeIcon className="h-4 w-4" />} text={`${data.providerLocation.radius} KM`} />
      </ReviewCard>

      <ReviewCard title="Services">
        <div className="space-y-4">
          {data.selectedServices.map((service) => {
            const details = data.serviceDetails[service];
            return (
              <div key={service} className="border-t border-[#ecf1ed] pt-4 first:border-t-0 first:pt-0">
                <h3 className="text-[14px] font-extrabold text-[#111827]">{service}</h3>
                <p className="mt-1 text-[13px] text-[#4b5563]">
                  RM{details.hourlyRate}/hr - RM{details.dailyRate}/day
                </p>
                <p className="mt-1 text-[13px] text-[#4b5563]">{details.yearsExperience} Exp</p>
              </div>
            );
          })}
        </div>
      </ReviewCard>

      <ReviewCard title="Availability">
        <p className="text-[13px] text-[#374151]">
          {formatAvailabilityDays(data.availability.days)} - {data.availability.timePreset === "Custom Time" ? `${data.availability.startTime} - ${data.availability.endTime}` : data.availability.timePreset}
        </p>
      </ReviewCard>
    </div>
  );
}

function VerificationStep({
  data,
  onUpdate,
}: {
  data: ProviderRegistrationData;
  onUpdate: (
    field: keyof ProviderRegistrationData["verification"],
    value: string | string[]
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <OtpGroup
        label="Phone Number Verification"
        value={`${data.account.phoneCountryCode} ${data.account.phoneNumber}`}
        otp={data.verification.phoneOtp}
        onChange={(next) => onUpdate("phoneOtp", next)}
      />
      <OtpGroup
        label="Email Verification"
        value={data.account.email}
        otp={data.verification.emailOtp}
        onChange={(next) => onUpdate("emailOtp", next)}
      />
    </div>
  );
}

function IdentityStep({
  data,
  onUpdate,
  setSubmitError,
}: {
  data: ProviderRegistrationData;
  onUpdate: (
    field: keyof ProviderRegistrationData["verification"],
    value: string | string[]
  ) => void;
  setSubmitError: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <SelectField
        label="Document Type"
        value={data.verification.documentType}
        onChange={(value) => onUpdate("documentType", value)}
        options={documentTypes}
      />
      <UploadCard
        label="Upload Document (Front)"
        fileName={data.verification.frontImageName}
        preview={data.verification.frontImageDataUrl}
        onSelect={(fileName, dataUrl) => {
          setSubmitError("");
          onUpdate("frontImageName", fileName);
          onUpdate("frontImageDataUrl", dataUrl);
        }}
        setSubmitError={setSubmitError}
      />
      <UploadCard
        label="Upload Document (Back)"
        fileName={data.verification.backImageName}
        preview={data.verification.backImageDataUrl}
        onSelect={(fileName, dataUrl) => {
          setSubmitError("");
          onUpdate("backImageName", fileName);
          onUpdate("backImageDataUrl", dataUrl);
        }}
        setSubmitError={setSubmitError}
      />
    </div>
  );
}

function SuccessStep({
  data,
  registrationId,
}: {
  data: ProviderRegistrationData;
  registrationId: string;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[20px] border border-[#e4ece7] bg-white p-5 text-center shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#8E5EB5] text-white shadow-[0_18px_30px_rgba(142,94,181,0.22)]">
          <CheckIcon className="h-10 w-10" />
        </div>
        <h2 className="mt-5 text-[24px] font-extrabold tracking-[-0.04em] text-[#111827]">
          Verification Submitted
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-[#4b5563]">
          Your verification details were submitted successfully. Your listing can stay visible while checks are in progress.
        </p>
      </div>

      <div className="rounded-[20px] border border-[#e4ece7] bg-[linear-gradient(180deg,#fcfffd_0%,#f4fbf5_100%)] p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <h3 className="text-[22px] font-extrabold tracking-[-0.04em] text-[#8E5EB5]">
          Registration Summary
        </h3>
        <p className="mt-1 text-[13px] text-[#4b5563]">
          These are the actual details sent from this form.
        </p>

        <div className="mt-4 rounded-[16px] border border-[#bfe8c9] bg-white p-4">
          <div className="space-y-3 text-[13px] text-[#374151]">
            <ReviewLine
              icon={<UserIcon className="h-4 w-4" />}
              text={getProviderFullName(data) || "No name provided"}
            />
            <ReviewLine
              icon={<PinIcon className="h-4 w-4" />}
              text={data.providerLocation.areaLabel || data.basicProfile.serviceLocation || "No service area selected"}
            />
            <ReviewLine
              icon={<RangeIcon className="h-4 w-4" />}
              text={`${data.providerLocation.radius} KM service radius`}
            />
            <ReviewLine
              icon={<PhoneIcon className="h-4 w-4" />}
              text={`${data.account.phoneCountryCode} ${data.account.phoneNumber}`}
            />
            <ReviewLine
              icon={<CheckIcon className="h-4 w-4" />}
              text={`Registration ID: ${registrationId || "Pending"}`}
            />
          </div>
        </div>

        <div className="mt-4 rounded-[16px] border border-[#dfe8e2] bg-white p-4">
          <h4 className="text-[15px] font-extrabold text-[#111827]">Selected Services</h4>
          <div className="mt-3 space-y-2">
            {data.selectedServices.map((service) => {
              const details = data.serviceDetails[service];

              return (
                <p key={service} className="text-[13px] text-[#374151]">
                  {service}: RM{details.hourlyRate || "0"}/hr, RM
                  {details.dailyRate || "0"}/day
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <Link
        href="/provider/dashboard"
        className="inline-flex h-12 w-full items-center justify-center rounded-[12px] bg-[#8E5EB5] text-[15px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.2)]"
      >
        View My Profile
      </Link>
    </div>
  );
}

function SubmissionChoiceStep({
  registrationId,
  onStartVerification,
}: {
  registrationId: string;
  onStartVerification: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[22px] border border-[#d7efdd] bg-[linear-gradient(180deg,#fbfffc_0%,#f2fbf4_100%)] p-6 text-center shadow-[0_16px_36px_rgba(22,163,74,0.08)]">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#8E5EB5]/15" />
          <span className="absolute inset-2 rounded-full bg-[#8E5EB5]/10" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#8E5EB5] text-white shadow-[0_18px_30px_rgba(142,94,181,0.24)]">
            <CheckIcon className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-5 text-[24px] font-extrabold tracking-[-0.04em] text-[#111827]">
          Your Listing Has Been Submitted
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-[#4b5563]">
          Registration ID: {registrationId || "Pending"}.
          Verify your account now, or go straight to your own profile.
        </p>
      </div>

      <button
        type="button"
        onClick={onStartVerification}
        className="inline-flex h-12 w-full items-center justify-center rounded-[12px] bg-[#8E5EB5] text-[15px] font-extrabold text-white shadow-[0_16px_30px_rgba(142,94,181,0.2)]"
      >
        Verify Account
      </button>

      <Link
        href="/provider/dashboard"
        className="inline-flex h-12 w-full items-center justify-center rounded-[12px] border border-[#d8e4dc] bg-white text-[15px] font-extrabold text-[#111827] shadow-[0_10px_22px_rgba(15,23,42,0.04)]"
      >
        Go to Profile
      </Link>
    </div>
  );
}

function ProgressHeader({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="font-bold text-[#8E5EB5]">Step {current + 1}</span>
        <span className="text-[#6b7280]">{current + 1}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-[#e6ece8]">
        <div
          className="h-2 rounded-full bg-[#8E5EB5]"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-[12px] font-semibold text-[#111827]">{label}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  hint,
  rightIcon,
  compact = false,
  type = "text",
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rightIcon?: React.ReactNode;
  compact?: boolean;
  type?: string;
  invalid?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
        {label}
      </span>
      {hint ? <p className="-mt-1 mb-2 text-[11px] text-[#6b7280]">{hint}</p> : null}
      <div className={`flex items-center rounded-[12px] border px-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)] ${invalid ? "border-[#ef4444] bg-[#fff5f5]" : "border-[#dfe8e2]"}`}>
        <input
          type={isPasswordField && showPassword ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${compact ? "h-10" : "h-11"} w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none`}
        />
        {rightIcon ? (
          <button
            type="button"
            aria-label={isPasswordField && showPassword ? "Hide password" : "Show password"}
            onClick={() => {
              if (isPasswordField) {
                setShowPassword((current) => !current);
              }
            }}
            className="ml-3"
          >
            {rightIcon}
          </button>
        ) : null}
      </div>
    </label>
  );
}

function DateInputField({
  label,
  value,
  onChange,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current as (HTMLInputElement & {
      showPicker?: () => void;
    }) | null;

    if (!input) {
      return;
    }

    input.focus();
    input.showPicker?.();
  };

  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
        {label}
      </span>
      <div className={`flex items-center rounded-[12px] border px-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)] ${invalid ? "border-[#ef4444] bg-[#fff5f5]" : "border-[#dfe8e2]"}`}>
        <input
          ref={inputRef}
          type="date"
          max={TODAY_ISO}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onClick={openPicker}
          className="h-11 w-full border-0 bg-transparent text-[14px] text-[#111827] outline-none"
        />
        <button
          type="button"
          onClick={openPicker}
          aria-label="Open date picker"
          className="ml-3 text-[#6b7280]"
        >
          <CalendarIcon className="h-4 w-4 text-[#6b7280]" />
        </button>
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#111827]">
        {label}
      </span>
      <div className={`rounded-[12px] border px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.03)] ${invalid ? "border-[#ef4444] bg-[#fff5f5]" : "border-[#dfe8e2]"}`}>
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full resize-none border-0 bg-transparent text-[14px] text-[#111827] outline-none"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  invalid = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#111827]">{label}</span>
      <div className={`flex items-center rounded-[12px] border px-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)] ${invalid ? "border-[#ef4444] bg-[#fff5f5]" : "border-[#dfe8e2]"}`}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none border-0 bg-transparent text-[14px] text-[#111827] outline-none"
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="ml-3 h-4 w-4 text-[#6b7280]" />
      </div>
    </label>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-[#111827]">
        <span>{label}</span>
        <span className="text-[12px] text-[#111827]">
          {value} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-[#8E5EB5]"
      />
      <div className="mt-1 flex justify-between text-[11px] text-[#6b7280]">
        <span>{min} {suffix}</span>
        <span>{max} {suffix}</span>
      </div>
    </div>
  );
}

function AssetStrip({
  label,
  captions,
  previews,
  tone,
  onSelect,
  setSubmitError,
}: {
  label: string;
  captions: string[];
  previews: string[];
  tone: "media" | "certificate";
  onSelect: (index: number, fileName: string, dataUrl: string) => void;
  setSubmitError: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {captions.map((caption, index) => (
          <AssetUploadSlot
            key={`${label}-${index}`}
            index={index}
            fileName={caption}
            preview={previews[index] ?? ""}
            tone={tone}
            onSelect={onSelect}
            setSubmitError={setSubmitError}
          />
        ))}
      </div>
    </div>
  );
}

function AssetUploadSlot({
  index,
  fileName,
  preview,
  tone,
  onSelect,
  setSubmitError,
}: {
  index: number;
  fileName: string;
  preview: string;
  tone: "media" | "certificate";
  onSelect: (index: number, fileName: string, dataUrl: string) => void;
  setSubmitError: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please choose a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Each upload must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onSelect(index, file.name, typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-[14px] border border-[#dfe8e2] bg-white p-3 shadow-[0_8px_18px_rgba(15,23,42,0.03)]">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full text-left"
      >
        <div
          className={`relative flex h-24 items-center justify-center overflow-hidden rounded-[12px] border border-[#e1e9e4] ${
            preview ? "bg-white" : "bg-[#f8fbf8]"
          }`}
        >
          {preview ? (
            <Image
              src={preview}
              alt={fileName || `Upload ${index + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <PlusIcon className="h-6 w-6 text-[#8E5EB5]" />
          )}
        </div>
        <p className="mt-2 truncate text-[12px] font-semibold text-[#111827]">
          {fileName || `Upload ${tone === "media" ? "image" : "certificate"} ${index + 1}`}
        </p>
      </button>
    </div>
  );
}

function ReviewCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-[#e4ece7] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <h3 className="text-[14px] font-extrabold text-[#111827]">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ReviewLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1 text-[13px] text-[#374151]">
      <span className="text-[#111827]">{icon}</span>
      {text}
    </div>
  );
}

function OtpGroup({
  label,
  value,
  otp,
  onChange,
}: {
  label: string;
  value: string;
  otp: string[];
  onChange: (otp: string[]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</p>
      <p className="mb-3 text-[13px] text-[#374151]">{value}</p>
      <div className="grid grid-cols-6 gap-2">
        {otp.map((digit, index) => (
          <input
            key={`${label}-${index}`}
            value={digit}
            onChange={(event) => {
              const next = [...otp];
              next[index] = event.target.value.slice(-1);
              onChange(next);
            }}
            className="h-11 rounded-[10px] border border-[#dfe8e2] text-center text-[15px] font-semibold text-[#111827] outline-none"
          />
        ))}
      </div>
      <p className="mt-3 text-[12px] font-semibold text-[#8E5EB5]">Resend OTP (0:30)</p>
    </div>
  );
}

function UploadCard({
  label,
  fileName,
  preview,
  onSelect,
  setSubmitError,
}: {
  label: string;
  fileName: string;
  preview: string;
  onSelect: (fileName: string, dataUrl: string) => void;
  setSubmitError: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please choose a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Each upload must be 5MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onSelect(file.name, typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold text-[#111827]">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-32 w-full flex-col items-center justify-center rounded-[16px] border border-[#dfe8e2] bg-[linear-gradient(180deg,#fcfffd_0%,#f3fbf4_100%)]"
      >
        {preview ? (
          <div className="relative h-full w-full overflow-hidden rounded-[16px]">
            <Image
              src={preview}
              alt={fileName || label}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <>
            <UploadIcon className="h-8 w-8 text-[#8E5EB5]" />
            <p className="mt-3 text-[14px] font-bold text-[#111827]">Upload Image</p>
            <p className="mt-1 text-[12px] text-[#6b7280]">JPG, PNG (Max 5MB)</p>
          </>
        )}
      </button>
      {fileName ? (
        <p className="mt-2 truncate text-[12px] font-semibold text-[#111827]">
          {fileName}
        </p>
      ) : null}
    </div>
  );
}

function buttonLabel(step: FlowStep) {
  switch (step.type) {
    case "service-detail":
      return "Save Service";
    case "location":
      return "Confirm Location";
    case "review":
      return "Submit for Listing";
    case "identity":
      return "Submit Verification";
    case "verification":
      return "Continue";
    default:
      return "Continue";
  }
}

function getProviderFullName(data: ProviderRegistrationData) {
  return [data.basicProfile.firstName, data.basicProfile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function screenHeading(step: FlowStep) {
  switch (step.type) {
    case "basic":
      return "Create Your Profile";
    case "services":
      return "Select Services";
    case "service-detail":
      return `${step.service} Service`;
    case "availability":
      return "Availability";
    case "location":
      return "Provider Location";
    case "review":
      return "Review & Submit";
    case "submitted":
      return "Listing Submitted";
    case "verification":
      return "Verify Your Account";
    case "identity":
      return "Verify Your Identity";
    case "success":
      return "Profile Submitted";
  }
}

function screenSubtitle(step: FlowStep) {
  switch (step.type) {
    case "basic":
      return "Add your profile, contact, and login details";
    case "services":
      return "Select one or more services you provide";
    case "service-detail":
      return "Add details about your service";
    case "availability":
      return "Select your available days and time";
    case "location":
      return "Set your service area";
    case "review":
      return "Please review your information";
    case "submitted":
      return "Choose whether to verify now or later";
    case "verification":
      return "Let's verify your contact information";
    case "identity":
      return "Upload your identity document";
    case "success":
      return "Verification saved successfully";
  }
}

function formatAvailabilityDays(days: string[]) {
  if (days.length === 7) {
    return "Mon - Sun";
  }
  if (days.length === 0) {
    return "No days selected";
  }
  return days.join(", ");
}

function mediaThumbClasses(index: number) {
  const classes = [
    "bg-[linear-gradient(135deg,#b45309_0%,#f59e0b_100%)]",
    "bg-[linear-gradient(135deg,#78350f_0%,#f97316_100%)]",
    "bg-[linear-gradient(135deg,#9a3412_0%,#f59e0b_100%)]",
  ];

  return classes[index] ?? "bg-[linear-gradient(135deg,#d1d5db_0%,#9ca3af_100%)]";
}

function iconClass(className?: string) {
  return className ?? "h-5 w-5";
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" className={iconClass(className)}>
      <path d="M15 18 9 12l6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={iconClass(className)}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleFilledIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass(className)}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm-1 14-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.7-3 4.4-4.5 8-4.5s6.3 1.5 8 4.5" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M6.6 3h3.1l1.2 4.6-1.8 1.8a15 15 0 0 0 5.4 5.4l1.8-1.8L21 14.3v3.1c0 .9-.7 1.6-1.6 1.6C10.8 19 5 13.2 5 6.6 5 5.7 5.7 5 6.6 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={iconClass(className)}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M12 16V5m0 0-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" strokeLinecap="round" />
    </svg>
  );
}

function RangeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M4 12h16" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ProfilePhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass(className)}>
      <path d="M4 7h4l1.5-2h5L16 7h4v12H4z" />
      <circle cx="12" cy="13" r="4" />
      <path d="M18 4v4M16 6h4" strokeLinecap="round" />
    </svg>
  );
}

function MalaysiaFlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" className={className}>
      <rect width="28" height="20" rx="3" fill="#ffffff" />
      <path d="M0 0h14v10H0z" fill="#1d4ed8" />
      <path d="M0 0h28v2H0zm0 4h28v2H0zm0 8h28v2H0zm0 12h28v2H0z" fill="#ef4444" />
      <path d="M0 8h28v2H0zm0 8h28v2H0z" fill="#ef4444" />
      <circle cx="7" cy="5" r="3.3" fill="#facc15" />
      <circle cx="8.1" cy="5" r="2.6" fill="#1d4ed8" />
      <path d="m10.2 2.4.6 1.5 1.6.1-1.2 1 .4 1.5-1.4-.8-1.4.8.4-1.5-1.2-1 1.6-.1.6-1.5Z" fill="#facc15" />
    </svg>
  );
}

function ServiceIcon({
  kind,
  className,
}: {
  kind: string;
  className?: string;
}) {
  switch (kind) {
    case "chef":
      return <ChefHatIcon className={className} />;
    case "maid":
    case "cleaner":
      return <CleaningIcon className={className} />;
    case "driver":
      return <CarIcon className={className} />;
    case "tutor":
      return <TutorIcon className={className} />;
    case "babysitter":
      return <BabyIcon className={className} />;
    case "plumber":
      return <WrenchIcon className={className} />;
    case "electrician":
      return <BoltIcon className={className} />;
    default:
      return <DotsGroupIcon className={className} />;
  }
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M8 10a3 3 0 1 1 0-6 3.7 3.7 0 0 1 4 2 3.8 3.8 0 0 1 6 3 3 3 0 0 1-2 5H8a3 3 0 0 1 0-4Z" />
      <path d="M9 14v4h6v-4" strokeLinecap="round" />
    </svg>
  );
}

function CleaningIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M6 21h8M10 3l6 6-8 8-3-3 8-8Z" />
      <path d="M14 7 8 13" strokeLinecap="round" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M5 16V9l2-3h10l2 3v7" />
      <path d="M3 13h18M7 16a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </svg>
  );
}

function TutorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="m4 7 8-3 8 3-8 3-8-3Zm2 3v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  );
}

function BabyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <circle cx="12" cy="8" r="3" />
      <path d="M8 20v-3a4 4 0 0 1 8 0v3M10 4c1 0 1.5-1 2-2 0 .8.8 2 2 2" strokeLinecap="round" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="m14 7 3-3a3 3 0 1 1 3 3l-3 3" />
      <path d="m5 19 8-8 3 3-8 8H5v-3Z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={iconClass(className)}>
      <path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotsGroupIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass(className)}>
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
      <circle cx="16" cy="16" r="2" />
    </svg>
  );
}
