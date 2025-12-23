/**
 * Data Exports
 * 
 * Central export point for all data files used in the application.
 * This makes imports cleaner and easier to manage.
 */

// Featured properties for homepage
export { featuredProperties } from "./featured-properties";
export type { FeaturedProperty } from "./featured-properties";

// Homepage static content
export { services, stats, whyChooseUs } from "./homepage-constants";
export type { Service, Stat, WhyChooseUsItem } from "./homepage-constants";
