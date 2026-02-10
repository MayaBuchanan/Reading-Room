# 🎨 Tailwind CSS Quick Reference

## Component Classes (from index.css)

### Gradients
```html
<div class="gradient-primary">Purple gradient</div>
<div class="gradient-accent">Green gradient</div>
<div class="gradient-error">Red gradient</div>
```

### Buttons
```html
<button class="btn-primary">Primary Action</button>
<button class="btn-accent">Accent Action</button>
<button class="btn-error">Delete/Remove</button>
```

### Form Elements
```html
<input class="input-field" placeholder="Enter text" />
<textarea class="input-field" rows="3"></textarea>
```

### Layout Components
```html
<div class="card">Content card with padding and border</div>
<div class="empty-state">Empty state with centered content</div>
<span class="loading-spinner"></span>
```

---

## Custom Theme Colors

### Primary (Indigo)
- `bg-primary` / `text-primary` → #6366f1
- `bg-primary-dark` / `text-primary-dark` → #4f46e5
- `bg-primary-light` / `text-primary-light` → #818cf8

### Secondary (Purple)
- `bg-secondary` / `text-secondary` → #8b5cf6
- `bg-secondary-dark` / `text-secondary-dark` → #7c3aed
- `bg-secondary-light` / `text-secondary-light` → #a78bfa

### Accent (Green)
- `bg-accent` / `text-accent` → #10b981
- `bg-accent-dark` / `text-accent-dark` → #059669
- `bg-accent-light` / `text-accent-light` → #34d399

### Usage Example
```html
<div class="bg-primary text-white">Primary background</div>
<button class="bg-accent hover:bg-accent-dark">Accent button</button>
```

---

## Custom Shadows

```html
<div class="shadow-primary">Primary shadow (indigo tint)</div>
<div class="shadow-primary-hover">Hover state shadow</div>
<div class="shadow-accent">Accent shadow (green tint)</div>
<div class="shadow-card">Subtle card shadow</div>
```

---

## Common Patterns

### Card with Hover Effect
```html
<div class="card hover:shadow-primary hover:-translate-y-0.5 transition-all duration-200">
  Content
</div>
```

### Button with Gradient
```html
<button class="gradient-primary text-white px-6 py-3 rounded-lg font-bold 
               hover:-translate-y-0.5 hover:shadow-primary-hover 
               transition-all duration-200">
  Click Me
</button>
```

### Conditional Classes (React)
```tsx
<button className={`btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
  Submit
</button>

<div className={`p-4 rounded-lg ${isActive ? 'bg-primary text-white' : 'bg-gray-100'}`}>
  Content
</div>
```

### Responsive Layout
```html
<!-- Mobile-first approach -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Column 1</div>
  <div class="flex-1">Column 2</div>
</div>
```

### Focus States (Accessibility)
```html
<button class="focus:outline-2 focus:outline-primary focus:outline-offset-2">
  Accessible Button
</button>
```

---

## Breakpoints

```css
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Small desktops */
xl:  1280px  /* Large desktops */
2xl: 1536px  /* Extra large screens */
```

### Usage
```html
<div class="text-base lg:text-lg xl:text-xl">
  Responsive text sizing
</div>

<div class="hidden lg:block">
  Visible only on large screens
</div>
```

---

## Utility Cheatsheet

### Spacing
```
p-4   → padding: 1rem (16px)
px-6  → padding-left/right: 1.5rem (24px)
py-3  → padding-top/bottom: 0.75rem (12px)
m-2   → margin: 0.5rem (8px)
gap-4 → gap: 1rem (16px)
```

### Typography
```
text-sm     → font-size: 0.875rem (14px)
text-base   → font-size: 1rem (16px)
text-lg     → font-size: 1.125rem (18px)
font-bold   → font-weight: 700
font-medium → font-weight: 500
tracking-wide → letter-spacing: 0.025em
```

### Colors
```
bg-white       → background: #ffffff
bg-gray-50     → background: #f9fafb
bg-slate-900   → background: #0f172a
text-slate-600 → color: #475569
```

### Borders
```
border          → border-width: 1px
border-2        → border-width: 2px
border-gray-200 → border-color: #e5e7eb
rounded-lg      → border-radius: 0.5rem (8px)
rounded-full    → border-radius: 9999px
```

### Flexbox
```
flex           → display: flex
flex-col       → flex-direction: column
items-center   → align-items: center
justify-between → justify-content: space-between
gap-4          → gap: 1rem
flex-1         → flex: 1 1 0%
```

### Transitions
```
transition-all    → transition-property: all
duration-200      → transition-duration: 200ms
hover:shadow-lg   → Apply on hover
hover:translate-y-0.5 → Transform on hover
```

---

## VS Code Extensions

Recommended for best Tailwind experience:

1. **Tailwind CSS IntelliSense**
   - Autocomplete for class names
   - Hover preview of CSS values
   - Linting and validation

2. **PostCSS Language Support**
   - Syntax highlighting for PostCSS
   - Recognizes @apply, @tailwind directives

---

## Tips & Best Practices

1. **Use component classes for repeated patterns**
   - Define in `@layer components` in index.css
   - Example: `.btn-primary`, `.input-field`

2. **Keep utility classes together**
   ```html
   <!-- Group by category: layout, spacing, colors, typography, effects -->
   <div class="flex items-center gap-4 px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg">
   ```

3. **Use @apply sparingly**
   - Prefer utility classes in HTML
   - Use @apply for truly reusable components
   - Avoid @apply for one-off styles

4. **Leverage variants**
   ```html
   <!-- State variants -->
   <button class="bg-primary hover:bg-primary-dark active:scale-95 disabled:opacity-50">
   
   <!-- Responsive variants -->
   <div class="text-sm md:text-base lg:text-lg">
   ```

5. **Use arbitrary values when needed**
   ```html
   <div class="w-[220px]">Exact width</div>
   <div class="shadow-[0_4px_12px_rgba(99,102,241,0.2)]">Custom shadow</div>
   ```

---

## Common Issues & Solutions

### Issue: Classes not applying
**Solution:** Check that Tailwind directives are in `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Issue: Custom colors not working
**Solution:** Verify `tailwind.config.js` has correct `theme.extend.colors` and restart dev server

### Issue: Purge removing needed classes
**Solution:** Check `content` paths in `tailwind.config.js`:
```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

### Issue: @apply not recognized
**Solution:** Ensure PostCSS is configured in `postcss.config.js`

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind Play (Online Playground)](https://play.tailwindcss.com/)
