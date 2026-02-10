# Quick Style Reference Guide

## 🎨 Using the Design System

### CSS Variables (Available Globally)

Add these to any custom CSS you create:

```css
/* Colors */
var(--color-primary)        /* #6366f1 - Primary brand color */
var(--color-primary-dark)   /* #4f46e5 - Hover states */
var(--color-secondary)      /* #8b5cf6 - Secondary brand */
var(--color-accent)         /* #10b981 - Success/Chat green */

/* Text Colors */
var(--color-text-primary)   /* #0f172a - Main text */
var(--color-text-secondary) /* #475569 - Subtitles */
var(--color-text-tertiary)  /* #64748b - Muted text */

/* Backgrounds */
var(--color-bg-primary)     /* #ffffff - White */
var(--color-bg-secondary)   /* #f8fafb - Page background */
var(--color-bg-tertiary)    /* #f1f5f9 - Lighter shade */

/* Borders */
var(--color-border)         /* #e5e7eb - Standard borders */
var(--color-border-light)   /* #f0f1f3 - Subtle borders */

/* Spacing (use with margin/padding) */
var(--space-xs)   /* 4px */
var(--space-sm)   /* 8px */
var(--space-md)   /* 12px */
var(--space-lg)   /* 16px */
var(--space-xl)   /* 24px */
var(--space-2xl)  /* 32px */

/* Border Radius */
var(--radius-sm)  /* 6px */
var(--radius-md)  /* 8px */
var(--radius-lg)  /* 12px */

/* Shadows */
var(--shadow-sm)  /* Subtle elevation */
var(--shadow-md)  /* Default cards */
var(--shadow-lg)  /* Modals/dialogs */

/* Transitions */
var(--transition-fast)  /* 150ms - Quick feedback */
var(--transition-base)  /* 200ms - Default */
var(--transition-slow)  /* 300ms - Dramatic */
```

### Example Usage

```css
/* Custom button */
.my-button {
  padding: var(--space-md) var(--space-xl);
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.my-button:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Custom card */
.my-card {
  padding: var(--space-xl);
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
```

## 📐 Layout Classes (App.css)

### Responsive Utilities

```css
/* Hide on mobile */
@media (max-width: 640px) {
  .desktop-only { display: none; }
}

/* Show only on mobile */
.mobile-only { display: none; }
@media (max-width: 640px) {
  .mobile-only { display: block; }
}
```

### Empty State

```jsx
<div className="empty-state">
  <div className="empty-state-icon">📭</div>
  <div className="empty-state-title">No articles yet</div>
  <div className="empty-state-description">
    Add your first article to get started
  </div>
</div>
```

### Loading Spinner

```jsx
<div className="loading-spinner"></div>
```

### Screen Reader Only

```jsx
<span className="sr-only">Loading articles...</span>
```

## 🎭 Animation Classes

```jsx
/* Fade in */
<div className="animate-fade-in">Content</div>

/* Slide in from bottom */
<div className="animate-slide-in">Content</div>
```

## 📱 Responsive Breakpoints

### Desktop First Approach

```css
/* Desktop (default) */
.element { width: 100%; }

/* Tablet and below */
@media (max-width: 1024px) {
  .element { width: 80%; }
}

/* Mobile */
@media (max-width: 640px) {
  .element { width: 100%; }
}

/* Extra small mobile (390px iPhone) */
@media (max-width: 420px) {
  .element { font-size: 0.9rem; }
}
```

## 🔘 Button Patterns

### Primary Button (Existing inline style)
```tsx
style={styles.button}
onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.buttonHover)}
onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.button)}
```

### Delete Button (Destructive)
```tsx
style={styles.deleteButton}
```

### Export Button
```tsx
style={styles.exportButton}
```

## 🎨 Color Palette Quick Reference

### Primary Gradient
```css
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
```

### Success/Chat Gradient
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

### Error Gradient
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

### Subtle Background Gradient
```css
background: linear-gradient(135deg, #eff6ff 0%, #f0f4ff 100%);
```

## ✨ Best Practices

### 1. Use Design Tokens
```css
/* ❌ Don't hardcode values */
padding: 24px;
color: #6366f1;

/* ✅ Use design tokens */
padding: var(--space-xl);
color: var(--color-primary);
```

### 2. Consistent Spacing
```css
/* Use the spacing scale */
margin-bottom: var(--space-md);    /* 12px */
margin-bottom: var(--space-xl);    /* 24px */
margin-bottom: var(--space-2xl);   /* 32px */
```

### 3. Accessible Focus States
```css
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 4. Smooth Transitions
```css
.element {
  transition: all var(--transition-base);
}
```

### 5. Proper Touch Targets (Mobile)
```css
/* Minimum 44x44px for touch */
button {
  min-height: 44px;
  min-width: 44px;
}
```

## 🔍 Finding Existing Styles

All inline styles are in the `styles` object in `App.tsx` (starting around line 383):

```tsx
const styles: { [key: string]: React.CSSProperties } = {
  container: { ... },
  header: { ... },
  button: { ... },
  // ... 40+ style definitions
}
```

To use them:
```tsx
<div style={styles.header}>...</div>
<button style={styles.button}>...</button>
```

## 📝 Extending Styles

### Option 1: Merge Styles
```tsx
<div style={{...styles.article, ...styles.articleSelected}}>
```

### Option 2: Conditional Styles
```tsx
<div style={isSelected ? styles.articleSelected : styles.article}>
```

### Option 3: Dynamic Merge
```tsx
<div style={{
  ...styles.button,
  ...(isActive && styles.buttonHover)
}}>
```

## 🎯 Common Patterns

### Card with Shadow
```css
background: var(--color-bg-primary);
border-radius: var(--radius-lg);
padding: var(--space-xl);
box-shadow: var(--shadow-md);
border: 2px solid var(--color-border);
```

### Input with Focus State
```css
padding: var(--space-md) var(--space-lg);
border: 2px solid var(--color-border);
border-radius: var(--radius-md);
transition: all var(--transition-base);

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}
```

### Gradient Button
```css
background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
color: white;
padding: var(--space-md) var(--space-xl);
border-radius: var(--radius-md);
box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
transition: all var(--transition-base);

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
}
```

---

**Pro Tip**: All these CSS variables and utilities are designed to work together. Use them to maintain consistency across any new features you add!
