# JeeRaf SVG Integration & Deployment Guide

This guide explains how your authentic **JeeRaf** vector SVG assets are linked throughout the application, and the exact steps to drop your original files into VS Code.

---

## 1. Linked Architecture Overview

Every component in the application is pre-wired to reference the dedicated master SVG files located in the `public/` directory:

| File Path in Project | Asset Purpose | Where It Appears in the App |
| :--- | :--- | :--- |
| `public/jeeraf-with-name.svg` | **JeeRaf Logo WITH NAME** | • **Full-Screen Loading Splash** (`App.tsx`)<br>• **Welcome / Login Screen** (`Welcome.tsx`)<br>• OpenGraph social cards |
| `public/jeeraf-no-name.svg` | **JeeRaf Emblem (NO NAME)** | • **All AI Avatars** (`AIAvatar.tsx`)<br>• **Central Gold Spinner** (`GoldSpinner`)<br>• **JeeRaf AI Copilot Cards** (`MainDirectoryDashboard.tsx`)<br>• **Top Navigation & Sidebar Branding**<br>• **CBT Solution Modal Headers** |
| `public/jeeraf-with-name-white.svg` | **White SVG Variant (WITH NAME)** | • Active during the **White 24-Hour Favicon Cycle** in browser tab URL link |
| `public/jeeraf-with-name-black.svg` | **Black SVG Variant (WITH NAME)** | • Active during the **Black 24-Hour Favicon Cycle** in browser tab URL link |

---

## 2. Steps to Replace the SVGs in VS Code

You can update the files in VS Code using either of these two methods:

### Method A: Direct File Drag & Drop (Easiest)
1. Open your project root folder in **VS Code**.
2. Locate the `public/` directory in the VS Code file explorer.
3. Drag your **`jeeraf_withname_clean_master.svg`** file into `public/` and rename it to:
   ```bash
   jeeraf-with-name.svg
   ```
4. Drag your **`jeeraf_noname_clean_master.svg`** file into `public/` and rename it to:
   ```bash
   jeeraf-no-name.svg
   ```
5. *(Optional for 24h Favicon)* If you have dedicated white and black SVGs, drop them into `public/` as:
   ```bash
   jeeraf-with-name-white.svg
   jeeraf-with-name-black.svg
   ```
   *(If you only have one version, you can duplicate `jeeraf-with-name.svg` to these two filenames).*

---

### Method B: Copy & Paste SVG Code in VS Code
1. Open your original `jeeraf_withname_clean_master.svg` on your computer in VS Code.
2. Press `Ctrl + A` (or `Cmd + A`) and `Ctrl + C` (or `Cmd + C`) to copy all the SVG text.
3. Open `public/jeeraf-with-name.svg` in VS Code, select all, and paste (`Ctrl + V`). Save the file (`Ctrl + S`).
4. Repeat the same for `jeeraf_noname_clean_master.svg` into `public/jeeraf-no-name.svg`.

---

## 3. How Resizing & Scaling Works (No Distortion)

You do **not** need to resize your SVGs before uploading. All scaling is handled automatically by the app:

- **SVG Vector Preservation:** Your SVG's intrinsic `viewBox="0 0 ..."` ensures that vector paths never pixelate or lose resolution.
- **Aspect Ratio Protection:** All `<img>` tags throughout the codebase use Tailwind's `object-contain` utility:
  ```tsx
  className="w-full h-full object-contain select-none pointer-events-none"
  ```
- **Container Sizing:**
  - **Full-Screen Loading Splash:** Sized dynamically to fill up to `75vh` (`max-h-[75vh] w-auto h-auto`) centered on an obsidian backdrop.
  - **Welcome Banner:** Sized cleanly at `36x36` (mobile) to `44x44` (desktop).
  - **AI Avatars:** Sized consistently across sizes `xs` (24px), `sm` (32px), `md` (40px), `lg` (56px), and `xl` (80px).
  - **Spinners & Modals:** Fitted with circular spinning borders with inner padding so the giraffe emblem rotates smoothly inside.

---

## 4. Dynamic 24-Hour Favicon Engine (`src/services/faviconTheme.ts`)

The application features a synchronized 24-hour cycle that manages the browser tab favicon in the URL link:

$$\text{Cycle Index} = \left\lfloor \frac{\text{Date.now()}}{86,400,000 \text{ ms}} \right\rfloor$$

- **Even Days:** Dynamically applies `/jeeraf-with-name-white.svg` to `<link rel="icon" type="image/svg+xml">`.
- **Odd Days:** Dynamically applies `/jeeraf-with-name-black.svg` to `<link rel="icon" type="image/svg+xml">`.
- An active timer checks periodically in the background to handle the midnight rollover seamlessly without needing a page refresh.

---

## 5. Privacy & File Cleanup

In accordance with your privacy instructions:
- All previously generated files, potrace bitmap traces, temporary `.pbm` files, and test files have been permanently deleted from the codebase (`public/`, `dist/`, and root).
- The project only retains the clean, standard placeholder SVG files ready to receive your master vector files in VS Code.
