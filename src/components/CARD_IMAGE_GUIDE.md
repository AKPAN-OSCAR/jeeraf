# ZeeRaf CBT - Developer Guide: Replacing Card SVGs with Custom Feature Images

This guide explains how to replace SVG icons on dashboard cards with high-quality, responsive feature images across the ZeeRaf CBT application.

---

## 1. Card Layout & Structure

Each feature card on the main directory page or sub-dashboards follows a consistent card container structure with an image header, title, badge, and call-to-action button.

### Standard JSX Card Template

```tsx
<motion.div
  whileHover={{ y: -6, scale: 1.02 }}
  onClick={handleCardClick}
  className="bg-theme-card border border-theme-border hover:border-amber-500/50 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-4 relative overflow-hidden group"
>
  {/* Custom Feature Card Cover Image Container */}
  <div className="w-full h-24 rounded-2xl overflow-hidden relative group-hover:scale-[1.03] transition-transform shadow-inner border border-amber-500/30 bg-slate-900">
    <img 
      src="YOUR_IMAGE_URL_OR_ASSET_PATH" 
      alt="Feature Card Description" 
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-85"
      referrerPolicy="no-referrer"
    />
    {/* Dark Gradient Overlay for High Contrast Text */}
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
    
    {/* Bottom Glassmorphism Tag */}
    <div className="absolute bottom-2 left-2 px-1">
      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-400/30">
        Tag Name
      </span>
    </div>
  </div>

  {/* Title & Subtitle */}
  <div className="space-y-1">
    <h3 className="text-lg font-black text-theme-text tracking-tight">Card Title</h3>
    <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
      Badge Label
    </span>
  </div>

  {/* CTA Button */}
  <button className="w-full bg-theme-accent text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all">
    <span>Button Label</span>
    <ChevronRight size={14} />
  </button>
</motion.div>
```

---

## 2. Image Specifications & Best Practices

1. **Aspect Ratio / Dimensions**:
   - Container height: `h-24` (96px) or `h-28` (112px).
   - Recommended image resolution: **800x600px** or **1200x800px** (landscape mode).

2. **Image Optimization Parameters**:
   - Use Unsplash or WebP images with auto-formatting and quality flags:
     `?q=80&w=800&auto=format&fit=crop`
   - Always include `referrerPolicy="no-referrer"` to prevent cross-origin referrer restrictions.

3. **Gradient Overlay Layer**:
   - Always place a dark gradient overlay (`bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent`) directly over the image to maintain text legibility across light and dark themes.

4. **Hover Animation**:
   - Set `group-hover:scale-110 transition-transform duration-500` on the `<img>` tag so it expands smoothly when the user hovers over the card.

---

## 3. Current Card Order Reference

The Main Directory Dashboard card sequence is strictly configured as:

1. **Enter CBT** (`https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop`)
2. **ZeeRaf AI** (`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop`)
3. **Library** (`https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop`)
4. **Web Browser** (`https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop`)
5. **Blogs & Updates** (`https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop`)

---

## 4. How to Replace a Card SVG in New Components

To replace an existing SVG with an image:
1. Identify the SVG container `<div>` inside the card.
2. Replace it with the image container wrapper (`<div className="w-full h-24 rounded-2xl overflow-hidden relative ...">`).
3. Add the `<img>` tag with `object-cover`, `referrerPolicy="no-referrer"`, and dark gradient overlay.
4. Save and run `compile_applet` / `lint_applet` to verify compilation.
