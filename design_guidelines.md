# AI Agent Builder Platform - Design Guidelines

## Design Approach
**System-Based Approach** drawing from modern development tools: VS Code (code editing patterns), Linear (clean functionality), Notion (content organization), and Vercel (SaaS dashboard patterns). This utility-focused platform prioritizes efficiency, clarity, and professional polish.

## Core Design Principles
- **Developer-First Interface**: Clean, distraction-free workspace optimized for configuration and testing
- **Information Hierarchy**: Clear visual separation between navigation, content, and action areas
- **Contextual Clarity**: Every interface element has an obvious purpose and placement

## Typography System

**Font Families:**
- Primary: Inter (via Google Fonts) - UI elements, body text
- Monospace: JetBrains Mono (via Google Fonts) - code, JSON configurations

**Type Scale:**
- Headings: text-2xl (dashboard titles), text-xl (section headers), text-lg (subsections)
- Body: text-base (primary content), text-sm (secondary info, labels)
- Code/Technical: text-sm font-mono (code blocks, JSON)
- Micro: text-xs (timestamps, metadata, helper text)

**Weights:** font-medium (headings), font-normal (body), font-semibold (emphasis)

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: gap-2, p-2 (compact lists, tags)
- Standard spacing: gap-4, p-4 (cards, sections)
- Comfortable spacing: gap-6, p-6 (main content areas)
- Generous spacing: gap-8, p-8, py-12, py-16 (major sections)

**Grid Structure:**
- Main Layout: Sidebar (w-64) + Main Content (flex-1)
- Dashboard: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (metrics cards)
- Configuration Panels: max-w-4xl (optimal form width)
- Full-width Editors: w-full with contained inner content

## Component Library

### Navigation
**Sidebar Navigation:**
- Fixed left sidebar (w-64, h-screen)
- Logo/branding at top (p-6)
- Navigation items with icons (Heroicons) + labels (py-3 px-4)
- Active state indicator (border or background treatment)
- Section dividers for logical grouping
- User profile/settings at bottom

**Top Bar:**
- Agent name/context display (left)
- Action buttons (middle): Save, Test, Deploy
- User menu + theme toggle (right)
- h-16 consistent height

### Configuration Builder
**System Prompt Editor:**
- Full-height Monaco Editor integration
- Toolbar above editor: Format, Templates, AI Assist buttons (h-12)
- Line numbers, syntax highlighting visible
- Split view option for comparing prompts

**Role & Settings Panel:**
- Tabbed interface (Tabs: Basic, Advanced, Capabilities)
- Form fields with clear labels above inputs
- Input groups with related fields (gap-4)
- Help tooltips (icon + hover) for complex settings

### Tool Registry
**Tool List View:**
- Table or card grid layout
- Each tool card: Icon + Name + Description + Edit/Delete actions
- "Add New Tool" prominent button (top-right)
- Search/filter bar (top)

**Tool Builder Modal:**
- Large modal (max-w-3xl) with sections
- Tool Info: Name, Description (gap-6 between fields)
- Parameters Builder: Add/remove parameter rows dynamically
- Code Implementation: Monaco editor for function code
- Test Console: Input/output preview area

### Chat Playground
**Split Layout:**
- Left Panel (w-80): Conversation settings, model selector, temperature controls
- Center: Chat interface with messages
- Right Panel (w-80, collapsible): Debug view showing tool calls, tokens, timing

**Chat Interface:**
- Messages container (flex-1, overflow-y-auto)
- User messages: right-aligned, max-w-2xl
- AI messages: left-aligned, max-w-2xl
- Tool calls: Special card format showing function name + parameters
- Input area: Fixed bottom, textarea + send button, h-24

### Template Library
**Grid Layout:**
- grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Template cards (p-6, rounded-lg)
- Template icon/avatar at top
- Title (text-lg font-semibold)
- Description (text-sm, 2-3 lines)
- Tags for capabilities (flex flex-wrap gap-2)
- "Use Template" button at bottom

### Analytics Dashboard
**Metrics Overview:**
- 4-column grid for key metrics (Total Conversations, Tokens Used, Avg Response Time, Success Rate)
- Metric cards: Large number (text-3xl), label (text-sm), trend indicator

**Charts Section:**
- Usage over time: Line chart (h-80)
- Tool usage distribution: Bar chart (h-64)
- Error rate: Small trend sparkline

**Conversation Table:**
- Sortable columns: Timestamp, Agent, Messages, Tokens, Duration
- Row actions: View, Export, Delete
- Pagination controls at bottom

### Documentation Hub
**Layout:**
- Sidebar navigation (w-64): Nested topics tree
- Main content area (max-w-4xl): Article content
- Right TOC (w-48, sticky): On-page navigation

**Content Formatting:**
- Article headers with clear hierarchy
- Code blocks with syntax highlighting (Monaco-style)
- Callout boxes for tips/warnings (p-4, rounded)
- Inline code with backticks styling
- Step numbers for tutorials

## Form Elements
**Inputs:**
- Standard height: h-10
- Padding: px-4
- Labels: mb-2, text-sm font-medium
- Required indicator: asterisk
- Error messages: text-sm, mt-1

**Buttons:**
- Primary: px-4 py-2, rounded-md
- Secondary: Similar sizing, different treatment
- Icon buttons: Square (h-10 w-10)
- Button groups: flex gap-2

**Dropdowns/Selects:**
- Match input height (h-10)
- Custom styling for consistency
- Icons for expand/collapse

## Icons
**Library:** Heroicons (outline for most UI, solid for emphasis)
- Navigation: 20px icons
- Buttons: 16px icons
- Cards/Lists: 20-24px feature icons
- Inline: 16px icons

## Modal/Overlay Patterns
**Modals:**
- Centered, max-w-2xl (standard), max-w-4xl (large), max-w-6xl (editor modals)
- Header: Title + close button (p-6, border-b)
- Content: p-6
- Footer: Actions right-aligned (p-6, border-t)

**Dropdowns:**
- Attached to trigger element
- Shadow for depth
- Max height with scroll (max-h-96)

## Responsive Behavior
- Mobile: Collapse sidebar to hamburger menu
- Tablet: Maintain sidebar, stack some grid layouts
- Desktop: Full multi-column layouts
- Chat playground: Stack panels vertically on mobile

## Special Considerations
- **Code Editor Integration:** Monaco Editor embedded with full syntax highlighting, auto-complete visible
- **Theme Toggle:** Seamless light/dark mode switch (respect system preference as default)
- **Loading States:** Skeleton screens for data-heavy views, spinners for actions
- **Empty States:** Helpful illustrations + CTA for empty lists/dashboards
- **Keyboard Shortcuts:** Visible hints for power users (⌘K for command palette, etc.)