# LIRA Founders Page - Implementation Guide

## Overview
A fully functional, static Founders page showcasing the team behind the LIRA assistant project. This page is completely independent with no admin panel integration, database, or API connections.

---

## 📁 Files Created

### 1. **Main Page Component**
**Location:** `/app/founders/page.tsx`
- Main Founders page route at `/founders`
- Displays header section with "The Team" title
- Shows grid of 3 founder cards with hardcoded data
- Includes back navigation button
- Fully responsive design

### 2. **Founders Card Component**
**Location:** `/components/founders-card.tsx`
- Reusable card component for individual founders
- Displays circular avatar placeholder with initials
- Shows name, qualification, and location
- Hover animation effects
- Responsive sizing

### 3. **Floating Button Component**
**Location:** `/components/founders-floating-button.tsx`
- Circular button to navigate to Founders page
- Position: Bottom right corner, 70px above bottom
- Shows user icon (Users icon from lucide-react)
- Hover animations (scale, shadow, color changes)
- Integrated into main page

### 4. **Updated Main Page**
**Location:** `/app/page.tsx`
- Added FoundersFloatingButton import
- Positioned above Admin button
- No changes to existing functionality

---

## 🎨 Design Features

### Header Section
- **Title:** "The Team" (center-aligned, large and bold)
- **Subtitle:** "Meet Our Visionary Leaders" (smaller, lighter text)
- **Accent:** Decorative gradient line separator
- **Typography:** Professional academic fonts (Inter, Plus Jakarta Sans)

### Founder Cards
- **Layout:** 
  - Desktop: 3 columns
  - Tablet: 2 columns
  - Mobile: 1 column (stacked)
- **Visual Elements:**
  - Circular avatar placeholder (132x132px)
  - Initials displayed in center
  - Soft shadows with hover lift animation
  - Rounded corners (18px)
  - Color-coded background

### Responsive Breakpoints
```
Mobile (< 768px): 1 card per row
Tablet (768px - 1024px): 2 cards per row
Desktop (> 1024px): 3 cards per row
```

### Color Scheme
- **Light Mode:** Slate-50 to Slate-100 background
- **Dark Mode:** Slate-950 to Slate-900 background
- **Cards:** White (light) / Slate-800 (dark)
- **Text:** Slate-900 (light) / Slate-50 (dark)
- **Accents:** Blue gradients on hover

---

## 📊 Hardcoded Founders Data

```javascript
const founders = [
  {
    id: 1,
    name: "Ramya G P",
    qualification: "BCA, MCA",
    location: "Tumkur",
  },
  {
    id: 2,
    name: "Likhitha D S",
    qualification: "BCA, MCA",
    location: "Kunigal",
  },
  {
    id: 3,
    name: "Ramya S",
    qualification: "BCA, MCA",
    location: "Tumkur",
  },
]
```

**Note:** Data is completely hardcoded with no database connection.

---

## 🔧 How to Customize

### Adding Founder Images
1. Replace placeholder images by updating `/components/founders-card.tsx`
2. Current placeholder shows initials in a gradient circle
3. To add actual images:
   ```tsx
   // Replace the initials div with:
   <Image
     src={`/images/founders/${founder.id}.jpg`}
     alt={founder.name}
     fill
     className="object-cover"
   />
   ```

### Updating Founder Information
Edit the `founders` array in `/app/founders/page.tsx`:
```tsx
const founders = [
  {
    id: 1,
    name: "Name Here",
    qualification: "Qualification",
    location: "City",
  },
  // Add more...
]
```

### Customizing Colors
- Edit Tailwind color classes in component files
- Supports light/dark mode toggle automatically
- Color variables defined in `/app/globals.css`

### Changing Layout
- Grid columns: Edit `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Card spacing: Edit `gap-8 xl:gap-10`
- Card padding: Edit `p-8` class

---

## ✨ Features Implemented

✅ Static page with hardcoded content
✅ No database connection
✅ No API requirements
✅ No admin panel integration
✅ Professional academic design
✅ Fully responsive (mobile, tablet, desktop)
✅ Dark mode support
✅ Hover animations and transitions
✅ Floating navigation button
✅ Back navigation to home
✅ Clean code organization with reusable components
✅ Accessible typography and spacing

---

## 🚀 Usage

### View the Page
Navigate to: `http://localhost:3000/founders`

### From Main Page
1. Click the circular **Users icon** button (bottom right)
2. Or use the floating button that appears 70px above the Admin button

### From Founders Page
1. Click the **back arrow** button (top left)
2. Or navigate manually to home

---

## 📱 Mobile Responsiveness

- **Mobile phones (< 480px):**
  - Single column layout
  - Smaller heading (text-5xl)
  - Adjusted padding

- **Tablets (480px - 1024px):**
  - Two column layout
  - Medium heading
  - Balanced spacing

- **Desktop (> 1024px):**
  - Three column layout
  - Large heading (text-7xl)
  - Extended spacing

---

## 🎯 Navigation Structure

```
Home Page (/)
    ↓
[Click Floating Button with Users Icon]
    ↓
Founders Page (/founders)
    ↓
[Click Back Arrow]
    ↓
Home Page (/)
```

---

## 📝 Important Notes

1. **NOT Connected to Admin Panel:** No database, API, or edit functionality
2. **Static Content:** All data is hardcoded in the component
3. **No Authentication:** Page is publicly accessible
4. **Independent Route:** Works completely standalone
5. **No Backend Logic:** Pure frontend component

---

## 🔄 Future Enhancements (Optional)

- Replace initials with actual founder photos
- Add founder bios or descriptions
- Add social media links
- Add email or contact information
- Animate page scroll entrance
- Add founder achievements/accomplishments
- Create a carousel for founders on narrow screens

---

## 🛠️ Technical Stack

- **Framework:** Next.js 13+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Language:** TypeScript/TSX
- **Font:** Inter, Plus Jakarta Sans (Google Fonts)

---

## ✅ Quality Assurance

- [x] Professional design
- [x] Responsive across all devices
- [x] Dark mode compatible
- [x] Accessible navigation
- [x] Clean code structure
- [x] No console errors
- [x] Performance optimized
- [x] Fully functional routes

---

## 📞 Maintenance Checklist

- [ ] Update founder images when available
- [ ] Add more team members if needed
- [ ] Review text spacing on new devices
- [ ] Test dark mode rendering
- [ ] Verify responsive behavior

---

**Created:** February 18, 2026
**Status:** ✅ Production Ready
**Last Updated:** February 18, 2026
