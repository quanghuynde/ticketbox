# TicketBox - Mua vé hòa nhạc, hội thảo, thể thao, phim, kịch và voucher

## Mission
Create implementation-ready, token-driven UI guidance for TicketBox that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: TicketBox
- URL: https://ticketbox.vn/
- Audience: Online shoppers and event-goers
- Product surface: E-commerce storefront for event tickets

## Style Foundations
- Visual style: Clean, functional, implementation-oriented
- Main font style: `font.family.primary=Inter`, `font.family.stack=Inter, sans-serif`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=16.1px`
- Typography scale: `font.size.xs=0px`, `font.size.sm=12px`, `font.size.md=14px`
- Color palette: `color.text.primary=#2a2d34`, `color.text.secondary=#aaaaaa`, `color.text.tertiary=#999999`, `color.surface.base=#000000`, `color.surface.muted=#ffffff`, `color.surface.raised=#2dc275`, `color.surface.strong=#27272a`
- Spacing scale: `space.1=1px`, `space.2=2px`, `space.3=5px`, `space.4=8px`, `space.5=9.6px`, `space.6=16px`, `space.7=35.2px`
- Radius/shadow/motion tokens: `radius.xs=4px`, `radius.sm=10px`, `radius.md=32px`, `radius.lg=50px` | `motion.duration.instant=200ms`, `motion.duration.fast=300ms`, `motion.duration.normal=400ms`

## UI Components & Data Models (Based on Analysis)

### 1. Event Explorer
Responsible for displaying events filtered by category.
- **Data Source**: `events.json`, `categories.json`
- **Anatomy**: Event Card, Category Filter, Search Bar.
- **States**: Default, Hover (Zoom image), Loading (Skeleton), Empty.

### 2. Ticket Selection
Allows users to choose ticket types for a specific event.
- **Data Source**: `tickets.json`
- **Variants**: VIP, Standard, Student.
- **Interactions**: Quantity increment/decrement, Add to cart.

### 3. Checkout Flow
Handles order creation and payment processing.
- **Data Source**: `orders.json`, `orderDetails.json`, `payments.json`
- **Components**: Order Summary, Payment Method Selection (SePay, MoMo), Confirmation.

### 4. User Notifications
Real-time feedback for transaction status.
- **Data Source**: `notifications.json`
- **Types**: `payment_success`, `payment_pending`.

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Guidelines & QA Checklist
- [ ] Verify event status handling (`upcoming`, `completed`).
- [ ] Ensure ticket availability validation (`quantity` vs `soldQuantity`).
- [ ] Validate payment status flow (`pending` -> `success`).
- [ ] Check responsive behavior for mobile ticket scanning.

---
*Generated based on TicketBox JSON Data Models.*
