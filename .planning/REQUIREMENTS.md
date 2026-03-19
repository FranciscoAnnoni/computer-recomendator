# Requirements: Computer Recomendator

## Functional Requirements

### 1. Guided Discovery Quiz
- **RF1.1:** A multi-step quiz with 3-4 interactive questions.
- **RF1.2:** Questions must include:
    - Usage Profile (e.g., Designing, Programming, Studying).
    - OS Preference (e.g., macOS, Windows, Linux).
    - Budget Range (e.g., Low, Medium, High).
- **RF1.3:** Logic to filter and recommend the most suitable laptops based on quiz responses.

### 2. Product Catalog
- **RF2.1:** List of laptops curated by the influencer.
- **RF2.2:** Each laptop entry must show:
    - High-quality image.
    - Model name.
    - Simplified benefits (e.g., "Very Fast", "Lightweight", "Supports Photoshop").
    - Personal recommendation note.
    - Price (range or exact).
- **RF2.3:** Filtering and sorting capabilities (Price, Brand, Usage).

### 3. Product Comparison Tool
- **RF3.1:** Ability to select at least 2 and up to 3 laptops for side-by-side comparison.
- **RF3.2:** Visual comparison of simplified specs (performance bars, compatibility icons).

### 4. Detail View
- **RF4.1:** Full details of a laptop, including both technical and simplified specs.
- **RF4.2:** Direct link to purchase or view externally.

### 5. Content Management
- **RF5.1:** Admin capability (or simplified data management) to add/edit laptops, specs, and recommendations.

## Non-Functional Requirements

### 1. User Experience & Design
- **RNF1.1:** Mobile-first responsive design.
- **RNF1.2:** Apple Minimalist aesthetic:
    - SF Pro-like typography.
    - Subtle hover/active states.
    - High contrast but soft shadows.
- **RNF1.3:** Minimalist animations (fade-ins, smooth slide transitions).

### 2. Performance & Accessibility
- **RNF2.1:** Fast initial load (especially on mobile).
- **RNF2.2:** High accessibility standards (WCAG 2.1 Level AA).
- **RNF2.3:** Intuitive navigation without technical jargon.

### 3. Maintainability
- **RNF3.1:** Modular codebase to easily add new quiz questions or laptop attributes in the future.
