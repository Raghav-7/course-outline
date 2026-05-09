# Mendix Course Content Navigator (CourseOutline)

A specialized, high-performance course navigation widget for Mendix. Designed to build enterprise Learning Management Systems (LMS), this widget provides a fully featured, hierarchical menu system with progress tracking, content typing, and deep nesting.

## Features

- **Deep Hierarchical Navigation**: Group lessons into Modules, Sections, and sub-sections infinitely using a simple path string (e.g., `Module 1/Section A/Lesson`).
- **Content Types & Icons**: Automatically renders specific UI icons based on the content type: `Video`, `Article`, `Quiz`, `Resource`, and `Assignment`.
- **Status Tracking & Locking**: Displays progress indicators (Checkmarks, Progress Dots) and fully supports locking future content (Padlock icon) based on a `Status` attribute.
- **Active State Management**: Accurately tracks the user's current lesson. When the active item changes, the widget automatically expands the correct parent folders and highlights the current item.
- **Accordion Behavior**: Optional "Accordion Sections" mode automatically collapses sibling folders to keep the UI clean.
- **High Performance Virtualization**: Built with React, this widget bypasses the DOM limitations of native Mendix List Views, allowing you to load hundreds of lessons without browser lag.
- **Summary Header**: Displays course statistics like total sections, total lectures, and total course duration.

## Installation

1. Download the latest `.mpk` file from the [Releases](https://github.com/Raghav-7/course-outline/releases) page.
2. Place the `.mpk` file in your Mendix project's `widgets` directory.
3. Open Mendix Studio Pro, press **F4** to synchronize the project directory.
4. You will now find **Course Content Navigator** in your Mendix toolbox.

## Configuration

Place the widget on a page and link it to a data source (List of content items).

### Data Source Attributes
- **Title**: (String) The name of the lesson.
- **Group/Section**: (String) The hierarchy path (e.g. `Module 1/Section 1`).
- **Content Type**: (Enum/String) `Video`, `Article`, `Quiz`, etc.
- **Status**: (Enum/String) `NotStarted`, `InProgress`, `Completed`, `Locked`.
- **Duration**: (String) Text to display next to the item (e.g. "5:00" or "10 min read").
- **Description**: (String) Expandable text underneath the item.
- **Is Previewable**: (Boolean) Shows a "Preview" badge for unauthenticated/unpaid users.
- **Sort Order**: (Integer) Determines display order.

### Events
- **On Item Click**: Triggers a Mendix action when an unlocked item is clicked. (Locked items do not fire this event).

## Technical Scenarios & Challenges Solved

Building this widget required solving several specific challenges to overcome standard Mendix limitations:

1. **Deep Hierarchical Rendering**: Standard Mendix List Views do not support arbitrary nesting depth without significant performance penalties and complex domain models. This widget parses a flat list of objects and reconstructs an optimized tree structure internally, rendering it with React.
2. **State Management Synchronization**: Keeping track of which folders are expanded and coordinating that with the `activeItemId` (which might change externally if a video finishes and auto-advances to the next lesson) required careful React effect dependencies to prevent infinite render loops while ensuring the UI always accurately reflects the user's position.
3. **Smooth Micro-Interactions**: Achieving 60fps animations for expanding descriptions and collapsing accordion sections inside a Mendix page required custom framer-like CSS transitions and dynamic `clientHeight` calculations, rather than relying on standard Mendix conditional visibility which instantly snaps the DOM.

## License
Apache 2.0
