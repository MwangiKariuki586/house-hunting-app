---
description: Color scheme and styling guidelines for VerifiedNyumba
---

# Color Scheme Guidelines

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary Green** | `#1B4D3E` | Buttons, icons, text accents, small UI elements |
| **Accent Gold** | `#D4A373` | Labels, badges, decorative accents, hover states |
| **Light Gray** | `#F9FAFB` | Section backgrounds, cards |
| **White** | `#FFFFFF` | Page backgrounds, cards, content areas |

## Section Backgrounds - IMPORTANT

**DO NOT use the primary green (`#1B4D3E`) as a section background color.**

### Allowed Section Backgrounds:
- `bg-white` - Default for most sections
- `bg-[#F9FAFB]` - Alternating sections for visual separation
- Hero sections with images: Use image with dark overlay (`bg-black/70`)

### Exceptions (use sparingly):
- Stats bars (small horizontal strips, max 80px height)
- The For Landlords page hero uses an image overlay, not solid color

## Text Colors

| Context | Color |
|---------|-------|
| Headings | `text-gray-900` |
| Body text | `text-gray-600` |
| Muted/secondary | `text-gray-500` |
| Labels/badges | `text-[#D4A373]` (gold) or `text-[#1B4D3E]` (green) |
| On dark backgrounds | `text-white`, `text-gray-200`, `text-gray-300` |

## Button Variants

| Button | Usage |
|--------|-------|
| **Default** (green) | Primary actions |
| **Accent** (gold) | Hero CTAs on dark backgrounds |
| **Outline** | Secondary actions |
| **Ghost** | Tertiary/navigation actions |

## Card Styling

```
rounded-2xl or rounded-3xl
border border-gray-200
bg-white or bg-[#F9FAFB]
p-8 or p-6
```

## Icon Accent Colors

- Use `text-[#1B4D3E]` for icons in tenant-focused content
- Use `text-[#D4A373]` for icons in landlord-focused content
- Icon backgrounds: `bg-[#1B4D3E]/10` or `bg-[#D4A373]/10`

## Visual Hierarchy

1. **Hero sections**: Image with overlay OR white with centered text
2. **Content sections**: Alternate between `bg-white` and `bg-[#F9FAFB]`
3. **CTA sections**: Light gray card (`bg-[#F9FAFB]`) with border inside white section
4. **Footer**: Can use dark background if needed

## Examples

### Good ✓
```tsx
<section className="py-20 bg-white">
<section className="py-20 bg-[#F9FAFB]">
<div className="rounded-3xl border border-gray-200 bg-[#F9FAFB] p-12">
```

### Bad ✗
```tsx
<section className="py-20 bg-[#1B4D3E]">  // Don't use primary as section bg
<section className="py-20 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F]">  // Avoid
```
