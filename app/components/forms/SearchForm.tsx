// Search Form component for VerifiedNyumba homepage
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { areasByCounty, kenyanAreas, kenyanCounties } from "@/app/lib/validations/listing";
import { propertyTypeLabels, buildingTypeLabels } from "@/app/lib/utils";

export function SearchForm() {
  const router = useRouter();
  const [buildingType, setBuildingType] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [county, setCounty] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [propertyType, setPropertyType] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (buildingType) params.set("buildingType", buildingType);
    if (category) params.set("category", category);
    if (county) params.set("county", county);
    if (location) params.set("area", location);
    if (propertyType) params.set("propertyType", propertyType);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-lg md:flex-row md:items-end md:gap-4 md:p-5"
    >
      {/* Building Type */}
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium text-teal-600">
          Building Type
        </label>
        <Select value={buildingType} onValueChange={setBuildingType}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(buildingTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category (Buy/Rent) - For now we only support Rent */}
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium text-teal-600">
          Category
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rent">Rent</SelectItem>
            <SelectItem value="buy" disabled>
              Buy (Coming soon)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* County */}
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium text-teal-600">
          County
        </label>
        <Select value={county} onValueChange={(value) => { setCounty(value); setLocation(""); }}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select county" />
          </SelectTrigger>
          <SelectContent>
            {kenyanCounties.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium text-teal-600">Locality</label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="bg-white"><SelectValue placeholder="Select area" /></SelectTrigger>
          <SelectContent>
            {(county ? [...(areasByCounty[county as keyof typeof areasByCounty] ?? [])] : kenyanAreas).map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type / Style */}
      <div className="flex-1">
        <label className="mb-1.5 block text-xs font-medium text-teal-600">
          Style
        </label>
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(propertyTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Button */}
      <Button type="submit" className="h-10 gap-2 md:px-8">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  );
}



