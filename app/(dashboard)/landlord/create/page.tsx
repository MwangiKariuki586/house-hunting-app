// Create Listing page for VerifiedNyumba
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  X,
  Loader2,
  MapPin,
  Home,
  DollarSign,
  Settings2,
  ImagePlus,
  Check,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  cn,
  propertyTypeLabels,
  buildingTypeLabels,
  waterTypeLabels,
  electricityTypeLabels,
} from "@/app/lib/utils";
import {
  createListingSchema,
  type CreateListingInput,
  kenyanAreas,
  amenitiesList,
} from "@/app/lib/validations/listing";

type Step = "basics" | "location" | "pricing" | "features" | "photos";

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "basics", label: "Basic Info", icon: <Home className="h-4 w-4" /> },
  { id: "location", label: "Location", icon: <MapPin className="h-4 w-4" /> },
  { id: "pricing", label: "Pricing", icon: <DollarSign className="h-4 w-4" /> },
  {
    id: "features",
    label: "Features",
    icon: <Settings2 className="h-4 w-4" />,
  },
  { id: "photos", label: "Photos", icon: <ImagePlus className="h-4 w-4" /> },
];

interface UploadedPhoto {
  url: string;
  publicId: string;
  isMain: boolean;
}

export default function CreateListingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<Step>("basics");
  const [error, setError] = React.useState("");
  const [photos, setPhotos] = React.useState<UploadedPhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  type FormData = {
    title: string;
    description: string;
    area: string;
    estate: string;
    landmark: string;
    address: string;
    distanceToCBD: number | undefined;
    distanceToStage: number | undefined;
    propertyType: string;
    buildingType: string;
    bedrooms: number;
    bathrooms: number;
    monthlyRent: number;
    deposit: number;
    serviceCharge: number;
    waterCharge: number;
    garbageCharge: number;
    waterType: string;
    electricityType: string;
    parking: boolean;
    parkingSpaces: number;
    petsAllowed: boolean;
    familyFriendly: boolean;
    bachelorFriendly: boolean;
    gatedCommunity: boolean;
    furnished: boolean;
    amenities: string[];
    dailyRentAvailable: boolean;
    weeklyRentAvailable: boolean;
    dailyRent: number | undefined;
    weeklyRent: number | undefined;
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      area: "",
      estate: "",
      landmark: "",
      address: "",
      distanceToCBD: undefined,
      distanceToStage: undefined,
      propertyType: "ONE_BEDROOM",
      buildingType: "APARTMENT",
      bedrooms: 1,
      bathrooms: 1,
      monthlyRent: 0,
      deposit: 0,
      serviceCharge: 0,
      waterCharge: 0,
      garbageCharge: 0,
      waterType: "COUNCIL",
      electricityType: "TOKEN",
      parking: false,
      parkingSpaces: 0,
      petsAllowed: false,
      familyFriendly: true,
      bachelorFriendly: true,
      gatedCommunity: false,
      furnished: false,
      amenities: [],
      dailyRentAvailable: false,
      weeklyRentAvailable: false,
      dailyRent: undefined,
      weeklyRent: undefined,
    },
  });

  const selectedAmenities = watch("amenities") || [];

  const toggleAmenity = (amenity: string) => {
    const current = selectedAmenities;
    if (current.includes(amenity)) {
      setValue(
        "amenities",
        current.filter((a) => a !== amenity)
      );
    } else {
      setValue("amenities", [...current, amenity]);
    }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const maxPhotos = 10;
    if (photos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploadingPhoto(true);
    setError("");

    for (const file of Array.from(files)) {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("Each photo must be less than 10MB");
        continue;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, and WebP images are allowed");
        continue;
      }

      try {
        // Convert to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const res = await fetch("/api/listings/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64 }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Upload failed");
          continue;
        }

        const data = await res.json();
        setPhotos((prev) => [
          ...prev,
          {
            url: data.url,
            publicId: data.publicId,
            isMain: prev.length === 0, // First photo is main
          },
        ]);
      } catch {
        setError("Photo upload failed");
      }
    }

    setUploadingPhoto(false);
  };

  const removePhoto = async (publicId: string) => {
    try {
      await fetch("/api/listings/photos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });

      setPhotos((prev) => {
        const filtered = prev.filter((p) => p.publicId !== publicId);
        // If we removed the main photo, make the first one main
        if (filtered.length > 0 && !filtered.some((p) => p.isMain)) {
          filtered[0].isMain = true;
        }
        return filtered;
      });
    } catch {
      setError("Failed to remove photo");
    }
  };

  const setMainPhoto = (publicId: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isMain: p.publicId === publicId,
      }))
    );
  };

  const validateStep = async (step: Step): Promise<boolean> => {
    switch (step) {
      case "basics": {
        const title = watch("title");
        const description = watch("description");
        if (!title || title.length < 10) {
          setError("Title must be at least 10 characters");
          return false;
        }
        if (!description || description.length < 50) {
          setError("Description must be at least 50 characters");
          return false;
        }
        setError("");
        return true;
      }
      case "location": {
        const area = watch("area");
        if (!area) {
          setError("Please select an area");
          return false;
        }
        setError("");
        return true;
      }
      case "pricing": {
        const monthlyRent = watch("monthlyRent");
        if (!monthlyRent || monthlyRent < 1000) {
          setError("Monthly rent must be at least KES 1,000");
          return false;
        }
        setError("");
        return true;
      }
      case "features":
        return true;
      case "photos":
        if (photos.length < 3) {
          setError("Please upload at least 3 photos");
          return false;
        }
        setError("");
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (photos.length < 3) {
      setError("Please upload at least 3 photos");
      return;
    }

    // Validate with zod
    const validationResult = createListingSchema.safeParse(data);
    if (!validationResult.success) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validationResult.data,
          photos,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Failed to create listing");
        return;
      }

      const result = await res.json();
      router.push(`/properties/${result.listing.id}`);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
        <p className="mt-2 text-gray-600">
          Fill in the details about your property. All information is required
          for transparency.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() =>
                  index <= currentStepIndex && setCurrentStep(step.id)
                }
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  currentStep === step.id
                    ? "bg-teal-600 text-white"
                    : index < currentStepIndex
                    ? "bg-teal-100 text-teal-700"
                    : "bg-gray-100 text-gray-500"
                )}
                disabled={index > currentStepIndex}
              >
                {index < currentStepIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.icon
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2",
                    index < currentStepIndex ? "bg-teal-600" : "bg-gray-200"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {currentStep === "basics" && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Listing Title"
                placeholder="e.g., Spacious 2BR Apartment in Kilimani"
                error={errors.title?.message}
                {...register("title")}
              />

              <Textarea
                label="Description"
                placeholder="Describe your property in detail. Include features, nearby amenities, and what makes it special..."
                error={errors.description?.message}
                {...register("description")}
                className="min-h-[150px]"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Property Type
                  </label>
                  <Select
                    value={watch("propertyType")}
                    onValueChange={(value) => setValue("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(propertyTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Building Type
                  </label>
                  <Select
                    value={watch("buildingType")}
                    onValueChange={(value) => setValue("buildingType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(buildingTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bedrooms"
                  type="number"
                  min={0}
                  max={10}
                  error={errors.bedrooms?.message}
                  {...register("bedrooms", { valueAsNumber: true })}
                />
                <Input
                  label="Bathrooms"
                  type="number"
                  min={1}
                  max={10}
                  error={errors.bathrooms?.message}
                  {...register("bathrooms", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location */}
        {currentStep === "location" && (
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>Help tenants find your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Area / Neighborhood *
                </label>
                <Select
                  value={watch("area")}
                  onValueChange={(value) => setValue("area", value)}
                >
                  <SelectTrigger error={errors.area?.message}>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {kenyanAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="Estate / Building Name"
                placeholder="e.g., Greatwall Gardens, Phase 2"
                {...register("estate")}
              />

              <Input
                label="Landmark"
                placeholder="e.g., Near Yaya Centre, 5 min walk from the stage"
                {...register("landmark")}
              />

              <Input
                label="Full Address (Optional)"
                placeholder="Plot number, road name"
                {...register("address")}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Distance to CBD (km)"
                  type="number"
                  step="0.1"
                  min={0}
                  placeholder="e.g., 8.5"
                  {...register("distanceToCBD", { valueAsNumber: true })}
                />
                <Input
                  label="Distance to Stage (km)"
                  type="number"
                  step="0.1"
                  min={0}
                  placeholder="e.g., 0.3"
                  {...register("distanceToStage", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pricing */}
        {currentStep === "pricing" && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
              <CardDescription>
                Be transparent about all costs - no surprises!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Monthly Rent (KES) *"
                  type="number"
                  min={1000}
                  placeholder="e.g., 25000"
                  error={errors.monthlyRent?.message}
                  {...register("monthlyRent", { valueAsNumber: true })}
                />
                <Input
                  label="Deposit (KES) *"
                  type="number"
                  min={0}
                  placeholder="e.g., 25000"
                  error={errors.deposit?.message}
                  {...register("deposit", { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Service Charge (KES)"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("serviceCharge", { valueAsNumber: true })}
                />
                <Input
                  label="Water Charge (KES)"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("waterCharge", { valueAsNumber: true })}
                />
                <Input
                  label="Garbage Charge (KES)"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register("garbageCharge", { valueAsNumber: true })}
                />
              </div>

              <div className="rounded-lg bg-teal-50 p-4">
                <p className="text-sm font-medium text-teal-800">
                  Total Move-in Cost:{" "}
                  <span className="text-lg">
                    KES{" "}
                    {(
                      (watch("monthlyRent") || 0) +
                      (watch("deposit") || 0) +
                      (watch("serviceCharge") || 0) +
                      (watch("waterCharge") || 0) +
                      (watch("garbageCharge") || 0)
                    ).toLocaleString()}
                  </span>
                </p>
                <p className="mt-1 text-xs text-teal-600">
                  This is what tenants will see as the total cost to move in
                </p>
              </div>

              <div className="space-y-4">
                <Checkbox
                  label="Daily rent available"
                  checked={watch("dailyRentAvailable")}
                  onCheckedChange={(checked) =>
                    setValue("dailyRentAvailable", !!checked)
                  }
                />
                {watch("dailyRentAvailable") && (
                  <Input
                    label="Daily Rent (KES)"
                    type="number"
                    min={0}
                    placeholder="e.g., 1500"
                    {...register("dailyRent", { valueAsNumber: true })}
                  />
                )}

                <Checkbox
                  label="Weekly rent available"
                  checked={watch("weeklyRentAvailable")}
                  onCheckedChange={(checked) =>
                    setValue("weeklyRentAvailable", !!checked)
                  }
                />
                {watch("weeklyRentAvailable") && (
                  <Input
                    label="Weekly Rent (KES)"
                    type="number"
                    min={0}
                    placeholder="e.g., 8000"
                    {...register("weeklyRent", { valueAsNumber: true })}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Features */}
        {currentStep === "features" && (
          <Card>
            <CardHeader>
              <CardTitle>Property Features</CardTitle>
              <CardDescription>
                Help tenants know what to expect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Water Type
                  </label>
                  <Select
                    value={watch("waterType")}
                    onValueChange={(value) => setValue("waterType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(waterTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Electricity Type
                  </label>
                  <Select
                    value={watch("electricityType")}
                    onValueChange={(value) =>
                      setValue("electricityType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(electricityTypeLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Property Features
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Checkbox
                    label="Parking available"
                    checked={watch("parking")}
                    onCheckedChange={(checked) =>
                      setValue("parking", !!checked)
                    }
                  />
                  <Checkbox
                    label="Pets allowed"
                    checked={watch("petsAllowed")}
                    onCheckedChange={(checked) =>
                      setValue("petsAllowed", !!checked)
                    }
                  />
                  <Checkbox
                    label="Family friendly"
                    checked={watch("familyFriendly")}
                    onCheckedChange={(checked) =>
                      setValue("familyFriendly", !!checked)
                    }
                  />
                  <Checkbox
                    label="Bachelor friendly"
                    checked={watch("bachelorFriendly")}
                    onCheckedChange={(checked) =>
                      setValue("bachelorFriendly", !!checked)
                    }
                  />
                  <Checkbox
                    label="Gated community"
                    checked={watch("gatedCommunity")}
                    onCheckedChange={(checked) =>
                      setValue("gatedCommunity", !!checked)
                    }
                  />
                  <Checkbox
                    label="Furnished"
                    checked={watch("furnished")}
                    onCheckedChange={(checked) =>
                      setValue("furnished", !!checked)
                    }
                  />
                </div>
              </div>

              {watch("parking") && (
                <Input
                  label="Number of Parking Spaces"
                  type="number"
                  min={1}
                  max={10}
                  {...register("parkingSpaces", { valueAsNumber: true })}
                />
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        selectedAmenities.includes(amenity)
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {selectedAmenities.includes(amenity) && (
                        <Check className="mr-1 inline h-3 w-3" />
                      )}
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Photos */}
        {currentStep === "photos" && (
          <Card>
            <CardHeader>
              <CardTitle>Property Photos</CardTitle>
              <CardDescription>
                Upload at least 3 clear photos. Photos will be watermarked with
                date and app name.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload Area */}
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-teal-500 hover:bg-teal-50">
                {uploadingPhoto ? (
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload photos
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, WebP up to 10MB each (Max 10 photos)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  disabled={uploadingPhoto || photos.length >= 10}
                />
              </label>

              {/* Uploaded Photos Grid */}
              {photos.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-gray-600">
                    {photos.length} photo{photos.length !== 1 ? "s" : ""}{" "}
                    uploaded. Click a photo to set as main.
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {photos.map((photo) => (
                      <div
                        key={photo.publicId}
                        className={cn(
                          "group relative aspect-[4/3] overflow-hidden rounded-lg border-2 cursor-pointer",
                          photo.isMain
                            ? "border-teal-600"
                            : "border-transparent"
                        )}
                        onClick={() => setMainPhoto(photo.publicId)}
                      >
                        <img
                          src={photo.url}
                          alt="Property"
                          className="h-full w-full object-cover"
                        />
                        {photo.isMain && (
                          <div className="absolute left-2 top-2 rounded bg-teal-600 px-2 py-0.5 text-xs font-medium text-white">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(photo.publicId);
                          }}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {photos.length < 3 && (
                <p className="text-sm text-amber-600">
                  ⚠️ Please upload at least 3 photos to continue
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
          >
            Previous
          </Button>

          {currentStep === "photos" ? (
            <Button
              type="submit"
              disabled={isSubmitting || photos.length < 3}
              isLoading={isSubmitting}
            >
              Create Listing
            </Button>
          ) : (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}



